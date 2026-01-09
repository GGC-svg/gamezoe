
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));

// Auto-discovery of static game folders
const GAMES_DIR = path.join(__dirname, 'games');

if (fs.existsSync(GAMES_DIR)) {
    const games = fs.readdirSync(GAMES_DIR).filter(file => {
        return fs.statSync(path.join(GAMES_DIR, file)).isDirectory();
    });

    console.log(`Found ${games.length} games.`);

    games.forEach(game => {
        const gamePath = path.join(GAMES_DIR, game);
        // Serve each game's folder static files deeply
        app.use(`/games/${game}`, express.static(gamePath));
        console.log(`Serving /games/${game} -> ${gamePath}`);
    });
}

// Default Health Check for GCP
app.get('/_ah/health', (req, res) => res.status(200).send('OK'));

app.get('/', (req, res) => {
    res.send('<h1>Gamezoe Platform is Running</h1><p>Access games via /games/[game-name]</p>');
});

app.listen(PORT, () => {
    console.log(`Platform Server listening on port ${PORT}`);
});
