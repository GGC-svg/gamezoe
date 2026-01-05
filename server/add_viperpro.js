import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, './gamezoe.db');

const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database(dbPath);

const game = {
    id: 'viperpro',
    title: 'ViperPro Casino',
    description: 'Premium Casino Experience',
    fullDescription: 'The ultimate casino platform integrated directly into GameZoe.',
    thumbnailUrl: '/games/viperpro.png',
    coverUrl: '/games/viperpro.png',
    gameUrl: 'http://localhost:8000', // Redirect or Iframe URL
    developer: 'ViperPro',
    price: 0,
    isFree: 1,
    category: 'Casino',
    rating: 5.0,
    releaseDate: '2024-01-01'
};

const sql = `INSERT OR REPLACE INTO games (
    id, title, description, fullDescription, 
    thumbnailUrl, coverUrl, gameUrl, developer, 
    price, isFree, category, rating, releaseDate
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const params = [
    game.id, game.title, game.description, game.fullDescription,
    game.thumbnailUrl, game.coverUrl, game.gameUrl, game.developer,
    game.price, game.isFree, game.category, game.rating, game.releaseDate
];

db.serialize(() => {
    db.run(sql, params, function (err) {
        if (err) {
            console.error('Error adding game:', err.message);
        } else {
            console.log('ViperPro added/updated in DB.');
        }
        db.close();
    });
});
