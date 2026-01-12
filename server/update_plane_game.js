import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'gamezoe.db');
const db = new sqlite3.Database(dbPath);

// New game info for 1943 Battle of Midway
const newTitle = "1943 中途島海戰 (1943 Battle of Midway)";
const newDescription = "駕駛P-38戰鬥機，擊沉日本帝國海軍艦隊！經典街機射擊遊戲重現。";
const newFullDescription = "致敬經典街機遊戲《1943》，在這款縱向捲軸射擊遊戲中，您將駕駛P-38閃電戰鬥機，對抗日本帝國海軍的龐大艦隊。遊戲特色包括：16關BOSS戰（從重巡洋艦到大和號超級戰艦）、多部件BOSS系統（可破壞的砲塔與艦橋）、6種可升級武器（火神砲、散彈、雷射等）、以及精美的像素風格視覺效果。準備好迎接硫磺島、中途島到最終大和號的史詩級海空對決！";

db.serialize(() => {
    // First, let's see the current data
    db.get("SELECT id, title FROM games WHERE gameUrl LIKE '%/plane/index%'", (err, row) => {
        if (err) {
            console.error("Error:", err);
            return;
        }
        if (!row) {
            console.log("Game not found!");
            return;
        }

        console.log("Found game:", row.id, row.title);

        // Update the game
        const sql = `UPDATE games SET
            title = ?,
            description = ?,
            fullDescription = ?
            WHERE id = ?`;

        db.run(sql, [newTitle, newDescription, newFullDescription, row.id], function(err) {
            if (err) {
                console.error("Update error:", err);
            } else {
                console.log("Updated successfully! Rows affected:", this.changes);
            }
            db.close();
        });
    });
});
