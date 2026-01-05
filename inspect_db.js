import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'gamezoe.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) console.error(err.message);
});

const USER_ID = 'user_facebook_10216666699419619'; // From logs or guess, wait, I need to know the user ID. 
// I'll query all library entries first or fetch users.

console.log("--- GAMES (2048) ---");
db.all("SELECT id, title, gameUrl, price FROM games WHERE title LIKE '%2048%'", [], (err, rows) => {
    if (err) console.error(err);
    else console.log(rows);
});

console.log("\n--- USERS ---");
db.all("SELECT id, name FROM users LIMIT 5", [], (err, rows) => {
    if (err) console.error(err);
    else {
        console.log(rows);
        if (rows.length > 0) {
            const uid = rows[0].id; // Assumption: debugging the main user
            console.log(`\n--- LIBRARY (${uid}) ---`);
            db.all("SELECT * FROM user_library WHERE user_id = ?", [uid], (err, lib) => {
                if (err) console.error(err);
                else console.log(lib);
            });
            console.log(`\n--- PURCHASES (${uid}) ---`);
            db.all("SELECT * FROM purchases WHERE user_id = ?", [uid], (err, purs) => {
                if (err) console.error(err);
                else console.log(purs);
            });
        }
    }
});
