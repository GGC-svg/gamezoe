
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

// Auto-discovery of static game folders
const GAMES_DIR = path.join(__dirname, 'games');

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

if (fs.existsSync(GAMES_DIR)) {
    const games = fs.readdirSync(GAMES_DIR).filter(file => {
        const fullPath = path.join(GAMES_DIR, file);
        const isDir = fs.statSync(fullPath).isDirectory();
        console.log(`Checking: ${file} - isDirectory: ${isDir}`);
        return isDir;
    });

    console.log(`Found ${games.length} games:`, games);

    games.forEach(game => {
        const gamePath = path.join(GAMES_DIR, game);

        // Check what files exist in this game directory
        try {
            const files = fs.readdirSync(gamePath);
            console.log(`Game "${game}" contains ${files.length} items:`, files.slice(0, 5));
        } catch (err) {
            console.error(`Error reading game directory ${game}:`, err);
        }

        // Serve each game's folder static files deeply
        app.use(`/games/${game}`, express.static(gamePath));
        console.log(`Serving /games/${game} -> ${gamePath}`);
    });
} else {
    console.error(`GAMES_DIR does not exist: ${GAMES_DIR}`);
}

// Default Health Check for GCP
app.get('/_ah/health', (req, res) => res.status(200).send('OK'));

app.get('/', (req, res) => {
    res.send('<h1>Gamezoe Platform is Running</h1><p>Access games via /games/[game-name]</p>');
});

app.listen(PORT, () => {
    console.log(`Platform Server listening on port ${PORT}`);
});
