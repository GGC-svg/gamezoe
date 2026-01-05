# GoDaddy 網域設定指南 (指向 GCP)

本指南協助您將 GoDaddy 的網域 (例如 `yourgame.com`) 指向您的 Google Cloud Server IP。

## 步驟 1: 取得 GCP 外部 IP

1.  回到 Google Cloud Console 的 **VM 執行個體** 頁面。
2.  複製您的 **「外部 IP」** (External IP)，例如 `35.201.xxx.xxx`。

## 步驟 2: 設定 GoDaddy DNS

1.  登入 [GoDaddy 官網](https://www.godaddy.com/)。
2.  進入 **「我的產品」 (My Products)**。
3.  找到您的網域，點擊 **「DNS」** 按鈕 (或「管理 DNS」)。
4.  在 DNS 管理頁面，點擊 **「新增」 (Add)** 按鈕 (如果已經有 `A` 紀錄且名稱是 `@`，請點擊編輯)。

## 步驟 3: 新增/修改 A 紀錄

請填寫以下資訊：

*   **類型 (Type)**: `A`
*   **名稱 (Name)**: `@` (代表網域本身，不含 www)
*   **值 (Value)**: `您的 GCP 外部 IP` (從步驟 1 複製的那串數字)
*   **TTL**: `預設` 或 `1 小時`

點擊 **「儲存」 (Save)**。

## 步驟 4: (選擇性) 設定 www CNAME

如果您也希望 `www.yourgame.com` 能通：
1.  確認有一筆 **CNAME** 紀錄。
2.  **名稱 (Name)**: `www`
3.  **值 (Value)**: `@` (或您的網域名稱)

## 生效時間

DNS 設定修改後，通常需要 **10 分鐘 到 48 小時** 才會全球生效 (通常幾分鐘內就會通了)。

---
**重要提醒：**
設定完網域後，如果您的 GCP 伺服器還沒解決 `ERR_CONNECTION_REFUSED` (無法連線) 的問題，網域也一樣會連不上。請務必先確認透過 **IP** 能連上網站。
