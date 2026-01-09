import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import gamesData from './games_data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'gamezoe.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Delete demo games
    const demoGameIds = [
        'game_star_voyage',
        'game_shadow_assassin',
        'game_speed_racer',
        'game_abyss_dungeon',
        'game_farm_life'
    ];

    console.log('🗑️  Deleting demo games...');
    const deleteStmt = db.prepare(`DELETE FROM games WHERE id = ?`);
    demoGameIds.forEach(id => {
        deleteStmt.run(id);
    });
    deleteStmt.finalize();

    // Insert all real games
    console.log('\n📥 Importing real games...\n');
    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO games 
        (id, title, description, fullDescription, thumbnailUrl, coverUrl, gameUrl, developer, price, isFree, category, rating, releaseDate, displayOrder) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    gamesData.forEach((game, index) => {
        insertStmt.run(
            game.id,
            game.title,
            game.description || '',
            game.fullDescription || game.description || '',
            game.thumbnailUrl || '',
            game.coverUrl || '',
            game.gameUrl,
            game.developer || 'GameZoe',
            game.price || 0,
            game.isFree !== undefined ? game.isFree : 1,
            game.category,
            game.rating || 4.5,
            game.releaseDate || new Date().toISOString().split('T')[0],
            game.displayOrder !== undefined ? game.displayOrder : index
        );
        console.log(`✓ ${game.title}`);
    });

    insertStmt.finalize(() => {
        console.log(`\n🎉 Successfully imported ${gamesData.length} games!`);
        db.close();
    });
});
