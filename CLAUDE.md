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
