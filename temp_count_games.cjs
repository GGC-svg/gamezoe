const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('e:/Steam/gamezoe/server/gamezoe.db');

db.get("SELECT COUNT(*) as count FROM games", [], (err, row) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Total Games in DB:", row.count);
});

db.all("SELECT title, gameUrl FROM games", [], (err, rows) => {
    if (err) return;
    console.log("Titles in DB:", rows.map(r => r.title));
});

db.close();
