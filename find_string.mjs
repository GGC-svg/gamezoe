import fs from 'fs';
const filePath = 'e:\\Steam\\gamezoe\\games\\fish-master\\client\\fish\\src\\project.js';
const searchStrings = ['location.search', 'GetQueryString', 'getQueryVariable', 'user_id', 'userId'];

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split('\n');
    lines.forEach((line, index) => {
        searchStrings.forEach(str => {
            if (line.includes(str)) {
                // ignore definition lines or log lines unless relevant
                if (!line.includes('console.log'))
                    console.log(`Found ${str} at line ${index + 1}: ${line.trim().substring(0, 100)}`);
            }
        });
    });
} catch (err) {
    console.error(err);
}
