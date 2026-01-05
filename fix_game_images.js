
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server/gamezoe.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Error opening database:', err.message);
    else console.log('Connected to database to fix images.');
});

db.serialize(() => {
    // 1. Fix Fish Master (Found real asset)
    // URL path is relative to public/ or mapped routes. 
    // Mapped: /games/fish -> games/fish-master/client/fish
    const fishImg = '/games/fish/res/raw-assets/resources/yqs/HallRes/hall/hallTitle.56267.png';

    db.run(`UPDATE games SET thumbnailUrl = ?, coverUrl = ? WHERE id = 'fish-master'`,
        [fishImg, fishImg],
        (err) => {
            if (err) console.error("Error updating Fish Master:", err);
            else console.log("Fixed Fish Master images.");
        });

    // 2. Fix ViperPro (Broken link -> Generic Casino Icon)
    // We'll use the Slot Machine symbol as a temporary valid placeholder
    const viperImg = '/games/slot-machine/assets/images/symbol_1.png';
    db.run(`UPDATE games SET thumbnailUrl = ?, coverUrl = ? WHERE id = 'viperpro'`,
        [viperImg, viperImg],
        (err) => {
            if (err) console.error("Error updating ViperPro:", err);
            else console.log("Fixed ViperPro images (Placeholder).");
        });

    // 3. Fix Classic Slot (Optional, ensuring it's set)
    // db.run(...)
});
