import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server/gamezoe.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

db.all("SELECT id, name, description, active FROM games", [], (err, rows) => {
    if (err) {
        throw err;
    }
    console.log("Total Games Found:", rows.length);
    rows.forEach((row) => {
        console.log(`[${row.id}] ${row.name} (Active: ${row.active})`);
    });
    // Check specifically for our target games
    const hasFish = rows.some(r => r.name.includes('Fish') || r.name.includes('捕魚'));
    const hasSlot = rows.some(r => r.name.includes('Slot') || r.name.includes('老虎機'));

    console.log("\n--- Detection Report ---");
    console.log("Fish Master Present:", hasFish);
    console.log("Slot Machine Present:", hasSlot);
});
