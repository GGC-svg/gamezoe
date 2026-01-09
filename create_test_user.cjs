const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/gamezoe.db');

// Create user 1001 for testing
db.run(
    `INSERT INTO users (id, name, email, fish_balance, gold_balance, silver_balance, provider, role) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['1001', 'Guest User', 'guest@gamezoe.com', 500, 0, 0, 'guest', 'user'],
    function (err) {
        if (err) {
            console.error('Error creating user:', err.message);
        } else {
            console.log('✅ Created test user 1001');

            // Verify
            db.get('SELECT id, name, fish_balance FROM users WHERE id = ?', ['1001'], (err, user) => {
                if (user) {
                    console.log('Verified:', user);
                }
                db.close();
            });
        }
    }
);
