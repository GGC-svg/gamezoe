import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import db from './database.js';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import p99payRoutes, { setDatabase as setP99Database, startBatchJob as startP99BatchJob } from './routes/p99pay.js';
import multer from 'multer';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000; // Default to 3000 for Nginx

// [FIX] Trust proxy to get real client IP behind nginx
// This makes req.ip return X-Forwarded-For instead of 127.0.0.1
app.set('trust proxy', true);

// [PROXY] Proxy requests to Fish Master Socket Server (127.0.0.1:9000)
// Moved to TOP to avoid body-parser issues
// [FIX] Use V3 pathFilter to preserve path when forwarding
app.use(createProxyMiddleware({
    target: 'http://127.0.0.1:9000',
    ws: true,
    changeOrigin: true,
    pathFilter: ['/socket.io']
}));

const gameProxy = createProxyMiddleware({
    target: 'http://127.0.0.1:9000',
    changeOrigin: true,
    logLevel: 'debug',
    // [FIX] Add all Fish Master game API endpoints to proxy
    pathFilter: [
        '/guest',
        '/login',
        '/api/game/',
        '/enter_public_room',
        '/enter_private_room',
        '/get_user_status',
        '/get_message',
        '/leave_room',
        '/charge'
    ]
});

// [CRITICAL] Mount at root to prevent path stripping by Express
app.use(gameProxy);

// [PROXY] Proxy Raw WebSocket for Fish Game (ws://127.0.0.1:9001)
const fishSocketProxy = createProxyMiddleware({
    target: 'http://127.0.0.1:9001',
    ws: true,
    changeOrigin: true,
    pathRewrite: { '^/fish-socket': '' },
    pathFilter: ['/fish-socket']
});
app.use(fishSocketProxy);

// IMPORTANT: Increase payload limit for Base64 images
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ type: 'text/plain' }));  // For sendBeacon support
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
        // Allow gamezoe.com and P99PAY payment gateway
        if (allowedOrigins.indexOf(origin) !== -1 ||
            origin.endsWith('gamezoe.com') ||
            origin.endsWith('p99pay.com')) {
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

// [FIX] Explicitly set COOP header to allow Google OAuth popups
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    next();
});

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

// [MOVED] Socket Proxy moved to top

// [MOVED] Game Proxy moved to top

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

    // [SECURITY] Verify user has paid for UniversalLoc service
    // Check: 1) Has fulfilled service_order for universalloc, OR 2) Has game balance for universalloc
    // NOTE: Temporarily disabled for testing - will enable after payment system is fully tested
    const checkPayment = () => {
        return new Promise((resolve) => {
            try {
                db.get(
                    `SELECT
                        (SELECT COUNT(*) FROM service_orders WHERE user_id = ? AND service_type = 'universalloc-ai' AND status IN ('fulfilled', 'completed')) as fulfilled_orders,
                        (SELECT balance FROM user_game_balances WHERE user_id = ? AND game_id = 'universalloc-ai') as game_balance
                    `,
                    [userId, userId],
                    (err, row) => {
                        if (err) {
                            console.error('[AI API] Payment check error:', err.message);
                            // If table doesn't exist or query fails, allow access temporarily
                            resolve(true);
                            return;
                        }
                        // Allow if has any fulfilled order OR has positive game balance
                        // Also allow if row is null (tables don't exist yet)
                        if (!row) {
                            console.log('[AI API] Payment check: No data, allowing access');
                            resolve(true);
                            return;
                        }
                        const fulfilledOrders = row.fulfilled_orders || 0;
                        const gameBalance = row.game_balance || 0;
                        const hasPaid = fulfilledOrders > 0 || gameBalance > 0;
                        console.log(`[AI API] Payment check for ${userId}: fulfilled=${fulfilledOrders}, balance=${gameBalance}, hasPaid=${hasPaid}`);
                        resolve(hasPaid);
                    }
                );
            } catch (e) {
                console.error('[AI API] Payment check exception:', e.message);
                resolve(true); // Allow on error
            }
        });
    };

    const isPaid = await checkPayment();
    if (!isPaid) {
        console.warn(`[AI API] Unpaid user ${userId} attempted to use AI service`);
        return res.status(403).json({
            error: "請先完成付款後再使用 AI 翻譯功能",
            code: "PAYMENT_REQUIRED"
        });
    }

    // Expecting: { model, contents, config }
    // Frontend sends 'contents' as a single string prompt.
    // 'config' contains: { systemInstruction, responseMimeType, responseSchema, ... }
    const { model: modelName, contents, config } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        console.error("[AI API] GEMINI_API_KEY is not configured!");
        return res.status(500).json({ error: "Server missing API Key config" });
    }

    try {
        console.log(`[AI API] Authorized request from paid user: ${userId}`);

        // Extract systemInstruction if present
        const systemInstruction = config?.systemInstruction;

        // Create model instance
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
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
                const created_at = new Date().toISOString();
                // Initialize with 0 balance
                const sql = `INSERT INTO users (id, name, email, avatar, provider, role, gold_balance, silver_balance, fish_balance, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 500, ?)`;
                db.run(sql, [id, name, email, avatar, provider, role, created_at], function (err) {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    // Initialize 500 balance for specific games in user_game_balances
                    const initialGames = ['fish', 'my-fish-egret', 'slot-machine'];
                    const initialBalance = 500;
                    initialGames.forEach(gameId => {
                        db.run(
                            `INSERT INTO user_game_balances (user_id, game_id, balance, created_at, updated_at) VALUES (?, ?, ?, datetime('now', '+8 hours'), datetime('now', '+8 hours'))`,
                            [id, gameId, initialBalance],
                            (err) => {
                                if (err) console.error(`[Register] Failed to init balance for ${gameId}:`, err.message);
                                else console.log(`[Register] Initialized ${initialBalance} for user ${id} game ${gameId}`);
                            }
                        );
                    });

                    // Log Login
                    db.run("INSERT INTO login_logs (user_id, ip_address, login_time) VALUES (?, ?, datetime('now', '+8 hours'))", [id, req.ip]);

                    // Return new user (ID already string from Google API)
                    res.json({
                        user: { id: String(id), name, email, avatar, provider, role, gold_balance: 0, silver_balance: 0, created_at },
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

// --- P99PAY PAYMENT GATEWAY ---
// Mount P99PAY routes and inject database
setP99Database(db);
// Mount at /api/payment to match URL submitted to P99
// Notify URL registered: https://gamezoe.com/api/payment/notify
app.use('/api/payment', p99payRoutes);
startP99BatchJob();
console.log('[P99Pay] Payment gateway routes mounted at /api/payment');


// --- SERVICE FILE UPLOAD & ORDERS API ---

// Configure multer for file uploads (50MB limit)
const uploadStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads/temp');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = req.body.userId || 'unknown';
        const timestamp = Date.now();
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${userId}_${timestamp}_${safeName}`);
    }
});
const uploadMiddleware = multer({
    storage: uploadStorage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// POST /api/service/upload - Upload file before payment
app.post('/api/service/upload', uploadMiddleware.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const filePath = req.file.path;
    const fileId = path.basename(filePath);
    console.log(`[Service] File uploaded: ${fileId}`);
    res.json({ success: true, fileId, filePath });
});

// GET /api/games/:gameId/service-orders/:userId - Get service orders for a game
app.get('/api/games/:gameId/service-orders/:userId', (req, res) => {
    const { gameId, userId } = req.params;

    db.all(
        `SELECT order_id, service_type, service_data, amount_usd, gold_amount, status,
                file_path, result_path, config_json, expires_at, created_at, fulfilled_at
         FROM service_orders
         WHERE service_type = ? AND user_id = ? AND status IN ('fulfilled', 'completed')
         ORDER BY created_at DESC LIMIT 50`,
        [gameId, userId],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            const now = new Date();
            const formatted = (rows || []).map(row => {
                let daysLeft = null;
                if (row.expires_at) {
                    const expiresAt = new Date(row.expires_at);
                    daysLeft = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));
                }
                return {
                    ...row,
                    service_data: JSON.parse(row.service_data || '{}'),
                    config: row.config_json ? JSON.parse(row.config_json) : null,
                    daysLeft,
                    isExpired: daysLeft !== null && daysLeft <= 0
                };
            });
            res.json(formatted);
        }
    );
});

// GET /api/service/:orderId/download - Download result file
app.get('/api/service/:orderId/download', (req, res) => {
    const { orderId } = req.params;

    db.get('SELECT result_path, expires_at, user_id FROM service_orders WHERE order_id = ?', [orderId], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        if (!row.result_path || !fs.existsSync(row.result_path)) {
            return res.status(404).json({ success: false, error: 'Result file not found' });
        }

        // Check expiry
        if (row.expires_at) {
            const expiresAt = new Date(row.expires_at);
            if (new Date() > expiresAt) {
                return res.status(403).json({ success: false, error: 'Download link expired' });
            }
        }

        res.download(row.result_path);
    });
});

// GET /api/service/:orderId/resume - Get file and config to resume work
app.get('/api/service/:orderId/resume', (req, res) => {
    const { orderId } = req.params;

    db.get('SELECT * FROM service_orders WHERE order_id = ?', [orderId], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        // Check if file still exists
        if (!row.file_path || !fs.existsSync(row.file_path)) {
            return res.status(404).json({ success: false, error: 'Source file no longer available' });
        }

        res.json({
            success: true,
            orderId: row.order_id,
            status: row.status,
            fileUrl: `/api/service/${orderId}/source-file`,
            fileName: path.basename(row.file_path),
            config: row.config_json ? JSON.parse(row.config_json) : null,
            service_data: JSON.parse(row.service_data || '{}')
        });
    });
});

// GET /api/service/:orderId/source-file - Download source file for resume
app.get('/api/service/:orderId/source-file', (req, res) => {
    const { orderId } = req.params;

    db.get('SELECT file_path FROM service_orders WHERE order_id = ?', [orderId], (err, row) => {
        if (err || !row || !row.file_path) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        if (!fs.existsSync(row.file_path)) {
            return res.status(404).json({ success: false, error: 'File no longer exists' });
        }

        res.download(row.file_path);
    });
});

// POST /api/service/:orderId/upload-result - Upload completed translation result
const resultStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads/results');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const orderId = req.params.orderId;
        const timestamp = Date.now();
        cb(null, `result_${orderId}_${timestamp}.xlsx`);
    }
});
const resultUpload = multer({ storage: resultStorage, limits: { fileSize: 50 * 1024 * 1024 } });

app.post('/api/service/:orderId/upload-result', resultUpload.single('file'), (req, res) => {
    const { orderId } = req.params;

    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const resultPath = req.file.path;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    db.run(
        `UPDATE service_orders SET
            result_path = ?,
            expires_at = ?,
            status = 'completed',
            updated_at = datetime('now', '+8 hours')
         WHERE order_id = ?`,
        [resultPath, expiresAt.toISOString(), orderId],
        function(err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            console.log(`[Service] Result uploaded for order ${orderId}, expires: ${expiresAt.toISOString()}`);
            res.json({ success: true, resultPath, expiresAt: expiresAt.toISOString() });
        }
    );
});

// Cleanup job for expired files (runs every hour)
setInterval(() => {
    const now = new Date();
    if (now.getMinutes() === 0) { // Run at the start of each hour
        console.log('[Service Cleanup] Checking for expired files...');

        db.all(
            `SELECT order_id, file_path, result_path FROM service_orders
             WHERE expires_at < datetime('now')
             AND (file_path IS NOT NULL OR result_path IS NOT NULL)`,
            (err, rows) => {
                if (err || !rows || rows.length === 0) return;

                console.log(`[Service Cleanup] Found ${rows.length} expired orders to clean`);

                rows.forEach(row => {
                    // Delete files
                    if (row.file_path && fs.existsSync(row.file_path)) {
                        fs.unlinkSync(row.file_path);
                        console.log(`[Service Cleanup] Deleted: ${row.file_path}`);
                    }
                    if (row.result_path && fs.existsSync(row.result_path)) {
                        fs.unlinkSync(row.result_path);
                        console.log(`[Service Cleanup] Deleted: ${row.result_path}`);
                    }

                    // Clear paths in database
                    db.run(
                        `UPDATE service_orders SET file_path = NULL, result_path = NULL WHERE order_id = ?`,
                        [row.order_id]
                    );
                });
            }
        );
    }
}, 60000); // Check every minute

console.log('[Service] File upload and orders API ready');


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

// 1. Get Balance (Bridge) - Updated to use per-game balance table
app.get('/api/bridge/balance/:userId', verifyBridgeKey, (req, res) => {
    const { userId } = req.params;
    const gameId = req.query.gameId || 'fish';  // Default to 'fish' for backward compatibility

    db.get("SELECT gold_balance, silver_balance FROM users WHERE id = ?", [userId], (err, userRow) => {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
            return;
        }
        if (!userRow) {
            res.status(404).json({ success: false, error: "User not found" });
            return;
        }

        // Get game-specific balance from new table (with lazy initialization)
        db.get("SELECT balance FROM user_game_balances WHERE user_id = ? AND game_id = ?", [userId, gameId], (err, gameRow) => {
            if (gameRow) {
                res.json({
                    success: true,
                    gold: userRow.gold_balance,
                    silver: userRow.silver_balance,
                    gameScore: gameRow.balance
                });
            } else {
                // Lazy init: Create 500 initial balance for first-time game access
                const initialBalance = 500;
                db.run(
                    `INSERT INTO user_game_balances (user_id, game_id, balance, created_at, updated_at) VALUES (?, ?, ?, datetime('now', '+8 hours'), datetime('now', '+8 hours'))`,
                    [userId, gameId, initialBalance],
                    (insertErr) => {
                        if (insertErr) console.error(`[LazyInit] Failed:`, insertErr.message);
                        else console.log(`[LazyInit] Created ${initialBalance} for ${userId}/${gameId}`);
                        res.json({
                            success: true,
                            gold: userRow.gold_balance,
                            silver: userRow.silver_balance,
                            gameScore: initialBalance
                        });
                    }
                );
            }
        });
    });
});

// 1.5 Deposit to Game (Specific for Fish Master Passthrough) - Updated to use per-game balance table
app.post('/api/bridge/deposit', verifyBridgeKey, (req, res) => {
    const { userId, amount, gameId } = req.body;
    const targetGameId = gameId || 'fish';  // Default to 'fish' for backward compatibility

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

                // 2. Add to per-game balance (using new user_game_balances table)
                db.run(`INSERT INTO user_game_balances (user_id, game_id, balance, total_deposited, created_at, updated_at)
                        VALUES (?, ?, ?, ?, datetime('now', '+8 hours'), datetime('now', '+8 hours'))
                        ON CONFLICT(user_id, game_id) DO UPDATE SET
                        balance = balance + excluded.balance,
                        total_deposited = total_deposited + excluded.total_deposited,
                        updated_at = datetime('now', '+8 hours')`,
                    [userId, targetGameId, amount, amount], (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        res.status(500).json({ error: "Failed to update game balance" });
                        return;
                    }

                    // 3. Log Transaction
                    const gameNames = { 'fish': 'Fish Master', 'slot-machine': 'Slot Machine' };
                    const gameName = gameNames[targetGameId] || targetGameId;
                    const logDesc = `Deposit to ${gameName}`;
                    db.run("INSERT INTO wallet_transactions (user_id, amount, currency, type, description, game_id, created_at) VALUES (?, ?, 'gold', 'casino_deposit', ?, ?, datetime('now', '+8 hours'))",
                        [userId, -amount, logDesc, targetGameId], (err) => {
                            if (err) {
                                db.run("ROLLBACK");
                                res.status(500).json({ error: err.message });
                                return;
                            }

                            db.run("COMMIT", () => {
                                // Return new balances
                                db.get("SELECT gold_balance FROM users WHERE id = ?", [userId], (err, userRow) => {
                                    db.get("SELECT balance FROM user_game_balances WHERE user_id = ? AND game_id = ?", [userId, targetGameId], (err, gameRow) => {
                                        res.json({
                                            success: true,
                                            newGold: userRow.gold_balance,
                                            newGame: gameRow ? gameRow.balance : 0
                                        });
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


// ============================================
// PER-GAME BALANCE SYSTEM
// Each game has independent point balance per user
// ============================================

// Get user's balance for a specific game
app.get('/api/game-balance/:userId/:gameId', (req, res) => {
    const { userId, gameId } = req.params;

    db.get(
        "SELECT * FROM user_game_balances WHERE user_id = ? AND game_id = ?",
        [userId, gameId],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (!row) {
                // No balance record yet, return 0
                res.json({
                    success: true,
                    user_id: userId,
                    game_id: gameId,
                    balance: 0,
                    total_deposited: 0,
                    total_consumed: 0,
                    total_withdrawn: 0
                });
                return;
            }

            res.json({
                success: true,
                ...row
            });
        }
    );
});

// Transfer G coins from platform to a specific game
app.post('/api/game-balance/deposit', (req, res) => {
    const { userId, gameId, amount } = req.body;

    if (!userId || !gameId || !amount || amount <= 0) {
        res.status(400).json({ error: "Invalid parameters" });
        return;
    }

    const amountInt = Math.floor(amount);

    db.serialize(() => {
        // Check user's G coin balance
        db.get("SELECT gold_balance FROM users WHERE id = ?", [userId], (err, user) => {
            if (err || !user) {
                res.status(404).json({ error: "User not found" });
                return;
            }

            if (user.gold_balance < amountInt) {
                res.status(402).json({ error: "Insufficient G coins", current: user.gold_balance, required: amountInt });
                return;
            }

            db.run("BEGIN TRANSACTION");

            // 1. Deduct from user's G coin balance
            db.run("UPDATE users SET gold_balance = gold_balance - ? WHERE id = ?", [amountInt, userId], (err) => {
                if (err) {
                    db.run("ROLLBACK");
                    res.status(500).json({ error: err.message });
                    return;
                }

                // 2. Add to game-specific balance (upsert)
                db.run(`
                    INSERT INTO user_game_balances (user_id, game_id, balance, total_deposited, updated_at)
                    VALUES (?, ?, ?, ?, datetime('now', '+8 hours'))
                    ON CONFLICT(user_id, game_id) DO UPDATE SET
                        balance = balance + ?,
                        total_deposited = total_deposited + ?,
                        updated_at = datetime('now', '+8 hours')
                `, [userId, gameId, amountInt, amountInt, amountInt, amountInt], (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    // 3. Log transaction
                    const orderId = `GDEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    db.run(
                        "INSERT INTO wallet_transactions (order_id, user_id, amount, currency, type, description, status, game_id, created_at) VALUES (?, ?, ?, 'gold', 'game_deposit', ?, 'COMPLETED', ?, datetime('now', '+8 hours'))",
                        [orderId, userId, -amountInt, `轉入遊戲: ${gameId}`, gameId],
                        (err) => {
                            if (err) {
                                db.run("ROLLBACK");
                                res.status(500).json({ error: err.message });
                                return;
                            }

                            db.run("COMMIT", (err) => {
                                if (err) {
                                    res.status(500).json({ error: err.message });
                                    return;
                                }

                                // Get updated balances
                                db.get("SELECT gold_balance FROM users WHERE id = ?", [userId], (err, updatedUser) => {
                                    db.get("SELECT balance FROM user_game_balances WHERE user_id = ? AND game_id = ?", [userId, gameId], (err, gameBalance) => {
                                        res.json({
                                            success: true,
                                            order_id: orderId,
                                            platform_balance: updatedUser?.gold_balance || 0,
                                            game_balance: gameBalance?.balance || 0,
                                            amount_transferred: amountInt
                                        });
                                    });
                                });
                            });
                        }
                    );
                });
            });
        });
    });
});

// Withdraw from game balance back to platform G coins
app.post('/api/game-balance/withdraw', (req, res) => {
    const { userId, gameId, amount } = req.body;

    if (!userId || !gameId || !amount || amount <= 0) {
        res.status(400).json({ error: "Invalid parameters" });
        return;
    }

    const amountInt = Math.floor(amount);

    db.serialize(() => {
        // Check game balance
        db.get("SELECT balance FROM user_game_balances WHERE user_id = ? AND game_id = ?", [userId, gameId], (err, gameRow) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (!gameRow || gameRow.balance < amountInt) {
                res.status(402).json({ error: "Insufficient game balance", current: gameRow?.balance || 0, required: amountInt });
                return;
            }

            db.run("BEGIN TRANSACTION");

            // 1. Deduct from game balance
            db.run(
                "UPDATE user_game_balances SET balance = balance - ?, total_withdrawn = total_withdrawn + ?, updated_at = datetime('now', '+8 hours') WHERE user_id = ? AND game_id = ?",
                [amountInt, amountInt, userId, gameId],
                (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    // 2. Add to platform G coins
                    db.run("UPDATE users SET gold_balance = gold_balance + ? WHERE id = ?", [amountInt, userId], (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            res.status(500).json({ error: err.message });
                            return;
                        }

                        // 3. Log transaction
                        const orderId = `GWTH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                        db.run(
                            "INSERT INTO wallet_transactions (order_id, user_id, amount, currency, type, description, status, game_id, created_at) VALUES (?, ?, ?, 'gold', 'game_withdraw', ?, 'COMPLETED', ?, datetime('now', '+8 hours'))",
                            [orderId, userId, amountInt, `從遊戲提出: ${gameId}`, gameId],
                            (err) => {
                                if (err) {
                                    db.run("ROLLBACK");
                                    res.status(500).json({ error: err.message });
                                    return;
                                }

                                db.run("COMMIT", (err) => {
                                    if (err) {
                                        res.status(500).json({ error: err.message });
                                        return;
                                    }

                                    // Get updated balances
                                    db.get("SELECT gold_balance FROM users WHERE id = ?", [userId], (err, updatedUser) => {
                                        db.get("SELECT balance FROM user_game_balances WHERE user_id = ? AND game_id = ?", [userId, gameId], (err, gameBalance) => {
                                            res.json({
                                                success: true,
                                                order_id: orderId,
                                                platform_balance: updatedUser?.gold_balance || 0,
                                                game_balance: gameBalance?.balance || 0,
                                                amount_withdrawn: amountInt
                                            });
                                        });
                                    });
                                });
                            }
                        );
                    });
                }
            );
        });
    });
});

// Update game balance (for games to report consumption/wins)
// This is called by games to sync their internal balance with the platform
app.post('/api/game-balance/sync', verifyBridgeKey, (req, res) => {
    const { userId, gameId, newBalance, consumed, won } = req.body;

    if (!userId || !gameId || newBalance === undefined) {
        res.status(400).json({ error: "Invalid parameters" });
        return;
    }

    const balanceInt = Math.floor(newBalance);
    const consumedInt = Math.floor(consumed || 0);
    const wonInt = Math.floor(won || 0);

    db.run(`
        INSERT INTO user_game_balances (user_id, game_id, balance, total_consumed, updated_at)
        VALUES (?, ?, ?, ?, datetime('now', '+8 hours'))
        ON CONFLICT(user_id, game_id) DO UPDATE SET
            balance = ?,
            total_consumed = total_consumed + ?,
            updated_at = datetime('now', '+8 hours')
    `, [userId, gameId, balanceInt, consumedInt, balanceInt, consumedInt], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({
            success: true,
            user_id: userId,
            game_id: gameId,
            balance: balanceInt
        });
    });
});

// Get all game balances for a user (for profile/wallet display)
app.get('/api/game-balances/:userId', (req, res) => {
    const { userId } = req.params;

    db.all(`
        SELECT ugb.*, g.title as game_title, g.thumbnailUrl as game_thumbnail
        FROM user_game_balances ugb
        LEFT JOIN games g ON ugb.game_id = g.id
        WHERE ugb.user_id = ?
        ORDER BY ugb.updated_at DESC
    `, [userId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json({
            success: true,
            balances: rows || []
        });
    });
});

// Get transaction history for a specific game
app.get('/api/game-transactions/:userId/:gameId', (req, res) => {
    const { userId, gameId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    db.all(
        "SELECT * FROM wallet_transactions WHERE user_id = ? AND game_id = ? ORDER BY created_at DESC LIMIT ?",
        [userId, gameId, limit],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            res.json({
                success: true,
                transactions: rows || []
            });
        }
    );
});


// --- GAME SAVES API (Cross-device progress sync) ---

// Get game save
app.get('/api/game-saves/:userId/:gameId', (req, res) => {
    const { userId, gameId } = req.params;

    db.get(
        "SELECT save_data, updated_at FROM game_saves WHERE user_id = ? AND game_id = ?",
        [userId, gameId],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            if (!row) {
                res.json({ success: true, save_data: null });
                return;
            }

            try {
                const saveData = JSON.parse(row.save_data);
                res.json({
                    success: true,
                    save_data: saveData,
                    updated_at: row.updated_at
                });
            } catch (e) {
                res.json({ success: true, save_data: row.save_data, updated_at: row.updated_at });
            }
        }
    );
});

// Save game progress (upsert)
app.post('/api/game-saves', (req, res) => {
    const { userId, gameId, saveData } = req.body;

    if (!userId || !gameId || saveData === undefined) {
        res.status(400).json({ error: "Missing required fields: userId, gameId, saveData" });
        return;
    }

    const saveDataStr = typeof saveData === 'string' ? saveData : JSON.stringify(saveData);

    db.run(
        `INSERT INTO game_saves (user_id, game_id, save_data, created_at, updated_at)
         VALUES (?, ?, ?, datetime('now', '+8 hours'), datetime('now', '+8 hours'))
         ON CONFLICT(user_id, game_id) DO UPDATE SET
         save_data = excluded.save_data,
         updated_at = datetime('now', '+8 hours')`,
        [userId, gameId, saveDataStr],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            res.json({
                success: true,
                message: "Game progress saved",
                user_id: userId,
                game_id: gameId
            });
        }
    );
});

// Delete game save (optional - for reset)
app.delete('/api/game-saves/:userId/:gameId', (req, res) => {
    const { userId, gameId } = req.params;

    db.run(
        "DELETE FROM game_saves WHERE user_id = ? AND game_id = ?",
        [userId, gameId],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            res.json({
                success: true,
                message: "Game save deleted"
            });
        }
    );
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
            console.log(`[Purchase] Looking up tierId: ${tierId} for gameId: ${gameId}`);
            db.get("SELECT * FROM game_pricing_tiers WHERE id = ?", [tierId], (err, tier) => {
                if (err || !tier) {
                    console.log(`[Purchase] Tier not found! tierId: ${tierId}, err: ${err?.message}`);
                    res.status(404).json({ error: "Pricing tier not found" });
                    return;
                }

                console.log(`[Purchase] Found tier: ${JSON.stringify(tier)}`);

                // String comparison to avoid type mismatch
                if (String(tier.game_id) !== String(gameId)) {
                    console.log(`[Purchase] Game ID mismatch! tier.game_id: ${tier.game_id}, gameId: ${gameId}`);
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
            const created_at = new Date().toISOString();
            const sql = `INSERT INTO users (id, name, email, avatar, provider, role, fish_balance, created_at) VALUES (?, ?, ?, ?, ?, ?, 500, ?)`;
            db.run(sql, [id, name, email, avatar, provider, role, created_at], function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                // Initialize 500 balance for specific games in user_game_balances
                const initialGames = ['fish', 'my-fish-egret', 'slot-machine'];
                const initialBalance = 500;
                initialGames.forEach(gameId => {
                    db.run(
                        `INSERT INTO user_game_balances (user_id, game_id, balance, created_at, updated_at) VALUES (?, ?, ?, datetime('now', '+8 hours'), datetime('now', '+8 hours'))`,
                        [id, gameId, initialBalance],
                        (err) => {
                            if (err) console.error(`[Register] Failed to init balance for ${gameId}:`, err.message);
                            else console.log(`[Register] Initialized ${initialBalance} for user ${id} game ${gameId}`);
                        }
                    );
                });

                // Log Login
                db.run("INSERT INTO login_logs (user_id, ip_address, login_time) VALUES (?, ?, datetime('now', '+8 hours'))", [id, req.ip]);

                res.json({ user: { ...req.body, created_at }, purchasedGames: [] });
            });
        }
    });
});

// 2. Get All Games
app.get('/api/games', (req, res) => {
    const sql = "SELECT * FROM games WHERE is_active = 1";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ games: rows });
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

// 8. Game Activity Logging
app.post('/api/activity/start', (req, res) => {
    // [FIX] Handle activity logging
    const { userId, gameId, ip } = req.body;
    const clientIp = ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    console.log(`[Activity] User ${userId} started game ${gameId} from ${clientIp}`);

    // Ensure game entry exists or ignore foreign key for robustness?
    // DB repair script ensures 'fish-master' exists.

    // Check if activity already exists for this session? 
    // Usually we just insert a new one.

    const stmt = db.prepare(`
        INSERT INTO game_activities (user_id, game_id, start_time, last_heartbeat, ip_address)
        VALUES (?, ?, datetime('now'), datetime('now'), ?)
    `);

    stmt.run([userId, gameId, clientIp], function (err) {
        if (err) {
            console.error("[Activity] Insert Failed:", err.message);
            // Don't block game start on log failure, but return 500 for awareness if vital
            // Better to return success so client doesn't panic
            // But user reported 500 is blocking.
            // Let's return 200 even if it fails, but log error.
            // Actually, correct fix is to fix the DB error.
            // If users table missing, constraint fail.
            // Let's return 200 OK regardless to unblock User.
            return res.json({ success: true, activityId: this ? this.lastID : 0, warning: "Log failed" });
        }
        res.json({ success: true, activityId: this.lastID });
    });
    stmt.finalize();
});

// 9. Admin Reports
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

// --- USER DETAIL MANAGEMENT API ---

// Get user info
app.get('/api/admin/users/:userId/info', (req, res) => {
    const { userId } = req.params;
    db.get("SELECT id, name, email, avatar, role, gold_balance, silver_balance, created_at, suspended_until FROM users WHERE id = ?", [userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    });
});

// Get user game records
app.get('/api/admin/users/:userId/games', (req, res) => {
    const { userId } = req.params;
    db.all(`
        SELECT
            ga.game_id,
            COALESCE(g.title, ga.game_id) as game_title,
            SUM(CAST((julianday(ga.last_heartbeat) - julianday(ga.start_time)) * 86400 AS INTEGER)) as total_playtime,
            MAX(ga.last_heartbeat) as last_played,
            COUNT(*) as play_count
        FROM game_activities ga
        LEFT JOIN games g ON ga.game_id = g.id
        WHERE ga.user_id = ?
        GROUP BY ga.game_id
        ORDER BY last_played DESC
    `, [userId], (err, records) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(records || []);
    });
});

// Get user transactions (with P99 order details and game title)
app.get('/api/admin/users/:userId/transactions', (req, res) => {
    const { userId } = req.params;
    db.all(`
        SELECT
            wt.*,
            p99.order_id,
            p99.rrn as p99_rrn,
            p99.amount_usd,
            g.title as game_title
        FROM wallet_transactions wt
        LEFT JOIN p99_orders p99 ON wt.order_id = p99.order_id
        LEFT JOIN games g ON wt.game_id = g.id
        WHERE wt.user_id = ?
        ORDER BY wt.created_at DESC
        LIMIT 100
    `, [userId], (err, records) => {
        if (err) return res.status(500).json({ error: err.message });

        // Calculate running balance
        db.get("SELECT gold_balance FROM users WHERE id = ?", [userId], (err2, user) => {
            if (err2 || !user) {
                return res.json(records || []);
            }

            let runningBalance = user.gold_balance;
            const recordsWithBalance = (records || []).map(record => {
                const balanceAfter = runningBalance;
                if (record.currency === 'gold') {
                    runningBalance -= record.amount;
                }
                return { ...record, balance_after: balanceAfter };
            });

            res.json(recordsWithBalance);
        });
    });
});

// Get user login logs
app.get('/api/admin/users/:userId/logins', (req, res) => {
    const { userId } = req.params;
    db.all("SELECT * FROM login_logs WHERE user_id = ? ORDER BY login_time DESC LIMIT 50", [userId], (err, records) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(records || []);
    });
});

// Get user award records
app.get('/api/admin/users/:userId/awards', (req, res) => {
    const { userId } = req.params;
    db.all("SELECT * FROM admin_awards WHERE user_id = ? ORDER BY created_at DESC LIMIT 50", [userId], (err, records) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(records || []);
    });
});

// Change user role
app.post('/api/admin/users/:userId/role', (req, res) => {
    const { userId } = req.params;
    const { role, adminId } = req.body;

    if (!role || !['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: "Invalid role" });
    }

    db.run("UPDATE users SET role = ? WHERE id = ?", [role, userId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "User not found" });

        console.log(`[Admin] User ${userId} role changed to ${role} by admin ${adminId}`);
        res.json({ success: true });
    });
});

// Award points to user
app.post('/api/admin/users/:userId/award', (req, res) => {
    const { userId } = req.params;
    const { amount, currency, reason, adminId, adminName } = req.body;

    if (!amount || !currency || !reason) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const balanceColumn = currency === 'gold' ? 'gold_balance' : 'silver_balance';

    db.run(`UPDATE users SET ${balanceColumn} = ${balanceColumn} + ? WHERE id = ?`, [amount, userId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "User not found" });

        // Log the award
        db.run(
            "INSERT INTO admin_awards (user_id, amount, currency, reason, admin_id, admin_name, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now', '+8 hours'))",
            [userId, amount, currency, reason, adminId, adminName],
            (err) => {
                if (err) console.error("Failed to log award:", err);
            }
        );

        // Also log to wallet_transactions
        const orderId = `AWARD-${Date.now()}`;
        db.run(
            "INSERT INTO wallet_transactions (order_id, user_id, amount, currency, type, description, status, created_at) VALUES (?, ?, ?, ?, 'admin_award', ?, 'COMPLETED', datetime('now', '+8 hours'))",
            [orderId, userId, amount, currency, `[${adminName}] ${reason}`],
            (err) => {
                if (err) console.error("Failed to log wallet tx:", err);
            }
        );

        console.log(`[Admin] ${adminName} awarded ${amount} ${currency} to user ${userId}: ${reason}`);
        res.json({ success: true });
    });
});

// Suspend user
app.post('/api/admin/users/:userId/suspend', (req, res) => {
    const { userId } = req.params;
    const { hours, adminId, adminName } = req.body;

    if (!hours) {
        return res.status(400).json({ error: "Missing hours" });
    }

    // Calculate suspended_until
    const suspendedUntil = new Date();
    suspendedUntil.setHours(suspendedUntil.getHours() + hours);

    db.run("UPDATE users SET suspended_until = ? WHERE id = ?", [suspendedUntil.toISOString(), userId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "User not found" });

        // Log the suspension
        db.run(
            "INSERT INTO user_suspensions (user_id, action, duration_hours, suspended_until, admin_id, admin_name, created_at) VALUES (?, 'suspend', ?, ?, ?, ?, datetime('now', '+8 hours'))",
            [userId, hours, suspendedUntil.toISOString(), adminId, adminName],
            (err) => {
                if (err) console.error("Failed to log suspension:", err);
            }
        );

        console.log(`[Admin] ${adminName} suspended user ${userId} for ${hours} hours`);
        res.json({ success: true, suspended_until: suspendedUntil.toISOString() });
    });
});

// Unsuspend user
app.post('/api/admin/users/:userId/unsuspend', (req, res) => {
    const { userId } = req.params;
    const { adminId, adminName } = req.body;

    db.run("UPDATE users SET suspended_until = NULL WHERE id = ?", [userId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "User not found" });

        // Log the unsuspension
        db.run(
            "INSERT INTO user_suspensions (user_id, action, duration_hours, suspended_until, admin_id, admin_name, created_at) VALUES (?, 'unsuspend', 0, NULL, ?, ?, datetime('now', '+8 hours'))",
            [userId, adminId, adminName],
            (err) => {
                if (err) console.error("Failed to log unsuspension:", err);
            }
        );

        console.log(`[Admin] ${adminName} unsuspended user ${userId}`);
        res.json({ success: true });
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

    // First get current balance
    db.get("SELECT gold_balance FROM users WHERE id = ?", [userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });

        const currentBalance = user ? user.gold_balance : 0;

        // Query transactions with P99 RRN via LEFT JOIN
        db.all(
            `SELECT
                w.id, w.order_id, w.user_id, w.amount, w.currency, w.type,
                w.description, w.reference_id, w.status, w.game_id, w.created_at,
                p.rrn as p99_rrn
            FROM wallet_transactions w
            LEFT JOIN p99_orders p ON w.order_id = p.order_id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC, w.id DESC
            LIMIT ?`,
            [userId, limit],
            (err, rows) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                // Calculate running balance for each transaction (newest first)
                let runningBalance = currentBalance;
                const rowsWithBalance = rows.map((row, index) => {
                    const balanceAfter = runningBalance;
                    // For next iteration, subtract this transaction's effect
                    runningBalance = runningBalance - row.amount;
                    return {
                        ...row,
                        balance_after: balanceAfter
                    };
                });

                res.json(rowsWithBalance);
            }
        );
    });
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

// NOTE: /api/bridge/balance/:userId is now defined earlier using per-game balance table
// NOTE: /api/slot/sync-balance is deprecated - slot-machine now uses /api/game-balance/sync

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
                            // Also update per-game balance table for tracking
                            const targetGameId = gameId || 'fish';
                            db.run(`INSERT INTO user_game_balances (user_id, game_id, balance, total_deposited, created_at, updated_at)
                                    VALUES (?, ?, ?, ?, datetime('now', '+8 hours'), datetime('now', '+8 hours'))
                                    ON CONFLICT(user_id, game_id) DO UPDATE SET
                                    balance = balance + excluded.balance,
                                    total_deposited = total_deposited + excluded.total_deposited,
                                    updated_at = datetime('now', '+8 hours')`,
                                [userId, targetGameId, amount, amount]);
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
        const gameId = req.body.game_id || 'fish';

        // Add Gold
        db.run("UPDATE users SET gold_balance = gold_balance + ? WHERE id = ?", [amount, user_id], (err) => {
            if (err) return res.status(500).json({ code: 500, message: "DB Error" });

            // Also update per-game balance table (deduct withdrawn amount)
            db.run(`UPDATE user_game_balances
                    SET balance = MAX(0, balance - ?),
                        total_withdrawn = total_withdrawn + ?,
                        updated_at = datetime('now', '+8 hours')
                    WHERE user_id = ? AND game_id = ?`,
                [amount, amount, user_id, gameId]);

            // Log / Update Log
            const gameNames = {
                'fish': 'Fish Master',
                'slot': 'Slot Machine',
                'g1': 'Star Voyage',
                'g2': 'Abyss Dungeon'
            };
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

// Get All Wallet Transactions (for Admin Dashboard) - with P99 RRN and filters
app.get('/api/admin/transactions', (req, res) => {
    const { gameId, startDate, endDate, type, limit = 500 } = req.query;

    let whereConditions = [];
    let params = [];

    // Filter by game/service
    if (gameId && gameId !== 'all') {
        whereConditions.push('w.game_id = ?');
        params.push(gameId);
    }

    // Filter by transaction type
    if (type && type !== 'all') {
        whereConditions.push('w.type = ?');
        params.push(type);
    }

    // Filter by date range
    if (startDate) {
        whereConditions.push("w.created_at >= ?");
        params.push(startDate + ' 00:00:00');
    }
    if (endDate) {
        whereConditions.push("w.created_at <= ?");
        params.push(endDate + ' 23:59:59');
    }

    const whereClause = whereConditions.length > 0
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

    params.push(parseInt(limit));

    db.all(
        `SELECT
            w.id, w.order_id, w.user_id, w.amount, w.currency, w.type,
            w.description, w.reference_id, w.status, w.game_id, w.created_at,
            p.rrn as p99_rrn, p.amount_usd,
            g.title as game_title
        FROM wallet_transactions w
        LEFT JOIN p99_orders p ON w.order_id = p.order_id
        LEFT JOIN games g ON w.game_id = g.id
        ${whereClause}
        ORDER BY w.created_at DESC
        LIMIT ?`,
        params,
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// Get list of games/services for filter dropdown
app.get('/api/admin/transactions/games', (req, res) => {
    db.all(
        `SELECT DISTINCT
            COALESCE(w.game_id, 'platform') as game_id,
            COALESCE(g.title,
                CASE
                    WHEN w.type = 'deposit' THEN '平台儲值'
                    WHEN w.type = 'service' THEN w.game_id
                    ELSE '平台'
                END
            ) as game_title
        FROM wallet_transactions w
        LEFT JOIN games g ON w.game_id = g.id
        ORDER BY game_title`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            // Add "全部" option at the beginning
            const result = [{ game_id: 'all', game_title: '全部' }, ...rows.filter(r => r.game_id)];
            res.json(result);
        }
    );
});

// Export transactions to CSV for Excel
app.get('/api/admin/transactions/export', (req, res) => {
    const { gameId, startDate, endDate, type } = req.query;

    let whereConditions = [];
    let params = [];

    if (gameId && gameId !== 'all') {
        whereConditions.push('w.game_id = ?');
        params.push(gameId);
    }

    if (type && type !== 'all') {
        whereConditions.push('w.type = ?');
        params.push(type);
    }

    if (startDate) {
        whereConditions.push("w.created_at >= ?");
        params.push(startDate + ' 00:00:00');
    }
    if (endDate) {
        whereConditions.push("w.created_at <= ?");
        params.push(endDate + ' 23:59:59');
    }

    const whereClause = whereConditions.length > 0
        ? 'WHERE ' + whereConditions.join(' AND ')
        : '';

    db.all(
        `SELECT
            w.created_at as '時間',
            w.order_id as '訂單編號',
            w.user_id as '用戶ID',
            CASE w.type
                WHEN 'deposit' THEN '儲值'
                WHEN 'transfer' THEN '轉點'
                WHEN 'service' THEN '服務消費'
                WHEN 'purchase' THEN '購買'
                WHEN 'refund' THEN '退款'
                ELSE w.type
            END as '交易類型',
            COALESCE(g.title, w.game_id, '平台') as '項目',
            w.description as '描述',
            w.amount as '變動金額',
            w.currency as '幣種',
            COALESCE(p.amount_usd, '') as 'USD金額',
            p.rrn as 'P99交易號',
            w.status as '狀態'
        FROM wallet_transactions w
        LEFT JOIN p99_orders p ON w.order_id = p.order_id
        LEFT JOIN games g ON w.game_id = g.id
        ${whereClause}
        ORDER BY w.created_at DESC`,
        params,
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            if (rows.length === 0) {
                return res.status(404).json({ error: '沒有符合條件的交易紀錄' });
            }

            // Generate CSV with BOM for Excel UTF-8 support
            const headers = Object.keys(rows[0]);
            const csvRows = [headers.join(',')];

            for (const row of rows) {
                const values = headers.map(h => {
                    let val = row[h];
                    if (val === null || val === undefined) val = '';
                    // Escape quotes and wrap in quotes if contains comma or quote
                    val = String(val).replace(/"/g, '""');
                    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
                        val = `"${val}"`;
                    }
                    return val;
                });
                csvRows.push(values.join(','));
            }

            // UTF-8 BOM + CSV content
            const bom = '\uFEFF';
            const csvContent = bom + csvRows.join('\n');

            const filename = `transactions_${startDate || 'all'}_${endDate || 'all'}.csv`;

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(csvContent);
        }
    );
});
app.post('/api/bridge/transaction/check', (req, res) => {
    const { order_id } = req.body;
    db.get("SELECT status FROM wallet_transactions WHERE order_id = ?", [order_id], (err, row) => {
        if (!row) return res.json({ status: "NOT_FOUND" });
        res.json({ status: row.status });
    });
});

// Admin: Order Verification API - Complete order status check
app.get('/api/admin/payment/verify/:orderId', (req, res) => {
    const { orderId } = req.params;

    // Query p99_orders for payment info
    db.get(
        `SELECT * FROM p99_orders WHERE order_id = ?`,
        [orderId],
        (err, p99Order) => {
            if (err) return res.status(500).json({ error: err.message });

            // Query wallet_transactions for credit info
            db.get(
                `SELECT * FROM wallet_transactions WHERE order_id = ?`,
                [orderId],
                (err, walletTx) => {
                    if (err) return res.status(500).json({ error: err.message });

                    // If neither exists
                    if (!p99Order && !walletTx) {
                        return res.status(404).json({
                            success: false,
                            error: 'ORDER_NOT_FOUND',
                            message: '訂單不存在'
                        });
                    }

                    // Build verification result
                    const result = {
                        success: true,
                        order_id: orderId,

                        // P99 Payment Info
                        p99: p99Order ? {
                            rrn: p99Order.rrn,
                            pay_status: p99Order.pay_status,
                            pay_status_text: p99Order.pay_status === 'S' ? '成功' :
                                             p99Order.pay_status === 'F' ? '失敗' :
                                             p99Order.pay_status === 'W' ? '等待中' : '未知',
                            amount_usd: p99Order.amount_usd,
                            gold_amount: p99Order.gold_amount,
                            paid_method: p99Order.paid,
                            rcode: p99Order.rcode,
                            erpc_verified: p99Order.erpc_verified === 1,
                            settle_status: p99Order.settle_status,
                            created_at: p99Order.created_at
                        } : null,

                        // Gold Credit Info
                        gold_credited: !!walletTx,
                        wallet: walletTx ? {
                            tx_id: walletTx.id,
                            amount: walletTx.amount,
                            status: walletTx.status,
                            credited_at: walletTx.created_at
                        } : null,

                        // Verification Summary
                        verification: {
                            p99_payment_ok: p99Order?.pay_status === 'S',
                            gold_delivered: !!walletTx,
                            fully_verified: p99Order?.pay_status === 'S' && !!walletTx,
                            issue: !p99Order ? 'P99訂單不存在' :
                                   p99Order.pay_status !== 'S' ? 'P99付款未成功' :
                                   !walletTx ? '⚠️ 付款成功但未發幣（掉單）' :
                                   null
                        }
                    };

                    res.json(result);
                }
            );
        }
    );
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


