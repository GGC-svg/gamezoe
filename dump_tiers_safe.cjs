
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/database.sqlite');

db.all("SELECT id, title, price FROM games", [], (err, rows) => {
    if (err) console.error(err);
    else console.log("GAMES:", rows);
});

db.all("SELECT * FROM game_pricing_tiers", [], (err, rows) => {
    if (err) console.error(err);
    else console.log("TIERS:", rows);
});
