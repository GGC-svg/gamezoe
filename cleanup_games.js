import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server/gamezoe.db');

const db = new sqlite3.Database(dbPath);

const GAMES_TO_DELETE = [
    '星際奇航 (Star Voyage)',
    '深淵地牢 (Abyss Dungeon)',
    '極速狂飆 (Speed Racer)',
    '農場物語 (Farm Life)',
    '暗影刺客 (Shadow Assassin)'
];

db.serialize(() => {
    console.log("Cleaning up mock games...");
    const placeholders = GAMES_TO_DELETE.map(() => '?').join(',');
    db.run(`DELETE FROM games WHERE title IN (${placeholders})`, GAMES_TO_DELETE, function (err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log(`Deleted ${this.changes} mock games.`);
        }
    });

    db.all("SELECT id, title FROM games", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Remaining games in DB:", rows);
        }
    });
});

db.close();
