import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'gamezoe.db');
const db = new sqlite3.Database(dbPath);

// Update SpaceWar thumbnail
db.run(
    `UPDATE games SET thumbnailUrl = ? WHERE gameUrl LIKE '%SpaceWar%'`,
    ['/games/SpaceWar/thumbnail.jpg'],
    function(err) {
        if (err) {
            console.error('Error updating SpaceWar thumbnail:', err);
        } else {
            console.log(`Updated ${this.changes} row(s)`);

            // Verify
            db.get(`SELECT id, title, thumbnailUrl FROM games WHERE gameUrl LIKE '%SpaceWar%'`, (err, row) => {
                if (row) {
                    console.log('Updated game:', row);
                }
                db.close();
            });
        }
    }
);
