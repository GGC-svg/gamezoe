const fs = require('fs');
const filePath = 'e:\\Steam\\gamezoe\\games\\fish-master\\client\\fish\\src\\project.js';
const searchStrings = ['UserInfoWinChild', 'Alert', 'UserInfoWin'];

fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    const lines = data.split('\n');
    lines.forEach((line, index) => {
        searchStrings.forEach(str => {
            if (line.includes(str)) {
                // Check if it looks like a definition
                if (line.includes('cc.Class') || line.includes('cc._RF.push'))
                    console.log(`Found ${str} at line ${index + 1}: ${line.trim().substring(0, 100)}`);
            }
        });
    });
});
