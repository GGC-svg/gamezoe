# HTTPS 安全連線設定指南 (Nginx + Let's Encrypt)

本指南將教您如何在 GCP 上為您的網域 (例如 `yourgame.com`) 設定免費且自動更新的 SSL 憑證 (HTTPS)。

## ⚠️ 重要前提 (一定要先完成)
1.  **網域必須設定完成**：您的 GoDaddy 網域必須已經指向 GCP 的 IP。
2.  **等待生效**：請先試著在瀏覽器輸入 `http://您的網域.com`，確認**已經可以連上網站** (看到畫面)。
    *   如果還連不上，**請勿進行下列步驟**，否則憑證申請會失敗。

---

## 步驟 1: 清除舊的 Port 80 轉發規則
因為我們要改用更專業的網頁伺服器軟體 (Nginx) 來幫我們管理 HTTPS，所以要先取消之前暫時用的 iptables 轉發。

在 SSH 黑視窗中執行：
```bash
# 清除 NAT 表的所有規則
sudo iptables -t nat -F
```
*(執行完這行後，原本的 http://IP 可能會暫時連不上，這是正常的)*

## 步驟 2: 安裝 Nginx 與 Certbot
Nginx 是一個強大的網頁伺服器，Certbot 是用來自動申請免費憑證的工具。

```bash
# 更新系統並安裝軟體
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

## 步驟 3: 設定 Nginx 代表您接客
我們要告訴 Nginx 把收到的客人都轉給您的 GameZoe (Port 3001)。

1.  **建立設定檔** (請把 `yourgame.com` 換成您**真正購買的網域**，不需要 `www`，例如 `gamezoe.top`)：
    ```bash
    # 這裡假設您的網域是 yourdomain.com，請自行替換檔名
    sudo nano /etc/nginx/sites-available/gamezoe
    ```

2.  **在編輯器中貼上以下內容**：
    *(請務必將 `server_name` 後面的網址換成您自己的！)*

    ```nginx
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com; # <--- 這裡改成您的網域

        location / {
            proxy_pass http://localhost:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  **儲存離開**：按 `Ctrl + O` (Enter 確認)，然後按 `Ctrl + X`。

4.  **啟用設定**：
    ```bash
    # 建立連結
    sudo ln -s /etc/nginx/sites-available/gamezoe /etc/nginx/sites-enabled/

    # 刪除預設設定 (避免衝突)
    sudo rm /etc/nginx/sites-enabled/default

    # 測試設定有沒有寫錯
    sudo nginx -t
    # (如果出現 successful 代表沒問題)

    # 重啟 Nginx
    sudo systemctl restart nginx
    ```

    這時候，用 `http://您的網域.com` 應該要能看到網站了。

## 步驟 4: 一鍵開啟 HTTPS (重頭戲)
現在我們要請 Certbot 幫我們把 HTTP 變成 HTTPS。

執行指令 (替換成您的網域)：
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

*   系統會問您輸入 Email (用來接收到期通知)：輸入您的 Email。
*   是否同意條款：輸入 `Y`。
*   是否分享 Email：輸入 `N`。
*   Certbot 會自動跑一堆測試，如果出現 `Congratulations!` 代表成功了！

## 步驟 5: 恢復安全設定 (選做)
既然有了 HTTPS，我們可以把之前幫您關掉的 `Helmet` 安全設定打開 (把 `strictTransportSecurity` 設回 `true`)，不過目前先保持這樣也能正常運作。

---

**完成！**
現在您可以用 **`https://您的網域.com`** 安全地瀏覽您的網站了！🔒
