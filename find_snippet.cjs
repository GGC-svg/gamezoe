const fs = require('fs');
const content = fs.readFileSync('e:/Steam/gamezoe/temp_duckhunt.js', 'utf8');
const index = content.indexOf('champ');
if (index !== -1) {
    console.log("Snippet found:");
    console.log(content.substring(index - 100, index + 300));
} else {
    console.log('Not found');
}
