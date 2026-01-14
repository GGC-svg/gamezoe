import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize verbose sqlite3
const sqlite3Verbose = sqlite3.verbose();

const dbPath = path.resolve(__dirname, 'gamezoe.db');
const db = new sqlite3Verbose.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database ' + dbPath, err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT,
            avatar TEXT,
            provider TEXT,
            role TEXT,
            gold_balance INTEGER DEFAULT 0,
            silver_balance INTEGER DEFAULT 0,
            fish_balance INTEGER DEFAULT 0
        )`, (err) => {
            if (!err) {
                // Migration: Ensure fish_balance exists (for existing DBs)
                db.all("PRAGMA table_info(users)", (err, cols) => {
                    if (!cols.find(c => c.name === 'fish_balance')) {
                        console.log("Migrating: Adding fish_balance column...");
                        db.run("ALTER TABLE users ADD COLUMN fish_balance INTEGER DEFAULT 0");
                    }
                    if (!cols.find(c => c.name === 'silver_balance')) {
                        db.run("ALTER TABLE users ADD COLUMN silver_balance INTEGER DEFAULT 0");
                    }
                    if (!cols.find(c => c.name === 'gold_balance')) {
                        db.run("ALTER TABLE users ADD COLUMN gold_balance INTEGER DEFAULT 0");
                    }
                });
            }
        });

        // Migration: Ensure games table has displayOrder
        db.all("PRAGMA table_info(games)", (err, cols) => {
            if (!err && cols) {
                if (!cols.find(c => c.name === 'displayOrder')) {
                    console.log("Migrating: Adding displayOrder column to games...");
                    db.run("ALTER TABLE games ADD COLUMN displayOrder INTEGER DEFAULT 0");
                }
            }
        });

        // Games Table
        // Updated to include all frontend fields and match naming (thumbnailUrl, coverUrl)
        db.run(`CREATE TABLE IF NOT EXISTS games (
            id TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            fullDescription TEXT,
            thumbnailUrl TEXT,
            coverUrl TEXT,
            gameUrl TEXT,
            developer TEXT,
            price REAL,
            isFree INTEGER,
            category TEXT,
            rating REAL,
            releaseDate TEXT,
            displayOrder INTEGER DEFAULT 0
        )`, (err) => {
            if (!err) {
                // Check if games exist, if not seed
                db.get("SELECT count(*) as count FROM games", (err, row) => {
                    if (row.count === 0) {
                        seedGames();
                    }
                });
            }
        });

        // Purchases Table
        db.run(`CREATE TABLE IF NOT EXISTS purchases (
            user_id TEXT,
            game_id TEXT,
            purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, game_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (game_id) REFERENCES games(id)
        )`);

        // Login Logs Table
        db.run(`CREATE TABLE IF NOT EXISTS login_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

        // Game Activities Table (Analytics)
        db.run(`CREATE TABLE IF NOT EXISTS game_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            game_id TEXT,
            start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP,
            ip_address TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (game_id) REFERENCES games(id)
        )`, (err) => {
            if (!err) {
                // Migration: Ensure game_activities has ip_address
                db.all("PRAGMA table_info(game_activities)", (err, cols) => {
                    if (!cols.find(c => c.name === 'ip_address')) {
                        console.log("Migrating: Adding ip_address column to game_activities...");
                        db.run("ALTER TABLE game_activities ADD COLUMN ip_address TEXT");
                    }
                    if (!cols.find(c => c.name === 'last_heartbeat')) {
                        db.run("ALTER TABLE game_activities ADD COLUMN last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP");
                    }
                });
            }
        });

        // Pricing Tiers Table
        db.run(`CREATE TABLE IF NOT EXISTS game_pricing_tiers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id TEXT NOT NULL,
            label TEXT NOT NULL,
            price_gold INTEGER NOT NULL,
            duration_minutes INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
        )`);

        // Wallet Transactions Table (Added for missing logs)
        db.run(`CREATE TABLE IF NOT EXISTS wallet_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT UNIQUE,
            user_id TEXT,
            amount INTEGER,
            currency TEXT DEFAULT 'gold',
            type TEXT,
            description TEXT,
            reference_id TEXT,
            status TEXT,
            game_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (!err) {
                // Migration: Ensure wallet_transactions has reference_id
                db.all("PRAGMA table_info(wallet_transactions)", (err, cols) => {
                    if (cols && !cols.find(c => c.name === 'reference_id')) {
                        console.log("Migrating: Adding reference_id column to wallet_transactions...");
                        db.run("ALTER TABLE wallet_transactions ADD COLUMN reference_id TEXT");
                    }
                });
            }
        });

        // User Game Balances Table (Per-game point balances)
        db.run(`CREATE TABLE IF NOT EXISTS user_game_balances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            game_id TEXT NOT NULL,
            balance INTEGER DEFAULT 0,
            total_deposited INTEGER DEFAULT 0,
            total_consumed INTEGER DEFAULT 0,
            total_withdrawn INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, game_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (game_id) REFERENCES games(id)
        )`);

        // User Library Table (Game ownership & rentals)
        db.run(`CREATE TABLE IF NOT EXISTS user_library (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            game_id TEXT NOT NULL,
            purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME,
            UNIQUE(user_id, game_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (game_id) REFERENCES games(id)
        )`, (err) => {
            if (!err) {
                // Migration: Ensure user_library has purchase_date
                db.all("PRAGMA table_info(user_library)", (err, cols) => {
                    if (cols && !cols.find(c => c.name === 'purchase_date')) {
                        console.log("Migrating: Adding purchase_date column to user_library...");
                        db.run("ALTER TABLE user_library ADD COLUMN purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP");
                    }
                    if (cols && !cols.find(c => c.name === 'expires_at')) {
                        console.log("Migrating: Adding expires_at column to user_library...");
                        db.run("ALTER TABLE user_library ADD COLUMN expires_at DATETIME");
                    }
                });
            }
        });

        // Admin Awards Table (Track admin point grants)
        db.run(`CREATE TABLE IF NOT EXISTS admin_awards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            amount INTEGER NOT NULL,
            currency TEXT DEFAULT 'gold',
            reason TEXT,
            admin_id TEXT NOT NULL,
            admin_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

        // User Suspensions Log Table
        db.run(`CREATE TABLE IF NOT EXISTS user_suspensions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            action TEXT NOT NULL,
            duration_hours INTEGER,
            suspended_until DATETIME,
            admin_id TEXT NOT NULL,
            admin_name TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

        // Migration: Add suspended_until to users table
        db.all("PRAGMA table_info(users)", (err, cols) => {
            if (cols && !cols.find(c => c.name === 'suspended_until')) {
                console.log("Migrating: Adding suspended_until column to users...");
                db.run("ALTER TABLE users ADD COLUMN suspended_until DATETIME");
            }
        });

        // Game Saves Table (Cross-device game progress sync)
        db.run(`CREATE TABLE IF NOT EXISTS game_saves (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            game_id TEXT NOT NULL,
            save_data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, game_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (game_id) REFERENCES games(id)
        )`);

        // P99PAY Orders Table (Payment gateway transactions)
        db.run(`CREATE TABLE IF NOT EXISTS p99_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT UNIQUE NOT NULL,
            rrn TEXT,
            user_id TEXT NOT NULL,
            amount_usd REAL NOT NULL,
            gold_amount INTEGER NOT NULL,
            paid TEXT,
            status TEXT DEFAULT 'pending',
            pay_status TEXT,
            rcode TEXT,
            erpc_verified INTEGER DEFAULT 0,
            settle_status TEXT,
            settle_rcode TEXT,
            notify_count INTEGER DEFAULT 0,
            raw_request TEXT,
            raw_response TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);
    });
}

function seedGames() {
    const MOCK_GAMES = [
        {
            id: 'g1',
            title: '星際奇航 (Star Voyage)',
            description: '探索未知的宇宙深處，建立您的星際艦隊。',
            fullDescription: '在這款壯闊的策略遊戲中，您將扮演一位艦隊指揮官，探索未知的星系，建立殖民地，並與其他文明進行貿易或戰爭。',
            thumbnailUrl: 'https://picsum.photos/id/1002/400/300',
            coverUrl: 'https://picsum.photos/id/1002/800/400',
            gameUrl: 'https://example.com/play/star-voyage',
            developer: 'Cosmic Studio',
            price: 0,
            isFree: 1,
            category: 'Strategy',
            rating: 4.8,
            releaseDate: '2025-01-15'
        },
        {
            id: 'g2',
            title: '深淵地牢 (Abyss Dungeon)',
            description: '經典 Roguelike 冒險，每次進入都是全新的挑戰。',
            fullDescription: '深入無盡的地牢，對抗邪惡的怪物，收集強力的裝備。每一次的死亡都是新的開始。',
            thumbnailUrl: 'https://picsum.photos/id/1015/400/300',
            coverUrl: 'https://picsum.photos/id/1015/800/400',
            gameUrl: 'https://example.com/play/abyss-dungeon',
            developer: 'Dungeon Master',
            price: 4.99,
            isFree: 0,
            category: 'RPG',
            rating: 4.5,
            releaseDate: '2024-11-20'
        },
        {
            id: 'g3',
            title: '極速狂飆 (Speed Racer)',
            description: '體驗最真實的賽車物理與極速快感。',
            fullDescription: '駕駛世界上最快的跑車，在世界各地的賽道上奔馳。挑戰極限，成為賽車之王。',
            thumbnailUrl: 'https://picsum.photos/id/1070/400/300',
            coverUrl: 'https://picsum.photos/id/1070/800/400',
            gameUrl: 'https://example.com/play/speed-racer',
            developer: 'Velocity Games',
            price: 9.99,
            isFree: 0,
            category: 'Racing',
            rating: 4.2,
            releaseDate: '2024-12-05'
        },
        {
            id: 'g4',
            title: '農場物語 (Farm Life)',
            description: '遠離塵囂，經營屬於您的溫馨農場。',
            fullDescription: '種植作物，飼養動物，與村民交流。享受寧靜的田園生活。',
            thumbnailUrl: 'https://picsum.photos/id/1080/400/300',
            coverUrl: 'https://picsum.photos/id/1080/800/400',
            gameUrl: 'https://example.com/play/farm-life',
            developer: 'Green Thumb',
            price: 0,
            isFree: 1,
            category: 'Simulation',
            rating: 4.7,
            releaseDate: '2024-10-10'
        },
        {
            id: 'g5',
            title: '暗影刺客 (Shadow Assassin)',
            description: '在陰影中行動，完成高難度的刺殺任務。',
            fullDescription: '利用潛行與暗殺技巧，消滅目標而不被發現。',
            thumbnailUrl: 'https://picsum.photos/id/103/400/300',
            coverUrl: 'https://picsum.photos/id/103/800/400',
            gameUrl: 'https://example.com/play/shadow-assassin',
            developer: 'Nightshade',
            price: 14.99,
            isFree: 0,
            category: 'Action',
            rating: 4.6,
            releaseDate: '2025-02-01'
        },
        {
            id: 'universalloc',
            title: 'UniversalLoc AI',
            description: '全領域專家級翻譯神器',
            fullDescription: '利用先進的 AI 技術，為您的遊戲和應用提供專業級的翻譯服務。',
            thumbnailUrl: '/games/universalloc-ai/icon.png', // Assuming icon exists or using placeholder
            coverUrl: '/games/universalloc-ai/cover.png',
            gameUrl: '/games/universalloc-ai---全領域專家級翻譯神器/dist/index.html', // Pointing to built static files
            developer: 'GameZoe AI',
            price: 0,
            isFree: 1,
            category: 'Utility',
            rating: 5.0,
            releaseDate: '2024-01-01'
        }
    ];

    const stmt = db.prepare(`INSERT INTO games (
        id, title, description, fullDescription, thumbnailUrl, coverUrl, gameUrl, developer, price, isFree, category, rating, releaseDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    MOCK_GAMES.forEach(game => {
        stmt.run(
            game.id, game.title, game.description, game.fullDescription,
            game.thumbnailUrl, game.coverUrl, game.gameUrl, game.developer,
            game.price, game.isFree, game.category, game.rating, game.releaseDate
        );
    });
    stmt.finalize();
    console.log("Seeded initial games data.");
}

export default db;
