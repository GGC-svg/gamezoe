package controllers

import (
	"encoding/json"
	"github.com/astaxie/beego/logs"
	"net/http"
)

func GetUserStatus(w http.ResponseWriter, r *http.Request) {
	defer func() {
		if r := recover(); r != nil {
			logs.Error("GetUserInfo panic:%v ", r)
		}
	}()
	//logs.Debug("new request url:[%s]",r.URL)
	account := r.FormValue("account")
	if len(account) == 0 {
		return
	}
	token := r.FormValue("sign")
	if len(token) == 0 {
		return
	}
	ret := map[string]interface{}{
		"errcode": 1,
		"errmsg":  "failed",
	}
	// Mock user status - skip RPC call
	ret = map[string]interface{}{
		"errcode": 0,
		"errmsg":  "ok",
		"gems":    10000, // Mock gems value
	}
	defer func() {
		data, err := json.Marshal(ret)
		if err != nil {
			logs.Error("json marsha1 failed err:%v", err)
			return
		}
		w.Header().Set("Access-Control-Allow-Origin", "*")
		if _, err := w.Write(data); err != nil {
			logs.Error("CreateRoom err: %v", err)
		}
	}()
}
