const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const gamesDir = path.join(rootDir, 'games');
const distDir = path.join(rootDir, 'dist');
const serverDir = path.join(rootDir, 'server');
const dbPath = path.join(serverDir, 'gamezoe.db');

console.log("=== GameZoe Production Readiness Check ===");
console.log(`Root: ${rootDir}`);

let errors = 0;

function check(name, condition, successMsg, failMsg) {
    if (condition) {
        console.log(`[PASS] ${name}: ${successMsg}`);
    } else {
        console.error(`[FAIL] ${name}: ${failMsg}`);
        errors++;
    }
}

// 1. Check Dist
check('Frontend Build', fs.existsSync(distDir) && fs.existsSync(path.join(distDir, 'index.html')),
    'dist/index.html found', 'dist/index.html MISSING. Run "npm run build".');

// 2. Check Games Directory
check('Games Directory', fs.existsSync(gamesDir),
    'games directory exists', 'games directory MISSING.');

// 3. Check Fish Master
const fishClientPath = path.join(gamesDir, 'fish-master/client/fish/index.html');
check('Fish Master Game', fs.existsSync(fishClientPath),
    'Fish Master client files found',
    `Fish Master files MISSING at ${fishClientPath}. Check git submodules?`);

// 4. Check Database
check('Database', fs.existsSync(dbPath),
    'gamezoe.db found', 'gamezoe.db MISSING. It should be created on first run.');

// 5. Check Node Version
try {
    const nodeVer = execSync('node -v').toString().trim();
    console.log(`[INFO] Node Version: ${nodeVer}`);
} catch (e) { }

// 6. Check PM2
try {
    const pm2List = execSync('pm2 list').toString();
    console.log("[INFO] PM2 Status:");
    console.log(pm2List);
} catch (e) {
    console.warn("[WARN] PM2 not found or error listing processes.");
}

console.log("==========================================");
if (errors > 0) {
    console.error(`Found ${errors} CRITICAL errors. Fix them before expecting the site to work.`);
    process.exit(1);
} else {
    console.log("Basic file structure looks good!");
    process.exit(0);
}
