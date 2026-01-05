import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('server/gamezoe.db');

const game = {
    id: 'game_' + Date.now(),
    title: '經典 2048',
    description: '挑戰你的邏輯極限，將數字合併至 2048！這是一款風靡全球的益智遊戲，規則簡單但深度十足。',
    fullDescription: '使用方向鍵移動方塊，相同的數字碰撞後會合併加倍。目標是在 4x4 的網格中拼湊出 2048 這個數字。小心別讓格子填滿了！\n\n(本遊戲移植自開源專案，完全免費遊玩)',
    thumbnailUrl: 'https://images.unsplash.com/photo-1629814249584-bd4d53cf0e7d?q=80&w=300&h=400&fit=crop', // A nice puzzle-like image
    coverUrl: 'https://images.unsplash.com/photo-1549488497-6a56cd563d47?q=80&w=800&h=400&fit=crop',
    gameUrl: '/games/2048/index.html',
    developer: 'Open Source',
    price: 0,
    isFree: 1,
    category: 'PUZZLE',
    rating: 4.8,
    releaseDate: new Date().toISOString().split('T')[0]
};

const sql = `INSERT INTO games (id, title, description, fullDescription, thumbnailUrl, coverUrl, gameUrl, developer, price, isFree, category, rating, releaseDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

const params = [
    game.id, game.title, game.description, game.fullDescription,
    game.thumbnailUrl, game.coverUrl, game.gameUrl, game.developer,
    game.price, game.isFree, game.category, game.rating, game.releaseDate
];

db.run(sql, params, function (err) {
    if (err) {
        console.error('Error inserting game:', err.message);
    } else {
        console.log('Successfully added 2048 to database!');
    }
    db.close();
});
