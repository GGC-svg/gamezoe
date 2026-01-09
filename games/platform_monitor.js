
const http = require('http');
const { exec } = require('child_process');

// CONFIGURATION
const CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 Minutes
const SERVICES = [
    { name: 'UniversalLoc AI', url: 'http://localhost:3000', restartCmd: 'npm start', path: './universalloc-ai---全領域專家級翻譯神器' }
    // Add other games here:
    // { name: 'Pacman', url: 'http://localhost:8080', ... }
];

console.log(`
╔════════════════════════════════════════╗
║    GAMEZOE HEALTH MONITOR V1.0         ║
║    Interval: ${CHECK_INTERVAL_MS / 60000} minutes               ║
╚════════════════════════════════════════╝
`);

const checkService = (service) => {
    console.log(`[${new Date().toISOString()}] Checking ${service.name}...`);

    const req = http.get(service.url, (res) => {
        console.log(`  ✅ ${service.name} is ALIVE (Status: ${res.statusCode})`);
    });

    req.on('error', (err) => {
        console.error(`  ❌ ${service.name} is DEAD (Error: ${err.message})`);
        triggerRestart();
    });

    req.end();
};

const triggerRestart = () => {
    console.log('!!! CRITICAL FAILURE DETECTED !!!');
    console.log('Initiating ROBUST RESTART sequence...');

    // Execute the robust startup script
    exec('start_platform_robust.bat', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log('Restart command issued.');
    });
};

// Main Loop
const runHealthChecks = () => {
    SERVICES.forEach(checkService);
};

// Start
runHealthChecks();
setInterval(runHealthChecks, CHECK_INTERVAL_MS);
