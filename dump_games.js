import db from './server/database.js';

db.all("SELECT id, title, gameUrl FROM games", [], (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log(JSON.stringify(rows, null, 2));
    }
});
