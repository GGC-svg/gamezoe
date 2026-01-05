# GameZoe GCP Deployment Guide

本指南將協助您將 GameZoe 部署到 Google Cloud Platform (GCP) 的 **Compute Engine (VM)**。
為了保留您的 SQLite 資料庫 (遊戲與用戶存檔)，使用 VM 是最簡單且有效的方案。

## 步驟 0: 啟用計費帳戶 (必備)

**注意：** Google Cloud Compute Engine 需要連結一個有效的計費帳戶才能使用 (即使是免費試用也需要綁定信用卡以驗證身分)。

如果您看到 `Billing account for project ... is not found` 錯誤，請依照以下步驟操作：

1.  在 Google Cloud Console 左側選單中，點選 **「Billing」(計費)**。
2.  點選 **「連結計費帳戶」 (Link a billing account)**。
3.  如果您還沒有計費帳戶，請點選 **「建立計費帳戶」**，並依照指示輸入信用卡資訊 (Google 通常會提供免費試用額度，不會立即扣款)。
4.  建立完成後，確保您的專案 (Project) 已經連結到該計費帳戶。
5.  回到 **Compute Engine** 頁面，重新嘗試啟用 API。

## 步驟 1: 準備 GCP Compute Engine

1.  登入 [Google Cloud Console](https://console.cloud.google.com/)。
2.  前往 **Compute Engine** > **VM執行個體**。
3.  點擊 **建立執行個體**。
4.  **設定建議**：
    *   **名稱**: `gamezoe-server`
    *   **區域**: `asia-east1` (台灣)
    *   **機器類型**: `e2-medium` (建議，因為需要編譯前端) 或 `e2-small`。
    *   **開機磁碟**: 選擇 `Ubuntu` (版本 20.04 LTS 或 22.04 LTS)，並將磁碟大小設為 **30GB** 以上 (遊戲檔案較多)。
    *   **防火牆**: 勾選 **允許 HTTP 流量** 和 **允許 HTTPS 流量**。
5.  點擊 **建立**。

## 步驟 2: 設定 VM 環境

1.  在 VM 列表中，點擊您剛建立的 VM 旁的 **SSH** 按鈕連線。
2.  在 SSH 視窗中，執行以下指令安裝 Node.js (v18) 和 PM2：

```bash
# 更新系統
sudo apt update

# 安裝 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安裝 PM2 (用於保持伺服器運行)
sudo npm install -g pm2
```

## 步驟 3: 上傳程式碼

您有兩種方式上傳程式碼：

### 方法 A: 使用 Git (推薦)
如果您有 GitHub/GitLab repository：
```bash
git clone <您的 repo URL>
cd gamezoe
```

### 方法 B: 直接上傳 (簡單)
1.  在您的電腦上，將 `gamezoe` 資料夾壓縮成 `gamezoe.zip` (請**排除** `node_modules` 和 `dist` 資料夾以縮小體積)。
2.  在 SSH 視窗右上角的「齒輪圖示」選單中，選擇 **上傳檔案**，上傳 `gamezoe.zip`。
3.  解壓縮：
```bash
sudo apt-get install unzip
unzip gamezoe.zip -d gamezoe
cd gamezoe
```

## 步驟 4: 安裝依賴並編譯

```bash
# 安裝所有套件
npm install

# 編譯前端頁面 (Vite Build)
# 這會產生 dist 資料夾
npm run build
```

## 步驟 5: 啟動伺服器

我們使用 PM2 來讓伺服器在背景執行，即使關閉 SSH 視窗也不會斷線。

```bash
# 啟動後端伺服器 (後端現在已經設定好會同時提供前端頁面)
pm2 start server/index.js --name "gamezoe"

# 設定開機自動啟動
pm2 startup

```

伺服器預設運行在 port `3001`。

## 步驟 6: 設定防火牆與對外頻寬

預設 GCP 只開啟 80/443。我們需要讓外部能存取 3001，或者是設定 iptables 把 80 轉到 3001。
最簡單的方式是設定 iptables 轉發：

```bash
# 將 Port 80 (HTTP) 的流量轉發到 Port 3001
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3001
```

現在，您可以使用瀏覽器訪問 VM 的 **外部 IP**，應該就能看到網站了！

## 步驟 7: 更新 Google 登入設定 (重要)

由於您的網站現在有了新的 IP 位址 (或網域)，您必須回到 **Google Cloud Console (原本申請 Google 登入的那一個帳號)** 進行設定，否則 Google 登入功能會失效。

1.  登入您申請 Google 登入 Client ID 的 Google 帳號。
2.  前往 **APIs & Services** > **Credentials (憑證)**。
3.  點擊您的 **OAuth 2.0 Client ID**。
4.  在 **Authorized JavaScript origins (已授權的 JavaScript 來源)** 欄位中，**新增**您 GCP VM 的 IP 位址 (例如: `http://35.xxx.xxx.xxx:3001` 或 `http://35.xxx.xxx.xxx`)。
    *   注意：如果您的網站沒有 SSL 憑證 (https)，Google 登入可能會在某些瀏覽器受到限制。建議後續申請網域並設定 HTTPS。
5.  點擊 **儲存**。

---

## 關於資料庫

*   您的資料庫位於 `server/gamezoe.db`。
*   這是 SQLite 檔案資料庫。所有的用戶資料、遊玩紀錄都在這個檔案中。
*   **備份**：如果您需要備份資料，只需下載這個 `.db` 檔案即可。
