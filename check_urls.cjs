const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('e:/Steam/gamezoe/server/gamezoe.db');

db.serialize(() => {
    db.all("SELECT id, title, gameUrl FROM games WHERE title LIKE '%Duck%' OR title LIKE '%Merchant%' OR title LIKE '%2048%'", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log(JSON.stringify(rows, null, 2));
        }
    });
});

db.close();
