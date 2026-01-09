import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./server/gamezoe.db');

const account = "1767510687482";
console.log(`Checking for user with id: ${account}`);

db.all("SELECT * FROM users WHERE id = ?", [account], (err, rows) => {
    if (err) console.error(err);
    else {
        console.log(`Found ${rows.length} matching rows:`);
        console.log(rows);
    }
    db.close();
});
