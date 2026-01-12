/**
 * Script to add 7 new games to the platform database
 * Run with: node add_new_games.js
 */

import sqlite3Pkg from 'sqlite3';
const sqlite3 = sqlite3Pkg.verbose();
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'gamezoe.db');
const db = new sqlite3.Database(dbPath);

const newGames = [
    {
        id: 'fishing-game',
        title: '歡樂釣魚',
        description: '輕鬆有趣的釣魚遊戲，體驗釣魚的樂趣！',
        fullDescription: '歡樂釣魚是一款休閒釣魚遊戲，玩家可以在美麗的場景中享受釣魚的樂趣。遊戲操作簡單，適合所有年齡層的玩家。',
        thumbnailUrl: '/games/fishing_game/icon.png',
        coverUrl: '/games/fishing_game/icon.png',
        gameUrl: '/games/fishing_game/index.html',
        developer: 'GameZoe',
        price: 0,
        isFree: 1,
        category: '休閒',
        rating: 4.5,
        releaseDate: '2026-01-13'
    },
    {
        id: 'bubble-mush',
        title: '泡泡冒險',
        description: '經典的泡泡消除遊戲，挑戰你的反應力！',
        fullDescription: '泡泡冒險是一款色彩繽紛的泡泡消除遊戲。射出泡泡，匹配相同顏色，消除所有泡泡來過關！遊戲難度逐漸增加，考驗你的策略和反應能力。',
        thumbnailUrl: '/games/BubbleMush/icon.png',
        coverUrl: '/games/BubbleMush/icon.png',
        gameUrl: '/games/BubbleMush/index.html',
        developer: 'GameZoe',
        price: 0,
        isFree: 1,
        category: '益智',
        rating: 4.3,
        releaseDate: '2026-01-13'
    },
    {
        id: 'h5-planwar',
        title: '飛機大戰2.0',
        description: '刺激的空戰射擊遊戲，擊敗所有敵機！',
        fullDescription: '飛機大戰2.0是一款經典的垂直捲軸射擊遊戲。操控你的戰機，躲避敵方攻擊，收集道具增強火力，擊敗強大的Boss！',
        thumbnailUrl: '/games/H5Planwar/1.png',
        coverUrl: '/games/H5Planwar/2.png',
        gameUrl: '/games/H5Planwar/index.html',
        developer: 'GameZoe',
        price: 0,
        isFree: 1,
        category: '射擊',
        rating: 4.6,
        releaseDate: '2026-01-13'
    },
    {
        id: 'rose-bubble',
        title: '羅斯魔影消消樂',
        description: '精美的消消樂遊戲，享受消除的快感！',
        fullDescription: '羅斯魔影消消樂是一款精美的三消遊戲。匹配三個或更多相同的寶石，觸發連鎖反應，獲得高分！多種特殊道具等你來發現。',
        thumbnailUrl: '/games/Rosebubble/assets/back1.jpg',
        coverUrl: '/games/Rosebubble/assets/back1.jpg',
        gameUrl: '/games/Rosebubble/index.html',
        developer: 'GameZoe',
        price: 0,
        isFree: 1,
        category: '益智',
        rating: 4.4,
        releaseDate: '2026-01-13'
    },
    {
        id: 'search-may',
        title: '找你妹',
        description: '考驗眼力的找物品遊戲，快來挑戰吧！',
        fullDescription: '找你妹是一款經典的隱藏物品遊戲。在複雜的場景中尋找指定的物品，考驗你的觀察力和耐心。時間限制增加了遊戲的緊張感！',
        thumbnailUrl: '/images/default-game.jpg',
        coverUrl: '/images/default-game.jpg',
        gameUrl: '/games/SearchMay/index.html',
        developer: 'GameZoe',
        price: 0,
        isFree: 1,
        category: '休閒',
        rating: 4.2,
        releaseDate: '2026-01-13'
    },
    {
        id: 'golden-dig',
        title: '黃金礦工',
        description: '經典的挖礦遊戲，挖掘黃金和寶石！',
        fullDescription: '黃金礦工是一款經典的挖礦遊戲。操控抓鉤，抓取地下的黃金和寶石，避開石頭和炸彈。達到目標分數即可過關！',
        thumbnailUrl: '/games/GoldenDig/icon-128.png',
        coverUrl: '/games/GoldenDig/20180516105536.png',
        gameUrl: '/games/GoldenDig/index.html',
        developer: 'GameZoe',
        price: 0,
        isFree: 1,
        category: '休閒',
        rating: 4.5,
        releaseDate: '2026-01-13'
    },
    {
        id: 'space-war',
        title: '太空攻擊',
        description: '刺激的太空射擊遊戲，保衛地球！',
        fullDescription: '太空攻擊是一款緊張刺激的太空射擊遊戲。操控你的太空戰艦，消滅入侵的外星敵人，保衛地球的和平！多種武器和道具助你一臂之力。',
        thumbnailUrl: '/images/default-game.jpg',
        coverUrl: '/images/default-game.jpg',
        gameUrl: '/games/SpaceWar/index.htm',
        developer: 'GameZoe',
        price: 0,
        isFree: 1,
        category: '射擊',
        rating: 4.4,
        releaseDate: '2026-01-13'
    },
    // WangsHappy removed - Cocos Creator source project, needs build first
];

const sqlInsert = `INSERT OR REPLACE INTO games (
    id, title, description, fullDescription,
    thumbnailUrl, coverUrl, gameUrl, developer,
    price, isFree, category, rating, releaseDate
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

console.log('Adding 8 new games to database...\n');

db.serialize(() => {
    const stmt = db.prepare(sqlInsert);

    newGames.forEach((game, index) => {
        stmt.run(
            game.id, game.title, game.description, game.fullDescription,
            game.thumbnailUrl, game.coverUrl, game.gameUrl, game.developer,
            game.price, game.isFree, game.category, game.rating, game.releaseDate,
            function(err) {
                if (err) {
                    console.error(`[${index + 1}] Failed to add ${game.title}:`, err.message);
                } else {
                    console.log(`[${index + 1}] Added: ${game.title} (${game.id})`);
                }
            }
        );
    });

    stmt.finalize(() => {
        console.log('\nDone! All games processed.');
        db.close();
    });
});
