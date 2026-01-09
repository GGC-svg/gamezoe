import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./server/gamezoe.db');

const USER_ID = "102746929077306565219";
const TARGET_BALANCE = 20247;
const NAME = "Hunter_10274";

console.log(`Checking DB for User ID from Logs: ${USER_ID}`);

db.serialize(() => {
    db.get("SELECT * FROM users WHERE id = ?", [USER_ID], (err, row) => {
        if (row) {
            console.log("User Found:", row);
            db.run("UPDATE users SET fish_balance = ? WHERE id = ?", [TARGET_BALANCE, USER_ID], (err) => {
                if (!err) console.log(`Updated fish_balance to ${TARGET_BALANCE}`);
            });
        } else {
            console.log("User NOT Found. Creating...");
            const stmt = db.prepare("INSERT INTO users (id, name, email, provider, role, gold_balance, fish_balance) VALUES (?, ?, ?, ?, ?, ?, ?)");
            stmt.run(USER_ID, NAME, "google_user@example.com", "google", "user", 100000, TARGET_BALANCE, function (err) {
                if (err) console.error("Insert Failed:", err.message);
                else console.log(`Created user with fish_balance: ${TARGET_BALANCE}`);
            });
            stmt.finalize();
        }
    });
});

setTimeout(() => db.close(), 1000);
