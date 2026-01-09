const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'gamezoe.db');
const db = new sqlite3.Database(dbPath);

const userId = '102746929077306565219'; // 你的测试账号ID

db.serialize(() => {
    db.run("UPDATE users SET fish_balance = 20000, gold_balance = 20000 WHERE id = ?", [userId], function (err) {
        if (err) {
            console.error("Error resetting DB:", err);
        } else {
            console.log(`Reset user ${userId} balance to 20000. Changes: ${this.changes}`);
        }
    });

    db.each("SELECT id, fish_balance, gold_balance FROM users WHERE id = ?", [userId], (err, row) => {
        console.log("Verified User:", row);
    });
});

db.close();
