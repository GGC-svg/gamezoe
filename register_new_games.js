import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'gamezoe.db');
const db = new sqlite3.Database(dbPath);

const games = [
    {
        id: 'game_alien',
        title: 'Alien Invasion',
        description: '經典外星人入侵射擊遊戲，保衛地球！',
        fullDescription: '駕駛戰機，抵禦一波又一波的外星艦隊。向經典致敬的卷軸射擊遊戲。',
        gameUrl: '/games/AlienInvasion-master/index.html',
        thumbnailUrl: 'https://images.unsplash.com/photo-1608178398319-48f814d0750c?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
        developer: 'Cycod',
        category: 'ACTION'
    },
    {
        id: 'game_duckhunt',
        title: 'Duck Hunt JS',
        description: '重溫紅白機經典！帶著你的獵槍和那隻狗去打鴨子。',
        fullDescription: '經典光線槍遊戲的 HTML5 重製版。瞄準飛出的鴨子，小心不要打到這隻嘲笑你的狗！',
        gameUrl: '/games/DuckHunt-JS-master/dist/index.html',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516934024742-b461fba47600?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1627856014759-08529dd5c27d?w=800',
        developer: 'Matt Surabian',
        category: 'SHOOTER'
    },
    {
        id: 'game_diablo',
        title: 'Diablo JS',
        description: '網頁版暗黑破壞神風格 ARPG。',
        fullDescription: '探索地下城，與怪物戰鬥，收集裝備。一個令人驚嘆的 HTML5 ARPG 引擎展示。',
        gameUrl: '/games/diablo-js-master/index.html',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=800',
        developer: 'Mitallast',
        category: 'RPG'
    },
    {
        id: 'game_circus',
        title: 'Circus Charlie HTML5',
        description: '馬戲團查理！跳火圈、走鋼索，重溫童年回憶。',
        fullDescription: '經典 FC 遊戲《馬戲團》的完美移植。控制查理完成各種高難度的特技表演！',
        gameUrl: '/games/circushtml5-master/dist/index.html',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1587588304913-c3773b4ba9e0?w=800',
        developer: 'Gamegur-us',
        category: 'ARCADE'
    },
    {
        id: 'game_spaceinvaders',
        title: 'Space Invaders',
        description: '太空侵略者，射擊遊戲的鼻祖。',
        fullDescription: '最純正的太空侵略者體驗。躲在掩體後方，消滅不斷逼近的外星軍團。',
        gameUrl: '/games/SpaceInvaders-master/index.html',
        thumbnailUrl: 'https://images.unsplash.com/photo-1560672688-69771131d999?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800',
        developer: 'StrykerKKD',
        category: 'ARCADE'
    },
    {
        id: 'game_ophog',
        title: 'OpHog (Tower Defense)',
        description: '策略塔防遊戲，守護你的傳送門。',
        fullDescription: '放置單位，擊敗每一關的巨型 BOSS。使用鑽石購買道具，升級你的防禦力量。',
        gameUrl: '/games/OpHog-master/src/index.html',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1528812969535-d05543c79c85?w=800',
        developer: 'Adam13531',
        category: 'STRATEGY'
    },
    {
        id: 'game_lastcolony',
        title: 'Last Colony',
        description: 'RTS 即時戰略遊戲，建設基地，征服星球。',
        fullDescription: '在異星球建立殖民地，生產單位，指揮軍隊消滅敵人。一款精緻的 HTML5 RTS 遊戲。',
        gameUrl: '/games/last-colony-master/index.html',
        thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800',
        developer: 'Aditya Ravishankar',
        category: 'STRATEGY'
    }
];

db.serialize(() => {
    const stmt = db.prepare(`INSERT OR REPLACE INTO games (id, title, description, fullDescription, thumbnailUrl, coverUrl, gameUrl, developer, price, isFree, category, rating, releaseDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    games.forEach(game => {
        stmt.run(
            game.id,
            game.title,
            game.description,
            game.fullDescription,
            game.thumbnailUrl,
            game.coverUrl,
            game.gameUrl,
            game.developer,
            0, // price
            1, // isFree
            game.category,
            4.5, // rating
            new Date().toISOString().split('T')[0]
        );
        console.log(`Registered: ${game.title}`);
    });

    stmt.finalize(() => {
        console.log("All games registered successfully.");
        db.close();
    });
});
