const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/gamezoe.db');

const userId = '102746929077306565219';

db.get(
    'SELECT id, name, email, fish_balance FROM users WHERE id = ?',
    [userId],
    (err, user) => {
        if (err) {
            console.error('Error:', err);
        } else if (user) {
            console.log('✅ User found:', user);
        } else {
            console.log('❌ User NOT found in database!');
            console.log('Checking all users...');
            db.all('SELECT id, name, fish_balance FROM users', (err, users) => {
                console.log(`Total users: ${users.length}`);
                users.forEach(u => console.log(`  - ${u.id}: ${u.name} (fish_balance: ${u.fish_balance})`));
                db.close();
            });
            return;
        }
        db.close();
    }
);
