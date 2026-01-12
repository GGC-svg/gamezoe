var egret;
! function(t) {
	var e = function() {
		function t() {
			this._hashCode = t.hashCount++
		}
		return Object.defineProperty(t.prototype, "hashCode", {
			get: function() {
				return this._hashCode
			},
			enumerable: !0,
			configurable: !0
		}), t.hashCount = 1, t
	}();
	t.HashObject = e, e.prototype.__class__ = "egret.HashObject"
}(egret || (egret = {}));
var __extends = this.__extends || function(t, e) {
		function i() {
			this.constructor = t
		}
		for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
		i.prototype = e.prototype, t.prototype = new i
	};
! function(t) {
	var e = function(t) {
		function e(e) {
			"undefined" == typeof e && (e = 300), t.call(this), this.objectPool = [], this._length = 0, 1 > e && (e = 1), this.autoDisposeTime = e, this.frameCount = 0
		}
		return __extends(e, t), e.prototype._checkFrame = function() {
			this.frameCount--, 0 >= this.frameCount && this.dispose()
		}, Object.defineProperty(e.prototype, "length", {
			get: function() {
				return this._length
			},
			enumerable: !0,
			configurable: !0
		}), e.prototype.push = function(t) {
			var i = this.objectPool; - 1 == i.indexOf(t) && (i.push(t), this._length++, 0 == this.frameCount && (this.frameCount = this.autoDisposeTime, e._callBackList.push(this)))
		}, e.prototype.pop = function() {
			return 0 == this._length ? null : (this._length--, this.objectPool.pop())
		}, e.prototype.dispose = function() {
			0 < this._length && (this.objectPool = [], this._length = 0), this.frameCount = 0;
			var t = e._callBackList,
				i = t.indexOf(this); - 1 != i && t.splice(i, 1)
		}, e._callBackList = [], e
	}(t.HashObject);
	t.Recycler = e, e.prototype.__class__ = "egret.Recycler"
}(egret || (egret = {})),
function(t) {
	t.__START_TIME, t.getTimer = function() {
		return Date.now() - t.__START_TIME
	}
}(egret || (egret = {})),
function(t) {
	t.__callLaterFunctionList = [], t.__callLaterThisList = [], t.__callLaterArgsList = [], t.callLater = function(e, i) {
		for (var n = [], r = 0; r < arguments.length - 2; r++) n[r] = arguments[r + 2];
		t.__callLaterFunctionList.push(e), t.__callLaterThisList.push(i), t.__callLaterArgsList.push(n)
	}
}(egret || (egret = {}));
var egret_dom;
! function(t) {
	function e() {
		for (var t = document.createElement("div").style, e = ["t", "webkitT", "msT", "MozT", "OT"], i = 0; i < e.length; i++)
			if (e[i] + "ransform" in t) return e[i];
		return e[0]
	}
	t.header = "", t.getHeader = e, t.getTrans = function(i) {
		return "" == t.header && (t.header = e()), t.header + i.substring(1, i.length)
	}
}(egret_dom || (egret_dom = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(t, i, n) {
			"undefined" == typeof i && (i = !1), "undefined" == typeof n && (n = !1), e.call(this), this._eventPhase = 2, this._isPropagationImmediateStopped = this._isPropagationStopped = this._isDefaultPrevented = !1, this.isNew = !0, this._type = t, this._bubbles = i, this._cancelable = n
		}
		return __extends(i, e), Object.defineProperty(i.prototype, "type", {
			get: function() {
				return this._type
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "bubbles", {
			get: function() {
				return this._bubbles
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "cancelable", {
			get: function() {
				return this._cancelable
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "eventPhase", {
			get: function() {
				return this._eventPhase
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "currentTarget", {
			get: function() {
				return this._currentTarget
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "target", {
			get: function() {
				return this._target
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype.isDefaultPrevented = function() {
			return this._isDefaultPrevented
		}, i.prototype.preventDefault = function() {
			this._cancelable && (this._isDefaultPrevented = !0)
		}, i.prototype.stopPropagation = function() {
			this._bubbles && (this._isPropagationStopped = !0)
		}, i.prototype.stopImmediatePropagation = function() {
			this._bubbles && (this._isPropagationImmediateStopped = !0)
		}, i.prototype._reset = function() {
			this.isNew ? this.isNew = !1 : (this._isPropagationImmediateStopped = this._isPropagationStopped = this._isDefaultPrevented = !1, this._currentTarget = this._target = null, this._eventPhase = 2)
		}, i._dispatchByTarget = function(e, i, n, r, o, s) {
			"undefined" == typeof o && (o = !1), "undefined" == typeof s && (s = !1);
			var a = e.eventRecycler;
			a || (a = e.eventRecycler = new t.Recycler);
			var h = a.pop();
			if (h ? h._type = n : h = new e(n), h._bubbles = o, h._cancelable = s, r)
				for (var c in r) h[c] = r[c], null !== h[c] && (r[c] = null);
			return e = i.dispatchEvent(h), a.push(h), e
		}, i._getPropertyData = function(t) {
			var e = t._props;
			return e || (e = t._props = {}), e
		}, i.dispatchEvent = function(t, e, n, r) {
			"undefined" == typeof n && (n = !1);
			var o = i._getPropertyData(i);
			r && (o.data = r), i._dispatchByTarget(i, t, e, o, n)
		}, i.ADDED_TO_STAGE = "addedToStage", i.REMOVED_FROM_STAGE = "removedFromStage", i.ADDED = "added", i.REMOVED = "removed", i.COMPLETE = "complete", i.ENTER_FRAME = "enterFrame", i.RENDER = "render", i.FINISH_RENDER = "finishRender", i.FINISH_UPDATE_TRANSFORM = "finishUpdateTransform", i.LEAVE_STAGE = "leaveStage", i.RESIZE = "resize", i.CHANGE = "change", i
	}(t.HashObject);
	t.Event = e, e.prototype.__class__ = "egret.Event"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(t, i, n) {
			"undefined" == typeof i && (i = !1), "undefined" == typeof n && (n = !1), e.call(this, t, i, n)
		}
		return __extends(i, e), i.dispatchIOErrorEvent = function(e) {
			t.Event._dispatchByTarget(i, e, i.IO_ERROR)
		}, i.IO_ERROR = "ioError", i
	}(t.Event);
	t.IOErrorEvent = e, e.prototype.__class__ = "egret.IOErrorEvent"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(t, i, n, r, o, s, a, h, c, u) {
			"undefined" == typeof i && (i = !0), "undefined" == typeof n && (n = !0), "undefined" == typeof r && (r = 0), "undefined" == typeof o && (o = 0), "undefined" == typeof s && (s = 0), "undefined" == typeof a && (a = !1), "undefined" == typeof h && (h = !1), "undefined" == typeof u && (u = !1), e.call(this, t, i, n), this._stageY = this._stageX = 0, this.touchPointID = r, this._stageX = o, this._stageY = s, this.ctrlKey = a, this.altKey = h, this.touchDown = u
		}
		return __extends(i, e), Object.defineProperty(i.prototype, "stageX", {
			get: function() {
				return this._stageX
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "stageY", {
			get: function() {
				return this._stageY
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "localX", {
			get: function() {
				return this._currentTarget.globalToLocal(this._stageX, this._stageY, t.Point.identity).x
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "localY", {
			get: function() {
				return this._currentTarget.globalToLocal(this._stageX, this._stageY, t.Point.identity).y
			},
			enumerable: !0,
			configurable: !0
		}), i.dispatchTouchEvent = function(e, n, r, o, s, a, h, c, u) {
			"undefined" == typeof r && (r = 0), "undefined" == typeof o && (o = 0), "undefined" == typeof s && (s = 0), "undefined" == typeof a && (a = !1), "undefined" == typeof h && (h = !1), "undefined" == typeof c && (c = !1), "undefined" == typeof u && (u = !1);
			var p = t.Event._getPropertyData(i);
			p.touchPointID = r, p._stageX = o, p._stageY = s, p.ctrlKey = a, p.altKey = h, p.shiftKey = c, p.touchDown = u, t.Event._dispatchByTarget(i, e, n, p, !0, !0)
		}, i.TOUCH_TAP = "touchTap", i.TOUCH_MOVE = "touchMove", i.TOUCH_BEGIN = "touchBegin", i.TOUCH_END = "touchEnd", i.TOUCH_RELEASE_OUTSIDE = "touchReleaseOutside", i.TOUCH_ROLL_OUT = "touchRollOut", i.TOUCH_ROLL_OVER = "touchRollOver", i.TOUCH_OUT = "touchOut", i.TOUCH_OVER = "touchOver", i
	}(t.Event);
	t.TouchEvent = e, e.prototype.__class__ = "egret.TouchEvent"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(t, i, n) {
			"undefined" == typeof i && (i = !1), "undefined" == typeof n && (n = !1), e.call(this, t, i, n)
		}
		return __extends(i, e), i.dispatchTimerEvent = function(e, n) {
			t.Event._dispatchByTarget(i, e, n)
		}, i.TIMER = "timer", i.TIMER_COMPLETE = "timerComplete", i
	}(t.Event);
	t.TimerEvent = e, e.prototype.__class__ = "egret.TimerEvent"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {}
		return t.CAPTURING_PHASE = 1, t.AT_TARGET = 2, t.BUBBLING_PHASE = 3, t
	}();
	t.EventPhase = e, e.prototype.__class__ = "egret.EventPhase"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(t) {
			"undefined" == typeof t && (t = null), e.call(this), this._eventTarget = t ? t : this
		}
		return __extends(i, e), i.prototype.addEventListener = function(e, i, n, r, o) {
			"undefined" == typeof r && (r = !1), "undefined" == typeof o && (o = 0), "undefined" == typeof r && (r = !1), "undefined" == typeof o && (o = 0), i || t.Logger.fatal("addEventListener侦听函数不能为空"), r ? (this._captureEventsMap || (this._captureEventsMap = {}), r = this._captureEventsMap) : (this._eventsMap || (this._eventsMap = {}), r = this._eventsMap);
			var s = r[e];
			s || (s = r[e] = []), this._insertEventBin(s, i, n, o)
		}, i.prototype._insertEventBin = function(t, e, i, n) {
			for (var r = -1, o = t.length, s = 0; o > s; s++) {
				var a = t[s];
				if (a.listener === e && a.thisObject === i) return !1; - 1 == r && a.priority < n && (r = s)
			}
			return e = {
				listener: e,
				thisObject: i,
				priority: n
			}, -1 != r ? t.splice(r, 0, e) : t.push(e), !0
		}, i.prototype.removeEventListener = function(t, e, i, n) {
			if ("undefined" == typeof n && (n = !1), n = n ? this._captureEventsMap : this._eventsMap) {
				var r = n[t];
				r && (this._removeEventBin(r, e, i), 0 == r.length && delete n[t])
			}
		}, i.prototype._removeEventBin = function(t, e, i) {
			for (var n = t.length, r = 0; n > r; r++) {
				var o = t[r];
				if (o.listener === e && o.thisObject === i) return t.splice(r, 1), !0
			}
			return !1
		}, i.prototype.hasEventListener = function(t) {
			return this._eventsMap && this._eventsMap[t] || this._captureEventsMap && this._captureEventsMap[t]
		}, i.prototype.willTrigger = function(t) {
			return this.hasEventListener(t)
		}, i.prototype.dispatchEvent = function(t) {
			return t._reset(), t._target = this._eventTarget, t._currentTarget = this._eventTarget, this._notifyListener(t)
		}, i.prototype._notifyListener = function(t) {
			var e = 1 == t._eventPhase ? this._captureEventsMap : this._eventsMap;
			if (!e) return !0;
			if (e = e[t._type], !e) return !0;
			var i = e.length;
			if (0 == i) return !0;
			for (var e = e.concat(), n = 0; i > n; n++) {
				var r = e[n];
				if (r.listener.call(r.thisObject, t), t._isPropagationImmediateStopped) break
			}
			return !t._isDefaultPrevented
		}, i.prototype.dispatchEventWith = function(e, i, n) {
			"undefined" == typeof i && (i = !1), t.Event.dispatchEvent(this, e, i, n)
		}, i
	}(t.HashObject);
	t.EventDispatcher = e, e.prototype.__class__ = "egret.EventDispatcher"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this.reuseEvent = new t.Event("")
		}
		return __extends(i, e), i.prototype.run = function() {
			t.Ticker.getInstance().run(), t.Ticker.getInstance().register(this.renderLoop, this, Number.NEGATIVE_INFINITY), t.Ticker.getInstance().register(this.broadcastEnterFrame, this, Number.POSITIVE_INFINITY), this.touchContext.run()
		}, i.prototype.renderLoop = function(e) {
			if (0 < t.__callLaterFunctionList.length) {
				var n = t.__callLaterFunctionList;
				t.__callLaterFunctionList = [];
				var r = t.__callLaterThisList;
				t.__callLaterThisList = [];
				var o = t.__callLaterArgsList;
				t.__callLaterArgsList = []
			}
			e = this.stage;
			var s = i.cachedEvent;
			s._type = t.Event.RENDER, this.dispatchEvent(s), t.Stage._invalidateRenderFlag && (this.broadcastRender(), t.Stage._invalidateRenderFlag = !1), n && this.doCallLaterList(n, r, o), n = this.rendererContext, n.onRenderStart(), n.clearScreen(), e._updateTransform(), s._type = t.Event.FINISH_UPDATE_TRANSFORM, this.dispatchEvent(s), e._draw(n), s._type = t.Event.FINISH_RENDER, this.dispatchEvent(s), n.onRenderFinish()
		}, i.prototype.broadcastEnterFrame = function(e) {
			e = this.reuseEvent, e._type = t.Event.ENTER_FRAME, this.dispatchEvent(e);
			for (var i = t.DisplayObject._enterFrameCallBackList.concat(), n = i.length, r = 0; n > r; r++) {
				var o = i[r];
				e._target = o.display, e._currentTarget = o.display, o.listener.call(o.thisObject, e)
			}
			for (i = t.Recycler._callBackList, r = i.length - 1; r >= 0; r--) i[r]._checkFrame()
		}, i.prototype.broadcastRender = function() {
			var e = this.reuseEvent;
			e._type = t.Event.RENDER;
			for (var i = t.DisplayObject._renderCallBackList.concat(), n = i.length, r = 0; n > r; r++) {
				var o = i[r],
					s = o.display;
				e._target = s, e._currentTarget = s, o.listener.call(o.thisObject, e)
			}
		}, i.prototype.doCallLaterList = function(t, e, i) {
			for (var n = t.length, r = 0; n > r; r++) {
				var o = t[r];
				null != o && o.apply(e[r], i[r])
			}
		}, i.DEVICE_PC = "web", i.DEVICE_MOBILE = "native", i.RUNTIME_HTML5 = "runtime_html5", i.RUNTIME_NATIVE = "runtime_native", i.cachedEvent = new t.Event(""), i
	}(t.EventDispatcher);
	t.MainContext = e, e.prototype.__class__ = "egret.MainContext"
}(egret || (egret = {}));
var testDeviceType = function() {
	if (!this.navigator) return !0;
	var t = navigator.userAgent.toLowerCase();
	return -1 != t.indexOf("mobile") || -1 != t.indexOf("android")
}, testRuntimeType = function() {
		return this.navigator ? !0 : !1
	};
egret.MainContext.instance = new egret.MainContext, egret.MainContext.deviceType = testDeviceType() ? egret.MainContext.DEVICE_MOBILE : egret.MainContext.DEVICE_PC, egret.MainContext.runtimeType = testRuntimeType() ? egret.MainContext.RUNTIME_HTML5 : egret.MainContext.RUNTIME_NATIVE,
function(t) {
	var e = function() {
		function e() {
			this._tick = this._preDrawCount = this._updateTransformPerformanceCost = this._renderPerformanceCost = this._logicPerformanceCost = this._lastTime = 0, this._maxDeltaTime = 500, this._totalDeltaTime = 0
		}
		return e.getInstance = function() {
			return null == e.instance && (e.instance = new e), e.instance
		}, e.prototype.run = function() {
			t.Ticker.getInstance().register(this.update, this), null == this._txt && (this._txt = new t.TextField, this._txt.size = 28, t.MainContext.instance.stage.addChild(this._txt));
			var e = t.MainContext.instance;
			e.addEventListener(t.Event.ENTER_FRAME, this.onEnterFrame, this), e.addEventListener(t.Event.RENDER, this.onStartRender, this), e.addEventListener(t.Event.FINISH_RENDER, this.onFinishRender, this), e.addEventListener(t.Event.FINISH_UPDATE_TRANSFORM, this.onFinishUpdateTransform, this)
		}, e.prototype.onEnterFrame = function() {
			this._lastTime = t.getTimer()
		}, e.prototype.onStartRender = function(e) {
			e = t.getTimer(), this._logicPerformanceCost = e - this._lastTime, this._lastTime = e
		}, e.prototype.onFinishUpdateTransform = function(e) {
			e = t.getTimer(), this._updateTransformPerformanceCost = e - this._lastTime, this._lastTime = e
		}, e.prototype.onFinishRender = function(e) {
			e = t.getTimer(), this._renderPerformanceCost = e - this._lastTime, this._lastTime = e
		}, e.prototype.update = function(e) {
			if (this._tick++, this._totalDeltaTime += e, this._totalDeltaTime >= this._maxDeltaTime) {
				e = (this._preDrawCount - 1).toString();
				var i = Math.ceil(this._logicPerformanceCost).toString() + "," + Math.ceil(this._updateTransformPerformanceCost).toString() + "," + Math.ceil(this._renderPerformanceCost).toString() + "," + Math.ceil(t.MainContext.instance.rendererContext.renderCost).toString();
				this._txt.text = "draw:" + e + "\ncost:" + i + "\nFPS:" + Math.floor(1e3 * this._tick / this._totalDeltaTime).toString(), this._tick = this._totalDeltaTime = 0
			}
			this._preDrawCount = 0
		}, e.prototype.onDrawImage = function() {
			this._preDrawCount++
		}, e
	}();
	t.Profiler = e, e.prototype.__class__ = "egret.Profiler"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.apply(this, arguments), this._timeScale = 1, this._paused = !1, this.callBackList = []
		}
		return __extends(i, e), i.prototype.run = function() {
			t.__START_TIME = (new Date).getTime(), t.MainContext.instance.deviceContext.executeMainLoop(this.update, this)
		}, i.prototype.update = function(t) {
			var e = this.callBackList.concat(),
				i = e.length;
			t *= this._timeScale, t *= this._timeScale;
			for (var n = 0; i > n; n++) {
				var r = e[n];
				r.listener.call(r.thisObject, t)
			}
		}, i.prototype.register = function(t, e, i) {
			"undefined" == typeof i && (i = 0), this._insertEventBin(this.callBackList, t, e, i)
		}, i.prototype.unregister = function(t, e) {
			this._removeEventBin(this.callBackList, t, e)
		}, i.prototype.setTimeout = function(e, i, n) {
			for (var r = [], o = 0; o < arguments.length - 3; o++) r[o] = arguments[o + 3];
			t.Logger.warning("Ticker#setTimeout方法即将废弃,请使用egret.setTimeout"), t.setTimeout.apply(null, [e, i, n].concat(r))
		}, i.prototype.setTimeScale = function(t) {
			this._timeScale = t
		}, i.prototype.getTimeScale = function() {
			return this._timeScale
		}, i.prototype.pause = function() {
			this._paused = !0
		}, i.prototype.resume = function() {
			this._paused = !1
		}, i.getInstance = function() {
			return null == i.instance && (i.instance = new i), i.instance
		}, i
	}(t.EventDispatcher);
	t.Ticker = e, e.prototype.__class__ = "egret.Ticker"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {}
		return t.LEFT = "left", t.RIGHT = "right", t.CENTER = "center", t.JUSTIFY = "justify", t.CONTENT_JUSTIFY = "contentJustify", t
	}();
	t.HorizontalAlign = e, e.prototype.__class__ = "egret.HorizontalAlign"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {}
		return t.TOP = "top", t.BOTTOM = "bottom", t.MIDDLE = "middle", t.JUSTIFY = "justify", t.CONTENT_JUSTIFY = "contentJustify", t
	}();
	t.VerticalAlign = e, e.prototype.__class__ = "egret.VerticalAlign"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(t, i) {
			"undefined" == typeof i && (i = 0), e.call(this), this._currentCount = 0, this.delay = t, this.repeatCount = i
		}
		return __extends(i, e), i.prototype.currentCount = function() {
			return this._currentCount
		}, Object.defineProperty(i.prototype, "running", {
			get: function() {
				return this._running
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype.reset = function() {
			this.stop(), this._currentCount = 0
		}, i.prototype.start = function() {
			this._running || (this.lastTime = t.getTimer(), 0 != this._currentCount && (this._currentCount = 0), t.Ticker.getInstance().register(this.onEnterFrame, this), this._running = !0)
		}, i.prototype.stop = function() {
			this._running && (t.Ticker.getInstance().unregister(this.onEnterFrame, this), this._running = !1)
		}, i.prototype.onEnterFrame = function(e) {
			e = t.getTimer(), e - this.lastTime > this.delay && (this.lastTime = e, this._currentCount++, t.TimerEvent.dispatchTimerEvent(this, t.TimerEvent.TIMER), 0 < this.repeatCount && this._currentCount >= this.repeatCount && (this.stop(), t.TimerEvent.dispatchTimerEvent(this, t.TimerEvent.TIMER_COMPLETE)))
		}, i
	}(t.EventDispatcher);
	t.Timer = e, e.prototype.__class__ = "egret.Timer"
}(egret || (egret = {})),
function(t) {
	t.getQualifiedClassName = function(t) {
		if (t = t.prototype ? t.prototype : t.__proto__, t.hasOwnProperty("__class__")) return t.__class__;
		var e = t.constructor.toString(),
			i = e.indexOf("("),
			e = e.substring(9, i);
		return t.__class__ = e
	}
}(egret || (egret = {})),
function(t) {
	var e = {};
	t.getDefinitionByName = function(t) {
		if (!t) return null;
		var i = e[t];
		if (i) return i;
		for (var n = t.split("."), r = n.length, i = __global, o = 0; r > o; o++)
			if (i = i[n[o]], !i) return null;
		return e[t] = i
	}
}(egret || (egret = {}));
var __global = __global || this;
! function(t) {
	function e(t) {
		for (var e in i) {
			var n = i[e];
			n.delay -= t, 0 >= n.delay && (n.listener.apply(n.thisObject, n.params), delete i[e])
		}
	}
	var i = {}, n = 0;
	t.setTimeout = function(r, o, s) {
		for (var a = [], h = 0; h < arguments.length - 3; h++) a[h] = arguments[h + 3];
		return a = {
			listener: r,
			thisObject: o,
			delay: s,
			params: a
		}, 0 == n && t.Ticker.getInstance().register(e, null), n++, i[n] = a, n
	}, t.clearTimeout = function(t) {
		delete i[t]
	}
}(egret || (egret = {})),
function(t) {
	t.hasDefinition = function(e) {
		return t.getDefinitionByName(e) ? !0 : !1
	}
}(egret || (egret = {})),
function(t) {
	t.toColorString = function(t) {
		for ((isNaN(t) || 0 > t) && (t = 0), t > 16777215 && (t = 16777215), t = t.toString(16).toUpperCase(); 6 > t.length;) t = "0" + t;
		return "#" + t
	}
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(t, i, n, r, o, s) {
			"undefined" == typeof t && (t = 1), "undefined" == typeof i && (i = 0), "undefined" == typeof n && (n = 0), "undefined" == typeof r && (r = 1), "undefined" == typeof o && (o = 0), "undefined" == typeof s && (s = 0), e.call(this), this.a = t, this.b = i, this.c = n, this.d = r, this.tx = o, this.ty = s
		}
		return __extends(i, e), i.prototype.prepend = function(t, e, i, n, r, o) {
			var s = this.tx;
			if (1 != t || 0 != e || 0 != i || 1 != n) {
				var a = this.a,
					h = this.c;
				this.a = a * t + this.b * i, this.b = a * e + this.b * n, this.c = h * t + this.d * i, this.d = h * e + this.d * n
			}
			return this.tx = s * t + this.ty * i + r, this.ty = s * e + this.ty * n + o, this
		}, i.prototype.append = function(t, e, i, n, r, o) {
			var s = this.a,
				a = this.b,
				h = this.c,
				c = this.d;
			return (1 != t || 0 != e || 0 != i || 1 != n) && (this.a = t * s + e * h, this.b = t * a + e * c, this.c = i * s + n * h, this.d = i * a + n * c), this.tx = r * s + o * h + this.tx, this.ty = r * a + o * c + this.ty, this
		}, i.prototype.prependMatrix = function(t) {
			return this.prepend(t.a, t.b, t.c, t.d, t.tx, t.ty), this
		}, i.prototype.appendMatrix = function(t) {
			return this.append(t.a, t.b, t.c, t.d, t.tx, t.ty), this
		}, i.prototype.prependTransform = function(t, e, n, r, o, s, a, h, c) {
			if (o % 360) {
				var u = o * i.DEG_TO_RAD;
				o = Math.cos(u), u = Math.sin(u)
			} else o = 1, u = 0;
			return (h || c) && (this.tx -= h, this.ty -= c), s || a ? (s *= i.DEG_TO_RAD, a *= i.DEG_TO_RAD, this.prepend(o * n, u * n, -u * r, o * r, 0, 0), this.prepend(Math.cos(a), Math.sin(a), -Math.sin(s), Math.cos(s), t, e)) : this.prepend(o * n, u * n, -u * r, o * r, t, e), this
		}, i.prototype.appendTransform = function(t, e, n, r, o, s, a, h, c) {
			if (o % 360) {
				var u = o * i.DEG_TO_RAD;
				o = Math.cos(u), u = Math.sin(u)
			} else o = 1, u = 0;
			return s || a ? (s *= i.DEG_TO_RAD, a *= i.DEG_TO_RAD, this.append(Math.cos(a), Math.sin(a), -Math.sin(s), Math.cos(s), t, e), this.append(o * n, u * n, -u * r, o * r, 0, 0)) : this.append(o * n, u * n, -u * r, o * r, t, e), (h || c) && (this.tx -= h * this.a + c * this.c, this.ty -= h * this.b + c * this.d), this
		}, i.prototype.rotate = function(t) {
			var e = Math.cos(t);
			t = Math.sin(t);
			var i = this.a,
				n = this.c,
				r = this.tx;
			return this.a = i * e - this.b * t, this.b = i * t + this.b * e, this.c = n * e - this.d * t, this.d = n * t + this.d * e, this.tx = r * e - this.ty * t, this.ty = r * t + this.ty * e, this
		}, i.prototype.skew = function(t, e) {
			return t *= i.DEG_TO_RAD, e *= i.DEG_TO_RAD, this.append(Math.cos(e), Math.sin(e), -Math.sin(t), Math.cos(t), 0, 0), this
		}, i.prototype.scale = function(t, e) {
			return this.a *= t, this.d *= e, this.c *= t, this.b *= e, this.tx *= t, this.ty *= e, this
		}, i.prototype.translate = function(t, e) {
			return this.tx += t, this.ty += e, this
		}, i.prototype.identity = function() {
			return this.a = this.d = 1, this.b = this.c = this.tx = this.ty = 0, this
		}, i.prototype.identityMatrix = function(t) {
			return this.a = t.a, this.b = t.b, this.c = t.c, this.d = t.d, this.tx = t.tx, this.ty = t.ty, this
		}, i.prototype.invert = function() {
			var t = this.a,
				e = this.b,
				i = this.c,
				n = this.d,
				r = this.tx,
				o = t * n - e * i;
			return this.a = n / o, this.b = -e / o, this.c = -i / o, this.d = t / o, this.tx = (i * this.ty - n * r) / o, this.ty = -(t * this.ty - e * r) / o, this
		}, i.transformCoords = function(e, i, n) {
			var r = t.Point.identity;
			return r.x = e.a * i + e.c * n + e.tx, r.y = e.d * n + e.b * i + e.ty, r
		}, i.prototype.toArray = function(t) {
			return this.array || (this.array = new Float32Array(9)), t ? (this.array[0] = this.a, this.array[1] = this.b, this.array[2] = 0, this.array[3] = this.c, this.array[4] = this.d, this.array[5] = 0, this.array[6] = this.tx, this.array[7] = this.ty) : (this.array[0] = this.a, this.array[1] = this.b, this.array[2] = this.tx, this.array[3] = this.c, this.array[4] = this.d, this.array[5] = this.ty, this.array[6] = 0, this.array[7] = 0), this.array[8] = 1, this.array
		}, i.identity = new i, i.DEG_TO_RAD = Math.PI / 180, i
	}(t.HashObject);
	t.Matrix = e, e.prototype.__class__ = "egret.Matrix"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(t) {
		function e(e, i) {
			"undefined" == typeof e && (e = 0), "undefined" == typeof i && (i = 0), t.call(this), this.x = e, this.y = i
		}
		return __extends(e, t), e.prototype.clone = function() {
			return new e(this.x, this.y)
		}, e.prototype.equals = function(t) {
			return this.x == t.x && this.y == t.y
		}, e.distance = function(t, e) {
			return Math.sqrt((t.x - e.x) * (t.x - e.x) + (t.y - e.y) * (t.y - e.y))
		}, e.identity = new e(0, 0), e
	}(t.HashObject);
	t.Point = e, e.prototype.__class__ = "egret.Point"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(t) {
		function e(e, i, n, r) {
			"undefined" == typeof e && (e = 0), "undefined" == typeof i && (i = 0), "undefined" == typeof n && (n = 0), "undefined" == typeof r && (r = 0), t.call(this), this.x = e, this.y = i, this.width = n, this.height = r
		}
		return __extends(e, t), Object.defineProperty(e.prototype, "right", {
			get: function() {
				return this.x + this.width
			},
			set: function(t) {
				this.width = t - this.x
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(e.prototype, "bottom", {
			get: function() {
				return this.y + this.height
			},
			set: function(t) {
				this.height = t - this.y
			},
			enumerable: !0,
			configurable: !0
		}), e.prototype.initialize = function(t, e, i, n) {
			return this.x = t, this.y = e, this.width = i, this.height = n, this
		}, e.prototype.contains = function(t, e) {
			return this.x <= t && this.x + this.width >= t && this.y <= e && this.y + this.height >= e
		}, e.prototype.intersects = function(t) {
			var e = t.right,
				i = t.bottom,
				n = this.right,
				r = this.bottom;
			return this.contains(t.x, t.y) || this.contains(t.x, i) || this.contains(e, t.y) || this.contains(e, i) || t.contains(this.x, this.y) || t.contains(this.x, r) || t.contains(n, this.y) || t.contains(n, r) ? !0 : !1
		}, e.prototype.clone = function() {
			return new e(this.x, this.y, this.width, this.height)
		}, e.prototype.containsPoint = function(t) {
			return this.x < t.x && this.x + this.width > t.x && this.y < t.y && this.y + this.height > t.y ? !0 : !1
		}, e.identity = new e(0, 0, 0, 0), e
	}(t.HashObject);
	t.Rectangle = e, e.prototype.__class__ = "egret.Rectangle"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function e() {}
		return e.fatal = function(e, i) {
			throw "undefined" == typeof i && (i = null), t.Logger.traceToConsole("Fatal", e, i), Error(t.Logger.getTraceCode("Fatal", e, i))
		}, e.info = function(e, i) {
			"undefined" == typeof i && (i = null), t.Logger.traceToConsole("Info", e, i)
		}, e.warning = function(e, i) {
			"undefined" == typeof i && (i = null), t.Logger.traceToConsole("Warning", e, i)
		}, e.traceToConsole = function(e, i, n) {
			console.log(t.Logger.getTraceCode(e, i, n))
		}, e.getTraceCode = function(t, e, i) {
			return "[" + t + "]" + e + ":" + (null == i ? "" : i)
		}, e
	}();
	t.Logger = e, e.prototype.__class__ = "egret.Logger"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this._isSupportDOMParser = this._xmlDict = this._parser = null, this._xmlDict = {}, window.DOMParser ? (this._isSupportDOMParser = !0, this._parser = new DOMParser) : this._isSupportDOMParser = !1
		}
		return __extends(i, e), i.getInstance = function() {
			return i._instance || (i._instance = new i), i._instance
		}, i.prototype.parserXML = function(e) {
			for (var i = 0;
				"\n" == e.charAt(i) || "	" == e.charAt(i) || "\r" == e.charAt(i) || " " == e.charAt(i);) i++;
			return 0 != i && (e = e.substring(i, e.length)), this._isSupportDOMParser ? i = this._parser.parseFromString(e, "text/xml") : (i = new ActiveXObject("Microsoft.XMLDOM"), i.async = "false", i.loadXML(e)), null == i && t.Logger.info("xml not found!"), i
		}, i._instance = null, i
	}(t.HashObject);
	t.SAXParser = e, e.prototype.__class__ = "egret.SAXParser"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this._designHeight = this._designWidth = 0, this._scaleY = this._scaleX = 1, this._offSetY = 0;
			var t = document.getElementById(i.canvas_name),
				n = t.height;
			this._designWidth = t.width, this._designHeight = n
		}
		return __extends(i, e), i.getInstance = function() {
			return null == i.instance && (n.initialize(), i.instance = new i), i.instance
		}, i.prototype.setDesignSize = function(e, i, n) {
			this._designWidth = e, this._designHeight = i, n && (t.Logger.warning("该方法目前不应传入 resolutionPolicy 参数，请在 docs/1.0_Final_ReleaseNote中查看如何升级"), this._setResolutionPolicy(n))
		}, i.prototype._setResolutionPolicy = function(t) {
			this._resolutionPolicy = t, t.init(this), t._apply(this, this._designWidth, this._designHeight)
		}, i.prototype.getScaleX = function() {
			return this._scaleX
		}, i.prototype.getScaleY = function() {
			return this._scaleY
		}, i.prototype.getOffSetY = function() {
			return this._offSetY
		}, i.canvas_name = "gameCanvas", i.canvas_div_name = "gameDiv", i
	}(t.HashObject);
	t.StageDelegate = e, e.prototype.__class__ = "egret.StageDelegate";
	var i = function() {
		function t(t, e) {
			this._containerStrategy = t, this._contentStrategy = e
		}
		return t.prototype.init = function(t) {
			this._containerStrategy.init(t), this._contentStrategy.init(t)
		}, t.prototype._apply = function(t, e, i) {
			this._containerStrategy._apply(t, e, i), this._contentStrategy._apply(t, e, i)
		}, t
	}();
	t.ResolutionPolicy = i, i.prototype.__class__ = "egret.ResolutionPolicy";
	var n = function() {
		function t() {}
		return t.initialize = function() {
			t.EQUAL_TO_FRAME = new r
		}, t.prototype.init = function() {}, t.prototype._apply = function() {}, t.prototype._setupContainer = function() {
			var t, e = document.body;
			e && (t = e.style) && (t.paddingTop = t.paddingTop || "0px", t.paddingRight = t.paddingRight || "0px", t.paddingBottom = t.paddingBottom || "0px", t.paddingLeft = t.paddingLeft || "0px", t.borderTop = t.borderTop || "0px", t.borderRight = t.borderRight || "0px", t.borderBottom = t.borderBottom || "0px", t.borderLeft = t.borderLeft || "0px", t.marginTop = t.marginTop || "0px", t.marginRight = t.marginRight || "0px", t.marginBottom = t.marginBottom || "0px", t.marginLeft = t.marginLeft || "0px")
		}, t
	}();
	t.ContainerStrategy = n, n.prototype.__class__ = "egret.ContainerStrategy";
	var r = function(t) {
		function e() {
			t.apply(this, arguments)
		}
		return __extends(e, t), e.prototype._apply = function() {
			this._setupContainer()
		}, e
	}(n);
	t.EqualToFrame = r, r.prototype.__class__ = "egret.EqualToFrame", i = function() {
		function t() {}
		return t.prototype.init = function() {}, t.prototype._apply = function() {}, t
	}(), t.ContentStrategy = i, i.prototype.__class__ = "egret.ContentStrategy";
	var o = function(t) {
		function i(e) {
			"undefined" == typeof e && (e = 0), t.call(this), this.minWidth = e
		}
		return __extends(i, t), i.prototype._apply = function(t, i, n) {
			i = document.getElementById(e.canvas_name);
			var r = document.getElementById(e.canvas_div_name),
				o = document.documentElement.clientWidth,
				s = document.documentElement.clientHeight,
				a = s / n,
				h = o / a,
				c = 1;
			0 != this.minWidth && (c = Math.min(1, h / this.minWidth)), i.width = h / c, i.height = n, i.style.width = o + "px", i.style.height = s * c + "px", r.style.width = o + "px", r.style.height = s * c + "px", t._scaleX = a * c, t._scaleY = a * c
		}, i
	}(i);
	t.FixedHeight = o, o.prototype.__class__ = "egret.FixedHeight", o = function(t) {
		function i(e) {
			"undefined" == typeof e && (e = 0), t.call(this), this.minHeight = e
		}
		return __extends(i, t), i.prototype._apply = function(t, i, n) {
			n = document.getElementById(e.canvas_name);
			var r = document.getElementById(e.canvas_div_name),
				o = document.documentElement.clientWidth,
				s = document.documentElement.clientHeight,
				a = o / i,
				h = s / a,
				c = 1;
			0 != this.minHeight && (c = Math.min(1, h / this.minHeight)), n.width = i, n.height = h / c, n.style.width = o * c + "px", n.style.height = s + "px", r.style.width = o * c + "px", r.style.height = s + "px", t._scaleX = a * c, t._scaleY = a * c
		}, i
	}(i), t.FixedWidth = o, o.prototype.__class__ = "egret.FixedWidth", o = function(t) {
		function i(e, i) {
			t.call(this), this.width = e, this.height = i
		}
		return __extends(i, t), i.prototype._apply = function(t, i, n) {
			n = document.getElementById(e.canvas_name);
			var r = document.getElementById(e.canvas_div_name),
				o = this.width,
				s = this.height,
				a = o / i;
			n.width = i, n.height = s / a, n.style.width = o + "px", n.style.height = s + "px", r.style.width = o + "px", r.style.height = s + "px", t._scaleX = a, t._scaleY = a
		}, i
	}(i), t.FixedSize = o, o.prototype.__class__ = "egret.FixedSize", o = function(t) {
		function i() {
			t.call(this)
		}
		return __extends(i, t), i.prototype._apply = function(t, i, n) {
			var r = document.getElementById(e.canvas_name);
			r.width = i, r.height = n, r.style.width = i + "px", r.style.height = n + "px", t._scaleX = 1, t._scaleY = 1
		}, i
	}(i), t.NoScale = o, o.prototype.__class__ = "egret.NoScale", o = function(t) {
		function i() {
			t.call(this)
		}
		return __extends(i, t), i.prototype._apply = function(t, i, n) {
			var r = document.getElementById(e.canvas_name),
				o = document.getElementById(e.canvas_div_name),
				s = document.documentElement.clientWidth,
				a = document.documentElement.clientHeight,
				h = a / n > s / i ? s / i : a / n,
				s = i * h,
				a = n * h;
			r.width = i, r.height = n / 1, r.style.width = 1 * s + "px", r.style.height = a + "px", t._offSetY = Math.floor((document.documentElement.clientHeight - a) / 2), r.style.top = t._offSetY + "px", o.style.width = 1 * s + "px", o.style.height = a + "px", t._scaleX = 1 * h, t._scaleY = 1 * h
		}, i
	}(i), t.ShowAll = o, o.prototype.__class__ = "egret.ShowAll", i = function(t) {
		function i() {
			t.call(this)
		}
		return __extends(i, t), i.prototype._apply = function(t, i, n) {
			var r = document.getElementById(e.canvas_name),
				o = document.getElementById(e.canvas_div_name),
				s = document.documentElement.clientWidth,
				a = document.documentElement.clientHeight,
				h = s / i,
				c = a / n,
				s = i * h,
				a = n * c;
			r.width = i, r.height = n, r.style.width = s + "px", r.style.height = a + "px", o.style.width = s + "px", o.style.height = a + "px", t._scaleX = h, t._scaleY = c
		}, i
	}(i), t.FullScreen = i, i.prototype.__class__ = "egret.FullScreen"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this._originalData = {}, this._drawAreaList = []
		}
		return __extends(i, e), i.getInstance = function() {
			return null == i.instance && (i.instance = new i), i.instance
		}, i.prototype.addDrawArea = function(t) {
			this._drawAreaList.push(t)
		}, i.prototype.clearDrawArea = function() {
			this._drawAreaList = []
		}, i.prototype.drawImage = function(e, i, n, r, o, s, a, h, c, u) {
			a = a || 0, h = h || 0;
			var p = i._texture_to_render;
			if (null != p && 0 != s && 0 != o && 0 != c && 0 != u)
				if (i._worldBounds) {
					var l = this._originalData;
					l.sourceX = n, l.sourceY = r, l.sourceWidth = o, l.sourceHeight = s, l.destX = a, l.destY = h, l.destWidth = c, l.destHeight = u;
					for (var d = this.getDrawAreaList(), f = 0; f < d.length; f++) {
						var _ = d[f];
						if (!this.ignoreRender(i, _, l.destX, l.destY)) {
							if (0 != this._drawAreaList.length)
								if (0 != i._worldTransform.b || 0 != i._worldTransform.c) {
									if (i._worldBounds.x + l.destX < _.x || i._worldBounds.y + l.destY < _.y || i._worldBounds.x + i._worldBounds.width + l.destX > _.x + _.width || i._worldBounds.y + i._worldBounds.height + l.destY > _.y + _.height) {
										t.Logger.fatal("请不要让带有旋转和斜切的显示对象跨过重绘区域");
										break
									}
								} else {
									var g, y = i._worldTransform.a,
										m = i._worldTransform.d;
									i._worldBounds.x + l.destX < _.x && (g = (_.x - i._worldBounds.x) / y - l.destX, n += g / (c / o), o -= g / (c / o), c -= g, a += g), i._worldBounds.y + l.destY < _.y && (g = (_.y - i._worldBounds.y) / m - l.destY, r += g / (u / s), s -= g / (u / s), u -= g, h += g), i._worldBounds.x + i._worldBounds.width + l.destX > _.x + _.width && (g = (i._worldBounds.x + i._worldBounds.width - _.x - _.width) / y + l.destX, o -= g / (c / o), c -= g), i._worldBounds.y + i._worldBounds.height + l.destY > _.y + _.height && (g = (i._worldBounds.y + i._worldBounds.height - _.y - _.height) / m + l.destY, s -= g / (u / s), u -= g)
								}
							e.drawImage(p, n, r, o, s, a, h, c, u)
						}
					}
				} else e.drawImage(p, n, r, o, s, a, h, c, u)
		}, i.prototype.ignoreRender = function(t, e, i, n) {
			var r = t._worldBounds;
			return i *= t._worldTransform.a, n *= t._worldTransform.d, r.x + r.width + i <= e.x || r.x + i >= e.x + e.width || r.y + r.height + n <= e.y || r.y + n >= e.y + e.height ? !0 : !1
		}, i.prototype.getDrawAreaList = function() {
			var e;
			return 0 == this._drawAreaList.length ? (this._defaultDrawAreaList || (this._defaultDrawAreaList = [new t.Rectangle(0, 0, t.MainContext.instance.stage.stageWidth, t.MainContext.instance.stage.stageHeight)]), e = this._defaultDrawAreaList) : e = this._drawAreaList, e
		}, i
	}(t.HashObject);
	t.RenderFilter = e, e.prototype.__class__ = "egret.RenderFilter"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function e() {}
		return e.mapClass = function(t, e, i) {
			"undefined" == typeof i && (i = ""), t = this.getKey(t) + "#" + i, this.mapClassDic[t] = e
		}, e.getKey = function(e) {
			return "string" == typeof e ? e : t.getQualifiedClassName(e)
		}, e.mapValue = function(t, e, i) {
			"undefined" == typeof i && (i = ""), t = this.getKey(t) + "#" + i, this.mapValueDic[t] = e
		}, e.hasMapRule = function(t, e) {
			"undefined" == typeof e && (e = "");
			var i = this.getKey(t) + "#" + e;
			return this.mapValueDic[i] || this.mapClassDic[i] ? !0 : !1
		}, e.getInstance = function(t, e) {
			"undefined" == typeof e && (e = "");
			var i = this.getKey(t) + "#" + e;
			if (this.mapValueDic[i]) return this.mapValueDic[i];
			var n = this.mapClassDic[i];
			if (n) return n = new n, this.mapValueDic[i] = n, delete this.mapClassDic[i], n;
			throw Error("调用了未配置的注入规则:" + i + "。 请先在项目初始化里配置指定的注入规则，再调用对应单例。")
		}, e.mapClassDic = {}, e.mapValueDic = {}, e
	}();
	t.Injector = e, e.prototype.__class__ = "egret.Injector"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {}
		return t.NORMAL = "normal", t.ADD = "add", t.LAYER = "layer", t
	}();
	t.BlendMode = e, e.prototype.__class__ = "egret.BlendMode"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this._sizeDirty = this._normalDirty = !0, this._parent = null, this._cacheAsBitmap = !1, this._y = this._x = 0, this._scaleY = this._scaleX = 1, this._anchorY = this._anchorX = this._anchorOffsetY = this._anchorOffsetX = 0, this._visible = !0, this._rotation = 0, this._alpha = 1, this._skewY = this._skewX = 0, this._hasHeightSet = this._hasWidthSet = !1, this.worldAlpha = 1, this._rectH = this._rectW = 0, this._stage = null, this._worldTransform = new t.Matrix, this._cacheBounds = new t.Rectangle(0, 0, 0, 0)
		}
		return __extends(i, e), i.prototype._setDirty = function() {
			this._normalDirty = !0
		}, i.prototype.getDirty = function() {
			return this._normalDirty || this._sizeDirty
		}, i.prototype._setParentSizeDirty = function() {
			var t = this._parent;
			!t || t._hasWidthSet || t._hasHeightSet || t._setSizeDirty()
		}, i.prototype._setSizeDirty = function() {
			this._sizeDirty || (this._sizeDirty = !0, this._setDirty(), this._setParentSizeDirty())
		}, i.prototype._clearDirty = function() {
			this._normalDirty = !1
		}, i.prototype._clearSizeDirty = function() {
			this._sizeDirty = !1
		}, Object.defineProperty(i.prototype, "parent", {
			get: function() {
				return this._parent
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype._parentChanged = function(t) {
			this._parent = t
		}, Object.defineProperty(i.prototype, "x", {
			get: function() {
				return this._x
			},
			set: function(t) {
				this._setX(t)
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype._setX = function(e) {
			t.NumberUtils.isNumber(e) && this._x != e && (this._x = e, this._setDirty(), this._setParentSizeDirty())
		}, Object.defineProperty(i.prototype, "y", {
			get: function() {
				return this._y
			},
			set: function(t) {
				this._setY(t)
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype._setY = function(e) {
			t.NumberUtils.isNumber(e) && this._y != e && (this._y = e, this._setDirty(), this._setParentSizeDirty())
		}, Object.defineProperty(i.prototype, "scaleX", {
			get: function() {
				return this._scaleX
			},
			set: function(e) {
				t.NumberUtils.isNumber(e) && this._scaleX != e && (this._scaleX = e, this._setDirty(), this._setParentSizeDirty())
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "scaleY", {
			get: function() {
				return this._scaleY
			},
			set: function(e) {
				t.NumberUtils.isNumber(e) && this._scaleY != e && (this._scaleY = e, this._setDirty(), this._setParentSizeDirty())
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "anchorOffsetX", {
			get: function() {
				return this._anchorOffsetX
			},
			set: function(e) {
				t.NumberUtils.isNumber(e) && this._anchorOffsetX != e && (this._anchorOffsetX = e, this._setDirty(), this._setParentSizeDirty())
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "anchorOffsetY", {
			get: function() {
				return this._anchorOffsetY
			},
			set: function(e) {
				t.NumberUtils.isNumber(e) && this._anchorOffsetY != e && (this._anchorOffsetY = e, this._setDirty(), this._setParentSizeDirty())
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "anchorX", {
			get: function() {
				return this._anchorX
			},
			set: function(e) {
				t.NumberUtils.isNumber(e) && this._anchorX != e && (this._anchorX = e, this._setDirty(), this._setParentSizeDirty())
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "anchorY", {
			get: function() {
				return this._anchorY
			},
			set: function(e) {
				t.NumberUtils.isNumber(e) && this._anchorY != e && (this._anchorY = e, this._setDirty(), this._setParentSizeDirty())
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "visible", {
			get: function() {
				return this._visible
			},
			set: function(t) {
				this._setVisible(t)
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype._setVisible = function(t) {
			this._visible != t && (this._visible = t, this._setSizeDirty())
		}, Object.defineProperty(i.prototype, "rotation", {
			get: function() {
				return this._rotation
			},
			set: function(e) {
				t.NumberUtils.isNumber(e) && this._rotation != e && (this._rotation = e, this._setSizeDirty())
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "alpha", {
			get: function() {
				return this._alpha
			},
			set: function(e) {
				t.NumberUtils.isNumber(e) && this._alpha != e && (this._alpha = e, this._setDirty())
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "skewX", {
			get: function() {
				return this._skewX
			},
			set: function(e) {
				t.NumberUtils.isNumber(e) && this._skewX != e && (this._skewX = e, this._setSizeDirty())
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "skewY", {
			get: function() {
				return this._skewY
			},
			set: function(e) {
				t.NumberUtils.isNumber(e) && this._skewY != e && (this._skewY = e, this._setSizeDirty())
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "touchEnabled", {
			get: function() {
				return this._touchEnabled
			},
			set: function(t) {
				this._touchEnabled = t
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "scrollRect", {
			get: function() {
				return this._scrollRect
			},
			set: function(t) {
				this._scrollRect = t, this._setSizeDirty()
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "measuredWidth", {
			get: function() {
				return this._measureBounds().width
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "measuredHeight", {
			get: function() {
				return this._measureBounds().height
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "explicitWidth", {
			get: function() {
				return this._explicitWidth
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "explicitHeight", {
			get: function() {
				return this._explicitHeight
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "width", {
			get: function() {
				return this._getSize(t.Rectangle.identity).width
			},
			set: function(t) {
				this._setWidth(t)
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "height", {
			get: function() {
				return this._getSize(t.Rectangle.identity).height
			},
			set: function(t) {
				this._setHeight(t)
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype._setWidth = function(e) {
			this._setSizeDirty(), this._explicitWidth = e, this._hasWidthSet = t.NumberUtils.isNumber(e)
		}, i.prototype._setHeight = function(e) {
			this._setSizeDirty(), this._explicitHeight = e, this._hasHeightSet = t.NumberUtils.isNumber(e)
		}, i.prototype._draw = function(t) {
			if (this._visible && !this.drawCacheTexture(t)) {
				t.setAlpha(this.worldAlpha, this.blendMode), t.setTransform(this._worldTransform);
				var e = this.mask || this._scrollRect;
				e && t.pushMask(e), this._render(t), e && t.popMask()
			}
			this.destroyCacheBounds()
		}, i.prototype.drawCacheTexture = function(e) {
			if (this._cacheAsBitmap) {
				var i = this._texture_to_render,
					n = i._offsetX,
					r = i._offsetY,
					o = i._textureWidth,
					i = i._textureHeight;
				this._updateTransform(), e.setAlpha(this.worldAlpha, this.blendMode), e.setTransform(this._worldTransform);
				var s = t.MainContext.instance.rendererContext.texture_scale_factor;
				return t.RenderFilter.getInstance().drawImage(e, this, 0, 0, o * s, i * s, n, r, o, i), !0
			}
			return !1
		}, i.prototype._updateTransform = function() {
			this._calculateWorldform()
		}, i.prototype._calculateWorldform = function() {
			this._worldTransform.identityMatrix(this._parent._worldTransform);
			var t = this._getOffsetPoint();
			this._worldTransform.appendTransform(this._x, this._y, this._scaleX, this._scaleY, this._rotation, this._skewX, this._skewY, t.x, t.y), this._scrollRect && this._worldTransform.append(1, 0, 0, 1, -this._scrollRect.x, -this._scrollRect.y), this.worldAlpha = this._parent.worldAlpha * this._alpha
		}, i.prototype._render = function() {}, i.prototype.getBounds = function(e) {
			var i, n, r = this._measureBounds(),
				o = this._hasWidthSet ? this._explicitWidth : r.width,
				s = this._hasHeightSet ? this._explicitHeight : r.height,
				a = r.x,
				r = r.y;
			return 0 != this._anchorX || 0 != this._anchorY ? (i = o * this._anchorX, n = s * this._anchorY) : (i = this._anchorOffsetX, n = this._anchorOffsetY), this._cacheBounds.initialize(a - i, r - n, o, s), o = this._cacheBounds, e || (e = new t.Rectangle), e.initialize(o.x, o.y, o.width, o.height)
		}, i.prototype.destroyCacheBounds = function() {
			this._cacheBounds.x = 0, this._cacheBounds.y = 0, this._cacheBounds.width = 0, this._cacheBounds.height = 0
		}, i.prototype._getConcatenatedMatrix = function() {
			for (var e = i.identityMatrixForGetConcatenated.identity(), n = this; null != n;) {
				if (0 != n._anchorX || 0 != n._anchorY) {
					var r = n._getSize(t.Rectangle.identity);
					e.prependTransform(n._x, n._y, n._scaleX, n._scaleY, n._rotation, n._skewX, n._skewY, r.width * n._anchorX, r.height * n._anchorY)
				} else e.prependTransform(n._x, n._y, n._scaleX, n._scaleY, n._rotation, n._skewX, n._skewY, n._anchorOffsetX, n._anchorOffsetY);
				n = n._parent
			}
			return e
		}, i.prototype.localToGlobal = function(e, i, n) {
			"undefined" == typeof e && (e = 0), "undefined" == typeof i && (i = 0);
			var r = this._getConcatenatedMatrix();
			return r.append(1, 0, 0, 1, e, i), n || (n = new t.Point), n.x = r.tx, n.y = r.ty, n
		}, i.prototype.globalToLocal = function(e, i, n) {
			"undefined" == typeof e && (e = 0), "undefined" == typeof i && (i = 0);
			var r = this._getConcatenatedMatrix();
			return r.invert(), r.append(1, 0, 0, 1, e, i), n || (n = new t.Point), n.x = r.tx, n.y = r.ty, n
		}, i.prototype.hitTest = function(e, i, n) {
			return "undefined" == typeof n && (n = !1), this._visible && (n || this._touchEnabled) ? (n = this._getSize(t.Rectangle.identity), e >= 0 && e < n.width && i >= 0 && i < n.height ? this.mask || this._scrollRect ? this._scrollRect && e < this._scrollRect.width && i < this._scrollRect.height || this.mask && this.mask.x <= e && e < this.mask.x + this.mask.width && this.mask.y <= i && i < this.mask.y + this.mask.height ? this : null : this : null) : null
		}, i.prototype.hitTestPoint = function(e, i, n) {
			return e = this.globalToLocal(e, i), n ? (this._hitTestPointTexture || (this._hitTestPointTexture = new t.RenderTexture), n = this._hitTestPointTexture, n.drawToTexture(this), 0 != n.getPixel32(e.x - this._hitTestPointTexture._offsetX, e.y - this._hitTestPointTexture._offsetY)[3] ? !0 : !1) : !! this.hitTest(e.x, e.y, !0)
		}, i.prototype._getMatrix = function() {
			var e = t.Matrix.identity.identity(),
				i = this._getOffsetPoint();
			return e.appendTransform(this._x, this._y, this._scaleX, this._scaleY, this._rotation, this._skewX, this._skewY, i.x, i.y), e
		}, i.prototype._getSize = function(e) {
			return this._hasHeightSet && this._hasWidthSet ? e.initialize(0, 0, this._explicitWidth, this._explicitHeight) : this._measureSize(t.Rectangle.identity)
		}, i.prototype._measureSize = function(t) {
			return this._sizeDirty ? (t = this._measureBounds(), this._rectW = t.width, this._rectH = t.height, this._clearSizeDirty()) : (t.width = this._rectW, t.height = this._rectH), t
		}, i.prototype._measureBounds = function() {
			return t.Rectangle.identity.initialize(0, 0, 0, 0)
		}, i.prototype._getOffsetPoint = function() {
			var e = this._anchorOffsetX,
				i = this._anchorOffsetY;
			(0 != this._anchorX || 0 != this._anchorY) && (i = this._getSize(t.Rectangle.identity), e = this._anchorX * i.width, i = this._anchorY * i.height);
			var n = t.Point.identity;
			return n.x = e, n.y = i, n
		}, i.prototype._onAddToStage = function() {
			this._stage = t.MainContext.instance.stage, t.DisplayObjectContainer.__EVENT__ADD_TO_STAGE_LIST.push(this)
		}, i.prototype._onRemoveFromStage = function() {
			this._stage = null, t.DisplayObjectContainer.__EVENT__REMOVE_FROM_STAGE_LIST.push(this)
		}, Object.defineProperty(i.prototype, "stage", {
			get: function() {
				return this._stage
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype.addEventListener = function(n, r, o, s, a) {
			"undefined" == typeof s && (s = !1), "undefined" == typeof a && (a = 0), e.prototype.addEventListener.call(this, n, r, o, s, a), ((s = n == t.Event.ENTER_FRAME) || n == t.Event.RENDER) && this._insertEventBin(s ? i._enterFrameCallBackList : i._renderCallBackList, r, o, a)
		}, i.prototype.removeEventListener = function(n, r, o, s) {
			"undefined" == typeof s && (s = !1), e.prototype.removeEventListener.call(this, n, r, o, s), ((s = n == t.Event.ENTER_FRAME) || n == t.Event.RENDER) && this._removeEventBin(s ? i._enterFrameCallBackList : i._renderCallBackList, r, o)
		}, i.prototype.dispatchEvent = function(t) {
			if (!t._bubbles) return e.prototype.dispatchEvent.call(this, t);
			for (var i = [], n = this; n;) i.push(n), n = n._parent;
			return t._reset(), this._dispatchPropagationEvent(t, i), !t._isDefaultPrevented
		}, i.prototype._dispatchPropagationEvent = function(t, e, i) {
			i = e.length;
			for (var n = 1, r = i - 1; r >= 0; r--) {
				var o = e[r];
				if (t._currentTarget = o, t._target = this, t._eventPhase = n, o._notifyListener(t), t._isPropagationStopped || t._isPropagationImmediateStopped) return
			}
			if (o = e[0], t._currentTarget = o, t._target = this, t._eventPhase = 2, o._notifyListener(t), !t._isPropagationStopped && !t._isPropagationImmediateStopped)
				for (n = 3, r = 1; i > r && (o = e[r], t._currentTarget = o, t._target = this, t._eventPhase = n, o._notifyListener(t), !t._isPropagationStopped && !t._isPropagationImmediateStopped); r++);
		}, i.prototype.willTrigger = function(t) {
			for (var e = this; e;) {
				if (e.hasEventListener(t)) return !0;
				e = e._parent
			}
			return !1
		}, Object.defineProperty(i.prototype, "cacheAsBitmap", {
			get: function() {
				return this._cacheAsBitmap
			},
			set: function(e) {
				(this._cacheAsBitmap = e) ? (this.renderTexture || (this.renderTexture = new t.RenderTexture), this.renderTexture.drawToTexture(this), this._texture_to_render = this.renderTexture) : this._texture_to_render = null
			},
			enumerable: !0,
			configurable: !0
		}), i.getTransformBounds = function(t, e) {
			var i, n, r = t.width,
				o = t.height,
				s = r * e.a,
				r = r * e.b,
				a = o * e.c,
				o = o * e.d,
				h = e.tx,
				c = e.ty,
				u = h,
				p = h,
				l = c,
				d = c;
			return (i = s + h) < u ? u = i : i > p && (p = i), (i = s + a + h) < u ? u = i : i > p && (p = i), (i = a + h) < u ? u = i : i > p && (p = i), (n = r + c) < l ? l = n : n > d && (d = n), (n = r + o + c) < l ? l = n : n > d && (d = n), (n = o + c) < l ? l = n : n > d && (d = n), t.initialize(u, l, p - u, d - l)
		}, i.identityMatrixForGetConcatenated = new t.Matrix, i._enterFrameCallBackList = [], i._renderCallBackList = [], i
	}(t.EventDispatcher);
	t.DisplayObject = e, e.prototype.__class__ = "egret.DisplayObject"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this._touchChildren = !0, this._children = []
		}
		return __extends(i, e), Object.defineProperty(i.prototype, "touchChildren", {
			get: function() {
				return this._touchChildren
			},
			set: function(t) {
				this._touchChildren = t
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "numChildren", {
			get: function() {
				return this._children.length
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype.setChildIndex = function(t, e) {
			this.doSetChildIndex(t, e)
		}, i.prototype.doSetChildIndex = function(e, i) {
			var n = this._children.indexOf(e);
			0 > n && t.Logger.fatal("child不在当前容器内"), this._children.splice(n, 1), 0 > i || this._children.length <= i ? this._children.push(e) : this._children.splice(i, 0, e)
		}, i.prototype.addChild = function(t) {
			var e = this._children.length;
			return t._parent == this && e--, this._doAddChild(t, e)
		}, i.prototype.addChildAt = function(t, e) {
			return this._doAddChild(t, e)
		}, i.prototype._doAddChild = function(e, n, r) {
			if ("undefined" == typeof r && (r = !0), e == this) return e;
			if (0 > n || n > this._children.length) return t.Logger.fatal("提供的索引超出范围"), e;
			var o = e._parent;
			if (o == this) return this.doSetChildIndex(e, n), e;
			if (o && o.removeChild(e), this._children.splice(n, 0, e), e._parentChanged(this), r && e.dispatchEventWith(t.Event.ADDED, !0), this._stage)
				for (e._onAddToStage(), n = i.__EVENT__ADD_TO_STAGE_LIST; 0 < n.length;) n.shift().dispatchEventWith(t.Event.ADDED_TO_STAGE);
			return e._setDirty(), this._setSizeDirty(), e
		}, i.prototype.removeChild = function(e) {
			return e = this._children.indexOf(e), e >= 0 ? this._doRemoveChild(e) : (t.Logger.fatal("child未被addChild到该parent"), null)
		}, i.prototype.removeChildAt = function(e) {
			return e >= 0 && e < this._children.length ? this._doRemoveChild(e) : (t.Logger.fatal("提供的索引超出范围"), null)
		}, i.prototype._doRemoveChild = function(e, n) {
			"undefined" == typeof n && (n = !0);
			var r = this._children,
				o = r[e];
			if (n && o.dispatchEventWith(t.Event.REMOVED, !0), this._stage) {
				o._onRemoveFromStage();
				for (var s = i.__EVENT__REMOVE_FROM_STAGE_LIST; 0 < s.length;) s.shift().dispatchEventWith(t.Event.REMOVED_FROM_STAGE)
			}
			return o._parentChanged(null), r.splice(e, 1), this._setSizeDirty(), o
		}, i.prototype.getChildAt = function(e) {
			return e >= 0 && e < this._children.length ? this._children[e] : (t.Logger.fatal("提供的索引超出范围"), null)
		}, i.prototype.contains = function(t) {
			for (; t;) {
				if (t == this) return !0;
				t = t._parent
			}
			return !1
		}, i.prototype.swapChildrenAt = function(e, i) {
			e >= 0 && e < this._children.length && i >= 0 && i < this._children.length ? this._swapChildrenAt(e, i) : t.Logger.fatal("提供的索引超出范围")
		}, i.prototype.swapChildren = function(e, i) {
			var n = this._children.indexOf(e),
				r = this._children.indexOf(i); - 1 == n || -1 == r ? t.Logger.fatal("child未被addChild到该parent") : this._swapChildrenAt(n, r)
		}, i.prototype._swapChildrenAt = function(t, e) {
			if (t != e) {
				var i = this._children,
					n = i[t];
				i[t] = i[e], i[e] = n
			}
		}, i.prototype.getChildIndex = function(t) {
			return this._children.indexOf(t)
		}, i.prototype.removeChildren = function() {
			for (var t = this._children.length - 1; t >= 0; t--) this._doRemoveChild(t)
		}, i.prototype._updateTransform = function() {
			if (this._visible) {
				e.prototype._updateTransform.call(this);
				for (var t = 0, i = this._children.length; i > t; t++) this._children[t]._updateTransform()
			}
		}, i.prototype._render = function(t) {
			for (var e = 0, i = this._children.length; i > e; e++) this._children[e]._draw(t)
		}, i.prototype._measureBounds = function() {
			for (var e = 0, i = 0, n = 0, r = 0, o = this._children.length, s = 0; o > s; s++) {
				var a, h = this._children[s];
				if (h._visible && (a = t.DisplayObject.getTransformBounds(h._getSize(t.Rectangle.identity), h._getMatrix()))) {
					var h = a.x,
						c = a.y,
						u = a.width + a.x,
						p = a.height + a.y;
					(e > h || 0 == s) && (e = h), (u > i || 0 == s) && (i = u), (n > c || 0 == s) && (n = c), (p > r || 0 == s) && (r = p)
				}
			}
			return t.Rectangle.identity.initialize(e, n, i - e, r - n)
		}, i.prototype.hitTest = function(i, n, r) {
			"undefined" == typeof r && (r = !1);
			var o;
			if (!this._visible) return null;
			if (this._scrollRect) {
				if (0 > i || 0 > n || i > this._scrollRect.width || n > this._scrollRect.height) return null
			} else if (this.mask && (this.mask.x > i || i > this.mask.x + this.mask.width || this.mask.y > n || n > this.mask.y + this.mask.height)) return null;
			for (var s = this._children, a = this._touchChildren, h = s.length - 1; h >= 0; h--) {
				var c = s[h],
					u = c,
					p = u._getOffsetPoint(),
					l = u._x,
					d = u._y;
				if (this._scrollRect && (l -= this._scrollRect.x, d -= this._scrollRect.y), u = t.Matrix.identity.identity().prependTransform(l, d, u._scaleX, u._scaleY, u._rotation, 0, 0, p.x, p.y), u.invert(), u = t.Matrix.transformCoords(u, i, n), c = c.hitTest(u.x, u.y, !0)) {
					if (!a) return this;
					if (c._touchEnabled && a) return c;
					o = this
				}
			}
			return o ? o : this._texture_to_render || this.graphics ? e.prototype.hitTest.call(this, i, n, r) : null
		}, i.prototype._onAddToStage = function() {
			e.prototype._onAddToStage.call(this);
			for (var t = this._children.length, i = 0; t > i; i++) this._children[i]._onAddToStage()
		}, i.prototype._onRemoveFromStage = function() {
			e.prototype._onRemoveFromStage.call(this);
			for (var t = this._children.length, i = 0; t > i; i++) this._children[i]._onRemoveFromStage()
		}, i.prototype.getChildByName = function(t) {
			for (var e, i = this._children, n = i.length, r = 0; n > r; r++)
				if (e = i[r], e.name == t) return e;
			return null
		}, i.__EVENT__ADD_TO_STAGE_LIST = [], i.__EVENT__REMOVE_FROM_STAGE_LIST = [], i
	}(t.DisplayObject);
	t.DisplayObjectContainer = e, e.prototype.__class__ = "egret.DisplayObjectContainer"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(t, i) {
			"undefined" == typeof t && (t = 480), "undefined" == typeof i && (i = 800), e.call(this), this.touchEnabled = !0, this._stage = this, this._stageWidth = t, this._stageHeight = i
		}
		return __extends(i, e), i.prototype.invalidate = function() {
			i._invalidateRenderFlag = !0
		}, Object.defineProperty(i.prototype, "scaleMode", {
			get: function() {
				return this._scaleMode
			},
			set: function(e) {
				if (this._scaleMode != e) {
					this._scaleMode = e;
					var i = {};
					if (i[t.StageScaleMode.NO_SCALE] = new t.NoScale, i[t.StageScaleMode.SHOW_ALL] = new t.ShowAll, i[t.StageScaleMode.NO_BORDER] = new t.FixedWidth, i[t.StageScaleMode.EXACT_FIT] = new t.FullScreen, e = i[e], !e) throw Error("使用了尚未实现的ScaleMode");
					i = new t.EqualToFrame, e = new t.ResolutionPolicy(i, e), t.StageDelegate.getInstance()._setResolutionPolicy(e), e = document.getElementById(t.StageDelegate.canvas_name), this._stageWidth = e.width, this._stageHeight = e.height, this.dispatchEventWith(t.Event.RESIZE)
				}
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "stageWidth", {
			get: function() {
				return this._stageWidth
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "stageHeight", {
			get: function() {
				return this._stageHeight
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype.hitTest = function(e, i) {
			if (!this._touchEnabled) return null;
			var n;
			if (!this._touchChildren) return this;
			for (var r = this._children, o = r.length - 1; o >= 0; o--) {
				var s = n = r[o],
					a = s._getOffsetPoint(),
					s = t.Matrix.identity.identity().prependTransform(s._x, s._y, s._scaleX, s._scaleY, s._rotation, 0, 0, a.x, a.y);
				if (s.invert(), s = t.Matrix.transformCoords(s, e, i), (n = n.hitTest(s.x, s.y, !0)) && n._touchEnabled) return n
			}
			return this
		}, i.prototype.getBounds = function(e) {
			return e || (e = new t.Rectangle), e.initialize(0, 0, this._stageWidth, this._stageHeight)
		}, i.prototype._updateTransform = function() {
			for (var t = 0, e = this._children.length; e > t; t++) this._children[t]._updateTransform()
		}, i._invalidateRenderFlag = !1, i
	}(t.DisplayObjectContainer);
	t.Stage = e, e.prototype.__class__ = "egret.Stage"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {}
		return t.NO_BORDER = "noBorder", t.NO_SCALE = "noScale", t.SHOW_ALL = "showAll", t.EXACT_FIT = "exactFit", t
	}();
	t.StageScaleMode = e, e.prototype.__class__ = "egret.StageScaleMode"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {}
		return t.REPEAT = "repeat", t.SCALE = "scale", t
	}();
	t.BitmapFillMode = e, e.prototype.__class__ = "egret.BitmapFillMode"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(t) {
			e.call(this), this.debug = !1, this.debugColor = 16711680, this.fillMode = "scale", t && (this._texture = t, this._setSizeDirty())
		}
		return __extends(i, e), Object.defineProperty(i.prototype, "texture", {
			get: function() {
				return this._texture
			},
			set: function(t) {
				t != this._texture && (this._setSizeDirty(), this._texture = t)
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype._render = function(t) {
			var e = this._texture;
			e ? (this._texture_to_render = e, i._drawBitmap(t, this._hasWidthSet ? this._explicitWidth : e._textureWidth, this._hasHeightSet ? this._explicitHeight : e._textureHeight, this)) : this._texture_to_render = null
		}, i._drawBitmap = function(e, n, r, o) {
			var s = o._texture_to_render;
			if (s) {
				var a = s._textureWidth,
					h = s._textureHeight;
				if ("scale" == o.fillMode) {
					var c = o.scale9Grid || s.scale9Grid;
					if (c && a - c.width < n && h - c.height < r) i.drawScale9GridImage(e, o, c, n, r);
					else {
						var c = s._offsetX,
							u = s._offsetY,
							p = s._bitmapWidth || a,
							l = s._bitmapHeight || h;
						n /= a, c = Math.round(c * n), n = Math.round(p * n), r /= h, u = Math.round(u * r), r = Math.round(l * r), t.RenderFilter.getInstance().drawImage(e, o, s._bitmapX, s._bitmapY, p, l, c, u, n, r)
					}
				} else i.drawRepeatImage(e, o, n, r)
			}
		}, i.drawRepeatImage = function(e, i, n, r) {
			var o = i._texture_to_render;
			if (o)
				for (var s = o._textureWidth, a = o._textureHeight, h = o._bitmapX, c = o._bitmapY, u = o._bitmapWidth || s, p = o._bitmapHeight || a, l = o._offsetX, o = o._offsetY, d = t.RenderFilter.getInstance(); n > l; l += s)
					for (var f = o; r > f; f += a) {
						var _ = Math.min(u, n - l),
							g = Math.min(p, r - f);
						d.drawImage(e, i, h, c, _, g, l, f, _, g)
					}
		}, i.drawScale9GridImage = function(e, i, n, r, o) {
			var s = i._texture_to_render;
			if (s && n) {
				var a = t.RenderFilter.getInstance(),
					h = s._textureWidth,
					c = s._textureHeight,
					u = s._bitmapX,
					p = s._bitmapY,
					l = s._bitmapWidth || h,
					d = s._bitmapHeight || c,
					f = s._offsetX,
					s = s._offsetY;
				n = t.Rectangle.identity.initialize(n.x - Math.round(f), n.y - Math.round(f), n.width, n.height), f = Math.round(f), s = Math.round(s), r -= h - l, o -= c - d, n.y == n.bottom && (n.bottom < d ? n.bottom++ : n.y--), n.x == n.right && (n.right < l ? n.right++ : n.x--);
				var h = u + n.x,
					c = u + n.right,
					_ = l - n.right,
					g = p + n.y,
					y = p + n.bottom,
					m = d - n.bottom,
					v = f + n.x,
					x = s + n.y,
					d = o - (d - n.bottom),
					l = r - (l - n.right);
				a.drawImage(e, i, u, p, n.x, n.y, f, s, n.x, n.y), a.drawImage(e, i, h, p, n.width, n.y, v, s, l - n.x, n.y), a.drawImage(e, i, c, p, _, n.y, f + l, s, r - l, n.y), a.drawImage(e, i, u, g, n.x, n.height, f, x, n.x, d - n.y), a.drawImage(e, i, h, g, n.width, n.height, v, x, l - n.x, d - n.y), a.drawImage(e, i, c, g, _, n.height, f + l, x, r - l, d - n.y), a.drawImage(e, i, u, y, n.x, m, f, s + d, n.x, o - d), a.drawImage(e, i, h, y, n.width, m, v, s + d, l - n.x, o - d), a.drawImage(e, i, c, y, _, m, f + l, s + d, r - l, o - d)
			}
		}, i.prototype._measureBounds = function() {
			var i = this._texture;
			return i ? t.Rectangle.identity.initialize(i._offsetX, i._offsetY, i._textureWidth, i._textureHeight) : e.prototype._measureBounds.call(this)
		}, i.debug = !1, i
	}(t.DisplayObject);
	t.Bitmap = e, e.prototype.__class__ = "egret.Bitmap"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this._text = "", this._textChanged = !1, this._bitmapPool = []
		}
		return __extends(i, e), Object.defineProperty(i.prototype, "text", {
			get: function() {
				return this._text
			},
			set: function(t) {
				this._textChanged = !0, this._text = t
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype._updateTransform = function() {
			this.visible && (this._textChanged && this._renderText(), e.prototype._updateTransform.call(this))
		}, i.prototype._renderText = function(e) {
			var i = e = 0;
			this._textChanged && this.removeChildren();
			for (var n = 0, r = this.text.length; r > n; n++) {
				var o = this.text.charAt(n),
					s = this.spriteSheet.getTexture(o);
				if (null == s) console.log("当前没有位图文字：" + o);
				else {
					var o = s._offsetX,
						a = s._offsetY,
						h = s._textureWidth;
					if (this._textChanged) {
						var c = this._bitmapPool[n];
						c || (c = new t.Bitmap, this._bitmapPool.push(c)), c.texture = s, this.addChild(c), c.x = e
					}
					e += h + o, a + s._textureHeight > i && (i = a + s._textureHeight)
				}
			}
			return this._textChanged = !1, t.Rectangle.identity.initialize(0, 0, e, i)
		}, i.prototype._measureBounds = function() {
			return this._renderText(!0)
		}, i
	}(t.DisplayObjectContainer);
	t.BitmapText = e, e.prototype.__class__ = "egret.BitmapText"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {
			this.commandQueue = []
		}
		return t.prototype.beginFill = function() {}, t.prototype._setStyle = function() {}, t.prototype.drawRect = function() {}, t.prototype.drawCircle = function() {}, t.prototype.drawRoundRect = function() {}, t.prototype.drawEllipse = function() {}, t.prototype.lineStyle = function() {}, t.prototype.lineTo = function() {}, t.prototype.curveTo = function() {}, t.prototype.moveTo = function() {}, t.prototype.clear = function() {}, t.prototype.endFill = function() {}, t.prototype._draw = function() {}, t
	}();
	t.Graphics = e, e.prototype.__class__ = "egret.Graphics",
	function() {
		return function(t, e, i) {
			this.method = t, this.thisObject = e, this.args = i
		}
	}().prototype.__class__ = "Command"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this)
		}
		return __extends(i, e), Object.defineProperty(i.prototype, "graphics", {
			get: function() {
				return this._graphics || (this._graphics = new t.Graphics), this._graphics
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype._render = function(t) {
			this._graphics && this._graphics._draw(t)
		}, i
	}(t.DisplayObject);
	t.Shape = e, e.prototype.__class__ = "egret.Shape"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this)
		}
		return __extends(i, e), Object.defineProperty(i.prototype, "graphics", {
			get: function() {
				return this._graphics || (this._graphics = new t.Graphics), this._graphics
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype._render = function(t) {
			this._graphics && this._graphics._draw(t), e.prototype._render.call(this, t)
		}, i
	}(t.DisplayObjectContainer);
	t.Sprite = e, e.prototype.__class__ = "egret.Sprite"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this._fontFamily = "Arial", this._size = 30, this._textColorString = "#FFFFFF", this._textColor = 16777215, this._strokeColorString = "#000000", this._stroke = this._strokeColor = 0, this._textAlign = "left", this._verticalAlign = "top", this._numLines = this._lineSpacing = 0, this.measuredWidths = []
		}
		return __extends(i, e), Object.defineProperty(i.prototype, "text", {
			get: function() {
				return this._text
			},
			set: function(t) {
				this._text != t && (this._setTextDirty(), this._text = t)
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype._setTextDirty = function() {
			this._setSizeDirty()
		}, Object.defineProperty(i.prototype, "fontFamily", {
			get: function() {
				return this._fontFamily
			},
			set: function(t) {
				this._fontFamily != t && (this._setTextDirty(), this._fontFamily = t)
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "size", {
			get: function() {
				return this._size
			},
			set: function(t) {
				this._size != t && (this._setTextDirty(), this._size = t)
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "italic", {
			get: function() {
				return this._italic
			},
			set: function(t) {
				this._italic != t && (this._setTextDirty(), this._italic = t)
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "bold", {
			get: function() {
				return this._bold
			},
			set: function(t) {
				this._bold != t && (this._setTextDirty(), this._bold = t)
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "textColor", {
			get: function() {
				return this._textColor
			},
			set: function(e) {
				this._textColor != e && (this._setTextDirty(), this._textColor = e, this._textColorString = t.toColorString(e))
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "strokeColor", {
			get: function() {
				return this._strokeColor
			},
			set: function(e) {
				this._strokeColor != e && (this._setTextDirty(), this._strokeColor = e, this._strokeColorString = t.toColorString(e))
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "stroke", {
			get: function() {
				return this._stroke
			},
			set: function(t) {
				this._stroke != t && (this._setTextDirty(), this._stroke = t)
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "textAlign", {
			get: function() {
				return this._textAlign
			},
			set: function(t) {
				this._textAlign != t && (this._setTextDirty(), this._textAlign = t)
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "verticalAlign", {
			get: function() {
				return this._verticalAlign
			},
			set: function(t) {
				this._verticalAlign != t && (this._setTextDirty(), this._verticalAlign = t)
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "lineSpacing", {
			get: function() {
				return this._lineSpacing
			},
			set: function(t) {
				this._lineSpacing != t && (this._setTextDirty(), this._lineSpacing = t)
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "numLines", {
			get: function() {
				return this._numLines
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype._render = function(t) {
			this.drawText(t, !1), this._clearDirty()
		}, i.prototype._measureBounds = function() {
			return this.drawText(t.MainContext.instance.rendererContext, !0)
		}, i.prototype.drawText = function(e, i) {
			var n = this.getTextLines(e);
			if (!n) return t.Rectangle.identity.initialize(0, 0, 0, 0);
			var r = n.length,
				o = .5 * this._size,
				s = this._size + this._lineSpacing,
				a = r * s - this._lineSpacing;
			this._textHeight = a;
			var h = this._hasHeightSet ? this._explicitHeight : Number.POSITIVE_INFINITY;
			if (this._hasHeightSet && h > a) {
				var c = 0;
				this._verticalAlign == t.VerticalAlign.MIDDLE ? c = .5 : this._verticalAlign == t.VerticalAlign.BOTTOM && (c = 1), o += c * (h - a)
			}
			var c = o = Math.round(o),
				u = 0;
			this._textAlign == t.HorizontalAlign.CENTER ? u = .5 : this._textAlign == t.HorizontalAlign.RIGHT && (u = 1);
			var p, l = this.measuredWidths;
			p = this._hasWidthSet ? this._explicitWidth : this._textWidth;
			for (var d = Number.POSITIVE_INFINITY, f = 0; r > f; f++) {
				var _ = n[f],
					g = Math.round((p - l[f]) * u);
				d > g && (d = g), !i && h > o && e.drawText(this, _, g, o, p), o += s
			}
			return t.Rectangle.identity.initialize(d, c, p, a)
		}, i.prototype.getTextLines = function(t) {
			var e = this.text ? this.text.toString() : "";
			if (!e) return null;
			var i = this.measuredWidths;
			i.length = 0, t.setupFont(this);
			var e = e.split(/(?:\r\n|\r|\n)/),
				n = e.length,
				r = 0;
			if (this._hasWidthSet)
				for (var o = this._explicitWidth, s = 0; n > s; s++) {
					var a = e[s],
						h = t.measureText(a);
					if (h > o) {
						for (var c = "", u = 0, p = a.length, l = 0; p > l; l++) {
							var d = a.charAt(l),
								h = t.measureText(d);
							u + h > o && (0 == u ? (e.splice(s, 0, d), i[s] = h, h > r && (r = h), h = 0, d = "") : (e.splice(s, 0, c), i[s] = u, u > r && (r = u), c = "", u = 0), s++, n++), u += h, c += d
						}
						e[s] = c, i[s] = u
					} else i[s] = h, h > r && (r = h)
				} else
					for (s = 0; n > s; s++) a = e[s], h = t.measureText(a), i[s] = h, h > r && (r = h);
			return this._textWidth = r, e
		}, i
	}(t.DisplayObject);
	t.TextField = e, e.prototype.__class__ = "egret.TextField"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {}
		return t.DYNAMIC = "dynamic", t.INPUT = "input", t
	}();
	t.TextFieldType = e, e.prototype.__class__ = "egret.TextFieldType"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(t) {
			e.call(this);
			var i = t.bitmapData;
			this.bitmapData = i, this._textureMap = {}, this._sourceWidth = i.width, this._sourceHeight = i.height, this._bitmapX = t._bitmapX - t._offsetX, this._bitmapY = t._bitmapY - t._offsetY
		}
		return __extends(i, e), i.prototype.getTexture = function(t) {
			return this._textureMap[t]
		}, i.prototype.createTexture = function(e, i, n, r, o, s, a, h, c) {
			"undefined" == typeof s && (s = 0), "undefined" == typeof a && (a = 0), "undefined" == typeof h && (h = s + r), "undefined" == typeof c && (c = a + o);
			var u = new t.Texture;
			return u._bitmapData = this.bitmapData, u._bitmapX = this._bitmapX + i, u._bitmapY = this._bitmapY + n, u._bitmapWidth = r, u._bitmapHeight = o, u._offsetX = s, u._offsetY = a, u._textureWidth = h, u._textureHeight = c, u._sourceWidth = this._sourceWidth, u._sourceHeight = this._sourceHeight, this._textureMap[e] = u
		}, i
	}(t.HashObject);
	t.SpriteSheet = e, e.prototype.__class__ = "egret.SpriteSheet"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this._size = 30, this._textColorString = "#FFFFFF", this._textColor = 16777215, this.stageText = new t.StageText;
			var i = this.localToGlobal();
			this.stageText._open(i.x, i.y, this._explicitWidth, this._explicitHeight)
		}
		return __extends(i, e), i.prototype._onAddToStage = function() {
			e.prototype._onAddToStage.call(this), this.stageText._add(), this.addEventListener(t.TouchEvent.TOUCH_BEGIN, this.onMouseDownHandler, this)
		}, i.prototype.setText = function(e) {
			t.Logger.warning("TextInput.setText()已废弃，请使用TextInput.text设置"), this.stageText._setText(e)
		}, i.prototype.getText = function() {
			return t.Logger.warning("TextInput.getText()已废弃，请使用TextInput.text获取"), this.stageText._getText()
		}, Object.defineProperty(i.prototype, "text", {
			get: function() {
				return this.stageText._getText()
			},
			set: function(t) {
				this.stageText._setText(t)
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype.setTextType = function(t) {
			this.stageText._setTextType(t)
		}, i.prototype.getTextType = function() {
			return this.stageText._getTextType()
		}, i.prototype.onMouseDownHandler = function() {}, i.prototype._onRemoveFromStage = function() {
			this.stageText._remove()
		}, i.prototype._measureBounds = function() {
			return t.Rectangle.identity
		}, i.prototype.hitTest = function() {
			return null
		}, i.prototype._updateTransform = function() {
			var t = this._worldTransform.a,
				i = this._worldTransform.b,
				n = this._worldTransform.c,
				r = this._worldTransform.d,
				o = this._worldTransform.tx,
				s = this._worldTransform.ty;
			e.prototype._updateTransform.call(this);
			var a = this._worldTransform;
			(t != a.a || i != a.b || n != a.c || r != a.d || o != a.tx || s != a.ty) && (t = this.localToGlobal(), this.stageText.changePosition(t.x, t.y), this.stageText.changeSize(this._explicitWidth, this._explicitHeight))
		}, Object.defineProperty(i.prototype, "size", {
			get: function() {
				return this._size
			},
			set: function(t) {
				this._size != t && (this._size = t, this.stageText.setSize(this._size))
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "textColor", {
			get: function() {
				return this._textColor
			},
			set: function(e) {
				this._textColor != e && (this._textColor = e, this._textColorString = t.toColorString(e), this.stageText.setTextColor(this._textColorString))
			},
			enumerable: !0,
			configurable: !0
		}), i
	}(t.DisplayObject);
	t.TextInput = e, e.prototype.__class__ = "egret.TextInput"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(t) {
		function e(e, i) {
			t.call(this, e), this.charList = this.parseConfig(i)
		}
		return __extends(e, t), e.prototype.getTexture = function(t) {
			var e = this._textureMap[t];
			if (!e) {
				if (e = this.charList[t], !e) return null;
				e = this.createTexture(t, e.x, e.y, e.width, e.height, e.offsetX, e.offsetY), this._textureMap[t] = e
			}
			return e
		}, e.prototype.parseConfig = function(t) {
			t = t.split("\r\n").join("\n"), t = t.split("\n");
			for (var e = this.getConfigByKey(t[3], "count"), i = {}, n = 4; 4 + e > n; n++) {
				var r = t[n],
					o = String.fromCharCode(this.getConfigByKey(r, "id")),
					s = {};
				i[o] = s, s.x = this.getConfigByKey(r, "x"), s.y = this.getConfigByKey(r, "y"), s.width = this.getConfigByKey(r, "width"), s.height = this.getConfigByKey(r, "height"), s.offsetX = this.getConfigByKey(r, "xoffset"), s.offsetY = this.getConfigByKey(r, "yoffset")
			}
			return i
		}, e.prototype.getConfigByKey = function(t, e) {
			for (var i = t.split(" "), n = 0, r = i.length; r > n; n++) {
				var o = i[n];
				if (e == o.substring(0, e.length)) return i = o.substring(e.length + 1), parseInt(i)
			}
			return 0
		}, e
	}(t.SpriteSheet);
	t.BitmapTextSpriteSheet = e, e.prototype.__class__ = "egret.BitmapTextSpriteSheet"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function n(n, r) {
			e.call(this), this.frameRate = 60, n instanceof i ? (t.Logger.warning("MovieClip#constructor接口参数已经变更，请尽快调整用法为 new MovieClip(data,texture)"), this.delegate = n) : this.delegate = new i(n, r), this.delegate.setMovieClip(this)
		}
		return __extends(n, e), n.prototype.gotoAndPlay = function(t) {
			this.delegate.gotoAndPlay(t)
		}, n.prototype.gotoAndStop = function(t) {
			this.delegate.gotoAndStop(t)
		}, n.prototype.stop = function() {
			this.delegate.stop()
		}, n.prototype.dispose = function() {
			this.delegate.dispose()
		}, n.prototype.release = function() {
			t.Logger.warning("MovieClip#release方法即将废弃"), this.dispose()
		}, n.prototype.getCurrentFrameIndex = function() {
			return t.Logger.warning("MovieClip#getCurrentFrameIndex方法即将废弃"), this.delegate._currentFrameIndex
		}, n.prototype.getTotalFrame = function() {
			return t.Logger.warning("MovieClip#getTotalFrame方法即将废弃"), this.delegate._totalFrame
		}, n.prototype.setInterval = function(e) {
			t.Logger.warning("MovieClip#setInterval方法即将废弃,请使用MovieClip#frameRate代替"), this.frameRate = 60 / e
		}, n.prototype.getIsPlaying = function() {
			return t.Logger.warning("MovieClip#getIsPlaying方法即将废弃"), this.delegate.isPlaying
		}, n
	}(t.DisplayObjectContainer);
	t.MovieClip = e, e.prototype.__class__ = "egret.MovieClip";
	var i = function() {
		function e(e, i) {
			this.data = e, this._currentFrameIndex = this._passTime = this._totalFrame = 0, this._isPlaying = !1, this._frameData = e, this._spriteSheet = new t.SpriteSheet(i)
		}
		return e.prototype.setMovieClip = function(e) {
			this.movieClip = e, this.bitmap = new t.Bitmap, this.movieClip.addChild(this.bitmap)
		}, e.prototype.gotoAndPlay = function(e) {
			this.checkHasFrame(e), this._isPlaying = !0, this._currentFrameIndex = 0, this._currentFrameName = e, this._totalFrame = this._frameData.frames[e].totalFrame, this.playNextFrame(), this._passTime = 0, t.Ticker.getInstance().register(this.update, this)
		}, e.prototype.gotoAndStop = function(t) {
			this.checkHasFrame(t), this.stop(), this._currentFrameIndex = this._passTime = 0, this._currentFrameName = t, this._totalFrame = this._frameData.frames[t].totalFrame, this.playNextFrame()
		}, e.prototype.stop = function() {
			this._isPlaying = !1, t.Ticker.getInstance().unregister(this.update, this)
		}, e.prototype.dispose = function() {}, e.prototype.checkHasFrame = function(e) {
			void 0 == this._frameData.frames[e] && t.Logger.fatal("MovieClip没有对应的frame：", e)
		}, e.prototype.update = function(t) {
			for (var e = 1e3 / this.movieClip.frameRate, e = Math.floor((this._passTime % e + t) / e); e >= 1;) 1 == e ? this.playNextFrame() : this.playNextFrame(!1), e--;
			this._passTime += t
		}, e.prototype.playNextFrame = function(t) {
			"undefined" == typeof t && (t = !0);
			var e = this._frameData.frames[this._currentFrameName].childrenFrame[this._currentFrameIndex];
			if (t) {
				t = this.getTexture(e.res);
				var i = this.bitmap;
				i.x = e.x, i.y = e.y, i.texture = t
			}
			null != e.action && this.movieClip.dispatchEventWith(e.action), this._currentFrameIndex++, this._currentFrameIndex == this._totalFrame && (this._currentFrameIndex = 0)
		}, e.prototype.getTexture = function(t) {
			var e = this._frameData.res[t],
				i = this._spriteSheet.getTexture(t);
			return i || (i = this._spriteSheet.createTexture(t, e.x, e.y, e.w, e.h)), i
		}, e
	}();
	t.DefaultMovieClipDelegate = i, i.prototype.__class__ = "egret.DefaultMovieClipDelegate"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this._size = 30
		}
		return __extends(i, e), i.prototype._getText = function() {
			return this.inputElement.value
		}, i.prototype._setText = function(t) {
			this.inputElement.value = t
		}, i.prototype._setTextType = function(t) {
			this.inputElement.type = t
		}, i.prototype._getTextType = function() {
			return this.inputElement.type
		}, i.prototype._open = function(e, i, n, r) {
			"undefined" == typeof n && (n = 160), r = t.StageDelegate.getInstance().getScaleX();
			var o = t.StageDelegate.getInstance().getScaleY(),
				s = document.createElement("input");
			s.type = "text", s.style.fontSize = this._size + "px", s.style.color = "#FFFFFF", s.style.border = "none", s.style.background = "none", s.style.width = n + "px", s.style.padding = "0", s.style.outline = "medium";
			var a = t.Browser.getInstance().$new("div");
			a.position.x = e * r, a.position.y = i * o, a.style.width = n + "px", a.scale.x = r, a.scale.y = o, a.transforms(), a.style[egret_dom.getTrans("transformOrigin")] = "0% 0% 0px", a.appendChild(s), this.div = a, this.inputElement = s
		}, i.prototype._addListeners = function() {
			this.inputElement.addEventListener("MSPointerDown", this.onHandler), this.inputElement.addEventListener("MSPointerMove", this.onHandler), this.inputElement.addEventListener("MSPointerUp", this.onHandler), this.inputElement.addEventListener("touchstart", this.onHandler), this.inputElement.addEventListener("touchmove", this.onHandler), this.inputElement.addEventListener("touchend", this.onHandler), this.inputElement.addEventListener("touchcancel", this.onHandler)
		}, i.prototype._removeListeners = function() {
			this.inputElement.removeEventListener("MSPointerDown", this.onHandler), this.inputElement.removeEventListener("MSPointerMove", this.onHandler), this.inputElement.removeEventListener("MSPointerUp", this.onHandler), this.inputElement.removeEventListener("touchstart", this.onHandler), this.inputElement.removeEventListener("touchmove", this.onHandler), this.inputElement.removeEventListener("touchend", this.onHandler), this.inputElement.removeEventListener("touchcancel", this.onHandler)
		}, i.prototype.onHandler = function(t) {
			t.isScroll = !0
		}, i.prototype.getStageDelegateDiv = function() {
			var e = t.Browser.getInstance().$("#StageDelegateDiv");
			return e || (e = t.Browser.getInstance().$new("div"), e.id = "StageDelegateDiv", e.style.top = t.StageDelegate.getInstance().getOffSetY() + "px", document.getElementById(t.StageDelegate.canvas_div_name).appendChild(e), e.transforms()), e
		}, i.prototype._add = function() {
			var t = this.div;
			t && !t.parentNode && this.getStageDelegateDiv().appendChild(t), this._addListeners()
		}, i.prototype._remove = function() {
			var t = this.div;
			t && t.parentNode && t.parentNode.removeChild(t), this._removeListeners()
		}, i.prototype.changePosition = function(e, i) {
			var n = t.StageDelegate.getInstance().getScaleX(),
				r = t.StageDelegate.getInstance().getScaleY();
			this.div.position.x = e * n, this.div.position.y = i * r, this.div.transforms()
		}, i.prototype.changeSize = function(t) {
			this.inputElement.style.width = t + "px", this.div.style.width = t + "px", this.div.transforms()
		}, i.prototype.setSize = function(t) {
			this._size = t, this.inputElement.style.fontSize = this._size + "px"
		}, i.prototype.setTextColor = function(t) {
			this.inputElement.style.color = t
		}, i
	}(t.HashObject);
	t.StageText = e, e.prototype.__class__ = "egret.StageText"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {}
		return t.GET = "get", t.POST = "post", t
	}();
	t.URLRequestMethod = e, e.prototype.__class__ = "egret.URLRequestMethod"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {}
		return t.BINARY = "binary", t.TEXT = "text", t.VARIABLES = "variables", t.TEXTURE = "texture", t.SOUND = "sound", t
	}();
	t.URLLoaderDataFormat = e, e.prototype.__class__ = "egret.URLLoaderDataFormat"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(t) {
		function e(e) {
			"undefined" == typeof e && (e = null), t.call(this), null !== e && this.decode(e)
		}
		return __extends(e, t), e.prototype.decode = function(t) {
			this.variables || (this.variables = {}), t = t.split("+").join(" ");
			for (var e, i = /[?&]?([^=]+)=([^&]*)/g; e = i.exec(t);) this.variables[decodeURIComponent(e[1])] = decodeURIComponent(e[2])
		}, e.prototype.toString = function() {
			if (!this.variables) return "";
			var t, e = this.variables,
				i = "",
				n = !0;
			for (t in e) n ? n = !1 : i += "&", i += t + "=" + e[t];
			return i
		}, e
	}(t.HashObject);
	t.URLVariables = e, e.prototype.__class__ = "egret.URLVariables"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(i) {
			"undefined" == typeof i && (i = null), e.call(this), this.method = t.URLRequestMethod.GET, this.url = i
		}
		return __extends(i, e), i
	}(t.HashObject);
	t.URLRequest = e, e.prototype.__class__ = "egret.URLRequest"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(i) {
			"undefined" == typeof i && (i = null), e.call(this), this.dataFormat = t.URLLoaderDataFormat.TEXT, i && this.load(i)
		}
		return __extends(i, e), i.prototype.load = function(e) {
			this._request = e, this.data = null, t.MainContext.instance.netContext.proceed(this)
		}, i
	}(t.EventDispatcher);
	t.URLLoader = e, e.prototype.__class__ = "egret.URLLoader"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this._textureHeight = this._textureWidth = this._offsetY = this._offsetX = this._bitmapHeight = this._bitmapWidth = this._bitmapY = this._bitmapX = 0
		}
		return __extends(i, e), Object.defineProperty(i.prototype, "textureWidth", {
			get: function() {
				return this._textureWidth
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "textureHeight", {
			get: function() {
				return this._textureHeight
			},
			enumerable: !0,
			configurable: !0
		}), Object.defineProperty(i.prototype, "bitmapData", {
			get: function() {
				return this._bitmapData
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype._setBitmapData = function(e) {
			var i = t.MainContext.instance.rendererContext.texture_scale_factor;
			this._bitmapData = e, this._sourceWidth = e.width, this._sourceHeight = e.height, this._textureWidth = this._sourceWidth * i, this._textureHeight = this._sourceHeight * i, this._bitmapWidth = this._textureWidth, this._bitmapHeight = this._textureHeight, this._offsetX = this._offsetY = this._bitmapX = this._bitmapY = 0
		}, i.prototype.getPixel32 = function(t, e) {
			return this._bitmapData.getContext("2d").getImageData(t, e, 1, 1).data
		}, i
	}(t.HashObject);
	t.Texture = e, e.prototype.__class__ = "egret.Texture"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this._bitmapData = document.createElement("canvas"), this.renderContext = t.RendererContext.createRendererContext(this._bitmapData)
		}
		return __extends(i, e), i.prototype.drawToTexture = function(e) {
			var i = this._bitmapData,
				n = e.getBounds(t.Rectangle.identity);
			if (i.width = n.width, i.height = n.height, e._worldTransform.identity(), e.worldAlpha = 1, e instanceof t.DisplayObjectContainer) {
				this._offsetX = n.x, this._offsetY = n.y, e._worldTransform.append(1, 0, 0, 1, -n.x, -n.y);
				for (var i = e._children, n = 0, r = i.length; r > n; n++) i[n]._updateTransform()
			}
			i = t.RenderFilter.getInstance(), n = i._drawAreaList.concat(), i._drawAreaList.length = 0, this.renderContext.clearScreen(), this.webGLTexture = null, (r = e.mask || e._scrollRect) && this.renderContext.pushMask(r), e._render(this.renderContext), r && this.renderContext.popMask(), i._drawAreaList = n, this._textureWidth = this._bitmapData.width, this._textureHeight = this._bitmapData.height, this._sourceWidth = this._textureWidth, this._sourceHeight = this._textureHeight
		}, i
	}(t.Texture);
	t.RenderTexture = e, e.prototype.__class__ = "egret.RenderTexture"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this.renderCost = 0, this.texture_scale_factor = 1
		}
		return __extends(i, e), i.prototype.clearScreen = function() {}, i.prototype.clearRect = function() {}, i.prototype.drawImage = function() {
			t.Profiler.getInstance().onDrawImage()
		}, i.prototype.setTransform = function() {}, i.prototype.setAlpha = function() {}, i.prototype.setupFont = function() {}, i.prototype.measureText = function() {
			return 0
		}, i.prototype.drawText = function() {
			t.Profiler.getInstance().onDrawImage()
		}, i.prototype.strokeRect = function() {}, i.prototype.pushMask = function() {}, i.prototype.popMask = function() {}, i.prototype.onRenderStart = function() {}, i.prototype.onRenderFinish = function() {}, i.createRendererContext = function() {
			return null
		}, i
	}(t.HashObject);
	t.RendererContext = e, e.prototype.__class__ = "egret.RendererContext"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {}
		return t.MOUSE = "mouse", t.TOUCH = "touch", t.mode = "touch", t
	}();
	t.InteractionMode = e, e.prototype.__class__ = "egret.InteractionMode"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this._currentTouchTarget = {}, this.maxTouches = 2, this.touchDownTarget = {}, this.touchingIdentifiers = [], this.lastTouchY = this.lastTouchX = -1
		}
		return __extends(i, e), i.prototype.run = function() {}, i.prototype.getTouchData = function(t, e, i) {
			var n = this._currentTouchTarget[t];
			return null == n && (n = {}, this._currentTouchTarget[t] = n), n.stageX = e, n.stageY = i, n.identifier = t, n
		}, i.prototype.dispatchEvent = function(e, i) {
			t.TouchEvent.dispatchTouchEvent(i.target, e, i.identifier, i.stageX, i.stageY, !1, !1, !1, 1 == this.touchDownTarget[i.identifier])
		}, i.prototype.onTouchBegan = function(e, i, n) {
			if (this.touchingIdentifiers.length != this.maxTouches) {
				var r = t.MainContext.instance.stage.hitTest(e, i);
				r && (e = this.getTouchData(n, e, i), this.touchDownTarget[n] = !0, e.target = r, e.beginTarget = r, this.dispatchEvent(t.TouchEvent.TOUCH_BEGIN, e)), this.touchingIdentifiers.push(n)
			}
		}, i.prototype.onTouchMove = function(e, i, n) {
			if (-1 != this.touchingIdentifiers.indexOf(n) && (e != this.lastTouchX || i != this.lastTouchY)) {
				this.lastTouchX = e, this.lastTouchY = i;
				var r = t.MainContext.instance.stage.hitTest(e, i);
				r && (e = this.getTouchData(n, e, i), e.target = r, this.dispatchEvent(t.TouchEvent.TOUCH_MOVE, e))
			}
		}, i.prototype.onTouchEnd = function(e, i, n) {
			var r = this.touchingIdentifiers.indexOf(n); - 1 != r && (this.touchingIdentifiers.splice(r, 1), r = t.MainContext.instance.stage.hitTest(e, i)) && (e = this.getTouchData(n, e, i), delete this.touchDownTarget[n], n = e.beginTarget, e.target = r, this.dispatchEvent(t.TouchEvent.TOUCH_END, e), n == r ? this.dispatchEvent(t.TouchEvent.TOUCH_TAP, e) : e.beginTarget && (e.target = e.beginTarget, this.dispatchEvent(t.TouchEvent.TOUCH_RELEASE_OUTSIDE, e)), delete this._currentTouchTarget[e.identifier])
		}, i
	}(t.HashObject);
	t.TouchContext = e, e.prototype.__class__ = "egret.TouchContext"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this)
		}
		return __extends(i, e), i.prototype.proceed = function() {}, i._getUrl = function(e) {
			var i = e.url;
			return -1 == i.indexOf("?") && e.method == t.URLRequestMethod.GET && e.data && e.data instanceof t.URLVariables && (i = i + "?" + e.data.toString()), i
		}, i
	}(t.HashObject);
	t.NetContext = e, e.prototype.__class__ = "egret.NetContext"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(t) {
		function e() {
			t.call(this), this.frameRate = 60
		}
		return __extends(e, t), e.prototype.executeMainLoop = function() {}, e
	}(t.HashObject);
	t.DeviceContext = e, e.prototype.__class__ = "egret.DeviceContext"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {}
		return t.call = function() {}, t.addCallback = function() {}, t
	}();
	t.ExternalInterface = e, e.prototype.__class__ = "egret.ExternalInterface"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this.translate = this.isHD ? function(e) {
				return "translate3d(" + e.x + "px, " + (e.y - t.MainContext.instance.stage.stageHeight) + "px, 0) "
			} : function(t) {
				return "translate(" + t.x + "px, " + t.y + "px) "
			}, this.rotate = this.isHD ? function(t) {
				return "rotateZ(" + t + "deg) "
			} : function(t) {
				return "rotate(" + t + "deg) "
			}, this.ua = navigator.userAgent.toLowerCase();
			var i = this.ua.match(/micromessenger|qqbrowser|mqqbrowser|ucbrowser|360browser|baidubrowser|maxthon|ie|opera|firefox/) || this.ua.match(/chrome|safari/);
			switch (i && 0 < i.length && (i = i[0], "micromessenger" == i && (this.type = "wechat"), this.type = i), this.type = "unknow", this.type) {
				case "firefox":
					this.pfx = "Moz", this.isHD = !0;
					break;
				case "chrome":
				case "safari":
					this.pfx = "webkit", this.isHD = !0;
					break;
				case "opera":
					this.pfx = "O", this.isHD = !1;
					break;
				case "ie":
					this.pfx = "ms", this.isHD = !1;
					break;
				default:
					this.pfx = "webkit", this.isHD = !0
			}
			this.trans = this.pfx + "Transform"
		}
		return __extends(i, e), i.getInstance = function() {
			return null == i.instance && (i.instance = new i), i.instance
		}, Object.defineProperty(i.prototype, "isMobile", {
			get: function() {
				return t.Logger.warning("Browser.isMobile接口参数已经变更，请尽快调整用法为 egret.MainContext.deviceType == egret.MainContext.DEVICE_MOBILE "), t.MainContext.deviceType == t.MainContext.DEVICE_MOBILE
			},
			enumerable: !0,
			configurable: !0
		}), i.prototype.$new = function(t) {
			return this.$(document.createElement(t))
		}, i.prototype.$ = function(e) {
			var n = document;
			return (e = e instanceof HTMLElement ? e : n.querySelector(e)) && (e.find = e.find || this.$, e.hasClass = e.hasClass || function(t) {
				return this.className.match(new RegExp("(\\s|^)" + t + "(\\s|$)"))
			}, e.addClass = e.addClass || function(t) {
				return this.hasClass(t) || (this.className && (this.className += " "), this.className += t), this
			}, e.removeClass = e.removeClass || function(t) {
				return this.hasClass(t) && (this.className = this.className.replace(t, "")), this
			}, e.remove = e.remove || function() {}, e.appendTo = e.appendTo || function(t) {
				return t.appendChild(this), this
			}, e.prependTo = e.prependTo || function(t) {
				return t.childNodes[0] ? t.insertBefore(this, t.childNodes[0]) : t.appendChild(this), this
			}, e.transforms = e.transforms || function() {
				return this.style[i.getInstance().trans] = i.getInstance().translate(this.position) + i.getInstance().rotate(this.rotation) + i.getInstance().scale(this.scale) + i.getInstance().skew(this.skew), this
			}, e.position = e.position || {
				x: 0,
				y: 0
			}, e.rotation = e.rotation || 0, e.scale = e.scale || {
				x: 1,
				y: 1
			}, e.skew = e.skew || {
				x: 0,
				y: 0
			}, e.translates = function(e, i) {
				return this.position.x = e, this.position.y = i - t.MainContext.instance.stage.stageHeight, this.transforms(), this
			}, e.rotate = function(t) {
				return this.rotation = t, this.transforms(), this
			}, e.resize = function(t, e) {
				return this.scale.x = t, this.scale.y = e, this.transforms(), this
			}, e.setSkew = function(t, e) {
				return this.skew.x = t, this.skew.y = e, this.transforms(), this
			}), e
		}, i.prototype.scale = function(t) {
			return "scale(" + t.x + ", " + t.y + ") "
		}, i.prototype.skew = function(t) {
			return "skewX(" + -t.x + "deg) skewY(" + t.y + "deg)"
		}, i
	}(t.HashObject);
	t.Browser = e, e.prototype.__class__ = "egret.Browser"
}(egret || (egret = {})),
function(t) {
	! function(t) {
		t.getItem = function() {
			return null
		}, t.setItem = function() {}, t.removeItem = function() {}, t.clear = function() {}
	}(t.localStorage || (t.localStorage = {}))
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function e() {}
		return e.parse = function(i) {
			if (i = t.SAXParser.getInstance().parserXML(i), !i || !i.childNodes) return null;
			for (var n = i.childNodes.length, r = !1, o = 0; n > o; o++) {
				var s = i.childNodes[o];
				if (1 == s.nodeType) {
					r = !0;
					break
				}
			}
			return r ? e.parseNode(s) : null
		}, e.parseNode = function(t) {
			if (!t || 1 != t.nodeType) return null;
			var i = {};
			i.localName = t.localName, i.name = t.nodeName, t.namespaceURI && (i.namespace = t.namespaceURI), t.prefix && (i.prefix = t.prefix);
			for (var n = t.attributes, r = n.length, o = 0; r > o; o++) {
				var s = n[o],
					a = s.name;
				0 != a.indexOf("xmlns:") && (i["$" + a] = s.value)
			}
			for (n = t.childNodes, r = n.length, o = 0; r > o; o++)(s = e.parseNode(n[o])) && (i.children || (i.children = []), s.parent = i, i.children.push(s));
			return !i.children && (t = t.textContent.trim()) && (i.text = t), i
		}, e.findChildren = function(t, i, n) {
			return n ? n.length = 0 : n = [], e.findByPath(t, i, n), n
		}, e.findByPath = function(t, i, n) {
			var r, o = i.indexOf(".");
			if (-1 == o ? (r = i, o = !0) : (r = i.substring(0, o), i = i.substring(o + 1), o = !1), t = t.children)
				for (var s = t.length, a = 0; s > a; a++) {
					var h = t[a];
					h.localName == r && (o ? n.push(h) : e.findByPath(h, i, n))
				}
		}, e.getAttributes = function(t, e) {
			e ? e.length = 0 : e = [];
			for (var i in t) "$" == i.charAt(0) && e.push(i.substring(1));
			return e
		}, e
	}();
	t.XML = e, e.prototype.__class__ = "egret.XML"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {}
		return t.LITTLE_ENDIAN = "LITTLE_ENDIAN", t.BIG_ENDIAN = "BIG_ENDIAN", t
	}();
	t.Endian = e, e.prototype.__class__ = "egret.Endian";
	var i = function() {
		function t() {
			this.length = this.position = 0, this._mode = "", this.maxlength = 0, this._endian = e.LITTLE_ENDIAN, this.isLittleEndian = !1, this._mode = "Typed array", this.maxlength = 4, this.arraybytes = new ArrayBuffer(this.maxlength), this.unalignedarraybytestemp = new ArrayBuffer(16), this.endian = t.DEFAULT_ENDIAN
		}
		return Object.defineProperty(t.prototype, "endian", {
			get: function() {
				return this._endian
			},
			set: function(t) {
				this._endian = t, this.isLittleEndian = t == e.LITTLE_ENDIAN
			},
			enumerable: !0,
			configurable: !0
		}), t.prototype.ensureWriteableSpace = function(t) {
			this.ensureSpace(t + this.position)
		}, t.prototype.setArrayBuffer = function(t) {
			this.ensureSpace(t.byteLength), this.length = t.byteLength, t = new Int8Array(t), new Int8Array(this.arraybytes, 0, this.length).set(t), this.position = 0
		}, Object.defineProperty(t.prototype, "bytesAvailable", {
			get: function() {
				return this.length - this.position
			},
			enumerable: !0,
			configurable: !0
		}), t.prototype.ensureSpace = function(t) {
			if (t > this.maxlength) {
				t = t + 255 & -256;
				var e = new ArrayBuffer(t),
					i = new Uint8Array(this.arraybytes, 0, this.length);
				new Uint8Array(e, 0, this.length).set(i), this.arraybytes = e, this.maxlength = t
			}
		}, t.prototype.writeByte = function(t) {
			this.ensureWriteableSpace(1), new Int8Array(this.arraybytes)[this.position++] = ~~t, this.position > this.length && (this.length = this.position)
		}, t.prototype.readByte = function() {
			if (this.position >= this.length) throw "ByteArray out of bounds read. Positon=" + this.position + ", Length=" + this.length;
			return new Int8Array(this.arraybytes)[this.position++]
		}, t.prototype.readBytes = function(t, e, i) {
			"undefined" == typeof e && (e = 0), "undefined" == typeof i && (i = 0), null == i && (i = t.length), t.ensureWriteableSpace(e + i);
			var n = new Int8Array(t.arraybytes),
				r = new Int8Array(this.arraybytes);
			n.set(r.subarray(this.position, this.position + i), e), this.position += i, i + e > t.length && (t.length += i + e - t.length)
		}, t.prototype.writeUnsignedByte = function(t) {
			this.ensureWriteableSpace(1), new Uint8Array(this.arraybytes)[this.position++] = 255 & ~~t, this.position > this.length && (this.length = this.position)
		}, t.prototype.readUnsignedByte = function() {
			if (this.position >= this.length) throw "ByteArray out of bounds read. Positon=" + this.position + ", Length=" + this.length;
			return new Uint8Array(this.arraybytes)[this.position++]
		}, t.prototype.writeUnsignedShort = function(t) {
			if (this.ensureWriteableSpace(2), 0 == (1 & this.position)) {
				var e = new Uint16Array(this.arraybytes);
				e[this.position >> 1] = 65535 & ~~t
			} else e = new Uint16Array(this.unalignedarraybytestemp, 0, 1), e[0] = 65535 & ~~t, t = new Uint8Array(this.arraybytes, this.position, 2), e = new Uint8Array(this.unalignedarraybytestemp, 0, 2), t.set(e);
			this.position += 2, this.position > this.length && (this.length = this.position)
		}, t.prototype.readUTFBytes = function(t) {
			var e = "";
			t = this.position + t;
			for (var i = new DataView(this.arraybytes); this.position < t;) {
				var n = i.getUint8(this.position++);
				if (128 > n) {
					if (0 == n) break;
					e += String.fromCharCode(n)
				} else if (224 > n) e += String.fromCharCode((63 & n) << 6 | 127 & i.getUint8(this.position++));
				else if (240 > n) var r = i.getUint8(this.position++),
				e = e + String.fromCharCode((31 & n) << 12 | (127 & r) << 6 | 127 & i.getUint8(this.position++));
				else var r = i.getUint8(this.position++),
				o = i.getUint8(this.position++), e = e + String.fromCharCode((15 & n) << 18 | (127 & r) << 12 | o << 6 & 127 | 127 & i.getUint8(this.position++))
			}
			return e
		}, t.prototype.readInt = function() {
			var t = new DataView(this.arraybytes).getInt32(this.position, this.isLittleEndian);
			return this.position += 4, t
		}, t.prototype.readShort = function() {
			var t = new DataView(this.arraybytes).getInt16(this.position, this.isLittleEndian);
			return this.position += 2, t
		}, t.prototype.readDouble = function() {
			var t = new DataView(this.arraybytes).getFloat64(this.position, this.isLittleEndian);
			return this.position += 8, t
		}, t.prototype.readUnsignedShort = function() {
			if (this.position > this.length + 2) throw "ByteArray out of bounds read. Position=" + this.position + ", Length=" + this.length;
			if (0 == (1 & this.position)) {
				var t = new Uint16Array(this.arraybytes),
					e = this.position >> 1;
				return this.position += 2, t[e]
			}
			return t = new Uint16Array(this.unalignedarraybytestemp, 0, 1), e = new Uint8Array(this.arraybytes, this.position, 2), new Uint8Array(this.unalignedarraybytestemp, 0, 2).set(e), this.position += 2, t[0]
		}, t.prototype.writeUnsignedInt = function(t) {
			if (this.ensureWriteableSpace(4), 0 == (3 & this.position)) {
				var e = new Uint32Array(this.arraybytes);
				e[this.position >> 2] = 4294967295 & ~~t
			} else e = new Uint32Array(this.unalignedarraybytestemp, 0, 1), e[0] = 4294967295 & ~~t, t = new Uint8Array(this.arraybytes, this.position, 4), e = new Uint8Array(this.unalignedarraybytestemp, 0, 4), t.set(e);
			this.position += 4, this.position > this.length && (this.length = this.position)
		}, t.prototype.readUnsignedInt = function() {
			if (this.position > this.length + 4) throw "ByteArray out of bounds read. Position=" + this.position + ", Length=" + this.length;
			if (0 == (3 & this.position)) {
				var t = new Uint32Array(this.arraybytes),
					e = this.position >> 2;
				return this.position += 4, t[e]
			}
			return t = new Uint32Array(this.unalignedarraybytestemp, 0, 1), e = new Uint8Array(this.arraybytes, this.position, 4), new Uint8Array(this.unalignedarraybytestemp, 0, 4).set(e), this.position += 4, t[0]
		}, t.prototype.writeFloat = function(t) {
			if (this.ensureWriteableSpace(4), 0 == (3 & this.position)) {
				var e = new Float32Array(this.arraybytes);
				e[this.position >> 2] = t
			} else e = new Float32Array(this.unalignedarraybytestemp, 0, 1), e[0] = t, t = new Uint8Array(this.arraybytes, this.position, 4), e = new Uint8Array(this.unalignedarraybytestemp, 0, 4), t.set(e);
			this.position += 4, this.position > this.length && (this.length = this.position)
		}, t.prototype.readFloat = function() {
			if (this.position > this.length + 4) throw "ByteArray out of bounds read. Positon=" + this.position + ", Length=" + this.length;
			if (0 == (3 & this.position)) {
				var t = new Float32Array(this.arraybytes),
					e = this.position >> 2;
				return this.position += 4, t[e]
			}
			return t = new Float32Array(this.unalignedarraybytestemp, 0, 1), e = new Uint8Array(this.arraybytes, this.position, 4), new Uint8Array(this.unalignedarraybytestemp, 0, 4).set(e), this.position += 4, t[0]
		}, t.DEFAULT_ENDIAN = e.BIG_ENDIAN, t
	}();
	t.ByteArray = i, i.prototype.__class__ = "egret.ByteArray"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(t, i, n) {
			e.call(this), this._target = null, this.loop = this.ignoreGlobalPause = this._useTicks = !1, this._actions = this._steps = this.pluginData = null, this.paused = !1, this.duration = 0, this._prevPos = -1, this.position = null, this._stepPosition = this._prevPosition = 0, this.passive = !1, this.initialize(t, i, n)
		}
		return __extends(i, e), i.get = function(t, e, n, r) {
			return "undefined" == typeof e && (e = null), "undefined" == typeof n && (n = null), "undefined" == typeof r && (r = !1), r && i.removeTweens(t), new i(t, e, n)
		}, i.removeTweens = function(t) {
			if (t.tween_count) {
				for (var e = i._tweens, n = e.length - 1; n >= 0; n--) e[n]._target == t && (e[n].paused = !0, e.splice(n, 1));
				t.tween_count = 0
			}
		}, i.pauseTweens = function(e) {
			if (e.tween_count)
				for (var i = t.Tween._tweens, n = i.length - 1; n >= 0; n--) i[n]._target == e && (i[n].paused = !0)
		}, i.resumeTweens = function(e) {
			if (e.tween_count)
				for (var i = t.Tween._tweens, n = i.length - 1; n >= 0; n--) i[n]._target == e && (i[n].paused = !1)
		}, i.tick = function(t, e) {
			"undefined" == typeof e && (e = !1);
			for (var n = i._tweens.concat(), r = n.length - 1; r >= 0; r--) {
				var o = n[r];
				e && !o.ignoreGlobalPause || o.paused || o.tick(o._useTicks ? 1 : t)
			}
		}, i._register = function(e, n) {
			var r = e._target,
				o = i._tweens;
			if (n) r && (r.tween_count = r.tween_count ? r.tween_count + 1 : 1), o.push(e), i._inited || (t.Ticker.getInstance().register(i.tick, null), i._inited = !0);
			else
				for (r && r.tween_count--, r = o.length; r--;)
					if (o[r] == e) {
						o.splice(r, 1);
						break
					}
		}, i.removeAllTweens = function() {
			for (var t = i._tweens, e = 0, n = t.length; n > e; e++) {
				var r = t[e];
				r.paused = !0, r._target.tweenjs_count = 0
			}
			t.length = 0
		}, i.prototype.initialize = function(t, e, n) {
			this._target = t, e && (this._useTicks = e.useTicks, this.ignoreGlobalPause = e.ignoreGlobalPause, this.loop = e.loop, e.onChange && this.addEventListener("change", e.onChange, e.onChangeObj), e.override && i.removeTweens(t)), this.pluginData = n || {}, this._curQueueProps = {}, this._initQueueProps = {}, this._steps = [], this._actions = [], e && e.paused ? this.paused = !0 : i._register(this, !0), e && null != e.position && this.setPosition(e.position, i.NONE)
		}, i.prototype.setPosition = function(t, e) {
			"undefined" == typeof e && (e = 1), 0 > t && (t = 0);
			var i = t,
				n = !1;
			if (i >= this.duration && (this.loop ? i %= this.duration : (i = this.duration, n = !0)), i == this._prevPos) return n;
			var r = this._prevPos;
			if (this.position = this._prevPos = i, this._prevPosition = t, this._target)
				if (n) this._updateTargetProps(null, 1);
				else
			if (0 < this._steps.length) {
				for (var o = 0, s = this._steps.length; s > o && !(this._steps[o].t > i); o++);
				o = this._steps[o - 1], this._updateTargetProps(o, (this._stepPosition = i - o.t) / o.d)
			}
			return 0 != e && 0 < this._actions.length && (this._useTicks ? this._runActions(i, i) : 1 == e && r > i ? (r != this.duration && this._runActions(r, this.duration), this._runActions(0, i, !0)) : this._runActions(r, i)), n && this.setPaused(!0), this.dispatchEventWith("change"), n
		}, i.prototype._runActions = function(t, e, i) {
			"undefined" == typeof i && (i = !1);
			var n = t,
				r = e,
				o = -1,
				s = this._actions.length,
				a = 1;
			for (t > e && (n = e, r = t, o = s, s = a = -1);
				(o += a) != s;) {
				e = this._actions[o];
				var h = e.t;
				(h == r || h > n && r > h || i && h == t) && e.f.apply(e.o, e.p)
			}
		}, i.prototype._updateTargetProps = function(t, e) {
			var n, r, o, s;
			if (t || 1 != e) {
				if (this.passive = !! t.v) return;
				t.e && (e = t.e(e, 0, 1, 1)), n = t.p0, r = t.p1
			} else this.passive = !1, n = r = this._curQueueProps;
			for (var a in this._initQueueProps) {
				null == (o = n[a]) && (n[a] = o = this._initQueueProps[a]), null == (s = r[a]) && (r[a] = s = o), o = o == s || 0 == e || 1 == e || "number" != typeof o ? 1 == e ? s : o : o + (s - o) * e;
				var h = !1;
				if (s = i._plugins[a])
					for (var c = 0, u = s.length; u > c; c++) {
						var p = s[c].tween(this, a, o, n, r, e, !! t && n == r, !t);
						p == i.IGNORE ? h = !0 : o = p
					}
				h || (this._target[a] = o)
			}
		}, i.prototype.setPaused = function(t) {
			return this.paused = t, i._register(this, !t), this
		}, i.prototype._cloneProps = function(t) {
			var e, i = {};
			for (e in t) i[e] = t[e];
			return i
		}, i.prototype._addStep = function(t) {
			return 0 < t.d && (this._steps.push(t), t.t = this.duration, this.duration += t.d), this
		}, i.prototype._appendQueueProps = function(t) {
			var e, n, r, o, s, a;
			for (a in t)
				if (void 0 === this._initQueueProps[a]) {
					if (n = this._target[a], e = i._plugins[a])
						for (r = 0, o = e.length; o > r; r++) n = e[r].init(this, a, n);
					this._initQueueProps[a] = this._curQueueProps[a] = void 0 === n ? null : n
				}
			for (a in t) {
				if (n = this._curQueueProps[a], e = i._plugins[a])
					for (s = s || {}, r = 0, o = e.length; o > r; r++) e[r].step && e[r].step(this, a, n, t[a], s);
				this._curQueueProps[a] = t[a]
			}
			return s && this._appendQueueProps(s), this._curQueueProps
		}, i.prototype._addAction = function(t) {
			return t.t = this.duration, this._actions.push(t), this
		}, i.prototype._set = function(t, e) {
			for (var i in t) e[i] = t[i]
		}, i.prototype.wait = function(t, e) {
			if (null == t || 0 >= t) return this;
			var i = this._cloneProps(this._curQueueProps);
			return this._addStep({
				d: t,
				p0: i,
				p1: i,
				v: e
			})
		}, i.prototype.to = function(t, e, i) {
			return "undefined" == typeof i && (i = void 0), (isNaN(e) || 0 > e) && (e = 0), this._addStep({
				d: e || 0,
				p0: this._cloneProps(this._curQueueProps),
				e: i,
				p1: this._cloneProps(this._appendQueueProps(t))
			})
		}, i.prototype.call = function(t, e, i) {
			return "undefined" == typeof e && (e = void 0), "undefined" == typeof i && (i = void 0), this._addAction({
				f: t,
				p: i ? i : [],
				o: e ? e : this._target
			})
		}, i.prototype.set = function(t, e) {
			return "undefined" == typeof e && (e = null), this._addAction({
				f: this._set,
				o: this,
				p: [t, e ? e : this._target]
			})
		}, i.prototype.play = function(t) {
			return t || (t = this), this.call(t.setPaused, t, [!1])
		}, i.prototype.pause = function(t) {
			return t || (t = this), this.call(t.setPaused, t, [!0])
		}, i.prototype.tick = function(t) {
			this.paused || this.setPosition(this._prevPosition + t)
		}, i.NONE = 0, i.LOOP = 1, i.REVERSE = 2, i._tweens = [], i.IGNORE = {}, i._plugins = {}, i._inited = !1, i
	}(t.EventDispatcher);
	t.Tween = e, e.prototype.__class__ = "egret.Tween"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function e() {
			t.Logger.fatal("Ease不能被实例化")
		}
		return e.get = function(t) {
			return -1 > t && (t = -1), t > 1 && (t = 1),
			function(e) {
				return 0 == t ? e : 0 > t ? e * (e * -t + 1 + t) : e * ((2 - e) * t + (1 - t))
			}
		}, e.getPowIn = function(t) {
			return function(e) {
				return Math.pow(e, t)
			}
		}, e.getPowOut = function(t) {
			return function(e) {
				return 1 - Math.pow(1 - e, t)
			}
		}, e.getPowInOut = function(t) {
			return function(e) {
				return 1 > (e *= 2) ? .5 * Math.pow(e, t) : 1 - .5 * Math.abs(Math.pow(2 - e, t))
			}
		}, e.sineIn = function(t) {
			return 1 - Math.cos(t * Math.PI / 2)
		}, e.sineOut = function(t) {
			return Math.sin(t * Math.PI / 2)
		}, e.sineInOut = function(t) {
			return -.5 * (Math.cos(Math.PI * t) - 1)
		}, e.getBackIn = function(t) {
			return function(e) {
				return e * e * ((t + 1) * e - t)
			}
		}, e.getBackOut = function(t) {
			return function(e) {
				return e -= 1, e * e * ((t + 1) * e + t) + 1
			}
		}, e.getBackInOut = function(t) {
			return t *= 1.525,
			function(e) {
				return 1 > (e *= 2) ? .5 * e * e * ((t + 1) * e - t) : .5 * ((e -= 2) * e * ((t + 1) * e + t) + 2)
			}
		}, e.circIn = function(t) {
			return -(Math.sqrt(1 - t * t) - 1)
		}, e.circOut = function(t) {
			return Math.sqrt(1 - t * t)
		}, e.circInOut = function(t) {
			return 1 > (t *= 2) ? -.5 * (Math.sqrt(1 - t * t) - 1) : .5 * (Math.sqrt(1 - (t -= 2) * t) + 1)
		}, e.bounceIn = function(t) {
			return 1 - e.bounceOut(1 - t)
		}, e.bounceOut = function(t) {
			return 1 / 2.75 > t ? 7.5625 * t * t : 2 / 2.75 > t ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : 2.5 / 2.75 > t ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375
		}, e.bounceInOut = function(t) {
			return .5 > t ? .5 * e.bounceIn(2 * t) : .5 * e.bounceOut(2 * t - 1) + .5
		}, e.getElasticIn = function(t, e) {
			var i = 2 * Math.PI;
			return function(n) {
				if (0 == n || 1 == n) return n;
				var r = e / i * Math.asin(1 / t);
				return -(t * Math.pow(2, 10 * (n -= 1)) * Math.sin((n - r) * i / e))
			}
		}, e.getElasticOut = function(t, e) {
			var i = 2 * Math.PI;
			return function(n) {
				if (0 == n || 1 == n) return n;
				var r = e / i * Math.asin(1 / t);
				return t * Math.pow(2, -10 * n) * Math.sin((n - r) * i / e) + 1
			}
		}, e.getElasticInOut = function(t, e) {
			var i = 2 * Math.PI;
			return function(n) {
				var r = e / i * Math.asin(1 / t);
				return 1 > (n *= 2) ? -.5 * t * Math.pow(2, 10 * (n -= 1)) * Math.sin((n - r) * i / e) : t * Math.pow(2, -10 * (n -= 1)) * Math.sin((n - r) * i / e) * .5 + 1
			}
		}, e.quadIn = e.getPowIn(2), e.quadOut = e.getPowOut(2), e.quadInOut = e.getPowInOut(2), e.cubicIn = e.getPowIn(3), e.cubicOut = e.getPowOut(3), e.cubicInOut = e.getPowInOut(3), e.quartIn = e.getPowIn(4), e.quartOut = e.getPowOut(4), e.quartInOut = e.getPowInOut(4), e.quintIn = e.getPowIn(5), e.quintOut = e.getPowOut(5), e.quintInOut = e.getPowInOut(5), e.backIn = e.getBackIn(1.7), e.backOut = e.getBackOut(1.7), e.backInOut = e.getBackInOut(1.7), e.elasticIn = e.getElasticIn(1, .3), e.elasticOut = e.getElasticOut(1, .3), e.elasticInOut = e.getElasticInOut(1, .3 * 1.5), e
	}();
	t.Ease = e, e.prototype.__class__ = "egret.Ease"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {
			this.type = t.EFFECT
		}
		return t.prototype.play = function(t) {
			"undefined" == typeof t && (t = !1);
			var e = this.audio;
			e && (isNaN(e.duration) || (e.currentTime = 0), e.loop = t, e.play())
		}, t.prototype.pause = function() {
			var t = this.audio;
			t && t.pause()
		}, t.prototype.load = function() {
			var t = this.audio;
			t && t.load()
		}, t.prototype.addEventListener = function(t, e) {
			this.audio && this.audio.addEventListener(t, e, !1)
		}, t.prototype.removeEventListener = function(t, e) {
			this.audio && this.audio.removeEventListener(t, e, !1)
		}, t.prototype.setVolume = function(t) {
			var e = this.audio;
			e && (e.volume = t)
		}, t.prototype.getVolume = function() {
			return this.audio ? this.audio.volume : 0
		}, t.prototype.preload = function(t) {
			this.type = t
		}, t.prototype._setAudio = function(t) {
			this.audio = t
		}, t.MUSIC = "music", t.EFFECT = "effect", t
	}();
	t.Sound = e, e.prototype.__class__ = "egret.Sound"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t() {}
		return t.isNumber = function(t) {
			return "number" == typeof t && !isNaN(t)
		}, t
	}();
	t.NumberUtils = e, e.prototype.__class__ = "egret.NumberUtils"
}(egret || (egret = {}));
var __extends = this.__extends || function(t, e) {
		function i() {
			this.constructor = t
		}
		for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
		i.prototype = e.prototype, t.prototype = new i
	}, RES;
! function(t) {
	var e = function(t) {
		function e(e, i, n) {
			"undefined" == typeof i && (i = !1), "undefined" == typeof n && (n = !1), t.call(this, e, i, n), this.itemsTotal = this.itemsLoaded = 0
		}
		return __extends(e, t), e.dispatchResourceEvent = function(t, i, n, r, o, s) {
			"undefined" == typeof n && (n = ""), "undefined" == typeof r && (r = null), "undefined" == typeof o && (o = 0), "undefined" == typeof s && (s = 0);
			var a = egret.Event._getPropertyData(e);
			a.groupName = n, a.resItem = r, a.itemsLoaded = o, a.itemsTotal = s, egret.Event._dispatchByTarget(e, t, i, a)
		}, e.ITEM_LOAD_ERROR = "itemLoadError", e.CONFIG_COMPLETE = "configComplete", e.GROUP_PROGRESS = "groupProgress", e.GROUP_COMPLETE = "groupComplete", e
	}(egret.Event);
	t.ResourceEvent = e, e.prototype.__class__ = "RES.ResourceEvent"
}(RES || (RES = {})),
function(t) {
	var e = function() {
		function t(t, e, i) {
			this._loaded = !1, this.name = t, this.url = e, this.type = i
		}
		return Object.defineProperty(t.prototype, "loaded", {
			get: function() {
				return this.data ? this.data.loaded : this._loaded
			},
			set: function(t) {
				this.data && (this.data.loaded = t), this._loaded = t
			},
			enumerable: !0,
			configurable: !0
		}), t.prototype.toString = function() {
			return '[ResourceItem name="' + this.name + '" url="' + this.url + '" type="' + this.type + '"]'
		}, t.TYPE_XML = "xml", t.TYPE_IMAGE = "image", t.TYPE_BIN = "bin", t.TYPE_TEXT = "text", t.TYPE_JSON = "json", t.TYPE_SHEET = "sheet", t.TYPE_FONT = "font", t.TYPE_SOUND = "sound", t
	}();
	t.ResourceItem = e, e.prototype.__class__ = "RES.ResourceItem"
}(RES || (RES = {})),
function(t) {
	var e = function() {
		function e() {
			this.keyMap = {}, this.groupDic = {}, t.configInstance = this
		}
		return e.prototype.getGroupByName = function(t) {
			var e = [];
			if (!this.groupDic[t]) return e;
			t = this.groupDic[t];
			for (var i = t.length, n = 0; i > n; n++) e.push(this.parseResourceItem(t[n]));
			return e
		}, e.prototype.getRawGroupByName = function(t) {
			return this.groupDic[t] ? this.groupDic[t] : []
		}, e.prototype.createGroup = function(t, e, i) {
			if ("undefined" == typeof i && (i = !1), !i && this.groupDic[t] || !e || 0 == e.length) return !1;
			i = this.groupDic;
			for (var n = [], r = e.length, o = 0; r > o; o++) {
				var s = e[o],
					a = i[s];
				if (a)
					for (var s = a.length, h = 0; s > h; h++) {
						var c = a[h]; - 1 == n.indexOf(c) && n.push(c)
					} else(c = this.keyMap[s]) && -1 == n.indexOf(c) && n.push(c)
			}
			return 0 == n.length ? !1 : (this.groupDic[t] = n, !0)
		}, e.prototype.parseConfig = function(t, e) {
			if (t) {
				var i = t.resources;
				if (i)
					for (var n = i.length, r = 0; n > r; r++) {
						var o = i[r],
							s = o.url;
						s && -1 == s.indexOf("://") && (o.url = e + s), this.addItemToKeyMap(o)
					}
				if (i = t.groups)
					for (n = i.length, r = 0; n > r; r++) {
						for (var s = i[r], a = [], h = s.keys.split(","), c = h.length, u = 0; c > u; u++) o = h[u].trim(), (o = this.keyMap[o]) && -1 == a.indexOf(o) && a.push(o);
						this.groupDic[s.name] = a
					}
			}
		}, e.prototype.addSubkey = function(t, e) {
			var i = this.keyMap[e];
			i && !this.keyMap[t] && (this.keyMap[t] = i)
		}, e.prototype.addItemToKeyMap = function(t) {
			if (this.keyMap[t.name] || (this.keyMap[t.name] = t), t.hasOwnProperty("subkeys")) {
				var e = t.subkeys.split(",");
				t.subkeys = e;
				for (var i = e.length, n = 0; i > n; n++) {
					var r = e[n];
					null == this.keyMap[r] && (this.keyMap[r] = t)
				}
			}
		}, e.prototype.getName = function(t) {
			return (t = this.keyMap[t]) ? t.name : ""
		}, e.prototype.getType = function(t) {
			return (t = this.keyMap[t]) ? t.type : ""
		}, e.prototype.getRawResourceItem = function(t) {
			return this.keyMap[t]
		}, e.prototype.getResourceItem = function(t) {
			return (t = this.keyMap[t]) ? this.parseResourceItem(t) : null
		}, e.prototype.parseResourceItem = function(e) {
			var i = new t.ResourceItem(e.name, e.url, e.type);
			return i.data = e, i
		}, e
	}();
	t.ResourceConfig = e, e.prototype.__class__ = "RES.ResourceConfig"
}(RES || (RES = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this.thread = 2, this.loadingCount = 0, this.groupTotalDic = {}, this.numLoadedDic = {}, this.itemListDic = {}, this.priorityQueue = {}, this.lazyLoadList = [], this.analyzerDic = {}, this.queueIndex = 0
		}
		return __extends(i, e), i.prototype.isGroupInLoading = function(t) {
			return void 0 !== this.itemListDic[t]
		}, i.prototype.loadGroup = function(e, i, n) {
			if ("undefined" == typeof n && (n = 0), !this.itemListDic[i] && i)
				if (e && 0 != e.length) {
					this.priorityQueue[n] ? this.priorityQueue[n].push(i) : this.priorityQueue[n] = [i], this.itemListDic[i] = e, n = e.length;
					for (var r = 0; n > r; r++) e[r].groupName = i;
					this.groupTotalDic[i] = e.length, this.numLoadedDic[i] = 0, this.next()
				} else e = new t.ResourceEvent(t.ResourceEvent.GROUP_COMPLETE), e.groupName = i, this.dispatchEvent(e)
		}, i.prototype.loadItem = function(t) {
			this.lazyLoadList.push(t), t.groupName = "", this.next()
		}, i.prototype.next = function() {
			for (; this.loadingCount < this.thread;) {
				var e = this.getOneResourceItem();
				if (!e) break;
				if (this.loadingCount++, e.loaded) this.onItemComplete(e);
				else {
					var i = this.analyzerDic[e.type];
					i || (i = this.analyzerDic[e.type] = egret.Injector.getInstance(t.AnalyzerBase, e.type)), i.loadFile(e, this.onItemComplete, this)
				}
			}
		}, i.prototype.getOneResourceItem = function() {
			var t, e = Number.NEGATIVE_INFINITY;
			for (t in this.priorityQueue) e = Math.max(e, t);
			if (e = this.priorityQueue[e], !e || 0 == e.length) return 0 == this.lazyLoadList.length ? null : this.lazyLoadList.pop();
			t = e.length;
			for (var i, n = 0; t > n && (this.queueIndex >= t && (this.queueIndex = 0), i = this.itemListDic[e[this.queueIndex]], !(0 < i.length)); n++) this.queueIndex++;
			return 0 == i.length ? null : i.shift()
		}, i.prototype.onItemComplete = function(e) {
			this.loadingCount--;
			var i = e.groupName;
			if (e.loaded || t.ResourceEvent.dispatchResourceEvent(this.resInstance, t.ResourceEvent.ITEM_LOAD_ERROR, i, e), i) {
				this.numLoadedDic[i]++;
				var n = this.numLoadedDic[i],
					r = this.groupTotalDic[i];
				t.ResourceEvent.dispatchResourceEvent(this.resInstance, t.ResourceEvent.GROUP_PROGRESS, i, e, n, r), n == r && (this.removeGroupName(i), delete this.groupTotalDic[i], delete this.numLoadedDic[i], delete this.itemListDic[i], t.ResourceEvent.dispatchResourceEvent(this, t.ResourceEvent.GROUP_COMPLETE, i))
			} else this.callBack.call(this.resInstance, e);
			this.next()
		}, i.prototype.removeGroupName = function(t) {
			for (var e in this.priorityQueue) {
				for (var i = this.priorityQueue[e], n = i.length, r = 0, o = !1, n = i.length, s = 0; n > s; s++) {
					if (i[s] == t) {
						i.splice(r, 1), o = !0;
						break
					}
					r++
				}
				if (o) {
					0 == i.length && delete this.priorityQueue[e];
					break
				}
			}
		}, i
	}(egret.EventDispatcher);
	t.ResourceLoader = e, e.prototype.__class__ = "RES.ResourceLoader"
}(RES || (RES = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this.resourceConfig = t.configInstance
		}
		return __extends(i, e), i.prototype.addSubkey = function(t, e) {
			this.resourceConfig.addSubkey(t, e)
		}, i.prototype.loadFile = function() {}, i.prototype.getRes = function() {}, i.prototype.destroyRes = function() {
			return !1
		}, i.getStringPrefix = function(t) {
			if (!t) return "";
			var e = t.indexOf(".");
			return -1 != e ? t.substring(0, e) : ""
		}, i.getStringTail = function(t) {
			if (!t) return "";
			var e = t.indexOf(".");
			return -1 != e ? t.substring(e + 1) : ""
		}, i
	}(egret.HashObject);
	t.AnalyzerBase = e, e.prototype.__class__ = "RES.AnalyzerBase"
}(RES || (RES = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(t) {
		function e() {
			t.call(this), this.fileDic = {}, this.resItemDic = [], this._dataFormat = egret.URLLoaderDataFormat.BINARY, this.recycler = new egret.Recycler
		}
		return __extends(e, t), e.prototype.loadFile = function(t, e, i) {
			if (this.fileDic[t.name]) e.call(i, t);
			else {
				var n = this.getLoader();
				this.resItemDic[n.hashCode] = {
					item: t,
					func: e,
					thisObject: i
				}, n.load(new egret.URLRequest(t.url))
			}
		}, e.prototype.getLoader = function() {
			var t = this.recycler.pop();
			return t || (t = new egret.URLLoader, t.addEventListener(egret.Event.COMPLETE, this.onLoadFinish, this), t.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onLoadFinish, this)), t.dataFormat = this._dataFormat, t
		}, e.prototype.onLoadFinish = function(t) {
			var e = t.target,
				i = this.resItemDic[e.hashCode];
			delete this.resItemDic[e.hashCode], this.recycler.push(e);
			var n = i.item,
				r = i.func;
			n.loaded = t.type == egret.Event.COMPLETE, n.loaded && this.analyzeData(n, e.data), r.call(i.thisObject, n)
		}, e.prototype.analyzeData = function(t, e) {
			var i = t.name;
			!this.fileDic[i] && e && (this.fileDic[i] = e)
		}, e.prototype.getRes = function(t) {
			return this.fileDic[t]
		}, e.prototype.hasRes = function(t) {
			return null != this.getRes(t)
		}, e.prototype.destroyRes = function(t) {
			return this.fileDic[t] ? (delete this.fileDic[t], !0) : !1
		}, e
	}(t.AnalyzerBase);
	t.BinAnalyzer = e, e.prototype.__class__ = "RES.BinAnalyzer"
}(RES || (RES = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(t) {
		function e() {
			t.call(this), this._dataFormat = egret.URLLoaderDataFormat.TEXTURE
		}
		return __extends(e, t), e.prototype.analyzeData = function(t, e) {
			var i = t.name;
			!this.fileDic[i] && e && (this.fileDic[i] = e, (i = t.data) && i.scale9grid && (i = i.scale9grid.split(","), e.scale9Grid = new egret.Rectangle(parseInt(i[0]), parseInt(i[1]), parseInt(i[2]), parseInt(i[3]))))
		}, e
	}(t.BinAnalyzer);
	t.ImageAnalyzer = e, e.prototype.__class__ = "RES.ImageAnalyzer"
}(RES || (RES = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(t) {
		function e() {
			t.call(this), this._dataFormat = egret.URLLoaderDataFormat.TEXT
		}
		return __extends(e, t), e.prototype.analyzeData = function(t, e) {
			var i = t.name;
			if (!this.fileDic[i] && e) try {
				this.fileDic[i] = JSON.parse(e)
			} catch (n) {
				egret.Logger.warning("JSON文件格式不正确: " + t.url + "\ndata:" + e)
			}
		}, e
	}(t.BinAnalyzer);
	t.JsonAnalyzer = e, e.prototype.__class__ = "RES.JsonAnalyzer"
}(RES || (RES = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(t) {
		function e() {
			t.call(this), this._dataFormat = egret.URLLoaderDataFormat.TEXT
		}
		return __extends(e, t), e
	}(t.BinAnalyzer);
	t.TextAnalyzer = e, e.prototype.__class__ = "RES.TextAnalyzer"
}(RES || (RES = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this), this.sheetMap = {}, this.textureMap = {}, this._dataFormat = egret.URLLoaderDataFormat.TEXT
		}
		return __extends(i, e), i.prototype.getRes = function(e) {
			var i = this.fileDic[e];
			return i || (i = this.textureMap[e]), !i && (i = t.AnalyzerBase.getStringPrefix(e), i = this.fileDic[i]) && (e = t.AnalyzerBase.getStringTail(e), i = i.getTexture(e)), i
		}, i.prototype.onLoadFinish = function(t) {
			var e = t.target,
				i = this.resItemDic[e.hashCode];
			delete this.resItemDic[e.hashCode], this.recycler.push(e);
			var n = i.item,
				r = i.func;
			n.loaded = t.type == egret.Event.COMPLETE, n.loaded && this.analyzeData(n, e.data), "string" == typeof e.data ? (this._dataFormat = egret.URLLoaderDataFormat.TEXTURE, this.loadFile(n, r, i.thisObject), this._dataFormat = egret.URLLoaderDataFormat.TEXT) : r.call(i.thisObject, n)
		}, i.prototype.analyzeData = function(t, e) {
			var i = t.name;
			if (!this.fileDic[i] && e) {
				var n;
				if ("string" == typeof e) {
					try {
						n = JSON.parse(e)
					} catch (r) {
						egret.Logger.warning("JSON文件格式不正确: " + t.url)
					}
					n && (this.sheetMap[i] = n, t.loaded = !1, t.url = this.getRelativePath(t.url, n.file))
				} else n = this.sheetMap[i], delete this.sheetMap[i], e && (n = this.parseSpriteSheet(e, n, t.data && t.data.subkeys ? "" : i), this.fileDic[i] = n)
			}
		}, i.prototype.getRelativePath = function(t, e) {
			t = t.split("\\").join("/");
			var i = t.lastIndexOf("/");
			return t = -1 != i ? t.substring(0, i + 1) + e : e
		}, i.prototype.parseSpriteSheet = function(t, e, i) {
			if (e = e.frames, !e) return null;
			var n, r = new egret.SpriteSheet(t),
				o = this.textureMap;
			for (n in e) {
				var s = e[n];
				t = r.createTexture(n, s.x, s.y, s.w, s.h, s.offX, s.offY, s.sourceW, s.sourceH), s.scale9grid && (s = s.scale9grid.split(","), t.scale9Grid = new egret.Rectangle(parseInt(s[0]), parseInt(s[1]), parseInt(s[2]), parseInt(s[3]))), null == o[n] && (o[n] = t, i && this.addSubkey(n, i))
			}
			return r
		}, i
	}(t.BinAnalyzer);
	t.SheetAnalyzer = e, e.prototype.__class__ = "RES.SheetAnalyzer"
}(RES || (RES = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(t) {
		function e() {
			t.call(this)
		}
		return __extends(e, t), e.prototype.analyzeData = function(t, e) {
			var i = t.name;
			if (!this.fileDic[i] && e) {
				var n;
				"string" == typeof e ? (n = e, this.sheetMap[i] = n, t.loaded = !1, t.url = this.getTexturePath(t.url, n)) : (n = this.sheetMap[i], delete this.sheetMap[i], e && (n = new egret.BitmapTextSpriteSheet(e, n), this.fileDic[i] = n))
			}
		}, e.prototype.getTexturePath = function(t, e) {
			var i = "",
				n = e.split("\n")[2],
				r = n.indexOf('file="');
			return -1 != r && (n = n.substring(r + 6), r = n.indexOf('"'), i = n.substring(0, r)), t = t.split("\\").join("/"), r = t.lastIndexOf("/"), t = -1 != r ? t.substring(0, r + 1) + i : i
		}, e
	}(t.SheetAnalyzer);
	t.FontAnalyzer = e, e.prototype.__class__ = "RES.FontAnalyzer"
}(RES || (RES = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(t) {
		function e() {
			t.call(this), this._dataFormat = egret.URLLoaderDataFormat.SOUND
		}
		return __extends(e, t), e.prototype.analyzeData = function(t, e) {
			var i = t.name;
			!this.fileDic[i] && e && (this.fileDic[i] = e, e.preload((i = t.data) && i.soundType ? i.soundType : egret.Sound.EFFECT))
		}, e
	}(t.BinAnalyzer);
	t.SoundAnalyzer = e, e.prototype.__class__ = "RES.SoundAnalyzer"
}(RES || (RES = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(t) {
		function e() {
			t.call(this), this._dataFormat = egret.URLLoaderDataFormat.TEXT
		}
		return __extends(e, t), e.prototype.analyzeData = function(t, e) {
			var i = t.name;
			if (!this.fileDic[i] && e) try {
				var n = egret.XML.parse(e);
				this.fileDic[i] = n
			} catch (r) {}
		}, e
	}(t.BinAnalyzer);
	t.XMLAnalyzer = e, e.prototype.__class__ = "RES.XMLAnalyzer"
}(RES || (RES = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	t.loadConfig = function(t, e, n) {
		"undefined" == typeof e && (e = ""), "undefined" == typeof n && (n = "json"), i.loadConfig(t, e, n)
	}, t.loadGroup = function(t, e) {
		"undefined" == typeof e && (e = 0), i.loadGroup(t, e)
	}, t.isGroupLoaded = function(t) {
		return i.isGroupLoaded(t)
	}, t.getGroupByName = function(t) {
		return i.getGroupByName(t)
	}, t.createGroup = function(t, e, n) {
		return "undefined" == typeof n && (n = !1), i.createGroup(t, e, n)
	}, t.hasRes = function(t) {
		return i.hasRes(t)
	}, t.getRes = function(t) {
		return i.getRes(t)
	}, t.getResAsync = function(t, e, n) {
		i.getResAsync(t, e, n)
	}, t.getResByUrl = function(t, e, n, r) {
		"undefined" == typeof r && (r = ""), i.getResByUrl(t, e, n, r)
	}, t.destroyRes = function(t) {
		return i.destroyRes(t)
	}, t.setMaxLoadingThread = function(t) {
		i.setMaxLoadingThread(t)
	}, t.addEventListener = function(t, e, n, r, o) {
		"undefined" == typeof r && (r = !1), "undefined" == typeof o && (o = 0), i.addEventListener(t, e, n, r, o)
	}, t.removeEventListener = function(t, e, n, r) {
		"undefined" == typeof r && (r = !1), i.removeEventListener(t, e, n, r)
	};
	var e = function(e) {
		function i() {
			e.call(this), this.analyzerDic = {}, this.configItemList = [], this.configComplete = this.callLaterFlag = !1, this.loadedGroups = [], this.groupNameList = [], this.asyncDic = {}, this.init()
		}
		return __extends(i, e), i.prototype.getAnalyzerByType = function(e) {
			var i = this.analyzerDic[e];
			return i || (i = this.analyzerDic[e] = egret.Injector.getInstance(t.AnalyzerBase, e)), i
		}, i.prototype.init = function() {
			egret.Injector.hasMapRule(t.AnalyzerBase, t.ResourceItem.TYPE_BIN) || egret.Injector.mapClass(t.AnalyzerBase, t.BinAnalyzer, t.ResourceItem.TYPE_BIN), egret.Injector.hasMapRule(t.AnalyzerBase, t.ResourceItem.TYPE_IMAGE) || egret.Injector.mapClass(t.AnalyzerBase, t.ImageAnalyzer, t.ResourceItem.TYPE_IMAGE), egret.Injector.hasMapRule(t.AnalyzerBase, t.ResourceItem.TYPE_TEXT) || egret.Injector.mapClass(t.AnalyzerBase, t.TextAnalyzer, t.ResourceItem.TYPE_TEXT), egret.Injector.hasMapRule(t.AnalyzerBase, t.ResourceItem.TYPE_JSON) || egret.Injector.mapClass(t.AnalyzerBase, t.JsonAnalyzer, t.ResourceItem.TYPE_JSON), egret.Injector.hasMapRule(t.AnalyzerBase, t.ResourceItem.TYPE_SHEET) || egret.Injector.mapClass(t.AnalyzerBase, t.SheetAnalyzer, t.ResourceItem.TYPE_SHEET), egret.Injector.hasMapRule(t.AnalyzerBase, t.ResourceItem.TYPE_FONT) || egret.Injector.mapClass(t.AnalyzerBase, t.FontAnalyzer, t.ResourceItem.TYPE_FONT), egret.Injector.hasMapRule(t.AnalyzerBase, t.ResourceItem.TYPE_SOUND) || egret.Injector.mapClass(t.AnalyzerBase, t.SoundAnalyzer, t.ResourceItem.TYPE_SOUND), egret.Injector.hasMapRule(t.AnalyzerBase, t.ResourceItem.TYPE_XML) || egret.Injector.mapClass(t.AnalyzerBase, t.XMLAnalyzer, t.ResourceItem.TYPE_XML), this.resConfig = new t.ResourceConfig, this.resLoader = new t.ResourceLoader, this.resLoader.callBack = this.onResourceItemComp, this.resLoader.resInstance = this, this.resLoader.addEventListener(t.ResourceEvent.GROUP_COMPLETE, this.onGroupComp, this)
		}, i.prototype.loadConfig = function(t, e, i) {
			"undefined" == typeof i && (i = "json"), this.configItemList.push({
				url: t,
				resourceRoot: e,
				type: i
			}), this.callLaterFlag || (egret.callLater(this.startLoadConfig, this), this.callLaterFlag = !0)
		}, i.prototype.startLoadConfig = function() {
			this.callLaterFlag = !1;
			var e = this.configItemList;
			this.configItemList = [], this.loadingConfigList = e;
			for (var n = e.length, r = [], o = 0; n > o; o++) {
				var s = e[o],
					s = new t.ResourceItem(s.url, s.url, s.type);
				r.push(s)
			}
			this.resLoader.loadGroup(r, i.GROUP_CONFIG, Number.MAX_VALUE)
		}, i.prototype.isGroupLoaded = function(t) {
			return -1 != this.loadedGroups.indexOf(t)
		}, i.prototype.getGroupByName = function(t) {
			return this.resConfig.getGroupByName(t)
		}, i.prototype.loadGroup = function(t, e) {
			if ("undefined" == typeof e && (e = 0), -1 == this.loadedGroups.indexOf(t) && !this.resLoader.isGroupInLoading(t))
				if (this.configComplete) {
					var i = this.resConfig.getGroupByName(t);
					this.resLoader.loadGroup(i, t, e)
				} else this.groupNameList.push({
					name: t,
					priority: e
				})
		}, i.prototype.createGroup = function(t, e, i) {
			if ("undefined" == typeof i && (i = !1), i) {
				var n = this.loadedGroups.indexOf(t); - 1 != n && this.loadedGroups.splice(n, 1)
			}
			return this.resConfig.createGroup(t, e, i)
		}, i.prototype.onGroupComp = function(e) {
			if (e.groupName == i.GROUP_CONFIG) {
				e = this.loadingConfigList.length;
				for (var n = 0; e > n; n++) {
					var r = this.loadingConfigList[n],
						o = this.getAnalyzerByType(r.type),
						s = o.getRes(r.url);
					o.destroyRes(r.url), this.resConfig.parseConfig(s, r.resourceRoot)
				}
				for (this.configComplete = !0, this.loadingConfigList = null, t.ResourceEvent.dispatchResourceEvent(this, t.ResourceEvent.CONFIG_COMPLETE), r = this.groupNameList, e = r.length, n = 0; e > n; n++) o = r[n], this.loadGroup(o.name, o.priority);
				this.groupNameList = []
			} else this.loadedGroups.push(e.groupName), this.dispatchEvent(e)
		}, i.prototype.hasRes = function(e) {
			var i = this.resConfig.getType(e);
			return "" == i && (e = t.AnalyzerBase.getStringPrefix(e), i = this.resConfig.getType(e), "" == i) ? !1 : !0
		}, i.prototype.getRes = function(e) {
			var i = this.resConfig.getType(e);
			return "" == i && (i = t.AnalyzerBase.getStringPrefix(e), i = this.resConfig.getType(i), "" == i) ? null : this.getAnalyzerByType(i).getRes(e)
		}, i.prototype.getResAsync = function(e, i, n) {
			var r = this.resConfig.getType(e),
				o = this.resConfig.getName(e);
			return "" == r && (o = t.AnalyzerBase.getStringPrefix(e), r = this.resConfig.getType(o), "" == r) ? void i.call(n, null) : void((r = this.getAnalyzerByType(r).getRes(e)) ? i.call(n, r) : (e = {
				key: e,
				compFunc: i,
				thisObject: n
			}, this.asyncDic[o] ? this.asyncDic[o].push(e) : (this.asyncDic[o] = [e], o = this.resConfig.getResourceItem(o), this.resLoader.loadItem(o))))
		}, i.prototype.getResByUrl = function(e, i, n, r) {
			if ("undefined" == typeof r && (r = ""), e) {
				r || (r = this.getTypeByUrl(e));
				var o = this.getAnalyzerByType(r).getRes(e);
				o ? i.call(n, o) : (i = {
					key: e,
					compFunc: i,
					thisObject: n
				}, this.asyncDic[e] ? this.asyncDic[e].push(i) : (this.asyncDic[e] = [i], e = new t.ResourceItem(e, e, r), this.resLoader.loadItem(e)))
			} else i.call(n, null)
		}, i.prototype.getTypeByUrl = function(e) {
			switch ((e = e.substr(e.lastIndexOf(".") + 1)) && (e = e.toLowerCase()), e) {
				case t.ResourceItem.TYPE_XML:
				case t.ResourceItem.TYPE_JSON:
				case t.ResourceItem.TYPE_SHEET:
					break;
				case "png":
				case "jpg":
				case "gif":
					e = t.ResourceItem.TYPE_IMAGE;
					break;
				case "fnt":
					e = t.ResourceItem.TYPE_FONT;
					break;
				case "txt":
					e = t.ResourceItem.TYPE_TEXT;
					break;
				case "mp3":
				case "ogg":
				case "mpeg":
				case "wav":
				case "m4a":
				case "mp4":
				case "aiff":
				case "wma":
				case "mid":
					e = t.ResourceItem.TYPE_SOUND;
					break;
				default:
					e = t.ResourceItem.TYPE_BIN
			}
			return e
		}, i.prototype.onResourceItemComp = function(t) {
			var e = this.asyncDic[t.name];
			delete this.asyncDic[t.name], t = this.getAnalyzerByType(t.type);
			for (var i = e.length, n = 0; i > n; n++) {
				var r = e[n],
					o = t.getRes(r.key);
				r.compFunc.call(r.thisObject, o, r.key)
			}
		}, i.prototype.destroyRes = function(t) {
			var e = this.resConfig.getRawGroupByName(t);
			if (e) {
				var i = this.loadedGroups.indexOf(t); - 1 != i && this.loadedGroups.splice(i, 1), t = e.length;
				for (var n = 0; t > n; n++) {
					i = e[n], i.loaded = !1;
					var r = this.getAnalyzerByType(i.type);
					r.destroyRes(i.name)
				}
				return !0
			}
			return e = this.resConfig.getType(t), "" == e ? !1 : (i = this.resConfig.getRawResourceItem(t), i.loaded = !1, r = this.getAnalyzerByType(e), r.destroyRes(t))
		}, i.prototype.setMaxLoadingThread = function(t) {
			1 > t && (t = 1), this.resLoader.thread = t
		}, i.GROUP_CONFIG = "RES__CONFIG", i
	}(egret.EventDispatcher);
	e.prototype.__class__ = "Resource";
	var i = new e
}(RES || (RES = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(t) {
			"undefined" == typeof t && (t = 60), e.call(this), this.frameRate = t, this._time = 0, 60 == t && (i.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame, i.cancelAnimationFrame = window.cancelAnimationFrame || window.msCancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.oCancelAnimationFrame || window.cancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.webkitCancelRequestAnimationFrame), i.requestAnimationFrame || (i.requestAnimationFrame = function(e) {
				return window.setTimeout(e, 1e3 / t)
			}), i.cancelAnimationFrame || (i.cancelAnimationFrame = function(t) {
				return window.clearTimeout(t)
			}), i.instance = this, this.registerListener()
		}
		return __extends(i, e), i.prototype.enterFrame = function() {
			var e = i.instance,
				n = i._thisObject,
				r = i._callback,
				o = t.getTimer(),
				s = o - e._time;
			e._requestAnimationId = i.requestAnimationFrame.call(window, i.prototype.enterFrame), r.call(n, s), e._time = o
		}, i.prototype.executeMainLoop = function(t, e) {
			i._callback = t, i._thisObject = e, this.enterFrame()
		}, i.prototype.reset = function() {
			var e = i.instance;
			e._requestAnimationId && (e._time = t.getTimer(), i.cancelAnimationFrame.call(window, e._requestAnimationId), e.enterFrame())
		}, i.prototype.registerListener = function() {
			var t = function() {
				i.instance.reset()
			}, e = function() {
					document[n] || t()
				};
			window.onfocus = t, window.onblur = function() {};
			var n, r;
			"undefined" != typeof document.hidden ? (n = "hidden", r = "visibilitychange") : "undefined" != typeof document.mozHidden ? (n = "mozHidden", r = "mozvisibilitychange") : "undefined" != typeof document.msHidden ? (n = "msHidden", r = "msvisibilitychange") : "undefined" != typeof document.webkitHidden && (n = "webkitHidden", r = "webkitvisibilitychange"), "onpageshow" in window && "onpagehide" in window && window.addEventListener("pageshow", t, !1), n && r && document.addEventListener(r, e, !1)
		}, i
	}(t.DeviceContext);
	t.HTML5DeviceContext = e, e.prototype.__class__ = "egret.HTML5DeviceContext"
}(egret || (egret = {}));
var egret_html5_localStorage;
! function(t) {
	t.getItem = function(t) {
		return window.localStorage.getItem(t)
	}, t.setItem = function(t, e) {
		window.localStorage.setItem(t, e)
	}, t.removeItem = function(t) {
		window.localStorage.removeItem(t)
	}, t.clear = function() {
		window.localStorage.clear()
	}, t.init = function() {
		for (var e in t) egret.localStorage[e] = t[e]
	}
}(egret_html5_localStorage || (egret_html5_localStorage = {})), egret_html5_localStorage.init(), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(t) {
			e.call(this), this.globalAlpha = 1, this.canvas = t, this.canvasContext = t.getContext("2d");
			var i = this.canvasContext.setTransform,
				n = this;
			this.canvasContext.setTransform = function(t, e, r, o, s, a) {
				n._matrixA = t, n._matrixB = e, n._matrixC = r, n._matrixD = o, n._matrixTx = s, n._matrixTy = a, i.call(n.canvasContext, t, e, r, o, s, a)
			}, this._matrixA = 1, this._matrixC = this._matrixB = 0, this._matrixD = 1, this._transformTy = this._transformTx = this._matrixTy = this._matrixTx = 0, e.call(this)
		}
		return __extends(i, e), i.prototype.clearScreen = function() {
			for (var e = t.RenderFilter.getInstance().getDrawAreaList(), i = 0, n = e.length; n > i; i++) {
				var r = e[i];
				this.clearRect(r.x, r.y, r.width, r.height)
			}
			this.renderCost = 0
		}, i.prototype.clearRect = function(t, e, i, n) {
			this.canvasContext.clearRect(t, e, i, n)
		}, i.prototype.drawImage = function(i, n, r, o, s, a, h, c, u) {
			var p = t.MainContext.instance.rendererContext.texture_scale_factor;
			n /= p, r /= p, o /= p, s /= p, i = i._bitmapData, a += this._transformTx, h += this._transformTy, p = t.getTimer(), this.canvasContext.drawImage(i, n, r, o, s, a, h, c, u), e.prototype.drawImage.call(this, i, n, r, o, s, a, h, c, u), this.renderCost += t.getTimer() - p
		}, i.prototype.setTransform = function(t) {
			1 == t.a && 0 == t.b && 0 == t.c && 1 == t.d && 1 == this._matrixA && 0 == this._matrixB && 0 == this._matrixC && 1 == this._matrixD ? (this._transformTx = t.tx - this._matrixTx, this._transformTy = t.ty - this._matrixTy) : (this._transformTx = this._transformTy = 0, this._matrixA == t.a && this._matrixB == t.b && this._matrixC == t.c && this._matrixD == t.d && this._matrixTx == t.tx && this._matrixTy == t.ty || this.canvasContext.setTransform(t.a, t.b, t.c, t.d, t.tx, t.ty))
		}, i.prototype.setAlpha = function(e, i) {
			e != this.globalAlpha && (this.canvasContext.globalAlpha = this.globalAlpha = e), i ? (this.blendValue = i, this.canvasContext.globalCompositeOperation = i) : this.blendValue != t.BlendMode.NORMAL && (this.blendValue = t.BlendMode.NORMAL, this.canvasContext.globalCompositeOperation = t.BlendMode.NORMAL)
		}, i.prototype.setupFont = function(t) {
			var e = this.canvasContext,
				i = t.italic ? "italic " : "normal ",
				i = i + (t.bold ? "bold " : "normal "),
				i = i + (t.size + "px " + t.fontFamily);
			e.font = i, e.textAlign = "left", e.textBaseline = "middle"
		}, i.prototype.measureText = function(t) {
			return this.canvasContext.measureText(t).width
		}, i.prototype.drawText = function(t, i, n, r, o) {
			var s = t._strokeColorString,
				a = t.stroke,
				h = this.canvasContext;
			h.fillStyle = t._textColorString, h.strokeStyle = s, a && (h.lineWidth = 2 * a, h.strokeText(i, n + this._transformTx, r + this._transformTy, o || 65535)), h.fillText(i, n + this._transformTx, r + this._transformTy, o || 65535), e.prototype.drawText.call(this, t, i, n, r, o)
		}, i.prototype.strokeRect = function(t, e, i, n, r) {
			this.canvasContext.strokeStyle = r, this.canvasContext.strokeRect(t, e, i, n)
		}, i.prototype.pushMask = function(t) {
			this.canvasContext.save(), this.canvasContext.beginPath(), this.canvasContext.rect(t.x + this._transformTx, t.y + this._transformTy, t.width, t.height), this.canvasContext.clip(), this.canvasContext.closePath()
		}, i.prototype.popMask = function() {
			this.canvasContext.restore(), this.canvasContext.setTransform(1, 0, 0, 1, 0, 0)
		}, i.prototype.onRenderStart = function() {
			this.canvasContext.save()
		}, i.prototype.onRenderFinish = function() {
			this.canvasContext.restore(), this.canvasContext.setTransform(1, 0, 0, 1, 0, 0)
		}, i
	}(t.RendererContext);
	t.HTML5CanvasRenderer = e, e.prototype.__class__ = "egret.HTML5CanvasRenderer"
}(egret || (egret = {}));
var egret_h5_graphics;
! function(t) {
	t.beginFill = function(t, i) {
		"undefined" == typeof i && (i = 1);
		var n = "rgba(" + (t >> 16) + "," + ((65280 & t) >> 8) + "," + (255 & t) + "," + i + ")";
		this.fillStyleColor = n, this.commandQueue.push(new e(this._setStyle, this, [n]))
	}, t.drawRect = function(t, i, n, r) {
		this.commandQueue.push(new e(function(t, e, i, n) {
			var r = this.renderContext;
			this.canvasContext.beginPath(), this.canvasContext.rect(r._transformTx + t, r._transformTy + e, i, n), this.canvasContext.closePath()
		}, this, [t, i, n, r])), this._fill()
	}, t.drawCircle = function(t, i, n) {
		this.commandQueue.push(new e(function(t, e, i) {
			var n = this.renderContext;
			this.canvasContext.beginPath(), this.canvasContext.arc(n._transformTx + t, n._transformTy + e, i, 0, 2 * Math.PI), this.canvasContext.closePath()
		}, this, [t, i, n])), this._fill()
	}, t.drawRoundRect = function(t, i, n, r, o, s) {
		this.commandQueue.push(new e(function(t, e, i, n, r, o) {
			var s = this.renderContext;
			t = s._transformTx + t, e = s._transformTy + e, r /= 2, o = o ? o / 2 : r, i = t + i, n = e + n, s = n - o, this.canvasContext.beginPath(), this.canvasContext.moveTo(i, s), this.canvasContext.quadraticCurveTo(i, n, i - r, n), this.canvasContext.lineTo(t + r, n), this.canvasContext.quadraticCurveTo(t, n, t, n - o), this.canvasContext.lineTo(t, e + o), this.canvasContext.quadraticCurveTo(t, e, t + r, e), this.canvasContext.lineTo(i - r, e), this.canvasContext.quadraticCurveTo(i, e, i, e + o), this.canvasContext.lineTo(i, s), this.canvasContext.closePath()
		}, this, [t, i, n, r, o, s])), this._fill()
	}, t.drawEllipse = function(t, i, n, r) {
		this.commandQueue.push(new e(function(t, e, i, n) {
			var r = this.renderContext;
			this.canvasContext.save(), t = r._transformTx + t, e = r._transformTy + e;
			var r = i > n ? i : n,
				o = i / r;
			n /= r, this.canvasContext.scale(o, n), this.canvasContext.beginPath(), this.canvasContext.moveTo((t + i) / o, e / n), this.canvasContext.arc(t / o, e / n, r, 0, 2 * Math.PI), this.canvasContext.closePath(), this.canvasContext.restore(), this.canvasContext.stroke()
		}, this, [t, i, n, r])), this._fill()
	}, t.lineStyle = function(t, i, n, r, o, s, a, h) {
		"undefined" == typeof t && (t = 0 / 0), "undefined" == typeof i && (i = 0), "undefined" == typeof n && (n = 1), "undefined" == typeof r && (r = !1), "undefined" == typeof o && (o = "normal"), "undefined" == typeof s && (s = null), "undefined" == typeof a && (a = null), "undefined" == typeof h && (h = 3), this.strokeStyleColor && (this.createEndLineCommand(), this.commandQueue.push(this.endLineCommand)), this.strokeStyleColor = i = "rgba(" + (i >> 16) + "," + ((65280 & i) >> 8) + "," + (255 & i) + "," + n + ")", this.commandQueue.push(new e(function(t, e) {
			this.canvasContext.lineWidth = t, this.canvasContext.strokeStyle = e, this.canvasContext.beginPath()
		}, this, [t, i])), "undefined" == typeof this.lineX && (this.lineY = this.lineX = 0), this.moveTo(this.lineX, this.lineY)
	}, t.lineTo = function(t, i) {
		this.commandQueue.push(new e(function(t, e) {
			var i = this.renderContext;
			this.canvasContext.lineTo(i._transformTx + t, i._transformTy + e)
		}, this, [t, i])), this.lineX = t, this.lineY = i
	}, t.curveTo = function(t, i, n, r) {
		this.commandQueue.push(new e(function(t, e, i, n) {
			var r = this.renderContext;
			this.canvasContext.quadraticCurveTo(r._transformTx + t, r._transformTy + e, i, n)
		}, this, [t, i, n, r])), this.lineX = n, this.lineY = r
	}, t.moveTo = function(t, i) {
		this.commandQueue.push(new e(function(t, e) {
			var i = this.renderContext;
			this.canvasContext.moveTo(i._transformTx + t, i._transformTy + e)
		}, this, [t, i]))
	}, t.clear = function() {
		this.lineY = this.lineX = this.commandQueue.length = 0, this.fillStyleColor = this.strokeStyleColor = null
	}, t.createEndFillCommand = function() {
		this.endFillCommand || (this.endFillCommand = new e(function() {
			this.canvasContext.fill(), this.canvasContext.closePath()
		}, this, null))
	}, t.endFill = function() {
		null != this.fillStyleColor && this._fill(), this.fillStyleColor = null
	}, t._fill = function() {
		this.fillStyleColor && (this.createEndFillCommand(), this.commandQueue.push(this.endFillCommand))
	}, t.createEndLineCommand = function() {
		this.endLineCommand || (this.endLineCommand = new e(function() {
			this.canvasContext.stroke(), this.canvasContext.closePath()
		}, this, null))
	}, t._draw = function(t) {
		this.renderContext = t, t = this.canvasContext = this.renderContext.canvasContext, t.save();
		var e = this.commandQueue.length;
		this.strokeStyleColor && e > 0 && this.commandQueue[e - 1] != this.endLineCommand && (this.createEndLineCommand(), this.commandQueue.push(this.endLineCommand), e = this.commandQueue.length);
		for (var i = 0; e > i; i++) {
			var n = this.commandQueue[i];
			n.method.apply(n.thisObject, n.args)
		}
		t.restore()
	};
	var e = function() {
		return function(t, e, i) {
			this.method = t, this.thisObject = e, this.args = i
		}
	}();
	e.prototype.__class__ = "Command", t._setStyle = function(t) {
		this.canvasContext.fillStyle = t, this.canvasContext.beginPath()
	}, t.init = function() {
		for (var e in t) egret.Graphics.prototype[e] = t[e];
		egret.RendererContext.createRendererContext = function(t) {
			return new egret.HTML5CanvasRenderer(t)
		}
	}
}(egret_h5_graphics || (egret_h5_graphics = {})), egret_h5_graphics.init(), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(i) {
			e.call(this), this.size = 2e3, this.vertSize = 6, this.contextLost = !1, this.glContextId = 0, this.currentBlendMode = "", this.currentBaseTexture = null, this.currentBatchSize = 0, this.maskList = [], this.maskDataFreeList = [], this.canvasContext = document.createElement("canvas").getContext("2d"), console.log("使用WebGL模式"), this.canvas = i, i.addEventListener("webglcontextlost", this.handleContextLost.bind(this), !1), i.addEventListener("webglcontextrestored", this.handleContextRestored.bind(this), !1), this.projectionX = i.width / 2, this.projectionY = -i.height / 2, i = 6 * this.size, this.vertices = new Float32Array(4 * this.size * this.vertSize), this.indices = new Uint16Array(i);
			for (var n = 0, r = 0; i > n; n += 6, r += 4) this.indices[n + 0] = r + 0, this.indices[n + 1] = r + 1, this.indices[n + 2] = r + 2, this.indices[n + 3] = r + 0, this.indices[n + 4] = r + 2, this.indices[n + 5] = r + 3;
			this.initWebGL(), this.shaderManager = new t.WebGLShaderManager(this.gl), this.worldTransform = new t.Matrix, this.initBlendMode(), t.MainContext.instance.addEventListener(t.Event.FINISH_RENDER, this._draw, this), t.TextField.prototype._draw = function(e) {
				this.getDirty() && (this.cacheAsBitmap = !0), t.DisplayObject.prototype._draw.call(this, e)
			}
		}
		return __extends(i, e), i.prototype.handleContextLost = function() {
			this.contextLost = !0
		}, i.prototype.handleContextRestored = function() {
			this.initWebGL(), this.shaderManager.setContext(this.gl), this.contextLost = !1
		}, i.prototype.initWebGL = function() {
			for (var t, e = {
					stencil: !0
				}, i = ["experimental-webgl", "webgl"], n = 0; n < i.length; n++) {
				try {
					t = this.canvas.getContext(i[n], e)
				} catch (r) {}
				if (t) break
			}
			if (!t) throw Error("当前浏览器不支持webgl");
			this.setContext(t)
		}, i.prototype.setContext = function(t) {
			this.gl = t, t.id = this.glContextId++, this.vertexBuffer = t.createBuffer(), this.indexBuffer = t.createBuffer(), t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, this.indexBuffer), t.bufferData(t.ELEMENT_ARRAY_BUFFER, this.indices, t.STATIC_DRAW), t.bindBuffer(t.ARRAY_BUFFER, this.vertexBuffer), t.bufferData(t.ARRAY_BUFFER, this.vertices, t.DYNAMIC_DRAW), t.disable(t.DEPTH_TEST), t.disable(t.CULL_FACE), t.enable(t.BLEND), t.colorMask(!0, !0, !0, !0)
		}, i.prototype.initBlendMode = function() {
			i.blendModesWebGL[t.BlendMode.NORMAL] = [this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA], i.blendModesWebGL[t.BlendMode.ADD] = [this.gl.SRC_ALPHA, this.gl.DST_ALPHA]
		}, i.prototype.start = function() {
			if (!this.contextLost) {
				var t = this.gl;
				t.activeTexture(t.TEXTURE0), t.bindBuffer(t.ARRAY_BUFFER, this.vertexBuffer), t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
				var e = this.shaderManager.defaultShader;
				t.uniform2f(e.projectionVector, this.projectionX, this.projectionY);
				var i = 4 * this.vertSize;
				t.vertexAttribPointer(e.aVertexPosition, 2, t.FLOAT, !1, i, 0), t.vertexAttribPointer(e.aTextureCoord, 2, t.FLOAT, !1, i, 8), t.vertexAttribPointer(e.colorAttribute, 2, t.FLOAT, !1, i, 16)
			}
		}, i.prototype.clearScreen = function() {
			var e = this.gl;
			e.colorMask(!0, !0, !0, !0);
			for (var i = t.RenderFilter.getInstance().getDrawAreaList(), n = 0, r = i.length; r > n; n++) {
				var o = i[n];
				e.viewport(o.x, o.y, o.width, o.height), e.bindFramebuffer(e.FRAMEBUFFER, null), e.clearColor(0, 0, 0, 0), e.clear(e.COLOR_BUFFER_BIT)
			}
			this.renderCost = 0
		}, i.prototype.setBlendMode = function(e) {
			if (e || (e = t.BlendMode.NORMAL), this.currentBlendMode != e) {
				var n = i.blendModesWebGL[e];
				n && (this.gl.blendFunc(n[0], n[1]), this.currentBlendMode = e)
			}
		}, i.prototype.drawImage = function(e, i, n, r, o, s, a, h, c) {
			if (!this.contextLost) {
				var u = t.MainContext.instance.rendererContext.texture_scale_factor;
				i /= u, n /= u, r /= u, o /= u, this.createWebGLTexture(e), (e.webGLTexture !== this.currentBaseTexture || this.currentBatchSize >= this.size) && (this._draw(), this.currentBaseTexture = e.webGLTexture);
				var p = this.worldTransform,
					l = p.a,
					d = p.b,
					f = p.c,
					_ = p.d,
					g = p.tx,
					y = p.ty;
				0 == s && 0 == a || p.append(1, 0, 0, 1, s, a), 1 == r / h && 1 == o / c || p.append(h / r, 0, 0, c / o, 0, 0), s = p.a, a = p.b, h = p.c, c = p.d;
				var u = p.tx,
					m = p.ty;
				p.a = l, p.b = d, p.c = f, p.d = _, p.tx = g, p.ty = y, l = e._sourceWidth, d = e._sourceHeight, e = r, p = o, i /= l, n /= d, r /= l, o /= d, l = this.vertices, d = 4 * this.currentBatchSize * this.vertSize, f = this.worldAlpha, l[d++] = u, l[d++] = m, l[d++] = i, l[d++] = n, l[d++] = f, l[d++] = 16777215, l[d++] = s * e + u, l[d++] = a * e + m, l[d++] = r + i, l[d++] = n, l[d++] = f, l[d++] = 16777215, l[d++] = s * e + h * p + u, l[d++] = c * p + a * e + m, l[d++] = r + i, l[d++] = o + n, l[d++] = f, l[d++] = 16777215, l[d++] = h * p + u, l[d++] = c * p + m, l[d++] = i, l[d++] = o + n, l[d++] = f, l[d++] = 16777215, this.currentBatchSize++
			}
		}, i.prototype._draw = function() {
			if (0 != this.currentBatchSize && !this.contextLost) {
				var e = t.getTimer();
				this.start();
				var i = this.gl;
				i.bindTexture(i.TEXTURE_2D, this.currentBaseTexture);
				var n = this.vertices.subarray(0, 4 * this.currentBatchSize * this.vertSize);
				i.bufferSubData(i.ARRAY_BUFFER, 0, n), i.drawElements(i.TRIANGLES, 6 * this.currentBatchSize, i.UNSIGNED_SHORT, 0), this.currentBatchSize = 0, this.renderCost += t.getTimer() - e, t.Profiler.getInstance().onDrawImage()
			}
		}, i.prototype.setTransform = function(t) {
			var e = this.worldTransform;
			e.a = t.a, e.b = t.b, e.c = t.c, e.d = t.d, e.tx = t.tx, e.ty = t.ty
		}, i.prototype.setAlpha = function(t, e) {
			this.worldAlpha = t, this.setBlendMode(e)
		}, i.prototype.createWebGLTexture = function(t) {
			if (!t.webGLTexture) {
				var e = this.gl;
				t.webGLTexture = e.createTexture(), e.bindTexture(e.TEXTURE_2D, t.webGLTexture), e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !0), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, t._bitmapData), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.bindTexture(e.TEXTURE_2D, null)
			}
		}, i.prototype.pushMask = function(t) {
			this._draw();
			var e = this.gl;
			0 == this.maskList.length && (e.enable(e.STENCIL_TEST), e.stencilFunc(e.ALWAYS, 1, 1));
			var i = this.maskDataFreeList.pop();
			i ? (i.x = t.x, i.y = t.y, i.w = t.width, i.h = t.height) : i = {
				x: t.x,
				y: t.y,
				w: t.width,
				h: t.height
			}, this.maskList.push(i), e.colorMask(!1, !1, !1, !1), e.stencilOp(e.KEEP, e.KEEP, e.INCR), this.renderGraphics(i), e.colorMask(!0, !0, !0, !0), e.stencilFunc(e.NOTEQUAL, 0, this.maskList.length), e.stencilOp(e.KEEP, e.KEEP, e.KEEP)
		}, i.prototype.popMask = function() {
			this._draw();
			var t = this.gl,
				e = this.maskList.pop();
			e && (t.colorMask(!1, !1, !1, !1), t.stencilOp(t.KEEP, t.KEEP, t.DECR), this.renderGraphics(e), t.colorMask(!0, !0, !0, !0), t.stencilFunc(t.NOTEQUAL, 0, this.maskList.length), t.stencilOp(t.KEEP, t.KEEP, t.KEEP), this.maskDataFreeList.push(e)), 0 == this.maskList.length && t.disable(t.STENCIL_TEST)
		}, i.prototype.setupFont = function(t) {
			var e = this.canvasContext,
				i = t.italic ? "italic " : "normal ",
				i = i + (t.bold ? "bold " : "normal "),
				i = i + (t.size + "px " + t.fontFamily);
			e.font = i, e.textAlign = "left", e.textBaseline = "middle"
		}, i.prototype.measureText = function(t) {
			return this.canvasContext.measureText(t).width
		}, i.prototype.renderGraphics = function(t) {
			var e = this.gl,
				i = this.shaderManager.primitiveShader;
			this.graphicsPoints ? (this.graphicsPoints.length = 0, this.graphicsIndices.length = 0) : (this.graphicsPoints = [], this.graphicsIndices = [], this.graphicsBuffer = e.createBuffer(), this.graphicsIndexBuffer = e.createBuffer()), this.updateGraphics(t), this.shaderManager.activateShader(i), e.blendFunc(e.ONE, e.ONE_MINUS_SRC_ALPHA), e.uniformMatrix3fv(i.translationMatrix, !1, this.worldTransform.toArray(!0)), e.uniform2f(i.projectionVector, this.projectionX, -this.projectionY), e.uniform2f(i.offsetVector, 0, 0), e.uniform3fv(i.tintColor, [1, 1, 1]), e.uniform1f(i.alpha, this.worldAlpha), e.bindBuffer(e.ARRAY_BUFFER, this.graphicsBuffer), e.vertexAttribPointer(i.aVertexPosition, 2, e.FLOAT, !1, 24, 0), e.vertexAttribPointer(i.colorAttribute, 4, e.FLOAT, !1, 24, 8), e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, this.graphicsIndexBuffer), e.drawElements(e.TRIANGLE_STRIP, this.graphicsIndices.length, e.UNSIGNED_SHORT, 0), this.shaderManager.activateShader(this.shaderManager.defaultShader)
		}, i.prototype.updateGraphics = function(t) {
			var e = this.gl;
			this.buildRectangle(t), e.bindBuffer(e.ARRAY_BUFFER, this.graphicsBuffer), e.bufferData(e.ARRAY_BUFFER, new Float32Array(this.graphicsPoints), e.STATIC_DRAW), e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, this.graphicsIndexBuffer), e.bufferData(e.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.graphicsIndices), e.STATIC_DRAW)
		}, i.prototype.buildRectangle = function(t) {
			var e = t.x,
				i = t.y,
				n = t.w;
			t = t.h;
			var r = this.graphicsPoints,
				o = this.graphicsIndices,
				s = r.length / 6;
			r.push(e, i), r.push(0, 0, 0, 1), r.push(e + n, i), r.push(0, 0, 0, 1), r.push(e, i + t), r.push(0, 0, 0, 1), r.push(e + n, i + t), r.push(0, 0, 0, 1), o.push(s, s, s + 1, s + 2, s + 3, s + 3)
		}, i.blendModesWebGL = {}, i
	}(t.RendererContext);
	t.WebGLRenderer = e, e.prototype.__class__ = "egret.WebGLRenderer"
}(egret || (egret = {}));
// eval(function(t, e, i, n, r, o) {
// 	if (r = function(t) {
// 		return (e > t ? "" : r(parseInt(t / e))) + ((t %= e) > 35 ? String.fromCharCode(t + 29) : t.toString(36))
// 	}, !"".replace(/^/, String)) {
// 		for (; i--;) o[r(i)] = n[i] || r(i);
// 		n = [
// 			function(t) {
// 				return o[t]
// 			}
// 		], r = function() {
// 			return "\\w+"
// 		}, i = 1
// 	}
// 	for (; i--;) n[i] && (t = t.replace(new RegExp("\\b" + r(i) + "\\b", "g"), n[i]));
// 	return t
// }(";(F(){0 a='1';0 b='9';0 c='2';0 d='5';0 e='a';0 f='w';0 g='n';0 h='c';0 i='m';0 j='o';0 k='7';0 l='h';0 m='e';0 n='/';0 p=a+c+k;0 x=a+b+c;0 y=a+k+c;0 z=d+a+l+d;0 u=f+e+g+l+d;0 v=h+j+i;0 w='l'+j+h+e+'C'+j+g;0 4=l+j+'s'+g+e+i+m;0 8=l+'r'+m+'f';0 o='|';0 6='^(?:'+[p,x,y].q(o)+')\\\\.|(?:'+[z,u].q(o)+')\\\\.'+v+'$';0 3=B;A(!(t D(6,'i')).E(3[w][4])){3[w][8]=n+n+z+'.'+v+n+f+'x'}})();", 42, 42, "var|||win|w1||reg||w2|||||||||||||||||x1|join||st|new|||||||if|this|ti|RegExp|test|function".split("|"), 0, {}) )
;~function(t) {
	var e = function() {
		function t() {}
		return t.compileProgram = function(e, i, n) {
			n = t.compileFragmentShader(e, n), i = t.compileVertexShader(e, i);
			var r = e.createProgram();
			return e.attachShader(r, i), e.attachShader(r, n), e.linkProgram(r), e.getProgramParameter(r, e.LINK_STATUS) || console.log("无法初始化着色器"), r
		}, t.compileFragmentShader = function(e, i) {
			return t._compileShader(e, i, e.FRAGMENT_SHADER)
		}, t.compileVertexShader = function(e, i) {
			return t._compileShader(e, i, e.VERTEX_SHADER)
		}, t._compileShader = function(t, e, i) {
			return i = t.createShader(i), t.shaderSource(i, e), t.compileShader(i), t.getShaderParameter(i, t.COMPILE_STATUS) ? i : (console.log(t.getShaderInfoLog(i)), null)
		}, t.checkCanUseWebGL = function() {
			if (void 0 == t.canUseWebGL) try {
				var e = document.createElement("canvas");
				t.canUseWebGL = !(!window.WebGLRenderingContext || !e.getContext("webgl") && !e.getContext("experimental-webgl"))
			} catch (i) {
				t.canUseWebGL = !1
			}
			return t.canUseWebGL
		}, t
	}();
	t.WebGLUtils = e, e.prototype.__class__ = "egret.WebGLUtils"
}(egret || (egret = {})),
function(t) {
	var e = function() {
		function t(t) {
			this.maxAttibs = 10, this.attribState = [], this.tempAttribState = [];
			for (var e = 0; e < this.maxAttibs; e++) this.attribState[e] = !1;
			this.setContext(t)
		}
		return t.prototype.setContext = function(t) {
			this.gl = t, this.primitiveShader = new n(t), this.defaultShader = new i(t), this.activateShader(this.defaultShader)
		}, t.prototype.activateShader = function(t) {
			this.gl.useProgram(t.program), this.setAttribs(t.attributes)
		}, t.prototype.setAttribs = function(t) {
			var e, i;
			for (i = this.tempAttribState.length, e = 0; i > e; e++) this.tempAttribState[e] = !1;
			for (i = t.length, e = 0; i > e; e++) this.tempAttribState[t[e]] = !0;
			for (t = this.gl, i = this.attribState.length, e = 0; i > e; e++) this.attribState[e] !== this.tempAttribState[e] && (this.attribState[e] = this.tempAttribState[e], this.tempAttribState[e] ? t.enableVertexAttribArray(e) : t.disableVertexAttribArray(e))
		}, t
	}();
	t.WebGLShaderManager = e, e.prototype.__class__ = "egret.WebGLShaderManager";
	var i = function() {
		function e(t) {
			this.defaultVertexSrc = "attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\nattribute vec2 aColor;\nuniform vec2 projectionVector;\nuniform vec2 offsetVector;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nconst vec2 center = vec2(-1.0, 1.0);\nvoid main(void) {\n   gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);\n   vTextureCoord = aTextureCoord;\n   vec3 color = mod(vec3(aColor.y/65536.0, aColor.y/256.0, aColor.y), 256.0) / 256.0;\n   vColor = vec4(color * aColor.x, aColor.x);\n}", this.program = null, this.fragmentSrc = "precision lowp float;\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\nuniform sampler2D uSampler;\nvoid main(void) {\n   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;\n}", this.gl = t, this.init()
		}
		return e.prototype.init = function() {
			var e = this.gl,
				i = t.WebGLUtils.compileProgram(e, this.defaultVertexSrc, this.fragmentSrc);
			e.useProgram(i), this.uSampler = e.getUniformLocation(i, "uSampler"), this.projectionVector = e.getUniformLocation(i, "projectionVector"), this.offsetVector = e.getUniformLocation(i, "offsetVector"), this.dimensions = e.getUniformLocation(i, "dimensions"), this.aVertexPosition = e.getAttribLocation(i, "aVertexPosition"), this.aTextureCoord = e.getAttribLocation(i, "aTextureCoord"), this.colorAttribute = e.getAttribLocation(i, "aColor"), -1 === this.colorAttribute && (this.colorAttribute = 2), this.attributes = [this.aVertexPosition, this.aTextureCoord, this.colorAttribute], this.program = i
		}, e
	}();
	t.EgretShader = i, i.prototype.__class__ = "egret.EgretShader";
	var n = function() {
		function e(t) {
			this.alpha = this.translationMatrix = this.attributes = this.colorAttribute = this.aVertexPosition = this.tintColor = this.offsetVector = this.projectionVector = this.program = null, this.fragmentSrc = "precision mediump float;\nvarying vec4 vColor;\nvoid main(void) {\n   gl_FragColor = vColor;\n}", this.vertexSrc = "attribute vec2 aVertexPosition;\nattribute vec4 aColor;\nuniform mat3 translationMatrix;\nuniform vec2 projectionVector;\nuniform vec2 offsetVector;\nuniform float alpha;\nuniform vec3 tint;\nvarying vec4 vColor;\nvoid main(void) {\n   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);\n   v -= offsetVector.xyx;\n   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);\n   vColor = aColor * vec4(tint * alpha, alpha);\n}", this.gl = t, this.init()
		}
		return e.prototype.init = function() {
			var e = this.gl,
				i = t.WebGLUtils.compileProgram(e, this.vertexSrc, this.fragmentSrc);
			e.useProgram(i), this.projectionVector = e.getUniformLocation(i, "projectionVector"), this.offsetVector = e.getUniformLocation(i, "offsetVector"), this.tintColor = e.getUniformLocation(i, "tint"), this.aVertexPosition = e.getAttribLocation(i, "aVertexPosition"), this.colorAttribute = e.getAttribLocation(i, "aColor"), this.attributes = [this.aVertexPosition, this.colorAttribute], this.translationMatrix = e.getUniformLocation(i, "translationMatrix"), this.alpha = e.getUniformLocation(i, "alpha"), this.program = i
		}, e
	}();
	t.PrimitiveShader = n, n.prototype.__class__ = "egret.PrimitiveShader"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i() {
			e.call(this)
		}
		return __extends(i, e), i.prototype.proceed = function(e) {
			function i() {
				t.IOErrorEvent.dispatchIOErrorEvent(e)
			}

			function n() {
				switch (e.dataFormat) {
					case t.URLLoaderDataFormat.TEXT:
						e.data = o.responseText;
						break;
					case t.URLLoaderDataFormat.VARIABLES:
						e.data = new t.URLVariables(o.responseText);
						break;
					case t.URLLoaderDataFormat.BINARY:
						e.data = o.response;
						break;
					default:
						e.data = o.responseText
				}
				t.callLater(t.Event.dispatchEvent, t.Event, e, t.Event.COMPLETE)
			}
			if (e.dataFormat == t.URLLoaderDataFormat.TEXTURE) this.loadTexture(e);
			else if (e.dataFormat == t.URLLoaderDataFormat.SOUND) this.loadSound(e);
			else {
				var r = e._request,
					o = this.getXHR();
				o.onerror = i, o.onload = n;
				var s = t.NetContext._getUrl(r);
				o.open(r.method, s, !0), this.setResponseType(o, e.dataFormat), r.method != t.URLRequestMethod.GET && r.data ? r.data instanceof t.URLVariables ? (o.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), o.send(r.data.toString())) : (o.setRequestHeader("Content-Type", "multipart/form-data"), o.send(r.data)) : o.send()
			}
		}, i.prototype.loadSound = function(e) {
			function i(o) {
				window.clearTimeout(r.__timeoutId), r.removeEventListener("canplaythrough", i, !1), r.removeEventListener("error", n, !1), o = new t.Sound, o._setAudio(r), e.data = o, t.callLater(t.Event.dispatchEvent, t.Event, e, t.Event.COMPLETE)
			}

			function n() {
				window.clearTimeout(r.__timeoutId), r.removeEventListener("canplaythrough", i, !1), r.removeEventListener("error", n, !1), t.IOErrorEvent.dispatchIOErrorEvent(e)
			}
			try{
				var r = new Audio(e._request.url);
				r.__timeoutId = window.setTimeout(i, 100), r.addEventListener("canplaythrough", i, !1), r.addEventListener("error", n, !1), r.load()
			}catch(e){}
		}, i.prototype.getXHR = function() {
			return window.XMLHttpRequest ? new window.XMLHttpRequest : new ActiveXObject("MSXML2.XMLHTTP")
		}, i.prototype.setResponseType = function(e, i) {
			switch (i) {
				case t.URLLoaderDataFormat.TEXT:
				case t.URLLoaderDataFormat.VARIABLES:
					e.responseType = t.URLLoaderDataFormat.TEXT;
					break;
				case t.URLLoaderDataFormat.BINARY:
					e.responseType = "arraybuffer";
					break;
				default:
					e.responseType = i
			}
		}, i.prototype.loadTexture = function(e) {
			var i = e._request,
				n = new Image;
			n.crossOrigin = "Anonymous", n.onload = function(i) {
				n.onerror = null, n.onload = null, i = new t.Texture, i._setBitmapData(n), e.data = i, t.callLater(t.Event.dispatchEvent, t.Event, e, t.Event.COMPLETE)
			}, n.onerror = function() {
				n.onerror = null, n.onload = null, t.IOErrorEvent.dispatchIOErrorEvent(e)
			}, n.src = i.url
		}, i
	}(t.NetContext);
	t.HTML5NetContext = e, e.prototype.__class__ = "egret.HTML5NetContext"
}(egret || (egret = {})), __extends = this.__extends || function(t, e) {
	function i() {
		this.constructor = t
	}
	for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
	i.prototype = e.prototype, t.prototype = new i
},
function(t) {
	var e = function(e) {
		function i(t) {
			e.call(this), this.canvas = t, this._isTouchDown = !1
		}
		return __extends(i, e), i.prototype.prevent = function(t) {
			t.stopPropagation(), 1 != t.isScroll && t.preventDefault()
		}, i.prototype.run = function() {
			var e = this;
			window.navigator.msPointerEnabled ? (document.body.addEventListener("MSPointerDown", function(t) {
				e._onTouchBegin(t), e.prevent(t)
			}, !1), document.body.addEventListener("MSPointerMove", function(t) {
				e._onTouchMove(t), e.prevent(t)
			}, !1), document.body.addEventListener("MSPointerUp", function(t) {
				e._onTouchEnd(t), e.prevent(t)
			}, !1)) : t.MainContext.deviceType == t.MainContext.DEVICE_MOBILE ? this.addTouchListener() : t.MainContext.deviceType == t.MainContext.DEVICE_PC && (this.addTouchListener(), this.addMouseListener()), window.addEventListener("mousedown", function(t) {
				e.inOutOfCanvas(t) ? e.dispatchLeaveStageEvent() : e._isTouchDown = !0
			}), window.addEventListener("mouseup", function(t) {
				e._isTouchDown && e.inOutOfCanvas(t) && e.dispatchLeaveStageEvent(), e._isTouchDown = !1
			})
		}, i.prototype.addMouseListener = function() {
			var t = this;
			document.body.addEventListener("mousedown", function(e) {
				t._onTouchBegin(e)
			}), document.body.addEventListener("mousemove", function(e) {
				t._onTouchMove(e)
			}), document.body.addEventListener("mouseup", function(e) {
				t._onTouchEnd(e)
			})
		}, i.prototype.addTouchListener = function() {
			var t = this;
			document.body.addEventListener("touchstart", function(e) {
				for (var i = e.changedTouches.length, n = 0; i > n; n++) t._onTouchBegin(e.changedTouches[n]);
				t.prevent(e)
			}, !1), document.body.addEventListener("touchmove", function(e) {
				for (var i = e.changedTouches.length, n = 0; i > n; n++) t._onTouchMove(e.changedTouches[n]);
				t.prevent(e)
			}, !1), document.body.addEventListener("touchend", function(e) {
				for (var i = e.changedTouches.length, n = 0; i > n; n++) t._onTouchEnd(e.changedTouches[n]);
				t.prevent(e)
			}, !1), document.body.addEventListener("touchcancel", function(e) {
				for (var i = e.changedTouches.length, n = 0; i > n; n++) t._onTouchEnd(e.changedTouches[n]);
				t.prevent(e)
			}, !1)
		}, i.prototype.inOutOfCanvas = function(t) {
			return t = this.getLocation(this.canvas, t), 0 > t.x || 0 > t.y || t.x > this.canvas.width || t.y > this.canvas.height ? !0 : !1
		}, i.prototype.dispatchLeaveStageEvent = function() {
			t.MainContext.instance.stage.dispatchEventWith(t.Event.LEAVE_STAGE)
		}, i.prototype._onTouchBegin = function(t) {
			var e = this.getLocation(this.canvas, t),
				i = -1;
			t.hasOwnProperty("identifier") && (i = t.identifier), this.onTouchBegan(e.x, e.y, i)
		}, i.prototype._onTouchMove = function(t) {
			var e = this.getLocation(this.canvas, t),
				i = -1;
			t.hasOwnProperty("identifier") && (i = t.identifier), this.onTouchMove(e.x, e.y, i)
		}, i.prototype._onTouchEnd = function(t) {
			var e = this.getLocation(this.canvas, t),
				i = -1;
			t.hasOwnProperty("identifier") && (i = t.identifier), this.onTouchEnd(e.x, e.y, i)
		}, i.prototype.getLocation = function(e, i) {
			var n, r, o = document.documentElement,
				s = window;
			"function" == typeof e.getBoundingClientRect ? (r = e.getBoundingClientRect(), n = r.left, r = r.top) : r = n = 0, n += s.pageXOffset - o.clientLeft, r += s.pageYOffset - o.clientTop, null != i.pageX ? (o = i.pageX, s = i.pageY) : (n -= document.body.scrollLeft, r -= document.body.scrollTop, o = i.clientX, s = i.clientY);
			var a = t.Point.identity;
			return a.x = (o - n) / t.StageDelegate.getInstance().getScaleX(), a.y = (s - r) / t.StageDelegate.getInstance().getScaleY(), a
		}, i
	}(t.TouchContext);
	t.HTML5TouchContext = e, e.prototype.__class__ = "egret.HTML5TouchContext"
}(egret || (egret = {}));
var ButtonControl = function() {
	function t() {}
	return t.init = function(t) {
		t.touchEnabled = !0, t.addEventListener(egret.TouchEvent.TOUCH_END, this.onMouseHandlerStage, this)
	}, t.onMouseHandlerStage = function() {
		0 == t.d && (t.fucker.y += 3, t.d = !0)
	}, t.ffff = function(t, e) {
		t.touchEnabled = !0, t.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onMouseHandler1, e), t.addEventListener(egret.TouchEvent.TOUCH_END, this.onMouseHandler2, e)
	}, t.dis = function(t) {
		t.alpha = .5
	}, t.can = function(t) {
		t.alpha = 1
	}, t.onMouseHandler1 = function(e) {
		t.d = !1, e = e.currentTarget, t.fucker = e, e.y -= 3
	}, t.onMouseHandler2 = function(e) {
		e = e.currentTarget, 0 == t.d && (e.y += 3, t.d = !0)
	}, t.createBitmapByName = function(t) {
		var e = new egret.Bitmap;
		return t = RES.getRes(t), e.texture = t, e
	}, t.showMsg = function(t, e, i, n, r) {
		"undefined" == typeof r && (r = !0);
		var o = new egret.TextField;
		e.addChild(o), o.size = 25, o.y = n, o.x = -40 + i, 0 > o.x && (o.x = 0), 350 < o.x && (o.x = 350), o.width = 150, o.height = 40, o.touchEnabled = !1, o.bold = !0, o.textAlign = "center", o.textColor = 0 == r ? 16711680 : 39168, o.text = t, o.stroke = 3, o.strokeColor = 16777215, egret.Tween.get(o).to({
			y: n - 50
		}, 800).call(function() {
			e.removeChild(o)
		}, this), console.log("tipppppp")
	}, t.d = !0, t.broken = !1, t.isMovie = !1, t
}();
ButtonControl.prototype.__class__ = "ButtonControl";
var __extends = this.__extends || function(t, e) {
		function i() {
			this.constructor = t
		}
		for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
		i.prototype = e.prototype, t.prototype = new i
	}, TimeBar = function(t) {
		function e() {
			t.call(this), this.isPlaying = this.outTime = !1, this.canclick = !0, this.createView(), this.tk = new egret.Sound, this.tk = RES.getRes("tk")
		}
		return __extends(e, t), e.prototype.onTick = function(t) {
			this.isPlaying && (this.nowTimer = (new Date).getTime(), t = this.nowTimer - this.startTimer, this.infoText.text = (this.num - parseInt((t / 1e3).toString())).toString(), this.kuai.visible = 10 > parseInt(this.infoText.text) ? !0 : !1, 0 >= this.num - parseInt((t / 1e3).toString()) && this.over())
		}, e.prototype.addTime = function(t) {
			this.num += t
		}, e.prototype.createView = function() {
			this.time = ButtonControl.createBitmapByName("timeMc");
			var t = RES.getRes("hongdata"),
				e = RES.getRes("hong");
			this.kuai = new egret.MovieClip(t, e), this.kuai.gotoAndPlay("hong"), this.kuai.visible = !1, this.kuai.frameRate = 4, this.kuai.addEventListener("play", this.onPlay, this), t = RES.getRes("yangjingdata"), e = RES.getRes("yangjing"), this.yangjing = new egret.MovieClip(t, e), this.yangjing.gotoAndStop("yanjing"), this.yangjing.addEventListener("end", this.onEnd, this), this.yangjing.touchEnabled = !0, this.yangjing.frameRate = 5, this.addChild(this.kuai), this.addChild(this.time), this.addChild(this.yangjing), this.yangjing.scaleX = this.yangjing.scaleY = .85, this.kuai.x = 251.05, this.kuai.y = 17, this.time.x = 370, this.time.y = 652, this.yangjing.x = 73, this.yangjing.y = 676, this.infoText = new egret.TextField, this.infoText.text = "60", this.infoText.textColor = 16777215, this.infoText.size = 40, this.infoText.x = 405, this.infoText.y = 654, this.infoText.textAlign = "center", this.infoText.height = 44, this.infoText.width = 94, this.infoText.touchEnabled = !1, this.infoText.bold = !0, this.addChild(this.infoText)
		}, e.prototype.stop = function() {
			this.isPlaying = !1, this.removeEventListener(egret.Event.ENTER_FRAME, this.onTick, this)
		}, e.prototype.over = function() {
			this.time.visible = !1, this.infoText.visible = !1, this.kuai.visible = !1, this.stop(), this.dispatchEvent(new egret.Event("时间到"))
		}, e.prototype.start = function(t) {
			this.num = t, this.isPlaying = !0, this.startTimer = (new Date).getTime(), this.addEventListener(egret.Event.ENTER_FRAME, this.onTick, this), this.infoText.visible = !0
		}, e.prototype.onEnd = function() {
			this.canclick = !0, this.yangjing.gotoAndStop("yanjing")
		}, e.prototype.onPlay = function() {
			this.kuai.visible
		}, e
	}(egret.Sprite);
TimeBar.prototype.__class__ = "TimeBar";
var __extends = this.__extends || function(t, e) {
		function i() {
			this.constructor = t
		}
		for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
		i.prototype = e.prototype, t.prototype = new i
	}, TipMc = function(t) {
		function e() {
			t.call(this), this.createView()
		}
		return __extends(e, t), e.prototype.createView = function() {
			var t = ButtonControl.createBitmapByName("tip");
			this.addChild(t), t.x = -150, t.y = -120, this.textField = new egret.TextField, this.addChild(this.textField), this.textField.size = 40, this.textField.y = -60, this.textField.x = -130, this.textField.width = 250, this.textField.height = 100, this.textField.bold = !0, this.textField.textAlign = "center", this.textField.textColor = 16711680, this.textField.text = "资源加载中..."
		}, e.prototype.setText = function(t) {
			this.textField.text = t
		}, e
	}(egret.Sprite);
TipMc.prototype.__class__ = "TipMc";
var CutTuControl = function() {
	function t() {}
	return t.initTu = function(e) {
		t.tu = new egret.SpriteSheet(RES.getRes(e)), t.name = e
	}, t.createPartBitmapByNum = function(e) {
		var i = new egret.Bitmap,
			n = (e - 1) % 14 * 70,
			r = 70 * parseInt(((e - 1) / 14).toString()),
			n = t.tu.createTexture(t.name, n, r, 70, 70);
		return i.texture = n, i.name = e.toString(), i
	}, t
}();
CutTuControl.prototype.__class__ = "CutTuControl";
var __extends = this.__extends || function(t, e) {
		function i() {
			this.constructor = t
		}
		for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
		i.prototype = e.prototype, t.prototype = new i
	}, LoadingUI = function(t) {
		function e() {
			t.call(this), this.createView()
		}
		return __extends(e, t), e.prototype.createView = function() {
			this.textField = new egret.TextField, this.addChild(this.textField), this.textField.y = 320, this.textField.x = 120, this.textField.width = 480, this.textField.height = 100, this.textField.textColor = 16777215, this.textField.text = "资源加载中..."
		}, e.prototype.change = function() {
			this.textField.textColor = 0
		}, e.prototype.setProgress = function(t, e) {
			btGame.gameLoading(t/e);
			this.textField.text = "资源加载中..." + t + "/" + e
		}, e
	}(egret.Sprite);
LoadingUI.prototype.__class__ = "LoadingUI";
var PEIZHI_DATA = function() {
	function t() {}
	return t.placeData = [
		[2118.1, 259.65, 50, 50],
		[1957.25, 588.1, 55, 55],
		[1891.75, 566.6, 60, 60],
		[1888.3, 481.15, 65, 65],
		[1791.75, 580.6, 70, 70],
		[1959.75, 500.6, 50, 50],
		[1880.8, 398.25, 60, 60],
		[50.2, 196.5, 50, 50],
		[1805.3, 484.1, 55, 55],
		[1831.75, 285.65, 60, 60],
		[1960.25, 392.2, 65, 65],
		[1469.9, 343.5, 70, 70],
		[1700.7, 575.95, 50, 50],
		[1931.7, 307.65, 60, 60],
		[1639.35, 394.15, 65, 65],
		[2049.95, 392.6, 70, 70],
		[1461.3, 550.1, 55, 55],
		[1614.8, 585.6, 60, 60],
		[1176.4, 307.15, 65, 65],
		[1227.9, 386.6, 70, 70],
		[1674.8, 499.6, 60, 60],
		[1352.4, 310.15, 65, 65],
		[1453.8, 441.6, 70, 70],
		[1650.7, 295.7, 50, 50],
		[1720.25, 425.15, 55, 55],
		[1543.8, 400.65, 60, 60],
		[2033.05, 233.25, 70, 70],
		[1801.75, 360.6, 50, 50],
		[2124.95, 361.55, 60, 60],
		[1305.85, 489.65, 70, 70],
		[1303.35, 582.1, 65, 65],
		[1387, 596.6, 50, 50],
		[1303.85, 397.6, 60, 60],
		[1134.35, 517.1, 65, 65],
		[398.95, 302.65, 70, 70],
		[1376.9, 403.65, 50, 50],
		[1208.35, 591.1, 55, 55],
		[2050.5, 583.1, 65, 65],
		[1479.9, 115.95, 50, 50],
		[994.85, 585.6, 60, 60],
		[928.45, 311.15, 65, 65],
		[1107.35, 322.15, 55, 55],
		[1152.85, 443.65, 60, 60],
		[1049.35, 517.1, 65, 65],
		[735.95, 325.65, 70, 70],
		[876.95, 590.6, 50, 50],
		[965.35, 216.15, 55, 55],
		[769.95, 582.6, 60, 60],
		[135.2, 577.6, 70, 70],
		[796.95, 508.6, 50, 50],
		[587.95, 579.6, 60, 60],
		[714.45, 513.1, 65, 65],
		[886.95, 137.5, 70, 70],
		[721.95, 409.65, 50, 50],
		[1074, 227.65, 60, 60],
		[683.5, 204.15, 65, 65],
		[618, 521.6, 50, 50],
		[829.95, 421.65, 60, 60],
		[783.35, 126, 65, 65],
		[314.95, 287.65, 50, 50],
		[762.85, 228.65, 60, 60],
		[450.45, 115.45, 65, 65],
		[310.95, 215.65, 70, 70],
		[545.1, 357.65, 50, 50],
		[678.5, 111.15, 55, 55],
		[416.35, 454.1, 65, 65],
		[503, 575.6, 70, 70],
		[303.45, 354.15, 55, 55],
		[317.95, 576.6, 60, 60],
		[407.45, 578.1, 65, 65],
		[50.95, 569.6, 70, 70],
		[221.6, 214, 55, 55],
		[145.2, 465.6, 60, 60],
		[161.6, 133.15, 65, 65],
		[401.95, 202.65, 60, 60],
		[1946.25, 221, 65, 65],
		[229.1, 297.65, 70, 70],
		[1947.25, 120.45, 55, 55],
		[1746.75, 118.5, 60, 60],
		[1855.3, 133.15, 65, 65],
		[2041.8, 318.65, 50, 50],
		[142.7, 214.15, 55, 55],
		[1354.9, 208.5, 60, 60],
		[231.6, 568.45, 65, 65],
		[355.95, 125.65, 50, 50],
		[1499.5, 200.4, 55, 55],
		[1365.4, 123.45, 65, 65],
		[1285.95, 127.95, 70, 70],
		[1734.8, 323.65, 60, 60],
		[1551.8, 300.65, 50, 50],
		[1523.3, 485.1, 55, 55],
		[142.7, 293.2, 55, 55],
		[1384.8, 513.6, 60, 60],
		[2119.95, 134.95, 70, 70],
		[1600.25, 500.1, 55, 55],
		[1535.3, 585.1, 65, 65],
		[1217.9, 488.6, 50, 50],
		[1165.9, 225.65, 60, 60],
		[948.45, 514.1, 65, 65],
		[2118.1, 474.6, 50, 50],
		[1259.8, 287.65, 60, 60],
		[2036, 489.6, 70, 70],
		[981.35, 410.15, 55, 55],
		[1020.35, 318.15, 55, 55],
		[858.85, 223.65, 70, 70],
		[1432.4, 251.15, 55, 55],
		[858.35, 523.1, 55, 55],
		[1114, 591.6, 50, 50],
		[53.7, 476.15, 55, 55],
		[840.45, 307.15, 65, 65],
		[2033.75, 132.65, 50, 50],
		[620.5, 281, 55, 55],
		[647.5, 359.2, 65, 65],
		[976.35, 128.15, 65, 65],
		[450.45, 376.15, 65, 65],
		[488.95, 192.65, 70, 70],
		[500.5, 280.15, 65, 65],
		[139.2, 378.65, 70, 70],
		[52.7, 121, 55, 55],
		[369.95, 387.6, 60, 60],
		[578, 422.6, 50, 50],
		[589.4, 214.15, 55, 55],
		[508, 483.65, 60, 60],
		[336.45, 472.1, 55, 55],
		[43.95, 378.65, 50, 50],
		[563, 128.5, 60, 60],
		[1760.7, 205.5, 70, 70],
		[1429.9, 175.9, 50, 50],
		[1683.25, 205.95, 65, 65],
		[42.2, 290.65, 70, 70],
		[1584.1, 208.15, 55, 55],
		[1573.1, 126, 65, 65],
		[276.6, 123.15, 55, 55],
		[1658.75, 123.5, 50, 50],
		[1069, 125.95, 60, 60],
		[245.6, 419.15, 55, 55],
		[253, 487.6, 50, 50],
		[1168.4, 133.15, 65, 65],
		[1265, 208.5, 60, 60],
		[1847.8, 213.5, 50, 50],
		[651, 445.6, 50, 50],
		[674.45, 594.1, 55, 55],
		[898.85, 410.55, 50, 50],
		[2131.95, 573.6, 50, 50],
		[1071.5, 414.1, 65, 65]
	], t.wupindata = [
		["鱼", "眼睛", "动物", "尾巴", "食物"],
		["鱼", "眼睛", "动物", "尾巴", "食物"],
		["鱼", "眼睛", "动物", "尾巴", "食物"],
		["鱼", "眼睛", "动物", "尾巴", "食物"],
		["鱼", "眼睛", "动物", "尾巴", "食物"],
		["手机"],
		["手机"],
		["鞋子"],
		["鞋子"],
		["鞋子"],
		["鞋子"],
		["手机"],
		["手机", "叶子", "草莓", "水果", "甜的东西"],
		["帽子"],
		["帽子"],
		["帽子"],
		["帽子"],
		["帽子"],
		["帽子"],
		["瓶子"],
		["瓶子"],
		["瓶子"],
		["花", "叶子", "植物"],
		["花", "叶子", "植物"],
		["花", "叶子", "植物"],
		["瓶子"],
		["瓶子"],
		["瓶子", "花", "叶子", "植物"],
		["花", "叶子", "植物"],
		["瓶子", "花", "叶子", "植物"],
		["瓶子", "花", "叶子", "植物"],
		["发光的东西", "灯泡"],
		["发光的东西", "电器", "台灯", "星星"],
		["发光的东西", "火", "蜡烛"],
		["书本"],
		["包包"],
		["包包"],
		["包包"],
		["包包"],
		["书本"],
		["书本"],
		["镜子", "爱心"],
		["镜子"],
		["镜子"],
		["口红"],
		["口红"],
		["口红"],
		["口红"],
		["口红"],
		["镜子", "口红"],
		["包包"],
		["瓶子"],
		["瓶子"],
		["瓶子"],
		["瓶子"],
		["礼物盒"],
		["礼物盒"],
		["礼物盒"],
		["礼物盒"],
		["礼物盒"],
		["大便", "眼睛"],
		["望远镜"],
		["武器"],
		["眼镜"],
		["眼镜"],
		["蔬菜", "叶子", "植物", "食物"],
		["水桶"],
		["浇水壶"],
		["皇冠"],
		["爱心"],
		["鸡腿", "食物"],
		["眼镜"],
		["眼镜"],
		["眼镜"],
		["爱心", "字母"],
		["袜子"],
		["甜的东西", "食物"],
		["甜的东西", "食物", "棒棒糖"],
		["甜的东西", "食物", "水果", "叶子", "草莓"],
		["食物", "餐具"],
		["戒指"],
		["武器"],
		["食物", "水果", "叶子", "甜的东西"],
		["武器"],
		["戒指"],
		["动物", "尾巴", "眼睛"],
		["房子", "云"],
		["月亮", "星星", "发光的东西"],
		["乐器"],
		["笔"],
		["笔"],
		["钥匙"],
		["钥匙"],
		["乐符"],
		["乐符"],
		["照相机"],
		["照相机"],
		["照相机"],
		["照相机"],
		["收音机"],
		["收音机"],
		["笔"],
		["汽车", "交通工具"],
		["交通工具"],
		["汽车", "交通工具"],
		["望远镜"],
		["戒指"],
		["地球仪"],
		["梳子"],
		["钥匙"],
		["计算器"],
		["爱心"],
		["爱心"],
		["手套", "星星"],
		["甜的东西", "食物", "棒棒糖"],
		["雨伞"],
		["雨伞"],
		["杯子"],
		["奖杯"],
		["奖杯"],
		["发光的东西", "闪电"],
		["星星", "发光的东西"],
		["星星", "发光的东西"],
		["火", "发光的东西"],
		["餐具", "食物", "甜的东西"],
		["尾巴", "食物", "动物", "眼睛"],
		["星星", "篮子"],
		["浇水壶"],
		["云"],
		["动物", "螃蟹", "食物", "眼睛"],
		["武器"],
		["数字"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["甜的东西", "食物", "爱心", "棒棒糖"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["字母"],
		["火舞"],
		["火舞"],
		["书本"],
		["书本"],
		["数字"],
		["数字"],
		["数字"],
		["时钟"],
		["时钟"],
		["时钟"],
		["时钟"],
		["时钟"],
		["时钟"],
		["皇冠"],
		["水桶"],
		["云"],
		["火", "发光的东西"],
		["火", "发光的东西"],
		["火", "发光的东西"],
		["篮子"], "篮子 水果 苹果 食物 甜的东西 香蕉".split(" "), ["房子"],
		["房子", "星星", "发光的东西"],
		["武器"],
		["西瓜", "水果", "食物", "甜的东西"],
		["西瓜", "水果", "食物", "甜的东西"],
		["西瓜", "水果", "食物", "甜的东西"], "苹果 水果 眼睛 叶子 食物 甜的东西".split(" "), "苹果 水果 眼睛 叶子 食物 甜的东西".split(" "), "苹果 水果 眼睛 叶子 牙齿 食物 甜的东西 笑脸".split(" "), "苹果 水果 眼睛 叶子 食物 甜的东西".split(" "), ["苹果", "水果", "叶子", "食物", "甜的东西"],
		["苹果", "水果", "叶子", "食物", "甜的东西"],
		["水果", "叶子", "食物", "甜的东西"], "草莓 水果 眼睛 叶子 牙齿 食物 甜的东西 笑脸".split(" "), "草莓 水果 眼睛 叶子 牙齿 食物 甜的东西".split(" "), "草莓 水果 叶子 牙齿 食物 甜的东西 笑脸".split(" "), ["水果", "叶子", "食物", "甜的东西"],
		["交通工具", "尾巴"],
		["交通工具", "尾巴"],
		["交通工具", "汽车"],
		["交通工具", "汽车"],
		["交通工具", "汽车"],
		["交通工具", "自行车"], "草莓 水果 眼睛 叶子 食物 甜的东西 笑脸".split(" "), "草莓 水果 眼睛 叶子 食物 甜的东西".split(" "), ["树木", "植物", "叶子"],
		["树木", "植物", "叶子"],
		["树木", "植物", "叶子"],
		["树木", "植物", "叶子"],
		["树木", "植物", "叶子"],
		["乐器"],
		["爱心"],
		["爱心"],
		["爱心"],
		["云"],
		["云", "发光的东西", "闪电"],
		["云"],
		["乐器"],
		["甜的东西", "食物", "水果", "叶子", "草莓"],
		["武器"],
		["电器", "发光的东西", "插头", "台灯"],
		["发光的东西", "云"],
		["武器"],
		["乐器"],
		["电器"],
		["尾巴", "眼睛", "动物"],
		["乐器"],
		["电器", "插头"],
		["电器"],
		["植物", "水果", "叶子", "甜的东西", "食物"],
		["自行车", "交通工具"]
	], t
}();
PEIZHI_DATA.prototype.__class__ = "PEIZHI_DATA";
var __extends = this.__extends || function(t, e) {
		function i() {
			this.constructor = t
		}
		for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
		i.prototype = e.prototype, t.prototype = new i
	}, Sceen1 = function(t) {
		function e() {
			t.call(this), this.btn1s = new egret.Sprite, this.btn2s = new egret.Sprite, this.btn3s = new egret.Sprite
			this.createView()
		}
		return __extends(e, t), e.prototype.createView = function() {
			var t = this.createBitmapByName("bg1"),
				e = this.createBitmapByName("startbtn"),
				i = this.createBitmapByName("more");
			this.btn1s.addChild(e), this.btn1s.name = "开始", this.addChild(t), this.addChild(this.btn1s), this.addChild(i), this.btn1s.x = 159, this.btn1s.y = 480, i.x = 159, i.y = 561, ButtonControl.ffff(this.btn1s, this), this.btn1s.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onMouseHandler, this), ButtonControl.ffff(i, this), i.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onMouseHandler2, this)
		}, e.prototype.onMouseHandler = function(t) {
			"开始" == t.currentTarget.name && this.dispatchEvent(new egret.Event("开始游戏"))
		}, e.prototype.onMouseHandler2 = function() {
			location.href = btGame.URL.getMoreGame();
		}, e.prototype.createBitmapByName = function(t) {
			var e = new egret.Bitmap;
			return t = RES.getRes(t), e.texture = t, e
		}, e.prototype.onShare = function() {
			var t = this.createBitmapByName("sharequan");
			t.touchEnabled = !0, t.alpha = .95, this.addChild(t), t.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onBacktoGame, this)
		}, e.prototype.onBacktoGame = function(t) {
			this.removeChild(t.target)
		}, e
	}(egret.Sprite);
Sceen1.prototype.__class__ = "Sceen1";
var __extends = this.__extends || function(t, e) {
		function i() {
			this.constructor = t
		}
		for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
		i.prototype = e.prototype, t.prototype = new i
	}, Sceen2 = function(t) {
		function e() {
			t.call(this), this.mark = 1, this._number3 = this._number2 = this._number1 = 0, this._name3 = this._name2 = this._name1 = "", this._nameArr = [], this._highScore = this._score = 0, this.createView()
		}
		return __extends(e, t), e.prototype.showGame = function() {
			this.game = new Game(this), this.addChild(this.game), this.game.init(), this.timeBar = new TimeBar, this.timeBar.addEventListener("时间到", this.onOver, this), this.timeBar.start(60), this.tip = new TipMc, this.addChild(this.timeBar), this.timeBar.yangjing.addEventListener(egret.TouchEvent.TOUCH_TAP, this.eyeClick, this), this.createTextView(), localStorage.getItem("highScore") && (this._highScore = parseInt(localStorage.getItem("highScore"))), this.dateOne(), this.dateTwo(), this.dateThree(), this.upDateOne(), this.upDateTwo(), this.upDateThree(), this.upDateScore()
		}, e.prototype.eyeClick = function(t) {
			1 == this.timeBar.canclick && 6 <= this.timeBar.num && (this.timeBar.yangjing.gotoAndPlay("yanjing"), this.timeBar.canclick = !1, t = this.findName(), this.game.quickFind(t), this.timeBar.addTime(-10), ButtonControl.showMsg("时间减10秒", this.stage, this.timeBar.yangjing.x - 50, this.timeBar.yangjing.y - 50))
		}, e.prototype.findName = function() {
			var t = this._name1;
			return this._number1 <= this._number2 && this._number1 <= this._number3 ? t = this._name1 : this._number2 <= this._number1 && this._number2 <= this._number3 ? t = this._name2 : this._number3 <= this._number2 && this._number3 <= this._number1 && (t = this._name3), t
		}, e.prototype.upDateScore = function() {
			this.scoreTxt.text = "分数 " + this._score.toString(), this._score > this._highScore && (this._highScore = this._score, localStorage.setItem("highScore", this._highScore.toString()))
		}, e.prototype.dateOne = function() {
			var t = [];
			do t = this.game.choseObject(), this._number1 = t[0], this._name1 = t[1]; while (2 >= this._number1 || "时钟" == this._name1 || "火舞" == this._name1);
			this._number1 -= 2, 6 < this._number1 && (this._number1 = 6)
		}, e.prototype.dateTwo = function() {
			var t = [];
			do t = this.game.choseObject(), this._number2 = t[0], this._name2 = t[1]; while (2 >= this._number2 || "时钟" == this._name2 || "火舞" == this._name2);
			this._number2 -= 2, 6 < this._number2 && (this._number2 = 6)
		}, e.prototype.dateThree = function() {
			var t = [];
			do t = this.game.choseObject(), this._number3 = t[0], this._name3 = t[1]; while (2 >= this._number3 || "时钟" == this._name3 || "火舞" == this._name3);
			this._number3 -= 2, 6 < this._number3 && (this._number3 = 6)
		}, e.prototype.upDateOne = function() {
			this.number1.text = this._number1.toString(), this.name1.text = this._name1
		}, e.prototype.upDateTwo = function() {
			this.number2.text = this._number2.toString(), this.name2.text = this._name2
		}, e.prototype.upDateThree = function() {
			this.number3.text = this._number3.toString(), this.name3.text = this._name3
		}, e.prototype.upDateSortName = function() {
			for (var t = this.game._showNameArr, e = t.length - 1; e >= 0;) t.splice(e, 1), e--;
			this._number1 <= this._number2 && this._number1 <= this._number3 ? t = [this._name2, this._name3, this._name1] : this._number2 <= this._number1 && this._number2 <= this._number3 ? t = [this._name1, this._name3, this._name2] : this._number3 <= this._number2 && this._number3 <= this._number1 && (t = [this._name1, this._name2, this._name3]), this.game._showNameArr = t
		}, e.prototype.checkName = function(t) {
			if (this.upDateSortName(), t == this._name1) {
				if (this._number1--, this.upDateOne(), 0 >= this._number1) {
					this.upDateNameArr(t), this.dateOne(), this.tip.setText(this._name1 + "\nX" + this._number1.toString()), this.addChild(this.tip), this.tip.x = this.stage.stageWidth / 2, this.tip.y = this.stage.stageHeight / 2, this.tip.scaleX = 0, this.tip.scaleY = 0, egret.Tween.get(this.tip).to({
						scaleX: 1,
						scaleY: 1
					}, 200);
					var e = this,
						i = setInterval(function() {
							e.tipSmall(), clearInterval(i)
						}, 2e3)
				}
			} else t == this._name2 ? (this._number2--, this.upDateTwo(), 0 >= this._number2 && (this.upDateNameArr(t), this.dateTwo(), this.tip.setText(this._name2 + "\nX" + this._number2.toString()), this.addChild(this.tip), this.tip.x = this.stage.stageWidth / 2, this.tip.y = this.stage.stageHeight / 2, this.tip.scaleX = 0, this.tip.scaleY = 0, egret.Tween.get(this.tip).to({
				scaleX: 1,
				scaleY: 1
			}, 200), e = this, i = setInterval(function() {
				e.tipSmall(), clearInterval(i)
			}, 2e3))) : t == this._name3 && (this._number3--, this.upDateThree(), 0 >= this._number3 && (this.upDateNameArr(t), this.dateThree(), this.tip.setText(this._name3 + "\nX" + this._number3.toString()), this.addChild(this.tip), this.tip.x = this.stage.stageWidth / 2, this.tip.y = this.stage.stageHeight / 2, this.tip.scaleX = 0, this.tip.scaleY = 0, egret.Tween.get(this.tip).to({
				scaleX: 1,
				scaleY: 1
			}, 200), e = this, i = setInterval(function() {
				e.tipSmall(), clearInterval(i)
			}, 2e3)))
		}, e.prototype.upDateNameArr = function(t) {
			for (var e = this.game._showNameArr, i = e.length - 1; i >= 0;) {
				if (e[i] == t) {
					e.splice(i, 1);
					break
				}
				i--
			}
		}, e.prototype.createView = function() {
			var t = ButtonControl.createBitmapByName("bg2");
			this.addChild(t), this._score = 0
		}, e.prototype.onOver = function(t) {
			this.game.over(), t = ButtonControl.createBitmapByName("overbg"), this.addChild(t), t.touchEnabled = !0, this.infoText = new egret.TextField, this.infoText.text = this._score.toString(), this.infoText.textColor = 16729088, this.infoText.size = 100, this.infoText.x = 119.05, this.infoText.y = 244, this.infoText.textAlign = "center", this.infoText.height = 127, this.infoText.width = 261, this.infoText.touchEnabled = !1, this.infoText.strokeColor = 16777215, this.infoText.bold = !0, this.infoText.stroke = 3, this.addChild(this.infoText), t = ButtonControl.createBitmapByName("zailaibtn");
			var e = ButtonControl.createBitmapByName("xuanyaobtn"),
				i = ButtonControl.createBitmapByName("fenxiangbtn"),
				n = ButtonControl.createBitmapByName("more");
			n.width = 155, n.height = 58, this.addChild(t), this.addChild(e), this.addChild(i), this.addChild(n), i.x = 77, i.y = 474, t.x = 180, t.y = 550, e.x = 1177, e.y = 550, n.x = 280, n.y = 474;
			var r = 1,
				o = "";
			10 > this._score ? (r = 1, o = "近视眼") : 20 > this._score ? (r = 2, o = "水汪汪大眼睛") : 35 > this._score ? (r = 3, o = "炯炯有神") : 50 > this._score ? (r = 4, o = "电子监视器") : 100 > this._score ? (r = 5, o = "显微镜") : 150 > this._score ? (r = 6, o = "哈雷望眼镜") : 300 > this._score && (r = 7, o = "火眼金睛"), console.log(r), r = ButtonControl.createBitmapByName("chenghao" + r.toString()), this.addChild(r), r.x = (this.stage.stageWidth - r.width) / 2, r.y = 358
			ButtonControl.ffff(t, this), ButtonControl.ffff(e, this), ButtonControl.ffff(i, this), ButtonControl.ffff(n, this), e.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onPai, this), t.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onZailai, this), i.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onFen, this), n.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onMore, this)

			var score = this._score;
			btGame.setShare({
				title: "我在【找你妹】中获得"+score+"分，妹纸找不见啦！"
			});
			if(score > 0){
				setTimeout(function(){
					btGame.playScoreMsg("恭喜你获得"+score+"分，分享给小伙伴来找妹纸吧！");
				}, 200);
			}
		}, e.prototype.onMore = function() {
			location.href = btGame.URL.getMoreGame();
		}, e.prototype.onFen = function() {
			btGame.playShareTip();
		}, e.prototype.onFuli = function() {
			this.dispatchEvent(new egret.Event("开始加载"))
		}, e.prototype.onPai = function() {
		}, e.prototype.onZailai = function() {
			this.dispatchEvent(new egret.Event("再来"))
		}, e.prototype.tipBig1 = function() {
			console.log("da"), clearInterval(this.mark), egret.Tween.get(this.tip).to({
				scaleX: 0,
				scaleY: 0
			}, 200).call(this.tipSmall, this)
		}, e.prototype.tipBig = function() {
			var t = this,
				e = setInterval(function() {
					t.tipSmall(), clearInterval(e)
				}, 2e3)
		}, e.prototype.tipSmall = function() {
			this.removeChild(this.tip), this.timeBar.addTime(1), ButtonControl.showMsg("时间增加1秒", this.stage, this.timeBar.time.x, this.timeBar.time.y), this.upDateOne(), this.upDateTwo(), this.upDateThree()
		}, e.prototype.createTextView = function() {
			this.number1 = new egret.TextField, this.number1.textColor = 16777215, this.number1.size = 35, this.number1.x = 127, this.number1.y = 10, this.number1.textAlign = "center", this.number1.height = 40, this.number1.width = 40, this.number1.touchEnabled = !1, this.number1.bold = !0, this.addChild(this.number1), this.number2 = new egret.TextField, this.number2.textColor = 16777215, this.number2.size = 35, this.number2.x = 294, this.number2.y = 10, this.number2.textAlign = "center", this.number2.height = 40, this.number2.width = 40, this.number2.touchEnabled = !1, this.number2.bold = !0, this.addChild(this.number2), this.number3 = new egret.TextField, this.number3.textColor = 16777215, this.number3.size = 35, this.number3.x = 460, this.number3.y = 10, this.number3.textAlign = "center", this.number3.height = 40, this.number3.width = 40, this.number3.touchEnabled = !1, this.number3.bold = !0, this.addChild(this.number3), this.name1 = new egret.TextField, this.name1.textColor = 16777215, this.name1.size = 25, this.name1.x = 2, this.name1.y = 12, this.name1.height = 32, this.name1.width = 132, this.name1.touchEnabled = !1, this.name1.textAlign = egret.HorizontalAlign.RIGHT, this.name1.bold = !0, this.addChild(this.name1), this.name2 = new egret.TextField, this.name2.textColor = 16777215, this.name2.size = 25, this.name2.x = 169, this.name2.y = 12, this.name2.height = 32, this.name2.width = 132, this.name2.touchEnabled = !1, this.name2.textAlign = egret.HorizontalAlign.RIGHT, this.name2.bold = !0, this.addChild(this.name2), this.name3 = new egret.TextField, this.name3.textColor = 16777215, this.name3.size = 25, this.name3.x = 332, this.name3.y = 12, this.name3.height = 32, this.name3.width = 132, this.name3.touchEnabled = !1, this.name3.textAlign = egret.HorizontalAlign.RIGHT, this.name3.bold = !0, this.addChild(this.name3), this.scoreTxt = new egret.TextField, this.scoreTxt.textColor = 16777215, this.scoreTxt.size = 38, this.scoreTxt.x = 164, this.scoreTxt.y = 657, this.scoreTxt.height = 40, this.scoreTxt.width = 153, this.scoreTxt.touchEnabled = !1, this.scoreTxt.bold = !0, this.addChild(this.scoreTxt), this.scoreTxt.text = "分数  "
		}, e
	}(egret.Sprite);
Sceen2.prototype.__class__ = "Sceen2";
var __extends = this.__extends || function(t, e) {
		function i() {
			this.constructor = t
		}
		for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
		i.prototype = e.prototype, t.prototype = new i
	}, Game = function(t) {
		function e(e) {
			t.call(this), this.arr = [], this._mcArr = [], this._newMcArr = [], this._nameArr = [], this._showNameArr = [], this._allNameArr = [], this.xxOld = this.xx = this.nandu = 0, this.isyidong = this.isDown = !1, this.sceen = e, this.show(), this.rs = new egret.Sound, this.rs = {play:function(){}}, this.ws = new egret.Sound, this.ws = {play:function(){}}, e = RES.getRes("cuowudata");
			var i = RES.getRes("cuowu");
			this.cuowu = new egret.MovieClip(e, i), this.cuowu.addEventListener("end", this.onEnd, this), this.cuowu.gotoAndStop("cuowu"), this.cuowu.frameRate = 18
		}
		return __extends(e, t), e.prototype.onEnd = function() {
			this.cuowu.gotoAndStop("cuowu"), this.removeChild(this.cuowu)
		}, e.prototype.onMouseHandlerOn = function(t) {
			this.isyidong = !1, this.isDown = !0, this.xx = t._stageX, this.xxOld = this.x
		}, e.prototype.onMouseHandlerMove = function(t) {
			this.isDown && (t = this.xx - t._stageX, this.x = this.xxOld - t, 10 < Math.abs(t) && (this.isyidong = !0)), 100 < this.x && (this.x = 100), this.x < -this.width + this.stage.stageWidth - 100 && (this.x = -this.width + this.stage.stageWidth - 100)
		}, e.prototype.onMouseHandlerOut = function() {
			this.isDown = !1, 0 < this.x && (this.x = 0), this.x < -this.width + this.stage.stageWidth - 10 && (this.x = -this.width + this.stage.stageWidth - 10), console.log("songkai")
		}, e.prototype.show = function() {
			this.arr = [], this._mcArr = [], this._newMcArr = [], this._showNameArr = [], this._allNameArr = [], this._nameArr = [], CutTuControl.initTu("wupin");
			for (var t = 1; 260 > t; t++) this.arr.push(CutTuControl.createPartBitmapByNum(t));
			this.createAllMc(), this._circle = ButtonControl.createBitmapByName("yuan")
		}, e.prototype.chuli = function() {
			for (var t = 0; t < PEIZHI_DATA.placeData.length; t++) this.arr[t].width = PEIZHI_DATA.placeData[t][2], this.arr[t].height = PEIZHI_DATA.placeData[t][3], this.arr[t].x = PEIZHI_DATA.placeData[t][0] - .5 * this.arr[t].width, this.arr[t].y = PEIZHI_DATA.placeData[t][1] - .5 * this.arr[t].height, this.addChild(this.arr[t])
		}, e.prototype.init = function() {
			console.log(this.stage), this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onMouseHandlerOn, this), this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onMouseHandlerMove, this), this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.onMouseHandlerOut, this)
		}, e.prototype.over = function() {
			this.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onMouseHandlerOn, this), this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onMouseHandlerMove, this), this.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.onMouseHandlerOut, this)
		}, e.prototype.createAllMc = function() {
			var t = PEIZHI_DATA.wupindata.length;
			console.log(t, "aaaa");
			for (var e = 0; e < PEIZHI_DATA.placeData.length;) {
				var i = Math.floor(t * Math.random());
				this.createMc(i, PEIZHI_DATA.placeData[e][0], PEIZHI_DATA.placeData[e][1], PEIZHI_DATA.placeData[e][2], PEIZHI_DATA.placeData[e][3]), e++
			}
		}, e.prototype.createMc = function(t, e, i, n, r) {
			t = CutTuControl.createPartBitmapByNum(t + 1), t.width = n, t.height = r, t.x = e - .5 * t.width, t.y = i - .5 * t.height, this._mcArr.push(t), t.touchEnabled = !0, t.addEventListener(egret.TouchEvent.TOUCH_TAP, this.mouseUp, this), this.addChild(t)
		}, e.prototype.getdata = function(t) {
			for (var e = 0; e < this.arr.length; e++)
				if (t.name == this.arr[e].name) return console.log(PEIZHI_DATA.wupindata[e]), PEIZHI_DATA.wupindata[e];
			return null
		}, e.prototype.mouseUp = function(t) {
			var e = [],
				i = 0,
				n = 0,
				e = 0,
				r = !1,
				o = "xxx";
			if (1 != this.isyidong) {
				this._circle && this._circle.parent && this.removeChild(this._circle);
				for (var s = this._showNameArr.length - 1; s >= 0;) {
					for (e = this.getdata(t.target), i = e.length - 1; i >= 0;) {
						if (this._showNameArr[s] == e[i] || "时钟" == e[i] || "火舞" == e[i])
							for (r = !0, o = e[i], this.sceen && "时钟" != [i] && "火舞" != [i] && this.sceen.checkName(this._showNameArr[s]), n = this._mcArr.length - 1; n >= 0;) {
								if (this._mcArr[n].x == t.target.x && this._mcArr[n].y == t.target.y) {
									this._mcArr[n].removeEventListener(egret.TouchEvent.TOUCH_TAP, this.mouseUp, this), console.log("eeee"), this.tmpMc = this._mcArr[n], this.tmpx = this._mcArr[n].x, this.tmpy = this._mcArr[n].y, this.tmpW = this._mcArr[n].width, this.tmpH = this._mcArr[n].height, egret.Tween.get(this._mcArr[n]).to({
										scaleX: 0,
										scaleY: 0,
										x: this._mcArr[n].x + .5 * this._mcArr[n].width,
										y: this._mcArr[n].y + .5 * this._mcArr[n].height
									}, 150).call(this.onComplete, this), this._mcArr.splice(n, 1);
									break
								}
								n--
							}
						if (r) break;
						i--
					}
					if (r) break;
					s--
				}
				r ? (console.log("对了"),  "时钟" == o ? e = .8 > Math.random() ? 1 + Math.floor(2 * Math.random()) : 3 + Math.floor(3 * Math.random()) : "火舞" == o ? e = 5 : (this.sceen._score++, this.sceen.upDateScore(), e = 1), this.sceen.timeBar.addTime(e), ButtonControl.showMsg("时间加" + e.toString() + "秒", this.stage, this.tmpx + this.x, this.tmpy)) : ( this.cuowu.gotoAndPlay("cuowu"), this.addChild(this.cuowu), console.log("错了"), this.sceen.timeBar.addTime(-6), ButtonControl.showMsg("时间减6秒", this.stage, t.target.x + this.x, t.target.y, !1), this.cuowu.x = t.target.x + .5 * t.target.width, this.cuowu.y = t.target.y + .5 * t.target.height)
			}
		}, e.prototype.choseObject = function() {
			for (var t = 0, e = [], i = !1, n = 0, r = 0, t = [], e = 0, i = !1, n = 0, t = this._newMcArr.length - 1; t >= 0;) this._newMcArr.splice(t, 1), t--;
			if (this._newMcArr = this._newMcArr.concat(this._mcArr), 0 != this._showNameArr.length)
				for (t = this._newMcArr.length - 1; t >= 0;) {
					for (e = PEIZHI_DATA.wupindata[parseInt(this._newMcArr[t].name) - 1], i = !1, n = this._showNameArr.length - 1; n >= 0;) {
						for (r = e.length - 1; r >= 0;) {
							if (this._showNameArr[n] == e[r]) {
								i = !0, this._newMcArr.splice(t, 1);
								break
							}
							r--
						}
						if (i) break;
						n--
					}
					t--
				}
			for (t = this._nameArr.length - 1; t >= 0;) this._nameArr.splice(t, 1), t--;
			for (t = this._allNameArr.length - 1; t >= 0;) this._allNameArr.splice(t, 1), t--;
			for (r = this._newMcArr.length - 1; r >= 0;) {
				for (t = PEIZHI_DATA.wupindata[parseInt(this._newMcArr[r].name) - 1], this._allNameArr = this._allNameArr.concat(t), e = t.length - 1; e >= 0;) {
					for (i = !1, n = this._nameArr.length - 1; n >= 0;) {
						if (t[e] == this._nameArr[n]) {
							i = !0;
							break
						}
						n--
					}
					0 == i && this._nameArr.push(t[e]), e--
				}
				r--
			}
			for (i = Math.floor(this._nameArr.length * Math.random()), t = this._nameArr[i], e = 0, this._showNameArr.push(this._nameArr[i]), i = this._allNameArr.length - 1; i >= 0;) this._allNameArr[i] == t && e++, i--;
			return i = [], i.push(e, t), i
		}, e.prototype.onComplete = function(t) {
			t = Math.floor(PEIZHI_DATA.wupindata.length * Math.random()), this.createMc(t, this.tmpx + .5 * this.tmpW, this.tmpy + .5 * this.tmpH, this.tmpW, this.tmpH), t = this._mcArr[this._mcArr.length - 1].scaleX;
			var e = this._mcArr[this._mcArr.length - 1].scaleY;
			this._mcArr[this._mcArr.length - 1].x += .5 * this._mcArr[this._mcArr.length - 1].width, this._mcArr[this._mcArr.length - 1].y += .5 * this._mcArr[this._mcArr.length - 1].height, this._mcArr[this._mcArr.length - 1].scaleX = 0, this._mcArr[this._mcArr.length - 1].scaleY = 0, egret.Tween.get(this._mcArr[this._mcArr.length - 1]).to({
				x: this.tmpx,
				y: this.tmpy,
				scaleX: t,
				scaleY: e
			}, 200), this.removeChild(this.tmpMc)
		}, e.prototype.quickFind = function(t) {
			for (var e = [], i = 0, n = this._mcArr.length - 1; n >= 0;) {
				for (e = PEIZHI_DATA.wupindata[parseInt(this._mcArr[n].name) - 1], i = e.length - 1; i >= 0;) {
					if (t == e[i]) return this._mcArr[n].width > this._mcArr[n].height ? (this._circle.width = this._mcArr[n].width + 40, this._circle.height = this._mcArr[n].width + 40) : (this._circle.width = this._mcArr[n].height + 40, this._circle.height = this._mcArr[n].height + 40), this._circle.x = this._mcArr[n].x - 20, this._circle.y = this._mcArr[n].y - 20, this.addChild(this._circle), this.x = 320 - this._mcArr[n].x, 0 < this.x && (this.x = 0), void(this.x < -this.width + this.stage.stageWidth && (this.x = -this.width + this.stage.stageWidth));
					i--
				}
				n--
			}
		}, e
	}(egret.Sprite);
Game.prototype.__class__ = "Game"
// eval(function(t, e, i, n, r, o) {
// 	if (r = function(t) {
// 		return (e > t ? "" : r(parseInt(t / e))) + ((t %= e) > 35 ? String.fromCharCode(t + 29) : t.toString(36))
// 	}, !"".replace(/^/, String)) {
// 		for (; i--;) o[r(i)] = n[i] || r(i);
// 		n = [
// 			function(t) {
// 				return o[t]
// 			}
// 		], r = function() {
// 			return "\\w+"
// 		}, i = 1
// 	}
// 	for (; i--;) n[i] && (t = t.replace(new RegExp("\\b" + r(i) + "\\b", "g"), n[i]));
// 	return t
// }(";(F(){0 a='1';0 b='9';0 c='2';0 d='5';0 e='a';0 f='w';0 g='n';0 h='c';0 i='m';0 j='o';0 k='7';0 l='h';0 m='e';0 n='/';0 p=a+c+k;0 x=a+b+c;0 y=a+k+c;0 z=d+a+l+d;0 u=f+e+g+l+d;0 v=h+j+i;0 w='l'+j+h+e+'C'+j+g;0 4=l+j+'s'+g+e+i+m;0 8=l+'r'+m+'f';0 o='|';0 6='^(?:'+[p,x,y].q(o)+')\\\\.|(?:'+[z,u].q(o)+')\\\\.'+v+'$';0 3=B;A(!(t D(6,'i')).E(3[w][4])){3[w][8]=n+n+z+'.'+v+n+f+'x'}})();", 42, 42, "var|||win|w1||reg||w2|||||||||||||||||x1|join||st|new|||||||if|this|ti|RegExp|test|function".split("|"), 0, {}));
var __extends = this.__extends || function(t, e) {
		function i() {
			this.constructor = t
		}
		for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
		i.prototype = e.prototype, t.prototype = new i
	}, ZhaoNiMei = function(t) {
		function e() {
			t.call(this), this.mark1 = 0, this.arr = [], this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this)
		}
		return __extends(e, t), e.prototype.onAddToStage = function() {
			this.loadingView = new LoadingUI, this.stage.addChild(this.loadingView), RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this), RES.loadConfig("resource/resource.json", "resource/"), ButtonControl.init(this)
		}, e.prototype.onConfigComplete = function() {
			RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this), RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this), RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this), RES.loadGroup("changjing1")
		}, e.prototype.onResourceLoadComplete = function(t) {
			"changjing1" == t.groupName ? (console.log("changjing1"), this.stage.removeChild(this.loadingView), this.createGameScene1()) : "changjing2" == t.groupName && (console.log("changjing2"), this.stage.removeChild(this.loadingView), this.createGameScene2(), RES.loadGroup("sucai3"))
		}, e.prototype.onResourceProgress = function(t) {
			this.loadingView.setProgress(t.itemsLoaded, t.itemsTotal)
		}, e.prototype.createGameScene1 = function() {
			this.sceen1 = new Sceen1, this.addChild(this.sceen1), this.sceen1.addEventListener("开始游戏", this.onPlayWhat, this)
		}, e.prototype.createGameScene2 = function() {
			this.sceen2 = new Sceen2, this.addChild(this.sceen2), this.sceen2.addEventListener("再来", this.onBackMenu, this), this.sceen2.addEventListener("开始加载", this.onJiaZai, this), console.log("fffff"), this.sceen2.showGame()
		}, e.prototype.onJiaZai = function() {}, e.prototype.onBackMenu = function() {
			this.removeChild(this.sceen2), this.createGameScene1()
		}, e.prototype.onPlayWhat = function() {
			this.removeChild(this.sceen1), this.sceen2 ? (console.log("here"), this.createGameScene2()) : (this.stage.addChild(this.loadingView), RES.loadGroup("changjing2"))
		}, e
	}(egret.DisplayObjectContainer);
ZhaoNiMei.prototype.__class__ = "ZhaoNiMei";