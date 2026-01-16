# GameZoe 專案開發指南

## 部署流程

**重要：Server 端不執行 build，所有 build 都在本機完成後推送。**

### 標準部署步驟

1. **本機端 (Claude 執行)**
   ```bash
   cd /e/Steam/gamezoe
   npm run build
   git add -f dist/
   git commit -m "Build: [描述]"
   git push origin master
   ```

2. **Server 端 (用戶在 SSH 執行)**
   ```bash
   cd ~/gamezoe && git fetch origin && git reset --hard origin/master && pm2 restart all
   ```

### 為什麼這樣做？
- Server 有 PM2 託管，build 過程容易被中斷
- 本機 build 完成後推送 dist 資料夾，Server 只需 pull 即可

---

## 專案結構

- `E:\Steam\GameZoeBK` - 本機測試區
- `E:\Steam\gamezoe` - Git 倉庫，推送到正式 Server
- Server 路徑: `~/gamezoe`

---

## 資料庫更新

如需更新遊戲資料（標題、介紹等），在本機執行腳本後：
1. 本機：更新 `server/gamezoe.db` 和 `games_export_utf8.json`
2. Server：執行對應的更新腳本，如 `node server/update_plane_game.js`

---

## 常用指令

### 完整部署 (含 build)
```bash
# 本機
npm run build && git add -f dist/ && git commit -m "Build: update" && git push origin master
```

### Server 更新
```bash
cd ~/gamezoe && git fetch origin && git reset --hard origin/master && pm2 restart all
```

---

## Shell 指令格式規範

**提供給用戶在 Server 執行的指令時，避免使用 heredoc (`<< 'EOF'`)，改用 echo 單行模式：**

### ❌ 避免（heredoc 容易卡住）
```bash
cat > ~/file.txt << 'EOF'
line1
line2
EOF
```

### ✅ 建議（echo 單行模式）
```bash
echo 'line1
line2' > ~/file.txt
```

### 範例：建立 .env 檔案
```bash
echo 'KEY1=value1
KEY2=value2
KEY3=value3' > ~/gamezoe/server/.env && pm2 restart gamezoe-web
```

---

## 安全性注意事項

### 禁止推送的資料夾

**⚠️ 絕對禁止推送到正式伺服器：**

| 資料夾 | 說明 |
|--------|------|
| `Billing/Billing/` | 金流廠商 P99PAY 對接資料，包含 API 金鑰、測試帳號等機密資訊 |

這些資料夾已加入 `.gitignore`，但仍需特別注意：
- 不要使用 `git add -f` 強制加入這些資料夾
- 不要將金流 API 金鑰寫入程式碼中
- 金流相關設定應使用環境變數或獨立的設定檔（不納入版控）

---

## P99PAY 金流整合 (2026/01/15 完成)

> **技術實作詳情請參考**: [SKILL_P99PAY.md](./SKILL_P99PAY.md) - 包含 ERQC 公式、加解密程式碼、完整支付流程圖

### 概述
- **金流商**: 完美玖玖國際 (P99PAY)
- **支付方式**: KIWI PIN 點數卡 / KIWI Wallet 錢包
- **匯率**: 1 USD = 100 G幣

### 關鍵檔案

| 檔案 | 說明 |
|------|------|
| `server/routes/p99pay.js` | P99PAY API 路由 (訂單建立、回調、通知、查單、請款) |
| `server/utils/p99pay.js` | P99PAY 加密工具 (TripleDES-CBC, ERQC/ERPC 驗證) |
| `components/WalletModal.tsx` | 錢包彈窗 (儲值選項、交易紀錄) |
| `components/PaymentResultModal.tsx` | 支付結果全屏彈窗 (成功/失敗/處理中) |
| `App.tsx` | P99 回調處理 (讀取 URL 參數、顯示結果彈窗) |

### API 端點

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/payment/p99/order` | POST | 建立訂單，返回 formData 供前端 POST 到 P99 |
| `/api/payment/p99/return` | POST | P99 用戶回調 (RETURN_URL)，處理支付結果並重導 |
| `/api/payment/p99/notify` | POST | P99 伺服器通知 (Server-to-Server)，確保交易完成 |
| `/api/payment/p99/checkorder` | POST | 查詢訂單狀態 |
| `/api/payment/p99/settle` | POST | 請款確認 |

### 支付流程

```
1. 用戶選擇金額 → 前端呼叫 /api/payment/p99/order
2. 後端建立訂單 → 返回 formData (BASE64 編碼)
3. 前端 POST formData 到 P99 API → 用戶進入 P99 支付頁面
4. 用戶完成支付 → P99 POST 到 RETURN_URL + NOTIFY_URL
5. 後端驗證 ERPC → 入帳 G幣 → 重導到首頁顯示結果彈窗
6. 後端自動呼叫 Settle API 請款
```

### 資料庫表

**p99_orders** - P99 訂單記錄
```sql
CREATE TABLE p99_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT UNIQUE NOT NULL,     -- 我方訂單編號 (GZxxxxxxxxxx)
    rrn TEXT,                          -- P99 交易編號 (KPxxxxxx)
    user_id TEXT NOT NULL,
    amount_usd REAL NOT NULL,
    gold_amount INTEGER NOT NULL,
    paid TEXT,                         -- 支付方式 (COPKWP01/COPKWP09)
    status TEXT DEFAULT 'pending',     -- pending/success/failed/settled
    pay_status TEXT,                   -- P99 PAY_STATUS (S/W/F)
    rcode TEXT,                        -- P99 回應碼
    erpc_verified INTEGER DEFAULT 0,
    ...
);
```

### 錯誤處理

P99 返回兩個錯誤碼：
- **RCODE**: 一般狀態碼 (如 3001 = 交易失敗)
- **PAY_RCODE**: 具體錯誤碼 (如 3903 = PIN 已使用)
- **RMSG_CHI**: P99 提供的中文錯誤訊息

後端優先傳遞 `PAY_RCODE` 和 `RMSG_CHI` 給前端顯示。

**常見 RCODE:**
| 代碼 | 說明 |
|------|------|
| 0000 | 成功 |
| 3001 | 交易失敗 |
| 3903 | PIN 碼已被使用 |
| 3904 | PIN 碼錯誤 |
| 3902 | PIN 碼已被鎖定 |
| 3901 | PIN 面額與交易金額不符 |

### 環境變數 (server/.env)

```env
# P99PAY Configuration
P99_MID=M2000145
P99_CID=C001450000145
P99_KEY=NTJ1aXpyM1RSUVJNZGdtYWVheWNpWkY3
P99_IV=UzZKWWRvUm0=
P99_PASSWORD=VpLQyKrUXe
P99_API_URL=https://api.p99pay.com/v1
P99_RETURN_URL=https://gamezoe.cc/api/payment/p99/return
P99_NOTIFY_URL=https://gamezoe.cc/api/payment/p99/notify
```

> ⚠️ 以上為**測試環境**金鑰，正式上線需更換。

### 測試資料

**KIWI PIN 測試卡** (1 USD = 100 KIWI Points):
```
RBX1RR5ZKHHMQ7BK, 9KBD57Z7F7TLWNFW, EX0UQMVJJVR0GCLR
FDPLR3RZMGXVP578, KXRF2NU9EK1BMNNP, CEYGKVPNBAGWY8WX
WT45CYT8NJ7V8NVH, UF3JT8TFNNRC4KRF, NYGJPNVBLCS9SCFD, 1CWA4TR2YE9YX0T2
```

**KIWI Wallet 測試帳號**:
- 帳號: `kiwi002@kiwipin.com`
- 密碼: `kiwi@123`
- 安全鎖: `123002`

### 安全機制

1. **ERQC/ERPC 驗證**: 使用 TripleDES-CBC + SHA1 驗證交易真實性
2. **訂單唯一性**: 使用 `INSERT OR IGNORE` 防止重複入帳
3. **批次對帳**: 每 10 分鐘檢查 pending 訂單狀態
4. **內部對帳**: 每 30 分鐘檢查 p99_orders 與 wallet_transactions 一致性

### 注意事項

1. **IP 白名單**: 正式環境需向 P99 提供伺服器 IP
2. **CORS**: 已允許 `stage-api.p99pay.com` 和 `api.p99pay.com`
3. **Trust Proxy**: 已啟用 `app.set('trust proxy', true)` 取得真實用戶 IP

---

## 遊戲縮圖更新流程

### 步驟

1. **本機：複製圖片到遊戲資料夾**
   ```bash
   cp "來源圖片路徑" "E:/Steam/gamezoe/games/遊戲資料夾/thumbnail.jpg"
   ```

2. **本機：推送到 Git**
   ```bash
   cd /e/Steam/gamezoe
   git add games/遊戲資料夾/thumbnail.jpg
   git commit -m "Update: 遊戲名稱 thumbnail"
   git push origin master
   ```

3. **Server：拉取並更新資料庫**
   ```bash
   cd ~/gamezoe && git fetch origin && git reset --hard origin/master
   ```

4. **Server：查詢遊戲 ID**
   ```bash
   sqlite3 ~/gamezoe/server/gamezoe.db "SELECT id, title, thumbnailUrl FROM games WHERE title LIKE '%關鍵字%';"
   ```

5. **Server：更新縮圖路徑**
   ```bash
   sqlite3 ~/gamezoe/server/gamezoe.db "UPDATE games SET thumbnailUrl = '/games/遊戲資料夾/thumbnail.jpg' WHERE id = '遊戲ID';"
   ```

6. **Server：重啟服務**
   ```bash
   pm2 restart all
   ```

### 資料庫欄位參考

**games 表結構：**
```sql
id TEXT PRIMARY KEY,
title TEXT,
description TEXT,
fullDescription TEXT,
thumbnailUrl TEXT,      -- 縮圖路徑
coverUrl TEXT,          -- 封面圖路徑
gameUrl TEXT,           -- 遊戲入口 URL
developer TEXT,
price REAL,
isFree INTEGER,
category TEXT,
...
```

### 範例：更新羅斯魔影消消樂縮圖

```bash
# Server 端執行
sqlite3 ~/gamezoe/server/gamezoe.db "UPDATE games SET thumbnailUrl = '/games/Rosebubble/thumbnail.jpg' WHERE id = 'rose-bubble';"
pm2 restart all
```

---

## TypeScript 檔案修改規範

### ⚠️ 禁止使用 sed/heredoc 修改 TypeScript 檔案

**問題**：TypeScript 的模板字串使用反引號和 `${}` 語法，會被 shell 錯誤解釋：

```typescript
// 正確的 TypeScript
row[`Trans_${langCode}`] = value;

// sed/heredoc 處理後變成亂碼
row[\`Trans_\${langCode}\`] = value;
```

### ❌ 避免的方法
```bash
# sed 會破壞模板字串
sed -i 's/old/new with `template`/' file.ts

# heredoc 會解釋 $ 和反引號
cat > file.ts << 'EOF'
row[`Trans_${langCode}`] = value;
EOF
```

### ✅ 正確的方法：使用 Node.js 腳本

```javascript
// modify_file.js
const fs = require('fs');
let content = fs.readFileSync('file.ts', 'utf8');
content = content.replace('oldCode', 'newCode with `template`');
fs.writeFileSync('file.ts', content);
```

```bash
node modify_file.js
```

### 為什麼 Node.js 更好？
1. **原生支援 JavaScript 語法** - 不會錯誤解釋模板字串
2. **精確的字串替換** - 使用 `.replace()` 方法
3. **可讀性高** - 修改邏輯清晰明確
4. **可重複執行** - 腳本可以版控和重用

---

## SKILL 技術文檔

專門的技術實作參考文檔，包含詳細的程式碼範例和實作細節：

| 文檔 | 說明 |
|------|------|
| [SKILL_P99PAY.md](./SKILL_P99PAY.md) | P99PAY 金流整合 - ERQC 公式、TripleDES 加解密、回調處理 |

> 如需新增 SKILL 文檔，請使用 `SKILL_[主題].md` 命名格式。
