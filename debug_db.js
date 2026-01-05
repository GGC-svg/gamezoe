
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'gamezoe.db');
const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database(dbPath);

console.log("Checking DB at:", dbPath);

db.serialize(() => {
    // 1. Check Table Info
    db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) {
            console.error("Failed to get table info:", err);
            return;
        }
        console.log("=== Users Table Columns ===");
        const names = rows.map(r => r.name);
        console.log(names.join(", "));

        if (!names.includes('fish_balance')) {
            console.error("\n!!! CRITICAL: fish_balance column is MISSING !!!");
        } else {
            console.log("\nOK: fish_balance column exists.");
        }
    });

    // 2. Check Recent Transactions
    db.all("SELECT id, user_id, amount, currency, type, description, created_at FROM wallet_transactions ORDER BY created_at DESC LIMIT 5", (err, rows) => {
        console.log("\n=== Last 5 Transactions ===");
        if (rows) console.table(rows);
    });

    // 3. Check User Balances (Top 3)
    db.all("SELECT id, name, gold_balance, fish_balance FROM users LIMIT 3", (err, rows) => {
        console.log("\n=== User Balances ===");
        if (rows) console.table(rows);
    });
});

db.close();
