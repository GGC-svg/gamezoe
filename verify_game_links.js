import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'server/gamezoe.db');
const gamesRoot = path.resolve(__dirname, 'games');

const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

// Manual Map for SPECIAL Routes defined in server/index.js
const SPECIAL_MAP = {
    'fish-master': path.join(gamesRoot, 'fish-master/client/fish/index.html'),
    'slot-machine-2': path.join(gamesRoot, 'html5-slot-machine-main/dist/index.html')
};

db.all("SELECT id, title, gameUrl FROM games", [], (err, rows) => {
    if (err) throw err;

    console.log("--- ADVANCED VERIFICATION ---");
    let missingCount = 0;

    rows.forEach((row) => {
        let checkPath = '';

        // 1. Check Special Maps
        if (SPECIAL_MAP[row.id] || SPECIAL_MAP[path.basename(row.gameUrl)]) {
            const key = SPECIAL_MAP[row.id] ? row.id : path.basename(row.gameUrl);
            checkPath = SPECIAL_MAP[key];
        }
        // 2. Standard /games/ Route
        else if (row.gameUrl.startsWith('/games/')) {
            const relative = row.gameUrl.replace('/games/', '');
            checkPath = path.join(gamesRoot, relative);
        }
        // 3. Remote URL
        else if (row.gameUrl.startsWith('http')) {
            console.log(`[REMOTE] ${row.title}`);
            return;
        }

        if (checkPath) {
            if (fs.existsSync(checkPath)) {
                // console.log(`[OK] ${row.title}`);
            } else {
                console.error(`[MISSING] ${row.title}`);
                console.error(`   URL: ${row.gameUrl}`);
                console.error(`   Path: ${checkPath}`);
                missingCount++;
            }
        }
    });

    console.log("------------------------------");
    console.log(`Total Missing: ${missingCount}`);
    db.close();
});
