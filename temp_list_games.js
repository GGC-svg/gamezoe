const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('e:/Steam/gamezoe/gamezoe.db');

db.all("SELECT id, title, gameUrl FROM games", [], (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(JSON.stringify(rows));
});
db.close();
