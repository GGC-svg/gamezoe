
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'gamezoe.db');

const db = new sqlite3.Database(dbPath);

const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const all = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

async function migrate() {
    console.log("Starting Database Migration for Currency System...");

    try {
        // 1. Update Users Table (Add Balance Columns)
        console.log("--> updating users table...");
        try {
            await run("ALTER TABLE users ADD COLUMN gold_balance INTEGER DEFAULT 0");
            console.log("    Added gold_balance column.");
        } catch (e) {
            if (e.message.includes("duplicate column")) console.log("    gold_balance already exists.");
            else throw e;
        }

        try {
            await run("ALTER TABLE users ADD COLUMN silver_balance INTEGER DEFAULT 0");
            console.log("    Added silver_balance column.");
        } catch (e) {
            if (e.message.includes("duplicate column")) console.log("    silver_balance already exists.");
            else throw e;
        }

        // 2. Create Wallet Transactions Table
        console.log("--> Creating wallet_transactions table...");
        await run(`
            CREATE TABLE IF NOT EXISTS wallet_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                amount INTEGER NOT NULL,
                currency TEXT NOT NULL CHECK(currency IN ('gold', 'silver')),
                type TEXT NOT NULL,
                description TEXT,
                reference_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        // 3. Create Pricing Tiers Table
        console.log("--> Creating game_pricing_tiers table...");
        await run(`
            CREATE TABLE IF NOT EXISTS game_pricing_tiers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id TEXT NOT NULL,
                label TEXT NOT NULL,
                duration_minutes INTEGER NOT NULL,
                price_gold INTEGER DEFAULT 0,
                price_silver INTEGER DEFAULT 0,
                FOREIGN KEY(game_id) REFERENCES games(id)
            )
        `);

        // 4. Migrate Purchases to User Library (with Expiry)
        console.log("--> Migrating purchases to user_library...");

        // Create new table
        await run(`
            CREATE TABLE IF NOT EXISTS user_library (
                user_id TEXT NOT NULL,
                game_id TEXT NOT NULL,
                purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                PRIMARY KEY (user_id, game_id),
                FOREIGN KEY(user_id) REFERENCES users(id),
                FOREIGN KEY(game_id) REFERENCES games(id)
            )
        `);

        // Check if old purchases table exists
        const tables = await all("SELECT name FROM sqlite_master WHERE type='table' AND name='purchases'");
        if (tables.length > 0) {
            console.log("    Found old 'purchases' table. Copying data...");
            // Copy data: Existing purchases are considered "Permanent" (expires_at = NULL)
            await run(`
                INSERT OR IGNORE INTO user_library (user_id, game_id, purchase_date)
                SELECT user_id, game_id, purchase_date FROM purchases
            `);

            // Optional: Drop old table? No, let's keep it as backup for now, or rename it.
            // await run("ALTER TABLE purchases RENAME TO purchases_backup");
            console.log("    Data migrated.");
        }

        console.log("Migration Complete! 🎉");

    } catch (error) {
        console.error("Migration Failed:", error);
    } finally {
        db.close();
    }
}

migrate();
