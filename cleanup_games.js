import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// THE ALLOW LIST (Folders to KEEP based on DB)
const KEEP_FOLDERS = [
    '2048', 'plane', 'merchant', 'clumsy-bird', 'AlienInvasion-master', 'DuckHunt-JS-master',
    'diablo-js-master', 'circushtml5-master', 'SpaceInvaders-master', 'OpHog-master',
    'last-colony-master', 'pacman-canvas-master', 'tower_game-master', 'elemental-one-master',
    'space-crusade-master', 'ludum-dare-28-master', '3d-bear-run', 'canvasplane', 'chess',
    'donkeyjump', 'EatKano-main', 'flybird', 'fruitninjia', 'gobang', 'magictower',
    'planebattle', 'rabbitrun', 'spiderpoker', 'tapkill', 'gobang-classic', 'tower-defense-shooter',
    'daily-racer', 'shooter', 'angry-red-riding-hood', 'mummy-returns', 'stickman-adventure',
    'racing-1', 'racing-2', 'cloud-jump', 'warcraft-castle', 'slot-machine',
    'html5-slot-machine-main', 'fish-master', 'ViperPro-Casino-main', 'common', 'games'
];

const gamesDir = path.resolve(__dirname, 'games');

fs.readdir(gamesDir, (err, files) => {
    if (err) throw err;

    files.forEach(file => {
        const fullPath = path.join(gamesDir, file);
        // Only verify directories
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            if (!KEEP_FOLDERS.includes(file)) {
                console.log(`[DELETE] ${file}`);
                try {
                    fs.rmSync(fullPath, { recursive: true, force: true });
                } catch (e) {
                    console.error(`Failed to delete ${file}:`, e.message);
                }
            } else {
                // console.log(`[KEEP] ${file}`);
            }
        }
    });
});
