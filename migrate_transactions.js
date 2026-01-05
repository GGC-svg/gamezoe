
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target the ROOT database as discovered earlier
const dbPath = path.resolve(__dirname, 'server/gamezoe.db');
const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database(dbPath);

console.log("Migrating DB at:", dbPath);

db.serialize(() => {
    // Check if columns exist, if not add them
    db.all("PRAGMA table_info(wallet_transactions)", (err, rows) => {
        if (err) {
            console.error("Failed to get table info:", err);
            return;
        }

        const content = rows.map(r => r.name);

        const columnsToAdd = [
            { name: 'order_id', type: 'TEXT' }, // Removed UNIQUE constraint here
            { name: 'status', type: "TEXT DEFAULT 'COMPLETED'" },
            { name: 'game_id', type: 'TEXT' },
            { name: 'retry_count', type: 'INTEGER DEFAULT 0' }
        ];

        columnsToAdd.forEach(col => {
            if (!content.includes(col.name)) {
                console.log(`Adding column: ${col.name}`);
                db.run(`ALTER TABLE wallet_transactions ADD COLUMN ${col.name} ${col.type}`, (err) => {
                    if (err) console.error(`Error adding ${col.name}:`, err.message);
                    else console.log(`Added ${col.name} successfully.`);
                });
            } else {
                console.log(`Column ${col.name} already exists.`);
            }
        });

        // Add Unique Index separately
        db.run("CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_transactions_order_id ON wallet_transactions(order_id)", (err) => {
            if (err) console.error("Error creating index:", err.message);
            else console.log("Index created successfully.");
        });
    });
});

// Close later to allow async runs
setTimeout(() => db.close(), 2000);
