const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'server', 'index.js');
let content = fs.readFileSync(filePath, 'utf8');

const oldCase = `            CASE w.type
                WHEN 'deposit' THEN '儲值'
                WHEN 'transfer' THEN '轉點'
                WHEN 'service' THEN '服務消費'
                WHEN 'purchase' THEN '購買'
                WHEN 'refund' THEN '退款'
                ELSE w.type
            END as '交易類型',`;

const newCase = `            CASE w.type
                WHEN 'deposit' THEN '儲值'
                WHEN 'p99_deposit' THEN 'P99儲值'
                WHEN 'top_up' THEN '儲值入帳'
                WHEN 'transfer' THEN '轉點'
                WHEN 'transfer_out' THEN '轉出至遊戲'
                WHEN 'game_deposit' THEN '遊戲轉入'
                WHEN 'game_withdraw' THEN '遊戲轉出'
                WHEN 'casino_deposit' THEN '遊戲點數初始化'
                WHEN 'game_win' THEN '遊戲獲利'
                WHEN 'game_rental' THEN '遊戲租借'
                WHEN 'admin_award' THEN '管理員贈送'
                WHEN 'initial_bonus' THEN '初始贈送'
                WHEN 'service' THEN '服務消費'
                WHEN 'purchase' THEN '購買'
                WHEN 'refund' THEN '退款'
                ELSE w.type
            END as '交易類型',`;

if (content.includes(oldCase)) {
    content = content.replace(oldCase, newCase);
    fs.writeFileSync(filePath, content);
    console.log('✓ Transaction types Chinese labels updated successfully!');
} else if (content.includes(newCase)) {
    console.log('✓ Already updated!');
} else {
    console.log('✗ Could not find the target code block.');
    // Show what we have around line 2880
    const lines = content.split('\n');
    console.log('Lines 2878-2890:');
    for (let i = 2877; i < 2890 && i < lines.length; i++) {
        console.log(`${i+1}: ${lines[i]}`);
    }
}
