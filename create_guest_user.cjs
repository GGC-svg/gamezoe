const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/gamezoe.db');

// Check if user 1001 exists
db.get('SELECT id, username, fish_balance FROM users WHERE id = ?', ['1001'], (err, user) => {
    if (err) {
        console.error('Error checking user:', err);
        db.close();
        return;
    }

    if (user) {
        console.log('✅ User 1001 already exists:', user);
        db.close();
    } else {
        console.log('❌ User 1001 not found. Creating...');

        // Create guest user
        db.run(
            `INSERT INTO users (id, username, email, fish_balance, gold_balance, created_at) 
             VALUES (?, ?, ?, ?, ?, datetime('now'))`,
            ['1001', 'Guest User', 'guest@gamezoe.com', 500.0, 0],
            function (err) {
                if (err) {
                    console.error('Error creating user:', err);
                } else {
                    console.log('✅ Created user 1001');

                    // Verify
                    db.get('SELECT id, username, fish_balance FROM users WHERE id = ?', ['1001'], (err, user) => {
                        if (user) {
                            console.log('Verification:', user);
                        }
                        db.close();
                    });
                }
            }
        );
    }
});
