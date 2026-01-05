import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'server/gamezoe.db');
const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database(dbPath);

db.serialize(() => {
    // Update all google users to admin for dev convenience, or specify email if known.
    // Since we only have one dev user usually, updating all 'google' providers is safe for this context.
    db.run("UPDATE users SET role = 'admin' WHERE provider = 'google'", function (err) {
        if (err) {
            console.error("Error updating role:", err.message);
        } else {
            console.log(`Updated ${this.changes} users to admin role.`);
        }
    });

    db.all("SELECT id, name, email, role FROM users", (err, rows) => {
        console.log("Current Users:", rows);
    });
});
