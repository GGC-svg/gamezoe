# SKILL: Egret H5 棋牌遊戲建置

> 白鹭引擎 H5 棋牌遊戲中心的建置與部署指南

---

## 專案概述

**路徑**: `games/egret-H5-qipai-game-main/`

這是一個完整的棋牌遊戲平台，包含：
- **h5-client** - 白鹭引擎前端 (TypeScript + Egret)
- **h5-server** - Java 遊戲伺服器 (Netty + Spring)
- **h5-admin** - Java 後台管理系統 (Spring Boot)
- **MySQL 資料庫** - 4 個資料庫

### 重要區分

| 專案 | 用途 | 技術 | Port |
|------|------|------|------|
| `h5-server` | **遊戲伺服器** - 處理遊戲邏輯、WebSocket 連線 | Netty + Java | TCP:4014, WS:5014 |
| `h5-admin` | **後台管理** - 玩家管理、數據報表 | Spring Boot | HTTP:8090 |

> ⚠️ **注意**: `h5-admin` 是管理後台，不是遊戲伺服器！

---

## 目錄結構

```
egret-H5-qipai-game-main/
├── h5-client/              # 前端 (Egret 白鹭引擎)
│   ├── src/                # TypeScript 源碼
│   ├── resource/           # 遊戲資源
│   ├── egretProperties.json
│   └── index.html
├── h5-server/              # 遊戲伺服器 (Java)
│   ├── game-server/        # 主伺服器
│   ├── game-core/          # 核心邏輯
│   └── pom.xml
├── h5-admin/               # 後台管理 (Java)
│   └── huohua-admin/
└── test001_mysql_data.sql  # 資料庫初始化
```

---

## 資料庫設置

### 資料庫列表

```sql
CREATE DATABASE ma_lai_h5_game_data;   -- 遊戲數據 (玩家、遊戲記錄)
CREATE DATABASE ma_lai_h5_game_dic;    -- 遊戲字典 (配置表)
CREATE DATABASE ma_lai_h5_game_log;    -- 遊戲日誌
CREATE DATABASE ma_lai_h5_web_manage;  -- 後台管理
```

### 初始化

```bash
# 導入資料庫
mysql -u root -p < test001_mysql_data.sql
```

### 配置檔案位置

| 檔案 | 用途 |
|------|------|
| `h5-server/game-server/src/main/resources/config/jdbc/datadb.properties` | 遊戲數據庫 |
| `h5-server/game-server/src/main/resources/config/jdbc/dicdb.properties` | 字典數據庫 |
| `h5-server/game-server/src/main/resources/config/jdbc/logdb.properties` | 日誌數據庫 |
| `h5-admin/huohua-admin/src/main/resources/application-local.properties` | 管理後台 |

---

## 建置步驟

### 1. 前端 (h5-client)

**環境需求**: Node.js, Egret CLI

```bash
# 安裝 Egret CLI
npm install -g egret

# 進入前端目錄
cd h5-client

# 開發模式編譯
egret build

# 發佈模式編譯 (優化)
egret build -r

# 本地運行
egret run
```

**輸出**: `bin-release/` 目錄

### 2. 遊戲伺服器 (h5-server)

**環境需求**: JDK 8+, Maven 3.9+

```bash
cd h5-server

# 編譯 (跳過測試)
mvn clean package -DskipTests

# 輸出位置
# game-server/target/game-server-malai-h5-1.0.0-assembly.tar.gz
```

### 3. 後台管理 (h5-admin)

```bash
cd h5-admin/huohua-admin

# 編譯
mvn clean package -DskipTests

# 輸出
# target/huohua-admin.jar
```

---

## 啟動順序

```bash
# 1. 確保 MySQL 已啟動

# 2. 啟動遊戲伺服器
cd h5-server/game-server/target/game-server-malai-h5-1.0.0
java -cp ".:conf:lib/*" Launcher

# 3. 啟動後台管理 (可選)
cd h5-admin/huohua-admin/target
java -jar huohua-admin.jar

# 4. 訪問前端
# 方法 A: 直接開啟 h5-client/index.html
# 方法 B: egret run (開發模式)
```

---

## 依賴問題

### com.idealighter:utils-core 缺失

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

## 連接埠配置

### 遊戲伺服器 (h5-server)

| Port | 用途 |
|------|------|
| 4014 | TCP 連線 |
| 5014 | WebSocket |
| 6014 | HTTP API |
| 7014 | Web HTTP |
| 8014 | 第三方接口 |

### 後台管理 (h5-admin)

| Port | 用途 |
|------|------|
| 8090 | HTTP (Spring Boot) |

---

## 遊戲列表

專案包含的遊戲模組：

| 遊戲 | 路徑 | 說明 |
|------|------|------|
| 捕魚 | `h5-client/src/game/games/fish/` | 含寶藏活動 |
| 百家樂 | `h5-client/src/game/games/baccarat/` | Baccarat |
| 紅黑梅方 | `h5-client/src/game/games/brnn/` | BRNN |

---

## 部署到 GameZoe

### 建置狀態 (2026/01/17)

| 組件 | 狀態 | 說明 |
|------|------|------|
| h5-client | 已建置 | 發佈至 `games/huohua-qipai/` |
| h5-server | 已建置 | 待部署到伺服器 |
| h5-admin | 已建置 | 後台管理系統 |
| MySQL | 已建置 | 4 個資料庫已初始化 |

### 前端配置

**檔案**: `h5-client/resource/config/global.json`

```json
{
    "IsDebug": false,
    "GoldMode": false,
    "HttpSerever": "https://gamezoe.com",
    "SocketUrl": "wss://gamezoe.com:5014/websocket",
    "SocketServer": "gamezoe.com:5014/websocket",
    "SocketPort": 5014
}
```

### 前端建置

```bash
cd games/egret-H5-qipai-game-main/h5-client

# 開發模式
egret build

# 發佈模式 (壓縮優化)
egret publish

# 複製到遊戲目錄
cp -r bin-release/web/[timestamp]/* ../../../games/huohua-qipai/
```

### GameZoe 平台整合

**遊戲入口**: `/games/huohua-qipai/`

---

## Server 端部署流程

### 步驟 1: 備份資料庫

```bash
cp ~/gamezoe/server/gamezoe.db ~/gamezoe/server/gamezoe.db.bak.$(date +%Y%m%d%H%M%S)
```

### 步驟 2: 拉取最新代碼

```bash
cd ~/gamezoe && git fetch origin && git reset --hard origin/master
```

### 步驟 3: 更新資料庫

```bash
sqlite3 ~/gamezoe/server/gamezoe.db "UPDATE games SET gameUrl = '/games/huohua-qipai/', thumbnailUrl = '/games/huohua-qipai/thumbnail.jpg', coverUrl = '/games/huohua-qipai/thumbnail.jpg' WHERE id = 'huohua-qipai';"
```

### 步驟 4: 重啟服務

```bash
pm2 restart all
```

### 步驟 5: 驗證

```bash
# 確認遊戲入口
curl -I https://gamezoe.com/games/huohua-qipai/

# 確認資料庫更新
sqlite3 ~/gamezoe/server/gamezoe.db "SELECT id, title, gameUrl FROM games WHERE id = 'huohua-qipai';"
```

### 一鍵部署指令 (含備份)

```bash
cp ~/gamezoe/server/gamezoe.db ~/gamezoe/server/gamezoe.db.bak.$(date +%Y%m%d%H%M%S) && cd ~/gamezoe && git fetch origin && git reset --hard origin/master && sqlite3 server/gamezoe.db "UPDATE games SET gameUrl = '/games/huohua-qipai/', thumbnailUrl = '/games/huohua-qipai/thumbnail.jpg', coverUrl = '/games/huohua-qipai/thumbnail.jpg' WHERE id = 'huohua-qipai';" && pm2 restart all
```

---

## h5-server 遊戲伺服器部署

遊戲伺服器需要獨立的 Java 運行環境：

1. 上傳 `game-server-malai-h5-1.0.0-assembly.tar.gz` 到伺服器
2. 解壓並配置資料庫連線
3. 使用 PM2 或 systemd 管理進程
4. 確保 Port 5014 開放 (WebSocket)

### 點數轉換系統 (待實作)

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

**A**: 檢查：
1. 遊戲伺服器是否已啟動
2. WebSocket Port 5014 是否開放
3. 前端配置的伺服器地址是否正確

---

## 相關檔案

| 檔案 | 說明 |
|------|------|
| `build_server.bat` | 編譯遊戲伺服器 |
| `build_admin.bat` | 編譯後台管理 |
| `start_game_server.bat` | 啟動遊戲伺服器 |
| `start_h5_admin.bat` | 啟動後台管理 |
| `test001_mysql_data.sql` | 資料庫初始化腳本 |
