
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'gamezoe.db');

const db = new sqlite3.Database(dbPath);

const game = {
    id: "universalloc-ai",
    title: "UniversalLoc AI - 全領域專家級翻譯神器",
    description: "瞬間完成萬字翻譯！搭載頂尖語境引擎，無論是技術、創意還是專業數據，都能提供最合宜的在地化對策。",
    fullDescription: "瞬間完成萬字翻譯！搭載頂尖語境引擎，無論是技術、創意還是專業數據，都能提供最合宜的在地化對策。價格親民、極速導出，讓全球市場成為您的主場。",
    thumbnailUrl: "/games/universalloc-ai---全領域專家級翻譯神器/cover.png",
    coverUrl: "/games/universalloc-ai---全領域專家級翻譯神器/cover.png",
    gameUrl: "/games/universalloc-ai---全領域專家級翻譯神器/dist/index.html",
    developer: "UniversalLoc Studio",
    price: 0,
    isFree: 1,
    category: "Utility",
    rating: 5,
    releaseDate: "2026-01-10"
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
            console.error("DB Error:", err.message);
        } else {
            console.log(`Success! Game '${game.id}' upserted.`);
        }
        db.close();
    });
});
