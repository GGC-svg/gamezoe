import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./server/gamezoe.db');

const TARGET_BALANCE = 20247000; // Client divides by 1000 -> 20247.000
// Update all users for simplicity in testing
db.run("UPDATE users SET fish_balance = ?", [TARGET_BALANCE], function (err) {
    if (err) return console.error(err.message);
    console.log(`Updated ${this.changes} users to fish_balance = ${TARGET_BALANCE}`);

    // Verify
    db.all("SELECT id, name, fish_balance FROM users LIMIT 1", (err, rows) => {
        if (err) console.error(err);
        else console.log("Verification:", rows);
        db.close();
    });
});
