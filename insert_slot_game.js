import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function insertGame() {
    const db = await open({
        filename: 'e:/Steam/gamezoe/server/gamezoe.db', // Absolute path to be safe
        driver: sqlite3.Database
    });

    const game = {
        id: 'slot-machine',
        title: 'Slot Machine',
        description: 'Classic Vegas-style slot machine fun without the risk!',
        fullDescription: 'Enjoy the thrill of the spin with this free-to-play slot machine game. Features colorful graphics, smooth animations, and realistic sound effects. No installation required, play directly in your browser.',
        thumbnailUrl: '/games/slot-machine/assets/images/symbol_1.png', // Fallback, will update if I find better
        coverUrl: '/games/slot-machine/assets/images/symbol_1.png',
        gameUrl: '/games/slot-machine/index.html',
        developer: '1Stake',
        price: 0,
        isFree: 1,
        category: 'casino',
        releaseDate: new Date().toISOString().split('T')[0]
    };

    try {
        await db.run(`INSERT OR REPLACE INTO games (
            id, title, description, fullDescription, 
            thumbnailUrl, coverUrl, gameUrl, developer, 
            price, isFree, category, releaseDate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            game.id, game.title, game.description, game.fullDescription,
            game.thumbnailUrl, game.coverUrl, game.gameUrl, game.developer,
            game.price, game.isFree, game.category, game.releaseDate
        ]);
        console.log('Successfully inserted Slot Machine game!');
    } catch (e) {
        console.error('Error inserting game:', e);
    }
}

insertGame();
