const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 正确的数据库路径
const dbPath = path.join(__dirname, 'server', 'gamezoe.db');
const db = new sqlite3.Database(dbPath);

const userId = '102746929077306565219';
const newBalance = 30000; // 30000 游戏分数

console.log(`📂 Using database: ${dbPath}\n`);

// 查询当前余额
db.get("SELECT id, name, fish_balance FROM users WHERE id = ?", [userId], (err, row) => {
    if (err) {
        console.error('❌ Query error:', err.message);
        db.close();
        return;
    }

    if (!row) {
        console.error(`❌ User ${userId} not found in database`);
        db.close();
        return;
    }

    console.log(`📊 Current state:`);
    console.log(`   User: ${row.name}`);
    console.log(`   Old fish_balance: ${row.fish_balance}`);

    // 更新为30000
    db.run("UPDATE users SET fish_balance = ? WHERE id = ?", [newBalance, userId], function (updateErr) {
        if (updateErr) {
            console.error('❌ Update error:', updateErr.message);
        } else {
            console.log(`\n✅ Updated successfully!`);
            console.log(`   New fish_balance: ${newBalance}`);
            console.log(`   Rows affected: ${this.changes}`);
            console.log(`\n💡 游戏内将显示: ${newBalance} 点数`);
            console.log(`   (因为向后兼容逻辑，30000 < 1000000，会 *1000 = 30000000 游戏分数)`);
        }
        db.close();
    });
});
