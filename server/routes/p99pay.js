/**
 * P99PAY Payment Routes
 *
 * Handles all P99PAY payment gateway endpoints:
 * - Order creation
 * - Return URL callback
 * - Server-to-server notifications
 * - Order status queries
 * - Settlement
 */

import express from 'express';
import { P99PayClient, generateOrderId, PAY_STATUS, RETRY_RCODES, PAID_TYPES } from '../utils/p99pay.js';

const router = express.Router();

// Initialize P99Pay client
const p99Client = new P99PayClient();

// Exchange rate: 1 USD = 100 Gold
const USD_TO_GOLD_RATE = 100;

/**
 * Helper function to get database instance
 * Will be injected when mounting router
 */
let db;
export function setDatabase(database) {
    db = database;
}

/**
 * 1. Create P99PAY Order
 * POST /api/payment/p99/order
 */
router.post('/order', (req, res) => {
    const { userId, amountUSD, paymentMethod, productName } = req.body;

    if (!userId || !amountUSD || amountUSD <= 0) {
        return res.status(400).json({ success: false, error: 'Invalid parameters' });
    }

    // Verify user exists
    db.get('SELECT id, name FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const orderId = generateOrderId();
        const goldAmount = Math.floor(amountUSD * USD_TO_GOLD_RATE);
        const paid = paymentMethod || ''; // Empty = let user choose

        // Build P99 order request
        const orderRequest = p99Client.buildOrderRequest({
            coid: orderId,
            amount: amountUSD,
            paid: paid,
            userAcctId: userId,
            productName: productName || `GameZoe Gold x${goldAmount}`,
            productId: `GOLD_${goldAmount}`,
            memo: `User ${userId} topup ${amountUSD} USD`
        });

        // Save order to database
        db.run(
            `INSERT INTO p99_orders (order_id, user_id, amount_usd, gold_amount, paid, status, raw_request, created_at)
             VALUES (?, ?, ?, ?, ?, 'pending', ?, datetime('now', '+8 hours'))`,
            [orderId, userId, amountUSD, goldAmount, paid, JSON.stringify(orderRequest.jsonData)],
            function(err) {
                if (err) {
                    console.error('[P99Pay] Failed to save order:', err.message);
                    return res.status(500).json({ success: false, error: 'Failed to create order' });
                }

                console.log(`[P99Pay] Order created: ${orderId} for user ${userId}, ${amountUSD} USD = ${goldAmount} Gold`);

                res.json({
                    success: true,
                    orderId: orderId,
                    amountUSD: amountUSD,
                    goldAmount: goldAmount,
                    apiUrl: p99Client.config.apiUrl,
                    formData: orderRequest.base64Data
                });
            }
        );
    });
});

/**
 * 2. P99PAY Return URL (User redirect after payment)
 * POST /api/payment/p99/return
 */
router.post('/return', express.urlencoded({ extended: true }), (req, res) => {
    let data = req.body.data || req.body.DATA;

    if (!data) {
        console.error('[P99Pay Return] No data received');
        return res.redirect('/?error=no_data');
    }

    const response = p99Client.parseResponse(data);
    if (!response) {
        console.error('[P99Pay Return] Failed to parse response');
        return res.redirect('/?error=parse_failed');
    }

    console.log('[P99Pay Return] Response:', JSON.stringify(response));

    const orderId = response.COID;
    const payStatus = response.PAY_STATUS;
    const rcode = response.RCODE;
    const rrn = response.RRN;

    // Verify ERPC
    const erpcValid = p99Client.verifyERPC(response);
    console.log(`[P99Pay Return] Order ${orderId}: PAY_STATUS=${payStatus}, RCODE=${rcode}, ERPC valid=${erpcValid}`);

    // Update order in database
    db.run(
        `UPDATE p99_orders SET
            rrn = ?, pay_status = ?, rcode = ?, erpc_verified = ?,
            status = ?, raw_response = ?, updated_at = datetime('now', '+8 hours')
         WHERE order_id = ?`,
        [
            rrn,
            payStatus,
            rcode,
            erpcValid ? 1 : 0,
            payStatus === 'S' ? 'success' : (payStatus === 'F' ? 'failed' : 'pending'),
            JSON.stringify(response),
            orderId
        ],
        (err) => {
            if (err) console.error('[P99Pay Return] DB update failed:', err.message);
        }
    );

    // Process successful payment
    if (payStatus === 'S' && rcode === '0000' && erpcValid) {
        // Get order details and add gold
        db.get('SELECT * FROM p99_orders WHERE order_id = ?', [orderId], (err, order) => {
            if (err || !order) {
                return res.redirect(`/?error=order_not_found&orderId=${orderId}`);
            }

            // Check if gold already credited (prevent duplicate)
            db.get('SELECT id FROM wallet_transactions WHERE order_id = ?', [orderId], (err, existingTx) => {
                if (existingTx) {
                    console.log(`[P99Pay Return] Order ${orderId} already credited, skipping...`);
                    res.redirect(`/?success=true&orderId=${orderId}&amount=${order.gold_amount}`);
                    return;
                }

                // Add gold to user (only if not already credited)
                if (order.status !== 'settled') {
                    db.serialize(() => {
                        db.run('BEGIN TRANSACTION');

                        // Add gold
                        db.run('UPDATE users SET gold_balance = gold_balance + ? WHERE id = ?',
                            [order.gold_amount, order.user_id]);

                        // Log transaction
                        db.run(
                            `INSERT OR IGNORE INTO wallet_transactions (order_id, user_id, amount, currency, type, description, status, created_at)
                             VALUES (?, ?, ?, 'gold', 'deposit', ?, 'completed', datetime('now', '+8 hours'))`,
                            [orderId, order.user_id, order.gold_amount, `P99PAY topup ${order.amount_usd} USD`]
                        );

                        db.run('COMMIT', () => {
                            console.log(`[P99Pay Return] Gold credited: ${order.gold_amount} to user ${order.user_id}`);

                            // Check if this is a service order and fulfill it
                            fulfillServiceOrder(orderId, (err, serviceOrder) => {
                                if (serviceOrder) {
                                    console.log(`[P99Pay Return] Service order fulfilled: ${serviceOrder.order_id}`);
                                }
                            });

                            // Auto-settle the order
                            settleP99Order(orderId);
                        });
                    });
                }

                // Check for service order return URL
                db.get('SELECT return_url, order_id FROM service_orders WHERE p99_order_id = ?', [orderId], (err, svcOrder) => {
                    if (svcOrder && svcOrder.return_url) {
                        // Redirect to service-specific return URL with both order IDs
                        const returnUrl = new URL(svcOrder.return_url, `${req.protocol}://${req.get('host')}`);
                        returnUrl.searchParams.set('success', 'true');
                        returnUrl.searchParams.set('serviceOrderId', svcOrder.order_id);
                        returnUrl.searchParams.set('p99OrderId', orderId);
                        returnUrl.searchParams.set('amount', order.gold_amount);
                        res.redirect(returnUrl.toString());
                    } else {
                        res.redirect(`/?success=true&orderId=${orderId}&amount=${order.gold_amount}`);
                    }
                });
            });
        });
    } else if (payStatus === 'W') {
        // Waiting - need to check order later
        res.redirect(`/?pending=true&orderId=${orderId}`);
    } else {
        // Failed - use PAY_RCODE (more specific) or RCODE, and include RMSG_CHI if available
        const payRcode = response.PAY_RCODE || rcode;
        const errorMsg = response.RMSG_CHI ? encodeURIComponent(response.RMSG_CHI) : '';
        res.redirect(`/?error=payment_failed&orderId=${orderId}&rcode=${payRcode}&msg=${errorMsg}`);
    }
});

/**
 * 3. P99PAY Server Notify (Server-to-Server callback)
 * POST /api/payment/p99/notify
 */
router.post('/notify', express.urlencoded({ extended: true }), (req, res) => {
    let data = req.body.data || req.body.DATA;

    if (!data) {
        console.error('[P99Pay Notify] No data received');
        return res.status(400).send('ERROR');
    }

    const response = p99Client.parseResponse(data);
    if (!response) {
        console.error('[P99Pay Notify] Failed to parse response');
        return res.status(400).send('ERROR');
    }

    console.log('[P99Pay Notify] Response:', JSON.stringify(response));

    const orderId = response.COID;
    const payStatus = response.PAY_STATUS;
    const rcode = response.RCODE;
    const rrn = response.RRN;

    // Verify ERPC
    const erpcValid = p99Client.verifyERPC(response);

    // Update order
    db.run(
        `UPDATE p99_orders SET
            rrn = ?, pay_status = ?, rcode = ?, erpc_verified = ?,
            status = ?, notify_count = notify_count + 1,
            raw_response = ?, updated_at = datetime('now', '+8 hours')
         WHERE order_id = ?`,
        [
            rrn,
            payStatus,
            rcode,
            erpcValid ? 1 : 0,
            payStatus === 'S' ? 'success' : (payStatus === 'F' ? 'failed' : 'pending'),
            JSON.stringify(response),
            orderId
        ]
    );

    // Process successful payment
    if (payStatus === 'S' && rcode === '0000' && erpcValid) {
        db.get('SELECT * FROM p99_orders WHERE order_id = ?', [orderId], (err, order) => {
            if (!err && order && order.status !== 'settled') {
                // Check if gold already credited (prevent duplicate)
                db.get('SELECT id FROM wallet_transactions WHERE order_id = ?', [orderId], (err, existingTx) => {
                    if (existingTx) {
                        console.log(`[P99Pay Notify] Order ${orderId} already credited, skipping...`);
                        settleP99Order(orderId);
                        return;
                    }

                    db.serialize(() => {
                        db.run('BEGIN TRANSACTION');
                        db.run('UPDATE users SET gold_balance = gold_balance + ? WHERE id = ?',
                            [order.gold_amount, order.user_id]);
                        db.run(
                            `INSERT OR IGNORE INTO wallet_transactions (order_id, user_id, amount, currency, type, description, status, created_at)
                             VALUES (?, ?, ?, 'gold', 'deposit', ?, 'completed', datetime('now', '+8 hours'))`,
                            [orderId, order.user_id, order.gold_amount, `P99PAY topup ${order.amount_usd} USD`]
                        );
                        db.run('COMMIT', () => {
                            console.log(`[P99Pay Notify] Gold credited: ${order.gold_amount} to user ${order.user_id}`);

                            // Check if this is a service order and fulfill it
                            fulfillServiceOrder(orderId, (err, serviceOrder) => {
                                if (serviceOrder) {
                                    console.log(`[P99Pay Notify] Service order fulfilled: ${serviceOrder.order_id}`);
                                }
                            });

                            settleP99Order(orderId);
                        });
                    });
                });
            }
        });
    }

    // Respond with RRN|PAY_STATUS to acknowledge
    res.send(`${rrn}|${payStatus}`);
});

/**
 * 4. Check Order Status
 * POST /api/payment/p99/checkorder
 */
router.post('/checkorder', async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ success: false, error: 'Missing orderId' });
    }

    // Get order from database
    db.get('SELECT * FROM p99_orders WHERE order_id = ?', [orderId], async (err, order) => {
        if (err || !order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        try {
            // Query P99 for latest status
            const p99Response = await p99Client.checkOrder(order.order_id, order.amount_usd);

            if (p99Response) {
                // Update local order status
                db.run(
                    `UPDATE p99_orders SET
                        pay_status = ?, rcode = ?, erpc_verified = ?,
                        status = ?, updated_at = datetime('now', '+8 hours')
                     WHERE order_id = ?`,
                    [
                        p99Response.PAY_STATUS,
                        p99Response.RCODE,
                        p99Response.erpcValid ? 1 : 0,
                        p99Response.PAY_STATUS === 'S' ? 'success' :
                            (p99Response.PAY_STATUS === 'F' ? 'failed' : 'pending'),
                        orderId
                    ]
                );

                res.json({
                    success: true,
                    orderId: orderId,
                    payStatus: p99Response.PAY_STATUS,
                    rcode: p99Response.RCODE,
                    erpcValid: p99Response.erpcValid,
                    localStatus: order.status
                });
            } else {
                res.json({
                    success: false,
                    error: 'Failed to query P99',
                    localStatus: order.status
                });
            }
        } catch (error) {
            console.error('[P99Pay CheckOrder] Error:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    });
});

/**
 * 5. Manual Settle (usually auto-triggered after success)
 * POST /api/payment/p99/settle
 */
router.post('/settle', async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ success: false, error: 'Missing orderId' });
    }

    const result = await settleP99Order(orderId);
    res.json(result);
});

/**
 * 6. Get user's P99 order history
 * GET /api/payment/p99/orders/:userId
 */
router.get('/orders/:userId', (req, res) => {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    db.all(
        `SELECT order_id, amount_usd, gold_amount, paid, status, pay_status, created_at
         FROM p99_orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
        [userId, limit],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, orders: rows || [] });
        }
    );
});

/**
 * 7. Create Service Order (Arbitrary amount for services like translation)
 * POST /api/payment/p99/service-order
 *
 * This creates a unified payment flow that:
 * 1. User pays arbitrary USD amount via P99
 * 2. System auto-credits equivalent G幣
 * 3. System auto-deducts G幣 for the service
 * 4. Service is marked as fulfilled
 */
router.post('/service-order', (req, res) => {
    const { userId, amountUSD, serviceType, serviceData, returnUrl, productName } = req.body;

    if (!userId || !amountUSD || amountUSD <= 0 || !serviceType) {
        return res.status(400).json({
            success: false,
            error: 'Missing required parameters: userId, amountUSD, serviceType'
        });
    }

    // Verify user exists
    db.get('SELECT id, name FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const serviceOrderId = `SVC${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        const p99OrderId = generateOrderId();
        const goldAmount = Math.floor(amountUSD * USD_TO_GOLD_RATE);

        // Build P99 order request
        const orderRequest = p99Client.buildOrderRequest({
            coid: p99OrderId,
            amount: amountUSD,
            paid: '', // Let user choose payment method
            userAcctId: userId,
            productName: productName || `GameZoe Service: ${serviceType}`,
            productId: `SVC_${serviceType}`,
            memo: `Service order ${serviceOrderId} for user ${userId}`
        });

        // Create both orders in transaction
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // Create P99 order
            db.run(
                `INSERT INTO p99_orders (order_id, user_id, amount_usd, gold_amount, paid, status, raw_request, created_at)
                 VALUES (?, ?, ?, ?, '', 'pending', ?, datetime('now', '+8 hours'))`,
                [p99OrderId, userId, amountUSD, goldAmount, JSON.stringify(orderRequest.jsonData)]
            );

            // Create service order
            db.run(
                `INSERT INTO service_orders (order_id, p99_order_id, user_id, service_type, service_data, amount_usd, gold_amount, status, return_url, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, datetime('now', '+8 hours'))`,
                [serviceOrderId, p99OrderId, userId, serviceType, JSON.stringify(serviceData || {}), amountUSD, goldAmount, returnUrl || null]
            );

            db.run('COMMIT', (err) => {
                if (err) {
                    console.error('[P99Pay ServiceOrder] Failed to create orders:', err.message);
                    return res.status(500).json({ success: false, error: 'Failed to create service order' });
                }

                console.log(`[P99Pay ServiceOrder] Created: ${serviceOrderId} -> P99: ${p99OrderId}, User: ${userId}, ${amountUSD} USD for ${serviceType}`);

                res.json({
                    success: true,
                    serviceOrderId: serviceOrderId,
                    p99OrderId: p99OrderId,
                    amountUSD: amountUSD,
                    goldAmount: goldAmount,
                    serviceType: serviceType,
                    apiUrl: p99Client.config.apiUrl,
                    formData: orderRequest.base64Data
                });
            });
        });
    });
});

/**
 * 8. Get service order status
 * GET /api/payment/p99/service-order/:orderId
 */
router.get('/service-order/:orderId', (req, res) => {
    const { orderId } = req.params;

    db.get(
        `SELECT s.*, p.pay_status, p.status as p99_status, p.rcode
         FROM service_orders s
         LEFT JOIN p99_orders p ON s.p99_order_id = p.order_id
         WHERE s.order_id = ?`,
        [orderId],
        (err, order) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (!order) {
                return res.status(404).json({ success: false, error: 'Service order not found' });
            }

            res.json({
                success: true,
                order: {
                    orderId: order.order_id,
                    p99OrderId: order.p99_order_id,
                    userId: order.user_id,
                    serviceType: order.service_type,
                    serviceData: JSON.parse(order.service_data || '{}'),
                    amountUSD: order.amount_usd,
                    goldAmount: order.gold_amount,
                    status: order.status,
                    p99Status: order.p99_status,
                    payStatus: order.pay_status,
                    fulfilledAt: order.fulfilled_at,
                    createdAt: order.created_at
                }
            });
        }
    );
});

/**
 * 9. Verify order and gold credit status (Admin/Support use)
 * GET /api/payment/verify/:orderId
 */
router.get('/verify/:orderId', (req, res) => {
    const { orderId } = req.params;

    // Get order info
    db.get('SELECT * FROM p99_orders WHERE order_id = ?', [orderId], (err, order) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!order) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Check if gold was credited
        db.get('SELECT * FROM wallet_transactions WHERE order_id = ?', [orderId], (err, transaction) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            // Get user's current balance
            db.get('SELECT id, name, gold_balance FROM users WHERE id = ?', [order.user_id], (err, user) => {
                const verification = {
                    success: true,
                    order: {
                        order_id: order.order_id,
                        user_id: order.user_id,
                        amount_usd: order.amount_usd,
                        gold_amount: order.gold_amount,
                        status: order.status,
                        pay_status: order.pay_status,
                        settle_status: order.settle_status,
                        created_at: order.created_at,
                        updated_at: order.updated_at
                    },
                    gold_credited: !!transaction,
                    transaction: transaction ? {
                        id: transaction.id,
                        amount: transaction.amount,
                        status: transaction.status,
                        created_at: transaction.created_at
                    } : null,
                    user: user ? {
                        id: user.id,
                        name: user.name,
                        current_gold_balance: user.gold_balance
                    } : null,
                    verification_result: {
                        order_success: order.pay_status === 'S' && order.status === 'settled',
                        gold_delivered: !!transaction,
                        settlement_complete: order.settle_status === 'settled'
                    }
                };

                res.json(verification);
            });
        });
    });
});

/**
 * Helper function to fulfill a service order after payment
 * This performs: 儲值 → 轉點(到遊戲) → 扣點(遊戲點數) in sequence
 *
 * Flow:
 * 1. 儲值: G幣入帳 users.gold_balance (已由 P99 return/notify 完成)
 * 2. 轉點: users.gold_balance → user_game_balances.balance
 * 3. 扣點: user_game_balances.balance 扣除 (服務消費)
 */
function fulfillServiceOrder(p99OrderId, callback) {
    // Find the service order linked to this P99 order
    db.get(
        'SELECT * FROM service_orders WHERE p99_order_id = ? AND status = ?',
        [p99OrderId, 'pending'],
        (err, serviceOrder) => {
            if (err || !serviceOrder) {
                // Not a service order, or already fulfilled
                if (callback) callback(null);
                return;
            }

            // Parse service data to get game_id (defaults to service_type)
            let serviceData = {};
            try {
                serviceData = JSON.parse(serviceOrder.service_data || '{}');
            } catch (e) {}
            const gameId = serviceData.game_id || serviceOrder.service_type;

            console.log(`[P99Pay ServiceFulfill] Processing ${serviceOrder.order_id}: ${serviceOrder.gold_amount}G for game ${gameId}`);

            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                // Step 1: 儲值 - G幣已由 P99 return/notify 入帳，這裡不需處理

                // Step 2: 轉點 - 從 G幣扣除，轉入遊戲點數
                db.run(
                    'UPDATE users SET gold_balance = gold_balance - ? WHERE id = ? AND gold_balance >= ?',
                    [serviceOrder.gold_amount, serviceOrder.user_id, serviceOrder.gold_amount],
                    function(err) {
                        if (err || this.changes === 0) {
                            db.run('ROLLBACK');
                            console.error(`[P99Pay ServiceFulfill] Failed to deduct G幣 for ${serviceOrder.order_id}`);
                            if (callback) callback(new Error('Insufficient G幣 balance'));
                            return;
                        }

                        // Step 2b: 加入遊戲點數 (user_game_balances)
                        db.run(
                            `INSERT INTO user_game_balances (user_id, game_id, balance, total_deposited, created_at, updated_at)
                             VALUES (?, ?, ?, ?, datetime('now', '+8 hours'), datetime('now', '+8 hours'))
                             ON CONFLICT(user_id, game_id) DO UPDATE SET
                             balance = balance + ?,
                             total_deposited = total_deposited + ?,
                             updated_at = datetime('now', '+8 hours')`,
                            [serviceOrder.user_id, gameId, serviceOrder.gold_amount, serviceOrder.gold_amount,
                             serviceOrder.gold_amount, serviceOrder.gold_amount],
                            function(err) {
                                if (err) {
                                    db.run('ROLLBACK');
                                    console.error(`[P99Pay ServiceFulfill] Failed to credit game balance for ${serviceOrder.order_id}:`, err.message);
                                    if (callback) callback(err);
                                    return;
                                }

                                // Log transfer transaction (G幣 → 遊戲點數)
                                db.run(
                                    `INSERT INTO wallet_transactions (order_id, user_id, amount, currency, type, description, game_id, status, created_at)
                                     VALUES (?, ?, ?, 'gold', 'transfer_out', ?, ?, 'completed', datetime('now', '+8 hours'))`,
                                    [
                                        `${serviceOrder.order_id}_transfer`,
                                        serviceOrder.user_id,
                                        -serviceOrder.gold_amount,
                                        `轉點到 ${gameId}: ${serviceOrder.gold_amount}G`,
                                        gameId
                                    ]
                                );

                                // Step 3: 扣點 - 從遊戲點數扣除 (服務消費)
                                db.run(
                                    `UPDATE user_game_balances SET
                                     balance = balance - ?,
                                     total_consumed = total_consumed + ?,
                                     updated_at = datetime('now', '+8 hours')
                                     WHERE user_id = ? AND game_id = ? AND balance >= ?`,
                                    [serviceOrder.gold_amount, serviceOrder.gold_amount,
                                     serviceOrder.user_id, gameId, serviceOrder.gold_amount],
                                    function(err) {
                                        if (err || this.changes === 0) {
                                            db.run('ROLLBACK');
                                            console.error(`[P99Pay ServiceFulfill] Failed to consume game points for ${serviceOrder.order_id}`);
                                            if (callback) callback(new Error('Failed to consume game points'));
                                            return;
                                        }

                                        // Log consumption transaction
                                        db.run(
                                            `INSERT INTO wallet_transactions (order_id, user_id, amount, currency, type, description, game_id, status, created_at)
                                             VALUES (?, ?, ?, 'gold', 'service', ?, ?, 'completed', datetime('now', '+8 hours'))`,
                                            [
                                                serviceOrder.order_id,
                                                serviceOrder.user_id,
                                                -serviceOrder.gold_amount,
                                                `服務消費: ${serviceOrder.service_type} ($${serviceOrder.amount_usd} USD)`,
                                                gameId
                                            ]
                                        );

                                        // Step 4: Mark service order as fulfilled
                                        db.run(
                                            `UPDATE service_orders SET status = 'fulfilled', fulfilled_at = datetime('now', '+8 hours'), updated_at = datetime('now', '+8 hours')
                                             WHERE order_id = ?`,
                                            [serviceOrder.order_id]
                                        );

                                        db.run('COMMIT', (err) => {
                                            if (err) {
                                                console.error(`[P99Pay ServiceFulfill] Commit failed for ${serviceOrder.order_id}:`, err.message);
                                                if (callback) callback(err);
                                                return;
                                            }

                                            console.log(`[P99Pay ServiceFulfill] ✅ Complete: ${serviceOrder.order_id}`);
                                            console.log(`  - G幣入帳: +${serviceOrder.gold_amount} (by P99 callback)`);
                                            console.log(`  - 轉點到 ${gameId}: -${serviceOrder.gold_amount}G → +${serviceOrder.gold_amount} 遊戲點`);
                                            console.log(`  - 服務消費: -${serviceOrder.gold_amount} 遊戲點`);

                                            if (callback) callback(null, serviceOrder);
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            });
        }
    );
}

/**
 * Helper function to settle an order
 */
async function settleP99Order(orderId) {
    return new Promise((resolve) => {
        db.get('SELECT * FROM p99_orders WHERE order_id = ?', [orderId], async (err, order) => {
            if (err || !order) {
                return resolve({ success: false, error: 'Order not found' });
            }

            if (order.settle_status === 'settled') {
                return resolve({ success: true, message: 'Already settled' });
            }

            if (order.pay_status !== 'S') {
                return resolve({ success: false, error: 'Cannot settle non-successful order' });
            }

            try {
                const response = await p99Client.settleOrder(
                    order.order_id,
                    order.amount_usd,
                    order.paid || 'COPKWP09'
                );

                const settleSuccess = response && response.RCODE === '0000';

                db.run(
                    `UPDATE p99_orders SET
                        settle_status = ?, settle_rcode = ?,
                        status = ?, updated_at = datetime('now', '+8 hours')
                     WHERE order_id = ?`,
                    [
                        settleSuccess ? 'settled' : 'settle_failed',
                        response?.RCODE || 'ERROR',
                        settleSuccess ? 'settled' : order.status,
                        orderId
                    ]
                );

                console.log(`[P99Pay Settle] Order ${orderId}: ${settleSuccess ? 'SUCCESS' : 'FAILED'}`);
                resolve({ success: settleSuccess, rcode: response?.RCODE });
            } catch (error) {
                console.error('[P99Pay Settle] Error:', error.message);
                resolve({ success: false, error: error.message });
            }
        });
    });
}

/**
 * Start batch job to check pending orders
 */
export function startBatchJob() {
    setInterval(() => {
        console.log('[P99Pay Batch] Checking pending orders...');

        db.all(
            `SELECT order_id, amount_usd FROM p99_orders
             WHERE status = 'pending' AND created_at < datetime('now', '-10 minutes')`,
            async (err, orders) => {
                if (err || !orders || orders.length === 0) return;

                console.log(`[P99Pay Batch] Found ${orders.length} pending orders to check`);

                for (const order of orders) {
                    try {
                        const response = await p99Client.checkOrder(order.order_id, order.amount_usd);
                        if (response) {
                            console.log(`[P99Pay Batch] Order ${order.order_id}: PAY_STATUS=${response.PAY_STATUS}`);

                            if (response.PAY_STATUS === 'S') {
                                // Process successful order
                                db.get('SELECT * FROM p99_orders WHERE order_id = ?', [order.order_id], (err, fullOrder) => {
                                    if (!err && fullOrder && fullOrder.status !== 'settled') {
                                        // Check if already credited
                                        db.get('SELECT id FROM wallet_transactions WHERE order_id = ?', [order.order_id], (err, existingTx) => {
                                            if (existingTx) {
                                                console.log(`[P99Pay Batch] Order ${order.order_id} already credited, skipping...`);
                                                settleP99Order(order.order_id);
                                                return;
                                            }
                                            db.serialize(() => {
                                                db.run('BEGIN TRANSACTION');
                                                db.run('UPDATE users SET gold_balance = gold_balance + ? WHERE id = ?',
                                                    [fullOrder.gold_amount, fullOrder.user_id]);
                                                db.run(
                                                    `INSERT OR IGNORE INTO wallet_transactions (order_id, user_id, amount, currency, type, description, status, created_at)
                                                     VALUES (?, ?, ?, 'gold', 'deposit', ?, 'completed', datetime('now', '+8 hours'))`,
                                                    [order.order_id, fullOrder.user_id, fullOrder.gold_amount, `P99PAY batch topup ${fullOrder.amount_usd} USD`]
                                                );
                                                db.run('COMMIT', () => {
                                                    console.log(`[P99Pay Batch] Gold credited: ${fullOrder.gold_amount} to user ${fullOrder.user_id}`);
                                                    settleP99Order(order.order_id);
                                                });
                                            });
                                        });
                                    }
                                });
                            }

                            // Update order status
                            db.run(
                                `UPDATE p99_orders SET
                                    pay_status = ?, rcode = ?,
                                    status = ?, updated_at = datetime('now', '+8 hours')
                                 WHERE order_id = ?`,
                                [
                                    response.PAY_STATUS,
                                    response.RCODE,
                                    response.PAY_STATUS === 'S' ? 'success' :
                                        (response.PAY_STATUS === 'F' ? 'failed' : 'pending'),
                                    order.order_id
                                ]
                            );
                        }
                    } catch (error) {
                        console.error(`[P99Pay Batch] Error checking order ${order.order_id}:`, error.message);
                    }
                }
            }
        );
    }, 10 * 60 * 1000); // Every 10 minutes

    // Internal Reconciliation Job - verify and auto-fix undelivered gold
    // Runs every 5 minutes, checks orders paid but gold not credited
    setInterval(() => {
        console.log('[P99Pay Reconcile] Running internal reconciliation...');

        // Find orders where P99 says paid (pay_status=S) but no wallet_transaction exists
        db.all(
            `SELECT p.* FROM p99_orders p
             LEFT JOIN wallet_transactions w ON p.order_id = w.order_id
             WHERE p.pay_status = 'S' AND w.id IS NULL
             AND p.created_at > datetime('now', '-24 hours')`,
            (err, undeliveredOrders) => {
                if (err) {
                    console.error('[P99Pay Reconcile] Query error:', err.message);
                    return;
                }

                if (!undeliveredOrders || undeliveredOrders.length === 0) {
                    console.log('[P99Pay Reconcile] All orders verified - no undelivered gold found');
                    return;
                }

                console.log(`[P99Pay Reconcile] ⚠️ Found ${undeliveredOrders.length} orders with undelivered gold!`);

                for (const order of undeliveredOrders) {
                    console.log(`[P99Pay Reconcile] Processing order ${order.order_id}: ${order.gold_amount}G for user ${order.user_id}`);

                    db.serialize(() => {
                        db.run('BEGIN TRANSACTION');

                        // Credit gold
                        db.run('UPDATE users SET gold_balance = gold_balance + ? WHERE id = ?',
                            [order.gold_amount, order.user_id]);

                        // Log transaction with reconciliation note
                        db.run(
                            `INSERT OR IGNORE INTO wallet_transactions (order_id, user_id, amount, currency, type, description, status, created_at)
                             VALUES (?, ?, ?, 'gold', 'deposit', ?, 'completed', datetime('now', '+8 hours'))`,
                            [order.order_id, order.user_id, order.gold_amount, `P99PAY reconcile topup ${order.amount_usd} USD`]
                        );

                        // Update order status
                        db.run(
                            `UPDATE p99_orders SET status = 'settled', updated_at = datetime('now', '+8 hours') WHERE order_id = ?`,
                            [order.order_id]
                        );

                        db.run('COMMIT', (err) => {
                            if (err) {
                                console.error(`[P99Pay Reconcile] Failed to credit order ${order.order_id}:`, err.message);
                            } else {
                                console.log(`[P99Pay Reconcile] ✅ Gold credited: ${order.gold_amount}G to user ${order.user_id} (Order: ${order.order_id})`);

                                // Settle with P99 if not already settled
                                if (order.settle_status !== 'settled') {
                                    settleP99Order(order.order_id);
                                }
                            }
                        });
                    });
                }
            }
        );
    }, 5 * 60 * 1000); // Every 5 minutes

    // Service Order Fulfillment Job - check for paid but unfulfilled service orders
    // Runs every 3 minutes
    setInterval(() => {
        console.log('[P99Pay ServiceJob] Checking unfulfilled service orders...');

        // Find service orders where P99 payment succeeded but service not yet fulfilled
        db.all(
            `SELECT s.*, p.pay_status, p.rcode
             FROM service_orders s
             JOIN p99_orders p ON s.p99_order_id = p.order_id
             WHERE s.status = 'pending'
             AND p.pay_status = 'S'
             AND p.rcode = '0000'
             AND s.created_at > datetime('now', '-24 hours')`,
            (err, unfulfilledOrders) => {
                if (err) {
                    console.error('[P99Pay ServiceJob] Query error:', err.message);
                    return;
                }

                if (!unfulfilledOrders || unfulfilledOrders.length === 0) {
                    console.log('[P99Pay ServiceJob] All service orders verified');
                    return;
                }

                console.log(`[P99Pay ServiceJob] ⚠️ Found ${unfulfilledOrders.length} unfulfilled service orders!`);

                for (const order of unfulfilledOrders) {
                    console.log(`[P99Pay ServiceJob] Processing ${order.order_id}...`);
                    fulfillServiceOrder(order.p99_order_id, (err, fulfilled) => {
                        if (err) {
                            console.error(`[P99Pay ServiceJob] Failed to fulfill ${order.order_id}:`, err.message);
                        } else if (fulfilled) {
                            console.log(`[P99Pay ServiceJob] ✅ Fulfilled ${order.order_id}`);
                        }
                    });
                }
            }
        );
    }, 3 * 60 * 1000); // Every 3 minutes
}

export default router;
