
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
    console.log("--- GAMES ---");
    db.each("SELECT id, title, price FROM games", (err, row) => {
        console.log(`${row.id} | ${row.title} | ${row.price}`);
    });

    console.log("\n--- TIERS ---");
    db.each("SELECT * FROM game_pricing_tiers", (err, row) => {
        console.log(JSON.stringify(row));
    });
});
