const fs = require('fs');

// Load existing games
const games = JSON.parse(fs.readFileSync('games_export_utf8.json', 'utf8'));

// New games to add
const newGames = [
  {
    id: 'bubble-mush',
    title: '泡泡糖消消樂 (Bubble Mush)',
    description: '經典泡泡射擊消消樂遊戲',
    fullDescription: '射出彩色泡泡，三個相同顏色即可消除，挑戰高分！',
    thumbnailUrl: '/games/BubbleMush/icon.png',
    coverUrl: '/games/BubbleMush/icon.png',
    gameUrl: '/games/BubbleMush/',
    developer: 'GameZoe',
    price: 0,
    isFree: 1,
    category: '益智',
    rating: 4.2,
    releaseDate: '2024-01-01',
    displayOrder: 50
  },
  {
    id: 'golden-dig',
    title: '黃金礦工 (Golden Dig)',
    description: '經典挖礦遊戲，抓取黃金和寶石',
    fullDescription: '操控挖礦機抓取黃金、鑽石等寶物，達成目標金額過關！',
    thumbnailUrl: '/games/GoldenDig/icon-128.png',
    coverUrl: '/games/GoldenDig/icon-128.png',
    gameUrl: '/games/GoldenDig/',
    developer: 'GameZoe',
    price: 0,
    isFree: 1,
    category: '休閒',
    rating: 4.3,
    releaseDate: '2024-01-01',
    displayOrder: 51
  },
  {
    id: 'h5-planwar',
    title: '雷電戰機 (H5 Planwar)',
    description: 'HTML5 飛機射擊遊戲',
    fullDescription: '經典飛機射擊遊戲，消滅敵機，收集道具，挑戰 Boss！',
    thumbnailUrl: '/games/H5Planwar/1.png',
    coverUrl: '/games/H5Planwar/1.png',
    gameUrl: '/games/H5Planwar/',
    developer: 'GameZoe',
    price: 0,
    isFree: 1,
    category: '射擊',
    rating: 4.1,
    releaseDate: '2024-01-01',
    displayOrder: 52
  },
  {
    id: 'rose-bubble',
    title: '羅斯魔影消消樂 (Rose Bubble)',
    description: '泡泡龍風格消除遊戲',
    fullDescription: '發射泡泡，匹配顏色消除，解救被困的小精靈！',
    thumbnailUrl: '/games/Rosebubble/thumbnail.jpg',
    coverUrl: '/games/Rosebubble/thumbnail.jpg',
    gameUrl: '/games/Rosebubble/',
    developer: 'GameZoe',
    price: 0,
    isFree: 1,
    category: '益智',
    rating: 4.4,
    releaseDate: '2024-01-01',
    displayOrder: 53
  },
  {
    id: 'search-may',
    title: '尋找五月 (Search May)',
    description: '冒險解謎遊戲',
    fullDescription: '在神秘的世界中尋找線索，解開謎題，找到失蹤的五月！',
    thumbnailUrl: '/games/SearchMay/resource/thumbnail.jpg',
    coverUrl: '/games/SearchMay/resource/thumbnail.jpg',
    gameUrl: '/games/SearchMay/',
    developer: 'GameZoe',
    price: 0,
    isFree: 1,
    category: '益智',
    rating: 4.0,
    releaseDate: '2024-01-01',
    displayOrder: 54
  },
  {
    id: 'space-war',
    title: '太空大戰 (Space War)',
    description: '太空射擊遊戲',
    fullDescription: '駕駛太空戰機，消滅外星入侵者，保衛地球！',
    thumbnailUrl: '/games/SpaceWar/thumbnail.jpg',
    coverUrl: '/games/SpaceWar/thumbnail.jpg',
    gameUrl: '/games/SpaceWar/',
    developer: 'GameZoe',
    price: 0,
    isFree: 1,
    category: '射擊',
    rating: 4.2,
    releaseDate: '2024-01-01',
    displayOrder: 55
  }
];

// Add new games
newGames.forEach(game => {
  // Check if already exists
  const exists = games.find(g => g.id === game.id);
  if (!exists) {
    games.push(game);
    console.log('Added: ' + game.title);
  } else {
    console.log('Already exists: ' + game.title);
  }
});

// Save updated JSON
fs.writeFileSync('games_export_utf8.json', JSON.stringify(games, null, 2), 'utf8');
console.log('\nTotal games now: ' + games.length);
