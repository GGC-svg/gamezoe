import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

// Convert ESM URL to Path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The uploaded image path provided by User
const IMAGE_PATH = 'C:/Users/user/.gemini/antigravity/brain/baf361bb-87d2-4859-b793-71b5164e6cf2/uploaded_image_1767277321039.png';

function updateImage() {
    console.log("Reading image...");
    if (!fs.existsSync(IMAGE_PATH)) {
        console.error("Image file not found:", IMAGE_PATH);
        return;
    }

    const imageBuffer = fs.readFileSync(IMAGE_PATH);
    const base64Image = 'data:image/png;base64,' + imageBuffer.toString('base64');

    console.log("Connecting to Database...");
    const dbPath = path.join(__dirname, 'server', 'gamezoe.db');
    const db = new sqlite3.Database(dbPath);

    // Update the game that has '2048' in the title
    const sql = `UPDATE games SET thumbnailUrl = ?, coverUrl = ? WHERE title LIKE '%2048%'`;

    db.run(sql, [base64Image, base64Image], function (err) {
        if (err) {
            console.error("Error updating image:", err.message);
        } else {
            console.log(`Successfully updated ${this.changes} game(s) with the new image!`);
        }
        db.close();
    });
}

updateImage();
