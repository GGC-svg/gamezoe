
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server/gamezoe.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening database:', err.message);
    else console.log('Connected to database to add Fish Master.');
});

const game = {
    id: 'fish-master',
    title: '捕魚大師 (Fish Master)',
    description: '經典街機捕魚，多人連線，爆金不停！',
    fullDescription: '體驗最真實的深海狩獵，多種砲台選擇，超高倍率BOSS等你來戰！',
    thumbnailUrl: 'https://picsum.photos/id/1/400/300', // Placeholder
    coverUrl: 'https://picsum.photos/id/16/800/400',       // Placeholder
    gameUrl: '/games/fish/index.html',
    developer: 'GameZoe Studio',
    price: 0,
    isFree: 1,
    category: 'Arcade',
    rating: 5.0,
    releaseDate: new Date().toISOString().split('T')[0]
};

db.serialize(() => {
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

    db.run(sql, params, function (err) {
        if (err) return console.error("Error inserting game:", err.message);
        console.log(`Success! Added '${game.title}' to database.`);
    });
});
