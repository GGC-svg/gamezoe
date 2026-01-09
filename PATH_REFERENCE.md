# 📁 项目路径快速参考

## 🎯 关键路径一览

### GO原始代码（权威参考）✅
**路径：** `E:\Steam\gamezoe\games\fish-master\OLD FILE\fish-master`

**重要文件：**
```
game/service/
├── define.go       - 常量定义 (FishMulti, BulletMulti)
├── fish_utils.go   - BuildFishTrace, IsHit
├── client.go       - Fire, catchFish, Power, Bill
├── request.go      - WebSocket handlers
└── room.go         - 房间管理, 特殊鱼
```

### Node.js实现（当前项目）✅
**路径：** `E:\Steam\gamezoe`

**核心文件：**
```
server/
├── fish_mocker.js  - 主服务器（所有GO逻辑的Node.js实现）
├── index.js        - HTTP服务器
└── gamezoe.db      - SQLite数据库

games/fish/         - CLIENT端代码（编译运行在这里）
└── src/

通用文档/
├── LEGACY_CODE_WORKFLOW.md  - 分析旧代码方法论
├── AI_PROMPTS_REFERENCE.md  - 快速提示词
└── DATA_FORMAT_SPEC.md      - 数据格式规范
```

### CLIENT代码（Flash/JS编译）
**编译位置：** `E:\Steam\gamezoe\games\fish`
**运行位置：** `http://localhost:3000`

---

## 🔍 常用操作

### 查找GO参考代码
```bash
# 搜索函数
grep -r "func Fire" "E:\Steam\gamezoe\games\fish-master\OLD FILE\fish-master"

# 查看常量
cat "E:\Steam\gamezoe\games\fish-master\OLD FILE\fish-master\game\service\define.go"
```

### 修改服务器代码
```bash
# 编辑主文件
code "E:\Steam\gamezoe\server\fish_mocker.js"

# 重启服务
npm run dev
```

### 查看CLIENT代码
```bash
# CLIENT源码
cd "E:\Steam\gamezoe\games\fish"
```

---

## ⚠️ 重要提醒

1. **GO代码只用于参考** - 不要修改 `OLD FILE` 中的代码
2. **所有修改都在 `server/fish_mocker.js`**
3. **CLIENT代码在 `games/fish`**（单独目录）
4. **文档在项目根目录**（可复用到其他游戏）

---

## 📝 路径别名（方便沟通）

| 别名 | 实际路径 |
|------|---------|
| GO原码 | `E:\Steam\gamezoe\games\fish-master\OLD FILE\fish-master` |
| 服务器 | `E:\Steam\gamezoe\server\fish_mocker.js` |
| CLIENT | `E:\Steam\gamezoe\games\fish` |
| 文档 | `E:\Steam\gamezoe\*.md` |
| 数据库 | `E:\Steam\gamezoe\server\gamezoe.db` |
