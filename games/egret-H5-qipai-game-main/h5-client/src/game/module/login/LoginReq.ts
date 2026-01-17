class LoginReq {
	private static c2s_login_ReqHeartbeat_msg = 1;                 //[心跳]
	private static c2s_login_ReqTouristLogin_msg = 101;            //[游客登录]
	private static c2s_login_ReqGetLoginSms_msg = 102;             //[获取登录验证码]
	private static c2s_login_ReqLoginBySmsCode_msg = 103;          //[短信登录]
	private static c2s_login_ReqReLogin_msg = 106;                 //[断线重连]
	private static c2s_login_ReqReqLoginFromWechat_msg = 113;      //[微信登录]
	private static c2s_login_REqLogout_msg = 105;

	public static send_reLogin(relogincode: string, loginType: number, byHand: number, method: any, methodObj: any): void {
		let body = {
			"id": LoginReq.c2s_login_ReqReLogin_msg,
			"byHand": byHand,
			"code": relogincode,
			"type": loginType,
			"platform": 0
		}
		App.Socket.send(body, function (msgid, msg) {
			if (msgid == body.id) {
				egret.localStorage.setItem('reloginType', loginType + '');
			} else {
				GameApp.PlayerInfo.updateLoginState(false);
				egret.localStorage.removeItem('reloginCode');
				egret.localStorage.removeItem('reloginType');
				LoginMgr.start();
			}
			method.apply(methodObj, [msgid == body.id, msg]);
		}, this);
	}

	public static send_loginBySmsCode(phone: string, code: string, method: any, methodObj: any): void {
		let body = {
			"id": LoginReq.c2s_login_ReqLoginBySmsCode_msg,
			"smsCode": code,
			"phone": phone,
		}
		App.Socket.send(body, function (msgid, msg) {
			method.apply(methodObj, [msgid == body.id, msg]);
		}, this);
	}

	public static send_loginByTourist(method: any, methodObj: any, platformCode?: string): void {
		let body: any = {
			"id": LoginReq.c2s_login_ReqTouristLogin_msg,
			"platform": 2  // 2 = PC/Web
		};
		// 如果有平台用戶 ID，使用它作為遊客唯一標識（綁定平台帳號與遊戲帳號）
		if (platformCode) {
			body.code = "GZ_" + platformCode;  // 加上 GZ_ 前綴區分平台用戶
			console.log('[LoginReq] Platform tourist login with code:', body.code);
		}
		App.Socket.send(body, function (msgid, msg) {
			method.apply(methodObj, [msgid == body.id, msg]);
		}, this);
	}

	public static send_logout(method: any, methodObj: any): void {
		let body = {
			"id": LoginReq.c2s_login_REqLogout_msg
		}
		App.Socket.send(body, function (msgid, msg) {
			method.apply(methodObj, [msgid == body.id, msg]);
		}, this);
	}
}