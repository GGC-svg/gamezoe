const fs = require('fs');
try {
    const content = fs.readFileSync('e:/Steam/gamezoe/temp_check_duck.js', 'utf8');
    const idx = content.indexOf('你贏了!');
    if (idx != -1) {
        console.log(content.substring(idx, idx + 600));
    } else {
        console.log("String not found");
    }
} catch (e) { console.error(e); }
