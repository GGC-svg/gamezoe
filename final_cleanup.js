import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// THE STRICT KEEP LIST (Based on DB + Mappings)
const KEEP_FOLDERS = [
    // 1. Core Games
    'fish-master',
    'slot-machine',
    'html5-slot-machine-main', // Mapped from slot-machine-2
    'racing-1',
    'racing-2',
    'common', // Shared assets often used

    // 2. Verified Active Games (Step 8952 Output)
    '2048',
    'plane',
    'merchant',
    'clumsy-bird',
    'AlienInvasion-master',
    'DuckHunt-JS-master',
    'diablo-js-master',
    'circushtml5-master',
    'SpaceInvaders-master',
    'OpHog-master',
    'last-colony-master',
    'pacman-canvas-master',
    'tower_game-master',
    'elemental-one-master',
    'space-crusade-master',
    'ludum-dare-28-master',
    '3d-bear-run',
    'canvasplane',
    'chess',
    'donkeyjump',
    'EatKano-main',
    'flybird',
    'fruitninjia',
    'gobang',
    'magictower',
    'planebattle',
    'rabbitrun',
    'spiderpoker',
    'tapkill',
    'gobang-classic',
    'tower-defense-shooter',
    'daily-racer',
    'shooter',
    'angry-red-riding-hood',
    'mummy-returns',
    'stickman-adventure',
    'cloud-jump',
    'warcraft-castle'
];

const gamesDir = path.resolve(__dirname, 'games');

console.log("--- FINAL CLEANUP STARTED ---");

if (!fs.existsSync(gamesDir)) {
    console.error("Games directory not found!");
    process.exit(1);
}

const files = fs.readdirSync(gamesDir);

files.forEach(file => {
    const fullPath = path.join(gamesDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
        if (!KEEP_FOLDERS.includes(file)) {
            console.log(`[DELETE] ${file}`);
            try {
                fs.rmSync(fullPath, { recursive: true, force: true });
            } catch (e) {
                console.error(`Failed to delete ${file}:`, e.message);
            }
        } else {
            console.log(`[KEEP]   ${file}`);
        }
    }
});

console.log("--- CLEANUP FINISHED ---");
