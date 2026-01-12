/**
 * GameZoe Save SDK
 * 跨裝置遊戲存檔同步 SDK
 *
 * 使用方式:
 * 1. 在遊戲 HTML 中引入: <script src="/games/gamezoe-save-sdk.js"></script>
 * 2. 初始化: GameZoeSave.init('your-game-id')
 * 3. 讀取存檔: const data = await GameZoeSave.load()
 * 4. 儲存進度: await GameZoeSave.save(yourSaveData)
 */

(function(window) {
    'use strict';

    const API_BASE = window.location.origin;

    const GameZoeSave = {
        gameId: null,
        userId: null,
        isLoggedIn: false,
        localStorageKey: null,
        _initialized: false,
        _initPromise: null,

        /**
         * 初始化 SDK
         * @param {string} gameId - 遊戲 ID (必須與資料庫中的 game id 一致)
         * @returns {Promise<void>}
         */
        init: function(gameId) {
            if (this._initPromise) {
                return this._initPromise;
            }

            this._initPromise = new Promise((resolve) => {
                this.gameId = gameId;
                this.localStorageKey = `gamezoe_save_${gameId}`;

                // 嘗試從 parent window 獲取用戶資訊
                this._getUserFromParent().then((user) => {
                    if (user && user.id) {
                        this.userId = user.id;
                        this.isLoggedIn = true;
                        console.log(`[GameZoeSave] Initialized for user: ${this.userId}, game: ${this.gameId}`);
                    } else {
                        console.log(`[GameZoeSave] No user logged in, using localStorage fallback for game: ${this.gameId}`);
                    }
                    this._initialized = true;
                    resolve();
                });
            });

            return this._initPromise;
        },

        /**
         * 從 parent window 獲取用戶資訊
         * @private
         */
        _getUserFromParent: function() {
            return new Promise((resolve) => {
                // 方法1: 檢查 window.gameZoeUser (由平台注入)
                if (window.gameZoeUser && window.gameZoeUser.id) {
                    resolve(window.gameZoeUser);
                    return;
                }

                // 方法2: 透過 postMessage 向 parent 請求
                if (window.parent !== window) {
                    const timeout = setTimeout(() => {
                        resolve(null);
                    }, 1000);

                    const handler = (event) => {
                        if (event.data && event.data.type === 'GAMEZOE_USER_INFO') {
                            clearTimeout(timeout);
                            window.removeEventListener('message', handler);
                            resolve(event.data.user);
                        }
                    };

                    window.addEventListener('message', handler);
                    window.parent.postMessage({ type: 'GAMEZOE_GET_USER' }, '*');
                } else {
                    // 方法3: 從 localStorage 讀取 (平台會存儲)
                    try {
                        const stored = localStorage.getItem('gamezoe_user');
                        if (stored) {
                            resolve(JSON.parse(stored));
                            return;
                        }
                    } catch (e) {}
                    resolve(null);
                }
            });
        },

        /**
         * 讀取遊戲存檔
         * @returns {Promise<any>} 存檔資料，如果沒有存檔則返回 null
         */
        load: async function() {
            if (!this._initialized) {
                await this.init(this.gameId);
            }

            // 已登入: 從伺服器讀取
            if (this.isLoggedIn && this.userId) {
                try {
                    const response = await fetch(`${API_BASE}/api/game-saves/${this.userId}/${this.gameId}`);
                    const result = await response.json();

                    if (result.success && result.save_data !== null) {
                        console.log(`[GameZoeSave] Loaded from server:`, result.save_data);
                        // 同步到 localStorage 作為備份
                        this._saveToLocalStorage(result.save_data);
                        return result.save_data;
                    }
                } catch (err) {
                    console.warn('[GameZoeSave] Server load failed, falling back to localStorage:', err);
                }
            }

            // 未登入或伺服器失敗: 從 localStorage 讀取
            return this._loadFromLocalStorage();
        },

        /**
         * 儲存遊戲進度
         * @param {any} saveData - 要儲存的資料 (會自動 JSON 序列化)
         * @returns {Promise<boolean>} 是否成功
         */
        save: async function(saveData) {
            if (!this._initialized) {
                await this.init(this.gameId);
            }

            // 總是存到 localStorage 作為備份
            this._saveToLocalStorage(saveData);

            // 已登入: 同步到伺服器
            if (this.isLoggedIn && this.userId) {
                try {
                    const response = await fetch(`${API_BASE}/api/game-saves`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: this.userId,
                            gameId: this.gameId,
                            saveData: saveData
                        })
                    });
                    const result = await response.json();

                    if (result.success) {
                        console.log(`[GameZoeSave] Saved to server successfully`);
                        return true;
                    } else {
                        console.warn('[GameZoeSave] Server save failed:', result.error);
                    }
                } catch (err) {
                    console.warn('[GameZoeSave] Server save error:', err);
                }
            }

            console.log(`[GameZoeSave] Saved to localStorage`);
            return true;
        },

        /**
         * 刪除存檔
         * @returns {Promise<boolean>}
         */
        delete: async function() {
            if (!this._initialized) {
                await this.init(this.gameId);
            }

            // 刪除 localStorage
            try {
                localStorage.removeItem(this.localStorageKey);
            } catch (e) {}

            // 刪除伺服器存檔
            if (this.isLoggedIn && this.userId) {
                try {
                    const response = await fetch(`${API_BASE}/api/game-saves/${this.userId}/${this.gameId}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();
                    return result.success;
                } catch (err) {
                    console.warn('[GameZoeSave] Server delete error:', err);
                }
            }

            return true;
        },

        /**
         * 從 localStorage 讀取
         * @private
         */
        _loadFromLocalStorage: function() {
            try {
                const stored = localStorage.getItem(this.localStorageKey);
                if (stored) {
                    const data = JSON.parse(stored);
                    console.log(`[GameZoeSave] Loaded from localStorage:`, data);
                    return data;
                }
            } catch (e) {
                console.warn('[GameZoeSave] localStorage load error:', e);
            }
            return null;
        },

        /**
         * 存到 localStorage
         * @private
         */
        _saveToLocalStorage: function(saveData) {
            try {
                localStorage.setItem(this.localStorageKey, JSON.stringify(saveData));
            } catch (e) {
                console.warn('[GameZoeSave] localStorage save error:', e);
            }
        },

        /**
         * 檢查是否已登入
         * @returns {boolean}
         */
        isUserLoggedIn: function() {
            return this.isLoggedIn;
        },

        /**
         * 獲取當前用戶 ID
         * @returns {string|null}
         */
        getUserId: function() {
            return this.userId;
        }
    };

    // 導出到全域
    window.GameZoeSave = GameZoeSave;

})(window);
