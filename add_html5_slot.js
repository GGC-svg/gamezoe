
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server/gamezoe.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening database:', err.message);
    else console.log('Connected to database to add Slot Machine.');
});

const game = {
    id: 'slot-machine',
    title: 'Slot Machine',
    description: 'Classic Vegas-style slot machine fun without the risk!',
    fullDescription: 'Enjoy the thrill of the spin with this free-to-play slot machine game. Features colorful graphics, smooth animations, and realistic sound effects. No installation required, play directly in your browser.',
    thumbnailUrl: '/games/slot-machine/assets/images/symbol_1.png',
    coverUrl: '/games/slot-machine/assets/images/symbol_1.png',
    gameUrl: '/games/slot-machine/index.html',
    developer: '1Stake',
    price: 0,
    isFree: 1,
    category: 'casino',
    releaseDate: new Date().toISOString().split('T')[0]
};

db.serialize(() => {
    const sql = `INSERT OR REPLACE INTO games (
        id, title, description, fullDescription, 
        thumbnailUrl, coverUrl, gameUrl, developer, 
        price, isFree, category, releaseDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        game.id, game.title, game.description, game.fullDescription,
        game.thumbnailUrl, game.coverUrl, game.gameUrl, game.developer,
        game.price, game.isFree, game.category, game.releaseDate
    ];

    db.run(sql, params, function (err) {
        if (err) return console.error("Error inserting game:", err.message);
        console.log(`Success! Added '${game.title}' to database.`);
    });
});
