import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./server/gamezoe.db');

const USER_ID = "102746929077306565219";

console.log(`Checking transactions for User: ${USER_ID}`);

db.all("SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10", [USER_ID], (err, rows) => {
    if (err) console.error(err);
    else {
        console.log(`Found ${rows.length} transactions.`);
        console.log(rows);
    }
    db.close();
});
