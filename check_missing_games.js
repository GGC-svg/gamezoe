const fs = require('fs');

// Get all folder names
const folders = fs.readdirSync('./games', { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

// Get games from JSON
const games = JSON.parse(fs.readFileSync('games_export_utf8.json', 'utf8'));

// Create a map of gameUrl folder names
const gameUrlFolders = games.map(g => {
  const match = g.gameUrl.match(/\/games\/([^\/]+)\//);
  return match ? match[1].toLowerCase() : null;
}).filter(Boolean);

// Also check by ID
const gameIds = games.map(g => g.id.toLowerCase());

console.log('遊戲資料夾總數: ' + folders.length);
console.log('JSON 遊戲數: ' + games.length);
console.log('');

// Find folders that might not be in the database
const skipFolders = ['egret-H5-qipai-game-main', 'plane', 'WangsHappy'];
const potentialMissing = [];

folders.forEach(folder => {
  if (skipFolders.includes(folder)) return;
  if (folder.includes('universalloc')) return; // Skip this special folder

  const folderLower = folder.toLowerCase();
  const inUrls = gameUrlFolders.some(url => url === folderLower || folderLower.includes(url) || url.includes(folderLower));
  const inIds = gameIds.some(id => id.includes(folderLower) || folderLower.includes(id.replace('game_', '').replace(/_\d+/g, '')));

  if (!inUrls && !inIds) {
    potentialMissing.push(folder);
  }
});

console.log('可能缺少的遊戲資料夾 (' + potentialMissing.length + '款):');
potentialMissing.forEach((f, i) => console.log((i+1) + '. ' + f));
