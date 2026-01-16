import sqlite3Pkg from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const sqlite3 = sqlite3Pkg.verbose();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
