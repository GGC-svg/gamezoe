# 登录系统使用指南

## 概述
已成功移除QQ登录功能，现在支持以下登录方式：

## 登录方式

### 1. 管理员登录
- **接口**: `POST /admin/login`
- **用户名**: `admin`
- **密码**: `admin123`
- **参数**:
  - `username`: 用户名
  - `password`: 密码

**示例请求**:
```bash
curl -X POST http://localhost:8080/admin/login \
  -d "username=admin&password=admin123"
```

**返回格式**:
```json
{
  "errcode": 0,
  "errmsg": "登录成功",
  "account": "admin",
  "sign": "用户token"
}
```

### 2. 游客登录
- **接口**: `POST /guest`
- **说明**: 自动创建随机游客账号并登录
- **无需参数**

**示例请求**:
```bash
curl -X POST http://localhost:8080/guest
```

**返回格式**:
```json
{
  "errcode": 0,
  "errmsg": "ok",
  "account": "随机生成的游客名",
  "halladdr": "服务器地址:端口",
  "sign": "用户token"
}
```

### 3. 普通登录验证
- **接口**: `POST /login`
- **说明**: 使用已有的token验证登录状态
- **参数**:
  - `account`: 账号名
  - `sign`: 用户token

## 测试页面
访问 `http://localhost:8080/static/admin_login.html` 可以使用网页界面进行登录测试。

## 已移除的功能
- QQ OAuth登录 (`/qq/login`)
- QQ登录回调 (`/qq/message`)
- 相关的QQ登录控制器文件

## 服务依赖说明
- **管理员登录**: 现在使用简化版本，不依赖account RPC服务
- **游客登录**: 需要account RPC服务运行在4000端口

## 启动服务
如果需要完整功能（包括游客登录），需要先启动account服务：
```bash
# 在项目根目录
./account_exec
# 然后在另一个终端启动hall服务
./hall_exec
```

## 注意事项
1. 管理员账号的用户名和密码是硬编码的，生产环境中应该使用更安全的认证方式
2. 游客登录会自动创建新用户，每次调用都会生成不同的随机用户名
3. 所有接口都支持CORS，返回 `Access-Control-Allow-Origin: *` 头部
4. 如果account服务未启动，管理员登录仍然可以工作，但游客登录会失败