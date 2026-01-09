
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit to avoid 413 Payload Too Large

// Serve Static Frontend
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
}

// API: AI Generation
app.post('/api/ai/generate', async (req, res) => {
    try {
        const { model, contents, config } = req.body;

        // Security: Use Server-Side Key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY");
            return res.status(500).json({ error: "Server API Key Configuration Error" });
        }

        const ai = new GoogleGenAI({ apiKey });
        // Force specific model if needed, or trust client request (validated)
        // We enforce gemini-1.5-flash for cost/speed balance
        const targetModel = "gemini-1.5-flash";

        const result = await ai.models.generateContent({
            model: targetModel,
            contents,
            config
        });

        res.json(result);
    } catch (error) {
        console.error("AI Proxy Error:", error);
        res.status(500).json({
            error: error.message || "Internal Server Error",
            details: error.toString()
        });
    }
});

// Fallback for SPA (Single Page App)
app.get('*', (req, res) => {
    if (fs.existsSync(path.join(distPath, 'index.html'))) {
        res.sendFile(path.join(distPath, 'index.html'));
    } else {
        res.send("UniversalLoc AI Server Running. (Frontend not found in ../dist)");
    }
});

app.listen(PORT, () => {
    console.log(`
  🚀 UniversalLoc AI Server Running!
  ----------------------------------
  Local:   http://localhost:${PORT}
  Mode:    Production
  ----------------------------------
  `);
});
