import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./server/gamezoe.db');

db.serialize(() => {
    db.all("PRAGMA table_info(users)", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log("Users Table Schema:");
        console.table(rows);
    });

    db.all("SELECT * FROM users LIMIT 1", (err, rows) => {
        if (err) return console.error(err);
        console.log("Sample User Data:");
        console.log(rows);
    });
});

db.close();
