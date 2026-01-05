const fs = require('fs');

const filePath = 'e:/Steam/gamezoe/games/DuckHunt-JS-master/dist/duckhunt.js';

try {
    // Try reading as UTF-16LE
    const content = fs.readFileSync(filePath, 'utf16le');

    // Quick check if it looks like JS
    if (content.includes('function') || content.includes('var ')) {
        console.log("Read successful as UTF-16LE. Converting to UTF-8...");
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Converted.");
    } else {
        console.log("Content doesn't look like JS after UTF-16LE read. valid?");
        // maybe it wasn't utf16le?
    }
} catch (e) {
    console.error(e);
}
