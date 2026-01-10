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
        )`);

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
            status TEXT,
            game_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
            gameUrl: '/games/universalloc-ai---全領域專家級翻譯神器/index.html', // Pointing to local static file
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
