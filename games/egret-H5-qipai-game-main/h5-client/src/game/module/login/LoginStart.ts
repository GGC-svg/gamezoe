class LoginStart {

	public start(): void {
		GameApp.PlayerInfo.curGameID = null;
		if (LoginMgr.isLoading) {
			this.initModule();
			App.SceneManager.runScene(SceneConsts.Login);

			// === GameZoe 平台登入檢查 ===
			// 優先檢查 URL 參數（iframe 模式，由 GamePlayer.tsx 傳入）
			const urlParams1 = new URLSearchParams(window.location.search);
			const urlUserId1 = urlParams1.get('userId');
			if (urlUserId1 && !GameApp.PlayerInfo.isLogin) {
				console.log('[LoginStart] Platform user detected from URL params in start():', urlUserId1);
				this.connectServerWithPlatformLogin({ id: urlUserId1, name: '玩家' });
				return;
			}
			// 其次檢查 window.currentUser（直接訪問模式）
			let platformUser = window['currentUser'] || (window['GameZoe'] && window['GameZoe'].currentUser);
			if (platformUser && platformUser.id && !GameApp.PlayerInfo.isLogin) {
				console.log('[LoginStart] Platform user detected in start(), auto-login...');
				this.connectServerWithPlatformLogin(platformUser);
				return;
			}
			// === 結束平台登入檢查 ===

			// 已经登录或者不显示登录页，打开大厅页面
			if (GameApp.PlayerInfo.isLogin) {
				App.ViewManager.open(ViewConst.Home);
			} else {
				App.ViewManager.open(ViewConst.Login);
			}
		} else {
			this.runLoading();
			// 加载公共资源配置文件
			App.ResourceUtils.addConfig('resource/resource_core.json', 'resource/');
			App.ResourceUtils.addConfig('resource/proto/proto.res.json', 'resource/');
			App.ResourceUtils.loadConfig(this.onConfigComplete, this)
			App.EasyLoading.showLoading();
		}

	}

	private runLoading(): boolean {
		App.SceneManager.register(SceneConsts.Login, new LoginScene());
		App.ControllerManager.register(ControllerConst.Loading, new LoadingController());
		App.SceneManager.runScene(SceneConsts.Login);
		App.ViewManager.open(ViewConst.Loading);

		return true;
	}

	// 资源加载完毕
	private onConfigComplete(): void {
		App.EasyLoading.hideLoading();
		// 加载公共资源
		var groupName: string = 'common';
		var subGroups: Array<string> = ['preload_core', 'common_asset', 'proto_file'];
		App.ResourceUtils.loadGroups(groupName, subGroups, this.onLoadComplete, this.onLoadProgress, this);
	}

	private onLoadComplete(): void {
		LoginMgr.isLoading = true;
		App.MsgFactory.registerAll();
		App.Init();
		GameApp.Init();
		this.initModule();

		// === GameZoe 平台登入檢查 ===
		// 優先檢查 URL 參數（iframe 模式，由 GamePlayer.tsx 傳入）
		const urlParams = new URLSearchParams(window.location.search);
		const urlUserId = urlParams.get('userId');
		if (urlUserId) {
			console.log('[LoginStart] Platform user detected from URL params:', urlUserId);
			this.connectServerWithPlatformLogin({ id: urlUserId, name: '玩家' });
			return;
		}
		// 其次檢查 window.currentUser（直接訪問模式）
		let platformUser = window['currentUser'] || (window['GameZoe'] && window['GameZoe'].currentUser);
		if (platformUser && platformUser.id) {
			console.log('[LoginStart] Platform user detected:', platformUser.id);
			this.connectServerWithPlatformLogin(platformUser);
			return;
		}
		// === 結束平台登入檢查 ===

		if (GameApp.PlayerInfo.isLogin) {
			App.ViewManager.open(ViewConst.Home);
		} else {
			App.ViewManager.open(ViewConst.Login);
		}
		this.connectServer();
	}

	private onLoadProgress(itemsLoaded: number, itemsTotal: number): void {
		// 发送加载进度
		App.ControllerManager.applyFunc(ControllerConst.Loading, LoadingConst.SetProgress, itemsLoaded, itemsTotal);
	}

	private initModule(): void {
		App.ControllerManager.register(ControllerConst.Login, new LoginController());
		App.ControllerManager.register(ControllerConst.Home, new HomeController());
		App.ControllerManager.register(ControllerConst.Room, new RoomController());
	}

	// 连接服务器
	private connectServer(): void {
		App.Socket.connect();
		App.MessageCenter.addListener(SocketConst.SOCKET_CONNECT, () => {
			GameApp.HeartMgr.init();
			let reloginCode = egret.localStorage.getItem('reloginCode');
			let reloginType = parseInt(egret.localStorage.getItem('reloginType'));
			if(reloginCode && reloginType) {
				this.reLogin(reloginCode, reloginType);
			}
		}, this);
		App.MessageCenter.addListener(SocketConst.SOCKET_RECONNECT, () => {
			GameApp.HeartMgr.resume();
			// 断线重连
			console.log("断线重连成功");
			if (GameApp.PlayerInfo.isLogin) {
				LoginReq.send_reLogin(GameApp.PlayerInfo.reLoginCode, GameApp.PlayerInfo.loginType, 0,
					function (success, msg) {
					}, this);
			}
		}, this);
		App.MessageCenter.addListener(SocketConst.SOCKET_START_RECONNECT, () => {
			GameApp.HeartMgr.pause();
			console.log("开始与服务器重新连接");
		}, this);
		App.MessageCenter.addListener(SocketConst.SOCKET_CLOSE, () => {
			GameApp.HeartMgr.pause();
			GameApp.PromotManager.twoButtonTip("服务器连接失败，请检查网络设置", null, () => {
				GameApp.PromotManager.hideButtonTip();
				App.Socket.connect();
			}, this, ()=>{
				location.href = "404.html?code=500&msg=服务器连接失败，请检查网络设置";
			}, this);
		}, this);
		App.MessageCenter.addListener(SocketConst.SOCKET_NOCONNECT, () => {
			GameApp.HeartMgr.pause();
			GameApp.PromotManager.twoButtonTip("服务器连接失败，请检查网络设置", null, () => {
				GameApp.PromotManager.hideButtonTip();
				App.Socket.connect();
			}, this, ()=>{
				location.href = "404.html?code=500&msg=服务器连接失败，请检查网络设置";
			}, this);
		}, this);
	}

	// GameZoe 平台用戶自動登入
	private connectServerWithPlatformLogin(platformUser: any): void {
		// 儲存平台用戶資訊
		egret.localStorage.setItem('platformUserId', platformUser.id);
		egret.localStorage.setItem('platformUserName', platformUser.name || '玩家');

		App.Socket.connect();
		App.MessageCenter.addListener(SocketConst.SOCKET_CONNECT, () => {
			GameApp.HeartMgr.init();
			console.log('[LoginStart] Socket connected, checking for existing session...');

			// 檢查是否有舊的 session
			let reloginCode = egret.localStorage.getItem('reloginCode');
			let reloginType = parseInt(egret.localStorage.getItem('reloginType'));

			if (reloginCode && reloginType) {
				// 有舊 session，嘗試重連
				this.reLogin(reloginCode, reloginType);
			} else {
				// 無舊 session，使用平台用戶 ID 登入（綁定平台帳號與遊戲帳號）
				console.log('[LoginStart] No existing session, platform login with userId:', platformUser.id);
				LoginReq.send_loginByTourist((success, msg) => {
					if (success) {
						console.log('[LoginStart] Platform login success, userId:', platformUser.id);
						GameApp.PlayerInfo.loginType = LoginType.Tourist;
						egret.localStorage.setItem('reloginType', LoginType.Tourist + '');
					} else {
						console.error('[LoginStart] Tourist login failed');
						App.ViewManager.open(ViewConst.Login);
					}
				}, this, platformUser.id);  // 傳入平台用戶 ID
			}
		}, this);

		// 斷線重連監聽
		App.MessageCenter.addListener(SocketConst.SOCKET_RECONNECT, () => {
			GameApp.HeartMgr.resume();
			console.log("断线重连成功");
			if (GameApp.PlayerInfo.isLogin) {
				LoginReq.send_reLogin(GameApp.PlayerInfo.reLoginCode, GameApp.PlayerInfo.loginType, 0,
					function (success, msg) {
					}, this);
			}
		}, this);
		App.MessageCenter.addListener(SocketConst.SOCKET_START_RECONNECT, () => {
			GameApp.HeartMgr.pause();
			console.log("开始与服务器重新连接");
		}, this);
		App.MessageCenter.addListener(SocketConst.SOCKET_CLOSE, () => {
			GameApp.HeartMgr.pause();
			GameApp.PromotManager.twoButtonTip("服务器连接失败，请检查网络设置", null, () => {
				GameApp.PromotManager.hideButtonTip();
				App.Socket.connect();
			}, this, () => {
				// 返回平台首頁
				if (window.top) {
					window.top.location.href = '/';
				}
			}, this);
		}, this);
		App.MessageCenter.addListener(SocketConst.SOCKET_NOCONNECT, () => {
			GameApp.HeartMgr.pause();
			GameApp.PromotManager.twoButtonTip("服务器连接失败，请检查网络设置", null, () => {
				GameApp.PromotManager.hideButtonTip();
				App.Socket.connect();
			}, this, () => {
				if (window.top) {
					window.top.location.href = '/';
				}
			}, this);
		}, this);
	}

	private reLogin(reloginCode:any, reloginType:any): void {
		App.EasyLoading.showLoading();
		let self = this;
		LoginReq.send_reLogin(reloginCode, reloginType, 1, function (success, msg) {
			App.EasyLoading.hideLoading();
			if(!success) {
				GameApp.PromotManager.oneButtonTip('登录失败')
			}
		}, this);
	}

	public finish(): void {

	}

}