import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'gamezoe.db');
const db = new sqlite3.Database(dbPath);

const game = {
    id: 'game_akimono_' + Date.now(),
    title: '商人物語 (Merchant Story)',
    description: '經典模擬經營遊戲，體驗商人的發家致富之路。',
    fullDescription: '在這款懷舊的經營遊戲中，扮演一名充滿野心的商人。低買高賣，管理庫存，與各地的冒險者交易。探索未知的地圖，收集稀有的寶物，最終成為富可敵國的傳奇大亨！',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577156930067-178652615951?q=80&w=300&h=400&fit=crop', // Merchant/Market style
    coverUrl: 'https://images.unsplash.com/photo-1628151016020-59fdb281c7f4?q=80&w=800&h=400&fit=crop',
    gameUrl: '/games/akimono-archive-master/base/050330/akimono/index.html',
    developer: 'Zetaraku',
    price: 0,
    isFree: 1,
    category: 'SIMULATION',
    rating: 4.9,
    releaseDate: new Date().toISOString().split('T')[0]
};

// Logic to dynamically find the correct URL if possible, but for now hardcoded based on assumption. 
// If find_by_name returns something else, I will manually edit this.

const sql = `INSERT INTO games (id, title, description, fullDescription, thumbnailUrl, coverUrl, gameUrl, developer, price, isFree, category, rating, releaseDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
const params = [
    game.id, game.title, game.description, game.fullDescription,
    game.thumbnailUrl, game.coverUrl, game.gameUrl, game.developer,
    game.price, game.isFree, game.category, game.rating, game.releaseDate
];

db.run(sql, params, function (err) {
    if (err) console.error(err.message);
    else console.log("Akimono added!");
    db.close();
});
