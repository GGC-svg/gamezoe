
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

async function migrate() {
    console.log("Starting Leaderboard Migration...");

    try {
        // Create Leaderboards Table
        console.log("--> Creating leaderboards table...");
        await run(`
            CREATE TABLE IF NOT EXISTS leaderboards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                score INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(game_id) REFERENCES games(id),
                FOREIGN KEY(user_id) REFERENCES users(id)
            )
        `);

        // Index for performance on game_id and score
        await run("CREATE INDEX IF NOT EXISTS idx_leaderboard_game_score ON leaderboards(game_id, score DESC)");

        console.log("Migration Complete! 🎉");

    } catch (error) {
        console.error("Migration Failed:", error);
    } finally {
        db.close();
    }
}

migrate();
