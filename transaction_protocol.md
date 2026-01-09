# Transaction Protocol Design: Platform <-> Game Bridge

## 1. 玩家轉入遊戲 (Deposit: Platform -> Game)

**情境**: 玩家在平台點擊「入金 1000」，將平台 G 幣轉為遊戲點數。

### 步驟 01: 平台發起訂單 (Platform Initiates)
*   **動作**:
    1.  檢查玩家餘額是否足夠。
    2.  **扣除 G 幣** (DB Transaction)。
    3.  建立訂單紀錄 (Order ID)，狀態設為 `PENDING` (處理中)。
*   **資料庫紀錄**: `id: "ORD-20240101-001"`, `amount: 1000`, `status: "PENDING"`, `direction: "IN_GAME"`.

### 步驟 02: 請求轉點 API (Request Game API)
*   **方向**: Platform Server -> Game Server
*   **API URL**: `POST /api/game/v1/transaction/deposit`
*   **請求參數 (Request Body)**:
    ```json
    {
      "order_id": "ORD-20240101-001",   // 平台產生的唯一訂單號
      "user_id": "1001",                // 玩家 ID
      "amount": 1000,                   // 轉入點數
      "timestamp": 1704067200,          // 發送時間
      "signature": "a1b2c3d4..."        // 安全簽章 (防止竄改)
    }
    ```

### 步驟 03: 遊戲處理與回應 (Game Process & Response)
*   **遊戲端動作**:
    1.  收到請求，檢查 `order_id` 是否已存在 (冪等性檢查)。
    2.  若為新訂單：**增加遊戲點數** (DB Transaction)，紀錄交易日誌。
    3.  **強制刷新**: 通知遊戲 Client 更新畫面顯示 (Socket Emit)。
*   **回傳資料 (Response)**:
    ```json
    {
      "code": 200,
      "message": "SUCCESS",
      "data": {
        "order_id": "ORD-20240101-001", // 確認收到哪筆訂單
        "game_balance": 5000,           // (選填) 當前遊戲餘額
        "status": "COMPLETED"           // 狀態更新
      }
    }
    ```
*   **平台端動作**: 收到 `200 SUCCESS` 後，將 DB 訂單狀態更新為 `COMPLETED`。

### 步驟 04: 補單機制 (Reconciliation / Retry)
*   **觸發條件**: 若平台遲遲未收到步驟 03 的回應 (例如網路超時)。
*   **動作**: 5 分鐘後，平台再次發送 **查詢請求**。
*   **API URL**: `POST /api/game/v1/transaction/check`
*   **請求參數**: `{"order_id": "ORD-20240101-001"}`
*   **遊戲回應**:
    *   若已完成: 回傳 `{"status": "COMPLETED"}` -> 平台補寫狀態。
    *   若查無此單: 回傳 `{"status": "NOT_FOUND"}` -> 平台發起退款或報警示。

---

## 2. 遊戲轉出回平台 (Withdraw: Game -> Platform)

**情境**: 玩家在遊戲內點擊「結算 5000」，將點數轉回平台變成 G 幣。

### 步驟 01: 遊戲發起訂單 (Game Initiates)
*   **動作**:
    1.  檢查遊戲點數是否足夠。
    2.  **扣除點數** (DB Transaction)。
    3.  建立訂單紀錄，狀態設為 `PENDING`。
*   **資料庫紀錄**: `id: "GAME-20240101-999"`, `amount: 5000`, `status: "PENDING"`, `direction: "OUT_GAME"`.

### 步驟 02: 請求轉幣 API (Request Platform API)
*   **方向**: Game Server -> Platform Server
*   **API URL**: `POST /api/bridge/v1/transaction/withdraw`
*   **請求參數 (Request Body)**:
    ```json
    {
      "order_id": "GAME-20240101-999",  // 遊戲產生的唯一訂單號
      "user_id": "1001",
      "amount": 5000,                   // 轉出點數
      "timestamp": 1704068000,
      "signature": "x9y8z7..."
    }
    ```

### 步驟 03: 平台處理與回應 (Platform Process & Response)
*   **平台端動作**:
    1.  檢查 `order_id` 是否重複。
    2.  **增加 G 幣** (DB Transaction)，紀錄交易日誌。
    3.  **強制刷新**: 平台前端若有連線，通知更新餘額。
*   **回傳資料 (Response)**:
    ```json
    {
      "code": 200,
      "message": "SUCCESS",
      "data": {
        "order_id": "GAME-20240101-999",
        "platform_balance": 99000,
        "status": "COMPLETED"
      }
    }
    ```
*   **遊戲端動作**: 收到 `200 SUCCESS` 後，將 DB 訂單狀態更新為 `COMPLETED`，並通知玩家「結算成功」。

### 步驟 04: 補單機制 (Reconciliation / Retry)
*   **觸發條件**: 若遊戲未收到平台的確認回應。
*   **動作**: 5 分鐘後，遊戲 Server 自動排程發送確認請求。
*   **API URL**: `POST /api/bridge/v1/transaction/check`
*   **請求參數**: `{"order_id": "GAME-20240101-999"}`
*   **平台回應**: 確認該訂單是否已入帳，回傳對應狀態。

---

## 3. 安全性參數 (Security)

所有 API 呼叫都必須包含 Header 驗證：
*   `X-API-KEY`: 辨識來源 (GameZoe / FishMaster)。
*   `X-SIGNATURE`: `HMAC_SHA256(Body + Timestamp + Secret)`，確保資料在傳輸中沒有被竄改。





這對於理解為什麼要做「換碼 (入金)」和「結算 (出金)」非常關鍵。

1. 概念比喻：銀行 vs. 賭桌
想像 GameZoe 平台 是一間大型賭場飯店：

🧊 冷數據 (Cold Data) = 銀行保險庫 (Platform Database)
位置：平台的資料庫 (users.gold_balance)。
特性：
安全、權威：這裡是錢真的存在的地方，絕對不能算錯。
速度慢：每次存取都要開保險箱 (讀硬碟)，不適合每秒鐘頻繁操作。
用途：儲存玩家的「身家財產」。
🔥 熱數據 (Hot Data) = 賭桌上的籌碼 (Game Memory)
位置：遊戲伺服器的記憶體 (room.users[uid].score)。
特性：
極快：每秒鐘可能要加減分好幾次 (例如捕魚機一秒發射 5 發子彈)，完全在記憶體中運算。
易揮發：如果不結算，伺服器一斷電，桌上的籌碼可能就亂了或不見了 (雖然我們有寫 Log 補救)。
用途：應付遊戲中高頻率的輸贏計算。
2. 為什麼需要「入金」與「出金」？
因為銀行櫃檯 (冷) 跟不上 賭桌 (熱) 的輸贏速度。

如果捕魚機每發射一顆子彈 (0.1秒)，都要去通知銀行「扣 5 元」，銀行系統會立刻崩潰，或者玩家會覺得遊戲很卡。

所以我們採用 「換籌碼」 模式：

📥 入金 (Deposit)：冷 → 熱
玩家動作：在錢包點選「換 1000 點」。
流程：
銀行 (冷)：扣除玩家帳戶 $1000 元。
搬運工 (Bridge)：拿著收據跑去賭桌。
賭桌 (熱)：荷官給玩家 1000 分的籌碼 (Memory Score)。
結果：現在玩家可以在賭桌上瘋狂射擊，怎麼輸贏都只在記憶體裡變動，不影響銀行。
📤 出金 (Withdraw)：熱 → 冷
玩家動作：玩夠了，點選「結算離開」。
流程：
賭桌 (熱)：荷官清點玩家手上有 5000 分籌碼，將其收回 (Memory Score 歸零)。
搬運工 (Bridge)：拿著結算單跑回銀行。
銀行 (冷)：確認單據無誤，將 $5000 元存入玩家帳戶。
結果：錢安全地回到了資料庫。
