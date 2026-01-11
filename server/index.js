import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import db from './database.js';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000; // Default to 3000 for Nginx

// IMPORTANT: Increase payload limit for Base64 images
app.use(express.json({ limit: '10mb' }));
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://35.201.182.136'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like direct file access, curl, Postman, same-origin)
        if (!origin) return callback(null, true);

        // Dynamic check for gamezoe.com and its subdomains
        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('gamezoe.com')) {
            return callback(null, true);
        }

        console.error('CORS blocked origin:', origin); // Log the specific origin that was blocked
        var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true
}));

// Security Headers
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    strictTransportSecurity: false, // Disable HSTS for HTTP
    contentSecurityPolicy: false // Disable CSP for now to prevent upgrade-insecure-requests
}));

// [FIX] Serve index.css explicitly from root
app.use('/index.css', express.static(path.join(__dirname, '../index.css')));

// [PROXY] Proxy Fish Game server info to localhost:9000
// [FIX] Serve /get_serverinfo directly
app.get('/get_serverinfo', (req, res) => {
    // Return the public domain and port (443 for HTTPS)
    // Matching format from Port 9000 exactly to ensure client compatibility
    res.json({
        code: 0,
        msg: "success",
        status: 1,
        ip: "gamezoe.com",
        host: "gamezoe.com",
        port: 443,
        hall_ip: "gamezoe.com",
        hall_port: 443,
        hall: "gamezoe.com:443",
        wss_port: 443,
        secure: true,
        version: 1
    });
});

// [ALIAS] Also serve on /api/get_serverinfo to support cleaner routing
app.get('/api/get_serverinfo', (req, res) => {
    res.json({
        code: 0,
        msg: "success",
        status: 1,
        ip: "gamezoe.com",
        host: "gamezoe.com",
        port: 443,
        hall_ip: "gamezoe.com",
        hall_port: 443,
        hall: "gamezoe.com:443",
        wss_port: 443,
        secure: true,
        version: 1
    });
});

// [SAFEGUARD] Ensure game_activities table has required columns on startup
db.serialize(() => {
    db.all("PRAGMA table_info(game_activities)", (err, cols) => {
        if (!err && cols) {
            if (!cols.find(c => c.name === 'ip_address')) {
                console.log("[Startup] Adding ip_address to game_activities");
                db.run("ALTER TABLE game_activities ADD COLUMN ip_address TEXT");
            }
            if (!cols.find(c => c.name === 'last_heartbeat')) {
                console.log("[Startup] Adding last_heartbeat to game_activities");
                db.run("ALTER TABLE game_activities ADD COLUMN last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP");
            }
        }
    });
});

// [PROXY] Proxy Raw WebSocket for Fish Game (ws://127.0.0.1:9001)
const fishSocketProxy = createProxyMiddleware({
    // Port 9001 is served by myfish_server.js (Raw WS)
    target: 'http://127.0.0.1:9001',
    ws: true,
    changeOrigin: true,
    pathRewrite: { '^/fish-socket': '' }
});
app.use('/fish-socket', fishSocketProxy);

// [PROXY] Proxy requests to Fish Master Socket Server (127.0.0.1:9000)
app.use('/socket.io', createProxyMiddleware({
    target: 'http://127.0.0.1:9000',
    ws: true,
    changeOrigin: true
}));

// Serve Games Static Files (Directly from source, skipping build copy)
app.use('/games/slot-machine', express.static(path.join(__dirname, '../games/slot-machine')));
app.use('/games/slot-machine-2', express.static(path.join(__dirname, '../games/html5-slot-machine-main/dist')));
// [FIX] Serve Shared Game Resources (Sound, images) for MyFish
app.use('/resource', express.static(path.join(__dirname, '../games/my-fish/resource')));

// [FIX] Generic Route for ALL other games
// This allows /games/racing-1/index.html to look inside ../games/racing-1/index.html
app.use('/games', express.static(path.join(__dirname, '../games')));
// [MOVED] Static file serving moved to end of file (after all API routes) to prevent catch-all interference
// app.use(express.static(path.join(__dirname, '../dist')));

// --- AI PROXY (Secure) ---
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize GenAI
// Note: We initialize inside the request or use a global client.
// For @google/generative-ai, we create a client with the key.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

app.post('/api/ai/generate', async (req, res) => {
    // [SECURITY] Check if user is authenticated (Google OAuth)
    const { userId } = req.body;

    if (!userId) {
        console.warn('[AI API] Unauthorized request: No userId provided');
        return res.status(401).json({ error: "未授權：請先登入使用此功能" });
    }

    // Expecting: { model, contents, config }
    // Frontend sends 'contents' as a single string prompt.
    // 'config' contains: { systemInstruction, responseMimeType, responseSchema, ... }
    const { model: modelName, contents, config } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Server missing API Key config" });
    }

    try {
        console.log(`[AI API] Request from user: ${userId}`);

        // Extract systemInstruction if present
        const systemInstruction = config?.systemInstruction;

        // Create model instance
        const model = genAI.getGenerativeModel({
            model: modelName || "gemini-1.5-flash",
            systemInstruction: systemInstruction
        });

        // Prepare generation config (excluding systemInstruction)
        const generationConfig = { ...config };
        delete generationConfig.systemInstruction;

        // Generate content
        // contents from frontend is a string prompt
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: contents }] }],
            generationConfig: generationConfig
        });

        const response = await result.response;
        res.json({ text: response.text() });
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- ROUTES ---

// 1. Get All Games
app.get('/api/games', (req, res) => {
    db.all("SELECT * FROM games ORDER BY displayOrder ASC, title ASC", [], (err, rows) => {
        if (err) {
            console.error("Database Error in /api/games:", err);
            res.status(500).json({ error: err.message });
            return;
        }
        // Convert isFree from 0/1 to boolean for frontend
        const games = rows.map(g => ({
            ...g,
            isFree: g.isFree === 1
        }));
        res.json(games);
    });
});

// 1.5 Batch Reorder Games (Admin)
app.put('/api/games/reorder', (req, res) => {
    const { orderedIds } = req.body; // Array of game IDs in the new order

    if (!Array.isArray(orderedIds)) {
        res.status(400).json({ error: 'Invalid data format. orderedIds must be an array.' });
        return;
    }

    const stmt = db.prepare("UPDATE games SET displayOrder = ? WHERE id = ?");

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        orderedIds.forEach((id, index) => {
            stmt.run(index, id);
        });
        db.run("COMMIT", (err) => {
            if (err) {
                console.error("Transaction commit failed:", err);
                res.status(500).json({ error: "Failed to update order" });
            } else {
                res.json({ success: true, message: "Order updated successfully" });
            }
        });
        stmt.finalize();
    });
});

// 2. Create Game (Admin)
app.post('/api/games', (req, res) => {
    const {
        id, title, description, fullDescription,
        thumbnailUrl, coverUrl, gameUrl, developer,
        price, isFree, category, rating, releaseDate,
        pricingTiers // Expects array of { label, price_gold, duration_minutes }
    } = req.body;

    const isFreeInt = isFree ? 1 : 0;
    const finalRating = rating || 0;
    const finalReleaseDate = releaseDate || new Date().toISOString().split('T')[0];

    const sqlGame = `INSERT INTO games (
        id, title, description, fullDescription, 
        thumbnailUrl, coverUrl, gameUrl, developer, 
        price, isFree, category, rating, releaseDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const paramsGame = [
        id, title, description, fullDescription,
        thumbnailUrl, coverUrl, gameUrl, developer,
        price, isFreeInt, category, finalRating, finalReleaseDate
    ];

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        db.run(sqlGame, paramsGame, function (err) {
            if (err) {
                console.error("Failed to insert game:", err);
                db.run("ROLLBACK");
                res.status(500).json({ error: err.message });
                return;
            }

            // Insert Pricing Tiers if any
            if (pricingTiers && Array.isArray(pricingTiers) && pricingTiers.length > 0) {
                const sqlTier = `INSERT INTO game_pricing_tiers (game_id, label, price_gold, duration_minutes) VALUES (?, ?, ?, ?)`;
                const stmt = db.prepare(sqlTier);

                pricingTiers.forEach(tier => {
                    stmt.run(id, tier.label, tier.price_gold, tier.duration_minutes);
                });

                stmt.finalize(err => {
                    if (err) {
                        console.error("Failed to insert tiers:", err);
                        db.run("ROLLBACK");
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    db.run("COMMIT", err => {
                        if (err) {
                            db.run("ROLLBACK");
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({ ...req.body });
                    });
                });
            } else {
                db.run("COMMIT", err => {
                    if (err) {
                        db.run("ROLLBACK");
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    res.json({ ...req.body });
                });
            }
        });
    });
});

// 3. Update Game (Admin)
app.put('/api/games/:id', (req, res) => {
    const {
        title, description, fullDescription,
        thumbnailUrl, coverUrl, gameUrl, developer,
        price, isFree, category, rating, releaseDate
    } = req.body;

    const isFreeInt = isFree ? 1 : 0;
    const id = req.params.id;

    const sql = `UPDATE games SET 
        title = ?, description = ?, fullDescription = ?, 
        thumbnailUrl = ?, coverUrl = ?, gameUrl = ?, developer = ?, 
        price = ?, isFree = ?, category = ?, rating = ?, releaseDate = ? 
        WHERE id = ?`;

    const params = [
        title, description, fullDescription,
        thumbnailUrl, coverUrl, gameUrl, developer,
        price, isFreeInt, category, rating, releaseDate,
        id
    ];

    const pricingTiers = req.body.pricingTiers; // Expects array

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // 1. Update Game
        db.run(sql, params, function (err) {
            if (err) {
                console.error("Failed to update game:", err);
                db.run("ROLLBACK");
                res.status(500).json({ error: err.message });
                return;
            }

            // 2. Update Tiers (Delete old, Insert new)
            // Always delete old tiers first to ensure we match the current state
            db.run("DELETE FROM game_pricing_tiers WHERE game_id = ?", [id], (err) => {
                if (err) {
                    console.error("Failed to delete old tiers:", err);
                    db.run("ROLLBACK");
                    res.status(500).json({ error: err.message });
                    return;
                }

                if (pricingTiers && Array.isArray(pricingTiers) && pricingTiers.length > 0) {
                    const sqlTier = `INSERT INTO game_pricing_tiers (game_id, label, price_gold, duration_minutes) VALUES (?, ?, ?, ?)`;
                    const stmt = db.prepare(sqlTier);

                    pricingTiers.forEach(tier => {
                        stmt.run(id, tier.label, tier.price_gold, tier.duration_minutes);
                    });

                    stmt.finalize((err) => {
                        if (err) {
                            console.error("Failed to insert new tiers:", err);
                            db.run("ROLLBACK");
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        db.run("COMMIT", (err) => {
                            if (err) {
                                db.run("ROLLBACK");
                                res.status(500).json({ error: err.message });
                                return;
                            }
                            res.json({ ...req.body, id });
                        });
                    });
                } else {
                    // No new tiers, just commit the empty state (if user deleted all tiers)
                    db.run("COMMIT", (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        res.json({ ...req.body, id });
                    });
                }
            });
        });
    });
});

// 4. Delete Game (Admin)
app.delete('/api/games/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM games WHERE id = ?", id, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Deleted", id });
    });
});

// 5a. Google Login Verification
app.post('/api/auth/google-verify', async (req, res) => {
    const { accessToken } = req.body;

    try {
        // 1. Fetch User Info from Google
        const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            throw new Error('Invalid Access Token');
        }

        const googleUser = await response.json();

        // CRITICAL: Force to string IMMEDIATELY to prevent precision loss
        // Google's 'sub' can be a very large number that exceeds JavaScript's safe integer limit
        const id = String(googleUser.sub);
        const { name, email, picture: avatar } = googleUser;

        console.log('[Google Auth] Received ID:', id, '(type:', typeof id, ')');

        // 2. Upsert User in DB
        db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (row) {
                // User exists, fetch user_library instead of purchases
                db.all("SELECT game_id, expires_at FROM user_library WHERE user_id = ? AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)", [id], (err, rows) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    // Log Login
                    db.run("INSERT INTO login_logs (user_id, ip_address) VALUES (?, ?)", [id, req.ip]);

                    const purchasedGames = rows.map(r => r.game_id);
                    // Fix DATE parsing for library
                    const library = rows.map(r => {
                        let dStr = r.expires_at;
                        if (dStr && !dStr.endsWith('Z') && !dStr.includes('T')) {
                            dStr = dStr + 'Z';
                        }
                        return { gameId: r.game_id, expiresAt: dStr };
                    });
                    // CRITICAL: Ensure ID is string to prevent precision loss
                    res.json({ user: { ...row, id: String(row.id) }, purchasedGames, library });
                });
            } else {
                // Register new user
                const provider = 'google';
                const role = 'user'; // Default role
                // Initialize with 0 balance
                const sql = `INSERT INTO users (id, name, email, avatar, provider, role, gold_balance, silver_balance, fish_balance) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 500)`;
                db.run(sql, [id, name, email, avatar, provider, role], function (err) {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    // Log Login
                    db.run("INSERT INTO login_logs (user_id, ip_address, login_time) VALUES (?, ?, datetime('now', '+8 hours'))", [id, req.ip]);

                    // Return new user (ID already string from Google API)
                    res.json({
                        user: { id: String(id), name, email, avatar, provider, role, gold_balance: 0, silver_balance: 0 },
                        purchasedGames: []
                    });
                });
            }
        });

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ error: "Authentication failed" });
    }
});

// --- WALLET API ---

// Get Wallet Balance
app.get('/api/wallet/balance/:userId', (req, res) => {
    const { userId } = req.params;
    db.get("SELECT gold_balance, silver_balance FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json(row);
    });
});

// Top-up Gold (Mock Payment)
app.post('/api/wallet/topup', (req, res) => {
    const { userId, amountUSD } = req.body;

    // Rate: 1 USD = 100 Gold
    const goldAmount = Math.floor(amountUSD * 100);

    if (!goldAmount || goldAmount <= 0) {
        res.status(400).json({ error: "Invalid amount" });
        return;
    }

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // 1. Add Gold
        db.run("UPDATE users SET gold_balance = gold_balance + ? WHERE id = ?", [goldAmount, userId], (err) => {
            if (err) {
                db.run("ROLLBACK");
                res.status(500).json({ error: err.message });
                return;
            }

            // 2. Log Transaction
            const desc = `Top-up $${amountUSD}`;
            db.run("INSERT INTO wallet_transactions (user_id, amount, currency, type, description, created_at) VALUES (?, ?, 'gold', 'deposit', ?, datetime('now', '+8 hours'))",
                [userId, goldAmount, desc], (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    db.run("COMMIT", () => {
                        // Return new balance
                        db.get("SELECT gold_balance, silver_balance FROM users WHERE id = ?", [userId], (err, row) => {
                            res.json({ success: true, newBalance: row, addedGold: goldAmount });
                        });
                    });
                });
        });
    });
});


// --- BRIDGE API (For External Casinos) ---

const BRIDGE_API_KEY = "gamezoe-secure-bridge-key"; // In production, use env var

// Middleware to secure Bridge API
const verifyBridgeKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== BRIDGE_API_KEY) {
        return res.status(401).json({ error: "Unauthorized: Invalid API Key" });
    }
    next();
};

// 1. Get Balance (Bridge)
app.get('/api/bridge/balance/:userId', verifyBridgeKey, (req, res) => {
    const { userId } = req.params;
    db.get("SELECT gold_balance, silver_balance, fish_balance FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }
        res.json({ success: true, gold: row.gold_balance, silver: row.silver_balance, gameScore: row.fish_balance || 0 });
    });
});

// 1.5 Deposit to Game (Specific for Fish Master Passthrough)
app.post('/api/bridge/deposit', verifyBridgeKey, (req, res) => {
    const { userId, amount, gameId } = req.body;

    // Rate: 1 Gold = 1 Game Point (1:1)
    if (!userId || !amount || amount <= 0) {
        res.status(400).json({ error: "Invalid parameters" });
        return;
    }

    db.serialize(() => {
        db.get("SELECT gold_balance FROM users WHERE id = ?", [userId], (err, user) => {
            if (err || !user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            if (user.gold_balance < amount) {
                res.status(402).json({ error: "Insufficient funds" });
                return;
            }

            db.run("BEGIN TRANSACTION");

            // 1. Deduct Gold
            db.run("UPDATE users SET gold_balance = gold_balance - ? WHERE id = ?", [amount, userId], (err) => {
                if (err) {
                    db.run("ROLLBACK");
                    res.status(500).json({ error: err.message });
                    return;
                }

                // 2. Add to Fish Balance (Crucial Step!)
                // Note: Fish Master Client divides by 1000? No, we set 1:1 in DB now.
                // Assuming we want 1 Gold = 1 Gem in game.
                db.run("UPDATE users SET fish_balance = fish_balance + ? WHERE id = ?", [amount, userId], (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        res.status(500).json({ error: "Failed to update game balance" });
                        return;
                    }

                    // 3. Log Transaction
                    const logDesc = `Deposit to Fish Master`;
                    db.run("INSERT INTO wallet_transactions (user_id, amount, currency, type, description, created_at) VALUES (?, ?, 'gold', 'casino_deposit', ?, datetime('now', '+8 hours'))",
                        [userId, -amount, logDesc], (err) => {
                            if (err) {
                                db.run("ROLLBACK");
                                res.status(500).json({ error: err.message });
                                return;
                            }

                            db.run("COMMIT", () => {
                                // Return new balances
                                db.get("SELECT gold_balance, fish_balance FROM users WHERE id = ?", [userId], (err, finalRow) => {
                                    res.json({
                                        success: true,
                                        newGold: finalRow.gold_balance,
                                        newGame: finalRow.fish_balance
                                    });
                                });
                            });
                        });
                });
            });
        });
    });
});

// 2. Transfer Funds (Deposit/Withdraw)
app.post('/api/bridge/transfer', verifyBridgeKey, (req, res) => {
    const { userId, amount, type, externalRef, description } = req.body;
    // type: 'DEPOSIT' (Gold -> Casino) | 'WITHDRAW' (Casino -> Gold)
    // amount: Positive integer (Gold)

    if (!userId || !amount || amount <= 0 || !['DEPOSIT', 'WITHDRAW'].includes(type)) {
        res.status(400).json({ error: "Invalid request parameters" });
        return;
    }

    db.serialize(() => {
        db.get("SELECT gold_balance FROM users WHERE id = ?", [userId], (err, user) => {
            if (err || !user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            if (type === 'DEPOSIT' && user.gold_balance < amount) {
                res.status(402).json({ error: "Insufficient funds" });
                return;
            }

            db.run("BEGIN TRANSACTION");

            const balanceChange = type === 'DEPOSIT' ? -amount : amount;
            const logType = type === 'DEPOSIT' ? 'casino_deposit' : 'casino_withdraw';
            const logDesc = description || (type === 'DEPOSIT' ? 'Transfer to Casino' : 'Transfer from Casino');

            // 1. Update Balance
            db.run("UPDATE users SET gold_balance = gold_balance + ? WHERE id = ?", [balanceChange, userId], (err) => {
                if (err) {
                    db.run("ROLLBACK");
                    res.status(500).json({ error: err.message });
                    return;
                }

                // 2. Log Transaction
                db.run("INSERT INTO wallet_transactions (user_id, amount, currency, type, description, reference_id) VALUES (?, ?, 'gold', ?, ?, ?)",
                    [userId, balanceChange, logType, logDesc, externalRef], (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            res.status(500).json({ error: err.message });
                            return;
                        }

                        db.run("COMMIT", () => {
                            db.get("SELECT gold_balance FROM users WHERE id = ?", [userId], (err, finalRow) => {
                                res.json({
                                    success: true,
                                    newBalance: finalRow.gold_balance,
                                    txId: externalRef
                                });
                            });
                        });
                    });
            });
        });
    });
});


// --- GAME PRICING & ACCESS API ---

// Get Game Pricing Tiers
app.get('/api/games/:gameId/pricing', (req, res) => {
    const { gameId } = req.params;
    db.all("SELECT * FROM game_pricing_tiers WHERE game_id = ? ORDER BY price_gold ASC", [gameId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Admin: Set Game Pricing Tiers
// Input: { tiers: [{ label: '1 Hour', duration: 60, priceGold: 100, priceSilver: 100 }] }
app.post('/api/admin/games/:gameId/pricing', (req, res) => {
    const { gameId } = req.params;
    const { tiers } = req.body; // Expects an array of tiers

    if (!Array.isArray(tiers)) {
        res.status(400).json({ error: "Invalid tiers format" });
        return;
    }

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // 1. Clear existing tiers for this game
        db.run("DELETE FROM game_pricing_tiers WHERE game_id = ?", [gameId], (err) => {
            if (err) {
                db.run("ROLLBACK");
                res.status(500).json({ error: err.message });
                return;
            }

            // 2. Insert new tiers
            const stmt = db.prepare("INSERT INTO game_pricing_tiers (game_id, label, duration_minutes, price_gold, price_silver) VALUES (?, ?, ?, ?, ?)");

            for (const tier of tiers) {
                stmt.run(gameId, tier.label, tier.duration_minutes, tier.priceGold, tier.priceSilver, (err) => {
                    if (err) {
                        // If error in loop, we should technically handle it but for simplicity, let's log
                        console.error("Error inserting tier:", err);
                    }
                });
            }

            stmt.finalize(() => {
                db.run("COMMIT", () => {
                    res.json({ success: true, message: "Pricing tiers updated" });
                });
            });
        });
    });
});

// Purchase / Rent Game
app.post('/api/games/:gameId/purchase', (req, res) => {
    const { gameId } = req.params;
    const { userId, tierId } = req.body;

    if (!userId) {
        res.status(400).json({ error: "Missing userId" });
        return;
    }

    db.serialize(() => {
        // Function to process purchase after determining price and duration
        const processPurchase = (price, duration_minutes, label) => {
            // 1. Check User Balance
            db.get("SELECT gold_balance, silver_balance FROM users WHERE id = ?", [userId], (err, user) => {
                if (err || !user) {
                    res.status(404).json({ error: "User not found" });
                    return;
                }

                // Debug Logs
                console.log(`[Purchase Debug] User: ${userId}, Price: ${price}`);
                console.log(`[Purchase Debug] Balances - Gold: ${user.gold_balance}, Silver: ${user.silver_balance}`);

                let costSilver = 0;
                let costGold = 0;

                // ** Silver First Policy **
                // Safe check for silver_balance
                const silverBal = user.silver_balance || 0;
                if (silverBal >= price) {
                    costSilver = price;
                } else {
                    costSilver = silverBal;
                    costGold = price - costSilver;
                }

                console.log(`[Purchase Debug] Cost - Gold: ${costGold}, Silver: ${costSilver}`);

                if ((user.gold_balance || 0) < costGold) {
                    console.log(`[Purchase Debug] Insufficient Funds! Required: ${costGold}, Has: ${user.gold_balance}`);
                    res.status(402).json({ error: "Insufficient funds" });
                    return;
                }

                // 2. Execute Transaction
                db.run("BEGIN TRANSACTION");

                // Get Game Title for logging
                db.get("SELECT title FROM games WHERE id = ?", [gameId], (err, gameRow) => {
                    const gameTitle = gameRow ? gameRow.title : `Game #${gameId}`;
                    const desc = `購買 ${label} - ${gameTitle}`;

                    // Deduct Balance
                    db.run("UPDATE users SET gold_balance = gold_balance - ?, silver_balance = silver_balance - ? WHERE id = ?",
                        [costGold, costSilver, userId], (err) => {
                            if (err) {
                                db.run("ROLLBACK");
                                res.status(500).json({ error: err.message });
                                return;
                            }

                            // Record Wallet Transaction(s)
                            const recordTransaction = (amt, curr, next) => {
                                if (amt === 0) return next();
                                db.run("INSERT INTO wallet_transactions (user_id, amount, currency, type, description, reference_id, created_at) VALUES (?, ?, ?, 'game_rental', ?, ?, datetime('now', '+8 hours'))",
                                    [userId, -amt, curr, desc, gameId], (err) => {
                                        if (err) return next(err);
                                        next();
                                    });
                            };

                            // Sequential execution for safety
                            recordTransaction(costSilver, 'silver', (err) => {
                                if (err) {
                                    db.run("ROLLBACK");
                                    res.status(500).json({ error: err.message });
                                    return;
                                }
                                recordTransaction(costGold, 'gold', (err) => {
                                    if (err) {
                                        db.run("ROLLBACK");
                                        res.status(500).json({ error: err.message });
                                        return;
                                    }

                                    // Proceed to update library (Nest the rest of the logic here)

                                    // 3. Update User Library (Grant Access)
                                    // Calculate Expiry
                                    let querySql = "SELECT expires_at FROM user_library WHERE user_id = ? AND game_id = ?";
                                    db.get(querySql, [userId, gameId], (err, row) => {
                                        let baseTime = new Date();

                                        // If existing active rental, stack time
                                        if (row && row.expires_at) {
                                            let currentExpiry = new Date(row.expires_at);
                                            // Handle legacy non-ISO/UTC dates if necessary, though standardized now
                                            // If current expiry is in the future, use it as base
                                            if (currentExpiry > baseTime) {
                                                baseTime = currentExpiry;
                                            }
                                        }

                                        let expiresAt = null;
                                        if (duration_minutes > 0) {
                                            baseTime.setMinutes(baseTime.getMinutes() + duration_minutes);
                                            expiresAt = baseTime.toISOString();
                                        }

                                        // Upsert into user_library
                                        const simpleSql = `INSERT OR REPLACE INTO user_library (user_id, game_id, purchase_date, expires_at) VALUES (?, ?, CURRENT_TIMESTAMP, ?)`;

                                        db.run(simpleSql, [userId, gameId, expiresAt], (err) => {
                                            if (err) {
                                                db.run("ROLLBACK");
                                                res.status(500).json({ error: err.message });
                                                return;
                                            }

                                            db.run("COMMIT", () => {
                                                // Return updated balance and access info
                                                db.get("SELECT gold_balance, silver_balance FROM users WHERE id = ?", [userId], (err, newBalance) => {
                                                    res.json({ success: true, newBalance, expiresAt });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                });
            });

        };

        if (tierId) {
            // Tier Purchase
            db.get("SELECT * FROM game_pricing_tiers WHERE id = ?", [tierId], (err, tier) => {
                if (err || !tier) {
                    res.status(404).json({ error: "Pricing tier not found" });
                    return;
                }

                if (tier.game_id !== gameId) {
                    res.status(400).json({ error: "Tier does not match game" });
                    return;
                }

                processPurchase(tier.price_gold, tier.duration_minutes, tier.label);
            });
        } else {
            // Base Game Permanent Purchase
            db.get("SELECT * FROM games WHERE id = ?", [gameId], (err, game) => {
                if (err || !game) {
                    res.status(404).json({ error: "Game not found" });
                    return;
                }
                // Base price purchase is always permanent (duration = -1 or 0 -> expiresAt null)
                // Use a label like "永久買斷"
                processPurchase(game.price, 0, "永久買斷");
            });
        }




    });
});

app.post('/api/auth/login', (req, res) => {
    const { id, name, email, avatar, provider, role } = req.body;

    // Check if user exists
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        if (row) {
            // User exists, fetch their purchases AND library
            db.all("SELECT game_id, expires_at FROM user_library WHERE user_id = ?", [id], (err, rows) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                const purchasedGames = rows.map(r => r.game_id);
                // Return library with normalized dates
                const library = rows.map(r => {
                    let dStr = r.expires_at;
                    if (dStr && !dStr.endsWith('Z') && !dStr.includes('T')) {
                        dStr = dStr.replace(' ', 'T') + 'Z';
                    }
                    return { gameId: r.game_id, expiresAt: dStr };
                });

                // Log Login
                db.run("INSERT INTO login_logs (user_id, ip_address, login_time) VALUES (?, ?, datetime('now', '+8 hours'))", [id, req.ip]);

                res.json({ user: row, purchasedGames, library });
            });
        } else {
            // Register new user
            const sql = `INSERT INTO users (id, name, email, avatar, provider, role, fish_balance) VALUES (?, ?, ?, ?, ?, ?, 500)`;
            db.run(sql, [id, name, email, avatar, provider, role], function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                // Log Login
                db.run("INSERT INTO login_logs (user_id, ip_address, login_time) VALUES (?, ?, datetime('now', '+8 hours'))", [id, req.ip]);

                res.json({ user: req.body, purchasedGames: [] });
            });
        }
    });
});

// 6. Get User Session (By ID)
app.get('/api/users/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            db.all("SELECT game_id, expires_at FROM user_library WHERE user_id = ?", [id], (err, rows) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                const purchasedGames = rows.filter(r => {
                    if (!r.expires_at) return true; // Permanent
                    // Fix DATE parsing: treating SQL string as UTC if missing zone
                    let dStr = r.expires_at;
                    if (dStr && !dStr.endsWith('Z') && !dStr.includes('T')) {
                        // Legacy "YYYY-MM-DD HH:MM:SS" -> Treat as UTC
                        dStr = dStr.replace(' ', 'T') + 'Z';
                    }
                    return new Date(dStr) > new Date(); // Active Check
                }).map(r => r.game_id);

                // Return full library info too (for frontend timers)
                // Normalize dates in response
                const library = rows.map(r => {
                    let dStr = r.expires_at;
                    if (dStr && !dStr.endsWith('Z') && !dStr.includes('T')) {
                        dStr = dStr.replace(' ', 'T') + 'Z';
                    }
                    return { gameId: r.game_id, expiresAt: dStr };
                });
                // CRITICAL: Force ID to string to prevent precision loss
                res.json({ user: { ...row, id: String(row.id) }, purchasedGames, library });
            });
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
});

// 7. Purchase Game
app.post('/api/users/:userId/purchase', (req, res) => {
    const { userId } = req.params;
    const { gameId } = req.body;

    const sql = `INSERT OR IGNORE INTO purchases (user_id, game_id) VALUES (?, ?)`;
    db.run(sql, [userId, gameId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, gameId });
    });
});

// 8. Admin Reports
// Get Login Logs
app.get('/api/admin/logs', (req, res) => {
    const sql = `
        SELECT l.id, l.login_time, l.ip_address, u.name, u.email 
        FROM login_logs l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.login_time DESC
        LIMIT 100
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get Purchase History
app.get('/api/admin/purchases', (req, res) => {
    const sql = `
        SELECT p.purchase_date, u.name as user_name, u.email, g.title as game_title, g.price 
        FROM purchases p
        JOIN users u ON p.user_id = u.id
        JOIN games g ON p.game_id = g.id
        ORDER BY p.purchase_date DESC
        LIMIT 100
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});
// 9. Game Activity Tracking (Client)
app.post('/api/activity/start', (req, res) => {
    const { userId, gameId } = req.body;
    // Log request for debugging
    console.log(`[Activity] Start: User=${userId}, Game=${gameId}, IP=${req.ip}`);

    const sql = `INSERT INTO game_activities (user_id, game_id, start_time, last_heartbeat, ip_address) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)`;
    db.run(sql, [userId, gameId, req.ip], function (err) {
        if (err) {
            console.error("[Activity] Insert Error:", err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ activityId: this.lastID });
    });
});

app.post('/api/activity/heartbeat', (req, res) => {
    const { activityId } = req.body;
    const sql = `UPDATE game_activities SET last_heartbeat = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(sql, [activityId], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true });
    });
});

app.post('/api/activity/end', (req, res) => {
    const { activityId } = req.body;
    // Update both last_heartbeat and potentially an 'ended_at' column if we had one, 
    // but based on current schema, updating last_heartbeat to NOW is sufficient 
    // to mark the final time.
    const sql = `UPDATE game_activities SET last_heartbeat = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(sql, [activityId], function (err) {
        if (err) {
            console.error("Failed to end activity", err); // Log but don't crash client
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true });
    });
});

// Get Login Logs - Adding explicitly
app.get('/api/admin/logs', (req, res) => {
    const sql = `
        SELECT l.id, l.login_time, l.ip_address, u.name, u.email, u.id as user_id
        FROM login_logs l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.login_time DESC
        LIMIT 100
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get Purchases - Adding explicitly for update
app.get('/api/admin/purchases', (req, res) => {
    const sql = `
        SELECT wt.created_at as purchase_date, u.name as user_name, u.email, u.id as user_id, 
               wt.description as game_title, ABS(wt.amount) as price
        FROM wallet_transactions wt
        JOIN users u ON wt.user_id = u.id
        WHERE wt.amount < 0 AND wt.type = 'game_rental'
        ORDER BY wt.created_at DESC
        LIMIT 100
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// 10. Admin Analytics Reports
// Get Raw Activity Logs
app.get('/api/admin/activities', (req, res) => {
    const sql = `
        SELECT a.id, u.name as user_name, u.id as user_id, g.title as game_title, a.start_time, a.last_heartbeat, a.ip_address,
        (strftime('%s', a.last_heartbeat) - strftime('%s', a.start_time)) as duration_seconds
        FROM game_activities a
        JOIN users u ON a.user_id = u.id
        JOIN games g ON a.game_id = g.id
        ORDER BY a.start_time DESC
        LIMIT 100
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get Aggregated Analytics
app.get('/api/admin/analytics', (req, res) => {
    const analytics = {};

    // 1. Total Playtime per Game
    const sqlPlaytime = `
        SELECT g.title, SUM(strftime('%s', a.last_heartbeat) - strftime('%s', a.start_time)) as total_seconds, count(*) as play_count
        FROM game_activities a
        JOIN games g ON a.game_id = g.id
        GROUP BY g.title
        ORDER BY total_seconds DESC
    `;

    // 2. Total Users and Total Revenue
    const sqlStats = `
         SELECT 
         (SELECT count(*) FROM users) as total_users,
         (SELECT count(*) FROM purchases) as total_purchases
    `;

    db.serialize(() => {
        db.all(sqlPlaytime, [], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            analytics.gameStats = rows;

            db.get(sqlStats, [], (err, row) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                analytics.platformStats = row;
                res.json(analytics);
            });
        });
    });
});

// Admin: Manage Pricing Tiers
app.get('/api/admin/games/:gameId/tiers', (req, res) => {
    const { gameId } = req.params;
    db.all("SELECT * FROM game_pricing_tiers WHERE game_id = ?", [gameId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/admin/games/:gameId/tiers', (req, res) => {
    const { gameId } = req.params;
    const { label, price_gold, duration_minutes } = req.body;

    if (!label || !price_gold || duration_minutes === undefined) {
        res.status(400).json({ error: "Missing fields" });
        return;
    }

    const sql = `INSERT INTO game_pricing_tiers (game_id, label, price_gold, duration_minutes) VALUES (?, ?, ?, ?)`;
    db.run(sql, [gameId, label, price_gold, duration_minutes], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID, game_id: gameId, label, price_gold, duration_minutes });
    });
});

// Admin: Transaction History (Unified)
app.get('/api/admin/purchases', (req, res) => {
    const sql = `
        SELECT 
            wt.created_at as purchase_date, 
            wt.user_id, 
            wt.order_id,
            u.name as user_name, 
            u.email,
            COALESCE(wt.game_id, 'Platform') as game_title, 
            ABS(wt.amount) as price,
            wt.type,
            wt.description
        FROM wallet_transactions wt
        LEFT JOIN users u ON wt.user_id = u.id
        ORDER BY wt.created_at DESC
        LIMIT 100
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Admin: User Search
app.get('/api/admin/users/search', (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    const sql = `SELECT id, name, email, gold_balance FROM users WHERE id LIKE ? OR name LIKE ? OR email LIKE ?`;
    db.all(sql, [`%${q}%`, `%${q}%`, `%${q}%`], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Admin: Manual Top-up
app.post('/api/admin/users/topup', (req, res) => {
    const { userId, amount } = req.body;
    if (!userId || !amount) return res.status(400).json({ error: "Missing params" });

    // 1. Add Gold
    db.run("UPDATE users SET gold_balance = gold_balance + ? WHERE id = ?", [amount, userId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "User not found" });

        // 2. Log
        const orderId = `ADM-${Date.now()}`;
        db.run("INSERT INTO wallet_transactions (order_id, user_id, amount, currency, type, description, status, created_at) VALUES (?, ?, ?, 'gold', 'top_up', ?, 'COMPLETED', datetime('now', '+8 hours'))",
            [orderId, userId, amount, 'Admin Manual Top-up'], (err) => {
                if (err) console.error("Admin Topup Log Error", err);
                res.json({ success: true, newBalance: "Updated" });
            });
    });
});

app.delete('/api/admin/tiers/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM game_pricing_tiers WHERE id = ?", [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true });
    });
});
// --- PRODUCTION SERVING ---
// Serve game files - CRITICAL: Must be before other routes
app.use('/games', express.static(path.join(__dirname, '../games'), {
    maxAge: '1h',
    setHeaders: (res, path) => {
        if (path.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        }
    }
}));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../dist')));

// --- TRANSACTION HISTORY API ---

app.get('/api/wallet/transactions/:userId', (req, res) => {
    const { userId } = req.params;
    const limit = 50;

    db.all(
        "SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
        [userId, limit],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        }
    );
});

// --- LEADERBOARD API ---

// Get Top 100 for a Game
app.get('/api/games/:gameId/leaderboard', (req, res) => {
    const { gameId } = req.params;

    // Join with users table to get name and avatar
    const sql = `
        SELECT l.score, l.created_at, u.name, u.avatar 
        FROM leaderboards l
        JOIN users u ON l.user_id = u.id
        WHERE l.game_id = ?
        ORDER BY l.score DESC
        LIMIT 100
    `;

    db.all(sql, [gameId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Submit Score
app.post('/api/games/:gameId/score', (req, res) => {
    const { gameId } = req.params;
    const { userId, score } = req.body;

    if (!userId || score === undefined) {
        res.status(400).json({ error: "Missing userId or score" });
        return;
    }

    // Insert score
    // Improvement: We could check if this is a high score for the user and only keep the best, 
    // but for "Log every run" or "Daily best" logic, inserting all is safer for now.
    // The GET query automatically sorts by high score.
    // For a cleaner leaderboard (1 entry per user), the GET query would need logic like GROUP BY user_id MAX(score)
    // Let's stick to simple insert for now.

    const stmt = db.prepare("INSERT INTO leaderboards (game_id, user_id, score) VALUES (?, ?, ?)");
    stmt.run(gameId, userId, score, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ success: true, id: this.lastID });
    });
    stmt.finalize();
});

// Get User's Score History for a Game
app.get('/api/games/:gameId/scores/:userId', (req, res) => {
    const { gameId, userId } = req.params;

    db.all(
        "SELECT score, created_at FROM leaderboards WHERE game_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 50",
        [gameId, userId],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json(rows);
        }
    );
});






import { generateSignature, verifySignature } from './utils/signature.js';

// --- ROBUST TRANSACTION API (Two-Phase Commit) ---

// 0. BALANCE CHECK (Sync UI)
app.get('/api/bridge/balance/:userId', verifyBridgeKey, (req, res) => {
    const { userId } = req.params;
    db.get("SELECT gold_balance, fish_balance FROM users WHERE id = ?", [userId], (err, row) => {
        if (err) return res.status(500).json({ success: false, error: "DB Error" });
        if (!row) return res.status(404).json({ success: false, error: "User Not Found" });

        res.json({
            success: true,
            gold: row.gold_balance || 0,
            gameScore: row.fish_balance || 0
        });
    });
});

// 1. DEPOSIT (Platform Initiates) -> Step 01
app.post('/api/bridge/transaction/deposit', verifyBridgeKey, (req, res) => {
    const { userId, amount, gameId } = req.body;
    console.log(`[Platform] Deposit Request - User: ${userId}, Amount: ${amount}, Game: ${gameId}`);

    if (!userId || !amount || amount <= 0) {
        console.warn(`[Platform] Deposit Failed: Invalid params`);
        return res.status(400).json({ success: false, message: "Invalid parameters" });
    }

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = Math.floor(Date.now() / 1000);

    // 1. Deduct Gold (Atomic)
    db.run("UPDATE users SET gold_balance = gold_balance - ? WHERE id = ? AND gold_balance >= ?", [amount, userId, amount], function (err) {
        if (err) {
            console.error(`[Platform] Deposit DB Error:`, err);
            return res.status(500).json({ success: false, message: "Database Error" });
        }
        if (this.changes === 0) {
            console.warn(`[Platform] Deposit Failed: Insufficient Funds. User: ${userId}`);
            return res.status(400).json({ success: false, message: "Insufficient Funds" });
        }

        console.log(`[Platform] Funds Deducted. OrderId: ${orderId}`);

        // 2. Create Pending Record
        const gameNames = {
            'fish': 'Fish Master',
            'slot': 'Slot Machine',
            'g1': 'Star Voyage',
            'g2': 'Abyss Dungeon'
        };
        const gameName = gameNames[gameId] || gameId || 'Game';
        const desc = `Deposit to ${gameName}`;
        db.run("INSERT INTO wallet_transactions (order_id, user_id, amount, currency, type, description, status, game_id, created_at) VALUES (?, ?, ?, 'gold', 'transfer_out', ?, 'PENDING_GAME', ?, datetime('now', '+8 hours'))",
            [orderId, userId, -amount, desc, gameId], (err) => {
                if (err) {
                    console.error("Tx Log Error", err);
                    // If log fails, maybe we should stop? But money is deducted. Let's proceed or rollback.
                    // Proceeding for MVP but logging error.
                }

                // 3. Call Game Server (MOVED INSIDE CALLBACK)
                const gameServerUrl = "http://localhost:4002/api/game/v1/transaction/deposit";
                const payload = { order_id: orderId, user_id: userId, amount, timestamp };
                payload.signature = generateSignature(payload);

                console.log(`[Platform] Calling Game Server: ${gameServerUrl}`);

                fetch(gameServerUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-signature': payload.signature,
                        'x-api-key': 'gamezoe-secure-bridge-key'
                    },
                    body: JSON.stringify(payload)
                })
                    .then(r => r.json())
                    .then(gameRes => {
                        console.log(`[Platform] Game Server Response:`, gameRes);
                        if (gameRes.code === 200) {
                            db.run("UPDATE wallet_transactions SET status = 'COMPLETED' WHERE order_id = ?", [orderId]);
                            res.json({ success: true, orderId, message: "Deposit Successful" });
                        } else {
                            console.warn(`[Platform] Game Rejected Deposit: ${gameRes.message}`);
                            // Refund
                            db.run("UPDATE users SET gold_balance = gold_balance + ? WHERE id = ?", [amount, userId]);
                            db.run("UPDATE wallet_transactions SET status = 'REFUNDED' WHERE order_id = ?", [orderId]);
                            res.status(400).json({ success: false, message: "Game Server Error: " + (gameRes.message || "Unknown") });
                        }
                    })
                    .catch(e => {
                        console.error("[Platform] Game Server Call Failed (Network):", e);
                        // Refund
                        db.run("UPDATE users SET gold_balance = gold_balance + ? WHERE id = ?", [amount, userId]);
                        db.run("UPDATE wallet_transactions SET status = 'REFUNDED' WHERE order_id = ?", [orderId]);
                        res.status(502).json({ success: false, message: "Game Server Unavailable" });
                    });
            });
    });
});

// 2. WITHDRAW (Game Initiates) -> Step 02 (Receive Request)
app.post('/api/bridge/transaction/withdraw', (req, res) => {
    // Verify Signature
    const signature = req.headers['x-signature'];
    // const apiKey = req.headers['x-api-key']; // Verify Source

    // In a real app, verifying signature is mandatory.
    // For now, assuming Fish Master Mock sends correct data.

    const { order_id, user_id, amount, timestamp } = req.body;

    // TODO: Verify Signature using verifySignature(req.body, signature)

    const processWithdrawal = (isUpdate) => {
        // Add Gold
        db.run("UPDATE users SET gold_balance = gold_balance + ? WHERE id = ?", [amount, user_id], (err) => {
            if (err) return res.status(500).json({ code: 500, message: "DB Error" });

            // Log / Update Log
            const gameNames = {
                'fish': 'Fish Master',
                'slot': 'Slot Machine',
                'g1': 'Star Voyage',
                'g2': 'Abyss Dungeon'
            };
            const gameId = req.body.game_id || 'fish';
            const gameName = gameNames[gameId] || gameId || 'Game';
            const desc = `Settlement from ${gameName}`;

            if (isUpdate) {
                // UPDATE existing Pending Row
                db.run("UPDATE wallet_transactions SET status = 'COMPLETED', description = ?, type = 'game_win', currency = 'gold', updated_at = datetime('now', '+8 hours') WHERE order_id = ?",
                    [desc, order_id], (err) => {
                        if (err) console.error("Log Update Error", err);
                        res.json({
                            code: 200,
                            message: "SUCCESS",
                            data: { order_id, status: "COMPLETED" }
                        });
                    });
            } else {
                // INSERT New Row
                db.run("INSERT INTO wallet_transactions (order_id, user_id, amount, currency, type, description, status, game_id, created_at) VALUES (?, ?, ?, 'gold', 'game_win', ?, 'COMPLETED', ?, datetime('now', '+8 hours'))",
                    [order_id, user_id, amount, desc, gameId], (err) => {
                        if (err) console.error("Log Error", err);

                        res.json({
                            code: 200,
                            message: "SUCCESS",
                            data: { order_id, status: "COMPLETED" }
                        });
                    });
            }
        });
    };

    // Check Idempotency
    db.get("SELECT status FROM wallet_transactions WHERE order_id = ?", [order_id], (err, row) => {
        if (row) {
            if (row.status === 'COMPLETED') {
                return res.json({ code: 200, message: "Already Processed", data: { status: row.status } });
            } else if (row.status === 'PENDING_PLATFORM') {
                // Needs Processing
                return processWithdrawal(true);
            }
            return res.json({ code: 200, message: "Transaction in progress or failed", data: { status: row.status } });
        }

        // New Transaction
        processWithdrawal(false);
    });
});

// 3. CHECK STATUS (Reconciliation)
app.get('/api/bridge/transaction/:orderId', (req, res) => {
    const { orderId } = req.params;
    db.get("SELECT status FROM wallet_transactions WHERE order_id = ?", [orderId], (err, row) => {
        if (err || !row) return res.status(404).json({ code: 404, message: "Not Found" });
        res.json({ code: 200, data: { status: row.status } });
    });
});

// --- ADMIN API EXTENSIONS ---

// Get All Wallet Transactions (for Admin Dashboard)
app.get('/api/admin/transactions', (req, res) => {
    db.all("SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT 100", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});
app.post('/api/bridge/transaction/check', (req, res) => {
    const { order_id } = req.body;
    db.get("SELECT status FROM wallet_transactions WHERE order_id = ?", [order_id], (err, row) => {
        if (!row) return res.json({ status: "NOT_FOUND" });
        res.json({ status: row.status });
    });
});

// DEBUG ROUTE
app.get('/api/debug/local', (req, res) => {
    db.serialize(() => {
        const result = {};
        db.all("PRAGMA table_info(users)", (err, rows) => {
            result.columns = rows ? rows.map(r => r.name) : err.message;
            db.get("SELECT COUNT(*) as count FROM wallet_transactions", (err, row) => {
                result.txCount = row ? row.count : err.message;
                db.all("SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT 3", (err, rows) => {
                    result.lastTx = rows;
                    db.all("SELECT id, name, gold_balance, fish_balance FROM users", (err, rows) => {
                        result.users = rows;
                        res.json(result);
                    });
                });
            });
        });
    });
});

// Middleware to prevent SPA fallback for static assets
// If a file with an extension is not found by previous static handlers, 404 immediately.
app.use((req, res, next) => {
    // Check for common static file extensions
    if (/\.(js|css|png|jpg|jpeg|gif|ico|svg|json|mp3|wav|ogg)$/i.test(req.path)) {
        return res.status(404).send('Static file not found: ' + req.path);
    }
    next();
});

// The "catchall" handler: for any request that doesn't match above, send React App
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// 6. Start the Server

// --- ERROR HANDLING ---
app.use((err, req, res, next) => {
    console.error('[Global Server Error]', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Serving static files from: ${path.join(__dirname, '../dist')}`);
});

// [FIX] Manually handle WebSocket upgrades for /fish-socket
server.on('upgrade', (req, socket, head) => {
    if (req.url.startsWith('/fish-socket')) {
        console.log('[Upgrade] Upgrading /fish-socket request...');
        if (typeof fishSocketProxy.upgrade === 'function') {
            fishSocketProxy.upgrade(req, socket, head);
        } else {
            console.error('[Upgrade] Error: fishSocketProxy.upgrade is not a function. http-proxy-middleware v3 issue?');
            socket.destroy();
        }
    }
});


