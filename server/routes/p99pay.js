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

                            // Auto-settle the order
                            settleP99Order(orderId);
                        });
                    });
                }

                res.redirect(`/?success=true&orderId=${orderId}&amount=${order.gold_amount}`);
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
 * 7. Verify order and gold credit status (Admin/Support use)
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
}

export default router;
