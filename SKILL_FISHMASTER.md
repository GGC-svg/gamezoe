# SKILL_FISHMASTER - 捕魚大師完整技術文檔

> 最後更新: 2026/01/18
>
> **重要**：此文檔記錄了 Go → Node.js 轉譯後的完整架構，避免日後重建。

---

## 概述

| 項目 | 內容 |
|------|------|
| 遊戲 ID | `fish-master` ⚠️ (games 表和 user_game_balances 必須一致) |
| 客戶端引擎 | Cocos Creator (Cocos2d-JS) |
| 伺服器語言 | **Node.js** (從 Go 轉譯) |
| 通訊協議 | Socket.io (WebSocket) |
| 資料庫 | SQLite (gamezoe.db) |
| 原始參考 | https://github.com/dwg255/fish (Go 版本) |

---

## 系統架構圖

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GameZoe 平台                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         Nginx (反向代理)                              │   │
│  │  Port 443 (HTTPS/WSS) → 轉發到後端服務                                │   │
│  └────────────────────────────────┬────────────────────────────────────┘   │
│                                   │                                         │
│  ┌────────────────────────────────▼────────────────────────────────────┐   │
│  │                    fish_mocker.js (Node.js)                          │   │
│  │                                                                      │   │
│  │   ┌──────────────┬──────────────┬──────────────┐                    │   │
│  │   │   Port 4000  │   Port 9000  │   Port 4002  │                    │   │
│  │   │  Account API │   Hall API   │  Game Socket │                    │   │
│  │   │  (未使用)    │  HTTP 登入   │   Socket.io  │                    │   │
│  │   └──────────────┴──────────────┴──────────────┘                    │   │
│  │                           │                                          │   │
│  │   ┌───────────────────────▼───────────────────────┐                 │   │
│  │   │              RoomManager.js                    │                 │   │
│  │   │  - 動態房間管理 (ID 從 1000 起)                │                 │   │
│  │   │  - 魚群生成計時器                              │                 │   │
│  │   │  - 玩家配對邏輯                                │                 │   │
│  │   └───────────────────────┬───────────────────────┘                 │   │
│  │                           │                                          │   │
│  │   ┌───────────────────────▼───────────────────────┐                 │   │
│  │   │              gamezoe.db (SQLite)               │                 │   │
│  │   │  - users 表: 玩家基本資訊                      │                 │   │
│  │   │  - user_game_balances 表: 遊戲點數餘額         │                 │   │
│  │   │  - wallet_transactions 表: 交易記錄            │                 │   │
│  │   └───────────────────────────────────────────────┘                 │   │
│  │                                                                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  PM2 託管: gamezoe-fish-serv                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              客戶端 (瀏覽器)                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Cocos Creator Client                              │   │
│  │                    /games/fish/index.html                            │   │
│  │                                                                      │   │
│  │  1. HTTP GET /guest?account=xxx&gameId=fish  →  Port 9000           │   │
│  │  2. HTTP GET /enter_public_room?baseParam=1  →  Port 9000           │   │
│  │  3. Socket.io 連線 wss://gamezoe.com/socket.io  →  Port 4002        │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 目錄結構

```
E:\Steam\gamezoe\
├── games/
│   ├── fish/                        # ✅ 客戶端 (正式使用)
│   │   ├── index.html              # 遊戲入口 (已整合平台登入)
│   │   ├── main.js                 # Cocos Creator 啟動器
│   │   ├── cocos2d-js-min.js       # Cocos2d 引擎
│   │   ├── res/                    # 遊戲資源 (圖片、音效)
│   │   └── src/                    # 編譯後的遊戲邏輯
│   │
│   └── fish-master/                 # 📁 舊 Go 原始碼 (參考用)
│       ├── account/                # [舊] Go 帳號服務
│       ├── hall/                   # [舊] Go 大廳服務
│       ├── game/                   # [舊] Go 遊戲服務
│       ├── common/
│       │   └── conf/
│       │       └── traces.json     # ⚠️ 魚軌跡配置 (仍在使用!)
│       └── client/                 # [舊] 原始客戶端
│
├── server/
│   ├── fish_mocker.js              # ✅ 主服務 (~2000 行)
│   ├── myfish_server.js            # ✅ my-fish-egret 服務
│   ├── gamezoe.db                  # SQLite 資料庫
│   └── utils/
│       └── RoomManager.js          # 房間管理模組
```

---

## 核心服務: fish_mocker.js

### 服務端口

| Port | 功能 | 協議 | 說明 |
|------|------|------|------|
| 4000 | Account API | HTTP | 原 Go account 服務 (目前未使用) |
| 9000 | Hall API | HTTP | 登入、進入房間、伺服器資訊 |
| 4002 | Game Socket | Socket.io | 遊戲邏輯、即時通訊 |

### 依賴套件

```json
{
  "express": "HTTP 服務",
  "socket.io": "WebSocket 通訊",
  "cors": "跨域設定",
  "sqlite3": "資料庫連接"
}
```

---

## HTTP 端點 (Port 9000)

| 端點 | 方法 | 參數 | 說明 |
|------|------|------|------|
| `/guest` | GET/POST | `account`, `gameId` | 訪客/用戶登入 |
| `/login` | GET/POST | `account`, `gameId` | 用戶登入 |
| `/get_serverinfo` | GET | - | 返回 `{ip: "gamezoe.com", port: 443}` |
| `/enter_public_room` | GET | `account`, `baseParam` | 配對房間，返回 roomId |
| `/get_user_status` | GET | - | 用戶狀態 |
| `/get_message` | GET | - | 系統訊息 |

### /enter_public_room 配對邏輯

```javascript
// baseParam 轉換為 baseScore
1    → 0.001  (新手場)
50   → 0.05   (初級場)
500  → 0.5    (高級場)
2000 → 2.0    (土豪場)

// 配對流程
1. 查找相同 baseScore 且人數 < 4 的房間
2. 找到 → 返回該房間 ID
3. 找不到 → 創建新房間 (ID 從 1000 起)
```

---

## Socket.io 事件 (Port 4002)

### 客戶端 → 伺服器

| 事件 | 參數 | 說明 |
|------|------|------|
| `login` | `{id, roomId, gameId}` | 登入房間 |
| `ready` | - | 客戶端準備完成 |
| `user_fire` | `{bulletId, bulletKind, ...}` | 發射子彈 |
| `catch_fish` | `{bulletId, fishId}` | 捕獲魚 |
| `laser_catch_fish` | `{fishes: "1-2-3"}` | 雷射炮捕獲 |
| `user_change_cannon` | `{cannonKind}` | 切換炮種 |
| `user_lock_fish` | `{fishId}` | 鎖定魚 |
| `user_frozen` | - | 使用冰凍道具 |
| `exit` | - | 離開房間 |
| `game_ping` | - | 心跳 |
| `charge` | `{amount}` | 轉入遊戲點數 |

### 伺服器 → 客戶端

| 事件 | 參數 | 說明 |
|------|------|------|
| `login_result` | `{errcode, data: {roomId, seats, conf}}` | 登入結果 |
| `login_finished` | `{errcode: 0}` | 登入完成 |
| `new_user_comes_push` | `{userId, seatIndex, score, ...}` | 新玩家加入/更新 |
| `game_sync_push` | `{state, seats, conf}` | 遊戲狀態同步 |
| `build_fish_reply` | `[{fishId, fishKind, trace, speed}]` | 魚群生成 |
| `user_fire_Reply` | `{userId, chairId, bulletId, ...}` | 其他玩家開炮 |
| `catch_fish_reply` | `{userId, fishId, addScore, score}` | 捕獲結果 |
| `lock_fish_reply` | `{userId, fishId}` | 鎖定結果 |
| `user_frozen_reply` | `{cutDownTime: 10000}` | 冰凍場景 |
| `exit_notify_push` | `userId` | 玩家離開 |
| `game_pong` | - | 心跳回應 |

---

## 房間管理 (RoomManager.js)

### 資料結構

```javascript
room = {
    roomId: 1000,           // 房間 ID
    baseScore: 0.001,       // 基礎分數
    aliveFish: {},          // {fishId: fishObject}
    aliveBullets: {},       // {bulletId: bulletObject}
    users: {},              // {userId: userObject}
    frozenEndTime: null,    // 冰凍結束時間
    createdAt: Date.now()
}

user = {
    userId: "xxx",
    name: "Hunter_xxx",
    seatIndex: 0,           // 座位 (0-3)
    score: 50000,           // 遊戲點數 (整數，需 /1000 顯示)
    gold: 100000,           // 平台幣 (整數)
    cannonKind: 1,          // 當前炮種
    power: 0,               // 能量條 (0-1)
    vip: 0,                 // VIP 等級
    lastLaserTime: 0        // 上次雷射時間
}
```

### 魚群生成計時器

```javascript
// 每個房間獨立的計時器
Timer 1: 每 2 秒    - 小魚 (fishKind 1-15)
Timer 2: 每 10.1 秒 - 中魚 (fishKind 16-20)
Timer 3: 每 30.2 秒 - 大魚 (fishKind 21-34)
Timer 4: 每 61 秒   - BOSS (fishKind 35)

// 清理計時器
每 10 秒清理超過 120 秒的過期魚
```

### 房間生命週期

```
1. 玩家請求 /enter_public_room
2. RoomManager.findOrCreateRoom(baseScore)
   - 找到現有房間 (人數 < 4) → 返回
   - 創建新房間 → 啟動生成計時器
3. 玩家 Socket 連線 → login 事件
4. 玩家離開 → exit 事件
5. 房間空置 → 60 秒後自動刪除
```

---

## 遊戲邏輯

### 精度系統 (防止浮點誤差)

```javascript
const BALANCE_SCALE = 1000;

// 顯示值 → 存儲值 (整數運算)
function toStorageInt(value) {
    return Math.round(Number(value) * BALANCE_SCALE);
}

// 存儲值 → 顯示值
function toDisplayFloat(intValue) {
    return Math.floor(Number(intValue)) / BALANCE_SCALE;
}

// 範例
// 玩家有 50.5 元 → 內存存 50500
// 開炮花 0.001 元 → 扣 1 (整數)
// 捕魚獲得 0.01 元 → 加 10 (整數)
```

### 魚種倍率 (FishMulti)

```javascript
const FishMulti = {
    // 小魚 (1-10)
    1: 2, 2: 2, 3: 3, 4: 4, 5: 5, 6: 5, 7: 6, 8: 7, 9: 8, 10: 9,
    // 中魚 (11-22)
    11: 10, 12: 11, 13: 12, 14: 18, 15: 25, 16: 30, 17: 35, 18: 40,
    19: 45, 20: 50, 21: 80, 22: 100,
    // 一網打盡 (23-26)
    23: 45, 24: 45, 25: 45, 26: 45,
    // 特殊魚 (27-35)
    27: 50, 28: 60, 29: 70,
    30: 100,        // 全屏炸彈
    31: 110, 32: 110, 33: 110,  // 同類炸彈
    34: 120, 35: 200  // BOSS
};
```

### 子彈倍率 (BulletMulti)

```javascript
const BulletMulti = {
    1: 1, 2: 2, 3: 3, 4: 1, 5: 3, 6: 5,
    7: 1, 8: 3, 9: 5, 10: 1, 11: 3, 12: 5,
    13: 1, 14: 3, 15: 5, 16: 1, 17: 3, 18: 5,
    19: 1, 20: 3, 21: 5, 22: 1  // 22 = 雷射炮
};
```

### 開炮成本計算

```javascript
// 成本 = 房間基礎分 × 子彈倍率
const cost = room.baseScore * BulletMulti[bulletKind];

// 範例 (新手場 baseScore=0.001)
// bulletKind=1 (倍率1): cost = 0.001 × 1 = 0.001
// bulletKind=3 (倍率3): cost = 0.001 × 3 = 0.003
```

### 捕獲機率與獎勵

```javascript
// 捕獲機率 = 1 / 魚倍率
const captureRate = 1.0 / FishMulti[fishKind];

// 範例
// fishKind=1 (倍率2): 50% 機率
// fishKind=35 (倍率200): 0.5% 機率

// 獎勵 = 子彈成本 × 魚倍率
const reward = bulletCost * FishMulti[fishKind];

// 範例 (子彈成本=0.01, fishKind=10 倍率9)
// reward = 0.01 × 9 = 0.09
```

### 特殊魚效果

| fishKind | 名稱 | 效果 |
|----------|------|------|
| 23-26 | 一網打盡 | 捕獲所有同類型 (23-26) 的魚 |
| 30 | 全屏炸彈 | 炸死最多 20 條小魚 (kind < 11) |
| 31-33 | 同類炸彈 | 炸死特定種類魚 |

### 雷射炮

```javascript
// 條件: power >= 1.0
// 冷卻: 30 秒
// 使用後: power = 0, lastLaserTime = now

// 能量累積
const addPower = bulletMulti / 3000;
user.power += addPower;  // 每次開炮累積
```

---

## 廣播機制

### 房間內廣播

```javascript
// 發送給房間內所有人 (包括自己)
io.in('room_' + roomId).emit('event', data);

// 發送給房間內其他人 (不包括自己)
socket.broadcast.to('room_' + roomId).emit('event', data);
```

### 跨端口廣播 (用於轉帳通知)

```javascript
// 遍歷所有 Socket.io 實例
ioInstances.forEach(ioInst => {
    ioInst.sockets.sockets.forEach((s) => {
        if (s.userId === targetUserId) {
            s.emit('new_user_comes_push', { score: newScore });
        }
    });
});
```

---

## 平台整合

### 客戶端注入 (index.html)

```javascript
// 1. 從 URL 讀取平台用戶 ID
const urlParams = new URLSearchParams(window.location.search);
let platformUserId = urlParams.get('userId');
let platformGameId = urlParams.get('gameId') || 'fish';

// 2. 攔截 XHR 注入帳號
XMLHttpRequest.prototype.open = function(method, url, ...) {
    if (url.includes('/guest') || url.includes('/login')) {
        url += '&account=' + encodeURIComponent(platformUserId);
        url += '&gameId=' + encodeURIComponent(platformGameId);
    }
};

// 3. Socket.io 補丁
window.io = function(url, opts) {
    opts.query = opts.query || {};
    opts.query.gameId = window.__PLATFORM_GAME_ID__;
    opts.query.userId = window.__PLATFORM_USER_ID__;
    return originalIo(url, opts);
};
```

### 遊戲餘額表

```sql
-- user_game_balances 表
CREATE TABLE user_game_balances (
    user_id TEXT NOT NULL,
    game_id TEXT NOT NULL,      -- 'fish' 或其他遊戲
    balance REAL DEFAULT 0,     -- 顯示值 (如 50.5)
    created_at TEXT,
    updated_at TEXT,
    PRIMARY KEY (user_id, game_id)
);
```

### 餘額同步流程

```
1. 登入時: 從 user_game_balances 讀取餘額
2. 遊戲中: 內存操作 (整數運算)
3. 離開時: saveUserToDB() 寫回資料庫
4. 轉帳時:
   - Deposit API: 平台扣 G幣 → 遊戲加點數
   - Withdraw API: 遊戲扣點數 → 平台加 G幣
```

### 即時餘額同步 (2026/01/17 新增)

**問題**: 遊戲進行中時，平台查詢的餘額是 DB 存儲值 (舊)，而非房間記憶體中的即時值。

**解決方案**: 平台查詢餘額時，先詢問遊戲伺服器記憶體。

#### 新增 API: `/api/room/balance` (fish_mocker.js)

```javascript
// GET /api/room/balance?userId=xxx&gameId=fish
// 返回:
// - 用戶在房間內: { success: true, source: 'memory', balance: 50.5, inRoom: true, roomId: 1000 }
// - 用戶不在房間: { success: true, source: 'database', balance: 50.5, inRoom: false }
```

#### 修改 API: `/api/game-balance/:userId/:gameId` (index.js)

```javascript
// 優先查詢遊戲伺服器記憶體
const REALTIME_GAMES = {
    'fish': 'http://127.0.0.1:9000',
    'fish-master': 'http://127.0.0.1:9000'
};

// 流程:
// 1. 檢查 gameId 是否在 REALTIME_GAMES 列表
// 2. 是 → 先向遊戲伺服器查詢房間內餘額
// 3. 查詢成功 → 返回記憶體餘額 (source: 'memory')
// 4. 查詢失敗或逾時 → 回退到 DB 查詢
```

#### 三種餘額類型對照

| 餘額類型 | 存儲位置 | 更新時機 | 查詢 API |
|----------|----------|----------|----------|
| 房間餘額 | RoomManager 記憶體 | 即時 (開炮、捕魚) | `/api/room/balance` |
| 遊戲 DB 餘額 | user_game_balances 表 | 離開房間時 | `/api/game-balance` |
| 平台錢包餘額 | users 表 (gold) | 轉帳時 | `/api/user/:id` |

#### 資料流程圖

```
┌─────────────────────────────────────────────────────────────────────┐
│  平台前端 (Lobby)                                                    │
│                                                                     │
│  調用 /api/game-balance/user123/fish                                │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  平台伺服器 (index.js)                                               │
│                                                                     │
│  1. 檢查 gameId='fish' 在 REALTIME_GAMES?  ✅ 是                    │
│  2. 向 http://127.0.0.1:9000/api/room/balance?userId=user123 查詢   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  捕魚伺服器 (fish_mocker.js)                                         │
│                                                                     │
│  1. 遍歷 roomManager.rooms                                          │
│  2. 找到用戶在 room_1000, score=50500 (整數)                        │
│  3. 返回 { source: 'memory', balance: 50.5, inRoom: true }          │
│                                                                     │
│  若用戶不在任何房間:                                                  │
│  → 從 DB 讀取並返回 { source: 'database', balance: 50.5 }           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Nginx 配置

```nginx
# Socket.io 代理 (WSS → WS)
location /socket.io {
    proxy_pass http://127.0.0.1:4002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 86400;
}

# Hall API 代理
location ~ ^/(guest|login|get_serverinfo|enter_public_room) {
    proxy_pass http://127.0.0.1:9000;
    add_header Access-Control-Allow-Origin *;
}

# 遊戲靜態檔案
location /games/fish/ {
    alias /home/dalehuang/gamezoe/games/fish/;
    expires 7d;
}
```

---

## PM2 服務管理

### 服務對照表

| PM2 ID | PM2 名稱 | 腳本 | Port | 說明 |
|--------|----------|------|------|------|
| 0 | gamezoe-fish-serv | fish_mocker.js | 4000, 9000, 4002 | 捕魚大師主服務 |
| 1 | gamezoe-fish-game | myfish_server.js | 9001 | my-fish-egret 服務 |
| 2 | gamezoe-web | index.js | 3000 | 平台主服務 |
| 3 | h5-game-server | (Java) | 8080 | 棋牌 H5 遊戲 |

### 查看狀態

```bash
pm2 list
pm2 logs gamezoe-fish-serv
pm2 logs gamezoe-fish-serv --err

# 或用 ID 查看
pm2 logs 0             # fish_mocker.js
pm2 show 0 | grep script  # 確認腳本路徑
```

### 重啟服務

```bash
pm2 restart gamezoe-fish-serv
```

### 啟動指令 (如需手動)

```bash
cd ~/gamezoe/server
node fish_mocker.js
```

---

## 故障排除

### 快速診斷清單

遇到餘額問題時，按順序檢查：

```bash
# 1. 確認服務運行
pm2 list

# 2. 檢查資料庫權限
ls -la ~/gamezoe/server/gamezoe.db
# 應為 -rw-rw-rw- (666)

# 3. 檢查 game_id 是否一致
sqlite3 ~/gamezoe/server/gamezoe.db "SELECT id FROM games WHERE id LIKE '%fish%';"
# 應返回: fish-master

sqlite3 ~/gamezoe/server/gamezoe.db "SELECT DISTINCT game_id FROM user_game_balances WHERE game_id LIKE '%fish%';"
# 應返回: fish-master (必須與上面一致!)

# 4. 測試遊戲伺服器 API
curl "http://127.0.0.1:9000/api/room/balance?userId=TEST&gameId=fish-master"

# 5. 檢查錯誤日誌
pm2 logs 0 --err --lines 20 --nostream
```

---

### 1. WebSocket 連接失敗

**症狀**: 客戶端卡在登入，無法進入遊戲

**檢查**:
```bash
# 確認服務運行
pm2 list | grep fish

# 檢查 4002 端口
netstat -tlnp | grep 4002

# 檢查 Nginx 代理
sudo nginx -t
curl -I https://gamezoe.com/socket.io/
```

### 2. 魚不生成

**症狀**: 進入遊戲後沒有魚

**檢查**:
```bash
# 確認 traces.json 存在
ls -la ~/gamezoe/games/fish-master/common/conf/traces.json

# 查看日誌是否有 SPAWN 記錄
pm2 logs gamezoe-fish-serv | grep SPAWN
```

**解決**: 確保 `traces.json` 路徑正確

### 3. 餘額不更新

**症狀**: 捕魚後分數不變

**檢查**:
```bash
# 查看 CATCH 日誌
pm2 logs gamezoe-fish-serv | grep CATCH

# 檢查資料庫
sqlite3 ~/gamezoe/server/gamezoe.db "SELECT * FROM user_game_balances WHERE game_id='fish';"
```

### 4. 雷射炮不能用

**症狀**: 能量滿了但無法發射雷射

**原因**: power < 1.0 或冷卻中 (30秒)

**檢查日誌**:
```bash
pm2 logs gamezoe-fish-serv | grep LASER
```

### 5. 多人不同步

**症狀**: 玩家看到的魚不一致

**原因**: 新玩家加入時未收到現有魚

**已修復**: login 時發送 `existingFishList` (見 fish_mocker.js:1016-1027)

### 6. 平台遊戲點數顯示 0 (2026/01/18 修復)

**症狀**:
- 平台介面遊戲點數顯示 0
- 遊戲大廳顯示 0.000
- 無法進入魚場 (餘額不足)

**原因**: `games` 表中遊戲 ID 是 `fish-master`，但 `user_game_balances` 表中的記錄用的是 `fish`

**診斷步驟**:
```bash
# 1. 檢查 games 表中的遊戲 ID
sqlite3 ~/gamezoe/server/gamezoe.db "SELECT id, title FROM games WHERE title LIKE '%魚%';"
# 結果: fish-master|捕魚大師 (Fish Master)

# 2. 檢查 user_game_balances 的 game_id
sqlite3 ~/gamezoe/server/gamezoe.db "SELECT * FROM user_game_balances WHERE user_id = 'xxx';"
# 結果: game_id = 'fish' (錯誤!)

# 3. 測試 API
curl "http://localhost:3000/api/game-balance/xxx/fish-master"
# 返回 balance: 0 (因為沒有 fish-master 記錄)
```

**修復**:
```bash
# 將所有 'fish' 改為 'fish-master'
sqlite3 ~/gamezoe/server/gamezoe.db "UPDATE user_game_balances SET game_id = 'fish-master' WHERE game_id = 'fish';"

# 重啟服務
pm2 restart all
```

**預防**: 確保新用戶註冊時建立的 game_id 與 games 表一致

### 7. SQLITE_READONLY 資料庫錯誤 (2026/01/18 修復)

**症狀**:
- PM2 日誌顯示 `SQLITE_READONLY: attempt to write a readonly database`
- 遊戲餘額無法存檔
- 離開遊戲後餘額重置

**原因**: 資料庫檔案權限不足，Node.js 進程無法寫入

**診斷**:
```bash
# 檢查 PM2 日誌
pm2 logs gamezoe-fish-serv --lines 50 --nostream | grep READONLY

# 檢查檔案權限
ls -la ~/gamezoe/server/gamezoe.db
# 如果顯示 -rw-r--r-- (644)，其他用戶無寫入權限
```

**修復**:
```bash
# 修改權限為 666 (所有人可讀寫)
chmod 666 ~/gamezoe/server/gamezoe.db

# 驗證
ls -la ~/gamezoe/server/gamezoe.db
# 應顯示 -rw-rw-rw-

# 重啟服務
pm2 restart all
```

**預防**:
- Git pull 後檢查檔案權限
- 可在部署腳本中加入 `chmod 666 ~/gamezoe/server/gamezoe.db`

### 8. 餘額查詢返回 0 但資料庫有值

**症狀**:
- 資料庫確認有餘額記錄
- API 查詢返回 balance: 0

**原因**: 平台 API 會先向遊戲伺服器 (fish_mocker.js) 查詢，遊戲伺服器再查 DB

**診斷**:
```bash
# 1. 直接查詢遊戲伺服器
curl "http://127.0.0.1:9000/api/room/balance?userId=xxx&gameId=fish-master"

# 2. 如果返回 0，檢查遊戲伺服器日誌
pm2 logs 0 --lines 20 --nostream

# 3. 常見原因:
# - SQLITE_READONLY (見問題 7)
# - game_id 不匹配 (見問題 6)
# - 遊戲伺服器未重啟 (緩存舊資料)
```

**修復**: 根據日誌判斷是權限問題還是 game_id 問題，然後重啟服務

---

## 關鍵檔案清單

| 檔案 | 說明 | 行數 |
|------|------|------|
| `server/fish_mocker.js` | 主服務 | ~2000 |
| `server/utils/RoomManager.js` | 房間管理 | ~290 |
| `server/utils/signature.js` | 簽名工具 | ~50 |
| `games/fish/index.html` | 客戶端入口 | ~200 |
| `games/fish-master/common/conf/traces.json` | 魚軌跡配置 | ~10000 |

---

## 開發注意事項

### 1. 精度問題

**必須使用整數運算**，避免 JavaScript 浮點誤差：
```javascript
// ❌ 錯誤
user.score -= 0.001;  // 可能變成 0.0009999...

// ✅ 正確
user.score = safeSub(user.score, toStorageInt(0.001));
```

### 2. 房間隔離

**必須使用房間前綴廣播**：
```javascript
// ❌ 錯誤 - 廣播到所有連線
io.emit('build_fish_reply', fishList);

// ✅ 正確 - 只廣播到特定房間
io.in('room_' + roomId).emit('build_fish_reply', fishList);
```

### 3. 座位索引

**伺服器使用 0-indexed，客戶端使用 1-indexed**：
```javascript
// 伺服器
seatIndex = 0, 1, 2, 3

// 發送給客戶端時
chairId = seatIndex + 1  // 1, 2, 3, 4
```

### 4. gameId 隔離

**餘額按 gameId 分開存儲**：
```javascript
// 登入時讀取特定遊戲餘額
LEFT JOIN user_game_balances g ON u.id = g.user_id AND g.game_id = ?

// 儲存時指定 gameId
saveUserToDB(userId, score, socket.gameId);
```

---

## 備份提醒

修改前務必備份：

```bash
# 本機
cp server/fish_mocker.js server/fish_mocker.js.bak
cp server/utils/RoomManager.js server/utils/RoomManager.js.bak

# Server
cp ~/gamezoe/server/fish_mocker.js ~/gamezoe/server/fish_mocker.js.bak
```

---

## Server 備份 (2026/01/17)

**重要**：下列路徑包含從 Server 下載的「正式運行中」檔案，是最可靠的版本。

### 備份位置

```
E:\Steam\gamezoe\server_backup\
├── server/                      # Server 端 ~/gamezoe/server/ 完整備份
│   ├── fish_mocker.js          # ✅ 正式運行版本 (96,583 bytes)
│   ├── myfish_server.js        # ✅ my-fish-egret 服務
│   ├── index.js                # 平台主服務
│   ├── gamezoe.db              # ⚠️ 正式資料庫 (含用戶資料)
│   ├── .env                    # ⚠️ 正式環境金鑰
│   ├── routes/                 # API 路由
│   └── utils/                  # 工具模組
├── games/                       # Server 端遊戲檔案
└── nginx/                       # Server 端 Nginx 配置
```

### 如何使用

如果本機檔案出問題，可從備份還原：

```powershell
# 還原 fish_mocker.js
cp E:\Steam\gamezoe\server_backup\server\fish_mocker.js E:\Steam\gamezoe\server\fish_mocker.js

# 還原 RoomManager.js
cp E:\Steam\gamezoe\server_backup\server\utils\RoomManager.js E:\Steam\gamezoe\server\utils\RoomManager.js
```

### 下載時間

```
2026/01/17 22:55 (Taiwan Time)
```

### 重新下載指令

如需再次從 Server 下載最新版本：

```powershell
# 1. Server 端壓縮 (GCP SSH 瀏覽器)
cd ~/gamezoe && tar -czvf /tmp/server_backup.tar.gz server/ && chmod 644 /tmp/server_backup.tar.gz

# 2. 本機下載 (PowerShell)
gcloud compute scp gamezoe-server:/tmp/server_backup.tar.gz E:\Steam\gamezoe\server_backup.tar.gz --zone=asia-east1-c

# 3. 本機解壓
cd E:\Steam\gamezoe\server_backup; tar -xzvf ..\server_backup.tar.gz

# 4. Server 清理
rm /tmp/server_backup.tar.gz
```

---

## 相關文檔

| 文檔 | 說明 |
|------|------|
| [CLAUDE.md](./CLAUDE.md) | 專案開發指南 |
| [SKILL_GAME_UPLOAD.md](./SKILL_GAME_UPLOAD.md) | 遊戲上架流程 |
| [SKILL_GAME_BALANCE_SYNC.md](./SKILL_GAME_BALANCE_SYNC.md) | 遊戲點數機制 |
