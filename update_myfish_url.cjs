const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve('e:/Steam/gamezoe/server/gamezoe.db');
const db = new sqlite3.Database(dbPath);

const GAME_ID = 'my-fish-egret';
const NEW_URL = '/games/my-fish/bin-release/web/fish_104/index.html';

db.serialize(() => {
    const stmt = db.prepare("UPDATE games SET gameUrl = ? WHERE id = ?");
    stmt.run(NEW_URL, GAME_ID, function (err) {
        if (err) {
            console.error("Update failed:", err);
        } else {
            console.log(`Updated MyFish URL to ${NEW_URL}. Changes: ${this.changes}`);
        }
    });
    stmt.finalize();
});

db.close();
