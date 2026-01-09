# 📘 旧代码快速分析工作流程

> **目的：** 标准化旧代码分析流程，快速建立System Specification
> 
> **适用场景：** 任何需要参考旧代码进行新项目开发的情况

---

## 🎯 核心原则

1. **先找常量** - 游戏平衡的基础
2. **后找流程** - 核心逻辑的实现
3. **再找特殊** - 边界条件和特殊机制
4. **最后验证** - 与现有代码对比

---

## 📋 标准分析流程 (5步法)

### Step 1: 找到常量定义文件 (15分钟)

**目标：** 提取所有游戏平衡相关的数值

**操作：**
```bash
# 1. 搜索关键词
grep -r "const\|var\|map\[" --include="*define*" --include="*config*" 

# 2. 查找文件
find . -name "*define*" -o -name "*config*" -o -name "*constant*"
```

**提取内容：**
- [ ] 倍数数组 (FishMulti, BulletMulti等)
- [ ] Timer配置 (spawn间隔)
- [ ] 房间配置 (baseScore等)
- [ ] 其他常量

**输出：** `CONSTANTS.md`

---

### Step 2: 绘制核心流程图 (30分钟)

**目标：** 理解主要游戏循环

**操作：**
```bash
# 查找主要事件handler
grep -r "case\|on\(" --include="*.go" --include="*.js"
```

**关键流程：**
1. **初始化流程：** Login → Ready → BuildFishTrace
2. **游戏循环：** Fire → Catch → Score → Broadcast
3. **清理流程：** Disconnect → Save → Cleanup

**输出：** 使用mermaid绘制流程图

---

### Step 3: 提取关键函数签名 (20分钟)

**目标：** 记录所有核心函数的输入输出

**模板：**
```markdown
## 函数名: Fire

**输入：**
- bullet: Bullet对象
  - bulletKind: int
  - bulletId: string
  - userId: string

**输出：**
- 广播: user_fire_Reply

**副作用：**
- 扣除score
- 累积power
- 添加到aliveBullets

**特殊逻辑：**
- bulletKind==22时不扣分（激光炮）
```

**输出：** `FUNCTION_SIGNATURES.md`

---

### Step 4: 识别特殊机制 (25分钟)

**目标：** 找到所有if/switch分支

**操作：**
```bash
# 搜索特殊处理
grep -r "if.*Kind\|switch.*Kind" --include="*.go"
```

**检查清单：**
- [ ] 特殊鱼类型 (炸弹、同类等)
- [ ] 特殊子弹 (激光炮等)
- [ ] 特殊道具 (冰冻等)
- [ ] 边界条件 (余额不足、房间满等)

**输出：** `SPECIAL_MECHANICS.md`

---

### Step 5: 创建对比表 (10分钟)

**目标：** 快速识别差异

**模板：**
```markdown
| 功能 | 旧代码位置 | 新代码位置 | 状态 | 差异 |
|------|-----------|-----------|------|------|
| FishMulti | define.go:70 | fish_mocker.js:18 | ✅ | 完全匹配 |
| Power系统 | client.go:251 | - | ❌ | 缺失 |
```

**输出：** `COMPARISON.md`

---

## 🤖 与AI协作的标准化提示词

### 提示词模板 1: 快速提取常量

```
请分析文件 [文件路径]，提取以下信息：

1. 所有常量定义（const/var/map）
2. 创建表格，格式：
   | 常量名 | 值 | 用途 | 位置 |
3. 特别关注游戏平衡相关的数值
4. 输出为markdown格式

输出文件名：CONSTANTS.md
```

### 提示词模板 2: 绘制流程图

```
请分析以下代码文件:
[列出主要文件]

创建mermaid流程图，展示：
1. 初始化流程
2. 主游戏循环
3. 关键事件触发链

格式要求：
- 使用graph TD
- 标注关键函数名
- 显示数据流向

输出文件名：FLOW_DIAGRAM.md
```

### 提示词模板 3: 函数签名提取

```
请为以下函数创建详细签名文档:
[列出函数名或文件]

每个函数包含：
- 输入参数及类型
- 输出返回值
- 副作用
- 特殊逻辑分支

格式：使用之前定义的模板

输出文件名：FUNCTION_SIGNATURES.md
```

### 提示词模板 4: 差异对比

```
请对比以下两个实现:

旧代码: [文件路径]
新代码: [文件路径]

创建对比表，标注：
- ✅ 完全匹配
- ⚠️ 部分匹配（说明差异）
- ❌ 缺失
- 🔴 错误值

按优先级排序（P0/P1/P2）

输出文件名：COMPARISON.md
```

---

## 📁 标准文档结构

完成分析后应该有以下文档：

```
project/
├── SYSTEM_SPEC.md          # 主文档（汇总）
├── analysis/
│   ├── CONSTANTS.md        # 常量定义
│   ├── FLOW_DIAGRAM.md     # 流程图
│   ├── FUNCTION_SIGNATURES.md  # 函数签名
│   ├── SPECIAL_MECHANICS.md    # 特殊机制
│   └── COMPARISON.md       # 对比表
└── legacy_code/
    └── [原始代码位置]
```

---

## ⚡ 快速分析检查清单

**开始前 (5分钟):**
- [ ] 确认旧代码位置
- [ ] 创建analysis文件夹
- [ ] 准备模板文件

**分析中 (90分钟):**
- [ ] Step 1: 提取常量 (15分钟)
- [ ] Step 2: 绘制流程图 (30分钟)
- [ ] Step 3: 函数签名 (20分钟)
- [ ] Step 4: 特殊机制 (25分钟)

**收尾 (10分钟):**
- [ ] Step 5: 创建对比表
- [ ] 汇总到SYSTEM_SPEC.md
- [ ] 标记优先级

**总计：** ~100分钟完成完整分析

---

## 🎓 实战示例：本次Fish游戏分析

### 我们做对的部分 ✅

1. **找到了define.go** - 获得所有常量
2. **对比了FishMulti** - 验证正确性
3. **读取了client.go** - 理解核心逻辑

### 可以改进的部分 ⚠️

1. **应该先创建CONSTANTS.md** - 避免重复查找
2. **应该先画流程图** - 理解整体再看细节
3. **应该用标准模板** - 提高效率

---

## 🔄 未来使用此流程

**场景：** 需要参考另一个旧项目的代码

**步骤：**

1. **告诉AI使用标准流程**
   ```
   我需要分析 [项目名] 的旧代码。
   请使用"旧代码快速分析工作流程"。
   旧代码位置: [路径]
   ```

2. **AI会按5步法执行**
   - 自动搜索关键文件
   - 使用模板提取信息
   - 创建标准文档
   - 生成对比表

3. **100分钟内获得完整分析**
   - CONSTANTS.md
   - FLOW_DIAGRAM.md
   - FUNCTION_SIGNATURES.md
   - SPECIAL_MECHANICS.md
   - COMPARISON.md

4. **立即开始开发**
   - 参照COMPARISON.md修复差异
   - 查看SYSTEM_SPEC.md理解全局
   - 遇到问题查FUNCTION_SIGNATURES.md

---

## 💡 关键技巧

### 1. 优先级判断

**影响游戏平衡 = P0**
- 常量错误（FishMulti, BulletMulti）
- 分数计算错误

**影响核心功能 = P1**
- 特殊鱼逻辑缺失
- Power系统缺失

**影响体验 = P2**
- 道具系统
- UI细节

### 2. 快速验证

**常量验证：**
```javascript
// 对比工具
const goConstants = {...};
const jsConstants = {...};
Object.keys(goConstants).forEach(key => {
    if (goConstants[key] !== jsConstants[key]) {
        console.log(`差异: ${key}`);
    }
});
```

**流程验证：**
- 在关键位置打log
- 对比执行顺序

---

## 📊 成果衡量

**好的分析应该：**
- ✅ 100分钟内完成
- ✅ 所有常量都有文档
- ✅ 核心流程有图表
- ✅ 差异有优先级
- ✅ 可以直接指导开发

**避免：**
- ❌ 漫无目的地读代码
- ❌ 重复查找同样的东西
- ❌ 没有记录发现
- ❌ 缺少对比验证
