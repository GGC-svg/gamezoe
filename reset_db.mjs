import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'gamezoe.db');

const db = new Database(dbPath);

const userId = '102746929077306565219';
const resetBalance = 20018;

try {
    const result = db.prepare("UPDATE user_profiles SET fish_balance = ? WHERE user_id = ?").run(resetBalance, userId);
    console.log(`✅ Reset fish_balance to ${resetBalance} for user ${userId}`);
    console.log(`Rows affected: ${result.changes}`);
} catch (err) {
    console.error('Error:', err.message);
    // Try alternative table name
    try {
        const result2 = db.prepare("UPDATE users SET fish_balance = ? WHERE id = ?").run(resetBalance, userId);
        console.log(`✅ Reset fish_balance to ${resetBalance} for user ${userId} (users table)`);
        console.log(`Rows affected: ${result2.changes}`);
    } catch (err2) {
        console.error('Alternative table also failed:', err2.message);
    }
}

db.close();
