import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./server/gamezoe.db');

const GHOST_USER_ID = "1767510687482";
const NAME = "Hunter_17675"; // Default name for this timestamp-like ID
const TARGET_BALANCE = 20247; // Matches our previous verification target

console.log(`Attempting to restore Ghost User: ${GHOST_USER_ID}`);

db.serialize(() => {
    // 1. Check if exists (Double check)
    db.get("SELECT * FROM users WHERE id = ?", [GHOST_USER_ID], (err, row) => {
        if (row) {
            console.log("User already exists! Updating balance only...");
            db.run("UPDATE users SET fish_balance = ? WHERE id = ?", [TARGET_BALANCE, GHOST_USER_ID], (err) => {
                if (!err) console.log("Balance updated.");
            });
        } else {
            console.log("User NOT found. Inserting new record...");
            // Insert with some default Gold as well
            const stmt = db.prepare("INSERT INTO users (id, name, email, provider, role, gold_balance, fish_balance) VALUES (?, ?, ?, ?, ?, ?, ?)");
            stmt.run(GHOST_USER_ID, NAME, "ghost@example.com", "local", "user", 100000, TARGET_BALANCE, function (err) {
                if (err) console.error("Insert Failed:", err.message);
                else console.log(`Successfully created user ${GHOST_USER_ID} with Fish Balance: ${TARGET_BALANCE}`);
            });
            stmt.finalize();
        }
    });
});

// Close DB after a short delay to ensure async ops finish
setTimeout(() => {
    db.close();
}, 1000);
