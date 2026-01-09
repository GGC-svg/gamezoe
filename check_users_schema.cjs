const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/gamezoe.db');

// Check schema
db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }

    console.log('Users table columns:');
    columns.forEach(col => {
        console.log(`  - ${col.name} (${col.type})`);
    });

    // Check if user 1001 exists
    db.get('SELECT * FROM users WHERE id = ?', ['1001'], (err, user) => {
        if (err) {
            console.error('Error checking user:', err);
        } else if (user) {
            console.log('\n✅ User 1001 exists:', user);
        } else {
            console.log('\n❌ User 1001 NOT found');
            console.log('Sampling existing users...');
            db.all('SELECT id, fish_balance FROM users LIMIT 3', (err, users) => {
                if (users) {
                    console.log(users);
                }
                db.close();
            });
            return;
        }
        db.close();
    });
});
