package controllers

import (
	"encoding/json"
	"github.com/astaxie/beego/logs"
	"net/http"
	"strconv"
	"time"
)

// SimpleAdminLogin 简单的管理员登录，不依赖RPC
func SimpleAdminLogin(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if r := recover(); r != nil {
			logs.Error("SimpleAdminLogin panic:%v ", r)
		}
	}()

	username := r.FormValue("username")
	password := r.FormValue("password")
	
	logs.Info("SimpleAdminLogin attempt: username=%s", username)
	
	// 简单的admin账号验证
	if username != "admin" || password != "admin123" {
		logs.Info("SimpleAdminLogin failed: invalid credentials")
		ret := map[string]interface{}{
			"errcode": 1,
			"errmsg":  "用户名或密码错误",
		}
		writeSimpleResponse(w, ret)
		return
	}

	// 生成简单的token
	token := "admin_token_" + strconv.FormatInt(time.Now().Unix(), 10)
	
	logs.Info("SimpleAdminLogin success")
	ret := map[string]interface{}{
		"errcode": 0,
		"errmsg":  "登录成功",
		"account": "admin",
		"sign":    token,
		"userid":  1,
		"name":    "admin",
		"headimg": "1",
		"lv":      99,
		"exp":     999999,
		"coins":   1000000,
		"vip":     7,
		"money":   1000000,
		"gems":    1000000,
		"sex":     1,
	}
	writeSimpleResponse(w, ret)
}

func writeSimpleResponse(w http.ResponseWriter, ret map[string]interface{}) {
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