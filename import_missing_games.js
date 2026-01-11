const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'gamezoe.db');
const db = new sqlite3.Database(dbPath);

const games = JSON.parse(fs.readFileSync('games_missing.json', 'utf8'));

console.log(`Importing ${games.length} missing games...`);

db.serialize(() => {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO games
    (id, title, description, fullDescription, thumbnailUrl, coverUrl, gameUrl, developer, price, isFree, category, rating, releaseDate, displayOrder, isActive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  games.forEach((game, idx) => {
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
      game.isFree || 1,
      game.category,
      game.rating,
      game.releaseDate,
      game.displayOrder || 0,
      (err) => {
        if (err) {
          console.error(`Error importing ${game.id}:`, err.message);
        } else {
          console.log(`✓ Imported: ${game.id} - ${game.title}`);
        }
      }
    );
  });

  stmt.finalize(() => {
    db.get('SELECT COUNT(*) as count FROM games', (err, row) => {
      console.log(`\nTotal games in database: ${row.count}`);
      db.close();
    });
  });
});
