# SKILL: Admin 自動解鎖付費功能

> 適用於需要「管理員免付費使用」的付費服務/工具

---

## 概述

當一個服務需要付費才能使用特定功能時，管理員帳號應該能夠繞過付費限制，直接使用完整功能進行測試或內部作業。

**應用案例**：UniversalLoc AI 翻譯系統
- 一般用戶：需付費後才能使用「AI 智能提取術語」功能
- 管理員：自動解鎖，無需付費

---

## 實作架構

### 1. 用戶角色識別

GameZoe 平台的用戶資料會透過多種方式暴露給嵌入的遊戲/工具：

```typescript
// 取得當前用戶的多種方式（按優先順序）
const user = (window as any).currentUser ||                          // 直接存取
             (window as any).GameZoe?.currentUser ||                  // GameZoe 命名空間
             (window.parent !== window && (window.parent as any).currentUser) ||      // 父視窗（iframe）
             (window.parent !== window && (window.parent as any).GameZoe?.currentUser);

// 檢查是否為管理員
const isAdmin = user?.role === 'admin';
```

### 2. 資料庫結構

用戶角色存儲在 `users` 表的 `role` 欄位：

```sql
-- 查詢用戶角色
SELECT id, username, role FROM users WHERE id = 'xxx';

-- 設定用戶為管理員
UPDATE users SET role = 'admin' WHERE id = 'xxx';
```

**角色值**：
| 值 | 說明 |
|---|------|
| `user` | 一般用戶（預設）|
| `admin` | 管理員 |

---

## 關鍵實作點

### 問題：State 重置會覆蓋解鎖狀態

許多應用在用戶執行操作時會重置 state，這會覆蓋之前設定的解鎖狀態。

**典型場景**：用戶載入新檔案時重置配置

```typescript
// ❌ 錯誤：會覆蓋 Admin 的解鎖狀態
const handleFileLoaded = (file: File) => {
  setConfig({
    isPremiumUnlocked: false,  // 每次都重置為 false
    // ...其他設定
  });
};
```

### 解決方案：在每個重置點都檢查 Admin 狀態

```typescript
// ✅ 正確：在重置時也檢查 Admin 狀態
const handleFileLoaded = (file: File) => {
  const user = (window as any).currentUser ||
               (window as any).GameZoe?.currentUser ||
               (window.parent !== window && (window.parent as any).currentUser) ||
               (window.parent !== window && (window.parent as any).GameZoe?.currentUser);
  const isAdmin = user?.role === 'admin';

  setConfig({
    isPremiumUnlocked: isAdmin,  // 管理員保持解鎖，一般用戶重置
    internalAccessKey: isAdmin ? 'GAMELOC_INTERNAL_2025' : undefined,
    // ...其他設定
  });
};
```

### 初始化時的 Admin 檢測

應用啟動時也需要檢測 Admin 狀態，但因為用戶資料可能異步載入，需要多次重試：

```typescript
useEffect(() => {
  const checkAdminStatus = () => {
    const user = /* 取得用戶的多種方式 */;

    console.log('[App] Checking admin status:', user?.id, user?.role);

    if (user?.role === 'admin') {
      console.log('[App] Admin detected, auto-unlocking premium');
      setConfig(prev => ({
        ...prev,
        isPremiumUnlocked: true,
        internalAccessKey: 'GAMELOC_INTERNAL_2025'
      }));
    }
  };

  // 立即檢查 + 多次延遲重試（處理異步載入）
  checkAdminStatus();
  const timer1 = setTimeout(checkAdminStatus, 500);
  const timer2 = setTimeout(checkAdminStatus, 1500);
  const timer3 = setTimeout(checkAdminStatus, 3000);

  return () => {
    clearTimeout(timer1);
    clearTimeout(timer2);
    clearTimeout(timer3);
  };
}, []);
```

---

## 計費邏輯與 Admin 解鎖的關係

### 設計原則

| 情境 | 一般用戶 | 管理員 |
|------|---------|--------|
| 載入檔案 | `isPremiumUnlocked: false` | `isPremiumUnlocked: true` |
| 使用 AI 功能 | 需先付費 | 直接可用 |
| 付費後 | `isPremiumUnlocked: true` | 不適用 |
| 載入新檔案 | 重置為 `false`（需重新付費）| 保持 `true` |

### 為什麼一般用戶載入新檔案要重置？

翻譯系統是**按檔案/字數計費**：
1. 用戶付費翻譯檔案 A → 完成下載
2. 用戶載入檔案 B → **新的翻譯任務，需重新計費**

所以 `handleFileLoaded` 對一般用戶重置 `isPremiumUnlocked: false` 是正確的商業邏輯。

---

## UI 層的處理

在 UI 組件中，根據 `isPremiumUnlocked` 顯示不同狀態：

```tsx
// StepGlossary.tsx
<button
  onClick={isPremiumUnlocked ? handleDeepScan : undefined}
  disabled={isGenerating || !isPremiumUnlocked}
  className={`... ${
    !isPremiumUnlocked
      ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 cursor-not-allowed'  // 鎖定狀態
      : 'bg-gaming-accent/10 border-gaming-accent text-gaming-accent'              // 可用狀態
  }`}
>
  {!isPremiumUnlocked ? (
    <><i className="fas fa-lock"></i> AI 智能提取</>
  ) : (
    <><i className="fas fa-wand-magic-sparkles"></i> AI 智能提取</>
  )}
</button>
```

---

## 檔案參考

| 檔案 | 說明 |
|------|------|
| `games/universalloc-ai.../App.tsx` | Admin 檢測 useEffect + handleFileLoaded 修正 |
| `games/universalloc-ai.../components/StepGlossary.tsx` | UI 根據 isPremiumUnlocked 顯示鎖定/解鎖 |
| `server/index.js` | 後端 AI API 的 admin 繞過付款驗證 |
| `server/routes/users.js` | 後台用戶管理 API（設定 role） |

---

## 後端 API 的 Admin 繞過

前端解鎖 UI 後，後端 API 也需要允許 admin 繞過付款驗證：

```javascript
// server/index.js - /api/ai/generate 路由
const checkPayment = () => {
    return new Promise((resolve) => {
        // 先檢查是否為管理員
        db.get(
            `SELECT role FROM users WHERE id = ?`,
            [userId],
            (err, userRow) => {
                if (!err && userRow && userRow.role === 'admin') {
                    console.log(`[AI API] Admin user ${userId} - bypassing payment check`);
                    resolve(true);  // Admin 直接通過
                    return;
                }

                // 非管理員，繼續正常的付款驗證...
            }
        );
    });
};
```

**重要**：前端和後端都需要實作 admin 檢查，否則：
- 只有前端：UI 解鎖但 API 會返回 403
- 只有後端：API 通過但 UI 仍然鎖定

---

## Checklist：新增 Admin 解鎖功能

當為新服務加入「管理員免費使用」功能時：

- [ ] 確認資料庫 users 表有 `role` 欄位
- [ ] 在應用初始化時加入 Admin 檢測 useEffect
- [ ] 找出所有會重置付費狀態的地方（如 handleFileLoaded）
- [ ] 在每個重置點加入 Admin 檢測邏輯
- [ ] UI 層根據解鎖狀態顯示不同樣式
- [ ] 測試：用管理員帳號登入 → 載入檔案 → 確認功能可用

---

## 除錯技巧

在 Console 查看 Admin 檢測狀態：

```javascript
// 檢查當前用戶資料
console.log(window.currentUser);
console.log(window.GameZoe?.currentUser);

// 在 iframe 中檢查父視窗
console.log(window.parent.currentUser);
console.log(window.parent.GameZoe?.currentUser);
```

預期 Admin 帳號會看到：
```
[UniversalLoc] Checking admin status, user: 102746929077306565219 role: admin
[UniversalLoc] Admin detected, auto-unlocking premium
```
