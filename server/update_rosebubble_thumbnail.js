/**
 * Update Rosebubble game thumbnail
 * Run on server: node server/update_rosebubble_thumbnail.js
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, 'gamezoe.db'));

// New thumbnail path
const newThumbnail = '/games/Rosebubble/thumbnail.jpg';

// Find and update the game
const game = db.prepare("SELECT id, title, thumbnail FROM games WHERE id LIKE '%ose%ubble%' OR title LIKE '%羅斯%' OR title LIKE '%消消%' OR gameUrl LIKE '%Rosebubble%'").get();

if (game) {
    console.log('Found game:', game);
    console.log('Current thumbnail:', game.thumbnail);

    db.prepare("UPDATE games SET thumbnail = ? WHERE id = ?").run(newThumbnail, game.id);

    const updated = db.prepare("SELECT id, title, thumbnail FROM games WHERE id = ?").get(game.id);
    console.log('Updated thumbnail:', updated.thumbnail);
    console.log('Done!');
} else {
    // Try to find by gameUrl
    const allGames = db.prepare("SELECT id, title, thumbnail, gameUrl FROM games").all();
    const found = allGames.find(g => g.gameUrl && g.gameUrl.includes('Rosebubble'));

    if (found) {
        console.log('Found by gameUrl:', found);
        db.prepare("UPDATE games SET thumbnail = ? WHERE id = ?").run(newThumbnail, found.id);
        console.log('Updated!');
    } else {
        console.log('Game not found. Listing all games:');
        allGames.forEach(g => console.log(g.id, '|', g.title, '|', g.gameUrl));
    }
}

db.close();
