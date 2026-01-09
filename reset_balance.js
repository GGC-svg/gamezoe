const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./gamezoe.db');

const userId = '102746929077306565219';
const resetBalance = 20018;

db.run("UPDATE users SET fish_balance = ? WHERE id = ?", [resetBalance, userId], function (err) {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log(`✅ Reset fish_balance to ${resetBalance} for user ${userId}`);
        console.log(`Rows affected: ${this.changes}`);
    }
    db.close();
});
