const fs = require('fs');

// Complete game data with proper descriptions and categories
const gameData = {
  'slot-machine': {
    title: '經典拉霸機 (Slot Machine)',
    description: '拉斯維加斯風格經典老虎機，體驗刺激的拉霸樂趣！',
    fullDescription: '免費暢玩的經典老虎機遊戲，擁有精美圖像、流暢動畫和逼真音效。無需下載，直接在瀏覽器中享受拉霸的刺激感！',
    category: '博弈',
    thumbnailUrl: '/games/slot-machine/assets/images/symbols/seven.png'
  },
  'slot2': {
    title: 'HTML5 經典老虎機',
    description: '經典 3 卷軸老虎機，純粹的運氣與樂趣！',
    fullDescription: '體驗最原汁原味的老虎機樂趣。三卷軸設計，簡單易懂，無須下載即點即玩！',
    category: '博弈',
    thumbnailUrl: '/games/html5-slot-machine-main/dist/assets/slot-machine.png'
  },
  'viperpro': {
    title: 'ViperPro 娛樂城',
    description: '頂級賭場體驗，多款經典遊戲',
    fullDescription: '整合多款經典賭場遊戲的頂級娛樂平台，提供最優質的博弈體驗。',
    category: '博弈',
    thumbnailUrl: '/games/viperpro.png'
  },
  'fish-master': {
    title: '捕魚大師',
    description: '街機風格捕魚遊戲，射擊各種海洋生物贏取獎勵！',
    fullDescription: '經典街機捕魚遊戲，使用各種武器捕捉魚群，累積金幣換取豐厚獎勵！精美的海底場景，多樣化的魚種等你來挑戰！',
    category: '捕魚',
    thumbnailUrl: '/games/fish-master/cover_v2.png'
  },
  'fish-joy-h5': {
    title: '歡樂捕魚',
    description: '輕鬆有趣的 H5 捕魚遊戲',
    fullDescription: '簡單易上手的捕魚遊戲，適合所有年齡層。可愛的畫風，歡樂的音效，讓你隨時隨地享受捕魚樂趣！',
    category: '捕魚',
    thumbnailUrl: '/games/fish-joy/cover.png'
  },
  'my-fish-egret': {
    title: '我的捕魚',
    description: 'Egret 引擎打造的精緻捕魚遊戲',
    fullDescription: '使用 Egret 引擎開發的高品質捕魚遊戲，流暢的動畫效果，豐富的魚種，給你最棒的捕魚體驗！',
    category: '捕魚',
    thumbnailUrl: '/games/my-fish/resource/assets/fish/fish_1.png'
  },
  'universalloc-ai': {
    title: '全領域 AI 翻譯神器',
    description: '專業級多語言翻譯工具，支援遊戲本地化',
    fullDescription: '運用 AI 技術的專業翻譯工具，支援多種語言互譯，特別針對遊戲本地化優化，讓翻譯更精準、更專業！',
    category: '工具',
    thumbnailUrl: '/games/universalloc-ai---全領域專家級翻譯神器/cover.png'
  },
  'game_2048_1767276475967': {
    title: '經典 2048',
    description: '風靡全球的數字益智遊戲',
    fullDescription: '滑動方塊，合併相同數字，挑戰達到 2048！簡單的規則，無限的挑戰，考驗你的策略思維！',
    category: '益智',
    thumbnailUrl: '/games/2048/meta/apple-touch-icon.png'
  },
  'game_akimono_1767279320983': {
    title: '商人物語',
    description: '經營模擬遊戲，打造你的商業帝國',
    fullDescription: '扮演商人角色，買賣貨物，擴展商業版圖。策略經營，累積財富，成為最成功的商人！',
    category: '策略',
    thumbnailUrl: '/games/merchant/assets/images/merchant.png'
  },
  'game_alien': {
    title: '外星入侵',
    description: '經典太空射擊遊戲，抵禦外星人入侵',
    fullDescription: '外星人來襲！駕駛戰機保衛地球，消滅一波又一波的外星入侵者。經典街機風格，緊張刺激的射擊體驗！',
    category: '射擊',
    thumbnailUrl: '/games/AlienInvasion-master/images/player.png'
  },
  'game_circus': {
    title: '馬戲乘奇',
    description: '經典紅白機馬戲團遊戲重製版',
    fullDescription: '重溫經典！跳躍、翻滾、表演特技，在馬戲團舞台上展現你的技巧。懷舊畫風，挑戰高分！',
    category: '休閒',
    thumbnailUrl: '/games/circushtml5-master/assets/images/icon.png'
  },
  'game_clumsy_1767282935598': {
    title: '笨笨鳥',
    description: '點擊飛行，穿越障礙物',
    fullDescription: '控制小鳥穿越重重管道障礙，看似簡單實則需要精準的時機掌握。一款讓人欲罷不能的休閒遊戲！',
    category: '休閒',
    thumbnailUrl: '/games/clumsy-bird/assets/bird.png'
  },
  'game_diablo': {
    title: '暗黑破壞神 JS',
    description: 'JavaScript 版暗黑風格 RPG',
    fullDescription: '網頁版暗黑風格動作角色扮演遊戲，探索地下城，消滅怪物，收集裝備，提升角色實力！',
    category: '角色',
    thumbnailUrl: '/games/diablo-js-master/images/icon.png'
  },
  'game_duckhunt': {
    title: '打鴨子',
    description: '經典紅白機射擊遊戲',
    fullDescription: '重現經典任天堂打鴨子遊戲！瞄準飛過的鴨子，在時間內擊落指定數量。考驗你的反應速度和準確度！',
    category: '射擊',
    thumbnailUrl: '/games/DuckHunt-JS-master/images/icon.png'
  },
  'game_elemental_one': {
    title: '元素一號',
    description: '元素對戰策略遊戲',
    fullDescription: '運用火、水、風、土等元素的力量，進行策略對戰。掌握元素相剋，制定最佳戰術！',
    category: '策略',
    thumbnailUrl: '/games/elemental-one-master/assets/icon.png'
  },
  'game_lastcolony': {
    title: '最後殖民地',
    description: '即時戰略遊戲，建設與戰鬥',
    fullDescription: '在末日世界建立殖民地，採集資源，建造防禦，訓練軍隊，抵禦敵人的進攻！',
    category: '策略',
    thumbnailUrl: '/games/last-colony-master/images/icon.png'
  },
  'game_ludum_dare_28': {
    title: 'Ludum Dare 28',
    description: '遊戲開發大賽參賽作品',
    fullDescription: 'Ludum Dare 遊戲開發大賽的優秀作品，在有限時間內創作的創意遊戲，體驗獨立遊戲的魅力！',
    category: '休閒',
    thumbnailUrl: '/games/ludum-dare-28-master/assets/icon.png'
  },
  'game_ophog': {
    title: 'OpHog 塔防',
    description: '策略塔防遊戲，守護你的基地',
    fullDescription: '建造各種防禦塔，阻擋敵人的進攻。合理配置資源，升級塔樓，守護最後的防線！',
    category: '策略',
    thumbnailUrl: '/games/OpHog-master/assets/icon.png'
  },
  'game_pacman': {
    title: '小精靈',
    description: '經典吃豆人遊戲',
    fullDescription: '控制小精靈在迷宮中吃掉所有豆子，同時躲避幽靈的追擊。吃下能量豆可以反擊幽靈！永恆的經典！',
    category: '休閒',
    thumbnailUrl: '/games/pacman-canvas-master/assets/icon.png'
  },
  'game_plane_1767277340697': {
    title: '1943 中途島海戰',
    description: '二戰經典空戰遊戲',
    fullDescription: '重現二戰太平洋戰場！駕駛戰機執行轟炸任務，擊落敵機，摧毀敵艦。經典街機射擊遊戲！',
    category: '射擊',
    thumbnailUrl: '/games/plane/thumbnail.jpg'
  },
  'game_space_crusade': {
    title: '太空十字軍',
    description: '太空射擊冒險遊戲',
    fullDescription: '駕駛太空戰艦，在宇宙中執行任務，消滅敵人，探索未知星域。緊張刺激的太空冒險！',
    category: '射擊',
    thumbnailUrl: '/games/space-crusade-master/assets/icon.png'
  },
  'game_spaceinvaders': {
    title: '太空侵略者',
    description: '經典街機射擊遊戲',
    fullDescription: '史上最經典的射擊遊戲！外星人一排排逼近，你必須在被入侵前消滅它們。簡單卻令人上癮！',
    category: '射擊',
    thumbnailUrl: '/games/SpaceInvaders-master/assets/icon.png'
  },
  'game_tower': {
    title: '疊疊樂',
    description: '考驗手眼協調的堆疊遊戲',
    fullDescription: '將方塊精準堆疊，建造最高的塔樓。每一層都需要精確的時機，看看你能堆多高！',
    category: '休閒',
    thumbnailUrl: '/games/tower_game-master/assets/icon.png'
  },
  'game_1767308795813_0': {
    title: '3D 熊出沒',
    description: '3D 跑酷躲避遊戲',
    fullDescription: '控制角色在森林中奔跑，躲避障礙物，收集金幣。3D 畫面，緊張刺激的跑酷體驗！',
    category: '休閒',
    thumbnailUrl: '/games/3d-bear-run/assets/icon.png'
  },
  'game_1767308795814_1': {
    title: 'Canvas 戰機',
    description: 'HTML5 Canvas 飛機射擊',
    fullDescription: '使用 HTML5 Canvas 技術打造的飛機射擊遊戲，流暢的操作，豐富的關卡，挑戰你的射擊技巧！',
    category: '射擊',
    thumbnailUrl: '/games/canvasplane/assets/icon.png'
  },
  'game_1767308795814_2': {
    title: '中國象棋',
    description: '傳統中國象棋對弈',
    fullDescription: '經典中國象棋遊戲，可與電腦對弈或雙人對戰。車馬砲相士將，運籌帷幄，決勝千里！',
    category: '棋牌',
    thumbnailUrl: '/games/chess/assets/icon.png'
  },
  'game_1767308795814_3': {
    title: '驢子跳躍',
    description: '跳躍闖關遊戲',
    fullDescription: '控制驢子跳躍，越過障礙，收集道具。可愛的畫風，有趣的關卡設計！',
    category: '休閒',
    thumbnailUrl: '/games/donkeyjump/assets/icon.png'
  },
  'game_1767308795814_4': {
    title: 'Eat Kano',
    description: '吃豆類休閒遊戲',
    fullDescription: '控制角色吃掉畫面上的食物，躲避敵人。簡單有趣的休閒小遊戲！',
    category: '休閒',
    thumbnailUrl: '/games/EatKano-main/assets/icon.png'
  },
  'game_1767308795814_5': {
    title: '飛翔小鳥',
    description: '點擊飛行躲避遊戲',
    fullDescription: '點擊螢幕控制小鳥飛行，穿越障礙物。簡單的操作，無盡的挑戰！',
    category: '休閒',
    thumbnailUrl: '/games/flybird/assets/icon.png'
  },
  'game_1767308795814_6': {
    title: '水果忍者',
    description: '切水果休閒遊戲',
    fullDescription: '滑動螢幕切開飛來的水果，避開炸彈。考驗反應速度的經典休閒遊戲！',
    category: '休閒',
    thumbnailUrl: '/games/fruitninjia/assets/icon.png'
  },
  'game_1767308795814_7': {
    title: '五子棋',
    description: '經典五子連珠對弈',
    fullDescription: '黑白棋子交替落子，先連成五子者獲勝。簡單的規則，深奧的策略！',
    category: '棋牌',
    thumbnailUrl: '/games/gobang/assets/icon.png'
  },
  'game_1767308795814_8': {
    title: '魔塔',
    description: '經典 RPG 冒險遊戲',
    fullDescription: '勇者闯入魔塔，打敗怪物，收集鑰匙，拯救公主。需要合理規劃路線和戰鬥順序！',
    category: '角色',
    thumbnailUrl: '/games/magictower/assets/icon.png'
  },
  'game_1767308795814_9': {
    title: '飛機大戰',
    description: '縱向射擊遊戲',
    fullDescription: '駕駛戰機消滅敵人，收集道具增強火力。經典的飛機射擊玩法！',
    category: '射擊',
    thumbnailUrl: '/games/planebattle/assets/icon.png'
  },
  'game_1767308795814_10': {
    title: '兔子快跑',
    description: '跑酷躲避遊戲',
    fullDescription: '控制小兔子奔跑，躲避障礙，收集胡蘿蔔。可愛的畫風，緊張的節奏！',
    category: '休閒',
    thumbnailUrl: '/games/rabbitrun/assets/icon.png'
  },
  'game_1767308795814_11': {
    title: '蜘蛛接龍',
    description: '經典紙牌遊戲',
    fullDescription: '將所有紙牌按花色從 K 到 A 排列。考驗耐心和策略的經典接龍遊戲！',
    category: '棋牌',
    thumbnailUrl: '/games/spiderpoker/assets/icon.png'
  },
  'game_1767308795814_12': {
    title: 'Tap Kill',
    description: '點擊消滅遊戲',
    fullDescription: '快速點擊螢幕消滅出現的敵人，考驗你的反應速度！',
    category: '休閒',
    thumbnailUrl: '/games/tapkill/assets/icon.png'
  },
  'game_1767308795814_13': {
    title: '五子棋經典版',
    description: '傳統五子棋對弈',
    fullDescription: '經典五子棋遊戲，支援人機對戰和雙人對戰模式。',
    category: '棋牌',
    thumbnailUrl: '/games/gobang-classic/assets/icon.png'
  },
  'game_1767308795814_14': {
    title: '塔防射擊',
    description: '射擊結合塔防的策略遊戲',
    fullDescription: '建造防禦塔的同時操控角色射擊，雙重玩法帶來更豐富的策略體驗！',
    category: '策略',
    thumbnailUrl: '/games/tower-defense-shooter/assets/icon.png'
  },
  'game_1767308795814_15': {
    title: '天天飛車',
    description: '賽車競速遊戲',
    fullDescription: '駕駛賽車在公路上疾馳，躲避車輛，收集金幣。刺激的競速體驗！',
    category: '競速',
    thumbnailUrl: '/games/daily-racer/assets/icon.png'
  },
  'game_1767308795814_16': {
    title: '射擊遊戲',
    description: '經典射擊小遊戲',
    fullDescription: '瞄準目標射擊，考驗你的準確度和反應速度！',
    category: '射擊',
    thumbnailUrl: '/games/shooter/assets/icon.png'
  },
  'game_1767308795814_17': {
    title: '憤怒的小紅帽',
    description: '彈弓射擊遊戲',
    fullDescription: '控制小紅帽使用彈弓攻擊大野狼，類似憤怒鳥的趣味玩法！',
    category: '休閒',
    thumbnailUrl: '/games/angry-red-riding-hood/assets/icon.png'
  },
  'game_1767308795814_18': {
    title: '木乃伊歸來',
    description: '冒險闯關遊戲',
    fullDescription: '在古埃及金字塔中探險，躲避木乃伊的追擊，尋找寶藏出口！',
    category: '冒險',
    thumbnailUrl: '/games/mummy-returns/assets/icon.png'
  },
  'game_1767308795814_19': {
    title: '火柴人闯關',
    description: '動作闯關遊戲',
    fullDescription: '操控火柴人跳躍、戰鬥，通過重重關卡。簡約的畫風，豐富的動作！',
    category: '動作',
    thumbnailUrl: '/games/stickman-adventure/assets/icon.png'
  },
  'game_1767308795814_20': {
    title: '極速賽車',
    description: '3D 賽車競速',
    fullDescription: '體驗極速飆車的快感，超越對手，衝向終點！',
    category: '競速',
    thumbnailUrl: '/games/racing-1/assets/icon.png'
  },
  'game_1767308795814_21': {
    title: '極速賽車 II',
    description: '賽車競速續作',
    fullDescription: '更多賽道、更快速度、更刺激的賽車體驗！',
    category: '競速',
    thumbnailUrl: '/games/racing-2/assets/icon.png'
  },
  'game_1767308795814_22': {
    title: '踩雲彩跳高',
    description: '跳躍類休閒遊戲',
    fullDescription: '踩著雲彩不斷向上跳躍，看看你能跳多高！',
    category: '休閒',
    thumbnailUrl: '/games/cloud-jump/assets/icon.png'
  },
  'game_1767308795814_23': {
    title: '魔獸城堡',
    description: '塔防策略遊戲',
    fullDescription: '建造城堡防禦，抵禦魔獸大軍的進攻。策略佈局，守護家園！',
    category: '策略',
    thumbnailUrl: '/games/warcraft-castle/assets/icon.png'
  },
  'bubble-mush': {
    title: '泡泡糖消消樂',
    description: '經典泡泡射擊消除遊戲',
    fullDescription: '射出彩色泡泡，三個相同顏色即可消除。簡單有趣，挑戰高分！',
    category: '益智',
    thumbnailUrl: '/games/BubbleMush/icon.png'
  },
  'golden-dig': {
    title: '黃金礦工',
    description: '經典挖礦遊戲',
    fullDescription: '操控挖礦機抓取黃金、鑽石等寶物，達成目標金額過關！',
    category: '休閒',
    thumbnailUrl: '/games/GoldenDig/icon-128.png'
  },
  'h5-planwar': {
    title: '雷電戰機',
    description: 'HTML5 飛機射擊遊戲',
    fullDescription: '經典飛機射擊遊戲，消滅敵機，收集道具，挑戰 Boss！',
    category: '射擊',
    thumbnailUrl: '/games/H5Planwar/1.png'
  },
  'rose-bubble': {
    title: '羅斯魔影消消樂',
    description: '泡泡龍風格消除遊戲',
    fullDescription: '發射泡泡，匹配顏色消除，解救被困的小精靈！',
    category: '益智',
    thumbnailUrl: '/games/Rosebubble/thumbnail.jpg'
  },
  'search-may': {
    title: '尋找五月',
    description: '冒險解謎遊戲',
    fullDescription: '在神秘的世界中尋找線索，解開謎題，找到失蹤的五月！',
    category: '冒險',
    thumbnailUrl: '/games/SearchMay/resource/assets/bg1.png'
  },
  'space-war': {
    title: '太空大戰',
    description: '太空射擊遊戲',
    fullDescription: '駕駛太空戰機，消滅外星入侵者，保衛地球！',
    category: '射擊',
    thumbnailUrl: '/games/SpaceWar/thumbnail.jpg'
  },
  'huohua-qipai': {
    title: '火花棋牌',
    description: '多款經典棋牌遊戲平台',
    fullDescription: '綜合性棋牌遊戲平台，提供百家樂、牛牛、德州撲克、鬥地主、炸金花、捕魚等多種熱門遊戲。支援多人線上對戰！',
    category: '棋牌',
    thumbnailUrl: '/games/huohua/thumbnail.jpg'
  },
  'fish-api': {
    title: '捕魚 API',
    description: 'Egret 引擎捕魚遊戲',
    fullDescription: '基於 Egret 引擎開發的高品質捕魚遊戲，精美畫面，流暢體驗！',
    category: '捕魚',
    thumbnailUrl: '/games/fish-api-master/resource/assets/commonlanguage/fishGame/fish/30300101/fish1.png'
  },
  'fishing-game': {
    title: '釣魚遊戲',
    description: '休閒釣魚小遊戲',
    fullDescription: '輕鬆有趣的釣魚遊戲，體驗釣魚的樂趣！',
    category: '休閒',
    thumbnailUrl: '/games/fishing_game/icon.png'
  },
  'fish': {
    title: '捕魚達人',
    description: '經典捕魚街機遊戲',
    fullDescription: '最經典的捕魚遊戲，多種武器，豐富魚種，讓你欲罷不能！',
    category: '捕魚',
    thumbnailUrl: '/games/fish/resource/assets/fish.png'
  }
};

// Load existing games
const games = JSON.parse(fs.readFileSync('games_export_utf8.json', 'utf8'));

let updated = 0;
games.forEach(game => {
  const data = gameData[game.id];
  if (data) {
    game.title = data.title;
    game.description = data.description;
    game.fullDescription = data.fullDescription;
    game.category = data.category;
    game.thumbnailUrl = data.thumbnailUrl;
    game.coverUrl = data.thumbnailUrl;
    updated++;
    console.log('✓ Updated:', game.id, '-', data.title);
  } else {
    console.log('✗ No data for:', game.id);
  }
});

fs.writeFileSync('games_export_utf8.json', JSON.stringify(games, null, 2), 'utf8');
console.log('\n總計更新:', updated, '款遊戲');
