import { WebSocketServer } from 'ws';
import sqlite3 from 'sqlite3';

const wss = new WebSocketServer({ port: 9001 });
const db = new sqlite3.Database('./server/gamezoe.db');

// Protocol Constants
const MSG_LOGIN = 30001;
const MSG_FIRE = 20001;      // [NEW] Fire bullet
const MSG_PRODUCE_FISH = 20002;
const MSG_CATCH_FISH = 20003;
const MSG_HEARTBEAT = 22;

// [GAME_ID_FIX] This game's ID in user_game_balances
const GAME_ID = 'my-fish-egret';

console.log("MyFish Mock Server running on port 9001");
console.log("[DB] Connected to gamezoe.db");

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    let userId = null; // Store authenticated user
    let userBalance = 0; // Track balance in memory for quick deduction

    // Start Fish Loop
    const fishInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            sendFish(ws);
        }
    }, 2000);

    ws.on('message', function message(data) {
        try {
            const str = data.toString();
            const json = JSON.parse(str);

            if (json.Msg === MSG_LOGIN) {
                console.log("[Login] Request from userId:", json.userId);

                // [GAME_ID_FIX] Query from user_game_balances instead of users.fish_balance
                db.get(
                    `SELECT u.id, COALESCE(g.balance, 0) as game_balance
                     FROM users u
                     LEFT JOIN user_game_balances g ON u.id = g.user_id AND g.game_id = ?
                     WHERE u.id = ?`,
                    [GAME_ID, json.userId],
                    (err, user) => {
                        if (err) {
                            console.error("[Login] DB Error:", err);
                            ws.send(JSON.stringify({
                                Msg: MSG_LOGIN,
                                code: -1,
                                error: "Database error"
                            }));
                            return;
                        }

                        if (!user) {
                            console.warn("[Login] User not found:", json.userId);
                            ws.send(JSON.stringify({
                                Msg: MSG_LOGIN,
                                code: -1,
                                error: "User not found"
                            }));
                            return;
                        }

                        userId = user.id; // Store for later
                        userBalance = user.game_balance; // Store balance in memory
                        const balanceInGame = Math.round(user.game_balance * 1000);

                        console.log(`[Login] Success - userId: ${userId}, gameId: ${GAME_ID}, balance: ${user.game_balance} (${balanceInGame} in-game)`);

                        const response = {
                            Msg: MSG_LOGIN,
                            _gold: balanceInGame,
                            code: 0
                        };
                        ws.send(JSON.stringify(response));
                    }
                );
            }
            // [NEW] Handle bullet fire - deduct cost
            else if (json.Msg === MSG_FIRE) {
                if (!userId) {
                    console.error("[Fire] Not logged in");
                    return;
                }

                // Calculate bullet cost (client sends bulletMulti or we use default)
                const bulletMulti = json.bulletMulti || json.multi || 1;
                const baseCost = 0.1; // Base cost per bullet
                const cost = baseCost * bulletMulti;
                const costInGame = Math.round(cost * 1000);

                console.log(`[Fire] userId: ${userId}, bulletMulti: ${bulletMulti}, cost: ${cost}`);

                // Deduct from database
                db.run(
                    `UPDATE user_game_balances SET balance = balance - ?, updated_at = datetime('now', '+8 hours')
                     WHERE user_id = ? AND game_id = ? AND balance >= ?`,
                    [cost, userId, GAME_ID, cost],
                    function (err) {
                        if (err) {
                            console.error('[Fire] DB Error:', err);
                            return;
                        }

                        if (this.changes === 0) {
                            console.warn(`[Fire] Insufficient balance for user ${userId}`);
                            // Could send error response to client
                            return;
                        }

                        userBalance -= cost;
                        console.log(`[Fire] Deducted ${cost}, new balance: ${userBalance}`);

                        // Send confirmation (optional - depends on client expectation)
                        ws.send(JSON.stringify({
                            Msg: MSG_FIRE,
                            code: 0,
                            _gold: Math.round(userBalance * 1000)
                        }));
                    }
                );
            }
            else if (json.Msg === MSG_CATCH_FISH) {
                if (!userId) {
                    console.error("[Catch] Not logged in");
                    return;
                }

                const fishValue = json.fishNo || 1;
                const bulletNum = json.bulletnum || 5; // Cannon bet: 5, 10, 20, 100, 200

                // [RTP 96%] Cost = bulletNum (in-game), Reward = bulletNum * fishValue
                // Probability = 96% / fishValue
                // Expected return = (0.96/fishValue) * (bulletNum * fishValue) = 0.96 * bulletNum
                // RTP = 0.96 * bulletNum / bulletNum = 96%
                const costInGame = bulletNum;
                const costInDB = costInGame / 1000;
                const RTP = 0.96;
                const catchProbability = Math.min(RTP / fishValue, 0.95);
                const isCatch = Math.random() < catchProbability;

                console.log(`[Catch] fish:${fishValue}, cannon:${bulletNum}, prob:${(catchProbability*100).toFixed(1)}%, userId:${userId}`);

                // [CRITICAL] Always deduct cost first, then add reward if caught
                // Reward scales with both fish value AND cannon bet
                const rewardInGame = isCatch ? (bulletNum * fishValue) : 0;
                const rewardInDB = rewardInGame / 1000;
                const netChange = rewardInDB - costInDB; // Can be negative!

                // [RTP FIX] Always update balance: deduct cost, add reward if caught
                // netChange can be negative (miss) or positive (catch high value fish)
                db.run(
                    `INSERT INTO user_game_balances (user_id, game_id, balance, created_at, updated_at)
                     VALUES (?, ?, ?, datetime('now', '+8 hours'), datetime('now', '+8 hours'))
                     ON CONFLICT(user_id, game_id) DO UPDATE SET
                     balance = balance + ?,
                     updated_at = datetime('now', '+8 hours')`,
                    [userId, GAME_ID, netChange, netChange],
                    function (err) {
                        if (err) {
                            console.error('[Catch] DB Update Error:', err);
                            return;
                        }

                        // Read updated balance
                        db.get(
                            'SELECT balance FROM user_game_balances WHERE user_id = ? AND game_id = ?',
                            [userId, GAME_ID],
                            (err, row) => {
                                if (err) {
                                    console.error('[Catch] DB Read Error:', err);
                                    return;
                                }

                                const newBalance = row ? row.balance : 0;
                                const newBalanceInGame = Math.round(newBalance * 1000);

                                if (isCatch) {
                                    console.log(`[Catch] HIT! Fish:${fishValue}x, Cannon:${bulletNum}, Reward:${rewardInGame}, Cost:${costInGame}, Net:${netChange.toFixed(3)}, Balance:${newBalance.toFixed(3)}`);

                                    const response = {
                                        Msg: MSG_CATCH_FISH,
                                        re: 0,
                                        catch_gold: rewardInGame,
                                        warncontent: "Catch!",
                                        userId: userId,
                                        fishNo: json.fishNo,
                                        _gold: newBalanceInGame,
                                        score: newBalanceInGame,
                                        target_after_IncomeGold: newBalanceInGame,
                                        hashcode: json.hashcode,
                                        x: json.x,
                                        y: json.y
                                    };
                                    ws.send(JSON.stringify(response));
                                } else {
                                    console.log(`[Catch] MISS! Fish:${fishValue}x, Cannon:${bulletNum}, Cost:${costInGame}, Balance:${newBalance.toFixed(3)}`);
                                    // Don't send response for miss - client handles locally
                                }
                            }
                        );
                    }
                );
            }
            // [DEBUG] Log unknown messages to understand client protocol
            else {
                console.log(`[Unknown Msg] Type: ${json.Msg}, Data:`, JSON.stringify(json).substring(0, 200));
            }

        } catch (e) {
            console.error("Msg Error", e);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clearInterval(fishInterval);
    });
});

function sendFish(ws) {
    const payload = {
        Msg: MSG_PRODUCE_FISH,
        isProduceFish: true
    };

    // Randomly populate lanes
    for (let i = 1; i <= 5; i++) {
        if (Math.random() > 0.7) {
            payload[`seaway${i}left`] = Math.floor(Math.random() * 12) + 1;
        } else {
            payload[`seaway${i}left`] = 0;
        }

        if (Math.random() > 0.7) {
            payload[`seaway${i}right`] = Math.floor(Math.random() * 12) + 1;
        } else {
            payload[`seaway${i}right`] = 0;
        }
    }

    ws.send(JSON.stringify(payload));
}
