# SKILL: Egret H5 棋牌遊戲建置

> 白鹭引擎 H5 棋牌遊戲中心的完整建置與部署指南

---

## 專案概述

**路徑**: `games/egret-H5-qipai-game-main/`

這是一個完整的棋牌遊戲平台，包含三個獨立組件：

| 組件 | 用途 | 技術 | Port | 部署位置 |
|------|------|------|------|----------|
| **h5-client** | 遊戲前端 | TypeScript + Egret | 443 (nginx) | `/games/huohua-qipai/` |
| **h5-server** | 遊戲伺服器 | Java + Netty | TCP:4014, WS:5014 | `~/h5-server/` |
| **h5-admin** | 後台管理 | Java + Spring Boot | HTTP:8090 | `~/h5-admin-app.jar` |

> ⚠️ **重要**: `h5-admin` 是管理後台，不是遊戲伺服器！遊戲需要 `h5-server` 才能運行。

---

## 資料庫架構

### 四個 MySQL 資料庫

```sql
ma_lai_h5_game_data   -- 遊戲數據 (玩家、遊戲記錄)
ma_lai_h5_game_dic    -- 遊戲字典 (配置表)
ma_lai_h5_game_log    -- 遊戲日誌
ma_lai_h5_web_manage  -- 後台管理
```

### MySQL 用戶設置

Ubuntu 的 MySQL root 預設使用 socket 認證，Java 應用無法用密碼連線。需建立專用用戶：

```bash
sudo mysql -e "
CREATE USER IF NOT EXISTS 'gameserver'@'localhost' IDENTIFIED BY 'bosan204';
GRANT ALL PRIVILEGES ON ma_lai_h5_game_data.* TO 'gameserver'@'localhost';
GRANT ALL PRIVILEGES ON ma_lai_h5_game_dic.* TO 'gameserver'@'localhost';
GRANT ALL PRIVILEGES ON ma_lai_h5_game_log.* TO 'gameserver'@'localhost';
GRANT ALL PRIVILEGES ON ma_lai_h5_web_manage.* TO 'gameserver'@'localhost';
FLUSH PRIVILEGES;
"
```

---

## 本機建置流程

### 環境需求

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | 14+ | Egret CLI |
| Egret CLI | 5.x | 前端建置 |
| JDK | 8+ | Java 編譯 |
| Maven | 3.9+ | Java 建置 |

### 1. 建置 h5-client (前端)

```bash
# 安裝 Egret CLI (首次)
npm install -g egret

# 進入前端目錄
cd games/egret-H5-qipai-game-main/h5-client

# 修改配置指向正式伺服器 (透過 nginx 代理)
# 編輯 resource/config/global.json:
{
    "IsDebug": false,
    "GoldMode": false,
    "HttpSerever": "https://gamezoe.com",
    "SocketUrl": "wss://gamezoe.com/huohua-ws/websocket",
    "SocketServer": "gamezoe.com/huohua-ws/websocket",
    "SocketPort": 443
}

# 編譯
egret build

# 發佈 (壓縮優化)
egret publish

# 複製到遊戲目錄
cp -r bin-release/web/[timestamp]/* ../../huohua-qipai/
```

### 2. 建置 h5-server (遊戲伺服器)

```bash
cd games/egret-H5-qipai-game-main/h5-server

# 編譯 (跳過測試)
mvn clean package -DskipTests

# 輸出位置
# game-server/target/game-server-malai-h5-1.0.0-assembly.tar.gz
```

### 3. 建置 h5-admin (後台管理)

```bash
cd games/egret-H5-qipai-game-main/h5-admin/huohua-admin

# 編譯
mvn clean package -DskipTests

# 輸出
# target/huohua-admin.jar
```

### Maven 依賴問題

原始專案依賴 `com.idealighter:utils-core`，但該 Maven 倉庫已關閉。

**解決方案**: 已在 `C:\Users\user\.m2\repository\com\idealighter` 實作替代類：

| 原始類 | 功能 |
|--------|------|
| `EmptyUtil` | 空值檢查 |
| `CheckUtil` | 驗證工具 |
| `RandCodeUtil` | 隨機碼生成 |
| `MD5Utils` | MD5 加密 |
| `JsonUtil` | JSON 序列化 |
| `TimeUtil` | 時間工具 |

---

## 推送到 Git

```bash
cd /e/Steam/gamezoe

# 推送 h5-client 前端
git add -f games/huohua-qipai/
git commit -m "Add huohua-qipai h5-client build"

# 推送 h5-server 建置包
git add -f games/egret-H5-qipai-game-main/h5-server/game-server/target/game-server-malai-h5-1.0.0-assembly.tar.gz
git commit -m "Add h5-server build package"

git push origin master
```

---

## Server 端部署

### 一、部署 h5-client (前端)

#### 步驟 1: 備份資料庫

```bash
cp ~/gamezoe/server/gamezoe.db ~/gamezoe/server/gamezoe.db.bak.$(date +%Y%m%d%H%M%S)
```

#### 步驟 2: 拉取最新代碼

```bash
cd ~/gamezoe && git fetch origin && git reset --hard origin/master
```

#### 步驟 3: 更新 GameZoe 資料庫

```bash
sqlite3 ~/gamezoe/server/gamezoe.db "UPDATE games SET gameUrl = '/games/huohua-qipai/', thumbnailUrl = '/games/huohua-qipai/thumbnail.jpg', coverUrl = '/games/huohua-qipai/thumbnail.jpg' WHERE id = 'huohua-qipai';"
```

#### 步驟 4: 重啟 GameZoe 服務

```bash
pm2 restart all
```

#### 步驟 5: 驗證前端

```bash
curl -I https://gamezoe.com/games/huohua-qipai/
# 預期: HTTP/1.1 200 OK
```

#### 一鍵部署前端 (含備份)

```bash
cp ~/gamezoe/server/gamezoe.db ~/gamezoe/server/gamezoe.db.bak.$(date +%Y%m%d%H%M%S) && cd ~/gamezoe && git fetch origin && git reset --hard origin/master && sqlite3 server/gamezoe.db "UPDATE games SET gameUrl = '/games/huohua-qipai/', thumbnailUrl = '/games/huohua-qipai/thumbnail.jpg', coverUrl = '/games/huohua-qipai/thumbnail.jpg' WHERE id = 'huohua-qipai';" && pm2 restart all
```

---

### 二、部署 h5-server (遊戲伺服器)

#### 步驟 1: 解壓 h5-server

```bash
mkdir -p ~/h5-server
tar -xzf ~/gamezoe/games/egret-H5-qipai-game-main/h5-server/game-server/target/game-server-malai-h5-1.0.0-assembly.tar.gz -C ~/h5-server
```

#### 步驟 2: 建立 MySQL 用戶

```bash
sudo mysql -e "
CREATE USER IF NOT EXISTS 'gameserver'@'localhost' IDENTIFIED BY 'bosan204';
GRANT ALL PRIVILEGES ON ma_lai_h5_game_data.* TO 'gameserver'@'localhost';
GRANT ALL PRIVILEGES ON ma_lai_h5_game_dic.* TO 'gameserver'@'localhost';
GRANT ALL PRIVILEGES ON ma_lai_h5_game_log.* TO 'gameserver'@'localhost';
GRANT ALL PRIVILEGES ON ma_lai_h5_web_manage.* TO 'gameserver'@'localhost';
FLUSH PRIVILEGES;
"
```

#### 步驟 3: 更新資料庫配置

將 `root` 改為 `gameserver`：

```bash
sed -i 's/jdbc.user=root/jdbc.user=gameserver/g' ~/h5-server/game-server-malai-h5-1.0.0/conf/config/jdbc/*.properties
sed -i 's/username=root/username=gameserver/g' ~/h5-server/game-server-malai-h5-1.0.0/conf/config/jdbc/*.properties
```

#### 步驟 4: 驗證資料庫連線

```bash
mysql -u gameserver -pbosan204 -e "SHOW DATABASES;" | grep ma_lai
```

#### 步驟 5: 啟動 h5-server

> ⚠️ **注意**: Launcher.class 在根目錄，不是在 package 內，所以不需要包名。

```bash
cd ~/h5-server/game-server-malai-h5-1.0.0
java -cp "conf:lib/*" Launcher
```

#### 步驟 6: 使用 PM2 管理 (推薦)

建立啟動腳本：

```bash
echo '#!/bin/bash
cd ~/h5-server/game-server-malai-h5-1.0.0
exec java -cp "conf:lib/*" Launcher' > ~/start-h5-server.sh
chmod +x ~/start-h5-server.sh
```

用 PM2 啟動：

```bash
pm2 start ~/start-h5-server.sh --name h5-game-server
pm2 save
```

#### 步驟 7: 驗證 h5-server

```bash
ss -tlnp | grep 5014
# 預期: LISTEN 0 ... *:5014
```

---

### 三、部署 h5-admin (後台管理)

```bash
# 上傳 huohua-admin.jar 到伺服器後
java -jar ~/h5-admin-app.jar &

# 或用 PM2
pm2 start "java -jar ~/h5-admin-app.jar" --name h5-admin
pm2 save
```

訪問: `http://gamezoe.com:8090`

---

## 連接埠配置

### 遊戲伺服器 (h5-server)

| Port | 用途 | 防火牆 |
|------|------|--------|
| 4014 | TCP 連線 | 需開放 |
| 5014 | WebSocket | 需開放 |
| 6014 | HTTP API | 可選 |
| 7014 | Web HTTP | 可選 |
| 8014 | 第三方接口 | 可選 |

### 後台管理 (h5-admin)

| Port | 用途 | 防火牆 |
|------|------|--------|
| 8090 | HTTP | 可選 |

### 開放防火牆

```bash
sudo ufw allow 5014/tcp
sudo ufw allow 4014/tcp
```

---

## Nginx WebSocket 代理 (必要)

> ⚠️ **重要**: 直接連接 `wss://gamezoe.com:5014` 會失敗，因為 5014 port 是 WS 而非 WSS。必須透過 nginx 代理。

### 配置 (已部署)

在 `/etc/nginx/sites-enabled/gamezoe` 的 server block 內加入：

```nginx
location /huohua-ws/ {
    proxy_pass http://localhost:5014/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

### 前端配置 (global.json)

```json
{
    "IsDebug": false,
    "GoldMode": false,
    "HttpSerever": "https://gamezoe.com",
    "SocketUrl": "wss://gamezoe.com/huohua-ws/websocket",
    "SocketServer": "gamezoe.com/huohua-ws/websocket",
    "SocketPort": 443
}
```

### 重載 nginx

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 遊戲列表

專案包含的遊戲模組：

| 遊戲 | 路徑 | 說明 |
|------|------|------|
| 捕魚 | `h5-client/src/game/games/fish/` | 含寶藏活動 |
| 百家樂 | `h5-client/src/game/games/baccarat/` | Baccarat |
| 紅黑梅方 | `h5-client/src/game/games/brnn/` | BRNN |

---

## 點數轉換系統 (待實作)

| 設定 | 值 |
|------|---|
| 轉換比例 | 1 G幣 = 1 遊戲金幣 |
| 雙向轉點 | 是 |
| API 端點 | `/api/games/huohua/transfer` (規劃中) |

---

## 常見問題

### Q: 為什麼只看到管理頁面？

**A**: `h5-admin` 是後台管理系統，不是遊戲。需要：
1. 啟動 `h5-server` (遊戲伺服器)
2. 訪問 `h5-client/index.html` (遊戲前端)

### Q: Maven 編譯失敗找不到依賴？

**A**: 檢查 `com.idealighter:utils-core` 是否存在於本地 Maven 倉庫。如果沒有，需要手動實作替代類。

### Q: 遊戲連不上伺服器？

**A**: 依序檢查：
1. h5-server 是否已啟動: `ss -tlnp | grep 5014`
2. 防火牆是否開放: `sudo ufw status | grep 5014`
3. 前端配置的伺服器地址是否正確

### Q: MySQL 連線被拒絕 (Access denied)？

**A**: Ubuntu MySQL root 預設用 socket 認證。解決方案：
1. 建立 `gameserver` 用戶 (見上方步驟)
2. 更新配置檔使用 `gameserver` 用戶

### Q: MySQL 8.0 認證插件錯誤 (caching_sha2_password)？

**A**: 舊版 JDBC driver 不支援 MySQL 8.0 的預設認證方式。

**錯誤訊息**: `Unable to load authentication plugin 'caching_sha2_password'`

**解決方案**: 改用傳統認證方式：

```bash
sudo mysql -e "ALTER USER 'gameserver'@'localhost' IDENTIFIED WITH mysql_native_password BY 'bosan204'; FLUSH PRIVILEGES;"
```

### Q: MySQL 8.0 query_cache_size 錯誤？

**A**: MySQL 8.0 已移除 query_cache 功能，舊版 JDBC driver 會報錯。

**錯誤訊息**: `Unknown system variable 'query_cache_size'`

**解決方案**: 升級 MySQL JDBC driver 到 8.0+：

```bash
cd ~/h5-server/game-server-malai-h5-1.0.0/lib
rm mysql-connector-java-5.1.42.jar
wget https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.28/mysql-connector-java-8.0.28.jar
```

### Q: h5-server 啟動後立即退出？

**A**: 檢查日誌：
```bash
cat ~/h5-server/game-server-malai-h5-1.0.0/logs/*.log
```
常見原因：
- MySQL 連線失敗
- Port 已被佔用

---

## 檔案結構

### 伺服器端

```
~/
├── gamezoe/                           # GameZoe 主專案
│   └── games/
│       ├── huohua-qipai/              # h5-client 前端 (已部署)
│       └── egret-H5-qipai-game-main/  # 源碼 + 建置包
│           └── h5-server/game-server/target/
│               └── game-server-malai-h5-1.0.0-assembly.tar.gz
├── h5-server/                         # h5-server 解壓後
│   └── game-server-malai-h5-1.0.0/
│       ├── conf/config/jdbc/          # 資料庫配置
│       └── lib/                       # Java 依賴
└── h5-admin-app.jar                   # 後台管理
```

### 本機端

```
E:\steam\gamezoe\games\egret-H5-qipai-game-main\
├── h5-client/                   # 前端源碼
│   ├── resource/config/global.json  # WebSocket 配置
│   └── bin-release/             # 發佈輸出
├── h5-server/                   # 伺服器源碼
│   └── game-server/target/      # 建置輸出
└── h5-admin/                    # 後台源碼
```

---

## 完整部署流程摘要

```
本機:
1. 修改 h5-client/resource/config/global.json → gamezoe.com/huohua-ws/websocket
2. egret build && egret publish
3. cp bin-release/web/[ts]/* games/huohua-qipai/
4. git add + commit + push

Server:
5. git pull
6. sqlite3 更新 games 表
7. pm2 restart all (前端完成)

8. tar -xzf h5-server 建置包
9. sudo mysql 建立 gameserver 用戶 (用 mysql_native_password)
10. sed 更新 jdbc 配置
11. 升級 MySQL JDBC driver 到 8.0.28
12. java -cp "conf:lib/*" Launcher 或 pm2 啟動 h5-server
13. 設定 nginx WebSocket 代理 (/huohua-ws/)
14. sudo systemctl reload nginx
```

---

## 測試紀錄 (2026/01/17)

### 問題 1: MySQL 認證失敗

**症狀**: h5-server 無法連接 MySQL

**錯誤**: `Unable to load authentication plugin 'caching_sha2_password'`

**原因**: MySQL 8.0 預設使用新的認證插件，但 JDBC 5.1.42 不支援

**解決**:
```bash
sudo mysql -e "ALTER USER 'gameserver'@'localhost' IDENTIFIED WITH mysql_native_password BY 'bosan204';"
```

### 問題 2: MySQL query_cache_size 錯誤

**症狀**: h5-server 啟動後立即報錯

**錯誤**: `Unknown system variable 'query_cache_size'`

**原因**: MySQL 8.0 移除了 query_cache 功能

**解決**: 升級 JDBC driver
```bash
cd ~/h5-server/game-server-malai-h5-1.0.0/lib
rm mysql-connector-java-5.1.42.jar
wget https://repo1.maven.org/maven2/mysql/mysql-connector-java/8.0.28/mysql-connector-java-8.0.28.jar
```

### 問題 3: WebSocket 連線失敗

**症狀**: 遊戲載入後連不上伺服器

**錯誤**: Console 顯示 WebSocket connection failed

**原因**: 前端配置直連 `wss://gamezoe.com:5014`，但 5014 是 WS 不是 WSS

**解決**:
1. 新增 nginx 代理 `/huohua-ws/` → `localhost:5014`
2. 修改 global.json 使用 `wss://gamezoe.com/huohua-ws/websocket`

### 問題 4: 登入系統未整合 (待處理)

**症狀**: 遊戲顯示獨立登入頁面 (帳號/密碼/驗證碼)

**原因**: h5-client 有自己的認證系統，未與 GameZoe 平台整合

**狀態**: 待規劃整合方案

---

## 相關檔案

| 檔案 | 說明 |
|------|------|
| `build_server.bat` | 本機編譯遊戲伺服器 |
| `build_admin.bat` | 本機編譯後台管理 |
| `start_game_server.bat` | 本機啟動遊戲伺服器 |
| `start_h5_admin.bat` | 本機啟動後台管理 |
| `test001_mysql_data.sql` | 資料庫初始化腳本 |

---

## 備份記錄

| 日期 | 備份路徑 | 說明 |
|------|----------|------|
| 2026/01/17 | `backups/huohua-qipai-20260117/` | 登入整合前的完整備份 |
