
const fetch = require('node-fetch'); // Assuming node-fetch is available or using built-in fetch in newer node
// In recent Node versions, fetch is global. If not, we might need http module.
// Let's use standard http module to be safe as we don't know if node-fetch is installed.
const http = require('http');

const data = JSON.stringify({
    id: "fish-master",
    title: "捕魚大師 (Fish Master)",
    description: "經典街機捕魚，多人連線，爆金不停！",
    fullDescription: "體驗最真實的深海狩獵，多種砲台選擇，超高倍率BOSS等你來戰！",
    thumbnailUrl: "/games/fish-master/cover_v2.png",
    coverUrl: "/games/fish-master/cover_v2.png",
    gameUrl: "/games/fish/index.html",
    developer: "GameZoe Studio",
    price: 0,
    isFree: true,
    category: "Arcade",
    rating: 5,
    releaseDate: "2026-01-04"
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/games/fish-master',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        responseBody += chunk;
    });
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${responseBody}`);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    process.exit(1);
});

req.write(data);
req.end();
