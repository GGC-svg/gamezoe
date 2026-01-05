import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

// Convert ESM URL to Path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILES = {
    'index.html': 'https://github.com/wanghao221/moyu/raw/refs/heads/main/%E6%B8%B8%E6%88%8F-2.%E5%93%8D%E5%BA%94%E5%BC%8F2048%E5%B0%8F%E6%B8%B8%E6%88%8F/index.html',
    'css/style.css': 'https://github.com/wanghao221/moyu/raw/refs/heads/main/%E6%B8%B8%E6%88%8F-2.%E5%93%8D%E5%BA%94%E5%BC%8F2048%E5%B0%8F%E6%B8%B8%E6%88%8F/css/style.css',
    'js/script.js': 'https://github.com/wanghao221/moyu/raw/refs/heads/main/%E6%B8%B8%E6%88%8F-2.%E5%93%8D%E5%BA%94%E5%BC%8F2048%E5%B0%8F%E6%B8%B8%E6%88%8F/js/script.js'
};

const BASE_DIR = path.join(__dirname, 'games', '2048');

async function downloadFile(url, relativePath) {
    const targetPath = path.join(BASE_DIR, relativePath);
    const targetDir = path.dirname(targetPath);

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`Created directory: ${targetDir}`);
    }

    console.log(`Downloading ${url} to ${targetPath}...`);
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(targetPath, Buffer.from(buffer));
        console.log(`Saved: ${relativePath}`);
    } catch (error) {
        console.error(`Failed to download ${relativePath}:`, error);
    }
}

function addToDatabase() {
    console.log("Adding to Database...");
    const dbPath = path.join(__dirname, 'server', 'gamezoe.db');
    const db = new sqlite3.Database(dbPath);

    const gameId = 'game_2048_' + Date.now();
    const game = {
        id: gameId,
        title: '經典 2048',
        description: '挑戰你的邏輯極限，將數字合併至 2048！',
        fullDescription: '使用方向鍵移動方塊，相同的數字碰撞後會合併加倍。目標是在 4x4 的網格中拼湊出 2048 這個數字。',
        thumbnailUrl: 'https://images.unsplash.com/photo-1629814249584-bd4d53cf0e7d?q=80&w=300&h=400&fit=crop',
        coverUrl: 'https://images.unsplash.com/photo-1549488497-6a56cd563d47?q=80&w=800&h=400&fit=crop',
        gameUrl: '/games/2048/index.html',
        developer: 'Open Source',
        price: 0,
        isFree: 1,
        category: 'PUZZLE',
        rating: 4.8,
        releaseDate: new Date().toISOString().split('T')[0]
    };

    const checkSql = "SELECT id FROM games WHERE gameUrl = ?";
    db.get(checkSql, [game.gameUrl], (err, row) => {
        if (err) {
            console.error("DB Check Error:", err);
            return;
        }
        if (row) {
            console.log("Game already exists in DB, skipping insert.");
        } else {
            const sql = `INSERT INTO games (id, title, description, fullDescription, thumbnailUrl, coverUrl, gameUrl, developer, price, isFree, category, rating, releaseDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [
                game.id, game.title, game.description, game.fullDescription,
                game.thumbnailUrl, game.coverUrl, game.gameUrl, game.developer,
                game.price, game.isFree, game.category, game.rating, game.releaseDate
            ];
            db.run(sql, params, (insertErr) => {
                if (insertErr) console.error("DB Insert Error:", insertErr);
                else console.log("Game inserted successfully!");
            });
        }
    });
}

async function main() {
    // 1. Download Files
    for (const [relativePath, url] of Object.entries(FILES)) {
        await downloadFile(url, relativePath);
    }
    // 2. Add to DB
    addToDatabase();
}

main();
