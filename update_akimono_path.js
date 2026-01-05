import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'gamezoe.db');
const db = new sqlite3.Database(dbPath);

console.log("Updating Akimono game path...");

const sql = `UPDATE games SET gameUrl = ? WHERE title LIKE '%商人物語%' OR title LIKE '%akimono%'`;
const newPath = '/games/merchant/index.html';

db.run(sql, [newPath], function (err) {
    if (err) {
        console.error("Error updating path:", err.message);
    } else {
        console.log(`Successfully updated ${this.changes} game(s) to point to ${newPath}`);
    }
    db.close();
});
