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

