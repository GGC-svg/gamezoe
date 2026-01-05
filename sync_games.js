import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server/gamezoe.db');

const db = new sqlite3.Database(dbPath);

const MOCK_GAMES_TO_DELETE = [
    '星際奇航 (Star Voyage)',
    '深淵地牢 (Abyss Dungeon)',
    '極速狂飆 (Speed Racer)',
    '農場物語 (Farm Life)',
    '暗影刺客 (Shadow Assassin)'
];

// List of real games found in the games directory
const REAL_GAMES = [
    { id: '2048', title: '2048', dir: '2048' },
    { id: '3d-bear-run', title: '3D Bear Run', dir: '3d-bear-run' },
    { id: 'alien-invasion', title: 'Alien Invasion', dir: 'AlienInvasion-master' },
    { id: 'duck-hunt', title: 'Duck Hunt', dir: 'DuckHunt-JS-master' },
    { id: 'eat-kano', title: 'Eat Kano', dir: 'EatKano-main' },
    { id: 'ophog', title: 'OpHog', dir: 'OpHog-master' },
    { id: 'space-invaders', title: 'Space Invaders', dir: 'SpaceInvaders-master' },
    { id: 'angry-red-riding-hood', title: 'Angry Red Riding Hood', dir: 'angry-red-riding-hood' },
    { id: 'canvasplane', title: 'Canvas Plane', dir: 'canvasplane' },
    { id: 'chess', title: 'Chess', dir: 'chess' },
    { id: 'circus', title: 'Circus', dir: 'circushtml5-master' },
    { id: 'cloud-jump', title: 'Cloud Jump', dir: 'cloud-jump' },
    { id: 'clumsy-bird', title: 'Clumsy Bird', dir: 'clumsy-bird' },
    { id: 'daily-racer', title: 'Daily Racer', dir: 'daily-racer' },
    { id: 'diablo-js', title: 'Diablo JS', dir: 'diablo-js-master' },
    { id: 'donkey-jump', title: 'Donkey Jump', dir: 'donkeyjump' },
    { id: 'elemental-one', title: 'Elemental One', dir: 'elemental-one-master' },
    { id: 'flybird', title: 'Fly Bird', dir: 'flybird' },
    { id: 'fruit-ninja', title: 'Fruit Ninja', dir: 'fruitninjia' },
    { id: 'gobang', title: 'Gobang', dir: 'gobang' },
    { id: 'gobang-classic', title: 'Gobang Classic', dir: 'gobang-classic' },
    { id: 'last-colony', title: 'Last Colony', dir: 'last-colony-master' },
    { id: 'ludum-dare-28', title: 'Ludum Dare 28', dir: 'ludum-dare-28-master' },
    { id: 'magic-tower', title: 'Magic Tower', dir: 'magictower' },
    { id: 'merchant', title: 'Merchant', dir: 'merchant' },
    { id: 'mummy-returns', title: 'Mummy Returns', dir: 'mummy-returns' },
    { id: 'pacman', title: 'Pacman', dir: 'pacman-canvas-master' },
    { id: 'plane', title: 'Plane', dir: 'plane' },
    { id: 'plane-battle', title: 'Plane Battle', dir: 'planebattle' },
    { id: 'rabbit-run', title: 'Rabbit Run', dir: 'rabbitrun' },
    { id: 'racing-1', title: 'Racing I', dir: 'racing-1' },
    { id: 'racing-2', title: 'Racing II', dir: 'racing-2' },
    { id: 'shooter', title: 'Shooter', dir: 'shooter' },
    { id: 'space-crusade', title: 'Space Crusade', dir: 'space-crusade-master' },
    { id: 'spider-poker', title: 'Spider Poker', dir: 'spiderpoker' },
    { id: 'stickman-adventure', title: 'Stickman Adventure', dir: 'stickman-adventure' },
    { id: 'tap-kill', title: 'Tap Kill', dir: 'tapkill' },
    { id: 'tower-defense', title: 'Tower Defense', dir: 'tower-defense-shooter' },
    { id: 'tower-game', title: 'Tower Game', dir: 'tower_game-master' },
    { id: 'warcraft-castle', title: 'Warcraft Castle', dir: 'warcraft-castle' }
];

db.serialize(() => {
    console.log("Starting DB Sync...");

    // 1. Delete Mock Games
    const placeholders = MOCK_GAMES_TO_DELETE.map(() => '?').join(',');
    db.run(`DELETE FROM games WHERE title IN (${placeholders})`, MOCK_GAMES_TO_DELETE, function (err) {
        if (!err) console.log(`Deleted ${this.changes} mock games.`);
    });

    // 2. Insert Real Games
    const stmt = db.prepare(`INSERT OR IGNORE INTO games (
        id, title, description, fullDescription, thumbnailUrl, coverUrl, gameUrl, developer, price, isFree, category, rating, releaseDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    REAL_GAMES.forEach(game => {
        const gameUrl = `/games/${game.dir}/index.html`;
        // Use a generic placeholder if no image exists, fix_game_images.js can run later
        const img = 'https://picsum.photos/400/300';

        stmt.run(
            game.id,
            game.title,
            `Enjoy playing ${game.title}!`,
            `Full version of ${game.title} is now available on GameZoe.`,
            img,
            img,
            gameUrl,
            'GameZoe Studio',
            0, // Price
            1, // isFree (True)
            'Arcade', // Default Category
            4.5,
            new Date().toISOString().split('T')[0]
        );
    });

    stmt.finalize(() => {
        console.log("Synced real games to database.");
    });
});

db.close();
