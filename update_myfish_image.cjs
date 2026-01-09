const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/gamezoe.db');

const updateSQL = `
  UPDATE games 
  SET thumbnailUrl = '/images/myfish_gameplay.jpg',
      coverUrl = '/images/myfish_gameplay.jpg'
  WHERE id = 'my-fish-egret'
`;

db.run(updateSQL, function (err) {
    if (err) {
        console.error('Error updating:', err.message);
        db.close();
        return;
    }

    console.log(`✅ Updated MyFish images. Changes: ${this.changes}`);

    // Verify
    db.get('SELECT id, title, thumbnailUrl, coverUrl FROM games WHERE id = ?',
        ['my-fish-egret'],
        (err, row) => {
            if (err) {
                console.error('Error reading:', err.message);
            } else {
                console.log('\n📸 Current MyFish entry:');
                console.log(row);
            }
            db.close();
        });
});
