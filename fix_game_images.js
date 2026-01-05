import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'server', 'gamezoe.db');
const assetsDir = path.join(__dirname, 'public', 'game_assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

const IMAGES_TO_FIX = [
    {
        titleKeyword: 'Plane',
        url: 'https://images.unsplash.com/photo-1542256844-311ebb2cdbf6?q=80&w=400&h=600&fit=crop',
        filename: 'plane_cover.jpg'
    },
    {
        titleKeyword: 'Merchant',
        url: 'https://images.unsplash.com/photo-1577156930067-178652615951?q=80&w=400&h=600&fit=crop',
        filename: 'merchant_cover.jpg'
    }
];

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        https.get(url, options, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                // Follow redirect
                downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to load version ${url}: ${res.statusCode}`));
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

async function run() {
    console.log("Fixing game images...");

    for (const item of IMAGES_TO_FIX) {
        const localPath = `/game_assets/${item.filename}`;
        const fullPath = path.join(assetsDir, item.filename);

        try {
            console.log(`Downloading ${item.filename}...`);
            await downloadImage(item.url, fullPath);

            console.log(`Updating DB for ${item.titleKeyword}...`);
            await new Promise((resolve, reject) => {
                db.run(
                    `UPDATE games SET thumbnailUrl = ?, coverUrl = ? WHERE title LIKE ?`,
                    [localPath, localPath, `%${item.titleKeyword}%`],
                    function (err) {
                        if (err) reject(err);
                        else {
                            console.log(`Updated ${this.changes} rows.`);
                            resolve();
                        }
                    }
                );
            });

        } catch (error) {
            console.error(`Error processing ${item.titleKeyword}:`, error);
        }
    }
    db.close();
    console.log("Done!");
}

run();
