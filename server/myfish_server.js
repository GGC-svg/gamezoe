import { WebSocketServer } from 'ws';
import sqlite3 from 'sqlite3';

const wss = new WebSocketServer({ port: 9001 });
const db = new sqlite3.Database('./server/gamezoe.db');

// Protocol Constants
const MSG_LOGIN = 30001;
const MSG_PRODUCE_FISH = 20002;
const MSG_CATCH_FISH = 20003;
const MSG_HEARTBEAT = 22;

console.log("MyFish Mock Server running on port 9001");
console.log("[DB] Connected to gamezoe.db");

wss.on('connection', function connection(ws) {
    console.log('Client connected');

    let userId = null; // Store authenticated user

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

                // Query database for user
                db.get(
                    'SELECT id, fish_balance FROM users WHERE id = ?',
                    [json.userId],
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
                        const balanceInGame = Math.round(user.fish_balance * 1000);

                        console.log(`[Login] Success - userId: ${userId}, balance: ${user.fish_balance} (${balanceInGame} in-game)`);

                        const response = {
                            Msg: MSG_LOGIN,
                            _gold: balanceInGame,
                            code: 0
                        };
                        ws.send(JSON.stringify(response));
                    }
                );
            }
            else if (json.Msg === MSG_CATCH_FISH) {
                if (!userId) {
                    console.error("[Catch] Not logged in");
                    return;
                }

                console.log("[Catch] fishNo:", json.fishNo, "from userId:", userId);

                // 50% chance to catch
                const isCatch = Math.random() > 0.5;

                if (isCatch) {
                    const rewardInGame = 100 * (json.fishNo || 1);
                    const rewardInDB = rewardInGame / 1000;

                    // Update database
                    db.run(
                        'UPDATE users SET fish_balance = fish_balance + ? WHERE id = ?',
                        [rewardInDB, userId],
                        function (err) {
                            if (err) {
                                console.error('[Catch] DB Update Error:', err);
                                return;
                            }

                            // Read updated balance
                            db.get(
                                'SELECT fish_balance FROM users WHERE id = ?',
                                [userId],
                                (err, user) => {
                                    if (err) {
                                        console.error('[Catch] DB Read Error:', err);
                                        return;
                                    }

                                    const newBalanceInGame = Math.round(user.fish_balance * 1000);

                                    console.log(`[Catch] Success! Reward: ${rewardInDB}, New Balance: ${user.fish_balance} (${newBalanceInGame} in-game)`);

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
                                }
                            );
                        }
                    );
                } else {
                    console.log("[Catch] Miss!");
                }
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
