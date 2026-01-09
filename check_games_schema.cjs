const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/gamezoe.db');

// First, check the schema
db.all("PRAGMA table_info(games)", (err, rows) => {
    if (err) {
        console.error('Error reading schema:', err.message);
        db.close();
        return;
    }

    console.log('Games table columns:');
    rows.forEach(row => {
        console.log(`  - ${row.name} (${row.type})`);
    });

    // Now check current MyFish entry
    db.get('SELECT * FROM games WHERE game_id = ?',
        ['my-fish-egret'],
        (err, row) => {
            if (err) {
                console.error('Error reading game:', err.message);
            } else {
                console.log('\nCurrent MyFish entry:');
                console.log(row);
            }
            db.close();
        });
});
