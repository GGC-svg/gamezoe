const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/gamezoe.db');

const corruptedId = '102746929077306570000';
const correctId = '102746929077306565219';

console.log('🔍 Checking user in database...\n');

db.get('SELECT * FROM users WHERE id LIKE ?', [corruptedId], (err, user) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }

    if (user) {
        console.log('❌ Found corrupted user:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Fish Balance: ${user.fish_balance}\n`);

        console.log('🔧 Deleting corrupted user...');
        db.run('DELETE FROM users WHERE id = ?', [corruptedId], (err) => {
            if (err) {
                console.error('Delete error:', err);
            } else {
                console.log('✅ Corrupted user deleted!');
                console.log('\n📝 Next steps:');
                console.log('   1. Restart backend: npm run dev');
                console.log('   2. Logout from platform');
                console.log('   3. Re-login with Google');
                console.log('   4. Should create new user with correct ID!');
            }
            db.close();
        });
    } else {
        console.log('✅ No corrupted user found.');
        console.log('Checking if correct user exists...\n');

        db.get('SELECT * FROM users WHERE id = ?', [correctId], (err, correctUser) => {
            if (correctUser) {
                console.log('✅ Correct user already exists:');
                console.log(`   ID: ${correctUser.id}`);
                console.log(`   Name: ${correctUser.name}`);
                console.log(`   Fish Balance: ${correctUser.fish_balance}`);
            } else {
                console.log('ℹ️  No user found. Will be created on next login.');
            }
            db.close();
        });
    }
});
