import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'gamezoe.db');
const db = new sqlite3.Database(dbPath);

console.log("Registering Clumsy Bird...");

const game = {
    id: 'game_clumsy_' + Date.now(),
    title: '笨笨鳥 (Clumsy Bird)',
    description: '經典 Flappy Bird 玩法，簡單卻令人上癮！',
    fullDescription: '控制這隻笨拙的小鳥飛越障礙物。點擊螢幕讓牠飛起來，小心不要撞到水管！看你能堅持多久？',
    thumbnailUrl: '/games/clumsy-bird/data/img/clumsy.png',
    coverUrl: 'https://images.unsplash.com/photo-1555862124-b36340454371?q=80&w=800&h=400&fit=crop',
    gameUrl: '/games/clumsy-bird/index.html',
    developer: 'Ellison Leao',
    price: 0,
    isFree: 1,
    category: 'CASUAL',
    rating: 4.6,
    releaseDate: new Date().toISOString().split('T')[0]
};

db.serialize(() => {
    const checkSql = "SELECT id FROM games WHERE gameUrl = ?";
    db.get(checkSql, [game.gameUrl], (err, row) => {
        if (row) {
            console.log("Game already exists in DB.");
        } else {
            const sql = `INSERT INTO games (id, title, description, fullDescription, thumbnailUrl, coverUrl, gameUrl, developer, price, isFree, category, rating, releaseDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [
                game.id, game.title, game.description, game.fullDescription,
                game.thumbnailUrl, game.coverUrl, game.gameUrl, game.developer,
                game.price, game.isFree, game.category, game.rating, game.releaseDate
            ];
            db.run(sql, params, (err) => {
                if (err) console.error("Insert Error:", err);
                else console.log("Game registered successfully!");
            });
        }
        db.close();
    });
});
