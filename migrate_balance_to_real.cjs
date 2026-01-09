/**
 * Database Migration Script
 * Changes fish_balance from INTEGER to REAL to preserve decimal precision
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'gamezoe.db');
const db = new sqlite3.Database(dbPath);

console.log('\n🔧 Starting Database Migration: fish_balance INTEGER -> REAL\n');

db.serialize(() => {
    // Step 1: Create backup table
    db.run(`CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users`, (err) => {
        if (err) {
            console.error('❌ Failed to create backup:', err.message);
            return;
        }
        console.log('✅ Step 1: Created backup table');
    });

    // Step 2: Drop existing table
    db.run(`DROP TABLE users`, (err) => {
        if (err) {
            console.error('❌ Failed to drop table:', err.message);
            return;
        }
        console.log('✅ Step 2: Dropped old users table');
    });

    // Step 3: Recreate table with REAL type for fish_balance
    db.run(`CREATE TABLE users (
        id TEXT PRIMARY KEY,
        name TEXT,
        fish_balance REAL DEFAULT 0,
        gold_balance INTEGER DEFAULT 0
    )`, (err) => {
        if (err) {
            console.error('❌ Failed to create new table:', err.message);
            return;
        }
        console.log('✅ Step 3: Created new users table with REAL fish_balance');
    });

    // Step 4: Restore data from backup
    db.run(`INSERT INTO users SELECT id, name, fish_balance, gold_balance FROM users_backup`, (err) => {
        if (err) {
            console.error('❌ Failed to restore data:', err.message);
            return;
        }
        console.log('✅ Step 4: Restored data from backup');
    });

    // Step 5: Verify migration
    db.get(`SELECT id, name, fish_balance, gold_balance FROM users WHERE id = '102746929077306565219'`, (err, row) => {
        if (err) {
            console.error('❌ Verification failed:', err.message);
        } else if (row) {
            console.log(`✅ Step 5: Verification successful!`);
            console.log(`   User ID: ${row.id}`);
            console.log(`   Name: ${row.name}`);
            console.log(`   fish_balance (REAL): ${row.fish_balance}`);
            console.log(`   gold_balance: ${row.gold_balance}`);
        }

        console.log('\n✅ Migration Complete! You can now delete users_backup table if satisfied.\n');
        db.close();
    });
});
