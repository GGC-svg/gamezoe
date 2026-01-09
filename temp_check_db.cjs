const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server/gamezoe.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
        process.exit(1);
    }
});

const userId = '102746929077306565219';

db.get("SELECT id, fish_balance, gold_balance FROM users WHERE id = ?", [userId], (err, row) => {
    if (err) {
        console.error("Query Error:", err);
    } else {
        console.log("User Row:", row);
    }
    db.close();
});
