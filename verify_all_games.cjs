const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/gamezoe.db');

console.log('📊 GameZoe Games Inventory\n');
console.log('='.repeat(80));

db.all('SELECT id, title, category, gameUrl, isFree FROM games ORDER BY category, title', (err, games) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }

    console.log(`\n✅ Total Games: ${games.length}\n`);

    // Group by category
    const byCategory = {};
    games.forEach(game => {
        const cat = game.category || 'Other';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(game);
    });

    // Display by category
    Object.keys(byCategory).sort().forEach(category => {
        console.log(`\n📁 ${category} (${byCategory[category].length} games)`);
        console.log('-'.repeat(80));

        byCategory[category].forEach(game => {
            const status = game.isFree ? '🆓 Free' : '💰 Paid';
            const url = game.gameUrl || 'N/A';
            console.log(`  ${status} ${game.title}`);
            console.log(`     ID: ${game.id}`);
            console.log(`     URL: ${url}`);
            console.log('');
        });
    });

    // Special servers check
    console.log('\n🔧 Special Server Requirements:');
    console.log('-'.repeat(80));

    const fishMaster = games.find(g => g.id === 'fish-master');
    const myFish = games.find(g => g.id === 'my-fish-egret');

    if (fishMaster) {
        console.log('  ✅ Fish Master → Requires Fish Mocker (Port 4002)');
        console.log(`     URL: ${fishMaster.gameUrl}`);
    }

    if (myFish) {
        console.log('  ✅ MyFish → Requires MyFish Server (Port 9001)');
        console.log(`     URL: ${myFish.gameUrl}`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Inventory Complete');

    db.close();
});
