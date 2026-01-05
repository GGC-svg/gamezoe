import fs from 'fs';
import path from 'path';
import https from 'https';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_DIR = path.join(__dirname, 'public', 'games', 'clumsy-bird');
const DB_PATH = path.join(__dirname, 'server', 'gamezoe.db');

const REPO_OWNER = 'ellisonleao';
const REPO_NAME = 'clumsy-bird';
const BRANCH = 'master';

if (!fs.existsSync(BASE_DIR)) fs.mkdirSync(BASE_DIR, { recursive: true });

async function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: { 'User-Agent': 'Node.js Downloader' }
        };
        https.get(url, options, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                downloadFile(res.headers.location, filepath).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Failed ${res.statusCode}: ${url}`));
                return;
            }
            const fileStream = fs.createWriteStream(filepath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
        }).on('error', reject);
    });
}

async function fetchRepoTree() {
    console.log("Fetching file list from GitHub API...");
    return new Promise((resolve, reject) => {
        const options = {
            headers: { 'User-Agent': 'Node.js Downloader' }
        };
        const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${BRANCH}?recursive=1`;

        let data = '';
        https.get(url, options, (res) => {
            if (res.statusCode !== 200) {
                reject(new Error(`API Error ${res.statusCode}`));
                return;
            }
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function install() {
    try {
        const treeData = await fetchRepoTree();
        if (!treeData.tree) throw new Error("Invalid API response");

        // Filter files (blobs), ignore irrelevant ones
        const files = treeData.tree.filter(item => item.type === 'blob' && !item.path.startsWith('.'));

        console.log(`Found ${files.length} files. Starting download...`);
        let downloaded = 0;

        for (const file of files) {
            const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${file.path}`;
            const localPath = path.join(BASE_DIR, file.path);
            const dir = path.dirname(localPath);

            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

            // console.log(`Downloading ${file.path}...`);
            await downloadFile(rawUrl, localPath);
            downloaded++;
            if (downloaded % 10 === 0) console.log(`Progress: ${downloaded}/${files.length}`);
        }
        console.log("Download complete!");

        // Register in DB
        registerGame();

    } catch (error) {
        console.error("Installation failed:", error);
    }
}

function registerGame() {
    console.log("Registering in Database...");
    const db = new sqlite3.Database(DB_PATH);
    const game = {
        id: 'game_clumsy_' + Date.now(),
        title: '笨笨鳥 (Clumsy Bird)',
        description: '經典 Flappy Bird 玩法，簡單卻令人上癮！',
        fullDescription: '控制這隻笨拙的小鳥飛越障礙物。點擊螢幕讓牠飛起來，小心不要撞到水管！看你能堅持多久？',
        thumbnailUrl: '/games/clumsy-bird/data/img/clumsy.png', // Use local asset if possible, or fallback
        coverUrl: 'https://images.unsplash.com/photo-1555862124-b36340454371?q=80&w=800&h=400&fit=crop', // Bird cover
        gameUrl: '/games/clumsy-bird/index.html',
        developer: 'Ellison Leao',
        price: 0,
        isFree: 1,
        category: 'CASUAL',
        rating: 4.6,
        releaseDate: new Date().toISOString().split('T')[0]
    };

    // We can try to assume one of the downloaded images is good for thumbnail
    // data/img/clumsy.png usually exists

    db.serialize(() => {
        const checkSql = "SELECT id FROM games WHERE gameUrl = ?";
        db.get(checkSql, [game.gameUrl], (err, row) => {
            if (row) {
                console.log("Game already exists.");
            } else {
                const sql = `INSERT INTO games (id, title, description, fullDescription, thumbnailUrl, coverUrl, gameUrl, developer, price, isFree, category, rating, releaseDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const params = [
                    game.id, game.title, game.description, game.fullDescription,
                    game.thumbnailUrl, game.coverUrl, game.gameUrl, game.developer,
                    game.price, game.isFree, game.category, game.rating, game.releaseDate
                ];
                db.run(sql, params, (err) => {
                    if (err) console.error(err);
                    else console.log("Game registered successfully!");
                });
            }
        });
    });
}

install();
