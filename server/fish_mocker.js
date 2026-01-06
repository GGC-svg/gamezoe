import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { generateSignature, verifySignature } from './utils/signature.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------------------------------------------------
// GAME CONSTANTS
// -------------------------------------------------------------------------

const FishMulti = {
    1: 2, 2: 2, 3: 3, 4: 4, 5: 5, 6: 5, 7: 6, 8: 7, 9: 8, 10: 9,
    11: 10, 12: 11, 13: 12, 14: 18, 15: 25, 16: 30, 17: 35, 18: 40,
    19: 45, 20: 50, 21: 80, 22: 100,
    23: 45, 24: 45, 25: 45, 26: 45,
    27: 50, 28: 60, 29: 70,
    30: 100, 31: 110, 32: 110, 33: 110,
    34: 120, 35: 200
};

const BulletMulti = {
    1: 1, 2: 2, 3: 3, 4: 1, 5: 3, 6: 5, 7: 1, 8: 3, 9: 5,
    10: 1, 11: 3, 12: 5, 13: 1, 14: 3, 15: 5, 16: 1, 17: 3, 18: 5,
    19: 1, 20: 3, 21: 5, 22: 1
};

const GameBaseScore = 1;

// -------------------------------------------------------------------------
// SERVER STATE (Global Memory)
// -------------------------------------------------------------------------

const RoomState = {
    1: {
        aliveFish: {},
        aliveBullets: {},
        users: {} // UserId -> UserObject { score, ... }
    }
};

let nextFishId = 1000;

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
        res.json({
            code: 0, msg: "success", status: 1,
            ip: "127.0.0.1", host: "127.0.0.1", port: 4002,
            hall_ip: "127.0.0.1", hall_port: 9000, hall: "127.0.0.1:9000", version: 1
        });
    });

    function generateUserResponse(account) {
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
            user_id: numId, userid: numId, userId: numId, id: numId,
            token: account, // Critical: Socket 'login' uses this to identify user

            // Profile
            name: "Hunter_" + account.substring(0, 5),
            headimg: (numId % 8) + 1,
            lv: 1, exp: 0,
            coins: 0, money: 0, gems: 0, vip: 0,
            roomid: 1, sex: 1, ip: "127.0.0.1"
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
                    const room = RoomState[1];
                    let currentScore = 0;

                    // Update Memory if user is online/loaded
                    if (room.users[user_id]) {
                        room.users[user_id].score = (room.users[user_id].score || 0) + amount;
                        currentScore = room.users[user_id].score;
                        console.log(`[Deposit] Updated Memory for ${user_id}. New Score: ${currentScore}`);
                    }

                    // BROADCAST to ALL Sockets (Cross-Port)
                    ioInstances.forEach(ioInst => {
                        ioInst.sockets.sockets.forEach((s) => {
                            if (s.userId === user_id) {
                                console.log(`[Deposit] Pushing update to socket ${s.id}`);
                                if (room.users[user_id]) {
                                    // Force refresh seat info including score
                                    s.emit('new_user_comes_push', { ...room.users[user_id], seatIndex: 0 });
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

        const withdrawAmount = parseInt(amount);

        // 1. Generate Order ID
        const order_id = `W_${user_id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // 2. Check Balance & Rule (Must keep 500)
        // 2. Check Balance & Rule (Must keep 500)
        // CRITICAL FIX: Check Memory First to avoid Race Condition
        const room = RoomState[1];
        let currentBalance = 0;
        let isOnline = false;

        if (room.users[user_id]) {
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

        const proceedWithWithdraw = (balance, source) => {
            if (balance < withdrawAmount) {
                console.warn(`[GameServer] Insufficient Balance (${source})`);
                return res.status(400).json({ code: 400, message: "Insufficient balance" });
            }
            if (balance - withdrawAmount < 500) {
                console.warn(`[GameServer] Rule Violation: Must retain 500. Current: ${balance}, After: ${balance - withdrawAmount}`);
                return res.status(400).json({ code: 400, message: "Must keep at least 500 coins" });
            }

            // 3. Deduct Balance
            if (isOnline) {
                // Deduct from Memory IMMEDIATELY
                room.users[user_id].score -= withdrawAmount;
                console.log(`[GameServer] Deducted from Memory. New Score: ${room.users[user_id].score}`);

                // Sync to DB (Optimistic)
                // We still run the DB Update to ensure persistence
                db.serialize(() => {
                    db.run("UPDATE users SET fish_balance = ? WHERE id = ?", [room.users[user_id].score, user_id], (err) => {
                        if (err) console.error("Failed to sync memory deduction to DB");
                    });
                    // Continue to Transaction Log
                    createTransactionLog();
                });
            } else {
                // Deduct from DB
                db.serialize(() => {
                    db.run("UPDATE users SET fish_balance = fish_balance - ? WHERE id = ?", [withdrawAmount, user_id], (err) => {
                        if (err) return res.status(500).json({ code: 500, message: "Deduct Failed" });
                        createTransactionLog();
                    });
                });
            }
        };

        const createTransactionLog = () => {
            const desc = "Settlement from Fish Master";
            db.run(`INSERT INTO wallet_transactions (order_id, user_id, amount, currency, type, description, status, created_at) 
                    VALUES (?, ?, ?, 'gold', 'WITHDRAW', ?, 'PENDING_PLATFORM', datetime('now', '+8 hours'))`,
                [order_id, user_id, withdrawAmount, desc], async (err) => {
                    if (err) {
                        // Rollback logic is complex for memory, but for now assume insert works or critical fail
                        if (isOnline) {
                            room.users[user_id].score += withdrawAmount; // Revert Memory
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
                const platformUrl = 'http://localhost:3002/api/bridge/transaction/withdraw';
                const payload = {
                    order_id,
                    user_id,
                    amount: withdrawAmount,
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
                    if (isOnline) {
                        // Broadcast new score? Already updated in memory, usually game loop handles it or we force push
                        // We should likely push the new score to client
                        const s = ioInstances.find(io => true)?.sockets.sockets.forEach(s => {
                            if (s.userId === user_id) s.emit('new_user_comes_push', { ...room.users[user_id], seatIndex: 0 });
                        });
                    }

                    res.json({ code: 200, message: "SUCCESS", data: { order_id, balance: isOnline ? room.users[user_id].score : (currentBalance - withdrawAmount) } });
                } else {
                    // Fail - Rollback
                    console.warn("Platform Rejected Withdraw");
                    if (isOnline) room.users[user_id].score += withdrawAmount;
                    else db.run("UPDATE users SET fish_balance = fish_balance + ? WHERE id = ?", [withdrawAmount, user_id]);

                    db.run("UPDATE wallet_transactions SET status = 'FAILED' WHERE order_id = ?", [order_id]);
                    res.status(400).json({ code: 400, message: platformData.message || "Platform Rejected" });
                }
            } catch (e) {
                console.error("Platform Call Failed", e);
                if (isOnline) room.users[user_id].score += withdrawAmount;
                else db.run("UPDATE users SET fish_balance = fish_balance + ? WHERE id = ?", [withdrawAmount, user_id]);
                res.status(500).json({ message: "Platform Error" });
            }
        };

        // Execution Start
        if (room.users[user_id]) {
            proceedWithWithdraw(room.users[user_id].score, "Memory");
        } else {
            db.get("SELECT fish_balance FROM users WHERE id = ?", [user_id], (err, row) => {
                if (err) return res.status(500).json({ code: 500, message: "DB Error" });
                if (!row) return res.status(404).json({ code: 404, message: "User not found" });
                proceedWithWithdraw(row.fish_balance || 0, "DB");
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
        const account = req.query.account || "guest_" + Math.floor(Math.random() * 10000);
        console.log(`[HTTP] Guest Login Request: ${account}`);
        res.json(generateUserResponse(account));
    });

    function handleLogin(req, res, port) {
        const account = req.query.account || req.body.account || "guest_10086";
        console.log(`[HTTP] Login Request: ${account}`);
        res.json(generateUserResponse(account));
    }
    app.post('/login', (req, res) => { handleLogin(req, res, port); });
    app.get('/login', (req, res) => { handleLogin(req, res, port); });

    app.get('/get_user_status', (req, res) => { res.json({ errcode: 0, status: 1 }); });
    app.get('/get_message', (req, res) => { res.json({ errcode: 0, data: [], version: 1, msg: "Welcome!" }); });
    app.get('/enter_private_room', (req, res) => { res.json({ errcode: 0, roomid: 1, ip: "127.0.0.1", port: 4002 }); });

    app.get('/enter_public_room', (req, res) => {
        // Map baseParam to RoomId
        let roomId = 1;
        const baseParam = parseInt(req.query.baseParam || "1");
        if (baseParam === 50) roomId = 2;
        else if (baseParam === 500) roomId = 3;
        else if (baseParam === 2000) roomId = 4;

        if (req.query.roomId) roomId = parseInt(req.query.roomId);

        console.log(`[EnterRoom] BaseParam=${baseParam} -> Room ${roomId}`);
        res.json({ errcode: 0, roomid: roomId, roomId: roomId, ip: "127.0.0.1", port: 4002 });
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
    const db = new sqlite3Verbose.Database(dbPath, (err) => {
        if (err) console.error('[DB] Fish Mock Server failed to connect to DB', err);
        else console.log('[DB] Fish Mock Server connected to SQLite');
    });

    // Helper to save user score to DB
    function saveUserToDB(userId, score) {
        if (!userId || userId === 'guest') return;
        db.run("UPDATE users SET fish_balance = ? WHERE id = ?", [score, userId], (err) => {
            if (err) console.error(`[DB] Failed to save score for ${userId}:`, err);
            // else console.log(`[DB] Saved score ${score} for ${userId}`);
        });
    }

    io.on('connection', (socket) => {
        console.log(`[Port ${port} Socket] Connected: ${socket.id}`);

        const getRoom = () => RoomState[1];

        // Removed nested invalid sqlite setup

        // ... (socket connection)

        // --- LOGIN ---
        socket.on('login', (data) => {
            console.log(`[DEBUG] Login Payload Raw:`, data);
            const reqData = parsePayload(data);
            let userId = reqData.token || "guest"; // Use Token as ID

            // [HIJACK] Force Platform User for Guest/Dev connections
            // [HIJACK] Force Platform User for Guest/Dev connections (DISABLED FOR PRODUCTION)
            // if (userId === "guest" || userId.startsWith("guest_") || (userId.length < 15 && !userId.startsWith("u_"))) {
            //     console.warn(`[Login Hijack] Detected Guest/Legacy User: ${userId}. Remapping to Platform Test ID.`);
            //     userId = "102746929077306565219"; // 黃繼德 (Test Account)
            // }

            console.log(`[DEBUG] Login Parsed UserID: ${userId}`);

            const requestedRoomId = parseInt(reqData.roomId || "1");

            socket.userId = userId;
            socket.currentRoomId = requestedRoomId;
            const room = getRoom();

            const finalizeLogin = (dbUser) => {
                const name = dbUser ? dbUser.name : ("Guest_" + userId.substring(0, 4));
                // Use fish_balance
                let initialScore = dbUser ? (dbUser.fish_balance || 0) : 500;
                let initialGold = dbUser ? (dbUser.gold_balance || 0) : 0; // NEW: Platform Gold

                console.log(`[DEBUG] Login Finalize. User: ${userId}, Score: ${initialScore}, Gold: ${initialGold}, Name: ${name}`);

                // New User Bonus (Only if 0)
                if (dbUser && initialScore === 0) {
                    initialScore = 500;
                    saveUserToDB(userId, 500);
                    console.log(`[Bonus] User ${userId} received 500 point welcome bonus (Fish)!`);
                }

                // Init Memory
                if (!room.users[userId]) {
                    room.users[userId] = {
                        userId: userId, score: initialScore, gold: initialGold, seatIndex: 0,
                        name: name, online: true,
                        cannonKind: 1, vip: 1
                    };
                } else {
                    // Update existing memory with latest DB data (restore session)
                    room.users[userId].score = initialScore;
                    room.users[userId].gold = initialGold;
                    room.users[userId].name = name;
                }

                const mySeat = room.users[userId];
                const emptySeat = { userid: 0, userId: 0, score: 0, name: "", online: false, cannonKind: 1, vip: 0 };

                socket.emit('login_result', {
                    errcode: 0,
                    data: {
                        roomId: String(requestedRoomId),
                        conf: { type: "default", maxGames: 9999, gamebasescore: 1 }, // Simplification
                        seats: [
                            { ...mySeat, seatIndex: 0 },
                            { ...emptySeat, seatIndex: 1 },
                            { ...emptySeat, seatIndex: 2 },
                            { ...emptySeat, seatIndex: 3 }
                        ]
                    }
                });

                socket.emit('login_finished', { errcode: 0 });
                setTimeout(() => {
                    socket.emit('new_user_comes_push', { ...mySeat, seatIndex: 0 });
                }, 500);

                startFishLoop(socket);
            };

            // Query DB
            if (userId !== 'guest') {
                db.get("SELECT name, fish_balance FROM users WHERE id = ?", [userId], (err, row) => {
                    if (err) console.error("Login DB Error", err);
                    finalizeLogin(row);
                });
            } else {
                finalizeLogin(null);
            }
        });

        // --- WALLET: CHARGE (DEPOSIT) [SECURE] ---
        // Deduct Gold from DB -> Add Score
        socket.on('charge', (data) => {
            console.log(`[DEBUG] Charge Request for Socket ${socket.id}. UserID: ${socket.userId}`);
            const reqData = parsePayload(data);
            const amount = parseInt(reqData.amount);
            console.log(`[DEBUG] Charge Amount: ${amount}. reqData:`, reqData);

            if (!amount || amount <= 0) {
                console.log(`[DEBUG] Invalid amount: ${amount}`);
                return;
            }
            if (!socket.userId) {
                console.log(`[DEBUG] Missing socket.userId. Aborting.`);
                return;
            }

            const room = getRoom();
            const user = room.users[socket.userId];
            if (!user) {
                console.log(`[DEBUG] User not found in Room Memory.`);
                return;
            }

            // 1. Atomically Check & Deduct Gold in DB
            // "this.changes" will be 1 if row was updated (funds sufficient), 0 if not.
            db.run("UPDATE users SET gold_balance = gold_balance - ? WHERE id = ? AND gold_balance >= ?", [amount, socket.userId, amount], function (err) {
                if (err) {
                    console.error(`[Charge] DB Error for ${socket.userId}:`, err);
                    return;
                }

                if (this.changes > 0) {
                    // 2. Success: Add Memory Score
                    user.score += amount;

                    // 3. Persist Score to DB (Fix: Ensure points aren't lost on reload & Handle NULL)
                    db.run("UPDATE users SET fish_balance = COALESCE(fish_balance, 0) + ? WHERE id = ?", [amount, socket.userId], (err) => {
                        if (err) console.error(`[Charge] Failed to persist score for ${socket.userId}`, err);
                    });

                    // 4. Log Transaction (Fix: Audit Trail)
                    const desc = `換碼(入金) - Fish Master`;
                    db.run("INSERT INTO wallet_transactions (user_id, amount, currency, type, description, created_at) VALUES (?, ?, 'gold', 'transfer_out', ?, datetime('now', '+8 hours'))",
                        [socket.userId, -amount, desc], (err) => {
                            if (err) console.error("Failed to log charge transaction", err);
                        });

                    console.log(`[Charge] Success! Deducted ${amount} Gold, Added ${amount} Score. New Score: ${user.score}`);

                    socket.emit('charge_reply', { success: true, amount: amount, newScore: user.score });

                    // Force Sync
                    socket.emit('game_sync_push', {
                        type: "score_update", userId: socket.userId, score: user.score
                    });
                } else {
                    console.warn(`[Charge] Failed. Insufficient Gold for ${socket.userId}. Needed: ${amount}`);
                    socket.emit('charge_reply', { success: false, msg: "Insufficient Gold" });
                }
            });
        });

        // --- WALLET: EXCHANGE (REMOVED LEGACY DUPLICATE) ---
        // (Use the Secure Server-Side handler below)

        // --- FIRE ---
        socket.on('user_fire', (data) => {
            const reqData = parsePayload(data);
            const room = getRoom();

            // Deduct Cost
            const RoomBaseScores = { 1: 1, 2: 50, 3: 500, 4: 2000 };
            const rScore = RoomBaseScores[socket.currentRoomId || 1] || 1;
            const bMulti = BulletMulti[reqData.bulletKind] || 1;
            const cost = bMulti * rScore;

            if (socket.userId && room.users[socket.userId]) {
                room.users[socket.userId].score -= cost;
            }

            // Store Bullet
            if (reqData.bulletId) {
                room.aliveBullets[reqData.bulletId] = {
                    bulletId: reqData.bulletId, bulletKind: reqData.bulletKind,
                    userId: reqData.userId, activeTime: Date.now()
                };
            }

            socket.broadcast.emit('user_fire_Reply', reqData);
        });

        // --- CATCH ---
        socket.on('catch_fish', (data) => {
            const reqData = parsePayload(data);
            const room = getRoom();
            const fishId = parseInt(reqData.fishId);
            const bulletId = reqData.bulletId;

            const fish = room.aliveFish[fishId];
            if (!fish) return;

            const fishDiff = FishMulti[fish.fishKind] || 2;
            const rtp = 0.97;
            const difficulty = fishDiff / rtp;

            const isHit = (Math.floor(Math.random() * difficulty) === 0);

            if (isHit) {
                const RoomBaseScores = { 1: 1, 2: 50, 3: 500, 4: 2000 };
                const rScore = RoomBaseScores[socket.currentRoomId || 1] || 1;
                const bMulti = BulletMulti[room.aliveBullets[bulletId]?.bulletKind || 1] || 1;

                const score = fishDiff * bMulti * rScore;

                // Add Score
                if (room.users[socket.userId]) {
                    room.users[socket.userId].score += score;
                }

                io.emit('catch_fish_reply', {
                    userId: reqData.userId, chairId: reqData.chairId,
                    fishId: String(fishId), bulletId: bulletId, addScore: score, item: ""
                });

                delete room.aliveFish[fishId];
            }

            if (bulletId) delete room.aliveBullets[bulletId];
        });

        // --- EXCHANGE / WITHDRAW (Secure Server-Side) ---
        // Handles "Score -> Gold" conversion atomically
        socket.on('exchange', (data) => {
            const reqData = parsePayload(data);
            const amount = parseInt(reqData.amount);
            if (!amount || amount <= 0) return;

            const room = getRoom();
            const user = room.users[socket.userId];
            if (!user) return;

            // Rule: Must keep 500
            if (user.score < amount + 500) {
                console.warn(`[Exchange] Failed. Must retain 500. Score: ${user.score}, Amount: ${amount}`);
                socket.emit('exchange_reply', { success: false, msg: "Must keep at least 500 coins" });
                return;
            }

            if (user.score >= amount) {
                // 1. Deduct Memory (Optimistic Lock)
                user.score -= amount;
                console.log(`[Exchange] User ${socket.userId} requesting withdraw of ${amount}. Locking Score.`);

                // 2. DB Transaction (Add Gold)
                db.run("UPDATE users SET gold_balance = gold_balance + ? WHERE id = ?", [amount, socket.userId], (err) => {
                    if (err) {
                        console.error(`[Exchange] DB Error for ${socket.userId}:`, err);
                        // Rollback
                        user.score += amount;
                        // socket.emit('exchange_reply', { success: false, msg: "Database Error" });
                    } else {
                        // 3. Persist Score to DB (Fix: Ensure points aren't lost on reload & Handle NULL)
                        db.run("UPDATE users SET fish_balance = COALESCE(fish_balance, 0) - ? WHERE id = ?", [amount, socket.userId], (err) => {
                            if (err) console.error(`[Exchange] Failed to persist score to DB for ${socket.userId}`, err);
                        });

                        // Log Transaction (Fix: Audit Trail)
                        const desc = `結算(出金) - Fish Master`;
                        const gameId = 1; // Assuming a default gameId for now, or retrieve from context if available
                        db.run("INSERT INTO wallet_transactions (user_id, amount, currency, type, description, game_id, created_at) VALUES (?, ?, 'gold', 'game_win', ?, ?, datetime('now', '+8 hours'))",
                            [socket.userId, amount, desc, gameId], (err) => {
                                if (err) console.error("Failed to log exchange transaction", err);
                            });

                        console.log(`[Exchange] Success! User ${socket.userId} converted ${amount} Score -> Gold.`);

                        // 4. Emit Success
                        socket.emit('exchange_reply', {
                            success: true,
                            addGold: amount,
                            newScore: user.score
                        });

                        // Force Sync Score immediately
                        socket.emit('game_sync_push', {
                            type: "score_update", userId: socket.userId, score: user.score
                        });
                    }
                });
            } else {
                console.warn(`[Exchange] ${socket.userId} insufficient score: ${user.score} < ${amount}`);
            }
        });

        // --- SPAWN LOOP ---
        function spawnFishBatch(socket, kindStart, kindEnd, intervalType) {
            if (!outputTraceConfig) return;
            const room = getRoom();
            const fishKind = Math.floor(Math.random() * (kindEnd - kindStart + 1)) + kindStart;

            // Random Trace
            let traceId = (intervalType === 4) ? (101 + Math.floor(Math.random() * 10)) :
                (Math.floor(Math.random() * 3) === 0 ? 201 + Math.floor(Math.random() * 17) : 101 + Math.floor(Math.random() * 10));

            const paths = outputTraceConfig[String(traceId)];
            if (!paths || paths.length === 0) return;

            const fishList = [];
            const addFish = (pathData) => {
                nextFishId++;
                const fId = nextFishId;
                const speed = (fishKind >= 30) ? 3 : 5;

                room.aliveFish[fId] = { fishId: fId, fishKind, trace: pathData, speed, activeTime: Date.now() };
                fishList.push({ fishId: fId, fishKind, trace: pathData, speed, activeTime: Date.now() });
            };

            if (intervalType === 1) {
                paths.forEach(p => addFish(p));
            } else {
                addFish(paths[0]); // Simple single spawn
            }

            if (fishList.length > 0) socket.emit('build_fish_reply', fishList);
        }

        function startFishLoop(socket) {
            if (socket.fishIntervals) socket.fishIntervals.forEach(t => clearInterval(t));
            socket.fishIntervals = [];

            const t1 = setInterval(() => { if (!socket.connected) clearAll(); else spawnFishBatch(socket, 1, 15, 1); }, 2000);
            const t2 = setInterval(() => { if (!socket.connected) clearAll(); else spawnFishBatch(socket, 16, 20, 2); }, 10000);
            const t3 = setInterval(() => { if (!socket.connected) clearAll(); else spawnFishBatch(socket, 21, 34, 3); }, 30000);
            const t4 = setInterval(() => { if (!socket.connected) clearAll(); else spawnFishBatch(socket, 35, 35, 4); }, 61000);

            socket.fishIntervals.push(t1, t2, t3, t4);

            function clearAll() {
                if (socket.fishIntervals) socket.fishIntervals.forEach(t => clearInterval(t));
                socket.fishIntervals = [];
            }
        }

        socket.on('disconnect', () => {
            if (socket.userId && socket.userId !== 'guest') {
                const room = getRoom();
                if (room.users[socket.userId]) {
                    saveUserToDB(socket.userId, room.users[socket.userId].score);
                    delete room.users[socket.userId]; // Cleanup memory
                }
            }

            if (socket.fishIntervals) {
                socket.fishIntervals.forEach(t => clearInterval(t));
                socket.fishIntervals = [];
            }
        });
    });

    // Global Periodic Save (Every 10s)
    setInterval(() => {
        const room = RoomState[1];
        Object.values(room.users).forEach(u => {
            if (u.userId !== 'guest' && u.online) { // Only save online legitimate users
                saveUserToDB(u.userId, u.score);
            }
        });
    }, 10000);

    httpServer.listen(port, () => {
        console.log(`Mock Server running on port ${port} [VERSION: REAL_V11_WALLET_FIXED]`);
    });
});
