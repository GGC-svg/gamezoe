import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

// Convert ESM URL to Path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILES = {
    'index.html': 'https://github.com/wanghao221/moyu/raw/refs/heads/main/%E6%B8%B8%E6%88%8F-3.%E9%A3%9E%E6%9C%BA%E8%BA%B2%E9%81%BF%E9%9A%9C%E7%A2%8D/index.html',
    'css/style.css': 'https://github.com/wanghao221/moyu/raw/refs/heads/main/%E6%B8%B8%E6%88%8F-3.%E9%A3%9E%E6%9C%BA%E8%BA%B2%E9%81%BF%E9%9A%9C%E7%A2%8D/css/style.css',
    'js/script.js': 'https://github.com/wanghao221/moyu/raw/refs/heads/main/%E6%B8%B8%E6%88%8F-3.%E9%A3%9E%E6%9C%BA%E8%BA%B2%E9%81%BF%E9%9A%9C%E7%A2%8D/js/script.js'
};

const BASE_DIR = path.join(__dirname, 'public', 'games', 'plane');

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

    const gameId = 'game_plane_' + Date.now();
    const game = {
        id: gameId,
        title: '飛機閃避戰 (Plane Dodge)',
        description: '駕駛你的戰機，在無盡的障礙中生存下來！',
        fullDescription: '這是一款考驗反應速度的飛行遊戲。你需要控制飛機上下移動，躲避迎面而來的隕石與障礙物。堅持越久，分數越高！',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542256844-311ebb2cdbf6?q=80&w=300&h=400&fit=crop', // Plane image
        coverUrl: 'https://images.unsplash.com/photo-1483304528321-0674f0040030?q=80&w=800&h=400&fit=crop',
        gameUrl: '/games/plane/index.html',
        developer: 'Open Source',
        price: 0,
        isFree: 1,
        category: 'ACTION',
        rating: 4.5,
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
