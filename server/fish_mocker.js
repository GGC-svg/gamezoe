import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { generateSignature, verifySignature } from './utils/signature.js';
import { RoomManager, baseParamToScore } from './utils/RoomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------------------------------------------------
// GAME CONSTANTS
// -------------------------------------------------------------------------

// [VIP CONFIG] - Derived from Observation / Standard Practice
// Since legacy code used random VIP, we implement a standard recharge-based system.
const VIP_LEVELS = [
    { level: 1, minGold: 10000 },    // 10 RMB
    { level: 2, minGold: 50000 },    // 50 RMB
    { level: 3, minGold: 200000 },   // 200 RMB
    { level: 4, minGold: 1000000 },  // 1000 RMB
    { level: 5, minGold: 5000000 },  // 5000 RMB
    { level: 6, minGold: 20000000 }, // 20000 RMB
    { level: 7, minGold: 50000000 }  // VIP 7 (Max)
];

function calculateVip(totalRecharge) {
    let vip = 0;
    for (const v of VIP_LEVELS) {
        if (totalRecharge >= v.minGold) {
            vip = v.level;
        } else {
            break;
        }
    }
    return vip;
}

const FishMulti = {
    1: 2, 2: 2, 3: 3, 4: 4, 5: 5, 6: 5, 7: 6, 8: 7, 9: 8, 10: 9,
    11: 10, 12: 11, 13: 12, 14: 18, 15: 25, 16: 30, 17: 35, 18: 40,
    19: 45, 20: 50, 21: 80, 22: 100,
    23: 45, 24: 45, 25: 45, 26: 45,
    27: 50, 28: 60, 29: 70,
    30: 100, 31: 110, 32: 110, 33: 110,
    34: 120, 35: 200
};

// [FIX] Bullet Multipliers (Standardized 1-10)
// [CANONICAL] From game/service/define.go
// Maps BulletKind ID to Multiplier Value (1, 2, 3, 5)
const BulletMulti = {
    1: 1, 2: 2, 3: 3, 4: 1, 5: 3, 6: 5,
    7: 1, 8: 3, 9: 5, 10: 1, 11: 3, 12: 5,
    13: 1, 14: 3, 15: 5, 16: 1, 17: 3, 18: 5,
    19: 1, 20: 3, 21: 5, 22: 1
};

const GameBaseScore = 1;

// -------------------------------------------------------------------------
// DYNAMIC ROOM MANAGEMENT (Map-Based, Aligned with Go)
// -------------------------------------------------------------------------
// Old fixed RoomState array removed. Now using RoomManager with dynamic Map.
// Rooms are created on-demand with auto-generated IDs (1000+).

// [FIX] Room Configuration based on Screenshot
// Room 1: Entry 0.1 (100 Score) -> Base 1 -> Multi 1-3 (Cost 1-3 = 0.001-0.003)
// Room 2: Entry 10 (10000 Score) -> Base 50 -> Multi 1-5 (Cost 50-250 = 0.05-0.25)
// Room 3: Entry 100 (100000 Score) -> Base 500 -> Multi 1-5 (Cost 500-2500 = 0.5-2.5)
// Room 4: Entry 1000 (1000000 Score) -> Base 2000 -> Multi 1-5 (Cost 2000-10000 = 2-10)

// [CANONICAL] Derived from Screenshot & Logic (BaseScore * Multi)
// Novice: 0.001 - 0.003
// Junior: 0.05 - 0.25
// High: 0.5 - 2.5
// Tycoon: 2.0 - 10.0
const RoomConfig = {
    1: { baseScore: 0.001, minGold: 0.1 },
    2: { baseScore: 0.05, minGold: 10 },
    3: { baseScore: 0.5, minGold: 100 },
    4: { baseScore: 2.0, minGold: 1000 }
};

// -------------------------------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------------------------------

function parsePayload(data) {
    if (typeof data === 'string') {
        try { return JSON.parse(data); }
        catch (e) { return {}; }
    }
    return data || {};
}

// -------------------------------------------------------------------------
// CONFIG LOADING
// -------------------------------------------------------------------------

let outputTraceConfig = null;
try {
    const tracesPath = path.join(__dirname, '../games/fish-master/common/conf/traces.json');
    if (fs.existsSync(tracesPath)) {
        outputTraceConfig = JSON.parse(fs.readFileSync(tracesPath, 'utf-8'));
        console.log(`[Config] Loaded traces.json: ${Object.keys(outputTraceConfig).length} traces.`);
    } else {
        console.error(`[Config] traces.json NOT FOUND at ${tracesPath}`);
    }
} catch (e) { console.error(`[Config] Error loading traces:`, e); }

process.on('uncaughtException', (err) => { console.error('UNCAUGHT EXCEPTION:', err); });

// -------------------------------------------------------------------------
// SERVER INSTANCES
// -------------------------------------------------------------------------

const ports = [4000, 9000, 4002];
const ioInstances = []; // Global store for all IO instances

// -------------------------------------------------------------------------
// GLOBAL ROOM MANAGER (Initialized after forEach)
// -------------------------------------------------------------------------
let roomManager = null;  // Will be initialized after all ioInstances are collected

// [GAME_ID_FIX] Cache user's gameId from HTTP login for socket login to use
// This fixes the race condition where socket connects before client-side patch applies
const userGameIdCache = new Map();  // userId -> { gameId, timestamp }

ports.forEach(port => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        cors: { origin: "*" },
        allowEIO3: true
    });
    ioInstances.push(io);

    app.use((req, res, next) => {
        // console.log(`[Port ${port} HTTP] ${req.method} ${req.url}`);
        next();
    });

    // -------------------------------------------------------------------------
    // HTTP ENDPOINTS
    // -------------------------------------------------------------------------



    app.get('/get_serverinfo', (req, res) => {
        // [FIX] Return public hostname and HTTPS port so client connects via WSS Proxy
        // If local, return localhost/3000? No, client logic might be complex.
        // Let's assume VM environment for now based on user request.
        const host = "gamezoe.com";
        res.json({
            code: 0, msg: "success", status: 1,
            // Force client to connect to wss://gamezoe.com (Port 443)
            // Note: Client might append port. If port is 443, it's fine.
            ip: host, host: host, port: 443,
            hall_ip: host, hall_port: 443, hall: host + ":443", version: 1
        });
    });

    function generateUserResponse(account, balance = 0, dbName = null) {
        // Deterministic Numeric ID from String (Simple Hash)
        let numId = 0;
        for (let i = 0; i < account.length; i++) {
            numId = ((numId << 5) - numId) + account.charCodeAt(i);
            numId |= 0; // Convert to 32bit int
        }
        numId = Math.abs(numId) % 1000000 + 10000; // Range 10000-1010000

        return {
            errcode: 0, errmsg: "",
            qqLoginUrl: "http://localhost:3000/games/fish/index.html",
            account: account,
            sign: "mock_sign_" + account,
            user_id: account, userid: account, userId: account, id: account, // [FIX] Use Account String as ID to prevent mismatch and precision loss
            token: account, // Critical: Socket 'login' uses this to identify user

            // Profile
            // [FIX] Use DB Name if available to match Game Room
            name: dbName || ("Hunter_" + account.substring(0, 5)),
            headimg: (numId % 8) + 1,
            lv: 10, exp: 999,

            // Sync all to Real Balance
            coins: balance,
            money: balance,
            gems: balance,

            vip: calculateVip(balance), // [VIP_FIX] specific to HTTP login: use balance as proxy for recharge history
            roomid: 1, sex: 1, ip: "127.0.0.1",
            item: {
                ice: 100
            }
        };
    }

    // --- GAME SERVER TRANSACTION API (Receiver) ---
    // import { generateSignature, verifySignature } from './utils/signature.js'; // Moved to top

    app.use(express.json()); // Ensure JSON parsing

    // Step 02: Platform calls Game to Deposit
    app.post('/api/game/v1/transaction/deposit', async (req, res) => {
        const { order_id, user_id, amount, timestamp, signature } = req.body;

        // 1. Security Check
        if (!verifySignature({ order_id, user_id, amount, timestamp }, signature)) {
            return res.status(401).json({ code: 401, message: "Invalid Signature" });
        }

        // 2. Idempotency Check (Shared DB)
        db.get("SELECT status FROM wallet_transactions WHERE order_id = ?", [order_id], (err, row) => {
            if (err) {
                console.error(`[GameServer] Deposit Check Error (DB):`, err);
                return res.status(500).json({ code: 500, message: "DB Error" });
            }

            if (!row) return res.status(404).json({ code: 404, message: "Order Not Found" });
            if (row.status === 'COMPLETED') {
                return res.json({ code: 200, message: "SUCCESS", data: { status: "COMPLETED" } });
            }

            // 3. Add Fish Balance
            // Note: We use COALESCE to handle NULLs safely
            db.run("UPDATE users SET fish_balance = COALESCE(fish_balance, 0) + ? WHERE id = ?", [amount, user_id], function (err) {
                if (err) {
                    console.error(`[GameServer] Deposit Update Error (DB):`, err);
                    return res.status(500).json({ code: 500, message: "Update Failed", error: err.message });
                }

                // 4. Update Transaction Status
                db.run("UPDATE wallet_transactions SET status = 'COMPLETED' WHERE order_id = ?", [order_id], (err) => {
                    if (err) console.error("Failed to update tx status", err);

                    // 5. MEMORY & SOCKET SYNC (Fixing Client UI Lag)
                    // [FIX] Find user's room using roomManager instead of RoomState
                    let userRoom = null;
                    let currentScore = 0;

                    if (roomManager) {
                        for (const [roomId, room] of roomManager.rooms) {
                            if (room.users && room.users[user_id]) {
                                userRoom = room;
                                break;
                            }
                        }
                    }

                    // Update Memory if user is online/loaded
                    if (userRoom && userRoom.users[user_id]) {
                        userRoom.users[user_id].score = (userRoom.users[user_id].score || 0) + amount;
                        currentScore = userRoom.users[user_id].score;
                        console.log(`[Deposit] Updated Memory for ${user_id}. New Score: ${currentScore}`);
                    }

                    // BROADCAST to ALL Sockets (Cross-Port)
                    ioInstances.forEach(ioInst => {
                        ioInst.sockets.sockets.forEach((s) => {
                            if (s.userId === user_id) {
                                console.log(`[Deposit] Pushing update to socket ${s.id}`);
                                if (userRoom && userRoom.users[user_id]) {
                                    // Force refresh seat info including score
                                    s.emit('new_user_comes_push', { ...userRoom.users[user_id], seatIndex: 0 });
                                }
                            }
                        });
                    });

                    res.json({ code: 200, message: "SUCCESS", data: { status: "COMPLETED" } });
                });
            });
        });
    });

    app.post('/api/game/v1/transaction/check', (req, res) => {
        const { order_id } = req.body;
        db.get("SELECT status, amount FROM wallet_transactions WHERE order_id = ?", [order_id], (err, row) => {
            if (err) return res.status(500).json({ code: 500, message: "DB Error" });
            if (!row) return res.status(404).json({ code: 404, message: "Not Found" });
            res.json({ code: 200, data: row });
        });
    });

    // --- GAME WITHDRAW API (Step 3: Game -> Platform) ---
    app.post('/api/game/v1/transaction/withdraw', (req, res) => {
        const { user_id, amount } = req.body;
        console.log(`[GameServer] Withdraw Request - User: ${user_id}, Amount: ${amount}`);

        if (!user_id || !amount || amount <= 0) {
            console.warn(`[GameServer] Withdraw Failed: Invalid Params`);
            return res.status(400).json({ code: 400, message: "Invalid parameters" });
        }

        // Game points are integers, no decimal. Use amount directly.
        const withdrawAmount = parseInt(amount);
        const withdrawAmountDisplay = withdrawAmount;  // Same value for DB (which stores integers for game points)

        // 1. Generate Order ID
        const order_id = `W_${user_id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // 2. Check Balance & Rule (Must keep 500)
        // CRITICAL FIX: Check Memory First to avoid Race Condition
        // [FIX] Find user's room using roomManager instead of RoomState
        let room = null;
        if (roomManager) {
            for (const [roomId, r] of roomManager.rooms) {
                if (r.users && r.users[user_id]) {
                    room = r;
                    break;
                }
            }
        }
        let currentBalance = 0;
        let isOnline = false;

        if (room && room.users[user_id]) {
            // User is ONLINE - Memory is the source of truth
            currentBalance = room.users[user_id].score;
            isOnline = true;
            console.log(`[GameServer] Withdraw (Online) - User: ${user_id}, MemScore: ${currentBalance}`);
        } else {
            // User is OFFLINE - DB is the source of truth
            // We need to query DB synchronously or await it.
            // Since we are in callback hell, let's wrap DB get in a Promise for this flow or nest it.
            // To keep diff small, we will use the existing DB callback structure but modify the flow.
        }

        const minRetainBalance = 500;  // Must keep 500 game points (integer)
        const proceedWithWithdraw = (balance, source) => {
            if (balance < withdrawAmount) {
                console.warn(`[GameServer] Insufficient Balance (${source}): ${balance} < ${withdrawAmount}`);
                return res.status(400).json({ code: 400, message: "Insufficient balance" });
            }
            if (balance - withdrawAmount < minRetainBalance) {
                console.warn(`[GameServer] Rule Violation: Must retain 500. Current: ${balance}, After: ${balance - withdrawAmount}`);
                return res.status(400).json({ code: 400, message: "Must keep at least 500 coins" });
            }

            // 3. Deduct Balance
            if (isOnline) {
                // Deduct from Memory IMMEDIATELY (INT format)
                room.users[user_id].score = safeSub(room.users[user_id].score, toStorageInt(withdrawAmount));
                console.log(`[GameServer] Deducted from Memory. New Score (INT): ${room.users[user_id].score}, Display: ${toDisplayFloat(room.users[user_id].score)}`);

                // Sync to DB (Optimistic) - Convert INT to FLOAT for DB storage
                db.serialize(() => {
                    const dbScore = toDisplayFloat(room.users[user_id].score);
                    db.run("UPDATE users SET fish_balance = ? WHERE id = ?", [dbScore, user_id], (err) => {
                        if (err) console.error("Failed to sync memory deduction to DB:", err);
                        else console.log(`[GameServer] Synced to DB. fish_balance = ${dbScore}`);
                    });
                    // Continue to Transaction Log
                    createTransactionLog();
                });
            } else {
                // Deduct from DB (DB stores FLOAT, withdrawAmount is INT input from user)
                // User enters integer game points, DB stores as float
                db.serialize(() => {
                    db.run("UPDATE users SET fish_balance = fish_balance - ? WHERE id = ?", [withdrawAmount, user_id], (err) => {
                        if (err) return res.status(500).json({ code: 500, message: "Deduct Failed" });
                        console.log(`[GameServer] Deducted ${withdrawAmount} from DB fish_balance`);
                        createTransactionLog();
                    });
                });
            }
        };

        const createTransactionLog = () => {
            const desc = "Settlement from Fish Master";
            db.run(`INSERT INTO wallet_transactions (order_id, user_id, amount, currency, type, description, status, created_at)
                    VALUES (?, ?, ?, 'gold', 'WITHDRAW', ?, 'PENDING_PLATFORM', datetime('now', '+8 hours'))`,
                [order_id, user_id, withdrawAmountDisplay, desc], async (err) => {
                    if (err) {
                        // Rollback logic
                        if (isOnline) {
                            room.users[user_id].score = safeAdd(room.users[user_id].score, toStorageInt(withdrawAmount));
                            const dbScore = toDisplayFloat(room.users[user_id].score);
                            db.run("UPDATE users SET fish_balance = ? WHERE id = ?", [dbScore, user_id]);
                        } else {
                            db.run("UPDATE users SET fish_balance = fish_balance + ? WHERE id = ?", [withdrawAmount, user_id]);
                        }
                        return res.status(500).json({ code: 500, message: "Transaction logging failed" });
                    }

                    // Call Platform...
                    callPlatform();
                });
        };

        const callPlatform = async () => {
            try {
                const platformUrl = 'http://127.0.0.1:3000/api/bridge/transaction/withdraw';
                const payload = {
                    order_id,
                    user_id,
                    amount: withdrawAmountDisplay,  // Platform expects display value
                    timestamp: Date.now()
                };
                const signature = generateSignature(payload);
                const platformRes = await fetch(platformUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-signature': signature,
                        'x-api-key': 'gamezoe-secure-bridge-key'
                    },
                    body: JSON.stringify(payload)
                });
                const platformData = await platformRes.json();
                if (platformRes.ok && ((platformData.code === 200) || (platformData.success === true))) {
                    // Success
                    db.run("UPDATE wallet_transactions SET status = 'COMPLETED' WHERE order_id = ?", [order_id]);

                    // Helper to sync client UI logic (if needed)
                    if (isOnline && room && room.users[user_id]) {
                        // Broadcast new score to client (game points are integers)
                        ioInstances.forEach(ioInst => {
                            ioInst.sockets.sockets.forEach(s => {
                                if (s.userId === user_id) {
                                    s.emit('new_user_comes_push', {
                                        ...room.users[user_id],
                                        score: room.users[user_id].score,
                                        gold: room.users[user_id].gold,
                                        seatIndex: room.users[user_id].seatIndex || 0
                                    });
                                }
                            });
                        });
                    }

                    // Return balance as integer (game points are integers)
                    const finalBalance = isOnline ? room.users[user_id].score : (currentBalance - withdrawAmount);
                    res.json({ code: 200, message: "SUCCESS", data: { order_id, balance: finalBalance } });
                } else {
                    // Fail - Rollback
                    console.warn("Platform Rejected Withdraw");
                    if (isOnline) {
                        room.users[user_id].score = safeAdd(room.users[user_id].score, toStorageInt(withdrawAmount));
                        const dbScore = toDisplayFloat(room.users[user_id].score);
                        db.run("UPDATE users SET fish_balance = ? WHERE id = ?", [dbScore, user_id]);
                    } else {
                        db.run("UPDATE users SET fish_balance = fish_balance + ? WHERE id = ?", [withdrawAmount, user_id]);
                    }

                    db.run("UPDATE wallet_transactions SET status = 'FAILED' WHERE order_id = ?", [order_id]);
                    res.status(400).json({ code: 400, message: platformData.message || "Platform Rejected" });
                }
            } catch (e) {
                console.error("Platform Call Failed", e);
                if (isOnline) {
                    room.users[user_id].score = safeAdd(room.users[user_id].score, toStorageInt(withdrawAmount));
                    const dbScore = toDisplayFloat(room.users[user_id].score);
                    db.run("UPDATE users SET fish_balance = ? WHERE id = ?", [dbScore, user_id]);
                } else {
                    db.run("UPDATE users SET fish_balance = fish_balance + ? WHERE id = ?", [withdrawAmount, user_id]);
                }
                res.status(500).json({ message: "Platform Error" });
            }
        };

        // Execution Start
        // [FIX] Check if room exists AND user is in room
        if (room && room.users && room.users[user_id]) {
            proceedWithWithdraw(room.users[user_id].score, "Memory");
        } else {
            // User not online, query DB
            db.get("SELECT fish_balance FROM users WHERE id = ?", [user_id], (err, row) => {
                if (err) return res.status(500).json({ code: 500, message: "DB Error" });
                if (!row) return res.status(404).json({ code: 404, message: "User not found" });
                // Game points are stored as float in DB, convert to INT for comparison
                // fish_balance stores display value (e.g., 47.92), multiply by 1000 for INT
                const balanceInt = toStorageInt(row.fish_balance || 0);
                proceedWithWithdraw(balanceInt, "DB");
            });
        }
        return; // End of main function body, rest is callbacks
        /*
        db.get("SELECT fish_balance FROM users WHERE id = ?", [user_id], (err, row) => {
             // ... OLD LOGIC REMOVED ...
        }); 
        */

    });


    app.get('/guest', (req, res) => {
        // [FIX] Guest should also try to read DB balance if account is provided
        handleLogin(req, res, 4002);
    });

    // [FIX] Client sends POST for guest login, we must handle it
    app.post('/guest', (req, res) => {
        handleLogin(req, res, 4002);
    });

    function handleLogin(req, res, port) {
        const account = req.query.account || req.body.account || "guest_10086";
        // [GAME_ID_FIX] Read gameId from query parameter (injected by client)
        const gameId = req.query.gameId || req.body.gameId || 'fish';
        console.log(`[HTTP] Login Request: ${account}, GameID: ${gameId}`);

        // [GAME_ID_CACHE] Store user's gameId for socket login to use later
        // This fixes the race condition where socket connects before client patch applies
        userGameIdCache.set(account, { gameId, timestamp: Date.now() });
        console.log(`[GameIdCache] Stored ${account} -> ${gameId}`);

        // [GAME_ID_FIX] Read balance ONLY from the specified gameId
        db.get(`SELECT u.name, u.fish_balance,
                       COALESCE(g.balance, 0) as game_balance
                FROM users u
                LEFT JOIN user_game_balances g ON u.id = g.user_id AND g.game_id = ?
                WHERE u.id = ?`, [gameId, account], (err, row) => {
            let balance = 0;
            let name = null;
            if (err) {
                console.error("[HTTP] Login DB Error:", err);
                res.json(generateUserResponse(account, balance, name));
            } else if (row) {
                name = row.name;

                // [GAME_ID_FIX] Use ONLY the specific game's balance
                const gameBal = row.game_balance || 0;

                if (gameBal > 0) {
                    balance = gameBal * 1000;
                    console.log(`[HTTP] Login: ${account}, GameID: ${gameId}, Balance: ${balance}`);
                    res.json(generateUserResponse(account, balance, name));
                } else {
                    // [LAZY_INIT] Create initial 500 balance for first-time game access
                    const initialBalance = 500;
                    db.run(
                        `INSERT INTO user_game_balances (user_id, game_id, balance, created_at, updated_at) VALUES (?, ?, ?, datetime('now', '+8 hours'), datetime('now', '+8 hours'))`,
                        [account, gameId, initialBalance],
                        (insertErr) => {
                            if (insertErr) {
                                console.error(`[LazyInit] Failed to create balance:`, insertErr.message);
                                balance = 0;
                            } else {
                                console.log(`[LazyInit] Created ${initialBalance} for ${account}/${gameId}`);
                                balance = initialBalance * 1000;
                            }
                            res.json(generateUserResponse(account, balance, name));
                        }
                    );
                    return; // Important: Don't send response twice
                }
            } else {
                console.log(`[HTTP] Login User Not Found in DB: ${account} (Using 0)`);
                res.json(generateUserResponse(account, balance, name));
            }
        });
    }

    // ... (socket)


    app.post('/login', (req, res) => { handleLogin(req, res, port); });
    app.get('/login', (req, res) => { handleLogin(req, res, port); });

    app.get('/get_user_status', (req, res) => { res.json({ errcode: 0, status: 1 }); });
    app.get('/get_message', (req, res) => { res.json({ errcode: 0, data: [], version: 1, msg: "Welcome!" }); });
    app.get('/enter_public_room', (req, res) => {
        const { account, baseParam } = req.query;

        // [REFACTOR] Convert baseParam to baseScore and use dynamic matchmaking
        const baseScore = baseParamToScore(parseInt(baseParam) || 1);

        // Use RoomManager's matchmaking logic (aligned with Go)
        const roomId = roomManager.findOrCreateRoom(baseScore);

        console.log(`[EnterRoom] User ${account} matched to room ${roomId} (baseScore: ${baseScore})`);

        const token = account || "guest_10086";
        const sign = req.query.sign || "mock_sign";
        const time = req.query.time || Date.now();

        // [FIX] Use request hostname (dynamic) or fallback to public domain
        const publicHost = req.hostname === 'localhost' ? 'localhost' : 'gamezoe.com';
        // const publicHost = "35.201.182.136"; // Alternative: Hardcode VM IP

        res.json({
            errcode: 0,
            roomid: roomId,
            roomId: roomId,
            ip: publicHost, // [FIX] Return logical host, Nginx will proxy /socket.io to localhost:9000
            port: 443,      // [FIX] Tell client to connect via HTTPS/WSS default port
            // Client likely constructs url: ws://ip:port/socket.io
            // We want: wss://gamezoe.com/socket.io

            // NOTE: If client appends port, we might need to trick it.
            // If Client uses: ws://${ip}:${port}
            // We want: wss://gamezoe.com
            // So ip="gamezoe.com", port="" (if parsed as string) or 443

            token: token,
            sign: sign,
            time: time
        });
    });

    // -------------------------------------------------------------------------
    // REAL-TIME BALANCE API (For Platform Sync)
    // -------------------------------------------------------------------------
    // Platform calls this to get user's REAL-TIME balance from room memory
    // This solves the "balance not syncing during gameplay" problem
    app.get('/api/room/balance', (req, res) => {
        const userId = req.query.userId;
        const gameId = req.query.gameId || 'fish';

        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId required' });
        }

        // Search for user in all rooms
        let userRoom = null;
        let userScore = null;
        let roomId = null;

        if (roomManager) {
            for (const [rId, room] of roomManager.rooms) {
                if (room.users && room.users[userId]) {
                    userRoom = room;
                    userScore = room.users[userId].score;
                    roomId = rId;
                    break;
                }
            }
        }

        if (userRoom && userScore !== null) {
            // User is in a room - return real-time balance from memory
            const displayBalance = toDisplayFloat(userScore);
            console.log(`[RoomBalance] User ${userId} in room ${roomId}, memory score: ${userScore} (display: ${displayBalance})`);

            res.json({
                success: true,
                source: 'memory',
                userId: userId,
                gameId: gameId,
                balance: displayBalance,
                roomId: roomId,
                inRoom: true
            });
        } else {
            // User not in any room - return from DB
            db.get(
                `SELECT balance FROM user_game_balances WHERE user_id = ? AND game_id = ?`,
                [userId, gameId],
                (err, row) => {
                    if (err) {
                        console.error(`[RoomBalance] DB Error:`, err);
                        return res.status(500).json({ success: false, error: 'DB Error' });
                    }

                    const dbBalance = row ? row.balance : 0;
                    console.log(`[RoomBalance] User ${userId} not in room, DB balance: ${dbBalance}`);

                    res.json({
                        success: true,
                        source: 'database',
                        userId: userId,
                        gameId: gameId,
                        balance: dbBalance,
                        inRoom: false
                    });
                }
            );
        }
    });

    // -------------------------------------------------------------------------
    // SOCKET.IO EVENTS
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // SQLITE MIGRATION (DB ACCESS)
    // -------------------------------------------------------------------------

    // Use standard import (already imported at top)
    const sqlite3Verbose = sqlite3.verbose();
    const dbPath = path.join(__dirname, 'gamezoe.db');
    // --- PRECISION HELPER FUNCTIONS ---
    // Use integer arithmetic for all balance operations to prevent floating-point drift.
    // SCALE = 1000 means 1.000 coin is stored as 1000 integers.
    const BALANCE_SCALE = 1000;

    // Convert display float (e.g., 10.500) to storage integer (10500)
    function toStorageInt(value) {
        if (value === undefined || value === null || isNaN(value)) return 0;
        // Use Math.round to handle floating point inputs like 10.4999999
        return Math.round(Number(value) * BALANCE_SCALE);
    }

    // Convert storage integer (10500) to display float (10.5)
    // Used when sending data to client or saving to legacy DB format
    function toDisplayFloat(intValue) {
        if (intValue === undefined || intValue === null || isNaN(intValue)) return 0;
        return Math.floor(Number(intValue)) / BALANCE_SCALE;
    }

    // Safe addition for integers
    function safeAdd(a, b) {
        return Math.round(a + b);
    }

    // Safe subtraction for integers
    function safeSub(a, b) {
        return Math.round(a - b);
    }

    // Ensure database table exists
    const DB_PATH = path.join(__dirname, 'gamezoe.db');
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) console.error('[DB] Fish Mock Server failed to connect to DB', err);
        else console.log('[DB] Fish Mock Server connected to SQLite');
    });

    // Helper to save user score to DB
    // [ARCH FIX] ONLY update fish_balance (Game Points). NEVER touch gold_balance (Platform Coins) here.
    // [GAME_ID_FIX] Now accepts gameId parameter to save to specific game only
    function saveUserToDB(userId, score, gameId = 'fish') {
        if (!userId || userId === 'guest') return;

        // Convert integer balance back to float for DB storage
        const balanceToSave = toDisplayFloat(score);

        // [CRITICAL] Only update fish_balance.
        // gold_balance is Platform Coin and should ONLY change via explicit Deposit/Withdraw.
        db.run("UPDATE users SET fish_balance = ? WHERE id = ?", [balanceToSave, userId], (err) => {
            if (err) console.error(`[DB] Failed to save score for ${userId}:`, err);
        });

        // [GAME_ID_FIX] Update ONLY the specific game's balance in user_game_balances
        db.run(`INSERT INTO user_game_balances (user_id, game_id, balance, created_at, updated_at)
                VALUES (?, ?, ?, datetime('now', '+8 hours'), datetime('now', '+8 hours'))
                ON CONFLICT(user_id, game_id) DO UPDATE SET
                balance = excluded.balance,
                updated_at = datetime('now', '+8 hours')`,
            [userId, gameId, balanceToSave], (err) => {
                if (err) console.error(`[DB] Failed to sync ${gameId} for ${userId}:`, err);
                else console.log(`[DB] Saved ${userId}'s ${gameId} balance: ${balanceToSave}`);
            });
    }

    // -------------------------------------------------------------------------
    // SOCKET.IO CONNECTION HANDLER
    // -------------------------------------------------------------------------
    // [REFACTOR] RoomManager is now global, shared across all ports


    io.on('connection', (socket) => {
        console.log(`[Port ${port} Socket] Connected: ${socket.id}`);

        // [DEBUG] Trace ALL incoming events to diagnose "Unkillable Fish"
        // If client sends 'catch_fish', it MUST show up here.
        socket.onAny((eventName, ...args) => {
            // Filter out noisy heartbeat if applicable (though socket.io usually uses engine.io for that)
            // We want to see EVERYTHING for now.
            console.log(`[SOCKET_TRACE] Event: '${eventName}' from ${socket.id}`, args);
        });

        // Removed nested invalid sqlite setup

        // ... (socket connection)

        // Random Room ID for this session (Mimic dynamic table)
        // [FIX] REVERT TO 1. "888888" caused undefined RoomConfig lookup -> NaN Errors
        const MOCK_ROOM_ID = 1;

        // [FIX] VIP to CannonKind Mapping (Source: Go code)
        // Each VIP level has 3 cannons: base, base+1, base+2
        // VIP 0: 1,2,3  VIP 1: 4,5,6  VIP 2: 7,8,9  etc.
        // VIP 7 uses same cannons as VIP 6 (19,20,21) - laser (22) is special weapon
        const VIP_TO_CANNON = {
            0: 1, 1: 4, 2: 7, 3: 10, 4: 13, 5: 16, 6: 19, 7: 19
        };

        // --- LOGIN ---
        socket.on('login', (data) => {
            console.log(`[DEBUG] Login Payload Raw:`, data);
            const reqData = parsePayload(data);

            // Robust ID detection: Check id, userId, account, then token
            let userId = reqData.id || reqData.userId || reqData.account || reqData.token || "guest";

            // [CRITICAL] Ensure userId matches Platform ID format if possible (String)
            // This is vital for the client to match "My User ID" with "Seat User ID"
            userId = String(userId);

            // [GAME_ID_FIX] Get gameId from multiple sources (priority order):
            // 1. Cache from HTTP login (most reliable - fixes socket race condition)
            // 2. Socket handshake query (if client patch applied in time)
            // 3. Login event payload
            // 4. Default to 'fish'
            let gameId = 'fish';
            const cachedGameId = userGameIdCache.get(userId);
            if (cachedGameId && (Date.now() - cachedGameId.timestamp < 300000)) { // 5 min cache
                gameId = cachedGameId.gameId;
                console.log(`[GameIdCache] Using cached gameId for ${userId}: ${gameId}`);
            } else if (socket.handshake?.query?.gameId) {
                gameId = socket.handshake.query.gameId;
                console.log(`[GameIdCache] Using socket query gameId: ${gameId}`);
            } else if (reqData.gameId) {
                gameId = reqData.gameId;
                console.log(`[GameIdCache] Using reqData gameId: ${gameId}`);
            } else {
                console.log(`[GameIdCache] No gameId found, using default: ${gameId}`);
            }
            socket.gameId = gameId; // Store for later use (e.g., saveUserToDB)
            console.log(`[DEBUG] Login Parsed UserID: ${userId}, GameID: ${gameId}`);

            // [GO_STRICT_MODE] Like Go server: One Socket = One Room
            // Go code sets client.Room once and never changes it
            // Second login attempt = ERROR (client must disconnect and reconnect)
            if (socket.currentRoomId !== undefined && socket.currentRoomId !== null) {
                const requestedRoomId = parseInt(reqData.roomId) || null;
                if (socket.currentRoomId !== requestedRoomId) {
                    console.error(`[LOGIN_REJECT] Socket ${socket.id} already in room ${socket.currentRoomId}. Cannot switch to ${requestedRoomId}. Must disconnect first.`);
                    socket.emit('login_result', {
                        errcode: 403,
                        errmsg: 'Already logged into a room. Please disconnect and reconnect to switch rooms.'
                    });
                    return;
                }
                // Same room re-login (reconnect scenario) - allow it
                console.log(`[LOGIN] Re-login to same room ${socket.currentRoomId} allowed`);
            }

            // [MULTI-ROOM FIX] Extract roomId from login payload
            const requestedRoomId = parseInt(reqData.roomId) || null;

            // [REFACTOR] Validate that roomId exists in RoomManager
            let validRoomId = requestedRoomId;
            if (!validRoomId || !roomManager.getRoom(validRoomId)) {
                console.warn(`[LOGIN] Invalid roomId ${requestedRoomId}, cannot proceed without valid room`);
                // This shouldn't happen if enter_public_room works correctly
                // But as fallback, create a default room
                validRoomId = roomManager.findOrCreateRoom(0.001);
            }

            socket.userId = userId;

            // [KICK_OLD_SESSION] Find and disconnect any existing socket for this userId
            // This prevents "ghost" connections from receiving broadcasts from old rooms
            // [FIX] Only kick if the old socket is in a DIFFERENT room (same user switching rooms)
            // Don't kick if joining the same room (reconnect scenario)
            ioInstances.forEach(ioInst => {
                ioInst.sockets.sockets.forEach((existingSocket) => {
                    // Skip if same socket or different user
                    if (existingSocket.id === socket.id || existingSocket.userId !== userId) {
                        return;
                    }

                    // [FIX] Only kick if old socket is in a DIFFERENT room
                    // If same room, it's a reconnect - don't kick
                    if (existingSocket.currentRoomId && existingSocket.currentRoomId !== validRoomId) {
                        console.log(`[KICK] User ${userId} switching rooms: ${existingSocket.currentRoomId} -> ${validRoomId}`);

                        const oldRoomName = 'room_' + existingSocket.currentRoomId;
                        existingSocket.leave(oldRoomName);

                        // Clean up user from old room
                        const oldRoom = roomManager.getRoom(existingSocket.currentRoomId);
                        if (oldRoom && oldRoom.users[userId]) {
                            saveUserToDB(userId, oldRoom.users[userId].score, existingSocket.gameId || oldRoom.users[userId].gameId);
                            delete oldRoom.users[userId];
                            console.log(`[KICK] Removed user ${userId} from old room ${existingSocket.currentRoomId}`);
                            ioInst.in(oldRoomName).emit('exit_notify_push', userId);
                        }

                        roomManager.checkAndDeleteEmptyRoom(existingSocket.currentRoomId);

                        existingSocket.emit('kick_notify', { reason: 'Switched to another room' });
                        existingSocket.disconnect(true);
                        console.log(`[KICK] Disconnected old socket ${existingSocket.id}`);
                    } else if (existingSocket.currentRoomId === validRoomId) {
                        // Same room reconnect - just log, don't kick
                        console.log(`[RECONNECT] User ${userId} reconnecting to same room ${validRoomId}, keeping old socket`);
                    }
                });
            });

            socket.currentRoomId = validRoomId;
            console.log(`[LOGIN] User ${userId} joining room ${validRoomId}`);

            // [CRITICAL] Socket Join Room for Scoped Broadcasts
            const roomName = `room_${validRoomId}`;
            socket.join(roomName);
            // [DIAGNOSTIC] Log socket's rooms after joining
            console.log(`[SOCKET_ROOMS] After join, socket ${socket.id} is in rooms:`, Array.from(socket.rooms));
            console.log(`[LOGIN] Socket ${socket.id} joined ${roomName}`);

            ;

            const room = roomManager.getRoom(validRoomId); // [REFACTOR] Use RoomManager

            const finalizeLogin = (dbUser) => {
                const name = dbUser ? dbUser.name : ("Hunter_" + userId.substring(0, 5));

                //  [FIX] Synchronize Game Room Currency with Lobby
                // Lobby uses 'balance' for coins/money/gems.
                // fish_balance from DB is already scaled by 1000
                console.log(`[DEBUG] dbUser:`, dbUser);  // Debug
                let currentBalance = toStorageInt(20030); // Default fallback, stored as INT
                let currentGold = toStorageInt(20030); // Default fallback, stored as INT

                if (dbUser && dbUser.fish_balance !== undefined) {
                    // [BALANCE FIX] fish_balance now stores game score directly
                    // Backward compatibility: if value < 1000000 (1M), it's old format (元), multiply by 1000
                    // [PRECISION FIX] Load float from DB and convert to integer for memory
                    currentBalance = toStorageInt(dbUser.fish_balance);
                    currentGold = toStorageInt(dbUser.gold_balance || dbUser.fish_balance); // Use gold_balance if available, else fish_balance
                    console.log(`[DEBUG] Using DB fish_balance: ${dbUser.fish_balance} -> currentBalance(Int): ${currentBalance}`);
                    console.log(`[DEBUG] Using DB gold_balance: ${dbUser.gold_balance} -> currentGold(Int): ${currentGold}`);
                } else {
                    console.log(`[DEBUG] Using default balance: ${toDisplayFloat(currentBalance)}, dbUser:`, dbUser);
                }

                // [BALANCE_SYNC_FIX] Only overwrite if user NOT already in room (prevent D→C→B→D overwrite)
                if (room.users[socket.userId]) {
                    // User already exists in memory 
                    // [SEAT_FIX] Ensure they have a valid seat. If they were marked -1 (offline/error), re-assign.
                    if (room.users[socket.userId].seatIndex === -1) {
                        const occupiedSeats = new Set(Object.values(room.users).map(u => u.seatIndex));
                        for (let i = 0; i < 4; i++) {
                            if (!occupiedSeats.has(i)) {
                                room.users[socket.userId].seatIndex = i;
                                break;
                            }
                        }
                        console.log(`[SEAT_FIX] Re-assigned seat for existing user ${socket.userId} -> ${room.users[socket.userId].seatIndex}`);
                    }
                    console.log(`[BALANCE_SYNC] User ${socket.userId} already in room. Keeping memory score: ${toDisplayFloat(room.users[socket.userId].score)}`);
                } else {
                    // First time login, create user from DB
                    console.log(`[BALANCE_SYNC] User ${socket.userId} first login. Loading from DB: ${toDisplayFloat(currentBalance)}`);
                    // Find a free seat index
                    let freeIdx = -1;
                    const occupiedSeats = new Set(Object.values(room.users).map(u => u.seatIndex));
                    for (let i = 0; i < 4; i++) {
                        if (!occupiedSeats.has(i)) {
                            freeIdx = i;
                            break;
                        }
                    }

                    if (freeIdx === -1) {
                        console.warn(`[LOGIN_ERROR] Room is full! User ${socket.userId} gets seat -1`);
                        // Ideally reject login, but for now let them spectate?
                    }

                    // [ARCH FIX] Read gold_balance separately and NEVER sync it with game score automatically
                    const currentGold = dbUser ? toStorageInt(dbUser.gold_balance || 0) : 0;

                    // [FIX] Calculate VIP first to set correct initial cannonKind
                    const initialVip = calculateVip(currentBalance || 0);
                    const initialCannonKind = VIP_TO_CANNON[initialVip] || 1;

                    room.users[socket.userId] = {
                        userId: userId, // Ensure userId is set here
                        gameId: gameId, // [GAME_ID_FIX] Store gameId for periodic saves
                        score: currentBalance, // Game Points (INT)
                        gold: currentGold,     // Platform Coin (INT) - Read Only in Game
                        seatIndex: freeIdx,    // [FIXED] Use Calculated Seat Index!
                        name: dbUser ? dbUser.name : ("Hunter_" + socket.userId.substr(0, 5)),
                        online: true,
                        cannonKind: initialCannonKind, // [FIX] Set correct cannon based on VIP
                        vip: initialVip, // [FIX] Set correct VIP on creation
                        recharge_total: currentBalance || 0, // [FIX] Sync recharge_total
                        power: 0,
                        bullet: 0
                    };
                    console.log(`[BALANCE_SYNC] User ${socket.userId} login. GameID: ${gameId}, Seat: ${freeIdx}, VIP: ${initialVip}, Cannon: ${initialCannonKind}`);
                }

                // [VIP_FIX] Calculate VIP based on mock recharge (Simple Logic)
                const user = room.users[socket.userId];

                // [VIP_SYNC] If recharge_total is missing/low but user has high balance (e.g. from DB), 
                // sync recharge_total to balance to ensure they get the correct VIP.
                const potentialVip = calculateVip(user.score || 0);
                const currentVip = calculateVip(user.recharge_total || 0);

                if (potentialVip > currentVip) {
                    console.log(`[VIP_SYNC] Syncing recharge_total to score for User ${socket.userId}. Score: ${user.score}`);
                    user.recharge_total = user.score;
                }

                // Recalculate based on current total
                user.vip = calculateVip(user.recharge_total || 0);

                const userVip = user.vip;
                const correctCannonKind = VIP_TO_CANNON[userVip] || 1; // Default to basic cannon if VIP 0

                console.log(`[DEBUG] Login Finalize. User: ${userId}, Score: ${toDisplayFloat(room.users[userId].score)}, Gold: ${toDisplayFloat(room.users[userId].gold)}, Name: ${name}`);

                // [BALANCE_SYNC_FIX] User already created above, just use it
                const mySeat = room.users[userId];
                const TARGET_SEAT_INDEX = mySeat.seatIndex;

                // [FIX] SHOTGUN APPROACH: Send both Casing styles to satisfy Client
                const mySeatPayload = {
                    ...mySeat,
                    userId: userId, userid: userId,          // Both
                    seatIndex: TARGET_SEAT_INDEX, seatindex: TARGET_SEAT_INDEX, // Both
                    cannonKind: correctCannonKind,
                    vip: userVip,
                    // [FIX] Add Cannon Power/Multiplier Properties
                    power: 1,    // [FIX] Power Level (1-10)
                    multiplier: 1, // [FIX] Multiplier
                    cannonPower: 1,
                    bullet: 1,   // [FIX] Bullet Level (for UI display)
                    score: toDisplayFloat(mySeat.score), // Game Points -> FLOAT
                    gold: toDisplayFloat(mySeat.gold)    // Platform Coin -> FLOAT
                };

                const emptySeat = { userid: 0, userId: "0", score: 0, name: "", online: false, cannonKind: 1, vip: 0, seatIndex: -1, seatindex: -1, power: 0, bullet: 0 };

                // Construct Seats Array (Shotgun)
                // [PRECISION FIX] Send FLOAT to client
                const seatList = [];
                for (let i = 0; i < 4; i++) {
                    let seatUser = { ...emptySeat, seatIndex: i, seatindex: i };
                    // Find if any user is at this seat
                    for (let uid in room.users) {
                        if (room.users[uid].seatIndex === i) {
                            const u = room.users[uid];
                            seatUser = {
                                ...u,
                                score: toDisplayFloat(u.score), // INT -> FLOAT for client
                                gold: toDisplayFloat(u.gold),   // INT -> FLOAT for client
                                userId: u.userId, userid: u.userId,
                                seatIndex: u.seatIndex, seatindex: u.seatIndex
                            };
                            break;
                        }
                    }
                    seatList.push(seatUser);
                }

                // [FIX] Login Result Object (Not String) + Shotgun Casing
                const loginResultPayload = {
                    errcode: 0,
                    data: {
                        roomId: String(validRoomId),  // [CRITICAL FIX] Use validRoomId, not requestedRoomId
                        roomID: String(validRoomId),
                        RoomId: String(validRoomId),
                        id: String(validRoomId),
                        // [FIX] Dynamic RoomBaseScore for ALL Rooms
                        // Client: t = Math.round(1e3 * t), Server returns INTEGER
                        roomBaseScore: room.baseScore * 1000,  // [REFACTOR] Use room's actual baseScore
                        conf: {
                            type: "default",
                            maxGames: 9999,
                            // [CANONICAL] Send Room Base Score (e.g. 0.001)
                            gamebasescore: room.baseScore,  // [REFACTOR] Use room's actual baseScore
                            roomId: String(validRoomId)  // [CRITICAL FIX] Use validRoomId
                        },
                        seats: seatList,
                        // Shotgun Root Level just in case
                        seatindex: TARGET_SEAT_INDEX,
                        seatIndex: TARGET_SEAT_INDEX,
                        userid: userId,
                        userId: userId
                    }
                };

                console.log('[ServerFix] COMPLETE login_result payload:', JSON.stringify(loginResultPayload, null, 2));
                socket.emit('login_result', loginResultPayload);

                socket.emit('login_finished', { errcode: 0 });

                // [FIX] MOVED SYNC TO 'ready' EVENT
                // But keep 'new_user_comes_push' for notifying others (or self if instant)
                // Client might rely on 'new_user_comes_push' OR 'game_sync_push'
                setTimeout(() => {
                    socket.emit('new_user_comes_push', mySeatPayload);

                    // [BROADCAST FIX] Notify OTHER players in the room that a new user joined
                    socket.broadcast.to('room_' + validRoomId).emit('new_user_comes_push', mySeatPayload);
                    console.log(`[BROADCAST] Notified other players in room_${validRoomId} about new user ${userId}`);

                    // [SYNC FIX] Send existing users' info to the new player
                    // This ensures new player sees existing players' cannons and state
                    Object.values(room.users).forEach(existingUser => {
                        if (existingUser.userId !== userId) {
                            const existingUserPayload = {
                                ...existingUser,
                                userId: existingUser.userId, userid: existingUser.userId,
                                seatIndex: existingUser.seatIndex, seatindex: existingUser.seatIndex,
                                score: toDisplayFloat(existingUser.score),
                                gold: toDisplayFloat(existingUser.gold)
                            };
                            socket.emit('new_user_comes_push', existingUserPayload);
                            console.log(`[SYNC] Sent existing user ${existingUser.userId} info to new user ${userId}`);
                        }
                    });

                    // [SYNC FIX] Send existing fish to the new user!
                    // Otherwise client generates random fish or sees nothing while server has different fish.
                    const existingFishList = [];
                    if (room.aliveFish) {
                        Object.values(room.aliveFish).forEach(f => {
                            // Must verify if fish is still valid/active
                            if (Date.now() - f.activeTime < 120000) {
                                existingFishList.push(f);
                            }
                        });
                    }
                    if (existingFishList.length > 0) {
                        console.log(`[SYNC] Sending ${existingFishList.length} existing fish to new user ${userId}`);
                        socket.emit('build_fish_reply', existingFishList);
                    }

                }, 500);

                // [REFACTOR] Spawn timers now managed by RoomManager on room creation
                // No need to call startFishLoop here
            };

            // [GAME_ID_FIX] Query DB - Read balance ONLY from the specified gameId
            if (userId !== 'guest') {
                db.get(`SELECT u.name, u.gold_balance,
                               COALESCE(g.balance, 0) as game_balance
                        FROM users u
                        LEFT JOIN user_game_balances g ON u.id = g.user_id AND g.game_id = ?
                        WHERE u.id = ?`, [gameId, userId], (err, row) => {
                    if (err) console.error("Login DB Error", err);

                    // [GAME_ID_FIX] Use ONLY the specific game's balance
                    if (row) {
                        row.fish_balance = row.game_balance || 0;
                        console.log(`[Socket Login] ${userId}: GameID: ${gameId}, Balance: ${row.fish_balance}`);
                    }
                    finalizeLogin(row);
                });
            } else {
                finalizeLogin(null);
            }
        });

        // --- READY & GAME SYNC ---
        // [FIX] Handle 'ready' event to send Game Sync.
        socket.on('ready', () => {
            console.log(`[DEBUG] Client Ready: ${socket.userId}`);
            const room = roomManager.getRoom(socket.currentRoomId);  // [REFACTOR] Use roomManager

            // [REFACTOR] Spawn timers now managed by RoomManager, started on room creation
            // No need for fishSpawnStarted flag or startFishLoop call

            if (!socket.userId || !room || !room.users[socket.userId]) return;

            const u = room.users[socket.userId];
            const mySeatPayload = {
                ...u,
                userId: u.userId, userid: u.userId,
                seatIndex: u.seatIndex, seatindex: u.seatIndex,
                score: toDisplayFloat(u.score), // INT -> FLOAT
                gold: toDisplayFloat(u.gold) // INT -> FLOAT
            };

            // Construct Seats Shotgun
            const emptySeat = { userid: 0, userId: "0", score: 0, name: "", online: false, cannonKind: 1, vip: 0, seatIndex: -1, seatindex: -1 };
            const seatList = [
                { ...emptySeat, seatIndex: 0, seatindex: 0 },
                { ...emptySeat, seatIndex: 1, seatindex: 1 },
                { ...emptySeat, seatIndex: 2, seatindex: 2 },
                { ...emptySeat, seatIndex: 3, seatindex: 3 }
            ];
            // Fill existing users
            for (let uid in room.users) {
                const user = room.users[uid];
                if (user.seatIndex >= 0 && user.seatIndex < 4) {
                    seatList[user.seatIndex] = {
                        ...user,
                        score: toDisplayFloat(user.score), // INT -> FLOAT
                        gold: toDisplayFloat(user.gold),   // INT -> FLOAT
                        userId: user.userId, userid: user.userId,
                        seatIndex: user.seatIndex, seatindex: user.seatIndex
                    };
                }
            }

            socket.emit('game_sync_push', {
                state: 0,
                gamestate: 0,
                time_remaining: 9999,
                seats: seatList,
                conf: {
                    gamebasescore: room.baseScore,  // [REFACTOR] Use room's actual baseScore
                    roomId: String(socket.currentRoomId)
                },
                // [CRITICAL FIX] Client's game_sync handler expects roomBaseScore to calculate sceneMulti
                roomBaseScore: room.baseScore * 1000
            });
        });


        // --- HEARTBEAT (Fix Timeout) ---
        socket.on('game_ping', () => {
            // console.log(`[PING] Responding to ${socket.id}`);
            socket.emit('game_pong');
        });


        // --- HEARTBEAT (Fix Timeout) ---
        socket.on('game_ping', () => {
            // console.log(`[PING] Responding to ${socket.id}`);
            socket.emit('game_pong');
        });

        // --- WALLET: CHARGE (DEPOSIT) [SECURE] ---
        // Deduct Gold from DB -> Add Score
        socket.on('charge', (data) => {
            console.log(`[DEBUG] Charge Request for Socket ${socket.id}. UserID: ${socket.userId}`);
            const reqData = parsePayload(data);
            const amountGold = parseInt(reqData.amount); // Input is GOLD (float from client)
            const amountScore = toStorageInt(amountGold);       // Convert to SCALED SCORE (integer)

            console.log(`[DEBUG] Charge Gold: ${amountGold} -> Score: ${toDisplayFloat(amountScore)} (Int: ${amountScore})`);

            if (!amountGold || amountGold <= 0) return;
            if (!socket.userId) return;

            const room = getRoom();
            const user = room.users[socket.userId];
            if (!user) return;

            // 1. Atomically Check & Deduct Gold in DB
            // [PRECISION FIX] Convert amountGold to float for DB comparison
            db.run("UPDATE users SET gold_balance = gold_balance - ? WHERE id = ? AND gold_balance >= ?", [toDisplayFloat(amountGold), socket.userId, toDisplayFloat(amountGold)], function (err) {
                if (err) {
                    console.error(`[Charge] DB Error for ${socket.userId}:`, err);
                    return;
                }

                if (this.changes > 0) {
                    // 2. Success: Add Memory Score (Game Points)
                    user.score = safeAdd(user.score, amountScore);
                    // [ARCH FIX] Do NOT add to user.gold here. user.gold is a cached view of Platform Coin.
                    // Ideally, we should fetch fresh gold_balance, but for now we just don't touch it to avoid confusion/double counting.
                    // Or, since we just deducted from DB, we should update the cached view:
                    user.gold = safeSub(user.gold, toStorageInt(amountGold));

                    // [VIP_FIX] Accumulate Recharge
                    user.recharge_total = (user.recharge_total || 0) + amountGold; // Use Gold amount
                    // Update VIP immediately
                    const newVip = calculateVip(user.recharge_total);
                    if (newVip > user.vip) {
                        user.vip = newVip;
                        console.log(`[VIP] User ${socket.userId} upgraded to VIP ${newVip}! TotalRecharge: ${user.recharge_total}`);
                    }

                    // 4. Log Transaction
                    const desc = `換碼(入金) - Fish Master`;
                    db.run("INSERT INTO wallet_transactions (user_id, amount, currency, type, description, created_at) VALUES (?, ?, 'gold', 'transfer_out', ?, datetime('now', '+8 hours'))",
                        [socket.userId, -toDisplayFloat(amountGold), desc], (err) => {
                            if (err) console.error("Failed to log charge transaction", err);
                        });

                    console.log(`[Charge] Success! Deducted ${toDisplayFloat(amountGold)} Gold, Added ${toDisplayFloat(amountScore)} Score.`);

                    // [FIX] Send success reply to update client UI
                    socket.emit('charge_reply', {
                        success: true,
                        gold: toDisplayFloat(user.gold),
                        score: toDisplayFloat(user.score),
                        msg: "Success"
                    });

                    // [FIX] Also broadcast updated user info to sync UI
                    socket.emit('new_user_comes_push', {
                        odis: socket.odis || 0,
                        odis_sum: socket.odis_sum || 0,
                        seatIndex: user.seatIndex || 0,
                        odisStatus: 0,
                        odisKind: 0,
                        userId: socket.userId,
                        name: user.name,
                        headimg: user.headimg || 1,
                        score: toDisplayFloat(user.score),
                        gold: toDisplayFloat(user.gold),
                        lv: user.lv || 1,
                        vip: user.vip || 0,
                        sex: user.sex || 1
                    });

                } else {
                    console.warn(`[Charge] Failed. Insufficient Gold.`);
                    socket.emit('charge_reply', { success: false, msg: "Insufficient Gold" });
                }
            });
        });

        socket.on('user_fire', (data) => {
            console.log(`[FIRE_HANDLER_REACHED] Socket ${socket.id} (User: ${socket.userId}) triggered 'user_fire'`);

            const reqData = parsePayload(data);
            const room = roomManager.getRoom(socket.currentRoomId);  // [REFACTOR] Use roomManager

            // [FIX] Defensive check - room must exist
            if (!room) {
                console.error(`[FIRE ERROR] Room ${socket.currentRoomId} not found for user ${socket.userId}`);
                return;
            }

            const bulletKind = parseInt(reqData.bulletKind) || 1;

            // [LASER_BUG_FIX] 防止客户端在冷却期间发送kind=22的普通子弹
            if (bulletKind === 22) {
                const user = room.users?.[socket.userId];
                const now = Date.now();
                const lastLaserTime = user?.lastLaserTime || 0;
                const cooldownRemaining = Math.max(0, 30000 - (now - lastLaserTime));

                if (cooldownRemaining > 0) {
                    console.warn(`[LASER_REJECT] User ${socket.userId} tried to fire laser during cooldown! Remaining: ${Math.ceil(cooldownRemaining / 1000)}s`);
                    return; // 拒绝非法请求
                }
            }

            // [FIX] Force Server-Side UserId (Don't Trust Client)
            // Ensures all broadcasts carry correct user identity
            reqData.userId = socket.userId;
            if (socket.userId && room.users[socket.userId]) {
                // [CRITICAL FIX] CLIENT expects chairId starting from 1, SERVER uses 0-indexed seatIndex
                reqData.chairId = room.users[socket.userId].seatIndex + 1;

                // [LASER_BUG_FIX] Update Cannon Kind in Memory (但不允许雷射炮)
                // kind=22(雷射炮)不是普通可切换炮种，不应存入cannonKind
                if (bulletKind !== 22) {
                    room.users[socket.userId].cannonKind = bulletKind;
                    console.log(`[CANNON_SWITCH] User ${socket.userId} switched to kind ${bulletKind}`);
                } else {
                    console.log(`[LASER_DETECTED] User ${socket.userId} firing laser cannon (kind=22)`);
                }
            }

            // Deduct Cost
            // [CRITICAL FIX] Use room.baseScore directly, not RoomConfig map!
            // Dynamically created rooms (1000+) don't exist in RoomConfig{1,2,3,4}
            // room already declared at line 974
            const rScore = Number(room?.baseScore || 0.001);
            const bMulti = Number(BulletMulti[reqData.bulletKind]) || 1;

            if (isNaN(rScore) || rScore <= 0) {
                console.error(`[FIRE ERROR] Invalid BaseScore for Room ${socket.currentRoomId}:`, rScore);
                return;
            }

            // bulletKind already declared at line 814

            // [CANONICAL] Laser cannon special handling (GO: client.go:237-244)
            if (bulletKind === 22) {
                // [FIX] Check power requirement
                if (!room.users[socket.userId] || (room.users[socket.userId].power || 0) < 1) {
                    console.log(`[LASER] User ${socket.userId} tried to fire laser without full power: ${room.users[socket.userId]?.power}`);
                    return;
                }

                if (room.users[socket.userId]) {
                    room.users[socket.userId].power = 0;  // Reset power
                    room.users[socket.userId].lastLaserTime = Date.now();  // 记录发射时间
                    console.log(`[LASER] User ${socket.userId} fired laser cannon, power reset, cooldown started`);
                }
                reqData.chairId = (room.users[socket.userId]?.seatIndex || 0) + 1;
                reqData.userId = socket.userId;
                // [FIX] Use room prefix for laser broadcast
                socket.broadcast.to('room_' + socket.currentRoomId).emit('user_fire_Reply', reqData);
                return;  // Don't deduct score, don't add to aliveBullets
            }

            console.log(`[FIRE DEBUG] User:${socket.userId} Kind:${bulletKind} Multi:${bMulti} Base:${rScore} Cost:${toDisplayFloat(toStorageInt(bMulti * rScore))} OldScore:${toDisplayFloat(room.users[socket.userId]?.score)}`);

            // Deduct Cost
            if (room.users[socket.userId]) {
                // [PRECISION FIX] Calculate cost as INT
                const costInt = toStorageInt(bMulti * rScore);
                room.users[socket.userId].score = safeSub(room.users[socket.userId].score, costInt);

                // [ARCH FIX] NEVER touch room.users[socket.userId].gold (Platform Coin) here!
                // Game logic only affects 'score' (Game Points).

                // [CANONICAL] Bill uses INT too
                room.users[socket.userId].bill = room.users[socket.userId].bill || 0;
                room.users[socket.userId].bill = safeSub(room.users[socket.userId].bill, costInt);

                // [CANONICAL] Power accumulation (GO: client.go:251-254)
                const addPower = bMulti / 3000;
                room.users[socket.userId].power = room.users[socket.userId].power || 0;
                if (room.users[socket.userId].power < 1) {
                    room.users[socket.userId].power += addPower;
                }

                console.log(`[FIRE DEBUG] NewScore(Int):${room.users[socket.userId].score}`);
            }

            // Store Bullet (防御性检查：kind=22不应创建普通子弹)
            if (bulletKind === 22) {
                console.error(`[DEFENSIVE_ERROR] Attempted to create regular bullet with kind=22! This should never happen!`);
                return;  // 防御性拒绝
            }

            reqData.chairId = (room.users[socket.userId]?.seatIndex || 0) + 1; // [FIX] CLIENT expects chairId 1-indexed
            reqData.userId = socket.userId;            // Store Bullet
            const bulletId = reqData.bulletId; // Assuming bulletId is in reqData
            const cannonType = reqData.cannonType || 1; // Assuming cannonType is in reqData, default to 1
            // [CRITICAL FIX] Store ACTUAL bullet cost, not base score
            // If bulletMulti=10000, baseScore=0.001, cost should be 10, not 0.001!
            const bulletCost = rScore * bMulti; // e.g., 0.001 * 10000 = 10

            room.aliveBullets[bulletId] = {
                bulletId: bulletId,
                userId: socket.userId,
                cannonType: cannonType,
                bulletKind: bulletKind,
                bMulti: bMulti,
                score: bulletCost, // [FIX] Store actual cost, not base!
                chairId: (room.users[socket.userId]?.seatIndex || 0) + 1, // [FIX] Store chairId for visuals
                time: Date.now()
            };

            console.log(`[BULLET_TRACK] Created Bullet: ${bulletId} for User: ${socket.userId}, Kind: ${bulletKind}, Time: ${Date.now()}`);

            // Broadcast to other users
            // [FIX] Use 'room_' prefix to match socket.join('room_' + roomId)
            socket.broadcast.to('room_' + socket.currentRoomId).emit('user_fire_Reply', {
                ...reqData,
                userId: socket.userId // Ensure userId is sent
            });
        });

        // --- LASER CATCH ---
        socket.on('laser_catch_fish', (data) => {
            const reqData = parsePayload(data);
            const room = roomManager.getRoom(socket.currentRoomId);

            // [FIX] Defensive check - room must exist
            if (!room) {
                console.error(`[LASER_CATCH ERROR] Room ${socket.currentRoomId} not found for user ${socket.userId}`);
                return;
            }

            const user = room.users?.[socket.userId];
            if (!user) return;

            const fishesStr = reqData.fishes || "";
            const fishIdList = fishesStr.split('-').map(id => parseInt(id));
            if (fishIdList.length === 0) return;

            let addScore = 0;
            const killedFishes = [];
            const rScore = Number(room.baseScore || 0.001);
            // Laser bullet kind is 22, Multiplier is 1 (Go define.go)
            const laserMulti = BulletMulti[22] || 1;

            fishIdList.forEach(fId => {
                const fish = room.aliveFish[fId];
                if (fish) {
                    killedFishes.push(fId);
                    const fishMulti = FishMulti[fish.fishKind] || 2;
                    // Score = FishMulti * BulletMulti * BaseScore
                    // Using integer math flow similar to catch_fish
                    const rewardInt = toStorageInt(rScore * laserMulti * fishMulti);
                    addScore = safeAdd(addScore, rewardInt);

                    // Remove fish (client trusts laser hits usually)
                    delete room.aliveFish[fId];
                }
            });

            if (addScore > 0) {
                user.score = safeAdd(user.score, addScore);
                user.bill = safeAdd(user.bill || 0, addScore);

                const catchFishAddScore = toDisplayFloat(addScore);
                const catchReply = {
                    userId: socket.userId,
                    chairId: (user.seatIndex || 0) + 1,
                    fishId: killedFishes.join(','),
                    addScore: catchFishAddScore,
                    score: toDisplayFloat(user.score),
                    isLaser: true
                };

                io.in('room_' + socket.currentRoomId).emit('catch_fish_reply', catchReply);
                console.log(`[LASER HIT] User ${socket.userId} hit ${killedFishes.length} fish. Reward: ${catchFishAddScore}`);
            }
        });

        // --- CHANGE CANNON ---
        // [CANONICAL] From Go: request.go:350-369
        socket.on('user_change_cannon', (data) => {
            const reqData = parsePayload(data);
            const room = roomManager.getRoom(socket.currentRoomId);
            if (!room || !room.users[socket.userId]) return;

            const cannonKind = parseInt(reqData.cannonKind);
            if (!cannonKind || cannonKind < 1) {
                console.warn(`[CANNON] Invalid cannonKind: ${cannonKind}`);
                return;
            }

            // [CANONICAL] If laser cannon (22), check power requirement
            if (cannonKind === 22) {
                if ((room.users[socket.userId].power || 0) < 1) {
                    console.log(`[CANNON] User ${socket.userId} tried to switch to laser without full power`);
                    return;
                }
            }

            // Update cannon in memory
            room.users[socket.userId].cannonKind = cannonKind;
            console.log(`[CANNON] User ${socket.userId} changed cannon to ${cannonKind}`);

            // Broadcast to other players in room
            const response = {
                userId: socket.userId,
                chairId: room.users[socket.userId].seatIndex + 1,
                cannonKind: cannonKind
            };
            socket.broadcast.to('room_' + socket.currentRoomId).emit('user_change_cannon_reply', response);
        });

        // --- LOCK FISH (Restored) ---
        socket.on('user_lock_fish', (data) => {
            const reqData = parsePayload(data);
            const room = roomManager.getRoom(socket.currentRoomId);
            if (!room || !room.users[socket.userId]) return;

            const response = {
                userId: socket.userId,
                chairId: room.users[socket.userId].seatIndex + 1,
                fishId: reqData.fishId || -1
            };

            // [FIX] Use 'room_' prefix to match socket.join('room_' + roomId)
            socket.broadcast.to('room_' + socket.currentRoomId).emit('lock_fish_reply', response);
            console.log(`[LOCK] User ${socket.userId} locked fish ${response.fishId}`);
        });

        // --- FROZEN SCENE ---
        socket.on('user_frozen', (data) => {
            const room = roomManager.getRoom(socket.currentRoomId);
            if (!room) return;

            // [CANONICAL] Frozen duration 10 seconds
            const duration = 10000;
            room.frozenEndTime = Date.now() + duration;

            console.log(`[FROZEN] User ${socket.userId} froze the scene for 10s`);

            // Broadcast to ALL users (包括自己，如果客户端需要服务器确认)
            io.in('room_' + socket.currentRoomId).emit('user_frozen_reply', {
                cutDownTime: 10000 // Client expects MILLISECONDS (10s)
            });
        });

        // --- EXIT (Critical: Missing Handler!) ---
        socket.on('exit', () => {
            console.log(`[EXIT] User ${socket.userId} requested exit from room ${socket.currentRoomId}`);

            if (!socket.currentRoomId || !socket.userId) {
                console.warn(`[EXIT] Invalid state: roomId=${socket.currentRoomId}, userId=${socket.userId}`);
                socket.disconnect(true);
                return;
            }

            const roomName = 'room_' + socket.currentRoomId;
            const room = roomManager.getRoom(socket.currentRoomId);

            // 1. Broadcast exit to other players
            io.in(roomName).emit('exit_notify_push', socket.userId);

            // 2. Leave room channel to stop receiving broadcasts
            socket.leave(roomName);
            console.log(`[EXIT] User ${socket.userId} left ${roomName}`);

            // 3. Clean up room memory
            if (room && room.users[socket.userId]) {
                // Save score before cleanup - [GAME_ID_FIX] Pass socket.gameId
                saveUserToDB(socket.userId, room.users[socket.userId].score, socket.gameId);
                delete room.users[socket.userId];
                console.log(`[EXIT] Removed user ${socket.userId} from room ${socket.currentRoomId} memory`);
            }

            // 4. Send exit confirmation to client
            socket.emit('exit_result', { errcode: 0 });

            // 5. Force disconnect the socket (like Go server does)
            socket.disconnect(true);
            console.log(`[EXIT] Disconnected socket ${socket.id}`);

            // 6. Check if room should be cleaned up
            roomManager.checkAndDeleteEmptyRoom(socket.currentRoomId);
        });

        // --- CATCH (Corrected with RTP) ---
        // --- CATCH (Corrected with RTP) ---
        socket.on('catch_fish', (data) => {
            const reqData = parsePayload(data);
            const room = roomManager.getRoom(socket.currentRoomId);  // [REFACTOR] Use roomManager

            // [FIX] Defensive check - room must exist
            if (!room) {
                console.error(`[CATCH ERROR] Room ${socket.currentRoomId} not found for user ${socket.userId}`);
                return;
            }

            const bulletId = reqData.bulletId; // [FIX] Extract variable
            const fishIdParam = reqData.fishId; // Can be comma separated

            console.log(`[CATCH] Request from ${socket.userId}: Bullet:${bulletId}, Fish:${fishIdParam}`);

            // 1. Validate Bullet
            let bullet = room.aliveBullets[bulletId];
            if (!bullet) {
                console.warn(`[TRACE_HIT] Bullet NOT found: ${bulletId} (User: ${socket.userId}).`);

                // Detailed debug of existing bullets for this user
                const userBullets = Object.values(room.aliveBullets).filter(b => b.userId === socket.userId);
                console.warn(`[TRACE_HIT] User has ${userBullets.length} active bullets in memory: [${userBullets.map(b => b.bulletId).join(', ')}]`);

                console.warn(`[TRACE_HIT] Creating MOCK bullet to allow hit (Mock Logic Active).`);
                // [CRITICAL FIX] Use room.baseScore directly, NOT RoomConfig!
                // room already declared at line 974
                const mockBMulti = room.users[socket.userId]?.cannonKind ? BulletMulti[room.users[socket.userId].cannonKind] : 1;
                const mockCost = (room?.baseScore || 0.001) * mockBMulti; // Use room.baseScore (2.0)!

                bullet = {
                    bulletId: bulletId,
                    userId: socket.userId,
                    cannonType: 1,
                    bMulti: mockBMulti,
                    score: mockCost, // [FIX] Use actual cost
                    chairId: (room.users[socket.userId]?.seatIndex || 0) + 1, // [FIX] Add chairId
                    time: Date.now(),
                    isMock: true
                };
            } else {
                console.log(`[TRACE_HIT] Bullet Found: ${bulletId} (Created: ${Date.now() - bullet.time}ms ago)`);
            }

            if (bullet.userId !== socket.userId) {
                console.warn(`[TRACE_HIT] Ownership mismatch! BulletOwner:${bullet.userId} vs RequestUser:${socket.userId}`);
                return;
            }

            // 2. Resolve Fishes
            const fishIdList = String(fishIdParam).split(',');
            console.log(`[TRACE_HIT] Processing ${fishIdList.length} fish hits: [${fishIdList.join(', ')}]`);
            const killedFishes = [];

            fishIdList.forEach(fId => {
                const fish = room.aliveFish[fId];
                if (fish) {
                    // [CANONICAL] Hit Rate Check
                    const fishMulti = FishMulti[fish.fishKind] || 2;

                    // [CANONICAL] Reverted to Go logic as requested
                    const captureRate = 1.0 / fishMulti;


                    const diceRoll = Math.random();
                    const isHit = diceRoll < captureRate;

                    if (isHit) {
                        killedFishes.push(fish);
                        console.log(`[FISH_TRACK] HIT! Fish:${fId} (Kind:${fish.fishKind}, Multi:${fishMulti}) Rate:${captureRate.toFixed(4)} Roll:${diceRoll.toFixed(4)}`);
                    } else {
                        console.log(`[FISH_TRACK] MISS! Fish:${fId} (Kind:${fish.fishKind}, Multi:${fishMulti}) Rate:${captureRate.toFixed(4)} Roll:${diceRoll.toFixed(4)}`);
                    }
                } else {
                    console.warn(`[FISH_REJECT] Fish NOT found: ${fId}. It might have swum away.`);
                }
            });

            if (killedFishes.length > 0) {
                // [FIX] Canonical Score Calculation
                // In Go: totalScore = GetFishMulti(fish) * GetBulletMulti(bulletKind) * RoomBaseScore
                // bullet.score NOW stores ACTUAL cost (baseScore * bulletMulti)
                // Reward = bullet.score * fishMulti

                const bulletCost = Number(bullet.score) || 0; // e.g., 10 (NOW STORES ACTUAL COST!)
                const bMulti = Number(bullet.bMulti) || 1;

                // Check for special fish effects (Bomb, etc.)
                let specialFish = null;
                for (const f of killedFishes) {
                    if (f.fishKind === 30 || (f.fishKind >= 23 && f.fishKind <= 26) || (f.fishKind >= 31 && f.fishKind <= 33)) {
                        specialFish = f;
                        break;
                    }
                }

                if (specialFish) {
                    if (specialFish.fishKind === 30) {
                        // [CANONICAL] Bomb Fish (Kind 30) - Kill max 20 small fish
                        const candidates = Object.values(room.aliveFish).filter(f => f.fishKind < 11 && f.fishId !== specialFish.fishId);
                        const targets = candidates.slice(0, 20);
                        targets.forEach(t => {
                            if (!killedFishes.find(k => k.fishId === t.fishId)) {
                                killedFishes.push(t);
                            }
                        });
                        console.log(`[SPECIAL] Bomb fish! Added ${targets.length} small fish.`);
                    }
                    else if (specialFish.fishKind >= 23 && specialFish.fishKind <= 26) {
                        // [CANONICAL] All-in-One
                        const targets = Object.values(room.aliveFish).filter(f =>
                            (f.fishKind >= 23 && f.fishKind <= 26) && f.fishId !== specialFish.fishId
                        );
                        targets.forEach(t => {
                            if (!killedFishes.find(k => k.fishId === t.fishId)) {
                                killedFishes.push(t);
                            }
                        });
                        console.log(`[SPECIAL] All-in-one! Added ${targets.length} similar fish.`);
                    }
                    else if (specialFish.fishKind >= 31 && specialFish.fishKind <= 33) {
                        // [CANONICAL] Same-kind bomb
                        let targetKind = -1;
                        if (specialFish.fishKind === 31) targetKind = 12;
                        if (specialFish.fishKind === 32) targetKind = 1;
                        if (specialFish.fishKind === 33) targetKind = 7;

                        if (targetKind !== -1) {
                            const targets = Object.values(room.aliveFish).filter(f =>
                                (f.fishKind === specialFish.fishKind || f.fishKind === targetKind) && f.fishId !== specialFish.fishId
                            );
                            targets.forEach(t => {
                                if (!killedFishes.find(k => k.fishId === t.fishId)) {
                                    killedFishes.push(t);
                                }
                            });
                            console.log(`[SPECIAL] Same-kind bomb! Killing kind ${targetKind} and ${specialFish.fishKind}. Added ${targets.length}.`);
                        }
                    }
                }

                // Calculate Total Score (Integer)
                let totalScore = 0;
                const fishIds = [];
                for (const f of killedFishes) {
                    const fishMulti = FishMulti[f.fishKind] || 2;
                    // [CANONICAL] Reward = BulletCost * FishMulti
                    // Example: 10元炮 * 2倍魚 = 20元獎勵
                    const rewardInt = toStorageInt(bulletCost * fishMulti);
                    totalScore = safeAdd(totalScore, rewardInt);

                    fishIds.push(String(f.fishId));
                    delete room.aliveFish[f.fishId];
                }
                // totalScore is now a safe integer

                // Add Score
                if (room.users[socket.userId]) {
                    // [PRECISION FIX] Add score as INT
                    room.users[socket.userId].score = safeAdd(room.users[socket.userId].score, totalScore);
                    // [ARCH FIX] NEVER touch gold (Platform Coin) here!

                    // [CANONICAL] Bill uses INT
                    room.users[socket.userId].bill = room.users[socket.userId].bill || 0;
                    room.users[socket.userId].bill = safeAdd(room.users[socket.userId].bill, totalScore);

                    // [POWER FIXED] Accumulate Power on Kill too? (Standard: Fire adds power, Kill might add more?)
                    // GO code adds power on FIRE. But let's sync power here just in case.
                }

                // [CANONICAL] Item drop 1% probability (GO: client.go:283-287)
                let item = "";
                if (Math.random() < 0.01) {
                    item = "ice";
                    console.log(`[ITEM] Ice item dropped for user ${socket.userId}!`);
                }

                // Broadcast HIT to ALL with SERVER userId and corrected chairId
                const catchReply = {
                    userId: socket.userId, // [FIX] Use server userId
                    chairId: bullet.chairId || (room.users[socket.userId]?.seatIndex + 1), // [FIX] Use Bullet's ChairId for correct UI animation
                    fishId: fishIds.join(','), // Multiple fish separated by comma
                    bulletId: bulletId,
                    addScore: toDisplayFloat(totalScore), // Send float to client
                    item: item,
                    // [ANIMATION FIX] Include score and power for UI animations
                    score: toDisplayFloat(room.users[socket.userId]?.score || 0),
                    power: room.users[socket.userId]?.power || 0
                };
                console.log(`[CATCH SUCCESS] Broadcasting catch_fish_reply:`, catchReply);
                // [FIX] Broadcast to room only, not all sockets globally
                io.in('room_' + socket.currentRoomId).emit('catch_fish_reply', catchReply);
            }

            // Delete bullet after catch (Canonical behavior from GO implementation)
            // If CLIENT sends duplicate bulletId, it's a CLIENT bug
            if (bulletId) delete room.aliveBullets[bulletId];
        });

        // --- SPAWN LOOP ---
        // [MATCH GO LOGIC]
        // Timers:
        // C1: 1s (Normal 1-15)
        // C2: 10s (Medium 16-20)
        // C3: 30s (Large 21-34)
        // C4: 61s (King 35)
        // Note: Go code has C1=1s/2s (dynamic?), C2=10s, C3=30s, C4=61s.
        // We will simulate this precise scheduling.

        // Global storage for spawn timers, keyed by roomId
        const spawnTimers = {};
        let nextFishId = 0; // Global fish ID counter
        let spawnTimersStarted = false; // [FIX] Global flag to prevent duplication

        function getNextFishId() {
            nextFishId++;
            return nextFishId;
        }

        function startSpawnTimers(roomId) {
            // [CRITICAL FIX] Prevent multiple instances of spawn timers
            if (spawnTimersStarted) {
                console.log(`[SPAWN] Timers already running, skipping duplicate start.`);
                return;
            }
            spawnTimersStarted = true;
            console.log(`[ROOM] Started 4 Canonical Tickers for room ${roomId}`);

            spawnTimers[roomId] = [];

            // C1: Normal Fish (Kind 1-15), Every 1s
            const t1 = setInterval(() => {
                spawnFishBatch(roomId, 1, 15, 'C1');
            }, 1000);
            spawnTimers[roomId].push(t1);

            // C2: Medium Fish (Kind 16-20), Every 10s
            const t2 = setInterval(() => {
                spawnFishBatch(roomId, 16, 20, 'C2');
            }, 10000);
            spawnTimers[roomId].push(t2);

            // C3: Large Fish (Kind 21-34), Every 30s
            const t3 = setInterval(() => {
                spawnFishBatch(roomId, 21, 34, 'C3');
            }, 30000);
            spawnTimers[roomId].push(t3);

            // C4: King (Kind 35), Every 61s
            const t4 = setInterval(() => {
                spawnFishBatch(roomId, 35, 35, 'C4');
            }, 61000);
            spawnTimers[roomId].push(t4);
        }

        // [LOGIC] Spawn Batch Implementation
        function spawnFishBatch(roomId, kindStart, kindEnd, timerType) {
            if (!outputTraceConfig) return;
            const room = roomManager.getRoom(roomId); // Use roomManager to get the room
            if (!room) return;

            // [CANONICAL] Trace Logic from fish_utils.go
            // Randomly select trace type: 1=Straight, 2=Curve2, 3=Curve3
            const traceType = Math.floor(Math.random() * 3) + 1;
            let traceId = 101;

            switch (traceType) {
                case 1: // Straight (201-217)
                    traceId = 201 + Math.floor(Math.random() * 17);
                    break;
                case 2: // Curve 2 (1-10)
                    traceId = 1 + Math.floor(Math.random() * 10);
                    break;
                case 3: // Curve 3 (101-110)
                    traceId = 101 + Math.floor(Math.random() * 10);
                    break;
            }

            const paths = outputTraceConfig[String(traceId)];
            if (!paths || paths.length === 0) return;

            // Determine Count based on Timer Type (Heuristic based on logs/Go loop)
            let count = 1;
            if (timerType === 'C1') count = 2; // Normal fish spawn in small groups
            if (timerType === 'C2') count = 1;
            if (timerType === 'C3') count = 1;
            if (timerType === 'C4') count = 1;

            const fishList = [];
            const fishKind = Math.floor(Math.random() * (kindEnd - kindStart + 1)) + kindStart;

            for (let i = 0; i < count; i++) {
                const fishId = getNextFishId();
                const speed = (fishKind >= 35) ? 3 : (fishKind >= 30 ? 4 : (fishKind >= 20 ? 5 : 6));

                // Track in room
                const fishObj = {
                    fishId: fishId,
                    fishKind: fishKind,
                    trace: paths[0], // Use first path variant
                    speed: speed,
                    activeTime: Date.now()
                };

                if (!room.aliveFish) room.aliveFish = {}; // Ensure aliveFish exists
                room.aliveFish[fishId] = fishObj; // Store

                fishList.push({
                    fishKind: fishKind,
                    fishId: fishId,
                    trace: paths[0], // Use first path variant
                    speed: speed,
                    activeTime: Date.now()
                });
            }

            if (fishList.length > 0) {
                // [DIAGNOSTIC] Only log if abnormal socket count
                io.in('room_' + roomId).fetchSockets().then(sockets => {
                    if (sockets.length > 4) {
                        console.warn(`[BROADCAST_WARN] ⚠️ Room ${roomId} has ${sockets.length} sockets! (Max 4). Fish: ${fishList.length}`);
                        console.warn(`[BROADCAST_WARN] Socket IDs:`, sockets.map(s => s.id));
                    }
                });
                io.in('room_' + roomId).emit('build_fish_reply', {
                    detail: fishList
                });
            }
        }

        function startFishLoop(room, roomId) {
            // [LASER_BUG_FIX] 防止定时器重复初始化导致鱼生成大乱
            // 改为房间级别的定时器，而不是socket级别
            if (room.fishIntervals && room.fishIntervals.length > 0) {
                console.log(`[FISH_LOOP] Room ${roomId} already has active timers, skipping...`);
                return;
            }

            console.log(`[FISH_LOOP] Initializing room ${roomId} fish spawn timers`);
            room.fishIntervals = [];

            // [CLEANUP] Remove expired fish to prevent "Ghost Fish"
            // Fish typically cross screen in < 40s. Go code uses 120s. Let's use 120s.
            const tCleanup = setInterval(() => {
                const now = Date.now();
                const lifetime = 120000; // [FIX] Increase to 120s to match Go 
                let count = 0;
                if (room.aliveFish) {
                    Object.keys(room.aliveFish).forEach(fId => {
                        const fish = room.aliveFish[fId];
                        if (fish && (now - fish.activeTime > lifetime)) {
                            delete room.aliveFish[fId];
                            count++;
                        }
                    });
                }
                if (count > 0) console.log(`[CLEANUP] Room ${roomId} removed ${count} expired fish.`);
            }, 10000); // Check every 10s

            // 使用房间级别的定时器，不依赖socket.connected状态
            const t1 = setInterval(() => {
                // 如果房间没有玩家，不生成鱼（节省资源）
                if (!room.users || Object.keys(room.users).length === 0) return;
                spawnFishBatch(roomId, 1, 15, 1);
            }, 2000);

            const t2 = setInterval(() => {
                if (!room.users || Object.keys(room.users).length === 0) return;
                spawnFishBatch(roomId, 16, 20, 2);
            }, 10100);

            const t3 = setInterval(() => {
                if (!room.users || Object.keys(room.users).length === 0) return;
                spawnFishBatch(roomId, 21, 34, 3);
            }, 30200);

            const t4 = setInterval(() => {
                if (!room.users || Object.keys(room.users).length === 0) return;
                spawnFishBatch(roomId, 35, 35, 4);  // Fish King
            }, 61000);

            room.fishIntervals = [tCleanup, t1, t2, t3, t4];
            console.log(`[FISH_LOOP] Room ${roomId} timers initialized: ${room.fishIntervals.length} timers active`);
        }

        socket.on('disconnect', () => {
            console.log(`[DISCONNECT] Socket ${socket.id} disconnected. UserID: ${socket.userId}`);
            // [DIAGNOSTIC] Log which rooms this socket was in
            console.log(`[DISCONNECT_ROOMS] Socket ${socket.id} was in rooms:`, Array.from(socket.rooms));
            console.log(`[DISCONNECT_ROOMS] Socket currentRoomId: ${socket.currentRoomId}`);

            // [FIX] Broadcast exit to current room before cleanup
            if (socket.currentRoomId && socket.userId) {
                const roomName = 'room_' + socket.currentRoomId;
                io.in(roomName).emit('exit_notify_push', socket.userId);
                // [CRITICAL] Leave room to stop receiving broadcasts
                socket.leave(roomName);
                console.log(`[DISCONNECT] User ${socket.userId} left ${roomName} and broadcasted exit`);
            }

            // [CRITICAL] Sync balance back to DB before cleanup
            if (socket.userId && socket.currentRoomId) {
                const room = roomManager.getRoom(socket.currentRoomId);  // [REFACTOR] Use roomManager
                const userInRoom = room?.users[socket.userId];

                if (userInRoom && userInRoom.score !== undefined) {
                    // [GAME_ID_FIX] Pass socket.gameId or user's stored gameId
                    saveUserToDB(socket.userId, userInRoom.score, socket.gameId || userInRoom.gameId);
                }
            }

            if (socket.userId && socket.userId !== 'guest') {
                const room = roomManager.getRoom(socket.currentRoomId);  // [REFACTOR] Use roomManager
                if (room && room.users[socket.userId]) {
                    // [FIX] Clean up user's bullets to prevent accumulation and ID conflicts
                    if (room.aliveBullets) {
                        const bulletIds = Object.keys(room.aliveBullets);
                        bulletIds.forEach(bulletId => {
                            if (room.aliveBullets[bulletId]?.userId === socket.userId) {
                                delete room.aliveBullets[bulletId];
                            }
                        });
                        console.log(`[DISCONNECT] Cleaned up ${bulletIds.length} bullets for user ${socket.userId}`);
                    }

                    // [GAME_ID_FIX] Pass socket.gameId or user's stored gameId
                    saveUserToDB(socket.userId, room.users[socket.userId].score, socket.gameId || room.users[socket.userId].gameId);
                    delete room.users[socket.userId]; // Cleanup memory
                }
            }

            // [REFACTOR] Check if room should be cleaned up
            if (socket.currentRoomId) {
                roomManager.checkAndDeleteEmptyRoom(socket.currentRoomId);
            }

            if (socket.fishIntervals) {
                socket.fishIntervals.forEach(t => clearInterval(t));
                socket.fishIntervals = [];
            }
        });
    });


    // Global Periodic Save (Only need one timer)
    if (port === 9000) {
        setInterval(() => {
            if (!roomManager) return;
            let savedCount = 0;
            for (const [roomId, room] of roomManager.rooms) {
                if (room.users) {
                    Object.values(room.users).forEach(u => {
                        if (u.userId !== 'guest' && u.online) {
                            // [GAME_ID_FIX] Pass user's stored gameId
                            const gameIdToSave = u.gameId || 'fish';
                            if (!u.gameId) {
                                console.warn(`[PeriodicSave] WARNING: User ${u.userId} has no gameId! Defaulting to 'fish'`);
                            }
                            saveUserToDB(u.userId, u.score, gameIdToSave);
                            savedCount++;
                        }
                    });
                }
            }
            if (savedCount > 0) {
                console.log(`[PeriodicSave] Saved ${savedCount} users`);
            }
        }, 10000);
    }

    httpServer.listen(port, () => {
        console.log(`Mock Server running on port ${port} [VERSION: FIX_LISTEN_LOCATION]`);
    });
}); // Close ports.forEach




// -------------------------------------------------------------------------
// INITIALIZE GLOBAL ROOM MANAGER (After all IO instances collected)
// -------------------------------------------------------------------------

roomManager = new RoomManager(ioInstances, outputTraceConfig, FishMulti);
console.log(`[ROOM_MANAGER] Initialized with Map-based architecture (Global Singleton)`);
