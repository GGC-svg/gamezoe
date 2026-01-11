
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Adjust path to point to server/gamezoe.db
// Script is in server/scripts/, database is in server/
const dbPath = path.resolve(__dirname, '../gamezoe.db');

console.log(`Open database at: ${dbPath}`);
const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database(dbPath);

db.serialize(() => {
    console.log("Checking game_activities table schema...");

    db.all("PRAGMA table_info(game_activities)", (err, cols) => {
        if (err) {
            console.error("Failed to get table info:", err);
            return;
        }

        if (!cols) {
            console.error("Table game_activities does not exist!");
            // Create it if missing completely
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
                if (err) console.error("Create table failed:", err);
                else console.log("Created game_activities table.");
            });
            return;
        }

        console.log("Current columns:", cols.map(c => c.name).join(', '));

        // Fix ip_address
        if (!cols.find(c => c.name === 'ip_address')) {
            console.log("Adding missing column: ip_address");
            db.run("ALTER TABLE game_activities ADD COLUMN ip_address TEXT", (err) => {
                if (err) console.error("Failed to add ip_address:", err.message);
                else console.log("Success: Added ip_address");
            });
        } else {
            console.log("Column 'ip_address' already exists.");
        }

        // Fix last_heartbeat
        if (!cols.find(c => c.name === 'last_heartbeat')) {
            console.log("Adding missing column: last_heartbeat");
            db.run("ALTER TABLE game_activities ADD COLUMN last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP", (err) => {
                if (err) console.error("Failed to add last_heartbeat:", err.message);
                else console.log("Success: Added last_heartbeat");
            });
        } else {
            console.log("Column 'last_heartbeat' already exists.");
        }
    });

    // Check users table for fish_balance just in case
    db.all("PRAGMA table_info(users)", (err, cols) => {
        if (err) return;
        if (!cols.find(c => c.name === 'fish_balance')) {
            console.log("Adding missing column: fish_balance to users");
            db.run("ALTER TABLE users ADD COLUMN fish_balance INTEGER DEFAULT 0");
        }
    });

});

// Close later
setTimeout(() => {
    db.close((err) => {
        if (err) console.error(err);
        else console.log("Database connection closed.");
    });
}, 2000);
