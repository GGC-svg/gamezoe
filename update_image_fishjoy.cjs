const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve('e:/Steam/gamezoe/server/gamezoe.db');
const db = new sqlite3.Database(dbPath);

const GAME_ID = 'fish-joy-h5';
const IMAGE_URL = '/games/fish-joy/cover.png';

db.serialize(() => {
    const stmt = db.prepare("UPDATE games SET thumbnailUrl = ?, coverUrl = ? WHERE id = ?");
    stmt.run(IMAGE_URL, IMAGE_URL, GAME_ID, function (err) {
        if (err) {
            console.error("Update failed:", err);
        } else {
            console.log(`Updated Fish Joy images to ${IMAGE_URL}. Changes: ${this.changes}`);
        }
    });
    stmt.finalize();
});

db.close();
