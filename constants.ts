import { Game, GameCategory } from './types';

// Using some generic placeholders or open web game demos for URLs
export const MOCK_GAMES: Game[] = [
  {
    id: '1',
    title: '賽博車手 (Cyber Drifter)',
    description: '霓虹都市中的極速狂飆體驗。',
    fullDescription: '在《賽博車手》中體驗未來賽車的快感。使用先進科技改裝您的懸浮車，在隨機生成的霓虹賽道上甩尾，並挑戰銀河系最強賽車手的幽靈數據。',
    category: GameCategory.ACTION,
    thumbnailUrl: 'https://picsum.photos/id/16/300/400',
    coverUrl: 'https://picsum.photos/id/16/800/400',
    gameUrl: 'https://www.google.com/logos/2010/pacman10-i.html', // Pacman Demo
    price: 0,
    isFree: true,
    developer: 'Neon Soft',
    releaseDate: '2023-11-15'
  },
  {
    id: '2',
    title: '秘境森林 RPG',
    description: '穿越魔法大陸的史詩旅程。',
    fullDescription: '在《秘境森林 RPG》中展開宏大的冒險。與遠古生物戰鬥，解開古神的謎題，並揭開困擾精靈王國的秘密。結合回合制戰鬥與深度敘事。',
    category: GameCategory.RPG,
    thumbnailUrl: 'https://picsum.photos/id/28/300/400',
    coverUrl: 'https://picsum.photos/id/28/800/400',
    gameUrl: 'https://example.com/play/forest-rpg',
    price: 4.99,
    isFree: false,
    developer: 'QuestLabs',
    releaseDate: '2024-01-20'
  },
  {
    id: '3',
    title: '星際大亨',
    description: '在深太空中貿易、戰鬥與生存。',
    fullDescription: '從一艘不起眼的穿梭機開始，建立銀河商業帝國。駕馭動態經濟系統，擊退太空海盜，並升級您的艦隊以統治星海。',
    category: GameCategory.STRATEGY,
    thumbnailUrl: 'https://picsum.photos/id/48/300/400',
    coverUrl: 'https://picsum.photos/id/48/800/400',
    gameUrl: 'https://example.com/play/star-tycoon',
    price: 0,
    isFree: true,
    developer: 'Star Systems Inc.',
    releaseDate: '2023-08-05'
  },
  {
    id: '4',
    title: '古老方塊 (Ancient Blocks)',
    description: '放鬆身心卻又充滿挑戰的解謎體驗。',
    fullDescription: '在這款充滿禪意的解謎遊戲中配對古老符文。擁有超過 500 個關卡和舒緩的氛圍音樂，《古老方塊》是忙碌一天後放鬆的最佳選擇。',
    category: GameCategory.PUZZLE,
    thumbnailUrl: 'https://picsum.photos/id/56/300/400',
    coverUrl: 'https://picsum.photos/id/56/800/400',
    gameUrl: 'https://example.com/play/ancient-blocks',
    price: 1.99,
    isFree: false,
    developer: 'Zen Games',
    releaseDate: '2023-12-12'
  },
  {
    id: '5',
    title: '地牢探險家 X',
    description: '硬核 Roguelike 動作遊戲。',
    fullDescription: '深入深淵。死亡是永久的，但你的遺產將長存。《地牢探險家 X》為真正的硬核玩家提供殘酷的難度、隨機生成的關卡和無限的重玩性。',
    category: GameCategory.ACTION,
    thumbnailUrl: 'https://picsum.photos/id/64/300/400',
    coverUrl: 'https://picsum.photos/id/64/800/400',
    gameUrl: 'https://example.com/play/dungeon-x',
    price: 9.99,
    isFree: false,
    developer: 'Hardcore Studios',
    releaseDate: '2024-02-01'
  },
  {
    id: '6',
    title: '快樂農場模擬器',
    description: '打造您夢想中的農場。',
    fullDescription: '逃離城市，呼吸新鮮鄉村空氣。在這款迷人的開放式農場模擬遊戲中種植作物、飼養動物，並與當地村民成為朋友。',
    category: GameCategory.CASUAL,
    thumbnailUrl: 'https://picsum.photos/id/76/300/400',
    coverUrl: 'https://picsum.photos/id/76/800/400',
    gameUrl: 'https://example.com/play/happy-farm',
    price: 0,
    isFree: true,
    developer: 'Green Thumb',
    releaseDate: '2023-05-30'
  },
   {
    id: '7',
    title: '暗影忍者',
    description: '潛在陰影，疾如風。',
    fullDescription: '掌握暗影之道。潛入戒備森嚴的堡壘，刺殺目標，然後消失得無影無蹤。一款節奏明快、操作手感極佳的平台動作遊戲。',
    category: GameCategory.ACTION,
    thumbnailUrl: 'https://picsum.photos/id/96/300/400',
    coverUrl: 'https://picsum.photos/id/96/800/400',
    gameUrl: 'https://example.com/play/shadow-ninja',
    price: 2.99,
    isFree: false,
    developer: 'Night Blade',
    releaseDate: '2023-10-10'
  },
  {
    id: '8',
    title: '深海探險家',
    description: '探索深藍海洋的秘密。',
    fullDescription: '潛入充滿奇蹟與恐懼的外星海洋。編目海洋生物，建立水下基地，並在深海的高壓環境中生存。',
    category: GameCategory.STRATEGY,
    thumbnailUrl: 'https://picsum.photos/id/112/300/400',
    coverUrl: 'https://picsum.photos/id/112/800/400',
    gameUrl: 'https://example.com/play/deep-sea',
    price: 0,
    isFree: true,
    developer: 'Blue World',
    releaseDate: '2023-09-15'
  }
];

export const APP_NAME = "GameZoe";
export const SUPPORT_EMAIL = "support@gamezoe.com";