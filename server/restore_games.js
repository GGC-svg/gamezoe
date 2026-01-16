const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'gamezoe.db');
const gamesPath = path.join(__dirname, '..', 'games_export_utf8.json');

const db = new sqlite3.Database(dbPath);
const games = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));

console.log(`Found ${games.length} games to restore...`);

db.serialize(() => {
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO games
        (id, title, description, fullDescription, thumbnailUrl, coverUrl, gameUrl, developer, price, isFree, category, rating, releaseDate, displayOrder)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    games.forEach(game => {
        stmt.run(
            game.id,
            game.title,
            game.description,
            game.fullDescription,
            game.thumbnailUrl,
            game.coverUrl,
            game.gameUrl,
            game.developer,
            game.price || 0,
            game.isFree !== undefined ? game.isFree : 1,
            game.category,
            game.rating,
            game.releaseDate,
            game.displayOrder || 0
        );
    });

    stmt.finalize();
    console.log(`✓ Restored ${games.length} games successfully!`);
});

db.close();
