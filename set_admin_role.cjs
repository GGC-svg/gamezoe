
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'server/gamezoe.db');
console.log(`Opening database at: ${dbPath}`);
const db = new sqlite3.Database(dbPath);

const userId = '102746929077306565219';

function ensureRoleColumn(callback) {
    db.all("PRAGMA table_info(users)", (err, cols) => {
        if (err) return callback(err);

        const hasRole = cols.some(c => c.name === 'role');
        if (!hasRole) {
            console.log("Migrating: Adding 'role' column to users table...");
            db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'", (err) => {
                if (err) return callback(err);
                console.log("'role' column added.");
                callback(null);
            });
        } else {
            console.log("'role' column exists.");
            callback(null);
        }
    });
}

db.serialize(() => {
    ensureRoleColumn((err) => {
        if (err) {
            console.error("Migration failed:", err.message);
            db.close();
            return;
        }

        // 1. Check current role
        db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
            if (err) {
                console.error("Error reading user:", err.message);
                db.close();
                return;
            }
            if (!row) {
                console.log(`User ID ${userId} not found!`);
                db.close();
                return;
            }
            console.log(`Current user role: ${row.role}`);

            // 2. Update role to admin
            db.run("UPDATE users SET role = 'admin' WHERE id = ?", [userId], function (err) {
                if (err) {
                    console.error("Error updating role:", err.message);
                    db.close();
                    return;
                }
                console.log(`Row(s) updated: ${this.changes}`);

                // 3. Verify update
                db.get("SELECT * FROM users WHERE id = ?", [userId], (err, row) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log('User updated successfully:', row);
                    }
                    db.close();
                });
            });
        });
    });
});
