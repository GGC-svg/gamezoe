# 遊戲上架流程 (GameZoe Platform)

## 概述

本文檔說明如何將新遊戲上架到 GameZoe 平台 (gamezoe.com)。

---

## 平台架構

| 項目 | 說明 |
|------|------|
| 本機開發路徑 | `E:\Steam\gamezoe` |
| Server 路徑 | `~/gamezoe` |
| 資料庫 | `server/gamezoe.db` (SQLite) |
| 遊戲資料夾 | `games/` |
| Nginx 設定 | `/etc/nginx/sites-enabled/gamezoe` |

---

## 遊戲類型

### 1. 靜態 HTML5 遊戲
直接放在 `games/` 資料夾，透過靜態檔案服務。

### 2. 後端服務遊戲 (如火花棋牌)
需要 Nginx 反向代理到特定 port。

---

## 上架步驟

### 步驟 1：準備遊戲資料夾

```bash
# 本機端建立資料夾
mkdir -p E:/steam/gamezoe/games/遊戲名稱
```

### 步驟 2：準備縮圖

從遊戲資源中找圖片，或使用預設圖：

```bash
# 複製縮圖到遊戲資料夾
cp "來源圖片路徑" "E:/steam/gamezoe/games/遊戲名稱/thumbnail.jpg"
```

**圖片建議**：
- 格式：JPG 或 PNG
- 建議尺寸：300x200 或類似比例
- 檔名：`thumbnail.jpg` 或 `thumbnail.png`

### 步驟 3：加入資料庫

建立腳本 `add_遊戲名稱_game.js`：

```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/gamezoe.db');

const game = {
  id: 'game-id',           // 唯一 ID，用於 URL
  title: '遊戲名稱',
  description: '簡短描述',
  fullDescription: '完整描述',
  thumbnailUrl: '/games/遊戲資料夾/thumbnail.jpg',
  gameUrl: '/games/遊戲資料夾/',  // 或 '/proxy-path/' 如果是後端服務
  developer: '開發商',
  price: 0,
  isFree: 1,               // 1=免費, 0=付費
  category: '分類'          // 棋牌、休閒、射擊、益智等
};

db.run(`
  INSERT OR REPLACE INTO games (id, title, description, fullDescription, thumbnailUrl, gameUrl, developer, price, isFree, category)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`, [
  game.id, game.title, game.description, game.fullDescription,
  game.thumbnailUrl, game.gameUrl, game.developer, game.price, game.isFree, game.category
], function(err) {
  if (err) console.error('Error:', err.message);
  else console.log('Game added:', game.title);
  db.close();
});
```

執行腳本：
```bash
cd E:/steam/gamezoe && node add_遊戲名稱_game.js
```

### 步驟 4：推送到 Git

```bash
cd E:/steam/gamezoe
git add games/遊戲資料夾/ server/gamezoe.db
git commit -m "Add: 遊戲名稱"
git push origin master
```

### 步驟 5：Server 端更新

SSH 到 Server 執行：

```bash
cd ~/gamezoe && git fetch origin && git reset --hard origin/master && pm2 restart all
```

---

## 後端服務遊戲 (需要反向代理)

如果遊戲是獨立後端服務（如 Spring Boot、Node.js），需要額外設定 Nginx。

### 1. 啟動後端服務

```bash
# 例如 Java 應用
nohup java -jar ~/遊戲-app.jar > ~/遊戲.log 2>&1 &
```

### 2. 設定 Nginx 反向代理

編輯 `/etc/nginx/sites-enabled/gamezoe`，在第一個 `server` block 的 `location / {` 前加入：

```nginx
    location /遊戲路徑/ {
        proxy_pass http://localhost:PORT/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
```

### 3. 重啟 Nginx

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## games 資料表結構

```sql
CREATE TABLE games (
    id TEXT PRIMARY KEY,        -- 唯一識別碼
    title TEXT,                 -- 遊戲名稱
    description TEXT,           -- 簡短描述
    fullDescription TEXT,       -- 完整描述
    thumbnailUrl TEXT,          -- 縮圖路徑
    coverUrl TEXT,              -- 封面圖路徑
    gameUrl TEXT,               -- 遊戲入口 URL
    developer TEXT,             -- 開發商
    price REAL,                 -- 價格
    isFree INTEGER,             -- 是否免費 (1/0)
    category TEXT,              -- 分類
    displayOrder INTEGER        -- 顯示順序
);
```

---

## 遊戲分類

| 分類 | 說明 |
|------|------|
| 棋牌 | 撲克、麻將、牛牛等 |
| 休閒 | 消消樂、跑酷等 |
| 射擊 | 飛機大戰、太空射擊等 |
| 益智 | 2048、五子棋等 |
| 捕魚 | 捕魚達人類 |
| 角色 | RPG、動作角色扮演 |
| 策略 | 塔防、戰略等 |

---

## 範例：上架火花棋牌

### 本機端

```bash
# 1. 建立資料夾並複製縮圖
mkdir -p E:/steam/gamezoe/games/huohua
cp "E:/steam/gamezoe/games/egret-H5-qipai-game-main/h5-client/resource/assets/loading/loading_bg.jpg" "E:/steam/gamezoe/games/huohua/thumbnail.jpg"

# 2. 執行資料庫腳本
node add_huohua_game.js

# 3. 推送
git add games/huohua/ server/gamezoe.db
git commit -m "Add: 火花棋牌遊戲"
git push origin master
```

### Server 端

```bash
# 1. 拉取更新
cd ~/gamezoe && git fetch origin && git reset --hard origin/master

# 2. 設定 Nginx (火花棋牌跑在 port 8090)
# 編輯 /etc/nginx/sites-enabled/gamezoe 加入：
#     location /huohua/ {
#         proxy_pass http://localhost:8090/;
#         proxy_http_version 1.1;
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#     }

# 3. 重啟服務
sudo nginx -t && sudo systemctl reload nginx
pm2 restart all
```

---

## 常見問題

### Q: 圖片不顯示
檢查路徑是否正確，確認圖片已推送到 Server。

### Q: 遊戲 404
1. 檢查 `gameUrl` 是否正確
2. 靜態遊戲：確認 `games/` 資料夾存在
3. 後端服務：確認 Nginx 反向代理已設定

### Q: 資料庫更新沒生效
確認 `server/gamezoe.db` 已加入 git 並推送，Server 端需要 `pm2 restart all`。

---

## 相關文檔

- [CLAUDE.md](./CLAUDE.md) - 專案開發指南
- [SKILL_P99PAY.md](./SKILL_P99PAY.md) - P99PAY 金流整合
