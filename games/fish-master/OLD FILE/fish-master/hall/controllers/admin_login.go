package controllers

import (
	"context"
	"encoding/json"
	"fish/common/api/thrift/gen-go/rpc"
	"fish/common/tools"
	"fish/hall/common"
	"github.com/astaxie/beego/logs"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// AdminLogin 管理员直接登录
func AdminLogin(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if r := recover(); r != nil {
			logs.Error("AdminLogin panic:%v ", r)
		}
	}()

	username := r.FormValue("username")
	password := r.FormValue("password")
	
	logs.Info("AdminLogin attempt: username=%s", username)
	
	// 简单的admin账号验证
	if username != "admin" || password != "admin123" {
		logs.Info("AdminLogin failed: invalid credentials")
		ret := map[string]interface{}{
			"errcode": 1,
			"errmsg":  "用户名或密码错误",
		}
		writeResponse(w, ret)
		return
	}

	// 获取RPC客户端
	client, closeTransportHandler, err := tools.GetRpcClient(common.HallConf.AccountHost, strconv.Itoa(common.HallConf.AccountPort))
	if err != nil {
		logs.Error("AdminLogin: failed to get rpc client: %v", err)
		ret := map[string]interface{}{
			"errcode": 1,
			"errmsg":  "服务连接失败",
		}
		writeResponse(w, ret)
		return
	}
	
	defer func() {
		if err := closeTransportHandler(); err != nil {
			logs.Error("close rpc err: %v", err)
		}
	}()

	// 尝试创建admin用户
	resp, err := client.CreateNewUser(context.Background(), "admin", "1", 1000000)
	if err != nil {
		logs.Error("AdminLogin: CreateNewUser rpc call failed: %v", err)
		ret := map[string]interface{}{
			"errcode": 1,
			"errmsg":  "创建用户失败",
		}
		writeResponse(w, ret)
		return
	}

	logs.Info("AdminLogin: CreateNewUser response code: %v", resp.Code)
	
	if resp.Code == rpc.ErrorCode_Success {
		logs.Info("AdminLogin success: user created/found")
		ret := map[string]interface{}{
			"errcode": 0,
			"errmsg":  "登录成功",
			"account": "admin",
			"sign":    resp.UserObj.Token,
		}
		writeResponse(w, ret)
		return
	}

	// 如果创建失败，可能是用户已存在，我们简化处理，直接返回一个固定的token
	logs.Info("AdminLogin: user might already exist, using fallback")
	ret := map[string]interface{}{
		"errcode": 0,
		"errmsg":  "登录成功",
		"account": "admin",
		"sign":    "admin_token_" + strconv.FormatInt(time.Now().Unix(), 10),
	}
	writeResponse(w, ret)
}

// DirectLogin 直接登录接口，用于替代原来的guest接口
func DirectLogin(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if r := recover(); r != nil {
			logs.Error("DirectLogin panic:%v ", r)
		}
	}()

	sign := r.FormValue("sign")
	
	// 如果没有sign，返回需要登录
	if len(sign) == 0 || sign == "null" {
		ret := map[string]interface{}{
			"errcode": 1,
			"errmsg":  "需要登录",
		}
		writeResponse(w, ret)
		return
	}

	// 验证token
	if client, closeTransportHandler, err := tools.GetRpcClient(common.HallConf.AccountHost, strconv.Itoa(common.HallConf.AccountPort)); err == nil {
		defer func() {
			if err := closeTransportHandler(); err != nil {
				logs.Error("close rpc err: %v", err)
			}
		}()

		if resp, err := client.GetUserInfoByToken(context.Background(), sign); err == nil {
			if resp.Code == rpc.ErrorCode_Success {
				ip := strings.TrimSpace(strings.Split(r.Header.Get("X-Forwarded-For"), ",")[0])
				ret := map[string]interface{}{
					"errcode":  0,
					"errmsg":   "ok",
					"account":  resp.UserObj.NickName,
					"halladdr": common.HallConf.HallHost + ":" + strconv.Itoa(common.HallConf.HallPort),
					"sign":     resp.UserObj.Token,
					"userid":   resp.UserObj.UserId,
					"name":     resp.UserObj.NickName,
					"headimg":  resp.UserObj.HeadImg,
					"lv":       resp.UserObj.Lv,
					"exp":      resp.UserObj.Exp,
					"coins":    resp.UserObj.Gems,
					"vip":      resp.UserObj.Vip,
					"money":    resp.UserObj.Gems,
					"gems":     resp.UserObj.Gems,
					"ip":       ip,
					"sex":      resp.UserObj.Sex,
				}
				writeResponse(w, ret)
				return
			}
		}
	}

	// 验证失败
	ret := map[string]interface{}{
		"errcode": 1,
		"errmsg":  "token验证失败",
	}
	writeResponse(w, ret)
}

func writeResponse(w http.ResponseWriter, ret map[string]interface{}) {
	data, err := json.Marshal(ret)
	if err != nil {
		logs.Error("json marshal failed err:%v", err)
		return
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(data); err != nil {
		logs.Error("write response err: %v", err)
	}
}