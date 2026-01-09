const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve('e:/Steam/gamezoe/server/gamezoe.db');
const db = new sqlite3.Database(dbPath);

const GAMES_TO_ADD = [
    {
        id: 'fish-joy-h5',
        title: '歡樂捕魚 (Fish Joy)',
        description: '經典街機捕魚，輕鬆爆金幣！',
        fullDescription: '還原經典街機體驗，多種砲台任你選。無需下載，點擊即玩。',
        thumbnailUrl: 'https://picsum.photos/id/111/400/300', // Placeholder
        coverUrl: 'https://picsum.photos/id/111/800/400',
        gameUrl: '/games/fish-joy/index.html',
        developer: 'H5 Games',
        category: 'Arcade',
        isFree: 1,
        rating: 4.5
    },
    {
        id: 'my-fish-egret',
        title: '我的捕魚 (MyFish)',
        description: 'Egret引擎打造的高清捕魚遊戲。',
        fullDescription: '體驗流暢的 HTML5 捕魚樂趣。',
        thumbnailUrl: 'https://picsum.photos/id/112/400/300', // Placeholder
        coverUrl: 'https://picsum.photos/id/112/800/400',
        gameUrl: '/games/my-fish/bin-release/web/index.html', // Pointing to compiled build
        developer: 'Egret',
        category: 'Arcade',
        isFree: 1,
        rating: 4.0
    }
];

db.serialize(() => {
    const stmt = db.prepare(`INSERT OR REPLACE INTO games (
        id, title, description, fullDescription, thumbnailUrl, coverUrl, gameUrl, developer, price, isFree, category, rating, releaseDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`);

    GAMES_TO_ADD.forEach(game => {
        stmt.run(
            game.id, game.title, game.description, game.fullDescription,
            game.thumbnailUrl, game.coverUrl, game.gameUrl, game.developer,
            0, // Price
            game.isFree, game.category, game.rating
        );
        console.log(`Added: ${game.title}`);
    });

    stmt.finalize();
    console.log("Done.");
});

db.close();
