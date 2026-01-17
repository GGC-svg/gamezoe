# SKILL: UniversalLoc AI - 全領域專家級翻譯神器

> 遊戲本地化翻譯系統的完整技術文檔

---

## 專案概述

**路徑**: `games/universalloc-ai---全領域專家級翻譯神器/`

這是一個基於 Gemini AI 的遊戲本地化翻譯系統，支援多語言批次翻譯、術語管理、長度控制等專業功能。

| 組件 | 說明 |
|------|------|
| **前端** | Next.js + React + TypeScript |
| **AI 引擎** | Google Gemini 2.0 Flash |
| **API 代理** | Backend Proxy (`/api/ai/generate`) |
| **計費系統** | 按字數計費 + 免費試用額度 |

---

## 系統架構

### 關鍵檔案

| 檔案 | 說明 |
|------|------|
| `services/geminiService.ts` | AI 翻譯核心，包含一致性協議、壓縮協議 |
| `components/StepProcess.tsx` | 批次處理邏輯，兩階段處理確保詞彙一致 |
| `components/StepGlossary.tsx` | 術語表管理 |
| `services/billingService.ts` | 計費服務 |
| `pages/api/ai/generate.ts` | Backend Proxy，處理 API Key 和用量追蹤 |

### 處理流程

```
用戶上傳 Excel
    ↓
StepUpload.tsx (解析檔案)
    ↓
StepGlossary.tsx (術語提取/管理)
    ↓
StepProcess.tsx (批次翻譯)
    ├── Phase 1: 第一批次單獨處理，鎖定詞彙
    └── Phase 2: 剩餘批次並行處理
    ↓
匯出翻譯結果 Excel
```

---

## 一致性協議

### 問題背景

AI 模型預設傾向於「多樣性」，會在翻譯時使用不同的同義詞，例如：
- "Floor 1" → "Piso 1"
- "Floor 2" → "Andar 2" (不一致！)

這在遊戲 UI 列表中是災難性的問題。

### 解決方案

#### 1. Batch Consistency Protocol (geminiService.ts)

```typescript
[BATCH CONSISTENCY PROTOCOL - STRICT]
1. SCAN THE ENTIRE BATCH before translating. If multiple rows share
   a structure (e.g. "Stage 1", "Stage 2"), you MUST use the IDENTICAL
   vocabulary for the common parts.
2. DO NOT switch synonyms for variety. For UI lists, consistency > creativity.
3. Pick ONE term and use it consistently throughout the entire batch.
```

#### 2. Dynamic Vocabulary (Memory Chain)

每個批次返回 `termDecisions`，記錄 AI 的翻譯決策：

```typescript
{
  termDecisions: [
    { source: "Floor", target: "Piso" },
    { source: "Stage", target: "Etapa" }
  ],
  detectedPattern: "Name - Floor X"
}
```

後續批次會收到這些已鎖定的詞彙，強制使用相同翻譯。

#### 3. 兩階段處理 (StepProcess.tsx)

**修復日期**: 2026/01/17

**問題**: `CONCURRENT_REQUESTS = 3` 導致 3 個批次同時處理，都拿到空的詞彙表，各自決定不同翻譯。

**解決方案**: 兩階段處理

```typescript
// Phase 1: 第一批次單獨處理，鎖定詞彙
if (allBatches.length > 0) {
  const firstBatch = allBatches[0];
  const res = await translateBatch(firstBatch, ...);

  // 立即鎖定詞彙（在並行處理前）
  if (res.termDecisions) {
    Object.assign(currentLangVocab, res.termDecisions);
  }
  if (res.detectedPattern) {
    currentPattern = res.detectedPattern;
  }
}

// Phase 2: 剩餘批次並行處理（帶鎖定詞彙）
const remainingBatches = allBatches.slice(1);
// 並行處理，但都帶著已鎖定的 currentLangVocab
```

#### 4. Temperature 設定

```typescript
temperature: 0.3  // 降低隨機性，提高一致性
```

---

## 長度壓縮協議

### Universal Tiered Compression Protocol

當翻譯超過 `maxLen` 限制時，依序套用壓縮等級：

| Level | 策略 | 範例 |
|-------|------|------|
| L1 | 移除冠詞、助詞 | "the attack" → "attack" |
| L2 | 標準縮寫 | "Level" → "Lv.", "Experience" → "Exp." |
| L3 | 極限壓縮 | "Press Button to Start" → "Start" |
| L4 | 優雅降級 | 保持可讀性，標記 `isOverLimit: true` |

---

## 管理員權限系統

### 功能說明

管理員帳號可以跳過付費限制，無限使用翻譯功能。

**開發日期**: 2026/01/17

### 實作方式

#### 1. 內部密鑰驗證 (StepProcess.tsx)

```typescript
const INTERNAL_SECRET = "GAMELOC_INTERNAL_2025";
const isUnlocked = config.isPremiumUnlocked || config.internalAccessKey === INTERNAL_SECRET;
```

#### 2. 管理員檢測 (前端)

```typescript
// 檢查 window.currentUser.role
const isAdmin = window.currentUser?.role === 'admin';
if (isAdmin) {
  config.internalAccessKey = INTERNAL_SECRET;
}
```

#### 3. 後端驗證 (pages/api/ai/generate.ts)

```typescript
// 檢查用戶角色
const user = await getUserById(userId);
if (user?.role === 'admin') {
  // 跳過計費檢查
  allowRequest = true;
}
```

### 管理員帳號設定

在 GameZoe 資料庫中設定用戶角色：

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## API 配置

### Backend Proxy

前端不直接呼叫 Gemini API，而是透過 Backend Proxy：

```typescript
// 前端呼叫
const res = await fetch('/api/ai/generate', {
  method: 'POST',
  body: JSON.stringify({
    userId,
    model: "gemini-2.0-flash",
    contents: "...",
    config: { systemInstruction, temperature: 0.3, ... }
  })
});
```

### 環境變數

```env
# .env.local
GEMINI_API_KEY=your_api_key_here
```

### 計費機制

| 項目 | 說明 |
|------|------|
| 免費額度 | 每 Session 500 字 |
| 付費方案 | 按訂單購買字數額度 |
| 管理員 | 無限使用 |

---

## 部署流程

### 本機開發

```bash
cd games/universalloc-ai---全領域專家級翻譯神器

# 安裝依賴
npm install

# 開發模式
npm run dev

# 建置
npm run build
```

### 部署到 Server

UniversalLoc AI 是 GameZoe 專案的一部分，透過主專案一起部署：

```bash
# 本機
cd /e/Steam/gamezoe
npm run build
git add -f dist/
git commit -m "Build: UniversalLoc AI update"
git push origin master

# Server
cd ~/gamezoe && git fetch origin && git reset --hard origin/master && pm2 restart all
```

---

## 已知問題與修復記錄

### 2026/01/17 - 並行處理導致詞彙不一致

**問題**: `CONCURRENT_REQUESTS = 3` 導致多個批次同時處理，各自決定不同的翻譯詞彙。

**症狀**: "Floor" 在同一檔案中被翻譯為 "Piso"、"Andar"、"Nivel" 等不同詞彙。

**解決**: 實作兩階段處理
- Phase 1: 第一批次單獨處理，鎖定詞彙和模式
- Phase 2: 剩餘批次並行處理，使用已鎖定的詞彙

**修改檔案**: `components/StepProcess.tsx`

---

## 常見問題

### Q: 翻譯結果仍然不一致？

**A**: 檢查 Console 日誌：
```
[Phase1] Locked 3 terms for pt-BR
[Phase1] Locked pattern for pt-BR: "Name - Floor X"
```
如果沒有看到這些日誌，表示 Phase 1 可能失敗。

### Q: 翻譯超過長度限制？

**A**: 系統會自動標記 `isOverLimit: true`，匯出 Excel 後可篩選 `[LENGTH_OVER]` 欄位進行人工審閱。

### Q: 管理員權限不生效？

**A**: 確認：
1. 用戶的 `role` 欄位設為 `'admin'`
2. `window.currentUser` 有正確載入
3. Backend API 有檢查角色

### Q: API 呼叫失敗？

**A**: 檢查：
1. `GEMINI_API_KEY` 環境變數是否設定
2. 用戶是否有足夠額度
3. 網路連線是否正常

---

## 相關檔案

| 檔案 | 說明 |
|------|------|
| `types.ts` | TypeScript 型別定義 |
| `services/excelService.ts` | Excel 匯入匯出 |
| `pages/index.tsx` | 主頁面入口 |
| `tailwind.config.js` | UI 樣式配置 |

---

## 技術規格

| 項目 | 規格 |
|------|------|
| AI 模型 | Gemini 2.0 Flash |
| Temperature | 0.3 (低隨機性) |
| 批次大小 | 20 條/批 |
| 並行數 | 3 (Phase 2) |
| 支援語言 | 15+ 語言 |
