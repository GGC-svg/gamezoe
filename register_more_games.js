import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'gamezoe.db');
const db = new sqlite3.Database(dbPath);

const games = [
    {
        id: 'game_pacman',
        title: 'Pacman Canvas',
        description: '經典吃豆人，HTML5 Canvas 重製版。',
        fullDescription: '還原度極高的吃豆人遊戲。吃掉所有豆子，避開幽靈，挑戰最高分！',
        gameUrl: '/games/pacman-canvas-master/index.htm',
        thumbnailUrl: 'https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1596727147705-54a9d0820948?w=800',
        developer: 'Platzhersh',
        category: 'ARCADE'
    },
    {
        id: 'game_tower',
        title: 'Tower Game',
        description: '堆疊方塊，蓋出最高的塔。',
        fullDescription: '簡單但考驗反應的堆疊遊戲。在正確的時機點擊螢幕，讓方塊完美重疊。錯過一點就會讓塔變得越來越窄！',
        gameUrl: '/games/tower_game-master/index.html',
        thumbnailUrl: 'https://images.unsplash.com/photo-1473634139932-a5676356dc73?w=400',
        coverUrl: 'https://images.unsplash.com/photo-1517409419131-0044bd8337a7?w=800',
        developer: 'iamkun',
        category: 'CASUAL'
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
            4.8, // rating
            new Date().toISOString().split('T')[0]
        );
        console.log(`Registered: ${game.title}`);
    });

    stmt.finalize(() => {
        console.log("All games registered successfully.");
        db.close();
    });
});
