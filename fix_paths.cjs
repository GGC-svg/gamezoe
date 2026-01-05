const fs = require('fs');
const path = require('path');

const sourceDir = 'e:/Steam/gamezoe/games/games';
const targetDir = 'e:/Steam/gamezoe/games';

if (fs.existsSync(sourceDir)) {
    const files = fs.readdirSync(sourceDir);
    let movedCount = 0;

    files.forEach(file => {
        const srcPath = path.join(sourceDir, file);
        const destPath = path.join(targetDir, file);

        try {
            // Check if destination exists
            if (fs.existsSync(destPath)) {
                console.log(`Skipping ${file} - already exists in target`);
            } else {
                fs.renameSync(srcPath, destPath);
                movedCount++;
            }
        } catch (err) {
            console.error(`Failed to move ${file}:`, err.message);
        }
    });
    console.log(`Moved ${movedCount} items.`);

    // Attempt to remove the now empty source dir
    try {
        fs.rmdirSync(sourceDir);
        console.log("Removed empty source directory.");
    } catch (e) {
        console.log("Source directory not empty or could not be removed.");
    }

} else {
    console.log("Source directory games/games does not exist.");
}
