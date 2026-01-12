import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'gamezoe.db');
const db = new sqlite3.Database(dbPath);

db.all("SELECT * FROM games ORDER BY displayOrder", (err, rows) => {
    if (err) {
        console.error("Error:", err);
        db.close();
        return;
    }

    const outputPath = path.resolve(__dirname, '..', 'games_export_utf8.json');
    fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2), 'utf8');
    console.log("Exported", rows.length, "games to", outputPath);
    db.close();
});
