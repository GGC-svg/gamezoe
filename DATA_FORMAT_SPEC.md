# 🔢 数据格式规范

> **目的：** 防止反复出现的格式错误
> 
> **优先级：** 🔴 P0 - 极高

---

## ⚠️ 关键问题

### 1. userId - 必须用string

```javascript
// ✅ 正确
const userId = String(data.userId);

// ❌ 错误 - 大数字丢失精度
const userId = Number(data.userId);
```

### 2. score - 保留小数

```javascript
// ✅ 正确 - 不Math.round
db.run("UPDATE users SET fish_balance = ?", [score]);

// ❌ 错误 - 删除小数
const balance = Math.round(score);
```

### 3. chairId - 转换索引

```javascript
// ✅ 发给CLIENT: +1
const chairId = user.seatIndex + 1;  // 0→1

// ✅ 接收CLIENT: -1
const seatIndex = data.chairId - 1;  // 1→0
```

---

## 📋 标准类型表

| 字段 | 类型 | 示例 | 备注 |
|------|------|------|------|
| userId | `string` | "102746929077306565219" | 不能用number |
| chairId | `number` | 1-4 | CLIENT 1-indexed |
| seatIndex | `number` | 0-3 | SERVER 0-indexed |
| score | `number` | 30000.75 | 元*1000，保留小数 |
| fishId | `string` | "123,456" | 可能逗号分隔 |
| bulletId | `string` | "1_324965" | `{chairId}_{序号}` |

---

## 🚨 禁止模式

```javascript
// ❌ userId转number
const userId = Number(data.userId);

// ❌ score用Math.round
const balance = Math.round(score);

// ❌ chairId不转换
emit('event', { chairId: user.seatIndex });
```

---

## ✅ 必须模式

```javascript
// ✅ userId
const userId = String(data.userId);

// ✅ score
const balance = score;  // 直接保存

// ✅ chairId
emit('event', { chairId: user.seatIndex + 1 });
```

---

## 🔧 数据库Schema

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,           -- userId (string)
    fish_balance REAL DEFAULT 0,   -- 分 (保留小数)
    gold_balance INTEGER DEFAULT 0 -- 元 (整数)
);
```

---

## 💡 调试技巧

```javascript
console.log(`userId type: ${typeof userId}`);
console.log(`score: ${score}, isInteger: ${Number.isInteger(score)}`);
console.log(`chairId: ${chairId}, seatIndex: ${seatIndex}`);
```

---

## 📝 Code Review规则

遇到以下立即拒绝：
- `Number(userId)`
- `Math.round(score)`
- `chairId: user.seatIndex` (发给CLIENT时)
- `score / 1000` (单位转换硬编码)
