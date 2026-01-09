require = function t(e, n, i) {
    function s(r, c) {
        if (!n[r]) {
            if (!e[r]) {
                var a = "function" == typeof require && require;
                if (!c && a) return a(r, !0);
                if (o) return o(r, !0);
                var h = new Error("Cannot find module '" + r + "'");
                throw h.code = "MODULE_NOT_FOUND", h
            }
            var l = n[r] = { exports: {} };
            e[r][0].call(l.exports, function (t) {
                var n = e[r][1][t];
                return s(n || t)
            }, l, l.exports, t, e, n, i)
        }
        return n[r].exports
    }

    for (var o = "function" == typeof require && require, r = 0; r < i.length; r++) s(i[r]);
    return s
}({
    Alert: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "f8797cri4pJjLK4zWGl0jXd", "Alert"), cc.Class({
            extends: cc.Component,
            properties: { _alert: null, _btnOK: null, _btnCancel: null, _title: null, _content: null, _onok: null },
            onLoad: function () {
                null != cc.yqs && (this._alert = cc.find("Canvas/alert"), this._title = cc.find("Canvas/alert/commonBg/title").getComponent(cc.Label), this._content = cc.find("Canvas/alert/commonBg/content").getComponent(cc.Label), this._btnOK = cc.find("Canvas/alert/commonBg/btn_ok"), this._btnCancel = cc.find("Canvas/alert/commonBg/btn_cancel"), cc.yqs.utils.addClickEvent(this._btnOK, this.node, "Alert", "onBtnClicked"), cc.yqs.utils.addClickEvent(this._btnCancel, this.node, "Alert", "onBtnClicked"), this._alert.active = !1, cc.yqs.alert = this)
            },
            research: function () {
                this._alert = cc.find("Canvas/alert"), this._title = cc.find("Canvas/alert/commonBg/title").getComponent(cc.Label), this._content = cc.find("Canvas/alert/commonBg/content").getComponent(cc.Label), this._btnOK = cc.find("Canvas/alert/commonBg/btn_ok"), this._btnCancel = cc.find("Canvas/alert/commonBg/btn_cancel"), cc.yqs.utils.addClickEvent(this._btnOK, this.node, "Alert", "onBtnClicked"), cc.yqs.utils.addClickEvent(this._btnCancel, this.node, "Alert", "onBtnClicked")
            },
            onBtnClicked: function (t) {
                "btn_ok" == t.target.name && this._onok && this._onok(), this._alert.active = !1, this._onok = null
            },
            show: function (t, e, n, i) {
                this._alert || this.research(), this._alert.active = !0, this._onok = n, this._title.string = t, this._content.string = e, i ? (this._btnCancel.active = !0, this._btnOK.x = -150, this._btnCancel.x = 150) : (this._btnCancel.active = !1, this._btnOK.x = 0)
            },
            onDestory: function () {
                cc.yqs && (cc.yqs.alert = null)
            }
        }), cc._RF.pop()
    }, {}], AudioMgr: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "5b374dUnOdJYb24jcvI8m1t", "AudioMgr"), cc.Class({
            extends: cc.Component, properties: { bgmVolume: 1, sfxVolume: 1, bgmAudioID: -1 }, init: function () {
                var t = cc.sys.localStorage.getItem("bgmVolume");
                null != t && (this.bgmVolume = parseFloat(t)), null != (t = cc.sys.localStorage.getItem("sfxVolume")) && (this.sfxVolume = parseFloat(t)), cc.game.on(cc.game.EVENT_HIDE, function () {
                    console.log("cc.audioEngine.pauseAll"), cc.audioEngine.pauseAll()
                }), cc.game.on(cc.game.EVENT_SHOW, function () {
                    console.log("cc.audioEngine.resumeAll"), cc.audioEngine.resumeAll()
                })
            }, getUrl: function (t) {
                return cc.url.raw("resources/yqs/sounds/" + t)
            }, playBGM: function (t) {
                var e = cc.url.raw("resources/yqs/HallRes/sound/bgm/" + t);
                this.bgmAudioID >= 0 && cc.audioEngine.stop(this.bgmAudioID), this.bgmAudioID = cc.audioEngine.play(e, !0, this.bgmVolume)
            }, playSFX: function (t) {
                var e = cc.url.raw("resources/yqs/HallRes/sound/effect/" + t);
                if (this.sfxVolume > 0) cc.audioEngine.play(e, !1, this.sfxVolume)
            }, setSFXVolume: function (t) {
                this.sfxVolume != t && (cc.sys.localStorage.setItem("sfxVolume", t), this.sfxVolume = t)
            }, setBGMVolume: function (t, e) {
                this.bgmAudioID >= 0 && (t > 0 ? cc.audioEngine.resume(this.bgmAudioID) : cc.audioEngine.pause(this.bgmAudioID)), (this.bgmVolume != t || e) && (cc.sys.localStorage.setItem("bgmVolume", t), this.bgmVolume = t, cc.audioEngine.setVolume(this.bgmAudioID, t))
            }, pauseAll: function () {
                cc.audioEngine.pauseAll()
            }, resumeAll: function () {
                cc.audioEngine.resumeAll()
            }
        }), cc._RF.pop()
    }, {}], Bggems: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "b670bECMvJA54XxhGRHMFmp", "Bggems"), cc.Class({
            extends: cc.Component,
            properties: { lblgems: cc.Label },
            onLoad: function () {
                this.recharge = cc.find("Canvas/recharge")
            },
            btnaddgems: function () {
                this.recharge = !0
            }
        }), cc._RF.pop()
    }, {}], BulletManager: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "2761ftpellC9JHJlxHl7y91", "BulletManager"), cc.Class({
            extends: cc.Component,
            properties: {
                bomb: { default: null, type: cc.Node },
                bolt: { default: null, type: cc.Prefab },
                CannonRound: cc.Prefab
            },
            onLoad: function () {
                cc.yqs.bomb = this.bomb, cc.yqs.bulletMgr = this, this.playerArray = [], this.aliveBullet = {}
            },
            start: function () {
                for (var t = 0; t < cc.yqs.roomMgr.Seats.length; t++) {
                    var e = [];
                    this.playerArray[t] = e
                }
            },
            getCannonRound: function () {
                return cc.instantiate(this.CannonRound)
            },
            createBulletWithCannon: function (t, e) {
                if (this.playerArray[t - 1].length >= 15) return null;
                if (22 == e) n = cc.yqs.nodepool.getBulletById(22); else var n = cc.yqs.nodepool.getBulletById(e);
                this.node.addChild(n, 200);
                var i = cc.yqs.roomMgr.getPlayerByIndex(t),
                    s = cc.yqs.utils.convertPos(i.getComponent("Cannon").spr, this.node, i.getComponent("Cannon").firePos.getPosition());
                n.setPosition(s);
                var o = n.getComponent("Bullet");
                return null != o && i.getComponent("Cannon") && o.initWithAngle(i.getComponent("Cannon").angle, e, t), this.playerArray[t - 1].push(n), n
            },
            createLaserBulletWithCannon: function (t, e) {
                var n = cc.yqs.nodepool.getBulletById(22);
                this.node.addChild(n);
                var i = cc.yqs.roomMgr.getPlayerByIndex(t),
                    s = cc.yqs.utils.convertPos(i.getComponent("Cannon").spr, this.node, i.getComponent("Cannon").firePos.getPosition());
                n.setPosition(s);
                var o = n.getComponent("Laser");
                return null != o && i.getComponent("Cannon") && o.initlaserWithAngle(i.getComponent("Cannon").angle, 22, t), n
            },
            getBolt: function () {
                return cc.instantiate(this.bolt)
            },
            destroyBullet: function (t) {
                if (this.aliveBullet[t]) {
                    var e = this.aliveBullet[t], n = e.getComponent("Bullet");
                    n.status = 0, e.removeFromParent(), cc.js.array.contains(this.playerArray[n.chairId - 1], e) && cc.js.array.remove(this.playerArray[n.chairId - 1], e), cc.yqs.nodepool.putBulletById(e, n.type), delete this.aliveBullet[n.id]
                }
            },
            getBulletsById: function (t) {
                return this.aliveBullet.hasOwnProperty(t) ? this.aliveBullet[t] : null
            },
            getBulletsByChairId: function (t) {
                var e = [];
                return this.playerArray[t - 1] ? this.playerArray[t - 1] : e
            },
            removeBulletsByChairId: function (t) {
                for (var e = this.getBulletsByChairId(t), n = e.length - 1; n >= 0; n--) this.destroyBullet(e[n].getComponent("Bullet").id)
            },
            onStop: function () {
                for (var t in this.aliveBullet) this.destroyBullet(t)
            },
            lockFish: function (t, e) {
                for (var n = this.getBulletsByChairId(t), i = 0; i < n.length; i++) {
                    var s = n[i];
                    s && s.getComponent("Bullet") && s.getComponent("Bullet").setLockFish(e)
                }
            },
            unLockFish: function (t) {
                t || (t = cc.yqs.userMgr.chairId);
                for (var e = this.getBulletsByChairId(t), n = 0; n < e.length; n++) {
                    var i = e[n];
                    i && i.getComponent("Bullet") && i.getComponent("Bullet").setLockFish(null)
                }
            },
            showBombPanel: function (t) {
                var e = function () {
                    cc.yqs.bomb.getComponent(cc.Animation).stop(), cc.yqs.bomb.active = !1
                };
                cc.yqs.bomb.active = !0, cc.yqs.bomb.getComponent("bomb").setScore(t), cc.yqs.bomb.getComponent(cc.Animation).play(), this.unschedule(e), this.scheduleOnce(e, 5);
                cc.yqs.bomb.getComponent(cc.Animation);
                this.schedule(function () {
                    var t, e = cc.yqs.nodepool.getCoinById(2).getComponent("Coin"), n = 400 - 800 * Math.random(),
                        i = 400 * Math.random();
                    t = cc.p(n, i), null != e && e.bombplay(t, 2)
                }, .05, 50)
            },
            getBulletMulti: function (t) {
                return {
                    1: 1,
                    2: 2,
                    3: 3,
                    4: 1,
                    5: 3,
                    6: 5,
                    7: 1,
                    8: 3,
                    9: 5,
                    10: 1,
                    11: 3,
                    12: 5,
                    13: 1,
                    14: 3,
                    15: 5,
                    16: 1,
                    17: 3,
                    18: 5,
                    19: 1,
                    20: 3,
                    21: 5,
                    30: 1
                }[t] || 1
            }
        }), cc._RF.pop()
    }, {}], Bullet: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "acfd0xeRKZDG5wrIQLOtzye", "Bullet"), cc.Class({
            extends: cc.Component, properties: {}, onLoad: function () {
                this.type = 0, this.angle = 0, this.status = 0, this.chairId = 1, this.lockFish = null, this.id = 0
            }, onEnable: function () {
                this.node.scale = 1, this.id = 0
            }, onDisable: function () {
                this.id = 0, this.node.scale = 1, this.lockFish = null
            }, initWithAngle: function (t, e, n) {
                this.type = e, this.status = 1, this.chairId = n, cc.yqs.mathutil.needViewTrans() ? n <= 2 && (t += 180) : n > 2 && (t += 180), this.angle = t, this.startMove(t)
            }, setBulletId: function (t) {
                this.id = t
            }, startMove: function (t) {
                this.node.rotation = t;
                var e = cc.pForAngle(cc.yqs.mathutil.angle2radian(90 - t)), n = cc.moveBy(1.5, e.mulSelf(1500));
                this.node.runAction(cc.sequence(n, cc.callFunc(function () {
                    this.putBulletToPool()
                }, this)))
            }, playWeb: function () {
                this.node.stopAllActions(), this.status = 2, this.node.getComponent(cc.Animation).play("web" + this.type)
            }, setLockFish: function (t) {
                if (1 == this.status) {
                    this.lockFish;
                    this.lockFish && !t ? this.startMove(this.angle) : t && this.node.stopAllActions(), this.lockFish = t
                }
            }, onCollisionEnter: function (t, e) {
                "wallV" == t.node.group ? this.collisionVertical() : "wallH" == t.node.group && this.collisionHorizontal()
            }, putBulletToPool: function () {
                this.lockFish = null, cc.yqs.bulletMgr.destroyBullet(this.id), this.id = 0
            }, collisionVertical: function () {
                1 == this.status && (this.node.stopAllActions(), this.angle = -1 * this.angle, this.startMove(this.angle))
            }, collisionHorizontal: function () {
                1 == this.status && (this.node.stopAllActions(), this.angle = 180 - this.angle, this.startMove(this.angle))
            }, update: function (t) {
                if (null != this.lockFish) {
                    var e = this.lockFish.getComponent("Fish");
                    if (1 == e.status && 1 == this.status) {
                        var n = e.lockPos, i = this.node.parent, s = cc.yqs.utils.convertPos(n, i, cc.p(0, 0)),
                            o = cc.p(s.x - this.node.position.x, s.y - this.node.position.y), r = cc.pNormalize(o);
                        cc.pToAngle(o), Math.PI;
                        this.angle = -1 * (cc.yqs.mathutil.redian2angle(cc.pToAngle(o)) - 90), this.node.rotation = this.angle;
                        var c = (r = r.mulSelf(1e3 * t)).addSelf(this.node.position);
                        this.node.setPosition(c)
                    }
                }
            }
        }), cc._RF.pop()
    }, {}], 1: [function (t, e, n) {
        "use strict";

        function i(t) {
            var e = t.length;
            if (e % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
            return "=" === t[e - 2] ? 2 : "=" === t[e - 1] ? 1 : 0
        }

        function s(t) {
            return r[t >> 18 & 63] + r[t >> 12 & 63] + r[t >> 6 & 63] + r[63 & t]
        }

        function o(t, e, n) {
            for (var i, o = [], r = e; r < n; r += 3) i = (t[r] << 16) + (t[r + 1] << 8) + t[r + 2], o.push(s(i));
            return o.join("")
        }

        n.byteLength = function (t) {
            return 3 * t.length / 4 - i(t)
        }, n.toByteArray = function (t) {
            var e, n, s, o, r, h = t.length;
            o = i(t), r = new a(3 * h / 4 - o), n = o > 0 ? h - 4 : h;
            var l = 0;
            for (e = 0; e < n; e += 4) s = c[t.charCodeAt(e)] << 18 | c[t.charCodeAt(e + 1)] << 12 | c[t.charCodeAt(e + 2)] << 6 | c[t.charCodeAt(e + 3)], r[l++] = s >> 16 & 255, r[l++] = s >> 8 & 255, r[l++] = 255 & s;
            return 2 === o ? (s = c[t.charCodeAt(e)] << 2 | c[t.charCodeAt(e + 1)] >> 4, r[l++] = 255 & s) : 1 === o && (s = c[t.charCodeAt(e)] << 10 | c[t.charCodeAt(e + 1)] << 4 | c[t.charCodeAt(e + 2)] >> 2, r[l++] = s >> 8 & 255, r[l++] = 255 & s), r
        }, n.fromByteArray = function (t) {
            for (var e, n = t.length, i = n % 3, s = "", c = [], a = 0, h = n - i; a < h; a += 16383) c.push(o(t, a, a + 16383 > h ? h : a + 16383));
            return 1 === i ? (e = t[n - 1], s += r[e >> 2], s += r[e << 4 & 63], s += "==") : 2 === i && (e = (t[n - 2] << 8) + t[n - 1], s += r[e >> 10], s += r[e >> 4 & 63], s += r[e << 2 & 63], s += "="), c.push(s), c.join("")
        };
        for (var r = [], c = [], a = "undefined" != typeof Uint8Array ? Uint8Array : Array, h = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", l = 0, u = h.length; l < u; ++l) r[l] = h[l], c[h.charCodeAt(l)] = l;
        c["-".charCodeAt(0)] = 62, c["_".charCodeAt(0)] = 63
    }, {}], 2: [function (t, e, n) {
        (function (e) {
            "use strict";

            function i() {
                return o.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823
            }

            function s(t, e) {
                if (i() < e) throw new RangeError("Invalid typed array length");
                return o.TYPED_ARRAY_SUPPORT ? (t = new Uint8Array(e)).__proto__ = o.prototype : (null === t && (t = new o(e)), t.length = e), t
            }

            function o(t, e, n) {
                if (!(o.TYPED_ARRAY_SUPPORT || this instanceof o)) return new o(t, e, n);
                if ("number" == typeof t) {
                    if ("string" == typeof e) throw new Error("If encoding is specified then the first argument must be a string");
                    return h(this, t)
                }
                return r(this, t, e, n)
            }

            function r(t, e, n, i) {
                if ("number" == typeof e) throw new TypeError('"value" argument must not be a number');
                return "undefined" != typeof ArrayBuffer && e instanceof ArrayBuffer ? f(t, e, n, i) : "string" == typeof e ? l(t, e, n) : d(t, e)
            }

            function c(t) {
                if ("number" != typeof t) throw new TypeError('"size" argument must be a number');
                if (t < 0) throw new RangeError('"size" argument must not be negative')
            }

            function a(t, e, n, i) {
                return c(e), e <= 0 ? s(t, e) : void 0 !== n ? "string" == typeof i ? s(t, e).fill(n, i) : s(t, e).fill(n) : s(t, e)
            }

            function h(t, e) {
                if (c(e), t = s(t, e < 0 ? 0 : 0 | p(e)), !o.TYPED_ARRAY_SUPPORT) for (var n = 0; n < e; ++n) t[n] = 0;
                return t
            }

            function l(t, e, n) {
                if ("string" == typeof n && "" !== n || (n = "utf8"), !o.isEncoding(n)) throw new TypeError('"encoding" must be a valid string encoding');
                var i = 0 | g(e, n), r = (t = s(t, i)).write(e, n);
                return r !== i && (t = t.slice(0, r)), t
            }

            function u(t, e) {
                var n = e.length < 0 ? 0 : 0 | p(e.length);
                t = s(t, n);
                for (var i = 0; i < n; i += 1) t[i] = 255 & e[i];
                return t
            }

            function f(t, e, n, i) {
                if (e.byteLength, n < 0 || e.byteLength < n) throw new RangeError("'offset' is out of bounds");
                if (e.byteLength < n + (i || 0)) throw new RangeError("'length' is out of bounds");
                return e = void 0 === n && void 0 === i ? new Uint8Array(e) : void 0 === i ? new Uint8Array(e, n) : new Uint8Array(e, n, i), o.TYPED_ARRAY_SUPPORT ? (t = e).__proto__ = o.prototype : t = u(t, e), t
            }

            function d(t, e) {
                if (o.isBuffer(e)) {
                    var n = 0 | p(e.length);
                    return 0 === (t = s(t, n)).length ? t : (e.copy(t, 0, 0, n), t)
                }
                if (e) {
                    if ("undefined" != typeof ArrayBuffer && e.buffer instanceof ArrayBuffer || "length" in e) return "number" != typeof e.length || V(e.length) ? s(t, 0) : u(t, e);
                    if ("Buffer" === e.type && Q(e.data)) return u(t, e.data)
                }
                throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")
            }

            function p(t) {
                if (t >= i()) throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + i().toString(16) + " bytes");
                return 0 | t
            }

            function g(t, e) {
                if (o.isBuffer(t)) return t.length;
                if ("undefined" != typeof ArrayBuffer && "function" == typeof ArrayBuffer.isView && (ArrayBuffer.isView(t) || t instanceof ArrayBuffer)) return t.byteLength;
                "string" != typeof t && (t = "" + t);
                var n = t.length;
                if (0 === n) return 0;
                for (var i = !1; ;) switch (e) {
                    case "ascii":
                    case "latin1":
                    case "binary":
                        return n;
                    case "utf8":
                    case "utf-8":
                    case void 0:
                        return H(t).length;
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return 2 * n;
                    case "hex":
                        return n >>> 1;
                    case "base64":
                        return K(t).length;
                    default:
                        if (i) return H(t).length;
                        e = ("" + e).toLowerCase(), i = !0
                }
            }

            function m(t, e, n) {
                var i = !1;
                if ((void 0 === e || e < 0) && (e = 0), e > this.length) return "";
                if ((void 0 === n || n > this.length) && (n = this.length), n <= 0) return "";
                if (n >>>= 0, e >>>= 0, n <= e) return "";
                for (t || (t = "utf8"); ;) switch (t) {
                    case "hex":
                        return I(this, e, n);
                    case "utf8":
                    case "utf-8":
                        return B(this, e, n);
                    case "ascii":
                        return S(this, e, n);
                    case "latin1":
                    case "binary":
                        return x(this, e, n);
                    case "base64":
                        return q(this, e, n);
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return M(this, e, n);
                    default:
                        if (i) throw new TypeError("Unknown encoding: " + t);
                        t = (t + "").toLowerCase(), i = !0
                }
            }

            function y(t, e, n) {
                var i = t[e];
                t[e] = t[n], t[n] = i
            }

            function v(t, e, n, i, s) {
                if (0 === t.length) return -1;
                if ("string" == typeof n ? (i = n, n = 0) : n > 2147483647 ? n = 2147483647 : n < -2147483648 && (n = -2147483648), n = +n, isNaN(n) && (n = s ? 0 : t.length - 1), n < 0 && (n = t.length + n), n >= t.length) {
                    if (s) return -1;
                    n = t.length - 1
                } else if (n < 0) {
                    if (!s) return -1;
                    n = 0
                }
                if ("string" == typeof e && (e = o.from(e, i)), o.isBuffer(e)) return 0 === e.length ? -1 : _(t, e, n, i, s);
                if ("number" == typeof e) return e &= 255, o.TYPED_ARRAY_SUPPORT && "function" == typeof Uint8Array.prototype.indexOf ? s ? Uint8Array.prototype.indexOf.call(t, e, n) : Uint8Array.prototype.lastIndexOf.call(t, e, n) : _(t, [e], n, i, s);
                throw new TypeError("val must be string, number or Buffer")
            }

            function _(t, e, n, i, s) {
                function o(t, e) {
                    return 1 === r ? t[e] : t.readUInt16BE(e * r)
                }

                var r = 1, c = t.length, a = e.length;
                if (void 0 !== i && ("ucs2" === (i = String(i).toLowerCase()) || "ucs-2" === i || "utf16le" === i || "utf-16le" === i)) {
                    if (t.length < 2 || e.length < 2) return -1;
                    r = 2, c /= 2, a /= 2, n /= 2
                }
                var h;
                if (s) {
                    var l = -1;
                    for (h = n; h < c; h++) if (o(t, h) === o(e, -1 === l ? 0 : h - l)) {
                        if (-1 === l && (l = h), h - l + 1 === a) return l * r
                    } else -1 !== l && (h -= h - l), l = -1
                } else for (n + a > c && (n = c - a), h = n; h >= 0; h--) {
                    for (var u = !0, f = 0; f < a; f++) if (o(t, h + f) !== o(e, f)) {
                        u = !1;
                        break
                    }
                    if (u) return h
                }
                return -1
            }

            function b(t, e, n, i) {
                n = Number(n) || 0;
                var s = t.length - n;
                i ? (i = Number(i)) > s && (i = s) : i = s;
                var o = e.length;
                if (o % 2 != 0) throw new TypeError("Invalid hex string");
                i > o / 2 && (i = o / 2);
                for (var r = 0; r < i; ++r) {
                    var c = parseInt(e.substr(2 * r, 2), 16);
                    if (isNaN(c)) return r;
                    t[n + r] = c
                }
                return r
            }

            function C(t, e, n, i) {
                return Y(H(e, t.length - n), t, n, i)
            }

            function w(t, e, n, i) {
                return Y(W(e), t, n, i)
            }

            function k(t, e, n, i) {
                return w(t, e, n, i)
            }

            function T(t, e, n, i) {
                return Y(K(e), t, n, i)
            }

            function A(t, e, n, i) {
                return Y(G(e, t.length - n), t, n, i)
            }

            function q(t, e, n) {
                return 0 === e && n === t.length ? J.fromByteArray(t) : J.fromByteArray(t.slice(e, n))
            }

            function B(t, e, n) {
                n = Math.min(t.length, n);
                for (var i = [], s = e; s < n;) {
                    var o = t[s], r = null, c = o > 239 ? 4 : o > 223 ? 3 : o > 191 ? 2 : 1;
                    if (s + c <= n) {
                        var a, h, l, u;
                        switch (c) {
                            case 1:
                                o < 128 && (r = o);
                                break;
                            case 2:
                                128 == (192 & (a = t[s + 1])) && (u = (31 & o) << 6 | 63 & a) > 127 && (r = u);
                                break;
                            case 3:
                                a = t[s + 1], h = t[s + 2], 128 == (192 & a) && 128 == (192 & h) && (u = (15 & o) << 12 | (63 & a) << 6 | 63 & h) > 2047 && (u < 55296 || u > 57343) && (r = u);
                                break;
                            case 4:
                                a = t[s + 1], h = t[s + 2], l = t[s + 3], 128 == (192 & a) && 128 == (192 & h) && 128 == (192 & l) && (u = (15 & o) << 18 | (63 & a) << 12 | (63 & h) << 6 | 63 & l) > 65535 && u < 1114112 && (r = u)
                        }
                    }
                    null === r ? (r = 65533, c = 1) : r > 65535 && (r -= 65536, i.push(r >>> 10 & 1023 | 55296), r = 56320 | 1023 & r), i.push(r), s += c
                }
                return P(i)
            }

            function P(t) {
                var e = t.length;
                if (e <= Z) return String.fromCharCode.apply(String, t);
                for (var n = "", i = 0; i < e;) n += String.fromCharCode.apply(String, t.slice(i, i += Z));
                return n
            }

            function S(t, e, n) {
                var i = "";
                n = Math.min(t.length, n);
                for (var s = e; s < n; ++s) i += String.fromCharCode(127 & t[s]);
                return i
            }

            function x(t, e, n) {
                var i = "";
                n = Math.min(t.length, n);
                for (var s = e; s < n; ++s) i += String.fromCharCode(t[s]);
                return i
            }

            function I(t, e, n) {
                var i = t.length;
                (!e || e < 0) && (e = 0), (!n || n < 0 || n > i) && (n = i);
                for (var s = "", o = e; o < n; ++o) s += z(t[o]);
                return s
            }

            function M(t, e, n) {
                for (var i = t.slice(e, n), s = "", o = 0; o < i.length; o += 2) s += String.fromCharCode(i[o] + 256 * i[o + 1]);
                return s
            }

            function F(t, e, n) {
                if (t % 1 != 0 || t < 0) throw new RangeError("offset is not uint");
                if (t + e > n) throw new RangeError("Trying to access beyond buffer length")
            }

            function R(t, e, n, i, s, r) {
                if (!o.isBuffer(t)) throw new TypeError('"buffer" argument must be a Buffer instance');
                if (e > s || e < r) throw new RangeError('"value" argument is out of bounds');
                if (n + i > t.length) throw new RangeError("Index out of range")
            }

            function E(t, e, n, i) {
                e < 0 && (e = 65535 + e + 1);
                for (var s = 0, o = Math.min(t.length - n, 2); s < o; ++s) t[n + s] = (e & 255 << 8 * (i ? s : 1 - s)) >>> 8 * (i ? s : 1 - s)
            }

            function L(t, e, n, i) {
                e < 0 && (e = 4294967295 + e + 1);
                for (var s = 0, o = Math.min(t.length - n, 4); s < o; ++s) t[n + s] = e >>> 8 * (i ? s : 3 - s) & 255
            }

            function N(t, e, n, i, s, o) {
                if (n + i > t.length) throw new RangeError("Index out of range");
                if (n < 0) throw new RangeError("Index out of range")
            }

            function O(t, e, n, i, s) {
                return s || N(t, e, n, 4, 3.4028234663852886e38, -3.4028234663852886e38), X.write(t, e, n, i, 23, 4), n + 4
            }

            function D(t, e, n, i, s) {
                return s || N(t, e, n, 8, 1.7976931348623157e308, -1.7976931348623157e308), X.write(t, e, n, i, 52, 8), n + 8
            }

            function U(t) {
                if ((t = j(t).replace($, "")).length < 2) return "";
                for (; t.length % 4 != 0;) t += "=";
                return t
            }

            function j(t) {
                return t.trim ? t.trim() : t.replace(/^\s+|\s+$/g, "")
            }

            function z(t) {
                return t < 16 ? "0" + t.toString(16) : t.toString(16)
            }

            function H(t, e) {
                e = e || 1 / 0;
                for (var n, i = t.length, s = null, o = [], r = 0; r < i; ++r) {
                    if ((n = t.charCodeAt(r)) > 55295 && n < 57344) {
                        if (!s) {
                            if (n > 56319) {
                                (e -= 3) > -1 && o.push(239, 191, 189);
                                continue
                            }
                            if (r + 1 === i) {
                                (e -= 3) > -1 && o.push(239, 191, 189);
                                continue
                            }
                            s = n;
                            continue
                        }
                        if (n < 56320) {
                            (e -= 3) > -1 && o.push(239, 191, 189), s = n;
                            continue
                        }
                        n = 65536 + (s - 55296 << 10 | n - 56320)
                    } else s && (e -= 3) > -1 && o.push(239, 191, 189);
                    if (s = null, n < 128) {
                        if ((e -= 1) < 0) break;
                        o.push(n)
                    } else if (n < 2048) {
                        if ((e -= 2) < 0) break;
                        o.push(n >> 6 | 192, 63 & n | 128)
                    } else if (n < 65536) {
                        if ((e -= 3) < 0) break;
                        o.push(n >> 12 | 224, n >> 6 & 63 | 128, 63 & n | 128)
                    } else {
                        if (!(n < 1114112)) throw new Error("Invalid code point");
                        if ((e -= 4) < 0) break;
                        o.push(n >> 18 | 240, n >> 12 & 63 | 128, n >> 6 & 63 | 128, 63 & n | 128)
                    }
                }
                return o
            }

            function W(t) {
                for (var e = [], n = 0; n < t.length; ++n) e.push(255 & t.charCodeAt(n));
                return e
            }

            function G(t, e) {
                for (var n, i, s, o = [], r = 0; r < t.length && !((e -= 2) < 0); ++r) i = (n = t.charCodeAt(r)) >> 8, s = n % 256, o.push(s), o.push(i);
                return o
            }

            function K(t) {
                return J.toByteArray(U(t))
            }

            function Y(t, e, n, i) {
                for (var s = 0; s < i && !(s + n >= e.length || s >= t.length); ++s) e[s + n] = t[s];
                return s
            }

            function V(t) {
                return t !== t
            }

            var J = t("base64-js"), X = t("ieee754"), Q = t("isarray");
            n.Buffer = o, n.SlowBuffer = function (t) {
                return +t != t && (t = 0), o.alloc(+t)
            }, n.INSPECT_MAX_BYTES = 50, o.TYPED_ARRAY_SUPPORT = void 0 !== e.TYPED_ARRAY_SUPPORT ? e.TYPED_ARRAY_SUPPORT : function () {
                try {
                    var t = new Uint8Array(1);
                    return t.__proto__ = {
                        __proto__: Uint8Array.prototype, foo: function () {
                            return 42
                        }
                    }, 42 === t.foo() && "function" == typeof t.subarray && 0 === t.subarray(1, 1).byteLength
                } catch (t) {
                    return !1
                }
            }(), n.kMaxLength = i(), o.poolSize = 8192, o._augment = function (t) {
                return t.__proto__ = o.prototype, t
            }, o.from = function (t, e, n) {
                return r(null, t, e, n)
            }, o.TYPED_ARRAY_SUPPORT && (o.prototype.__proto__ = Uint8Array.prototype, o.__proto__ = Uint8Array, "undefined" != typeof Symbol && Symbol.species && o[Symbol.species] === o && Object.defineProperty(o, Symbol.species, {
                value: null,
                configurable: !0
            })), o.alloc = function (t, e, n) {
                return a(null, t, e, n)
            }, o.allocUnsafe = function (t) {
                return h(null, t)
            }, o.allocUnsafeSlow = function (t) {
                return h(null, t)
            }, o.isBuffer = function (t) {
                return !(null == t || !t._isBuffer)
            }, o.compare = function (t, e) {
                if (!o.isBuffer(t) || !o.isBuffer(e)) throw new TypeError("Arguments must be Buffers");
                if (t === e) return 0;
                for (var n = t.length, i = e.length, s = 0, r = Math.min(n, i); s < r; ++s) if (t[s] !== e[s]) {
                    n = t[s], i = e[s];
                    break
                }
                return n < i ? -1 : i < n ? 1 : 0
            }, o.isEncoding = function (t) {
                switch (String(t).toLowerCase()) {
                    case "hex":
                    case "utf8":
                    case "utf-8":
                    case "ascii":
                    case "latin1":
                    case "binary":
                    case "base64":
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return !0;
                    default:
                        return !1
                }
            }, o.concat = function (t, e) {
                if (!Q(t)) throw new TypeError('"list" argument must be an Array of Buffers');
                if (0 === t.length) return o.alloc(0);
                var n;
                if (void 0 === e) for (e = 0, n = 0; n < t.length; ++n) e += t[n].length;
                var i = o.allocUnsafe(e), s = 0;
                for (n = 0; n < t.length; ++n) {
                    var r = t[n];
                    if (!o.isBuffer(r)) throw new TypeError('"list" argument must be an Array of Buffers');
                    r.copy(i, s), s += r.length
                }
                return i
            }, o.byteLength = g, o.prototype._isBuffer = !0, o.prototype.swap16 = function () {
                var t = this.length;
                if (t % 2 != 0) throw new RangeError("Buffer size must be a multiple of 16-bits");
                for (var e = 0; e < t; e += 2) y(this, e, e + 1);
                return this
            }, o.prototype.swap32 = function () {
                var t = this.length;
                if (t % 4 != 0) throw new RangeError("Buffer size must be a multiple of 32-bits");
                for (var e = 0; e < t; e += 4) y(this, e, e + 3), y(this, e + 1, e + 2);
                return this
            }, o.prototype.swap64 = function () {
                var t = this.length;
                if (t % 8 != 0) throw new RangeError("Buffer size must be a multiple of 64-bits");
                for (var e = 0; e < t; e += 8) y(this, e, e + 7), y(this, e + 1, e + 6), y(this, e + 2, e + 5), y(this, e + 3, e + 4);
                return this
            }, o.prototype.toString = function () {
                var t = 0 | this.length;
                return 0 === t ? "" : 0 === arguments.length ? B(this, 0, t) : m.apply(this, arguments)
            }, o.prototype.equals = function (t) {
                if (!o.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
                return this === t || 0 === o.compare(this, t)
            }, o.prototype.inspect = function () {
                var t = "", e = n.INSPECT_MAX_BYTES;
                return this.length > 0 && (t = this.toString("hex", 0, e).match(/.{2}/g).join(" "), this.length > e && (t += " ... ")), "<Buffer " + t + ">"
            }, o.prototype.compare = function (t, e, n, i, s) {
                if (!o.isBuffer(t)) throw new TypeError("Argument must be a Buffer");
                if (void 0 === e && (e = 0), void 0 === n && (n = t ? t.length : 0), void 0 === i && (i = 0), void 0 === s && (s = this.length), e < 0 || n > t.length || i < 0 || s > this.length) throw new RangeError("out of range index");
                if (i >= s && e >= n) return 0;
                if (i >= s) return -1;
                if (e >= n) return 1;
                if (e >>>= 0, n >>>= 0, i >>>= 0, s >>>= 0, this === t) return 0;
                for (var r = s - i, c = n - e, a = Math.min(r, c), h = this.slice(i, s), l = t.slice(e, n), u = 0; u < a; ++u) if (h[u] !== l[u]) {
                    r = h[u], c = l[u];
                    break
                }
                return r < c ? -1 : c < r ? 1 : 0
            }, o.prototype.includes = function (t, e, n) {
                return -1 !== this.indexOf(t, e, n)
            }, o.prototype.indexOf = function (t, e, n) {
                return v(this, t, e, n, !0)
            }, o.prototype.lastIndexOf = function (t, e, n) {
                return v(this, t, e, n, !1)
            }, o.prototype.write = function (t, e, n, i) {
                if (void 0 === e) i = "utf8", n = this.length, e = 0; else if (void 0 === n && "string" == typeof e) i = e, n = this.length, e = 0; else {
                    if (!isFinite(e)) throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
                    e |= 0, isFinite(n) ? (n |= 0, void 0 === i && (i = "utf8")) : (i = n, n = void 0)
                }
                var s = this.length - e;
                if ((void 0 === n || n > s) && (n = s), t.length > 0 && (n < 0 || e < 0) || e > this.length) throw new RangeError("Attempt to write outside buffer bounds");
                i || (i = "utf8");
                for (var o = !1; ;) switch (i) {
                    case "hex":
                        return b(this, t, e, n);
                    case "utf8":
                    case "utf-8":
                        return C(this, t, e, n);
                    case "ascii":
                        return w(this, t, e, n);
                    case "latin1":
                    case "binary":
                        return k(this, t, e, n);
                    case "base64":
                        return T(this, t, e, n);
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return A(this, t, e, n);
                    default:
                        if (o) throw new TypeError("Unknown encoding: " + i);
                        i = ("" + i).toLowerCase(), o = !0
                }
            }, o.prototype.toJSON = function () {
                return { type: "Buffer", data: Array.prototype.slice.call(this._arr || this, 0) }
            };
            var Z = 4096;
            o.prototype.slice = function (t, e) {
                var n = this.length;
                t = ~~t, e = void 0 === e ? n : ~~e, t < 0 ? (t += n) < 0 && (t = 0) : t > n && (t = n), e < 0 ? (e += n) < 0 && (e = 0) : e > n && (e = n), e < t && (e = t);
                var i;
                if (o.TYPED_ARRAY_SUPPORT) (i = this.subarray(t, e)).__proto__ = o.prototype; else {
                    var s = e - t;
                    i = new o(s, void 0);
                    for (var r = 0; r < s; ++r) i[r] = this[r + t]
                }
                return i
            }, o.prototype.readUIntLE = function (t, e, n) {
                t |= 0, e |= 0, n || F(t, e, this.length);
                for (var i = this[t], s = 1, o = 0; ++o < e && (s *= 256);) i += this[t + o] * s;
                return i
            }, o.prototype.readUIntBE = function (t, e, n) {
                t |= 0, e |= 0, n || F(t, e, this.length);
                for (var i = this[t + --e], s = 1; e > 0 && (s *= 256);) i += this[t + --e] * s;
                return i
            }, o.prototype.readUInt8 = function (t, e) {
                return e || F(t, 1, this.length), this[t]
            }, o.prototype.readUInt16LE = function (t, e) {
                return e || F(t, 2, this.length), this[t] | this[t + 1] << 8
            }, o.prototype.readUInt16BE = function (t, e) {
                return e || F(t, 2, this.length), this[t] << 8 | this[t + 1]
            }, o.prototype.readUInt32LE = function (t, e) {
                return e || F(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + 16777216 * this[t + 3]
            }, o.prototype.readUInt32BE = function (t, e) {
                return e || F(t, 4, this.length), 16777216 * this[t] + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3])
            }, o.prototype.readIntLE = function (t, e, n) {
                t |= 0, e |= 0, n || F(t, e, this.length);
                for (var i = this[t], s = 1, o = 0; ++o < e && (s *= 256);) i += this[t + o] * s;
                return s *= 128, i >= s && (i -= Math.pow(2, 8 * e)), i
            }, o.prototype.readIntBE = function (t, e, n) {
                t |= 0, e |= 0, n || F(t, e, this.length);
                for (var i = e, s = 1, o = this[t + --i]; i > 0 && (s *= 256);) o += this[t + --i] * s;
                return s *= 128, o >= s && (o -= Math.pow(2, 8 * e)), o
            }, o.prototype.readInt8 = function (t, e) {
                return e || F(t, 1, this.length), 128 & this[t] ? -1 * (255 - this[t] + 1) : this[t]
            }, o.prototype.readInt16LE = function (t, e) {
                e || F(t, 2, this.length);
                var n = this[t] | this[t + 1] << 8;
                return 32768 & n ? 4294901760 | n : n
            }, o.prototype.readInt16BE = function (t, e) {
                e || F(t, 2, this.length);
                var n = this[t + 1] | this[t] << 8;
                return 32768 & n ? 4294901760 | n : n
            }, o.prototype.readInt32LE = function (t, e) {
                return e || F(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24
            }, o.prototype.readInt32BE = function (t, e) {
                return e || F(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]
            }, o.prototype.readFloatLE = function (t, e) {
                return e || F(t, 4, this.length), X.read(this, t, !0, 23, 4)
            }, o.prototype.readFloatBE = function (t, e) {
                return e || F(t, 4, this.length), X.read(this, t, !1, 23, 4)
            }, o.prototype.readDoubleLE = function (t, e) {
                return e || F(t, 8, this.length), X.read(this, t, !0, 52, 8)
            }, o.prototype.readDoubleBE = function (t, e) {
                return e || F(t, 8, this.length), X.read(this, t, !1, 52, 8)
            }, o.prototype.writeUIntLE = function (t, e, n, i) {
                t = +t, e |= 0, n |= 0, i || R(this, t, e, n, Math.pow(2, 8 * n) - 1, 0);
                var s = 1, o = 0;
                for (this[e] = 255 & t; ++o < n && (s *= 256);) this[e + o] = t / s & 255;
                return e + n
            }, o.prototype.writeUIntBE = function (t, e, n, i) {
                t = +t, e |= 0, n |= 0, i || R(this, t, e, n, Math.pow(2, 8 * n) - 1, 0);
                var s = n - 1, o = 1;
                for (this[e + s] = 255 & t; --s >= 0 && (o *= 256);) this[e + s] = t / o & 255;
                return e + n
            }, o.prototype.writeUInt8 = function (t, e, n) {
                return t = +t, e |= 0, n || R(this, t, e, 1, 255, 0), o.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), this[e] = 255 & t, e + 1
            }, o.prototype.writeUInt16LE = function (t, e, n) {
                return t = +t, e |= 0, n || R(this, t, e, 2, 65535, 0), o.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8) : E(this, t, e, !0), e + 2
            }, o.prototype.writeUInt16BE = function (t, e, n) {
                return t = +t, e |= 0, n || R(this, t, e, 2, 65535, 0), o.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = 255 & t) : E(this, t, e, !1), e + 2
            }, o.prototype.writeUInt32LE = function (t, e, n) {
                return t = +t, e |= 0, n || R(this, t, e, 4, 4294967295, 0), o.TYPED_ARRAY_SUPPORT ? (this[e + 3] = t >>> 24, this[e + 2] = t >>> 16, this[e + 1] = t >>> 8, this[e] = 255 & t) : L(this, t, e, !0), e + 4
            }, o.prototype.writeUInt32BE = function (t, e, n) {
                return t = +t, e |= 0, n || R(this, t, e, 4, 4294967295, 0), o.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t) : L(this, t, e, !1), e + 4
            }, o.prototype.writeIntLE = function (t, e, n, i) {
                if (t = +t, e |= 0, !i) {
                    var s = Math.pow(2, 8 * n - 1);
                    R(this, t, e, n, s - 1, -s)
                }
                var o = 0, r = 1, c = 0;
                for (this[e] = 255 & t; ++o < n && (r *= 256);) t < 0 && 0 === c && 0 !== this[e + o - 1] && (c = 1), this[e + o] = (t / r >> 0) - c & 255;
                return e + n
            }, o.prototype.writeIntBE = function (t, e, n, i) {
                if (t = +t, e |= 0, !i) {
                    var s = Math.pow(2, 8 * n - 1);
                    R(this, t, e, n, s - 1, -s)
                }
                var o = n - 1, r = 1, c = 0;
                for (this[e + o] = 255 & t; --o >= 0 && (r *= 256);) t < 0 && 0 === c && 0 !== this[e + o + 1] && (c = 1), this[e + o] = (t / r >> 0) - c & 255;
                return e + n
            }, o.prototype.writeInt8 = function (t, e, n) {
                return t = +t, e |= 0, n || R(this, t, e, 1, 127, -128), o.TYPED_ARRAY_SUPPORT || (t = Math.floor(t)), t < 0 && (t = 255 + t + 1), this[e] = 255 & t, e + 1
            }, o.prototype.writeInt16LE = function (t, e, n) {
                return t = +t, e |= 0, n || R(this, t, e, 2, 32767, -32768), o.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8) : E(this, t, e, !0), e + 2
            }, o.prototype.writeInt16BE = function (t, e, n) {
                return t = +t, e |= 0, n || R(this, t, e, 2, 32767, -32768), o.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 8, this[e + 1] = 255 & t) : E(this, t, e, !1), e + 2
            }, o.prototype.writeInt32LE = function (t, e, n) {
                return t = +t, e |= 0, n || R(this, t, e, 4, 2147483647, -2147483648), o.TYPED_ARRAY_SUPPORT ? (this[e] = 255 & t, this[e + 1] = t >>> 8, this[e + 2] = t >>> 16, this[e + 3] = t >>> 24) : L(this, t, e, !0), e + 4
            }, o.prototype.writeInt32BE = function (t, e, n) {
                return t = +t, e |= 0, n || R(this, t, e, 4, 2147483647, -2147483648), t < 0 && (t = 4294967295 + t + 1), o.TYPED_ARRAY_SUPPORT ? (this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = 255 & t) : L(this, t, e, !1), e + 4
            }, o.prototype.writeFloatLE = function (t, e, n) {
                return O(this, t, e, !0, n)
            }, o.prototype.writeFloatBE = function (t, e, n) {
                return O(this, t, e, !1, n)
            }, o.prototype.writeDoubleLE = function (t, e, n) {
                return D(this, t, e, !0, n)
            }, o.prototype.writeDoubleBE = function (t, e, n) {
                return D(this, t, e, !1, n)
            }, o.prototype.copy = function (t, e, n, i) {
                if (n || (n = 0), i || 0 === i || (i = this.length), e >= t.length && (e = t.length), e || (e = 0), i > 0 && i < n && (i = n), i === n) return 0;
                if (0 === t.length || 0 === this.length) return 0;
                if (e < 0) throw new RangeError("targetStart out of bounds");
                if (n < 0 || n >= this.length) throw new RangeError("sourceStart out of bounds");
                if (i < 0) throw new RangeError("sourceEnd out of bounds");
                i > this.length && (i = this.length), t.length - e < i - n && (i = t.length - e + n);
                var s, r = i - n;
                if (this === t && n < e && e < i) for (s = r - 1; s >= 0; --s) t[s + e] = this[s + n]; else if (r < 1e3 || !o.TYPED_ARRAY_SUPPORT) for (s = 0; s < r; ++s) t[s + e] = this[s + n]; else Uint8Array.prototype.set.call(t, this.subarray(n, n + r), e);
                return r
            }, o.prototype.fill = function (t, e, n, i) {
                if ("string" == typeof t) {
                    if ("string" == typeof e ? (i = e, e = 0, n = this.length) : "string" == typeof n && (i = n, n = this.length), 1 === t.length) {
                        var s = t.charCodeAt(0);
                        s < 256 && (t = s)
                    }
                    if (void 0 !== i && "string" != typeof i) throw new TypeError("encoding must be a string");
                    if ("string" == typeof i && !o.isEncoding(i)) throw new TypeError("Unknown encoding: " + i)
                } else "number" == typeof t && (t &= 255);
                if (e < 0 || this.length < e || this.length < n) throw new RangeError("Out of range index");
                if (n <= e) return this;
                e >>>= 0, n = void 0 === n ? this.length : n >>> 0, t || (t = 0);
                var r;
                if ("number" == typeof t) for (r = e; r < n; ++r) this[r] = t; else {
                    var c = o.isBuffer(t) ? t : H(new o(t, i).toString()), a = c.length;
                    for (r = 0; r < n - e; ++r) this[r + e] = c[r % a]
                }
                return this
            };
            var $ = /[^+\/0-9A-Za-z-_]/g
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, { "base64-js": 1, ieee754: 4, isarray: 3 }], 3: [function (t, e, n) {
        var i = {}.toString;
        e.exports = Array.isArray || function (t) {
            return "[object Array]" == i.call(t)
        }
    }, {}], 4: [function (t, e, n) {
        n.read = function (t, e, n, i, s) {
            var o, r, c = 8 * s - i - 1, a = (1 << c) - 1, h = a >> 1, l = -7, u = n ? s - 1 : 0, f = n ? -1 : 1,
                d = t[e + u];
            for (u += f, o = d & (1 << -l) - 1, d >>= -l, l += c; l > 0; o = 256 * o + t[e + u], u += f, l -= 8);
            for (r = o & (1 << -l) - 1, o >>= -l, l += i; l > 0; r = 256 * r + t[e + u], u += f, l -= 8);
            if (0 === o) o = 1 - h; else {
                if (o === a) return r ? NaN : 1 / 0 * (d ? -1 : 1);
                r += Math.pow(2, i), o -= h
            }
            return (d ? -1 : 1) * r * Math.pow(2, o - i)
        }, n.write = function (t, e, n, i, s, o) {
            var r, c, a, h = 8 * o - s - 1, l = (1 << h) - 1, u = l >> 1,
                f = 23 === s ? Math.pow(2, -24) - Math.pow(2, -77) : 0, d = i ? 0 : o - 1, p = i ? 1 : -1,
                g = e < 0 || 0 === e && 1 / e < 0 ? 1 : 0;
            for (e = Math.abs(e), isNaN(e) || e === 1 / 0 ? (c = isNaN(e) ? 1 : 0, r = l) : (r = Math.floor(Math.log(e) / Math.LN2), e * (a = Math.pow(2, -r)) < 1 && (r--, a *= 2), (e += r + u >= 1 ? f / a : f * Math.pow(2, 1 - u)) * a >= 2 && (r++, a /= 2), r + u >= l ? (c = 0, r = l) : r + u >= 1 ? (c = (e * a - 1) * Math.pow(2, s), r += u) : (c = e * Math.pow(2, u - 1) * Math.pow(2, s), r = 0)); s >= 8; t[n + d] = 255 & c, d += p, c /= 256, s -= 8);
            for (r = r << s | c, h += s; h > 0; t[n + d] = 255 & r, d += p, r /= 256, h -= 8);
            t[n + d - p] |= 128 * g
        }
    }, {}], Cannon: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "9c4a1C5sMpHGLYuQhmEcp3v", "Cannon"), cc.Class({
            extends: cc.Component,
            properties: {
                emptyNode: cc.Node,
                cannonPlatform: cc.Node,
                selfPlatform: cc.Node,
                spr: { default: null, type: cc.Node },
                bulletLabel: cc.Label,
                CoinLabel: cc.Label,
                powerBar: { default: null, type: cc.ProgressBar },
                fireToggle: { default: null, type: cc.Toggle },
                lockToggle: { default: null, type: cc.Toggle },
                firePos: { default: null, type: cc.Node },
                frozenBtn: { default: null, type: cc.Button },
                frozenCD: { default: null, type: cc.ProgressBar },
                columnMgr: { default: null, type: cc.Node },
                lockLinePoints: { default: [], type: cc.Node },
                rewardNode: { default: null, type: cc.Node },
                laser: { default: null, type: cc.Node },
                reduce: { default: null, type: cc.Button },
                add: { default: null, type: cc.Button },
                CannonRound: cc.Prefab,
                chairId: { default: 0 },
                itemSprite: { default: null, type: cc.Node }
            },
            onLoad: function () {
                this.fireTime = 0, this.angle = 0, this.lockFish = null, this.onAuto = !1, this.isSuperPower = !1, this._score = 0, this.beforeId = 0, this.onescheduletime = 31, this.onLasrmove = !1, this.round = cc.instantiate(this.CannonRound)
            },
            initWithData: function (t) {
                if (t.userId <= 0) return;
                
                // Set chairId based on seatIndex
                this.chairId = t.seatIndex + 1;
                console.log("=== CANNON INIT DEBUG ===");
                console.log("Seat data:", t);
                console.log("Set cannon chairId to:", this.chairId);
                console.log("My chairId:", cc.yqs.userMgr.chairId);
                console.log("Is this my cannon?", t.userId == cc.yqs.userMgr.userId);
                
                this.emptyNode.active = !1, this.cannonPlatform.active = !0, this._score = t.score, this.CoinLabel.string = cc.yqs.utils.transString(t.score) + ":", this.Vip = t.vip, this.CannonKind = t.cannonKind, this.setSceneMulti(), this.setCannon(this.CannonKind), t.userId == cc.yqs.userMgr.userId ? (this.selfPlatform.active = !0, this.powerBar.progress = t.power, this.powerBar.progress >= 1 && !this.laser.active && this.showLasrTip()) : this.selfPlatform.active = !1
            },
            clearSeat: function () {
                this.emptyNode.active = !0, this.cannonPlatform.active = !1, this.selfPlatform.active = !1, cc.yqs.bulletMgr.removeBulletsByChairId(this.chairId)
            },
            onEnable: function () {
                cc.yqs.eventCenter.addEvent(this, "updateYQSceneMulti", this.setSceneMulti)
            },
            onDisable: function () {
                cc.yqs.eventCenter.removeEvent(this, "updateYQSceneMulti", this.setSceneMulti)
            },
            setSceneMulti: function () {
                var t = parseFloat(cc.yqs.bulletMgr.getBulletMulti(this.CannonKind) * cc.yqs.gameMgr.sceneMulti).toFixed(3);
                this.bulletLabel.string = cc.yqs.utils.transString(t) + ":"
            },
            setCannon: function (t) {
                var e = cc.find("cannon", this.spr);
                e && (e.removeFromParent(), cc.yqs.nodepool.putCannonById(e, this.cannonId));
                var n = cc.yqs.nodepool.getCannonById(t);
                n.name = "cannon", this.spr.addChild(n), n.anchorY = 0, n.position = cc.p(0, 0), this.cannonId = t
            },
            setAngle: function (t) {
                if (null == t) return 0;
                var e = cc.v2(0, 0), n = cc.pDistance(e, t);
                if (n <= 0) return 0;
                var i = (t.x - e.x) / n, s = cc.yqs.mathutil.redian2angle(Math.acos(i)) + 90;
                return t.y >= e.y && (s = cc.yqs.mathutil.redian2angle(-1 * Math.acos(i)) + 90), this.spr.rotation = s, this.angle = s, s
            },
            onFire: function (t, e) {
                if (!(this.onLasrmove || this.fireTime < .15)) {
                    if (this.fireTime = 0, t && (this.angle = this.setAngle(t)), cc.yqs.userMgr.gems < cc.yqs.bulletMgr.getBulletMulti(this.CannonKind) * cc.yqs.gameMgr.sceneMulti) return this.unLockFish(), this.rewardNode.active && (this.rewardNode.active = !1), this.unscheduleAllCallbacks(), void cc.yqs.alert.show("", "余额不足", function () {
                    });
                    var n = this.CannonKind, i = cc.yqs.bulletMgr.createBulletWithCannon(this.chairId, n);
                    if (i) {
                        c = this.chairId + "_" + (new Date).getTime() % 6e5;
                        i.getComponent("Bullet").setBulletId(c), cc.yqs.bulletMgr.aliveBullet[c] = i;
                        var s = 0;
                        e && i && i.getComponent("Bullet") && (i.getComponent("Bullet").setLockFish(e), s = e.getComponent("Fish").id);
                        var o = cc.yqs.userMgr.userId, r = cc.yqs.userMgr.chairId, c = c, a = this.angle;
                        cc.yqs.gameMgr.send_user_fire(o, r, n, c, a, s), this.reduceCoin(cc.yqs.bulletMgr.getBulletMulti(this.CannonKind) * cc.yqs.gameMgr.sceneMulti);
                        if (cc.yqs.audioMgr.playSFX("common_fire.mp3"), cc.find("cannon", this.spr).getComponent(cc.Animation).play("cannon" + this.cannonId), this.powerBar.progress < 1) {
                            var h = cc.yqs.bulletMgr.getBulletMulti(this.CannonKind) / 3e3;
                            this.powerBar.progress += h, this.powerBar.progress >= 1 && !this.laser.active && this.showLasrTip()
                        } else this.powerBar.progress = 1;
                        return i
                    }
                }
            },
            addCoin: function (t) {
                var e = this._score;
                this._score = parseFloat(e) + parseFloat(t), this.CoinLabel.string = cc.yqs.utils.transString(parseFloat(this._score).toFixed(3)) + ":"
            },
            reduceCoin: function (t) {
                var e = this._score;
                this._score = parseFloat(e) - parseFloat(t), this.CoinLabel.string = cc.yqs.utils.transString(parseFloat(this._score).toFixed(3)) + ":"
            },
            getCannonKindByVip: function () {
                return { 0: 1, 1: 4, 2: 7, 3: 10, 4: 13, 5: 16, 6: 19 }[this.Vip] || 1
            },
            getBulletIdByCannonKind: function () {
                this.CannonKind
            },
            onAddClick: function () {
                console.log("=== ADD CLICK DEBUG ===");
                console.log("My chairId:", cc.yqs.userMgr.chairId);
                console.log("This chairId:", this.chairId);
                console.log("My userId:", cc.yqs.userMgr.userId);
                console.log("Can I click?", cc.yqs.userMgr.chairId == this.chairId);
                
                var t = this.getCannonKindByVip(), e = t + 2, n = this.CannonKind + 1 > e ? t : this.CannonKind + 1,
                    i = { userId: cc.yqs.userMgr.userId, chairId: cc.yqs.userMgr.chairId, cannonKind: n };
                console.log("Sending cannon change:", i);
                cc.yqs.net.send("user_change_cannon", i), this.onCannonChange(n)
            },
            onReduceClick: function () {
                var t = this.getCannonKindByVip(), e = t + 2, n = this.CannonKind - 1 > t - 1 ? this.CannonKind - 1 : e,
                    i = { userId: cc.yqs.userMgr.userId, chairId: cc.yqs.userMgr.chairId, cannonKind: n };
                cc.yqs.net.send("user_change_cannon", i), this.onCannonChange(n)
            },
            onCannonChange: function (t) {
                22 == t ? this.onCannonClick() : (this.CannonKind = t, this.setSceneMulti(), this.setCannon(this.CannonKind))
            },
            setAuto: function (t) {
                this.onAuto = t, this.fireToggle && (this.fireToggle.isChecked = t)
            },
            setLock: function (t) {
                if (!(t && 22 == this.cannonKind || (this.lockFish = t, this.lockToggle && this.lockToggle.node.active && (t && !this.lockToggle.isChecked ? this.lockToggle.isChecked = !0 : t && !this.lockToggle.isChecked || (this.lockToggle.isChecked = !1)), t))) for (var e = 1; e <= this.lockLinePoints.length; e++) this.lockLinePoints[e - 1].active && (this.lockLinePoints[e - 1].active = !1)
            },
            onAutoFireToggle: function (t) {
                this.onAuto = t.isChecked, t.isChecked ? (this.onUnLockFish(), this.onAutoFire()) : this.onAutoFire()
            },
            onLockToggle: function (t) {
                t.isChecked ? (this.fireToggle.isChecked && (this.fireToggle.isChecked = !1, this.onAuto = !1, this.onAutoFire()), this.node.addChild(this.round), this.round.setPosition(0, 0), this.round.getComponent(cc.Animation).play()) : this.onUnLockFish()
            },
            onFrazen: function () {
                if (cc.yqs.gameMgr.frozen) cc.yqs.alert.show("", "冷冻中"); else if (cc.yqs.gameMgr.formation) cc.yqs.alert.show("", "鱼阵不能冷冻"); else {
                    var t = { userId: cc.yqs.userMgr.userId, chairId: cc.yqs.userMgr.chairId };
                    cc.yqs.net.send("user_frozen", t), cc.yqs.gameMgr.onFrozenScene(), this.frozenCD.node.active = !0, this.frozenCD.progress = 1, this.frozenBtn.enabled = !1
                }
            },
            drawLockLine: function (t) {
                var e = cc.yqs.utils.convertPos(this.node, this.firePos, t);
                if (this.lockFish) for (var n = cc.yqs.mathutil.getAngleByPos(cc.p(0, 0), e), i = cc.pDistance(cc.p(0, 0), e) / 6, s = i * Math.cos(cc.yqs.mathutil.angle2radian(n)), o = i * Math.sin(cc.yqs.mathutil.angle2radian(n)), r = 1; r <= this.lockLinePoints.length; r++) this.lockLinePoints[r - 1].position = cc.p(s * r, o * r), this.lockLinePoints[r - 1].active || (this.lockLinePoints[r - 1].active = !0)
            },
            fireWithData: function (t) {
                var e = t.bulletKind, n = t.bulletId, i = t.angle, s = t.lockFishId;
                if (this.CannonKind != e && (this.CannonKind = e, this.setCannon(this.CannonKind)), 22 != this.CannonKind) {
                    if (!(this.fireTime < .15)) {
                        this.fireTime = 0, console.log("angle: " + i), this.spr.rotation = i, this.angle = i, this.reduceCoin(cc.yqs.bulletMgr.getBulletMulti(this.CannonKind) * cc.yqs.gameMgr.sceneMulti);
                        var o = cc.yqs.bulletMgr.createBulletWithCannon(this.chairId, this.CannonKind);
                        if (o) {
                            var r = o.getComponent("Bullet");
                            if (r.setBulletId(n), cc.yqs.bulletMgr.aliveBullet[n] = o, console.log("create bullet: " + n), s) {
                                var c = cc.yqs.fishMgr.getFishById(s);
                                c && r.setLockFish(c)
                            }
                            return cc.yqs.audioMgr.playSFX("common_fire.mp3"), cc.find("cannon", this.spr).getComponent(cc.Animation).play("cannon" + this.cannonId), o
                        }
                    }
                } else this.laserOnfire(i)
            },
            onCatchFish: function (t, e, n) {
                self = this, this.addCoin(e), this.lockFish && (this.setLock(null), this.onUnLockFish()), this.columnMgr && this.columnMgr.getComponent("GoldColimnManager") && this.columnMgr.getComponent("GoldColimnManager").pushScore(e, this.chairId);
                var i = n.kind, s = {
                    23: 3,
                    24: 3,
                    25: 3,
                    26: 3,
                    31: 3,
                    32: 3,
                    33: 3,
                    27: 1,
                    28: 1,
                    29: 1,
                    34: 1,
                    35: 1,
                    21: 1,
                    22: 1,
                    30: 2
                }[i] || 0;
                this.catchEffectByKind(s, e, i)
            },
            onCatchFishArray: function (t, e, n) {
                self = this;
                var i = [];
                if (i = e.split("-"), this.addCoin(t), this.lockFish && (this.setLock(null), this.onUnLockFish()), this.columnMgr && this.columnMgr.getComponent("GoldColimnManager") && this.columnMgr.getComponent("GoldColimnManager").pushScore(t, this.chairId), n) this.chairId != cc.yqs.userMgr.chairId && cc.yqs.bulletMgr.showBombPanel(t); else {
                    var s = cc.yqs.fishMgr.getFishById(i[0]);
                    if (s) {
                        var o = s.getComponent("Fish").kind, r = {
                            23: 3,
                            24: 3,
                            25: 3,
                            26: 3,
                            31: 3,
                            32: 3,
                            33: 3,
                            27: 1,
                            28: 1,
                            29: 1,
                            34: 1,
                            35: 1,
                            21: 1,
                            22: 1,
                            30: 2
                        }[o] || 0;
                        this.catchEffectByKind(r, t, o, i)
                    }
                }
            },
            catchEffectByKind: function (t, e, n, i) {
                switch (t) {
                    case 1:
                        this.showCatchPanel(n, e);
                        break;
                    case 2:
                        if (this.chairId != cc.yqs.userMgr.chairId) return;
                        cc.yqs.bulletMgr.showBombPanel(e);
                        break;
                    case 3:
                        cc.yqs.fishMgr.showLighting(i, this.chairId)
                }
            },
            showCatchPanel: function (t, e) {
                var n = this;
                this.rewardNode.active = !1;
                var i = function () {
                    n.rewardNode.getComponentInChildren(cc.Animation).stop(), n.rewardNode.active = !1
                };
                this.rewardNode.active = !0, this.rewardNode.getComponentInChildren(cc.Animation).play(), this.rewardNode.getComponent("RewardFish").playReward(t, e), this.unschedule(i), this.scheduleOnce(i, 1)
            },
            onAutoFire: function () {
                var t = this;
                this.schedule(function e() {
                    this.onAuto || t.unschedule(e), 22 != this.CannonKind && this.onFire()
                }, .16)
            },
            onLockFish: function (t, e) {
                if (this.onUnLockFish(), 22 != this.CannonKind && t) {
                    var n = t.getComponent("Fish");
                    if (null != n && (n.lockPos.active = !0, n.locked = !0), this.setLock(t), this.setAuto(!1), cc.yqs.bulletMgr.lockFish(this.chairId, t), e == cc.yqs.userMgr.userId) {
                        var i = t.getComponent("Fish") ? t.getComponent("Fish").id : 0,
                            s = { userId: cc.yqs.userMgr.userId, chairId: this.chairId, fishId: i };
                        cc.yqs.net.send("user_lock_fish", s), this.schedule(this.fireLock, .16)
                    }
                    this.node.addChild(this.round), this.round.setPosition(0, 0), this.round.getComponent(cc.Animation).play()
                }
            },
            fireLock: function () {
                var t = this.lockFish, e = t.getComponent("Fish");
                if (null != t && 0 != e.locked && 1 == e.status) {
                    var n = e.getLockedPosByPlayerId(this.chairId);
                    this.onFire(n, t)
                } else this.onUnLockFish()
            },
            onUnLockFish: function () {
                for (var t = 0; t < this.lockLinePoints.length; t++) this.lockLinePoints[t].active = !1;
                if (null != this.lockFish) {
                    var e = this.lockFish.getComponent("Fish");
                    null != e && e.onUnLock()
                }
                this.setLock(null), cc.yqs.bulletMgr.unLockFish(this.chairId), this.unschedule(this.fireLock), this.round.getComponent(cc.Animation).stop(), this.round.removeFromParent()
            },
            onStop: function () {
                this.unscheduleAllCallbacks()
            },
            update: function (t) {
                if (this.fireTime += t, this.frozenCD && this.frozenCD.node.active && (this.frozenCD.progress = this.frozenCD.progress - .05 * t, this.frozenCD.progress <= 0 && (this.frozenCD.node.active = !1, this.frozenBtn.enabled = !0)), this.lockFish) {
                    var e = this.lockFish.getComponent("Fish");
                    if (0 == e.locked || 1 != e.status) this.onUnLockFish(); else {
                        var n = e.getLockedPosByPlayerId(this.chairId);
                        this.drawLockLine(n)
                    }
                }
            },
            showLasrTip: function () {
                var t = this;
                if (this.chairId == cc.yqs.userMgr.chairId && this.powerBar.progress >= 1) {
                    this.laser.active = !0, this.laser.getComponent(cc.Animation).play();
                    this.laser.runAction(cc.sequence(cc.delayTime(5), cc.callFunc(function () {
                        t.laser.getComponent(cc.Animation).stop(), t.laser.active = !1
                    }))), this.spr.getComponent(cc.Button).enabled = !0
                }
            },
            onCannonClick: function () {
                console.log("=== CANNON CLICK DEBUG ===");
                console.log("My chairId:", cc.yqs.userMgr.chairId);
                console.log("This chairId:", this.chairId);
                console.log("PowerBar progress:", this.powerBar.progress);
                console.log("Current CannonKind:", this.CannonKind);
                console.log("Is my cannon?", this.chairId == cc.yqs.userMgr.chairId);
                console.log("Energy full?", this.powerBar.progress >= 1);
                console.log("Can activate laser?", this.chairId == cc.yqs.userMgr.chairId && this.powerBar.progress >= 1);
                
                var t = this;
                // Only allow laser activation on own cannon with full energy
                if (this.chairId == cc.yqs.userMgr.chairId && this.powerBar.progress >= 1 && (this.onUnLockFish(), 22 != this.CannonKind)) {
                    this.beforeId = this.CannonKind, this.CannonKind = 22;
                    var e = cc.find("cannon", this.spr);
                    this.onLasrmove = !0;
                    if (e && e.runAction(cc.sequence(cc.moveBy(2, cc.p(0, -130)), cc.callFunc(function () {
                        e.removeFromParent(), cc.yqs.nodepool.putCannonById(e, t.cannonId);
                        var n = cc.yqs.nodepool.getCannonById(22);
                        n.name = "cannon", t.spr.addChild(n), n.anchorY = 0, n.position = cc.p(0, -130), n.runAction(cc.sequence(cc.moveBy(2, cc.p(0, 130)), cc.callFunc(function () {
                            t.onLasrmove = !1
                        })))
                    }))), cc.yqs.userMgr.chairId == this.chairId) {
                        this.reduce.interactable = !1, this.add.interactable = !1, this.spr.getComponent(cc.Button).enabled = !1;
                        var n = {
                            userId: cc.yqs.userMgr.userId,
                            chairId: cc.yqs.userMgr.chairId,
                            cannonKind: this.CannonKind
                        };
                        cc.yqs.net.send("user_change_cannon", n)
                    }
                    this.schedule(function e() {
                        t.bulletLabel.string = --t.onescheduletime, 0 == t.onescheduletime && t.laserOnfire(t.angle), (t.onescheduletime <= 0 || 22 != t.CannonKind) && (t.unschedule(e), t.setSceneMulti(), t.onescheduletime = 30)
                    }, 1, 30, 3)
                }
            },
            laserOnfire: function (t) {
                var e = this;
                if (!this.onLasrmove && this.chairId == cc.yqs.userMgr.chairId && this.powerBar.progress >= 1 && this.CannonKind >= 22) {
                    this.powerBar.progress = 0, this.angle = t, this.spr.rotation = t;
                    var n = cc.yqs.bulletMgr.createLaserBulletWithCannon(this.chairId, this.CannonKind),
                        i = n.getComponent("Laser"), s = cc.find("cannon", this.spr);
                    if (s && s.runAction(cc.sequence(cc.delayTime(3), cc.moveBy(2, cc.p(0, -130)), cc.callFunc(function () {
                        e.onescheduletime = 31, n.removeFromParent(), cc.yqs.nodepool.putBulletById(n, i.type), e.CannonKind = e.beforeId, s.removeFromParent(), cc.yqs.nodepool.putCannonById(s, 22), e.onLasrmove = !0;
                        var t = cc.yqs.nodepool.getCannonById(e.CannonKind);
                        t.name = "cannon", e.spr.addChild(t), t.anchorY = 0, t.position = cc.p(0, -130), t.runAction(cc.sequence(cc.moveBy(2, cc.p(0, 130)), cc.callFunc(function () {
                            if (e.onLasrmove = !1, e.setSceneMulti(), cc.yqs.userMgr.chairId == e.chairId) {
                                var t = {
                                    userId: cc.yqs.userMgr.userId,
                                    chairId: cc.yqs.userMgr.chairId,
                                    cannonKind: e.CannonKind
                                };
                                cc.yqs.net.send("user_change_cannon", t)
                            }
                        })))
                    }))), this.chairId == cc.yqs.userMgr.chairId) {
                        this.reduce.interactable = !0, this.add.interactable = !0;
                        var o = cc.yqs.userMgr.userId, r = cc.yqs.userMgr.chairId, t = this.angle;
                        cc.yqs.gameMgr.send_user_fire(o, r, 22, 0, t)
                    }
                }
            },
            getNewItem: function () {
                var t = cc.instantiate(this.itemSprite);
                t.parent = this.node, t.position = cc.yqs.utils.convertPos(cc.yqs.fishMgr.node, this.node, cc.p(0, 0)), this.frozenBtn.node.runAction(cc.sequence(cc.scaleTo(.2, 1.2), cc.scaleTo(.2, 1), cc.scaleTo(.2, 1.2), cc.scaleTo(.2, 1))), t.runAction(cc.sequence(cc.moveTo(.5, cc.p(0, 0)), cc.callFunc(function () {
                    t.destroy()
                })))
            }
        }), cc._RF.pop()
    }, {}], Chat: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "7660bGk3ydGTY4xcs2ocvWa", "Chat"), cc.Class({
            extends: cc.Component,
            properties: {
                _chatRoot: null,
                _tabQuick: null,
                _tabEmoji: null,
                _iptChat: null,
                _quickChatInfo: null,
                _btnChat: null
            },
            onLoad: function () {
                null != cc.yqs && (cc.yqs.chat = this, this._btnChat = this.node.getChildByName("btn_chat"), this._btnChat.active = !0, this._chatRoot = this.node.getChildByName("chat"), this._chatRoot.active = !1, this._tabQuick = this._chatRoot.getChildByName("quickchatlist"), this._tabEmoji = this._chatRoot.getChildByName("emojis"), this._iptChat = this._chatRoot.getChildByName("iptChat").getComponent(cc.EditBox), this._quickChatInfo = {}, this._quickChatInfo.item0 = {
                    index: 0,
                    content: "快点啊，都等到我花儿都谢谢了！",
                    sound: "fix_msg_1.mp3"
                }, this._quickChatInfo.item1 = {
                    index: 1,
                    content: "怎么又断线了，网络怎么这么差啊！",
                    sound: "fix_msg_2.mp3"
                }, this._quickChatInfo.item2 = {
                    index: 2,
                    content: "不要走，决战到天亮！",
                    sound: "fix_msg_3.mp3"
                }, this._quickChatInfo.item3 = {
                    index: 3,
                    content: "你的牌打得也太好了！",
                    sound: "fix_msg_4.mp3"
                }, this._quickChatInfo.item4 = {
                    index: 4,
                    content: "你是妹妹还是哥哥啊？",
                    sound: "fix_msg_5.mp3"
                }, this._quickChatInfo.item5 = {
                    index: 5,
                    content: "和你合作真是太愉快了！",
                    sound: "fix_msg_6.mp3"
                }, this._quickChatInfo.item6 = {
                    index: 6,
                    content: "大家好，很高兴见到各位！",
                    sound: "fix_msg_7.mp3"
                }, this._quickChatInfo.item7 = {
                    index: 7,
                    content: "各位，真是不好意思，我得离开一会儿。",
                    sound: "fix_msg_8.mp3"
                }, this._quickChatInfo.item8 = { index: 8, content: "不要吵了，专心玩游戏吧！", sound: "fix_msg_9.mp3" })
            },
            getQuickChatInfo: function (t) {
                var e = "item" + t;
                return this._quickChatInfo[e]
            },
            onBtnChatClicked: function () {
                this._chatRoot.active = !0
            },
            onBgClicked: function () {
                this._chatRoot.active = !1
            },
            onTabClicked: function (t) {
                "tabQuick" == t.target.name ? (this._tabQuick.active = !0, this._tabEmoji.active = !1) : "tabEmoji" == t.target.name && (this._tabQuick.active = !1, this._tabEmoji.active = !0)
            },
            onQuickChatItemClicked: function (t) {
                this._chatRoot.active = !1;
                var e = this._quickChatInfo[t.target.name];
                cc.yqs.net.send("quick_chat", e.index)
            },
            onEmojiItemClicked: function (t) {
                console.log(t.target.name), this._chatRoot.active = !1, cc.yqs.net.send("emoji", t.target.name)
            },
            onBtnSendChatClicked: function () {
                this._chatRoot.active = !1, "" != this._iptChat.string && (cc.yqs.net.send("chat", this._iptChat.string), this._iptChat.string = "")
            }
        }), cc._RF.pop()
    }, {}], Coin: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "0bf4bJguA5LnJgFdxwfs7Ed", "Coin"), cc.Class({
            extends: cc.Component, properties: { kind: { default: 0, visible: !1 } }, onLoad: function () {
                this.scale = .5
            }, initWithKind: function (t, e, n) {
                if (null != e) {
                    this.node.parent = cc.yqs.fishMgr.node;
                    var i = 100 * Math.random() - 50;
                    this.node.position = cc.p(n.position.x + i, n.position.y), this.kind = t;
                    var s = cc.callFunc(this.putCoinToPool, this),
                        o = cc.yqs.roomMgr.getPlayerByIndex(e).getComponent("Cannon"),
                        r = cc.find("gemsBg", o.cannonPlatform), c = cc.find("gemsBg/moneyIcon", o.cannonPlatform),
                        a = cc.yqs.utils.convertPos(r, cc.yqs.fishMgr.node, c.position);
                    this.node.runAction(cc.sequence(cc.moveBy(.3, cc.p(0, 100)), cc.moveBy(.1, cc.p(0, -100)), cc.moveBy(.3, cc.p(0, 100)), cc.moveBy(.1, cc.p(0, -100)), cc.moveTo(.5, a), s))
                }
            }, bombplay: function (t, e) {
                this.kind = e, this.node.parent = cc.yqs.bulletMgr.node, this.node.position = cc.p(100 - 200 * Math.random(), 200), this.node.scale = .5;
                var n = cc.callFunc(this.putCoinToPool, this), i = 400 - 800 * Math.random(),
                    s = [cc.p(0, 200), t, cc.p(i, -700)], o = cc.bezierBy(5, s).easing(cc.easeCubicActionOut());
                this.node.runAction(cc.sequence(cc.spawn(o, cc.scaleTo(3, 2)), n))
            }, putCoinToPool: function () {
                var t = this;
                t.node.scale = 1, t.node.removeFromParent(), cc.yqs.nodepool.putCoinById(t.node, t.kind)
            }, getNode: function () {
                cc.find("Canvas/../..");
                var t = cc.yqs.roomMgr.getPlayerByIndex(chairId);
                cc.find("platform1/gemsBg/moneyIcon", t), t.getChi
            }
        }), cc._RF.pop()
    }, {}], CreateRole: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "c10a3UZn+RCH6iuE0b4wkvC", "CreateRole"), cc.Class({
            extends: cc.Component,
            properties: { inputName: cc.EditBox },
            onRandomBtnClicked: function () {
                var t = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17"],
                    e = ["50", "51", "52", "53", "54", "55", "56", "57", "58"],
                    n = Math.floor(Math.random() * (t.length - 1)), i = Math.floor(Math.random() * (e.length - 1));
                this.inputName.string = t[n] + e[i]
            },
            onLoad: function () {
                if (!cc.sys.isNative && cc.sys.isMobile) {
                    var t = this.node.getComponent(cc.Canvas);
                    t.fitHeight = !0, t.fitWidth = !0
                }
                this.onRandomBtnClicked(), this.onBtnConfirmClicked()
            },
            onBtnConfirmClicked: function () {
                var t = this.inputName.string;
                "" != t ? (console.log(t), cc.yqs.userMgr.create(t)) : console.log("invalid name.")
            }
        }), cc._RF.pop()
    }, {}], Demo: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "7d724rD4A5Mx4mTI7h9pWcr", "Demo"), cc.Class({
            extends: cc.Component,
            properties: { mainbg: cc.Sprite, fishpanel: cc.Sprite, shootpanel: cc.Sprite, richpanel: cc.Sprite },
            onLoad: function () {
                console.log("dasda")
            },
            geteixt: function () {
                console.log("nihao");
                var t = cc.scaleTo(.3, 0);
                this.mainbg.node.runAction(t)
            },
            gethelp: function () {
                var t = cc.scaleTo(.3, 1);
                this.mainbg.node.runAction(t)
            },
            getrichpanel: function (t) {
                t.isChecked && (this.richpanel.node.active = !0, this.shootpanel.node.active = !1, this.fishpanel.node.active = !1)
            },
            getfishpanel: function (t) {
                console.log(t), t.isChecked && (this.richpanel.node.active = !1, this.shootpanel.node.active = !1, this.fishpanel.node.active = !0)
            },
            getshootpanel: function (t) {
                t.isChecked && (this.richpanel.node.active = !0, this.shootpanel.node.active = !0, this.fishpanel.node.active = !1)
            },
            update: function (t) {
            }
        }), cc._RF.pop()
    }, {}], EasePack: [function (t, e, n) {
        (function (n) {
            "use strict";
            cc._RF.push(e, "e7f6cgm00BD+YX+UMK+VKca", "EasePack");
            var i = void 0 !== e && e.exports && void 0 !== n ? n : window;
            (i._gsQueue || (i._gsQueue = [])).push(function () {
                i._gsDefine("easing.Back", ["easing.Ease"], function (t) {
                    var e, n, s, o = i.GreenSockGlobals || i, r = o.com.greensock, c = 2 * Math.PI, a = Math.PI / 2,
                        h = r._class, l = function (e, n) {
                            var i = h("easing." + e, function () {
                            }, !0), s = i.prototype = new t;
                            return s.constructor = i, s.getRatio = n, i
                        }, u = t.register || function () {
                        }, f = function (t, e, n, i, s) {
                            var o = h("easing." + t, { easeOut: new e, easeIn: new n, easeInOut: new i }, !0);
                            return u(o, t), o
                        }, d = function (t, e, n) {
                            this.t = t, this.v = e, n && (this.next = n, n.prev = this, this.c = n.v - e, this.gap = n.t - t)
                        }, p = function (e, n) {
                            var i = h("easing." + e, function (t) {
                                this._p1 = t || 0 === t ? t : 1.70158, this._p2 = 1.525 * this._p1
                            }, !0), s = i.prototype = new t;
                            return s.constructor = i, s.getRatio = n, s.config = function (t) {
                                return new i(t)
                            }, i
                        }, g = f("Back", p("BackOut", function (t) {
                            return (t -= 1) * t * ((this._p1 + 1) * t + this._p1) + 1
                        }), p("BackIn", function (t) {
                            return t * t * ((this._p1 + 1) * t - this._p1)
                        }), p("BackInOut", function (t) {
                            return (t *= 2) < 1 ? .5 * t * t * ((this._p2 + 1) * t - this._p2) : .5 * ((t -= 2) * t * ((this._p2 + 1) * t + this._p2) + 2)
                        })), m = h("easing.SlowMo", function (t, e, n) {
                            e = e || 0 === e ? e : .7, null == t ? t = .7 : t > 1 && (t = 1), this._p = 1 !== t ? e : 0, this._p1 = (1 - t) / 2, this._p2 = t, this._p3 = this._p1 + this._p2, this._calcEnd = !0 === n
                        }, !0), y = m.prototype = new t;
                    return y.constructor = m, y.getRatio = function (t) {
                        var e = t + (.5 - t) * this._p;
                        return t < this._p1 ? this._calcEnd ? 1 - (t = 1 - t / this._p1) * t : e - (t = 1 - t / this._p1) * t * t * t * e : t > this._p3 ? this._calcEnd ? 1 - (t = (t - this._p3) / this._p1) * t : e + (t - e) * (t = (t - this._p3) / this._p1) * t * t * t : this._calcEnd ? 1 : e
                    }, m.ease = new m(.7, .7), y.config = m.config = function (t, e, n) {
                        return new m(t, e, n)
                    }, e = h("easing.SteppedEase", function (t) {
                        t = t || 1, this._p1 = 1 / t, this._p2 = t + 1
                    }, !0), y = e.prototype = new t, y.constructor = e, y.getRatio = function (t) {
                        return t < 0 ? t = 0 : t >= 1 && (t = .999999999), (this._p2 * t >> 0) * this._p1
                    }, y.config = e.config = function (t) {
                        return new e(t)
                    }, n = h("easing.RoughEase", function (e) {
                        for (var n, i, s, o, r, c, a = (e = e || {}).taper || "none", h = [], l = 0, u = 0 | (e.points || 20), f = u, p = !1 !== e.randomize, g = !0 === e.clamp, m = e.template instanceof t ? e.template : null, y = "number" == typeof e.strength ? .4 * e.strength : .4; --f > -1;) n = p ? Math.random() : 1 / u * f, i = m ? m.getRatio(n) : n, s = "none" === a ? y : "out" === a ? (o = 1 - n) * o * y : "in" === a ? n * n * y : n < .5 ? (o = 2 * n) * o * .5 * y : (o = 2 * (1 - n)) * o * .5 * y, p ? i += Math.random() * s - .5 * s : f % 2 ? i += .5 * s : i -= .5 * s, g && (i > 1 ? i = 1 : i < 0 && (i = 0)), h[l++] = {
                            x: n,
                            y: i
                        };
                        for (h.sort(function (t, e) {
                            return t.x - e.x
                        }), c = new d(1, 1, null), f = u; --f > -1;) r = h[f], c = new d(r.x, r.y, c);
                        this._prev = new d(0, 0, 0 !== c.t ? c : c.next)
                    }, !0), y = n.prototype = new t, y.constructor = n, y.getRatio = function (t) {
                        var e = this._prev;
                        if (t > e.t) {
                            for (; e.next && t >= e.t;) e = e.next;
                            e = e.prev
                        } else for (; e.prev && t <= e.t;) e = e.prev;
                        return this._prev = e, e.v + (t - e.t) / e.gap * e.c
                    }, y.config = function (t) {
                        return new n(t)
                    }, n.ease = new n, f("Bounce", l("BounceOut", function (t) {
                        return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375
                    }), l("BounceIn", function (t) {
                        return (t = 1 - t) < 1 / 2.75 ? 1 - 7.5625 * t * t : t < 2 / 2.75 ? 1 - (7.5625 * (t -= 1.5 / 2.75) * t + .75) : t < 2.5 / 2.75 ? 1 - (7.5625 * (t -= 2.25 / 2.75) * t + .9375) : 1 - (7.5625 * (t -= 2.625 / 2.75) * t + .984375)
                    }), l("BounceInOut", function (t) {
                        var e = t < .5;
                        return (t = e ? 1 - 2 * t : 2 * t - 1) < 1 / 2.75 ? t *= 7.5625 * t : t = t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375, e ? .5 * (1 - t) : .5 * t + .5
                    })), f("Circ", l("CircOut", function (t) {
                        return Math.sqrt(1 - (t -= 1) * t)
                    }), l("CircIn", function (t) {
                        return -(Math.sqrt(1 - t * t) - 1)
                    }), l("CircInOut", function (t) {
                        return (t *= 2) < 1 ? -.5 * (Math.sqrt(1 - t * t) - 1) : .5 * (Math.sqrt(1 - (t -= 2) * t) + 1)
                    })), s = function (e, n, i) {
                        var s = h("easing." + e, function (t, e) {
                            this._p1 = t >= 1 ? t : 1, this._p2 = (e || i) / (t < 1 ? t : 1), this._p3 = this._p2 / c * (Math.asin(1 / this._p1) || 0), this._p2 = c / this._p2
                        }, !0), o = s.prototype = new t;
                        return o.constructor = s, o.getRatio = n, o.config = function (t, e) {
                            return new s(t, e)
                        }, s
                    }, f("Elastic", s("ElasticOut", function (t) {
                        return this._p1 * Math.pow(2, -10 * t) * Math.sin((t - this._p3) * this._p2) + 1
                    }, .3), s("ElasticIn", function (t) {
                        return -this._p1 * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - this._p3) * this._p2)
                    }, .3), s("ElasticInOut", function (t) {
                        return (t *= 2) < 1 ? this._p1 * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - this._p3) * this._p2) * -.5 : this._p1 * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - this._p3) * this._p2) * .5 + 1
                    }, .45)), f("Expo", l("ExpoOut", function (t) {
                        return 1 - Math.pow(2, -10 * t)
                    }), l("ExpoIn", function (t) {
                        return Math.pow(2, 10 * (t - 1)) - .001
                    }), l("ExpoInOut", function (t) {
                        return (t *= 2) < 1 ? .5 * Math.pow(2, 10 * (t - 1)) : .5 * (2 - Math.pow(2, -10 * (t - 1)))
                    })), f("Sine", l("SineOut", function (t) {
                        return Math.sin(t * a)
                    }), l("SineIn", function (t) {
                        return 1 - Math.cos(t * a)
                    }), l("SineInOut", function (t) {
                        return -.5 * (Math.cos(Math.PI * t) - 1)
                    })), h("easing.EaseLookup", {
                        find: function (e) {
                            return t.map[e]
                        }
                    }, !0), u(o.SlowMo, "SlowMo", "ease,"), u(n, "RoughEase", "ease,"), u(e, "SteppedEase", "ease,"), g
                }, !0)
            }), i._gsDefine && i._gsQueue.pop()(), function () {
                var n = function () {
                    return i.GreenSockGlobals || i
                };
                "function" == typeof define && define.amd ? define(["TweenLite"], n) : void 0 !== e && e.exports && (t("../TweenLite.js"), e.exports = n())
            }(), cc._RF.pop()
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, { "../TweenLite.js": "TweenLite" }], EmailWin: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "48461WdWYBIvLwsG/PXcMZ/", "EmailWin"), cc.Class({
            extends: cc.Component,
            properties: { commonBg: cc.Node },
            onLoad: function () {
            },
            onEnable: function () {
                this.commonBg.scale = .2;
                var t = cc.scaleTo(.2, 1.2), e = cc.scaleTo(.1, 1);
                this.commonBg.runAction(cc.sequence(t, e))
            },
            onBack: function () {
                var t = cc.scaleTo(.1, 1.2), e = cc.scaleTo(.2, .6), n = cc.callFunc(function () {
                    this.node.active = !1
                }, this);
                this.commonBg.runAction(cc.sequence(t, e, n))
            },
            onBtnClicked: function () {
                this.node.getChildByName("emilpanel").active = !0
            },
            obtnBackOfep: function () {
                cc.find("Canvas/emil/emilpanel/btn_back");
                this.node.getChildByName("emilpanel").active = !1
            }
        }), cc._RF.pop()
    }, {}], EventCenter: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "3e314bgJYBN1YV/ct9Rpw4G", "EventCenter");
        cc.Class({
            start: function () {
                cc.game.addPersistRootNode(this.node)
            }, statics: {
                init: function () {
                    this.dispatchEvent = cc.game.dispatchEvent
                }, addEvent: function (t, e, n) {
                    cc.director.on(e, n, t, !0)
                }, removeEvent: function (t, e, n) {
                    cc.director.off(e, n, t, !0)
                }, emitCustomEvent: function (t, e) {
                    var n = new cc.Event.EventCustom(t, e);
                    n.setUserData(e), cc.director.dispatchEvent(n)
                }
            }
        });
        cc._RF.pop()
    }, {}], FishGameMananger: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "d377bIBXjpGg44yErcgMSyQ", "FishGameMananger");
        var i = t("crypto");
        t("TweenLite"), t("TimelineLite");
        cc.Class({
            extends: cc.Component,
            properties: {
                mainSceneBg: cc.Sprite,
                tempSceneBg: cc.Node,
                frozenSceneBg: cc.Sprite,
                mouse: cc.Prefab,
                bgs: { default: [], type: [cc.SpriteFrame] },
                frozenBgs: { default: [], type: [cc.SpriteFrame] }
            },
            start: function () {
            },
            tweenTest: function () {
                var t = cc.scaleTo(.3, 1.1, 1.1).easing(cc.easeBounceInOut(.2)),
                    e = cc.scaleTo(.3, 1, 1).easing(cc.easeBackInOut(.2)), n = cc.sequence(t, e);
                this.mainSceneBg.node.runAction(n)
            },
            onLoad: function () {
                cc.yqs.gameMgr = this, this.initCollision(), cc.yqs.audioMgr.playBGM("bgm2.mp3"), this.sceneId = 0, this.frozen = !1, this.frozenTime = 10, this.formation = !1, this.sceneMulti = .001
            },
            initCollision: function () {
                var t = cc.director.getCollisionManager();
                t.enabled = !0, t.enabledDebugDraw = !1
            },
            onEnable: function () {
                this.initCollision()
            },
            onDisable: function () {
            },
            onChangeScene: function () {
                var t = this, e = cc.find("Canvas/FishBg");
                if (e) {
                    var n = e.getComponent("FishManager");
                    n && n.onChangeScene()
                }
                this.tempSceneBg.width = 0;
                var i = cc.find("water", this.tempSceneBg);
                i.active = !0, this.frozenSceneBg.spriteFrame = this.frozenBgs[this.sceneId];
                var s = !1;
                this.schedule(function () {
                    s || (t.tempSceneBg.width = t.tempSceneBg.width + 20, t.tempSceneBg.width >= 1280 && (s = !0, cc.yqs.audioMgr.playBGM("bgm3.mp3"), t.mainSceneBg.spriteFrame = cc.find("tempSceneFrame", t.tempSceneBg).getComponent(cc.Sprite).spriteFrame, t.sceneId = (t.sceneId + 1) % t.bgs.length, t.tempSceneBg.width = 0, i.x = 65, i.active = !1, cc.find("tempSceneFrame", t.tempSceneBg).getComponent(cc.Sprite).spriteFrame = t.bgs[(t.sceneId + 1) % t.bgs.length]))
                }, .03, 150)
            },
            onFrozenScene: function (t) {
                var e = this;
                this.frozen = !0, this.frozenTime = t ? t / 1e3 : 10, this.frozenSceneBg.node.active = !0, this.frozenSceneBg.spriteFrame = this.frozenBgs[this.sceneId];
                var n = cc.find("Canvas/FishBg");
                if (n) {
                    var i = n.getComponent("FishManager");
                    i && i.onFrezenScene()
                }
                this.scheduleOnce(function () {
                    e.frozen = !1, e.frozenSceneBg.node.active = !1
                }, this.frozenTime)
            },
            onCatchFish: function (t, e, n, i) {
                var s = n.getComponent("Fish");
                null != s && s.onCatche(t);
                var o = s.kind;
                if (o >= 15 && o <= 20) {
                    var r = cc.yqs.fishMgr.getMinFishplay();
                    cc.yqs.fishMgr.node.addChild(r), r.setPosition(n.position), r.getComponent(cc.Animation).play(), this.effectShake(), this.node.runAction(cc.sequence(cc.delayTime(.2), cc.callFunc(function () {
                        r.getComponent(cc.Animation).stop(), r.removeFromParent()
                    })))
                } else if (o > 20) {
                    var c = cc.yqs.fishMgr.getMaxFishplay();
                    cc.yqs.fishMgr.node.addChild(c), c.setPosition(n.position), c.getComponent(cc.Animation).play(), this.effectShake(), this.node.runAction(cc.sequence(cc.delayTime(.2), cc.callFunc(function () {
                        c.getComponent(cc.Animation).stop(), c.removeFromParent()
                    })))
                }
                var a = cc.yqs.roomMgr.getPlayerByIndex(t);
                if (null != a) {
                    var h = a.getComponent("Cannon");
                    null != h && h.onCatchFish(e, i, s)
                }
                cc.yqs.audioMgr.playSFX("SilverCoin.mp3");
                var l = cc.yqs.nodepool.getCoinTextById(1).getComponent("coinText");
                i = parseFloat(i).toFixed(3), null != l && l.initWithKind(1, "+" + i, n)
            },
            onCatchFishArray: function (t, e, n, i) {
                var s = cc.yqs.roomMgr.getPlayerByIndex(t);
                if (null != s) {
                    var o = s.getComponent("Cannon");
                    if (null != o) {
                        var r = e.join("-");
                        o.onCatchFishArray(n, r, i)
                    }
                }
                cc.yqs.audioMgr.playSFX("SilverCoin.mp3"), cc.yqs.fishMgr.onCatchFishArray(e, t)
            },
            onLockFish: function (t, e) {
                var n = cc.yqs.roomMgr.getPlayerByIndex(t);
                if (null != n) {
                    var i = n.getComponent("Cannon");
                    if (null != i) {
                        var s = cc.yqs.fishMgr.getFishById(e);
                        if (!s) return;
                        i.onLockFish(s, -1)
                    }
                }
            },
            onStop: function () {
                for (var t = 0; t < cc.yqs.roomMgr.Seats.length; t++) {
                    var e = cc.yqs.roomMgr.Seats[t];
                    e && e.getComponent("Cannon") && e.getComponent("Cannon").onStop()
                }
            },
            effectBmbo: function () {
            },
            effectAllFish: function () {
            },
            effectShake: function () {
                cc.find("Canvas/bg").runAction(cc.sequence(cc.moveTo(cc.p(.05, 25, 25)), cc.moveTo(.05, cc.p(-25, -25)), cc.moveTo(.05, cc.p(0, 0))))
            },
            germousr: function () {
                return cc.instantiate(this.mouse)
            },
            playmouse: function (t) {
                var e = cc.instantiate(this.mouse);
                this.node.addChild(e), e.setPosition(t), e.getComponent(cc.Animation).play(), e.runAction(cc.sequence(cc.delayTime(.5), cc.callFunc(function () {
                    e.getComponent(cc.Animation).play(), e.removeFromParent()
                })))
            },
            send_user_fire: function (t, e, n, s, o, r) {
                var c = { userId: t, chairId: e, bulletKind: n, bulletId: s, angle: o, lockFishId: r };
                c.sign = i.md5(t + e + n + s + o + r), cc.yqs.net.send("user_fire", c)
            },
            send_catch_fish: function (t, e, n, s) {
                var o = { userId: t, chairId: e, bulletId: n, fishId: s };
                o.sign = i.md5(t + e + n + s), cc.yqs.net.send("catch_fish", o)
            },
            send_laser_catch_fish: function (t, e, n) {
                var s = { userId: t, chairId: e, fishes: n.join("-") };
                s.sign = i.md5(t + e + s.fishes), cc.yqs.net.send("laser_catch_fish", s)
            }
        }), cc._RF.pop()
    }, { TimelineLite: "TimelineLite", TweenLite: "TweenLite", crypto: "crypto" }], FishManager: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "b4cc9j2qKdHbZS9jQwB03b2", "FishManager"), cc.Class({
            extends: cc.Component,
            properties: {
                Pools: cc.Node,
                minFishplay: { default: null, type: cc.Prefab },
                maxFishplay: { default: null, type: cc.Prefab },
                arrayRunning: { default: !1, visible: !1 }
            },
            onLoad: function () {
                cc.yqs.fishMgr = this, this.aliveFish = {}, this.initNodePool()
            },
            getMinFishplay: function () {
                return cc.instantiate(this.minFishplay)
            },
            getMaxFishplay: function () {
                return cc.instantiate(this.maxFishplay)
            },
            initNodePool: function () {
                this.Pools.visible = !0;
                var t = this.Pools.getComponent("NodePoolManager");
                cc.yqs.nodepool = t, null != cc.yqs.nodepool && cc.yqs.nodepool.InitPool()
            },
            onEnable: function () {
                cc.yqs.eventCenter.addEvent(this, "build_fish", this.activeFish), cc.yqs.eventCenter.addEvent(this, "build_fishArray_reply", this.fishArrayStart)
            },
            onDisable: function () {
                cc.yqs.eventCenter.removeEvent(this, "build_fish", this.activeFish), cc.yqs.eventCenter.removeEvent(this, "build_fishArray_reply", this.fishArrayStart)
            },
            activeFish: function (t) {
                if (!cc.yqs.gameMgr.frozen) for (var e = 0; e < t.detail.length; e++) {
                    var n = t.detail[e], i = n.fishKind;
                    i >= 35 && cc.yqs.roomMgr.showKingCome();
                    var s = n.trace, o = n.fishId, r = n.speed;
                    if (!this.aliveFish.hasOwnProperty(o)) {
                        var c = cc.yqs.nodepool.getFishById(i);
                        this.node.addChild(c, 100), c.setPosition(cc.v2(-1e3, -1e3));
                        var a = c.getComponent("Fish");
                        a.setFishId(o), a.setFishSpeed(r), a.initWithTrackId(s, i), this.aliveFish[o] = c
                    }
                }
            },
            getFishById: function (t) {
                return this.aliveFish[t] ? this.aliveFish[t] : null
            },
            destroyFish: function (t) {
                if (this.aliveFish[t]) {
                    var e = this.aliveFish[t], n = e.getComponent("Fish");
                    e.removeFromParent(), cc.yqs.nodepool.putFishById(e, n.kind), delete this.aliveFish[t]
                } else console.log("no Fish: " + t)
            },
            getAliveFish: function () {
                for (var t = [], e = 0; e < this.node.children.length; e++) {
                    var n = this.node.children[e];
                    if (n) {
                        var i = n.getComponent("Fish");
                        i && 2 != i.status && t.push(n)
                    }
                }
                return t
            },
            onStop: function () {
                this.unscheduleAllCallbacks();
                for (var t = this.node.children.length - 1; t >= 0; t--) {
                    var e = this.node.children[t];
                    if (e) {
                        var n = e.getComponent("Fish");
                        n && n.putFishToPool()
                    }
                }
            },
            fishArrayStart: function (t) {
                switch (cc.yqs.gameMgr.formation = !0, cc.yqs.roomMgr.showArrayCome(), (t = t.detail).formationKind) {
                    case 1:
                        this.showfishArray1(t.fishArray);
                        break;
                    case 2:
                        this.showfishArray2(t.fishArray);
                        break;
                    case 3:
                        this.showfishArray3(t.fishArray)
                }
            },
            fishArrayEnd: function () {
                cc.yqs.gameMgr.formation = !1
            },
            showfishArray1: function (t) {
                var e = 0, n = cc.yqs.mathutil.BulidLine(cc.p(700, 200), cc.p(-800, 200)),
                    i = cc.yqs.mathutil.BulidLine(cc.p(-700, -200), cc.p(800, -200)), s = function () {
                        if (!cc.yqs.gameMgr.frozen) {
                            var n = t[1][e], s = n.fishKind, o = cc.yqs.nodepool.getFishById(s);
                            this.node.addChild(o, 100), o.setPosition(i.pos), o.rotation = i.angle;
                            var r = o.getComponent("Fish");
                            r.InitWithAngle(i.angle, s), r.setFishId(n.fishId), this.aliveFish[n.fishId] = o
                        }
                    };
                this.schedule(function i() {
                    if (!cc.yqs.gameMgr.frozen) {
                        if (30 == ++e) return this.unschedule(i), this.unschedule(s), void this.scheduleOnce(this.fishArrayEnd, 10);
                        var o = t[0][e], r = o.fishKind, c = cc.yqs.nodepool.getFishById(r);
                        this.node.addChild(c, 100), c.setPosition(n.pos), c.rotation = n.angle;
                        var a = c.getComponent("Fish");
                        a.InitWithAngle(n.angle, r), a.setFishId(o.fishId), e > 20 && console.log("fishId:: " + o.fishId), this.aliveFish[o.fishId] = c
                    }
                }, 2, 1e3, 3), this.schedule(s, 2, 1e3, 3)
            },
            showfishArray2: function (t) {
                t.length;
                var e = [];
                e = cc.yqs.mathutil.BuildCircle(cc.p(0), 1, 20);
                var n = 0;
                this.schedule(function i() {
                    if (!(cc.yqs.gameMgr.frozen || e.length <= 0)) {
                        for (var s = e.slice(), o = t[n], r = 0; r < o.length; r++) {
                            var c = cc.yqs.nodepool.getFishById(o[r].fishKind);
                            this.node.addChild(c, 100), c.setPosition(s[r].pos), c.rotation = s[r].angle;
                            var a = c.getComponent("Fish");
                            a.InitWithAngle(s[r].angle, o[r].fishKind), a.setFishId(o[r].fishId), this.aliveFish[o[r].fishId] = c, console.log("fishId: " + o[r].fishId)
                        }
                        ++n == t.length && (this.unschedule(i), this.scheduleOnce(this.fishArrayEnd, 10))
                    }
                }, 5, 1e3, 3)
            },
            showfishArray3: function (t) {
                var e = 0, n = [], i = [], s = cc.p(0, 0), o = Math.PI, r = 2 * Math.PI, c = 4 * Math.PI;
                n = cc.yqs.mathutil.BuildSpiral(s, o, c, 800), i = cc.yqs.mathutil.BuildSpiral(s, r, c, 800);
                var a = function () {
                    if (!cc.yqs.gameMgr.frozen && i && !(i.length <= 0)) {
                        var n = t[1][e];
                        e++;
                        var o = i.slice(), r = n.fishKind, c = cc.yqs.nodepool.getFishById(r);
                        this.node.addChild(c, 100), c.setPosition(s), c.rotation = o[1].angle;
                        var a = c.getComponent("Fish");
                        a.InitWithTrackPos(o, r), a.setFishId(n.fishId), this.aliveFish[n.fishId] = c
                    }
                };
                this.schedule(function i() {
                    if (!cc.yqs.gameMgr.frozen && n && !(n.length <= 0)) {
                        e == t[0].length - 1 && (this.unschedule(i), this.unschedule(a), this.scheduleOnce(this.fishArrayEnd, 10));
                        var o = n.slice(), r = t[0][e], c = r.fishKind, h = cc.yqs.nodepool.getFishById(c);
                        this.node.addChild(h, 100), h.setPosition(s), h.rotation = o[1].angle;
                        var l = h.getComponent("Fish");
                        l.InitWithTrackPos(o, c), l.setFishId(r.fishId), this.aliveFish[r.fishId] = h
                    }
                }, 1, 1e3, 3), this.schedule(a, 1, 1e3, 3)
            },
            onChangeScene: function () {
                this.unscheduleAllCallbacks();
                for (var t = this.getAliveFish(), e = 0; e < t.length; e++) {
                    var n = t[e].getComponent("Fish");
                    n && n.onChangeScene()
                }
            },
            onFrezenScene: function () {
                for (var t = this.getAliveFish(), e = 0; e < t.length; e++) {
                    var n = t[e].getComponent("Fish");
                    n && n.onFrezenScene()
                }
            },
            onCatchFishArray: function (t, e) {
                for (var n = 0; n < t.length; n++) {
                    var i = t[n], s = this.getFishById(i);
                    if (s) if (cc.yqs.utils.getOutOfView(s)) this.destroyFish(i); else {
                        var o = s.getComponent("Fish");
                        o && o.onCatche(e)
                    }
                }
            },
            showLighting: function (t, e) {
                var n = [], i = [], s = this.getFishById(t[0]);
                if (s) {
                    n.push(s.getPosition());
                    for (var o = 1; o < t.length; o++) {
                        f = t[o];
                        if (d = this.getFishById(f)) {
                            var r = d.getPosition();
                            n.push(r)
                        }
                    }
                    for (var c = 1; c < n.length; c++) {
                        var a = cc.yqs.bulletMgr.getBolt();
                        a.setPosition(n[0]), this.node.addChild(a);
                        var h = -1 * cc.yqs.mathutil.getAngleByPos(n[0], n[c]), l = cc.pDistance(n[0], n[c]) / 730;
                        a.scaleX = l, a.rotation = h, a.getComponent(cc.Animation).play("bolt"), i.push(a)
                    }
                    this.node.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function () {
                        for (var t = 0; t < i.length; t++) i[t].getComponent(cc.Animation).stop(), i[t].removeFromParent(), i[t].destroy()
                    })));
                    for (var u = 1; u < t.length; u++) {
                        var f = t[u], d = this.getFishById(f);
                        if (d) {
                            var p = d.getComponent("Fish");
                            p && p.onCatche(e)
                        }
                    }
                }
            },
            getFishMultiById: function (t) {
                return {
                    1: 2,
                    2: 2,
                    3: 3,
                    4: 4,
                    5: 5,
                    6: 5,
                    7: 6,
                    8: 7,
                    9: 8,
                    10: 9,
                    11: 10,
                    12: 11,
                    13: 12,
                    14: 18,
                    15: 25,
                    16: 30,
                    17: 35,
                    18: 40,
                    19: 45,
                    20: 50,
                    21: 80,
                    22: 100,
                    23: 45,
                    24: 45,
                    25: 45,
                    26: 45,
                    27: 50,
                    28: 60,
                    29: 70,
                    30: 100,
                    31: 110,
                    32: 110,
                    33: 110,
                    34: 120,
                    35: 200
                }[t]
            }
        }), cc._RF.pop()
    }, {}], Fish: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "41aa4RANDlBg77lBFLsc9ft", "Fish");
        var i = cc.Enum({ idel: 0, swim: 1, caught: 2 });
        cc.Class({
            extends: cc.Component, properties: { lockPos: cc.Node }, onLoad: function () {
                this.id = 0, this.kind = 0, this.scoreMulti = 0, this.path = [], this.time = .1, this.index = 0, this.status = i.idel, this.locked = !1, this.isMoveWithAngle = !1, this.speed = 5, this.doMove(), this.locked = !1, this.isMoveWithAngle = !1, this.node.color = cc.color(255, 255, 255, 255)
            }, setFishId: function (t) {
                this.id = t
            }, setFishSpeed: function (t) {
            }, initWithTrackId: function (t, e) {
                this.kind = e, this.scoreMulti = cc.yqs.fishMgr.getFishMultiById(this.kind), this.isMoveWithAngle = !1, this.doMove();
                for (var n = [], i = 0; i < t.length; i++) {
                    s = cc.p(t[i][0], t[i][1]);
                    cc.yqs.mathutil.TransPos(s), n.push(s)
                }
                if (null != n && n.length > 1) if (n.length > 2) this.path = cc.yqs.mathutil.BuildBezier(n, 1e3); else {
                    var s = cc.yqs.mathutil.BulidLine(n[0], n[1]);
                    this.node.setPosition(s.pos), this.InitWithAngle(s.angle, e)
                }
            }, InitWithAngle: function (t, e) {
                this.kind = e, this.scoreMulti = cc.yqs.fishMgr.getFishMultiById(this.kind), this.isMoveWithAngle = !0, this.doMove(), this.node.rotation = t;
                var n = cc.yqs.mathutil.angle2radian(-1 * t), i = 2e3 * Math.cos(n), s = 2e3 * Math.sin(n),
                    o = cc.moveBy(150 / this.speed, cc.p(i, s));
                this.node.runAction(cc.sequence(o, cc.callFunc(function () {
                    this.putFishToPool()
                }, this)))
            }, InitWithTrackPos: function (t, e) {
                this.kind = e, this.scoreMulti = cc.yqs.fishMgr.getFishMultiById(this.kind), this.isMoveWithAngle = !1, this.doMove(), null != t && t.length > 1 && (this.path = t)
            }, doMove: function () {
                this.status = i.swim, this.node.getComponent(cc.Animation).play(this.node._name + "move")
            }, doDie: function () {
                this.status = i.caught, this.node.stopAllActions(), this.node.color = cc.color(255, 255, 255, 255), this.node.getComponent(cc.Animation).play(this.node._name + "die")
            }, putFishToPool: function () {
                this.node.stopAllActions();
                var t = this.node.getComponent(cc.Animation);
                t && t.stop(), cc.yqs.fishMgr.getFishById(this.id) ? cc.yqs.fishMgr.destroyFish(this.id) : this.node.removeFromParent(!0)
            }, onCatche: function (t) {
                var e = this;
                if (this.status = i.caught, this.kind >= 10 && this.kind < 18 || this.kind >= 20 && this.kind < 28) {
                    n = "fish1" + this.kind % 10 + "_1.mp3";
                    cc.yqs.audioMgr.playSFX(n)
                } else if (this.kind > 27) {
                    var n = "SuperBomb.mp3";
                    cc.yqs.audioMgr.playSFX(n)
                }
                if (cc.yqs.utils.getOutOfView(this.node)); else if (cc.yqs.roomMgr.getPlayerByIndex(t)) {
                    var s = cc.yqs.fishMgr.getFishMultiById(this.kind), o = 2;
                    s > 2 && s <= 5 && (o = 4), s > 5 && s <= 8 && (o = 6), s > 8 && s <= 12 && (o = 8), s > 12 && (o = 10);
                    this.schedule(function () {
                        var n = t == cc.yqs.userMgr.chairId ? 2 : 1,
                            i = cc.yqs.nodepool.getCoinById(n).getComponent("Coin");
                        null != i && i.initWithKind(n, t, e.node)
                    }, .05, o)
                }
                var r = this.node.getComponent(cc.BoxCollider);
                null != r && (r.enable = !1), this.doDie()
            }, getLockedPosByPlayerId: function (t) {
                return null == t && (t = cc.yqs.userMgr.chairId), cc.yqs.utils.convertPos(this.lockPos, cc.yqs.roomMgr.getPlayerByIndex(t), cc.p(0, 0))
            }, onLocked: function () {
                if (!this.locked) {
                    var t = cc.yqs.userMgr.chairId;
                    this.lockPos.active = !0;
                    var e = cc.yqs.roomMgr.getPlayerByIndex(t);
                    if (null != e) {
                        var n = e.getComponent("Cannon");
                        null != n && n.onLockFish(this.node, cc.yqs.userMgr.userId)
                    }
                }
            }, onUnLock: function () {
                this.locked = !1, this.lockPos.active = !1
            }, onChangeScene: function () {
                if (this.node.stopAllActions(), this.status == i.swim) {
                    this.isMoveWithAngle = !0;
                    var t = cc.yqs.mathutil.angle2radian(-1 * this.node.rotation), e = 1800 * Math.cos(t),
                        n = 1800 * Math.sin(t), s = cc.moveBy(2, cc.p(e, n));
                    this.node.runAction(cc.sequence(s, cc.callFunc(function () {
                        this.putFishToPool()
                    }, this)))
                }
            }, onFrezenScene: function () {
                var t = this, e = this.node.getComponent(cc.Animation);
                e && e.pause(), this.node.stopAllActions(), this.scheduleOnce(function () {
                    e && e.resume(), 1 == t.isMoveWithAngle && t.InitWithAngle(t.node.rotation, t.kind)
                }, cc.yqs.gameMgr.frozenTime)
            }, onCollisionEnter: function (t, e) {
                if ("bullet" == t.node.group) {
                    var n = t.getComponent("Bullet");
                    if (!n) return;
                    if (n.lockFish) {
                        var s = n.lockFish.getComponent("Fish");
                        if (s && s.id != this.id) return
                    }
                    if (this.status != i.swim) return;
                    if (n && 1 == n.status && n.playWeb(), n.chairId == cc.yqs.userMgr.chairId) {
                        var o = cc.yqs.userMgr.userId, r = cc.yqs.userMgr.chairId, c = n.id, a = this.id;
                        cc.yqs.gameMgr.send_catch_fish(o, r, c, a)
                    }
                    var h = cc.tintBy(.2, -127, -255, -127);
                    e.node.runAction(cc.sequence(h, cc.callFunc(function () {
                        e.node.color = new cc.Color(255, 255, 255)
                    }, this)))
                } else "wallV" != t.node.group && "wallH" != t.node.group || 1 == this.locked && this.onUnLock()
            }, onCollisionExit: function (t, e) {
                if ("wallV" == t.node.group || "wallH" == t.node.group) {
                    cc.view.getVisibleOrigin();
                    var n = cc.view.getVisibleSize(), i = e.node.position;
                    if (i.x < 0 - n.width / 2 || i.y < 0 - n.height / 2 || i.x > n.width / 2 || i.y > n.height / 2) {
                        this.locked = !1;
                        var s = { fishId: this.id };
                        cc.yqs.net.send("fish_out", s), this.putFishToPool()
                    }
                }
            }, update: function (t) {
                this.updatePosition(t)
            }, updatePosition: function (t) {
                if (!(cc.yqs.gameMgr.frozen || 1 == this.isMoveWithAngle || (this.time = this.time + t, this.time < .15 / this.speed || (this.time = 0, this.path.length <= 0 || this.status == i.caught)))) {
                    if (this.index >= this.path.length) return this.node.stopAllActions(), void this.InitWithAngle(this.node.rotation, this.kind);
                    this.node.position = cc.v2(this.path[this.index].pos.x, this.path[this.index].pos.y), this.node.rotation = this.path[this.index].angle, console.log("pos: " + this.index + "(" + this.path[this.index].pos.x + " , " + this.path[this.index].pos.y + ")"), console.log("angle: " + this.path[this.index].angle), this.index++
                }
            }, onEnable: function () {
                this.status = i.swim, this.locked = !1, this.lockPos.active = !1;
                var t = this.node.getComponent(cc.BoxCollider);
                null != t && (t.enable = !0), this.index = 0
            }, onDisable: function () {
                this.status = i.idel, this.locked = !1, this.index = 0, this.path.splice(0, this.path.length), this.unscheduleAllCallbacks()
            }
        }), cc._RF.pop()
    }, {}], GameNetMgr: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "a293578d6FJgonO364JAa+U", "GameNetMgr"), cc.Class({
            extends: cc.Component,
            properties: {
                dataEventHandler: null,
                roomId: null,
                maxNumOfGames: 0,
                numOfGames: 0,
                seatIndex: -1,
                seats: null,
                gamestate: "",
                isOver: !1,
                dissoveData: null
            },
            reset: function () {
                this.gamestate = "";
                for (var t = 0; t < this.seats.length; ++t) this.seats[t].ready = !1, this.seats[t].userId = 0, this.seats[t].score = 0, this.seats[t].name = "", this.seats[t].seatIndex = t, this.seats[t].vip = 0, this.seats[t].bullet = 0, this.seats[t].power = 0
            },
            clear: function () {
                this.dataEventHandler = null, null == this.isOver && (this.seats = null, this.roomId = null, this.maxNumOfGames = 0, this.numOfGames = 0)
            },
            dispatchEvent: function (t, e) {
                this.dataEventHandler && this.dataEventHandler.emit(t, e)
            },
            getSeatIndexByID: function (t) {
                for (var e = 0; e < this.seats.length; ++e) if (this.seats[e].userId == t) return e;
                return -1
            },
            isOwner: function () {
                return 0 == this.seatIndex
            },
            getSeatByID: function (t) {
                var e = this.getSeatIndexByID(t);
                return this.seats[e]
            },
            getSelfData: function () {
                return this.seats[this.seatIndex]
            },
            getLocalIndex: function (t) {
                return t
            },
            prepareReplay: function (t, e) {
                this.roomId = t.id, this.seats = t.seats, this.turn = e.base_info.button;
                for (var n = e.base_info, i = 0; i < this.seats.length; ++i) {
                    var s = this.seats[i];
                    s.seatindex = i, s.score = null, s.holds = n.game_seats[i], s.pengs = [], s.angangs = [], s.diangangs = [], s.wangangs = [], s.folds = [], cc.yqs.userMgr.userId == s.userid && (this.seatIndex = i)
                }
                this.conf = { type: n.type }, null == this.conf.type && this.conf.type
            },
            initHandlers: function () {
                var t = this;
                cc.yqs.net.addHandler("login_result", function (e) {
                    if (cc.log("login_result: " + e), 0 === e.errcode) {
                        var e = e.data;
                        console.log("=== LOGIN_RESULT DEBUG ===");
                        console.log("My userId:", cc.yqs.userMgr.userId);
                        console.log("Seats data:", JSON.stringify(e.seats));
                        
                        t.roomId = e.roomId, t.conf = e.conf, t.maxNumOfGames = e.conf.maxGames, t.numOfGames = e.numofgames, t.seats = e.seats, t.seatIndex = t.getSeatIndexByID(cc.yqs.userMgr.userId), t.isOver = !1, cc.yqs.userMgr.roomId = e.roomId;
                        
                        console.log("getSeatIndexByID result:", t.seatIndex);
                        
                        // Set chairId based on seats data
                        var foundSeat = false;
                        for (var n = 0; n < e.seats.length; ++n) {
                            console.log("Comparing seat[" + n + "].userId:", e.seats[n].userId, "with my userId:", cc.yqs.userMgr.userId);
                            if (e.seats[n].userId == cc.yqs.userMgr.userId) {
                                cc.yqs.userMgr.chairId = e.seats[n].seatIndex + 1;
                                console.log("FOUND MY SEAT! Set chairId to:", cc.yqs.userMgr.chairId);
                                foundSeat = true;
                                break;
                            }
                        }
                        if (!foundSeat) {
                            console.log("ERROR: Could not find my seat!");
                        }
                        console.log("=== END LOGIN_RESULT DEBUG ===");
                    } else console.log(e.errmsg)
                }), cc.yqs.net.addHandler("login_finished", function (t) {
                    cc.log("login_finished"), cc.director.loadScene("yqsScene", function () {
                        cc.yqs.net.ping(), cc.yqs.wc.hide()
                    })
                }), cc.yqs.net.addHandler("exit_result", function (e) {
                    cc.log("exit_result: " + e), t.roomId = null, cc.yqs.userMgr.chairId = -1, t.seats = null
                }), cc.yqs.net.addHandler("exit_notify_push", function (e) {
                    cc.log("exit_notify_push: " + e);
                    var n = e, i = t.getSeatByID(n);
                    null != i && (i.userId = 0, i.name = "", i.online = !1, cc.yqs.eventCenter.emitCustomEvent("user_state_changed", i))
                }), cc.yqs.net.addHandler("dispress_push", function (e) {
                    cc.log("dispress_push: " + e), t.roomId = null, t.turn = -1, t.dingque = -1, t.isDingQueing = !1, t.seats = null
                }), cc.yqs.net.addHandler("disconnect", function (e) {
                    cc.log("disconnect: " + e), null == t.roomId ? cc.director.loadScene("hall") : 0 == t.isOver ? (cc.yqs.userMgr.oldRoomId = t.roomId, t.dispatchEvent("disconnect")) : t.roomId = null
                }), cc.yqs.net.addHandler("new_user_comes_push", function (e) {
                    cc.log("new_user_come_push: " + e);
                    var n = e.seatIndex;
                    t.seats[n].userid > 0 ? t.seats[n].online = !0 : (e.online = !0, t.seats[n] = e), cc.yqs.eventCenter.emitCustomEvent("new_user", t.seats[n])
                }), cc.yqs.net.addHandler("user_state_push", function (e) {
                    cc.log("user_state_push: " + e);
                    var n = e.userid, i = t.getSeatByID(n);
                    i.online = e.online, cc.yqs.eventCenter.emitCustomEvent("user_state_changed", i)
                }), cc.yqs.net.addHandler("user_ready_push", function (e) {
                    cc.log("user_ready_push: " + e);
                    var n = e.userid, i = t.getSeatByID(n);
                    i.ready = e.ready, cc.yqs.eventCenter.emitCustomEvent("user_state_changed", i)
                }), cc.yqs.net.addHandler("game_begin_push", function () {
                    cc.log("game_begin_push: " + data), t.dispatchEvent("game_begin"), cc.yqs.eventCenter.dispatchEvent("game_begin")
                }), cc.yqs.net.addHandler("game_sync_push", function (e) {
                    cc.log("game_sync_push: " + e), t.gamestate = "playing", t.seats = e.seats, cc.yqs.eventCenter.emitCustomEvent("game_sync", e)
                }), cc.yqs.net.addHandler("build_fish_reply", function (t) {
                    cc.log("build_fish_reply:" + t), cc.yqs.eventCenter.emitCustomEvent("build_fish", t)
                }), cc.yqs.net.addHandler("build_fishArray_reply", function (t) {
                    cc.log("build_fishArray_reply:" + t), cc.yqs.gameMgr.onChangeScene(), cc.yqs.eventCenter.emitCustomEvent("build_fishArray_reply", t)
                }), cc.yqs.net.addHandler("user_fire_Reply", function (t) {
                    cc.log("userFireReply: " + t), cc.yqs.eventCenter.emitCustomEvent("room_user_fire", t)
                }), cc.yqs.net.addHandler("catch_fish_reply", function (t) {
                    cc.log("catchFishReply: " + t), cc.yqs.eventCenter.emitCustomEvent("room_catch_fish", t)
                }), cc.yqs.net.addHandler("lock_fish_reply", function (t) {
                    cc.log("lockFishReply: " + t), cc.yqs.eventCenter.emitCustomEvent("room_lock_fish", t)
                }), cc.yqs.net.addHandler("user_frozen_reply", function (t) {
                    cc.log("user_frozen_reply: " + t), cc.yqs.gameMgr.onFrozenScene(t.cutDownTime)
                }), cc.yqs.net.addHandler("user_change_cannon_reply", function (t) {
                    cc.log("user_change_cannon_reply: " + t), cc.yqs.roomMgr.onChangeCannon(t)
                }), cc.yqs.net.addHandler("game_action_push", function (e) {
                    cc.log("game_action_push: " + e), t.curaction = e, console.log(e), t.dispatchEvent("game_action", e)
                }), cc.yqs.net.addHandler("game_num_push", function (e) {
                    cc.log("game_num_push: " + e), t.numOfGames = e, t.dispatchEvent("game_num", e)
                }), cc.yqs.net.addHandler("game_over_push", function (e) {
                    cc.log("game_over_push: " + e);
                    for (var n = e.results, i = 0; i < t.seats.length; ++i) t.seats[i].score = 0 == n.length ? 0 : n[i].totalscore;
                    t.dispatchEvent("game_over", n), e.endinfo && (t.isOver = !0, t.dispatchEvent("game_end", e.endinfo)), t.reset();
                    for (i = 0; i < t.seats.length; ++i) t.dispatchEvent("user_state_changed", t.seats[i])
                }), cc.yqs.net.addHandler("chat_push", function (e) {
                    t.dispatchEvent("chat_push", e)
                }), cc.yqs.net.addHandler("quick_chat_push", function (e) {
                    t.dispatchEvent("quick_chat_push", e)
                }), cc.yqs.net.addHandler("emoji_push", function (e) {
                    t.dispatchEvent("emoji_push", e)
                }), cc.yqs.net.addHandler("voice_msg_push", function (e) {
                    t.dispatchEvent("voice_msg", e)
                })
            },
            connectGameServer: function (t) {
                this.dissoveData = null, cc.yqs.net.ip = t.ip + ":" + t.port, console.log(cc.yqs.net.ip);
                cc.yqs.wc.show("正在为你擦桌子"), cc.yqs.net.connect(function () {
                    console.log("onConnectOK");
                    var e = { token: t.token, roomId: t.roomId, time: t.time, sign: t.sign, userId: cc.yqs.userMgr.userId };
                    cc.yqs.net.send("login", e)
                }, function () {
                    console.log("failed."), cc.yqs.wc.hide()
                })
            }
        }), cc._RF.pop()
    }, {}], Global: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "c15faTLVzJJNaaDmeVWOKKp", "Global");
        cc.Class({
            extends: cc.Component,
            statics: { isstarted: !1, netinited: !1, userguid: 0, nickname: "", money: 0, lv: 0, roomId: 0 }
        });
        cc._RF.pop()
    }, {}], GoldColimnManager: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "d07c8OBWJBK6JNd0XYIgq+6", "GoldColimnManager"), cc.Class({
            extends: cc.Component, properties: { columnArray: { default: [], type: cc.Node } }, onLoad: function () {
                this.scoreArray = [], this.showArray = [0, 0, 0, 0], this.chairId = 1
            }, start: function () {
                this.columnArray.length > 0 && this.schedule(this.updeteGoldPos, .5)
            }, onPause: function () {
                this.unscheduleAllCallbacks()
            }, onResume: function () {
                this.columnArray.length > 0 && this.schedule(this.updeteGoldPos, .8)
            }, pushScore: function (t, e) {
                if (this.scoreArray.push(t), this.chairId = e, this.scoreArray.length > 10) {
                    for (var n = 0, i = this.scoreArray.length - 1; i > this.scoreArray.length - 6; i--) n += this.scoreArray[i], cc.js.array.removeAt(this.scoreArray, i);
                    this.scoreArray.push(n)
                }
            }, updeteGoldPos: function () {
                cc.js.array.removeAt(this.showArray, 0);
                var t = 0;
                this.scoreArray.length > 0 && (t = this.scoreArray[0], cc.js.array.removeAt(this.scoreArray, 0)), this.showArray.push(t), this.drawByShowArray()
            }, drawByShowArray: function () {
                for (var t = this, e = 0; e < this.columnArray.length; e++) {
                    var n = this.columnArray[e];
                    n && n.getComponent("GoldColimn") && n.getComponent("GoldColimn").initWithScore(t.showArray[3 - e], this.chairId)
                }
            }
        }), cc._RF.pop()
    }, {}], GoldColimn: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "698158lK7hOX7Cr9Gj1jpBT", "GoldColimn"), cc.Class({
            extends: cc.Component,
            properties: { lblScore: { default: null, type: cc.Label } },
            onLoad: function () {
            },
            initWithScore: function (t) {
                var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 1;
                "goldColumn4" == this.node.name && (this.lblScore.string = "", this.node.y = -140);
                var n = 1;
                e % 2 == 0 && (n = -1);
                var i = this;
                this.node.runAction(cc.sequence(cc.moveBy(.3, cc.p(60 * n, 0)), cc.moveBy(0, cc.p(-60 * n, 0)), cc.callFunc(function () {
                    t = parseFloat(t).toFixed(3), i.lblScore.string = 0 == t ? "" : cc.yqs.utils.transString(t);
                    var e = 140 * t / (50 * cc.yqs.gameMgr.sceneMulti) - 140;
                    i.node.y = e < 0 ? e : 0
                })))
            }
        }), cc._RF.pop()
    }, {}], GonggaoWin: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "16e8fzGSOxFfLWlYHq86iRh", "GonggaoWin"), cc.Class({
            extends: cc.Component,
            properties: { commonBg: cc.Node },
            onLoad: function () {
            },
            onEnable: function () {
                this.commonBg.scale = .2;
                var t = cc.scaleTo(.2, 1.2), e = cc.scaleTo(.1, 1);
                this.commonBg.runAction(cc.sequence(t, e))
            },
            onBtnClicked: function (t) {
            },
            onBack: function () {
                var t = cc.scaleTo(.1, 1.2), e = cc.scaleTo(.2, .6), n = cc.callFunc(function () {
                    this.node.active = !1
                }, this);
                this.commonBg.runAction(cc.sequence(t, e, n))
            }
        }), cc._RF.pop()
    }, {}], HTTP: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "40d13Xib09P44aSZAJAf73l", "HTTP");
        var i = "http://192.168.0.217:9000";
        cc.VERSION = 20161227;
        var s = cc.Class({
            extends: cc.Component,
            statics: {
                sessionId: 0, userId: 0, master_url: i, url: i, sendRequest: function (t, e, n, i) {
                    var o = cc.loader.getXMLHttpRequest();
                    o.timeout = 5e3;
                    var r = "?";
                    for (var c in e) "?" != r && (r += "&"), r += c + "=" + e[c];
                    null == i && (i = this.url);
                    var a = i + t + encodeURI(r);
                    return console.log("RequestURL:" + a), o.open("GET", a, !0), cc.sys.isNative && o.setRequestHeader("Accept-Encoding", "gzip,deflate", "text/html;charset=UTF-8"), o.onreadystatechange = function () {
                        if (4 === o.readyState && o.status >= 200 && o.status < 300) {
                            console.log("http res(" + o.responseText.length + "):" + o.responseText);
                            try {
                                var t = JSON.parse(o.responseText);
                                null !== n && n(t)
                            } catch (t) {
                                console.log("err:" + t)
                            } finally {
                                cc.yqs && cc.yqs.wc
                            }
                        }
                    }, cc.yqs && cc.yqs.wc, o.send(), o
                }
            }
        });
        cc._RF.pop()
    }, {}], Hall: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "a518axJx3tGt40UMJHM8Cr0", "Hall"), cc.Class({
            extends: cc.Component,
            properties: {
                lblName: cc.Label,
                lblGems: cc.Label,
                lblID: cc.Label,
                lblRewardPool: cc.Label,
                lblNotice: cc.Label,
                sprHeadImg: cc.Sprite,
                userinfoWin: cc.Node,
                rechargeWin: cc.Node,
                serviceCustomWin: cc.Node,
                rankWin: cc.Node,
                emailWin: cc.Node,
                privilegeWin: cc.Node,
                gonggaoWin: cc.Node,
                settingsWin: cc.Node,
                xiaoxiWin: cc.Node,
                rewardOrderWin: cc.Node,
                gemsnum: null
            },
            initNetHandlers: function () {
            },
            onLoad: function () {
                cc.yqs.Hall = this, cc.yqs ? (cc.yqs.gameNetMgr.roomId, this.initLeftTopUI(), this.initRightTopUI(), this.initRightBottomUI(), this.initLeftBottomUI(), cc.yqs.userMgr.notice || (cc.yqs.userMgr.notice = {
                    version: null,
                    msg: "数据请求中..."
                }), cc.yqs.userMgr.gemstip || (cc.yqs.userMgr.gemstip = {
                    version: null,
                    msg: "数据请求中..."
                }), this.lblNotice.string = cc.yqs.userMgr.notice.msg, console.log("-----------------" + cc.yqs.userMgr.headimg + "---------------------"), this.refreshInfo(), this.refreshNotice(), this.refreshGemsTip(), cc.yqs.audioMgr.playBGM("hall-bg.mp3")) : cc.director.loadScene("loading")
            },
            btnBack: function () {
                var t = cc.find("Canvas/bangdingshouji"), e = cc.scaleTo(.2, 1.2), n = cc.scaleTo(.1, 0);
                t.runAction(cc.sequence(e, n))
            },
            initLeftTopUI: function () {
                this.initLabels(), cc.yqs.utils.addClickEvent(this.sprHeadImg.node, this.node, "Hall", "onBtnClicked"), this.initButtonHandler("Canvas/top_left/bg_gems/btn_add_gems"), this.initButtonHandler("Canvas/top_left/rewardPool"), this.initButtonHandler("Canvas/top_left/serverBtn")
            },
            initRightTopUI: function () {
                this.initButtonHandler("Canvas/top_right/btn_shezhi"), this.initButtonHandler("Canvas/top_right/btn_quit"), this.initButtonHandler("Canvas/top_right/btn_xiaoxi")
            },
            initRightBottomUI: function () {
                this.initButtonHandler("Canvas/bottom_right/quickStart")
            },
            initLeftBottomUI: function () {
                this.initButtonHandler("Canvas/bottom_left/btn_recharge"), this.initButtonHandler("Canvas/bottom_left/btn_rank"), this.initButtonHandler("Canvas/bottom_left/btn_toMoney"), this.initButtonHandler("Canvas/bottom_left/btn_emil"), this.initButtonHandler("Canvas/bottom_left/btn_vip"), this.initButtonHandler("Canvas/bottom_left/btn_gift"), this.initButtonHandler("Canvas/bottom_left/btn_app ")
            },
            refreshInfo: function () {
                var t = { account: cc.yqs.userMgr.account, sign: cc.yqs.userMgr.sign };
                cc.yqs.http.sendRequest("/get_user_status", t, function (t) {
                    0 !== t.errcode ? console.log(t.errmsg) : null != t.gems && (t.gems = parseFloat(t.gems / 1e3).toFixed(3))
                }.bind(this))
            },
            refreshGemsTip: function () {
                var t = {
                    account: cc.yqs.userMgr.account,
                    sign: cc.yqs.userMgr.sign,
                    type: "fkgm",
                    version: cc.yqs.userMgr.gemstip.version
                };
                cc.yqs.http.sendRequest("/get_message", t, function (t) {
                    0 !== t.errcode ? console.log(t.errmsg) : (cc.yqs.userMgr.gemstip.version = t.version, cc.yqs.userMgr.gemstip.msg = (t.msg || "").replace("<newline>", "\n"))
                }.bind(this))
            },
            refreshNotice: function () {
                var t = {
                    account: cc.yqs.userMgr.account,
                    sign: cc.yqs.userMgr.sign,
                    type: "notice",
                    version: cc.yqs.userMgr.notice.version
                };
                cc.yqs.http.sendRequest("/get_message", t, function (t) {
                    0 !== t.errcode ? console.log(t.errmsg) : (cc.yqs.userMgr.notice.version = t.version, cc.yqs.userMgr.notice.msg = t.msg || "", this.lblNotice.string = t.msg || "")
                }.bind(this))
            },
            initButtonHandler: function (t) {
                var e = cc.find(t);
                cc.yqs.utils.addClickEvent(e, this.node, "Hall", "onBtnClicked")
            },
            initLabels: function () {
                this.lblName.string = cc.yqs.userMgr.userName, this.lblGems.string = cc.yqs.userMgr.gems, this.lblID.string = "ID:" + cc.yqs.userMgr.userId
            },
            onBtnClicked: function (t) {
                if ("btn_add_gems" == t.target.name) console.log("addGems clicked"), this.rechargeWin.active = !0; else if ("rewardPool" == t.target.name) console.log("rewardPool clicked"), this.rewardOrderWin.active = !0; else if ("serverBtn" == t.target.name) console.log("serverBtn clicked"), this.serviceCustomWin.active = !0; else if ("btn_shezhi" == t.target.name) console.log("shezhi clicked"), this.settingsWin.active = !0; else if ("btn_quit" == t.target.name) console.log("quit clicked"), cc.game.end(); else if ("btn_xiaoxi" == t.target.name) console.log("xiaoxi clicked"), this.xiaoxiWin.active = !0; else if ("head" == t.target.name) console.log("head clicked"), this.userinfoWin.active = !0, this.refreshInfo(); else if ("quickStart" == t.target.name) console.log("quickStart clicked"), this.onJoinGameClicked(null, 1); else if ("btn_recharge" == t.target.name) console.log("btn_recharge clicked"), this.rechargeWin.active = !0; else if ("btn_rank" == t.target.name) console.log("btn_rank clicked"), this.rankWin.active = !0; else if ("btn_toMoney" == t.target.name) {
                    console.log("btn_toMoney clicked");
                    var e = cc.find("Canvas/bangdingshouji"), n = cc.scaleTo(.2, 1.2), i = cc.scaleTo(.1, 1);
                    cc.yqs.alert.show("", "您的账号尚未绑定手机,请先绑定后，在进行的兑换操作", function () {
                        e.runAction(cc.sequence(n, i))
                    }, !0)
                } else "btn_emil" == t.target.name ? (console.log("btn_emil clicked"), this.emailWin.active = !0) : "btn_vip" == t.target.name ? (console.log("btn_vip clicked"), this.privilegeWin.active = !0) : "btn_gift" == t.target.name ? console.log("btn_gift clicked") : "btn_app " == t.target.name && (console.log("btn_app  clicked"), cc.yqs.alert.show("", "是否前往下载app客户端", function () {
                }, !0))
            },
            onJoinGameClicked: function (t, e) {
                var n = this;
                switch (e) {
                    case "1":
                        if (cc.yqs.userMgr.gems < .1) return void cc.yqs.alert.show("", "余额不足", function () {
                        });
                        break;
                    case "2":
                        if (cc.yqs.userMgr.gems < 10) return void cc.yqs.alert.show("", "余额不足", function () {
                        });
                        break;
                    case "3":
                        if (cc.yqs.userMgr.gems < 100) return void cc.yqs.alert.show("", "余额不足", function () {
                        });
                        break;
                    case "4":
                        if (cc.yqs.userMgr.gems < 1e3) return void cc.yqs.alert.show("", "余额不足", function () {
                        });
                        break;
                    case "5":
                    case "6":
                        return void cc.yqs.alert.show("", "敬请期待")
                }
                n.EnterGame(e)
            },
            EnterGame: function (t) {
                cc.yqs.wc.show("正在为你擦桌子，请稍后...");
                var e = .001;
                switch (t) {
                    case "1":
                        e = .001;
                        break;
                    case "2":
                        e = .05;
                        break;
                    case "3":
                        e = .5;
                        break;
                    case "4":
                        e = 2
                }
                cc.yqs.userMgr.enterPublicRoom(e.toString(), function (t) {
                    0 == t.errcode ? cc.yqs.gameNetMgr.connectGameServer(t) : cc.vv.alert.show("提示", "进入房间失败")
                }.bind(this))
            },
            update: function (t) {
                var e = this.lblNotice.node.x;
                (e -= 100 * t) + this.lblNotice.node.width < -1e3 && (e = 500), this.lblNotice.node.x = e, cc.yqs && null != cc.yqs.userMgr.roomData && (cc.yqs.userMgr.enterRoom(cc.yqs.userMgr.roomData), console.log("++++++++++" + cc.yqs.userMgr.roomData), cc.yqs.userMgr.roomData = null)
            }
        }), cc._RF.pop()
    }, {}], HeadIcon: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "e534cnF181OArI6DN5cKbxJ", "HeadIcon"), cc.Class({
            extends: cc.Component,
            properties: { avatarFrame: { default: [], type: [cc.SpriteFrame] } },
            onLoad: function () {
                this.setAvatar(cc.yqs.userMgr.headimg);
                var t = cc.sys.localStorage.getItem("Avatar");
                t || (t = 1), t <= this.avatarFrame.length && (this.node.spriteFrame = this.avatarFrame[t - 1])
            },
            onEnable: function () {
                cc.yqs.eventCenter.addEvent(this, "setAvatar", this.onSetrAvatar)
            },
            onSetrAvatar: function (t) {
                var e = t.getUserData();
                e <= this.avatarFrame.length && (console.log(this.node.spriteFrame), this.node.getComponent(cc.Sprite).spriteFrame = this.avatarFrame[e - 1])
            },
            setAvatar: function (t) {
                t <= this.avatarFrame.length && (console.log(this.node.spriteFrame), this.node.getComponent(cc.Sprite).spriteFrame = this.avatarFrame[t - 1])
            },
            onDisable: function () {
                cc.yqs.eventCenter.removeEvent(this, "setAvatar", this.onSetrAvatar)
            }
        }), cc._RF.pop()
    }, {}], HelpWin: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "f4df0c3NLdKKKJlcjs5bLrR", "HelpWin"), cc.Class({
            extends: cc.Component,
            properties: { commonBg: cc.Node, fishpanel: cc.Sprite, shootpanel: cc.Sprite, richpanel: cc.Sprite },
            onLoad: function () {
            },
            onEnable: function () {
                this.commonBg.scale = .2;
                var t = cc.scaleTo(.2, 1.2), e = cc.scaleTo(.1, 1);
                this.commonBg.runAction(cc.sequence(t, e))
            },
            getRichPanel: function (t) {
                t.isChecked && (this.richpanel.node.active = !0, this.shootpanel.node.active = !1, this.fishpanel.node.active = !1)
            },
            getFishPanel: function (t) {
                t.isChecked && (this.richpanel.node.active = !1, this.shootpanel.node.active = !1, this.fishpanel.node.active = !0)
            },
            getShootPanel: function (t) {
                t.isChecked && (this.richpanel.node.active = !1, this.shootpanel.node.active = !0, this.fishpanel.node.active = !1)
            },
            onBack: function () {
                var t = cc.scaleTo(.1, 1.2), e = cc.scaleTo(.2, .6), n = cc.callFunc(function () {
                    this.node.active = !1
                }, this);
                this.commonBg.runAction(cc.sequence(t, e, n))
            }
        }), cc._RF.pop()
    }, {}], HotUpdate: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "c326b+yAjZGZblBqC9UjI+A", "HotUpdate"), cc.Class({
            extends: cc.Component,
            properties: {
                updatePanel: { default: null, type: cc.Node },
                manifestUrl: { default: null, url: cc.RawAsset },
                percent: { default: null, type: cc.Label },
                lblErr: { default: null, type: cc.Label }
            },
            checkCb: function (t) {
                switch (cc.log("Code: " + t.getEventCode()), t.getEventCode()) {
                    case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                        cc.log("No local manifest file found, hot update skipped."), cc.eventManager.removeListener(this._checkListener);
                        break;
                    case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                    case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                        cc.log("Fail to download manifest file, hot update skipped."), cc.eventManager.removeListener(this._checkListener);
                        break;
                    case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                        cc.log("Already up to date with the latest remote version."), cc.eventManager.removeListener(this._checkListener), this.lblErr.string += "游戏不需要更新\n", cc.director.loadScene("loading");
                        break;
                    case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                        this._needUpdate = !0, this.updatePanel.active = !0, this.percent.string = "00.00%", cc.eventManager.removeListener(this._checkListener)
                }
                this.hotUpdate()
            },
            updateCb: function (t) {
                var e = !1, n = !1;
                switch (t.getEventCode()) {
                    case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                        cc.log("No local manifest file found, hot update skipped."), n = !0;
                        break;
                    case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                        var i = t.getPercent(), s = (t.getPercentByFile(), t.getMessage());
                        s && cc.log(s), cc.log(i.toFixed(2) + "%"), this.percent.string = i + "%";
                        break;
                    case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                    case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                        cc.log("Fail to download manifest file, hot update skipped."), n = !0;
                        break;
                    case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                        cc.log("Already up to date with the latest remote version."), n = !0;
                        break;
                    case jsb.EventAssetsManager.UPDATE_FINISHED:
                        cc.log("Update finished. " + t.getMessage()), e = !0;
                        break;
                    case jsb.EventAssetsManager.UPDATE_FAILED:
                        cc.log("Update failed. " + t.getMessage()), ++this._failCount < 5 ? this._am.downloadFailedAssets() : (cc.log("Reach maximum fail count, exit update process"), this._failCount = 0, n = !0);
                        break;
                    case jsb.EventAssetsManager.ERROR_UPDATING:
                        cc.log("Asset update error: " + t.getAssetId() + ", " + t.getMessage());
                        break;
                    case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                        cc.log(t.getMessage())
                }
                if (n && (cc.eventManager.removeListener(this._updateListener), this.updatePanel.active = !1), e) {
                    cc.eventManager.removeListener(this._updateListener);
                    var o = jsb.fileUtils.getSearchPaths(), r = this._am.getLocalManifest().getSearchPaths();
                    Array.prototype.unshift(o, r), cc.sys.localStorage.setItem("HotUpdateSearchPaths", JSON.stringify(o)), jsb.fileUtils.setSearchPaths(o), this.lblErr.string += "游戏资源更新完毕\n", cc.game.restart()
                }
            },
            hotUpdate: function () {
                this._am && this._needUpdate && (this.lblErr.string += "开始更新游戏资源...\n", this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this)), cc.eventManager.addListener(this._updateListener, 1), this._failCount = 0, this._am.update())
            },
            onLoad: function () {
                if (cc.sys.isNative) {
                    this.lblErr.string += "检查游戏资源...\n";
                    var t = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "tiantianqipai-asset";
                    cc.log("Storage path for remote asset : " + t), this.lblErr.string += t + "\n", cc.log("Local manifest URL : " + this.manifestUrl), this._am = new jsb.AssetsManager(this.manifestUrl, t), this._am.retain(), this._needUpdate = !1, this._am.getLocalManifest().isLoaded() && (this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this)), cc.eventManager.addListener(this._checkListener, 1), this._am.checkUpdate())
                }
            },
            onDestroy: function () {
                this._am && this._am.release()
            }
        }), cc._RF.pop()
    }, {}], ItemInfoWin: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "30163aKrvBEYq7Cyy5v1Kvm", "ItemInfoWin"), cc.Class({
            extends: cc.Component,
            properties: { commonBg: cc.Node, hasNum: cc.Label },
            onLoad: function () {
                var t = cc.sys.localStorage.getItem("frozanNum");
                t || (t = cc.yqs.userMgr.item.ice), this.hasNum.string = t
            },
            onEnable: function () {
                this.commonBg.scale = .2;
                var t = cc.scaleTo(.2, 1.2), e = cc.scaleTo(.1, 1);
                this.commonBg.runAction(cc.sequence(t, e))
            },
            onBtnClicked: function (t) {
            },
            onBack: function () {
                var t = cc.scaleTo(.1, 1.2), e = cc.scaleTo(.2, .6), n = cc.callFunc(function () {
                    this.node.active = !1
                }, this);
                this.commonBg.runAction(cc.sequence(t, e, n))
            }
        }), cc._RF.pop()
    }, {}], LanguageData: [function (t, e, n) {
        "use strict";

        function i(t) {
            return window.i18n.languages[t]
        }

        function s(t) {
            t && (r ? r.replace(t) : r = new o({ phrases: t, allowMissing: !0 }))
        }

        cc._RF.push(e, "61de062n4dJ7ZM9/Xdumozn", "LanguageData");
        var o = t("polyglot.min"), r = null;
        window.i18n || (window.i18n = { languages: {}, curLang: "" }), e.exports = {
            init: function (t) {
                if (!t || t !== window.i18n.curLang) {
                    var e = null;
                    t ? (e = i(t), window.i18n.curLang = t) : e = i(window.i18n.curLang), s(e)
                }
            }, t: function (t, e) {
                if (r) return r.t(t, e)
            }, inst: r, updateSceneRenderers: function () {
                for (var t = cc.director.getScene().children, e = [], n = 0; n < t.length; ++n) {
                    var i = t[n].getComponentsInChildren("LocalizedLabel");
                    Array.prototype.push.apply(e, i)
                }
                for (var s = 0; s < e.length; ++s) e[s].updateLabel();
                for (var o = [], r = 0; r < t.length; ++r) {
                    var c = t[r].getComponentsInChildren("LocalizedSprite");
                    Array.prototype.push.apply(o, c)
                }
                for (var a = 0; a < o.length; ++a) o[a].updateSprite(window.i18n.curLang)
            }
        }, cc._RF.pop()
    }, { "polyglot.min": "polyglot.min" }], Laser: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "da8b5Z6L5hL/ZyhWjPN1CQg", "Laser"), cc.Class({
            extends: cc.Component,
            properties: {},
            onLoad: function () {
                this.type = 0, this.angle = 0, this.status = 0, this.chairId = 1, this.catchedFish = []
            },
            initlaserWithAngle: function (t, e, n) {
                this.type = e, this.status = 1, this.chairId = n, n > 2 && (t += 180), this.id || (this.id = (new Date).getTime()), this.angle = t, this.node.rotation = t, this.node.getComponent(cc.Animation).play()
            },
            startCollider: function () {
                console.log("laser:: " + this.catchedFish.length), cc.yqs.gameMgr.send_laser_catch_fish(cc.yqs.userMgr.userId, cc.yqs.userMgr.chairId, this.catchedFish)
            },
            onCollisionEnter: function (t, e) {
                if ("fish" == t.node.group) {
                    var n = t.node.getComponent("Fish");
                    if (!n) return;
                    if (null == n || 2 == n.status) return;
                    this.catchedFish.push(n.id)
                }
            }
        }), cc._RF.pop()
    }, {}], Loading: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "0ef08mGSGBFxKM/jy0rZMcS", "Loading"), cc.Class({
            extends: cc.Component,
            properties: {
                progress: { default: null, type: cc.ProgressBar },
                lblTemp: { default: null, type: cc.Label },
                lblProgress: { default: null, type: cc.Label }
            },
            onLoad: function () {
                this.initMgr(), this.initLanguage(), this.splash = cc.find("Canvas/splash"), this.splash.active = !0, this.loadingBg = cc.find("Canvas/loadingBg"), this.loadingBg.active = !1, this.loadFinish = !1
            },
            loadRes: function () {
                var t = this;
                cc.loader.loadResDir("yqs", function (e, n, i) {
                    t.lblProgress.string = "( " + parseFloat(e / n * 100).toFixed(0) + "% )", t.progress.progress = e / n
                }, function (e, n) {
                    t.onLoadComplete()
                })
            },
            start: function () {
                var t = this;
                if (cc.sys.os == cc.sys.OS_IOS && cc.sys.isNative) this.splash.active = !1, t.loadingBg.active = !0; else {
                    t.splash.active = !0;
                    var e = Date.now();
                    !function n() {
                        var i = Date.now() - e;
                        if (i < 1) setTimeout(n, 33), t.lblTemp && (t.lblTemp.string = parseFloat(100 * i / 1).toFixed(0) + "%"); else {
                            var s = 255 * (1 - (i - 1) / 500);
                            s < 0 ? (t.splash.opacity = 0, t.loadingBg.active = !0) : t.splash && (t.splash.opacity = s, setTimeout(n, 33))
                        }
                    }()
                }
                this.checkVersion()
            },
            checkVersion: function () {
                var t = this, e = function (e) {
                    null == e.version ? console.log("error.") : (cc.yqs.SI = e, t.loadRes())
                }, n = null, i = !1, s = function () {
                    n = cc.yqs.http.sendRequest("/get_serverinfo", null, function (t) {
                        n = null, i = !0, e(t)
                    }), setTimeout(o, 5e3)
                }, o = function () {
                    i || (n ? (n.abort(), setTimeout(function () {
                        s()
                    }, 5e3)) : s())
                };
                o()
            },
            onLoadComplete: function () {
                this.loadFinish = !0, this.splash.active && this.splash.opacity > 0 ? this.scheduleOnce(function () {
                    cc.director.loadScene("hall")
                }, 3) : cc.director.loadScene("hall")
            },
            initMgr: function () {
                cc.yqs = {}, cc.yqs.http = t("HTTP"), cc.yqs.global = t("Global"), cc.yqs.net = t("Net"), cc.yqs.eventCenter = t("EventCenter");
                var e = t("GameNetMgr");
                cc.yqs.gameNetMgr = new e, cc.yqs.gameNetMgr.initHandlers();
                var n = t("UserMgr");
                cc.yqs.userMgr = new n;
                // 设置默认用户数据，跳过登录验证
                cc.yqs.userMgr.account = "guest_" + Date.now();
                cc.yqs.userMgr.userId = "guest_" + Date.now();
                cc.yqs.userMgr.userName = "游客玩家";
                cc.yqs.userMgr.headimg = 1;
                cc.yqs.userMgr.lv = 1;
                cc.yqs.userMgr.exp = 0;
                cc.yqs.userMgr.coins = 10000;
                cc.yqs.userMgr.vip = 0;
                cc.yqs.userMgr.money = 0;
                cc.yqs.userMgr.gems = 1000;
                cc.yqs.userMgr.sign = "default_sign";
                cc.yqs.userMgr.ip = "127.0.0.1";
                cc.yqs.userMgr.sex = 1;
                cc.yqs.userMgr.roomData = null;
                cc.yqs.userMgr.chairId = 1;
                cc.yqs.userMgr.headId = 1;
                cc.yqs.userMgr.RenameCount = 0;
                cc.yqs.userMgr.ReHeadCount = 0;
                cc.yqs.userMgr.item = { ice: 0 };
                // 初始化notice和gemstip对象
                cc.yqs.userMgr.notice = {
                    version: 1,
                    msg: "欢迎来到游戏世界！"
                };
                cc.yqs.userMgr.gemstip = {
                    version: 1,
                    msg: "游戏提示信息"
                };
                // 初始化等待连接对象，避免show方法未定义的错误
                cc.yqs.wc = {
                    show: function (message) {
                        console.log("等待连接提示:", message || "正在连接...");
                    },
                    hide: function () {
                        console.log("隐藏等待连接提示");
                    }
                };
                var i = t("AudioMgr");
                cc.yqs.audioMgr = new i, cc.yqs.audioMgr.init();
                var s = t("Utils");
                cc.yqs.utils = new s;
                var o = t("MathUtil");
                cc.yqs.mathutil = new o, cc.args = this.urlParse()
            },
            initLanguage: function () {
                cc.yqs.Language = t("LanguageData"), cc.yqs.Language.init("zh"), cc.yqs.getString = cc.yqs.Language.t, console.log(cc.yqs.getString("hello"))
            },
            urlParse: function () {
                var t = {};
                if (null == window.location) return t;
                for (var e, n, i = window.location.href, s = i.indexOf("?"), o = (i = i.substr(s + 1)).split("&"), r = 0; r < o.length; r++) (s = o[r].indexOf("=")) > 0 && (e = o[r].substring(0, s), n = o[r].substr(s + 1), t[e] = n);
                return t
            }
        }), cc._RF.pop()
    }, {
        AudioMgr: "AudioMgr",
        EventCenter: "EventCenter",
        GameNetMgr: "GameNetMgr",
        Global: "Global",
        HTTP: "HTTP",
        LanguageData: "LanguageData",
        MathUtil: "MathUtil",
        Net: "Net",
        UserMgr: "UserMgr",
        Utils: "Utils"
    }], LocalizedLabel: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "744dcs4DCdNprNhG0xwq6FK", "LocalizedLabel");
        var i = t("LanguageData");
        cc.Class({
            extends: cc.Component,
            editor: { executeInEditMode: !0, menu: "i18n/LocalizedLabel" },
            properties: {
                dataID: {
                    get: function () {
                        return this._dataID
                    }, set: function (t) {
                        this._dataID !== t && (this._dataID = t, this.updateLabel())
                    }
                }, _dataID: ""
            },
            onLoad: function () {
                i.inst || i.init(), this.fetchRender()
            },
            fetchRender: function () {
                var t = this.getComponent(cc.Label);
                if (t) return this.label = t, void this.updateLabel()
            },
            updateLabel: function () {
                this.label ? i.t(this.dataID) && (this.label.string = i.t(this.dataID)) : cc.error("Failed to update localized label, label component is invalid!")
            }
        }), cc._RF.pop()
    }, { LanguageData: "LanguageData" }], LocalizedSprite: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "f34ac2GGiVOBbG6XlfvgYP4", "LocalizedSprite");
        var i = t("SpriteFrameSet");
        cc.Class({
            extends: cc.Component,
            editor: {
                executeInEditMode: !0,
                inspector: "packages://i18n/inspector/localized-sprite.js",
                menu: "i18n/LocalizedSprite"
            },
            properties: { spriteFrameSet: { default: [], type: i } },
            onLoad: function () {
                this.fetchRender()
            },
            fetchRender: function () {
                var t = this.getComponent(cc.Sprite);
                if (t) return this.sprite = t, void this.updateSprite(window.i18n.curLang)
            },
            getSpriteFrameByLang: function (t) {
                for (var e = 0; e < this.spriteFrameSet.length; ++e) if (this.spriteFrameSet[e].language === t) return this.spriteFrameSet[e].spriteFrame
            },
            updateSprite: function (t) {
                if (this.sprite) {
                    var e = this.getSpriteFrameByLang(t);
                    !e && this.spriteFrameSet[0] && (e = this.spriteFrameSet[0].spriteFrame), this.sprite.spriteFrame = e
                } else cc.error("Failed to update localized sprite, sprite component is invalid!")
            }
        }), cc._RF.pop()
    }, { SpriteFrameSet: "SpriteFrameSet" }], Login: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "a0912fUK6dDmJBCTPrzvtHO", "Login"), cc.Class({
            extends: cc.Component,
            properties: { _mima: null, _mimaIndex: 0 },
            onLoad: function () {
                cc.yqs ? (cc.yqs.http.url = cc.yqs.http.master_url, this._mima = ["A", "A", "B", "B", "A", "B", "A", "B", "A", "A", "A", "B", "B", "B"], cc.sys.isNative && cc.sys.os != cc.sys.OS_WINDOWS || (cc.find("Canvas/btn_yk").active = !0), cc.director.loadScene("hall")) : cc.director.loadScene("loading")
            },
            start: function () {
                // 直接跳转到游戏大厅，跳过登录验证
                cc.director.loadScene("hall")
            },
            onBtnQuickStartClicked: function () {
                cc.yqs.userMgr.guestAuth()
            },
            onBtnWeichatClicked: function () {
            }
        }), cc._RF.pop()
    }, {}], MathUtil: [function (t, e, n) {
        "use strict";

        function i(t, e) {
            for (var n = function (t, e) {
                var n = new cc.p(0, 0);
                return 3 == t.length ? (n.x = Math.pow(1 - e, 2) * t[0].x + 2 * (1 - e) * e * t[1].x + e * e * t[2].x, n.y = Math.pow(1 - e, 2) * t[0].y + 2 * (1 - e) * e * t[1].y + e * e * t[2].y) : 4 == t.length ? (n.x = Math.pow(1 - e, 3) * t[0].x + 3 * Math.pow(1 - e, 2) * e * t[1].x + 3 * (1 - e) * e * e * t[2].x + e * e * e * t[3].x, n.y = Math.pow(1 - e, 3) * t[0].y + 3 * Math.pow(1 - e, 2) * e * t[1].y + 3 * (1 - e) * e * e * t[2].y + e * e * e * t[3].y) : console.log("点数出错:: count == " + t.length), n
            }, i = [], s = 1 / e, o = 0; o < e; o++) {
                var r = new c;
                r.pos = n(t, s), r.angle = 0 == o ? -1 * cc.yqs.mathutil.getAngleByPos(r.pos, n(t, o * s)) : -1 * cc.yqs.mathutil.getAngleByPos(i[o - 1].pos, r.pos), i[o] = r, s += 1 / e
            }
            return r.pos = cc.p(t[t.length - 1].x, t[t.length - 1].y), r.angle = cc.yqs.mathutil.getAngleByPos(i[i.length - 1].pos, r.pos), i[i.length] = r, i
        }

        function s(t, e, n) {
            for (var i = [], s = 2 * Math.PI / n, o = 0; o < n; o++) {
                var r = new c, a = o * s, h = e * Math.cos(a) + t.x, l = e * Math.sin(a) + t.y;
                r.pos = cc.p(h, l), r.angle = cc.yqs.mathutil.redian2angle(a), i[o] = r
            }
            return i
        }

        function o(t, e) {
            var n = new c;
            return n.pos = cc.p(t.x, t.y), n.angle = -1 * cc.yqs.mathutil.getAngleByPos(n.pos, cc.p(e.x, e.y)), n
        }

        function r(t, e, n, i) {
            for (var s = [], o = 10, r = n / i, a = 0; a < i; a++) {
                var h = new c, l = a * r + e, u = (o += .3) * Math.cos(l) + t.x, f = o * Math.sin(l) + t.y;
                h.pos = cc.p(u, f), h.angle = 0 == a ? -1 * cc.yqs.mathutil.redian2angle(.5 * Math.PI) : -1 * cc.yqs.mathutil.getAngleByPos(s[a - 1].pos, h.pos), s[a] = h
            }
            return s
        }

        cc._RF.push(e, "e7d7aawTOdNHJBFaKi0tyF1", "MathUtil");
        var c = cc.Class({ name: "pointAngle", properties: { pos: cc.p(), angle: 0 } });
        cc.Class({
            extends: cc.Component, properties: {}, onLoad: function () {
            }, BuildBezier: function (t, e) {
                return i(t, e)
            }, BulidLine: function (t, e) {
                return o(t, e)
            }, BuildCircle: function (t, e, n) {
                return s(t, e, n)
            }, BuildSpiral: function (t, e, n, i) {
                return r(t, e, n, i)
            }, TransPos: function (t) {
                t.x = 1280 * (t.x - 640) / 1366, t.y = 720 * (t.y - 360) / 768, cc.yqs.mathutil.needViewTrans() && (t.x = -1 * t.x, t.y = -1 * t.y)
            }, angle2radian: function (t) {
                return cc.degreesToRadians(t)
            }, redian2angle: function (t) {
                return cc.radiansToDegrees(t)
            }, getAngleByPos: function (t, e) {
                if (null == t || null == e) return 0;
                var n = cc.pDistance(t, e);
                if (n <= 0) return 0;
                var i = (e.x - t.x) / n, s = cc.yqs.mathutil.redian2angle(-1 * Math.acos(i));
                return e.y >= t.y && (s = cc.yqs.mathutil.redian2angle(Math.acos(i))), s
            }, needViewTrans: function () {
                return cc.yqs.userMgr.chairId > cc.yqs.roomMgr.Seats.length / 2
            }, logicToViewSeat: function (t) {
                return this.needViewTrans() ? (cc.yqs.roomMgr.Seats.length / 2 + t - 1) % cc.yqs.roomMgr.Seats.length + 1 : t
            }
        }), cc._RF.pop()
    }, {}], Net: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "2b497KIJ8JKXqAsirApPZ9r", "Net");
        var i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
            return typeof t
        } : function (t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
        };
        null == window.io && (window.io = t("socket-io"));
        cc.Class({
            extends: cc.Component, statics: {
                ip: "127.0.0.1:4002", sio: null, isPinging: !1, fnDisconnect: null, handlers: {}, addHandler: function (t, e) {
                    if (this.handlers[t]) console.log("event:" + t + "' handler has been registered."); else {
                        var n = function (n) {
                            "disconnect" != t && "string" == typeof n && (n = JSON.parse(n)), e(n)
                        };
                        this.handlers[t] = n, this.sio && (console.log("register:function " + t), this.sio.on(t, n))
                    }
                }, connect: function (t, e) {
                    var n = this,
                        i = { reconnection: !0, "force new connection": !0, transports: ["websocket", "polling"] };
                    this.sio = window.io.connect(this.ip, i), this.sio.on("connect", function (e) {
                        n.sio.connected = !0, t(e)
                    }), this.sio.on("disconnect", function (t) {
                        console.log("disconnect"), n.sio.connected = !1, n.close(), "yqsScene" == cc.director.getScene().name && cc.yqs.roomMgr.onExitClick()
                    }), this.sio.on("reconnect", function () {
                        console.log("reconnection")
                    }), this.sio.on("connect_failed", function () {
                        console.log("connect_failed")
                    });
                    for (var s in this.handlers) {
                        var o = this.handlers[s];
                        "function" == typeof o && ("disconnect" == s ? this.fnDisconnect = o : (console.log("register:function " + s), this.sio.on(s, o)))
                    }
                    this.startHearbeat()
                }, startHearbeat: function () {
                    this.sio.on("game_pong", function () {
                        t.lastRecieveTime = Date.now(), t.delayMS = t.lastRecieveTime - t.lastSendTime
                    }), this.lastRecieveTime = Date.now();
                    var t = this;
                    console.log(1), t.isPinging || (console.log(1), t.isPinging = !0, setInterval(function () {
                        t.sio && (Date.now() - t.lastRecieveTime > 1e4 ? t.close() : t.ping())
                    }, 5e3))
                }, send: function (t, e) {
                    this.sio.connected && (null != e && "object" == (void 0 === e ? "undefined" : i(e)) && (e = JSON.stringify(e)), this.sio.emit(t, e))
                }, ping: function () {
                    this.sio && (this.lastSendTime = Date.now(), this.send("game_ping"))
                }, close: function () {
                    console.log("close"), this.delayMS = null, this.sio && this.sio.connected && (this.sio.connected = !1, this.sio.disconnect(), this.sio = null), this.fnDisconnect && (this.fnDisconnect(), this.fnDisconnect = null)
                }, test: function (t) {
                    // 模拟网络测试，直接返回成功
                    console.log("模拟网络测试: 返回成功");
                    setTimeout(function () {
                        t(true);
                    }, 100);
                }
            }
        });
        cc._RF.pop()
    }, { "socket-io": "socket-io" }], NodePoolManager: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "1dd55yoqsVIcY8nvgwNaRd1", "NodePoolManager"), cc.Class({
            extends: cc.Component,
            properties: {
                fishPrefabs: { default: [], type: [cc.Prefab] },
                bulletPrefabs: { default: [], type: [cc.Prefab] },
                cannonPrefabs: { default: [], type: [cc.Prefab] },
                coinPrefabs: { default: [], type: [cc.Prefab] },
                coinTextPrefabs: { default: [], type: [cc.Prefab] },
                laserCannonPrefabs: { default: null, type: cc.Prefab },
                particlePrefabs: { default: [], type: [cc.Prefab] },
                fishPools: [],
                bulletPools: [],
                coinPools: [],
                coinTextPools: []
            },
            onLoad: function () {
            },
            getFishCount: function () {
                return this.fishPrefabs.length
            },
            getBulletCount: function () {
                return this.bulletPrefabs.length
            },
            getCoinCount: function () {
                return this.coinPrefabs.length
            },
            getCoinTextCount: function () {
                return this.coinTextPrefabs.length
            },
            getCannonCount: function () {
                return this.cannonPrefabs.length
            },
            InitPool: function () {
                this.fishPools = new Array(this.fishPrefabs.length);
                for (var t = 0; t < this.fishPrefabs.length; t++) this.fishPools[t] = new cc.NodePool;
                this.bulletPools = new Array(this.bulletPrefabs.length);
                for (var e = 0; e < this.bulletPrefabs.length; e++) this.bulletPools[e] = new cc.NodePool;
                this.cannonPools = new Array(this.cannonPrefabs.length);
                for (var n = 0; n < this.cannonPrefabs.length; n++) this.cannonPools[n] = new cc.NodePool;
                this.coinPools = new Array(this.coinPrefabs.length);
                for (var i = 0; i < this.coinPrefabs.length; i++) this.coinPools[i] = new cc.NodePool;
                this.coinTextPools = new Array(this.coinTextPrefabs.length);
                for (var s = 0; s < this.coinTextPools.length; s++) this.coinTextPools[s] = new cc.NodePool;
                for (var o = 0; o < this.fishPools.length; o++) for (var r = 0; r < 30; ++r) {
                    var c = cc.instantiate(this.fishPrefabs[o]);
                    this.fishPools[o].put(c)
                }
                for (var a = 0; a < this.bulletPools.length; a++) for (var h = 0; h < 30; ++h) {
                    var l = cc.instantiate(this.bulletPrefabs[a]);
                    this.bulletPools[a].put(l)
                }
                for (var u = 0; u < this.cannonPools.length; u++) for (var f = 0; f < 2; ++f) {
                    var d = cc.instantiate(this.cannonPrefabs[u]);
                    this.cannonPools[u].put(d)
                }
                for (var p = 0; p < this.coinPools.length; p++) for (var g = 0; g < 50; ++g) {
                    var m = cc.instantiate(this.coinPrefabs[p]);
                    this.coinPools[p].put(m)
                }
                for (var y = 0; y < this.coinTextPools.length; y++) for (var v = 0; v < 10; ++v) {
                    var _ = cc.instantiate(this.coinTextPrefabs[y]);
                    this.coinTextPools[y].put(_)
                }
            },
            getFishById: function (t) {
                var e = null, n = t - 1;
                if (t <= this.fishPools.length) {
                    var i = this.fishPools[n];
                    e = i.size() > 0 ? i.get() : cc.instantiate(this.fishPrefabs[n])
                }
                return e
            },
            putFishById: function (t, e) {
                var n = e - 1;
                e <= this.fishPools.length && this.fishPools[n].put(t)
            },
            getBulletById: function (t) {
                var e = null, n = t - 1;
                if (t <= this.bulletPools.length) {
                    var i = this.bulletPools[n];
                    e = i.size() > 0 ? i.get() : cc.instantiate(this.bulletPrefabs[n])
                }
                return e
            },
            putBulletById: function (t, e) {
                var n = e - 1;
                e <= this.bulletPools.length && this.bulletPools[n].put(t)
            },
            getCannonById: function (t) {
                var e = null, n = t - 1;
                if (t <= this.cannonPools.length) {
                    var i = this.cannonPools[n];
                    e = i.size() > 0 ? i.get() : cc.instantiate(this.cannonPrefabs[n])
                }
                return e
            },
            putCannonById: function (t, e) {
                var n = e - 1;
                e <= this.cannonPools.length && this.cannonPools[n].put(t)
            },
            getLaserCannon: function () {
                return cc.instantiate(this.cannonPrefabs[22])
            },
            getCoinById: function (t) {
                var e = null, n = t - 1;
                if (t <= this.coinPools.length) {
                    var i = this.coinPools[n];
                    e = i.size() > 0 ? i.get() : cc.instantiate(this.coinPrefabs[n])
                }
                return e
            },
            putCoinById: function (t, e) {
                var n = e - 1;
                e <= this.coinPools.length && this.coinPools[n].put(t)
            },
            getCoinTextById: function (t) {
                var e = null, n = t - 1;
                if (t <= this.coinTextPools.length) {
                    var i = this.coinTextPools[n];
                    e = i.size() > 0 ? i.get() : cc.instantiate(this.coinTextPrefabs[n])
                }
                return e
            },
            putCoinTextById: function (t, e) {
                var n = e - 1;
                e <= this.coinTextPools.length && this.coinTextPools[n].put(t)
            }
        }), cc._RF.pop()
    }, {}], NoticeTip: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "76ca6bNRtlIX4u8b0Womsgc", "NoticeTip"), cc.Class({
            extends: cc.Component,
            properties: { _guohu: null, _info: null, _guohuTime: -1 },
            onLoad: function () {
                this._guohu = cc.find("Canvas/tip_notice"), this._guohu.active = !1, this._info = cc.find("Canvas/tip_notice/info").getComponent(cc.Label);
                var t = this;
                this.node.on("push_notice", function (e) {
                    var e = e.detail;
                    t._guohu.active = !0, t._guohuTime = e.time, t._info.string = e.info
                })
            },
            update: function (t) {
                this._guohuTime > 0 && (this._guohuTime -= t, this._guohuTime < 0 && (this._guohu.active = !1))
            }
        }), cc._RF.pop()
    }, {}], OnBack: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "8d166QjcqxGm7rnRW3BVAAQ", "OnBack"), cc.Class({
            extends: cc.Component,
            properties: {},
            onLoad: function () {
                var t = this.node.getChildByName("btn_back");
                cc.yqs.utils.addClickEvent(t, this.node, "OnBack", "onBtnClicked")
            },
            onBtnClicked: function (t) {
                "btn_back" == t.target.name && (this.node.active = !1)
            }
        }), cc._RF.pop()
    }, {}], PrivilegeWin: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "65ea7NHXLtGKbOTSwvyVvTG", "PrivilegeWin"), cc.Class({
            extends: cc.Component,
            properties: {
                commonBg: cc.Node,
                rechargeWin: cc.Node,
                pageView: cc.PageView,
                beforeBtn: cc.Button,
                afterBtn: cc.Button,
                lblTip: cc.Label,
                vipprogress: cc.ProgressBar,
                leftLabel: cc.Label,
                rightLabel: cc.Label
            },
            onLoad: function () {
                this.benfitConfig = {
                    1: 30,
                    2: 500,
                    3: 3e3,
                    4: 1e4,
                    5: 3e4,
                    6: 7e4
                }, this.curPageIndex = cc.yqs.userMgr.vip, this.money = cc.yqs.userMgr.money, this.gunIndex = this.curPageIndex, console.log(this.money + "元"), this.beforeBtn.node.active = this.curPageIndex > 0, this.afterBtn.node.active = this.curPageIndex < Object.getOwnPropertyNames(this.benfitConfig).length - 1, this.pageView.setCurrentPageIndex(this.curPageIndex), 6 == this.curPageIndex ? (this.tipString = "您已达最高级！", this.lblTip.string = this.tipString, this.leftLabel.string = this.curPageIndex, this.rightLabel.string = this.curPageIndex) : (this.remoney = this.benfitConfig[this.curPageIndex + 1] - this.money, this.tipString = "在充值%s元即可升级到vip%s", this.lblTip.string = cc.js.formatStr(this.tipString, this.remoney.toFixed(2), this.curPageIndex + 1), this.leftLabel.string = this.curPageIndex, this.rightLabel.string = this.curPageIndex + 1), this.vipprogress.progress = this.money / this.benfitConfig[this.curPageIndex + 1]
            },
            onEnable: function () {
                this.commonBg.scale = .2;
                var t = cc.scaleTo(.2, 1.2), e = cc.scaleTo(.1, 1);
                this.commonBg.runAction(cc.sequence(t, e))
            },
            onBeforeClick: function () {
                if (this.gunIndex--, this.beforeBtn.node.active = this.gunIndex > 0, this.afterBtn.node.active = this.gunIndex < Object.getOwnPropertyNames(this.benfitConfig).length - 1, this.pageView.scrollToPage(this.gunIndex), this.gunIndex < this.curPageIndex & 6 != this.curPageIndex) this.remoney = this.benfitConfig[this.curPageIndex + 1] - this.money, this.tipString = "在充值%s元即可升级到vip%s", this.lblTip.string = cc.js.formatStr(this.tipString, this.remoney.toFixed(2), this.curPageIndex + 1); else if (6 == this.curPageIndex) this.tipString = "您已达最高级！", this.lblTip.string = this.tipString; else {
                    var t = this.benfitConfig[this.gunIndex + 1] - this.money;
                    this.lblTip.string = cc.js.formatStr(this.tipString, t.toFixed(2), this.gunIndex + 1)
                }
            },
            onAfterClick: function () {
                if (this.gunIndex++, this.beforeBtn.node.active = this.gunIndex > 0, this.afterBtn.node.active = this.gunIndex < Object.getOwnPropertyNames(this.benfitConfig).length - 1, this.pageView.scrollToPage(this.gunIndex), this.gunIndex < this.curPageIndex & 6 != this.curPageIndex) this.remoney = this.benfitConfig[this.curPageIndex + 1] - this.money, this.tipString = "在充值%s元即可升级到vip%s", this.lblTip.string = cc.js.formatStr(this.tipString, this.remoney.toFixed(2), this.curPageIndex + 1); else if (6 == this.curPageIndex) this.tipString = "您已达最高级！", this.lblTip.string = this.tipString; else {
                    var t = this.benfitConfig[this.gunIndex + 1] - this.money;
                    this.lblTip.string = cc.js.formatStr(this.tipString, t.toFixed(2), this.gunIndex + 1)
                }
            },
            onRecharge: function () {
                this.rechargeWin.active = !0
            },
            onBack: function () {
                var t = this, e = cc.scaleTo(.1, 1.2), n = cc.scaleTo(.2, .6), i = cc.callFunc(function () {
                    t.pageView.scrollToPage(this.curPageIndex), this.pageView.setCurrentPageIndex(this.curPageIndex), t.node.active = !1
                }, this);
                this.commonBg.runAction(cc.sequence(e, n, i))
            }
        }), cc._RF.pop()
    }, {}], RankWin: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "f1c8cGVq/tKgplous6helVs", "RankWin"), cc.Class({
            extends: cc.Component,
            properties: { commonBg: cc.Node },
            onLoad: function () {
            },
            onEnable: function () {
                this.commonBg.scale = .2;
                var t = cc.scaleTo(.2, 1.2), e = cc.scaleTo(.1, 1);
                this.commonBg.runAction(cc.sequence(t, e))
            },
            onBtnClicked: function (t) {
            },
            onBack: function () {
                var t = cc.scaleTo(.1, 1.2), e = cc.scaleTo(.2, .6), n = cc.callFunc(function () {
                    this.node.active = !1
                }, this);
                this.commonBg.runAction(cc.sequence(t, e, n))
            }
        }), cc._RF.pop()
    }, {}], ReConnect: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "dcf2dPxANFMRalCS1I3tnlt", "ReConnect"), cc.Class({
            extends: cc.Component,
            properties: { _reconnect: null, _lblTip: null, _lastPing: 0 },
            onLoad: function () {
                this._reconnect = cc.find("Canvas/reconnect"), this._lblTip = cc.find("Canvas/reconnect/tip").getComponent(cc.Label);
                var t = this, e = function t() {
                    cc.yqs.net.test(function (e) {
                        e ? cc.director.loadScene("hall") : setTimeout(t, 3e3)
                    })
                };
                console.log("adasfdasdfsdf"), this.node.on("disconnect", function n(i) {
                    t.node.off("disconnect", n), t._reconnect.active = !0, e()
                })
            },
            update: function (t) {
                if (this._reconnect.active) {
                    var e = Math.floor(Date.now() / 1e3) % 4;
                    this._lblTip.string = cc.yqs.getString("key11");
                    for (var n = 0; n < e; ++n) this._lblTip.string += "."
                }
            }
        }), cc._RF.pop()
    }, {}], RechargeWin: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "0c2d13/EzlC3JRtWgC5f14U", "RechargeWin"), cc.Class({
            extends: cc.Component,
            properties: {
                commonBg: { default: null, type: cc.Node },
                aliPanel: { default: null, type: cc.Node },
                otherPanel: { default: null, type: cc.Node },
                rechargeTip: { default: null, type: cc.Label },
                numberRechargeBox: { default: null, type: cc.EditBox },
                rechargeAccount: cc.Label
            },
            onLoad: function () {
                this.rechargeType = 1, this.rechargeAccount.string = cc.yqs.userMgr.account
            },
            onEnable: function () {
                this.commonBg.scale = .2;
                var t = cc.scaleTo(.2, 1.2), e = cc.scaleTo(.1, 1);
                this.commonBg.runAction(cc.sequence(t, e))
            },
            onRadioBtnClick: function (t, e) {
                this.rechargeType = e, 1 == e ? (this.aliPanel.active = !0, this.otherPanel.active = !1, this.rechargeTip.string = cc.yqs.getString("key12")) : 2 == e ? (this.aliPanel.active = !0, this.otherPanel.active = !1, this.rechargeTip.string = cc.yqs.getString("key13")) : 3 == e && (this.aliPanel.active = !1, this.otherPanel.active = !0)
            },
            onRechargeBtnClick: function (t, e) {
                console.log(e), this.numberRechargeBox.string = e
            },
            onConfimClick: function () {
                var t = this;
                t.numberRechargeBox.string ? cc.yqs.alert.show("", "充值接口未开放", function () {
                    console.log("recharge num: " + parseFloat(t.numberRechargeBox.string).toFixed(2) + " by: " + t.rechargeType), t.node.active = !1
                }, !0) : cc.yqs.alert.show("", "请输入充值金额")
            },
            onBack: function () {
                var t = cc.scaleTo(.1, 1.2), e = cc.scaleTo(.2, .6), n = cc.callFunc(function () {
                    this.node.active = !1
                }, this);
                this.commonBg.runAction(cc.sequence(t, e, n))
            }
        }), cc._RF.pop()
    }, {}], RewardFish: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "814f4oz2JhGoqpDz23CCL7x", "RewardFish"), cc.Class({
            extends: cc.Component,
            properties: {
                fishHead: { default: null, type: cc.Sprite },
                gold: { default: null, type: cc.Label },
                heads: { default: [], type: [cc.SpriteFrame] }
            },
            onLoad: function () {
                this.InitFishHead()
            },
            InitFishHead: function () {
                this.hesdId = 0
            },
            playReward: function (t, e) {
                var n = {
                    21: this.heads[5],
                    22: this.heads[7],
                    27: this.heads[6],
                    28: this.heads[2],
                    29: this.heads[4],
                    34: this.heads[3],
                    35: this.heads[0]
                };
                this.fishHead.spriteFrame = n[t] || null, this.gold.string = cc.yqs.utils.transString(e)
            }
        }), cc._RF.pop()
    }, {}], RewardOrderWin: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "d2ae7ySrtpEXZ8cv/QyIV+b", "RewardOrderWin"), cc.Class({
            extends: cc.Component,
            properties: { commonBg: cc.Node },
            onLoad: function () {
            },
            onEnable: function () {
                this.commonBg.scale = .2;
                var t = cc.scaleTo(.2, 1.2), e = cc.scaleTo(.1, 1);
                this.commonBg.runAction(cc.sequence(t, e))
            },
            onBtnClicked: function (t) {
            },
            onBack: function () {
                var t = cc.scaleTo(.1, 1.2), e = cc.scaleTo(.2, .6), n = cc.callFunc(function () {
                    this.node.active = !1
                }, this);
                this.commonBg.runAction(cc.sequence(t, e, n))
            }
        }), cc._RF.pop()
    }, {}], RoomMgr: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "88495SoqZJKX6a5qY/jeUBv", "RoomMgr"), cc.Class({
            extends: cc.Component,
            properties: {
                Seats: { default: [], type: [cc.Node] },
                lblRoomNo: { default: null, type: cc.Label },
                toggleNode: { default: null, type: cc.Node },
                menuNode: { default: null, type: cc.Node },
                globalText: { default: null, type: cc.Label },
                delayTip: cc.Label,
                syncTip: cc.Node,
                arrayCome: cc.Node,
                kingCome: cc.Node,
                rechargeWin: cc.Node,
                helpWin: cc.Node,
                settingWin: cc.Node,
                _lastPlayingSeat: null,
                _playingSeat: null
            },
            onLoad: function () {
                if (null != cc.yqs) {
                    cc.yqs.roomMgr = this;
                    var t = { userId: cc.yqs.userMgr.userId };
                    cc.yqs.net.send("ready", t), this.globalMsgList = []
                }
            },
            start: function () {
                this.showGlobal()
            },
            initView: function (t) {
                var e = cc.yqs.gameNetMgr.seats;
                t && (e = t);
                for (var n = 0; n < e.length; ++n) if (e[n].userId == cc.yqs.userMgr.userId) {
                    cc.yqs.userMgr.chairId = e[n].seatIndex + 1;
                    break
                }
                this.transViewSeat(), this.lblRoomNo.string = "渔场ID: " + cc.yqs.userMgr.roomId, this.isGlobalPlaying = !1, this.globalMsgList = [], this.globalMsgList.push(1), this.globalMsgList.push(2), this.globalMsgList.push(3)
            },
            transViewSeat: function () {
                if (cc.yqs.mathutil.needViewTrans()) {
                    var t = this.Seats[0];
                    this.Seats[0] = this.Seats[2], this.Seats[2] = t;
                    var e = this.Seats[1];
                    this.Seats[1] = this.Seats[3], this.Seats[3] = e
                }
                for (var n = 0; n < this.Seats.length; n++) {
                    var i = this.Seats[n].getComponent("Cannon");
                    if (i) {
                        var s = i.chairId;
                        s = cc.yqs.mathutil.logicToViewSeat(s), i.chairId = s
                    }
                }
            },
            onEnable: function () {
                cc.yqs.eventCenter.addEvent(this, "game_sync", this.game_sync), cc.yqs.eventCenter.addEvent(this, "new_user", this.new_user), cc.yqs.eventCenter.addEvent(this, "user_state_changed", this.user_state_changed), cc.yqs.eventCenter.addEvent(this, "room_user_fire", this.fireWithData), cc.yqs.eventCenter.addEvent(this, "room_catch_fish", this.catchFishWithData), cc.yqs.eventCenter.addEvent(this, "room_lock_fish", this.lockFishWithData), this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegin, this), this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
            },
            onDisable: function () {
                cc.yqs.eventCenter.removeEvent(this, "game_sync", this.game_sync), cc.yqs.eventCenter.removeEvent(this, "new_user", this.new_user), cc.yqs.eventCenter.removeEvent(this, "user_state_changed", this.user_state_changed), cc.yqs.eventCenter.removeEvent(this, "room_user_fire", this.fireWithData), cc.yqs.eventCenter.removeEvent(this, "room_catch_fish", this.catchFishWithData), cc.yqs.eventCenter.removeEvent(this, "room_lock_fish", this.lockFishWithData), this.node.off(cc.Node.EventType.TOUCH_START, this.onTouch, this), this.node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouch, this)
            },
            onTouchBegin: function (t) {
                var e = this.Seats[cc.yqs.userMgr.chairId - 1].getComponent("Cannon"),
                    n = this.Seats[cc.yqs.userMgr.chairId - 1].convertTouchToNodeSpaceAR(t);
                e.onUnLockFish();
                var i = cc.yqs.gameMgr.node.convertTouchToNodeSpaceAR(t);
                cc.yqs.gameMgr.playmouse(i), 22 == e.CannonKind ? (e.angle = e.setAngle(n), e.laserOnfire(e.angle)) : e.onAuto ? (e.angle = e.setAngle(n), e.onAutoFire()) : e.onFire(n)
            },
            onTouchMove: function (t) {
                var e = this.Seats[cc.yqs.userMgr.chairId - 1].getComponent("Cannon"),
                    n = this.Seats[cc.yqs.userMgr.chairId - 1].convertTouchToNodeSpaceAR(t);
                22 == e.CannonKind ? (e.angle = e.setAngle(n), e.laserOnfire(e.angle)) : e.onAuto ? (e.angle = e.setAngle(n), e.onAutoFire()) : e.onFire(n)
            },
            showArrayCome: function () {
                var t = this;
                this.arrayCome.active = !0, this.scheduleOnce(function () {
                    t.arrayCome.active = !1
                }, 3)
            },
            showKingCome: function () {
                var t = this;
                this.kingCome.active = !0, this.scheduleOnce(function () {
                    t.kingCome.active = !1
                }, 3)
            },
            game_sync: function (t) {
                if (t.detail.frozenEndTime > 0 || t.detail.formationEndTime > 0) {
                    console.log("正在同步鱼群"), this.syncTip.active = !0;
                    var e = cc.sequence(cc.scaleTo(.3, 1.2, 1.2), cc.scaleTo(.2, 1, 1));
                    this.syncTip.runAction(e.repeatForever());
                    var n = t.detail.frozenEndTime > 0 ? t.detail.frozenEndTime : t.detail.formationEndTime;
                    n -= (new Date).getTime(), this.scheduleOnce(function () {
                        this.syncTip.active = !1
                    }, n / 1e3)
                } else this.syncTip.active = !1;
                cc.yqs.gameMgr.sceneMulti = Math.floor(t.detail.roomBaseScore) / 1e3, this.initView(t.detail.seats), this.initSeats(t.detail.seats)
            },
            new_user: function (t) {
                this.initSingleSeat(t.detail)
            },
            user_state_changed: function (t) {
                this.initSingleSeat(t.detail)
            },
            initSeats: function (t) {
                var e = cc.yqs.gameNetMgr.seats;
                t && (e = t);
                for (var n = 0; n < e.length; ++n) this.initSingleSeat(e[n])
            },
            initSingleSeat: function (t) {
                if (t.userId <= 0) {
                    if (t.seatIndex > -1) {
                        e = t.seatIndex;
                        this.Seats[e] && this.Seats[e].getComponent("Cannon") && (i = this.Seats[e].getComponent("Cannon")).clearSeat()
                    }
                } else {
                    var e = t.seatIndex, n = !t.online;
                    if (this.Seats[e] && this.Seats[e].getComponent("Cannon")) {
                        var i = this.Seats[e].getComponent("Cannon");
                        n ? i.clearSeat() : i.initWithData(t)
                    }
                }
            },
            getPlayerByIndex: function (t) {
                var e = t;
                return this.Seats[e - 1]
            },
            fireWithData: function (t) {
                var e = (t = t.detail).chairId;
                e <= 0 ? console.log("有玩家开火， 座位号出错") : this.Seats[e - 1].getComponent("Cannon").fireWithData(t)
            },
            catchFishWithData: function (t) {
                var e = (t = t.detail).chairId;
                t.item && (e == cc.yqs.userMgr.chairId && cc.yqs.userMgr.item[t.item]++, this.getPlayerByIndex(e).getComponent("Cannon").getNewItem());
                var n = t.fishId.split(",");
                if (1 == n.length) {
                    var i = cc.yqs.fishMgr.getFishById(n);
                    if (!i) return;
                    var s = cc.yqs.bulletMgr.getBulletsById(t.bulletId);
                    cc.yqs.gameMgr.onCatchFish(e, s, i, t.addScore)
                } else cc.yqs.gameMgr.onCatchFishArray(e, n, t.addScore, t.isLaser)
            },
            lockFishWithData: function (t) {
                var e = (t = t.detail).chairId, n = t.fishId;
                cc.yqs.gameMgr.onLockFish(e, n)
            },
            onChangeCannon: function (t) {
                var e = t.chairId, n = (t.userId, t.cannonKind), i = this.getPlayerByIndex(e);
                i && i.getComponent("Cannon") && i.getComponent("Cannon").onCannonChange(n)
            },
            onMenuToggle: function (t) {
                var e = this;
                t.isChecked ? (this.toggleNode.getComponent(cc.Toggle).enabled = !1, this.menuNode.runAction(cc.sequence(cc.moveTo(.8, cc.p(98, 0)), cc.callFunc(function () {
                    e.toggleNode.getComponent(cc.Toggle).enabled = !0
                })))) : (this.toggleNode.getComponent(cc.Toggle).enabled = !1, this.menuNode.runAction(cc.sequence(cc.moveTo(.8, cc.p(-180, 0)), cc.callFunc(function () {
                    e.toggleNode.getComponent(cc.Toggle).enabled = !0
                }))))
            },
            onRechargeClick: function () {
                console.log("recharge Click"), this.rechargeWin.active = !0
            },
            onHelpClick: function () {
                console.log("help Click"), this.helpWin.active = !0
            },
            onSettingClick: function () {
                console.log("setting Click"), this.settingWin.active = !0
            },
            onExitClick: function () {
                console.log("exit Click"), cc.yqs.gameMgr.onStop(), cc.yqs.fishMgr.onStop(), cc.yqs.bulletMgr.onStop(), cc.yqs.net.send("exit"), cc.director.loadScene("hall")
            },
            showGlobal: function () {
                if (!(this.isGlobalPlaying || this.globalMsgList.length < 1)) {
                    this.isGlobalPlaying = !0;
                    var t = this,
                        e = (this.globalMsgList[0], cc.js.formatStr(cc.yqs.getString("key15"), 111, 222, 333, 444));
                    this.globalText.string = e;
                    var n = cc.moveTo(15, cc.p(-1400, 0)), i = cc.callFunc(function () {
                        t.globalText.node.position = cc.p(640, 0), this.isGlobalPlaying = !1, t.showGlobal()
                    }, this);
                    this.globalText.node.runAction(cc.sequence(n, i)), cc.js.array.removeAt(this.globalMsgList, 0)
                }
            },
            update: function (t) {
                null != cc.yqs.net.delayMS ? (this.delayTip.string = cc.yqs.net.delayMS + "ms", cc.yqs.net.delayMS > 800 ? this.delayTip.node.color = new cc.Color(205, 0, 0) : cc.yqs.net.delayMS > 300 || (this.delayTip.node.color = new cc.Color(0, 205, 0))) : (this.delayTip.string = "N/A", this.delayTip.node.color = new cc.Color(205, 0, 0))
            }
        }), cc._RF.pop()
    }, {}], ServiceCustomWin: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "b71f4HcbcFDKa1zAjGz9IIh", "ServiceCustomWin"), cc.Class({
            extends: cc.Component,
            properties: { commonBg: cc.Node },
            onLoad: function () {
            },
            onEnable: function () {
                this.commonBg.scale = .2;
                var t = cc.scaleTo(.2, 1.2), e = cc.scaleTo(.1, 1);
                this.commonBg.runAction(cc.sequence(t, e))
            },
            onBtnClicked: function (t) {
            },
            onBack: function () {
                var t = cc.scaleTo(.1, 1.2), e = cc.scaleTo(.2, .6), n = cc.callFunc(function () {
                    this.node.active = !1
                }, this);
                this.commonBg.runAction(cc.sequence(t, e, n))
            }
        }), cc._RF.pop()
    }, {}], SettingWin: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "9030dwF59NNmIyZN2gApAHS", "SettingWin"), cc.Class({
            extends: cc.Component,
            properties: { commonBg: cc.Node, _btnYXOpen: null, _btnYXClose: null, _btnYYOpen: null, _btnYYClose: null },
            onLoad: function () {
                if (null != cc.yqs) {
                    this._btnYXOpen = cc.find("commonBg/psBg/yinxiao/btn_yx_open", this.node), this._btnYXClose = cc.find("commonBg/psBg/yinxiao/btn_yx_close", this.node), this._btnYYOpen = cc.find("commonBg/psBg/yinyue/btn_yy_open", this.node), this._btnYYClose = cc.find("commonBg/psBg/yinyue/btn_yy_close", this.node), this.initButtonHandler(this._btnYXOpen), this.initButtonHandler(this._btnYXClose), this.initButtonHandler(this._btnYYOpen), this.initButtonHandler(this._btnYYClose);
                    var t = cc.find("commonBg/psBg/yinxiao/progress", this.node);
                    cc.yqs.utils.addSlideEvent(t, this.node, "SettingWin", "onSlided");
                    var e = cc.find("commonBg/psBg/yinyue/progress", this.node);
                    cc.yqs.utils.addSlideEvent(e, this.node, "SettingWin", "onSlided")
                }
            },
            onEnable: function () {
                this.commonBg.scale = .2;
                var t = cc.scaleTo(.2, 1.2), e = cc.scaleTo(.1, 1);
                this.commonBg.runAction(cc.sequence(t, e))
            },
            start: function () {
                this.refreshVolume()
            },
            onSlided: function (t) {
                "yinxiao" == t.node.parent.name ? cc.yqs.audioMgr.setSFXVolume(t.progress) : "yinyue" == t.node.parent.name && cc.yqs.audioMgr.setBGMVolume(t.progress), this.refreshVolume()
            },
            initButtonHandler: function (t) {
                cc.yqs.utils.addClickEvent(t, this.node, "SettingWin", "onBtnClicked")
            },
            refreshVolume: function () {
                this._btnYXClose.active = cc.yqs.audioMgr.sfxVolume > 0, this._btnYXOpen.active = !this._btnYXClose.active, (e = cc.find("commonBg/psBg/yinxiao/progress", this.node)).getComponent(cc.Slider).progress = cc.yqs.audioMgr.sfxVolume;
                var t = 430 * cc.yqs.audioMgr.sfxVolume;
                e.getChildByName("progress") && (e.getChildByName("progress").width = t), this._btnYYClose.active = cc.yqs.audioMgr.bgmVolume > 0, this._btnYYOpen.active = !this._btnYYClose.active;
                var e = cc.find("commonBg/psBg/yinyue/progress", this.node), n = 430 * cc.yqs.audioMgr.bgmVolume;
                e.getComponent(cc.Slider).progress = cc.yqs.audioMgr.bgmVolume, e.getChildByName("progress").width = n
            },
            onBtnClicked: function (t) {
                "btn_yy_close" == t.target.name ? (cc.yqs.audioMgr.setBGMVolume(0), this.refreshVolume()) : "btn_yx_open" == t.target.name ? (cc.yqs.audioMgr.setSFXVolume(1), this.refreshVolume()) : "btn_yx_close" == t.target.name ? (cc.yqs.audioMgr.setSFXVolume(0), this.refreshVolume()) : "btn_yy_open" == t.target.name ? (cc.yqs.audioMgr.setBGMVolume(1), this.refreshVolume()) : "btn_yy_close" == t.target.name ? (cc.yqs.audioMgr.setBGMVolume(0), this.refreshVolume()) : "btn_down" == t.target.name && console.log("download by photo")
            },
            onBack: function () {
                var t = cc.scaleTo(.1, 1.2), e = cc.scaleTo(.2, .6), n = cc.callFunc(function () {
                    this.node.active = !1
                }, this);
                this.commonBg.runAction(cc.sequence(t, e, n))
            }
        }), cc._RF.pop()
    }, {}], SpriteFrameSet: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "97019Q80jpE2Yfz4zbuCZBq", "SpriteFrameSet");
        var i = cc.Class({ name: "SpriteFrameSet", properties: { language: "", spriteFrame: cc.SpriteFrame } });
        e.exports = i, cc._RF.pop()
    }, {}], TimelineLite: [function (t, e, n) {
        (function (n) {
            "use strict";
            cc._RF.push(e, "4ad18e5FPdL8bi03UpoTC4L", "TimelineLite");
            var i = void 0 !== e && e.exports && void 0 !== n ? n : window;
            (i._gsQueue || (i._gsQueue = [])).push(function () {
                i._gsDefine("TimelineLite", ["core.Animation", "core.SimpleTimeline", "TweenLite"], function (t, e, n) {
                    var s = function (t) {
                        e.call(this, t), this._labels = {}, this.autoRemoveChildren = !0 === this.vars.autoRemoveChildren, this.smoothChildTiming = !0 === this.vars.smoothChildTiming, this._sortChildren = !0, this._onUpdate = this.vars.onUpdate;
                        var n, i, s = this.vars;
                        for (i in s) n = s[i], a(n) && -1 !== n.join("").indexOf("{self}") && (s[i] = this._swapSelfInParams(n));
                        a(s.tweens) && this.add(s.tweens, 0, s.align, s.stagger)
                    }, o = n._internals, r = s._internals = {}, c = o.isSelector, a = o.isArray, h = o.lazyTweens,
                        l = o.lazyRender, u = i._gsDefine.globals, f = function (t) {
                            var e, n = {};
                            for (e in t) n[e] = t[e];
                            return n
                        }, d = function (t, e, n) {
                            var i, s, o = t.cycle;
                            for (i in o) s = o[i], t[i] = "function" == typeof s ? s(n, e[n]) : s[n % s.length];
                            delete t.cycle
                        }, p = r.pauseCallback = function () {
                        }, g = function (t) {
                            var e, n = [], i = t.length;
                            for (e = 0; e !== i; n.push(t[e++]));
                            return n
                        }, m = s.prototype = new e;
                    return s.version = "1.19.1", m.constructor = s, m.kill()._gc = m._forcingPlayhead = m._hasPause = !1, m.to = function (t, e, i, s) {
                        var o = i.repeat && u.TweenMax || n;
                        return e ? this.add(new o(t, e, i), s) : this.set(t, i, s)
                    }, m.from = function (t, e, i, s) {
                        return this.add((i.repeat && u.TweenMax || n).from(t, e, i), s)
                    }, m.fromTo = function (t, e, i, s, o) {
                        var r = s.repeat && u.TweenMax || n;
                        return e ? this.add(r.fromTo(t, e, i, s), o) : this.set(t, s, o)
                    }, m.staggerTo = function (t, e, i, o, r, a, h, l) {
                        var u, p, m = new s({
                            onComplete: a,
                            onCompleteParams: h,
                            callbackScope: l,
                            smoothChildTiming: this.smoothChildTiming
                        }), y = i.cycle;
                        for ("string" == typeof t && (t = n.selector(t) || t), c(t = t || []) && (t = g(t)), (o = o || 0) < 0 && ((t = g(t)).reverse(), o *= -1), p = 0; p < t.length; p++) (u = f(i)).startAt && (u.startAt = f(u.startAt), u.startAt.cycle && d(u.startAt, t, p)), y && (d(u, t, p), null != u.duration && (e = u.duration, delete u.duration)), m.to(t[p], e, u, p * o);
                        return this.add(m, r)
                    }, m.staggerFrom = function (t, e, n, i, s, o, r, c) {
                        return n.immediateRender = 0 != n.immediateRender, n.runBackwards = !0, this.staggerTo(t, e, n, i, s, o, r, c)
                    }, m.staggerFromTo = function (t, e, n, i, s, o, r, c, a) {
                        return i.startAt = n, i.immediateRender = 0 != i.immediateRender && 0 != n.immediateRender, this.staggerTo(t, e, i, s, o, r, c, a)
                    }, m.call = function (t, e, i, s) {
                        return this.add(n.delayedCall(0, t, e, i), s)
                    }, m.set = function (t, e, i) {
                        return i = this._parseTimeOrLabel(i, 0, !0), null == e.immediateRender && (e.immediateRender = i === this._time && !this._paused), this.add(new n(t, 0, e), i)
                    }, s.exportRoot = function (t, e) {
                        null == (t = t || {}).smoothChildTiming && (t.smoothChildTiming = !0);
                        var i, o, r = new s(t), c = r._timeline;
                        for (null == e && (e = !0), c._remove(r, !0), r._startTime = 0, r._rawPrevTime = r._time = r._totalTime = c._time, i = c._first; i;) o = i._next, e && i instanceof n && i.target === i.vars.onComplete || r.add(i, i._startTime - i._delay), i = o;
                        return c.add(r, 0), r
                    }, m.add = function (i, o, r, c) {
                        var h, l, u, f, d, p;
                        if ("number" != typeof o && (o = this._parseTimeOrLabel(o, 0, !0, i)), !(i instanceof t)) {
                            if (i instanceof Array || i && i.push && a(i)) {
                                for (r = r || "normal", c = c || 0, h = o, l = i.length, u = 0; u < l; u++) a(f = i[u]) && (f = new s({ tweens: f })), this.add(f, h), "string" != typeof f && "function" != typeof f && ("sequence" === r ? h = f._startTime + f.totalDuration() / f._timeScale : "start" === r && (f._startTime -= f.delay())), h += c;
                                return this._uncache(!0)
                            }
                            if ("string" == typeof i) return this.addLabel(i, o);
                            if ("function" != typeof i) throw "Cannot add " + i + " into the timeline; it is not a tween, timeline, function, or string.";
                            i = n.delayedCall(0, i)
                        }
                        if (e.prototype.add.call(this, i, o), (this._gc || this._time === this._duration) && !this._paused && this._duration < this.duration()) for (p = (d = this).rawTime() > i._startTime; d._timeline;) p && d._timeline.smoothChildTiming ? d.totalTime(d._totalTime, !0) : d._gc && d._enabled(!0, !1), d = d._timeline;
                        return this
                    }, m.remove = function (e) {
                        if (e instanceof t) {
                            this._remove(e, !1);
                            var n = e._timeline = e.vars.useFrames ? t._rootFramesTimeline : t._rootTimeline;
                            return e._startTime = (e._paused ? e._pauseTime : n._time) - (e._reversed ? e.totalDuration() - e._totalTime : e._totalTime) / e._timeScale, this
                        }
                        if (e instanceof Array || e && e.push && a(e)) {
                            for (var i = e.length; --i > -1;) this.remove(e[i]);
                            return this
                        }
                        return "string" == typeof e ? this.removeLabel(e) : this.kill(null, e)
                    }, m._remove = function (t, n) {
                        return e.prototype._remove.call(this, t, n), this._last ? this._time > this.duration() && (this._time = this._duration, this._totalTime = this._totalDuration) : this._time = this._totalTime = this._duration = this._totalDuration = 0, this
                    }, m.append = function (t, e) {
                        return this.add(t, this._parseTimeOrLabel(null, e, !0, t))
                    }, m.insert = m.insertMultiple = function (t, e, n, i) {
                        return this.add(t, e || 0, n, i)
                    }, m.appendMultiple = function (t, e, n, i) {
                        return this.add(t, this._parseTimeOrLabel(null, e, !0, t), n, i)
                    }, m.addLabel = function (t, e) {
                        return this._labels[t] = this._parseTimeOrLabel(e), this
                    }, m.addPause = function (t, e, i, s) {
                        var o = n.delayedCall(0, p, i, s || this);
                        return o.vars.onComplete = o.vars.onReverseComplete = e, o.data = "isPause", this._hasPause = !0, this.add(o, t)
                    }, m.removeLabel = function (t) {
                        return delete this._labels[t], this
                    }, m.getLabelTime = function (t) {
                        return null != this._labels[t] ? this._labels[t] : -1
                    }, m._parseTimeOrLabel = function (e, n, i, s) {
                        var o;
                        if (s instanceof t && s.timeline === this) this.remove(s); else if (s && (s instanceof Array || s.push && a(s))) for (o = s.length; --o > -1;) s[o] instanceof t && s[o].timeline === this && this.remove(s[o]);
                        if ("string" == typeof n) return this._parseTimeOrLabel(n, i && "number" == typeof e && null == this._labels[n] ? e - this.duration() : 0, i);
                        if (n = n || 0, "string" != typeof e || !isNaN(e) && null == this._labels[e]) null == e && (e = this.duration()); else {
                            if (-1 === (o = e.indexOf("="))) return null == this._labels[e] ? i ? this._labels[e] = this.duration() + n : n : this._labels[e] + n;
                            n = parseInt(e.charAt(o - 1) + "1", 10) * Number(e.substr(o + 1)), e = o > 1 ? this._parseTimeOrLabel(e.substr(0, o - 1), 0, i) : this.duration()
                        }
                        return Number(e) + n
                    }, m.seek = function (t, e) {
                        return this.totalTime("number" == typeof t ? t : this._parseTimeOrLabel(t), !1 !== e)
                    }, m.stop = function () {
                        return this.paused(!0)
                    }, m.gotoAndPlay = function (t, e) {
                        return this.play(t, e)
                    }, m.gotoAndStop = function (t, e) {
                        return this.pause(t, e)
                    }, m.render = function (t, e, n) {
                        this._gc && this._enabled(!0, !1);
                        var i, s, o, r, c, a, u, f = this._dirty ? this.totalDuration() : this._totalDuration,
                            d = this._time, p = this._startTime, g = this._timeScale, m = this._paused;
                        if (t >= f - 1e-7 && t >= 0) this._totalTime = this._time = f, this._reversed || this._hasPausedChild() || (s = !0, r = "onComplete", c = !!this._timeline.autoRemoveChildren, 0 === this._duration && (t <= 0 && t >= -1e-7 || this._rawPrevTime < 0 || 1e-10 === this._rawPrevTime) && this._rawPrevTime !== t && this._first && (c = !0, this._rawPrevTime > 1e-10 && (r = "onReverseComplete"))), this._rawPrevTime = this._duration || !e || t || this._rawPrevTime === t ? t : 1e-10, t = f + 1e-4; else if (t < 1e-7) if (this._totalTime = this._time = 0, (0 !== d || 0 === this._duration && 1e-10 !== this._rawPrevTime && (this._rawPrevTime > 0 || t < 0 && this._rawPrevTime >= 0)) && (r = "onReverseComplete", s = this._reversed), t < 0) this._active = !1, this._timeline.autoRemoveChildren && this._reversed ? (c = s = !0, r = "onReverseComplete") : this._rawPrevTime >= 0 && this._first && (c = !0), this._rawPrevTime = t; else {
                            if (this._rawPrevTime = this._duration || !e || t || this._rawPrevTime === t ? t : 1e-10, 0 === t && s) for (i = this._first; i && 0 === i._startTime;) i._duration || (s = !1), i = i._next;
                            t = 0, this._initted || (c = !0)
                        } else {
                            if (this._hasPause && !this._forcingPlayhead && !e) {
                                if (t >= d) for (i = this._first; i && i._startTime <= t && !a;) i._duration || "isPause" !== i.data || i.ratio || 0 === i._startTime && 0 === this._rawPrevTime || (a = i), i = i._next; else for (i = this._last; i && i._startTime >= t && !a;) i._duration || "isPause" === i.data && i._rawPrevTime > 0 && (a = i), i = i._prev;
                                a && (this._time = t = a._startTime, this._totalTime = t + this._cycle * (this._totalDuration + this._repeatDelay))
                            }
                            this._totalTime = this._time = this._rawPrevTime = t
                        }
                        if (this._time !== d && this._first || n || c || a) {
                            if (this._initted || (this._initted = !0), this._active || !this._paused && this._time !== d && t > 0 && (this._active = !0), 0 === d && this.vars.onStart && (0 === this._time && this._duration || e || this._callback("onStart")), (u = this._time) >= d) for (i = this._first; i && (o = i._next, u === this._time && (!this._paused || m));) (i._active || i._startTime <= u && !i._paused && !i._gc) && (a === i && this.pause(), i._reversed ? i.render((i._dirty ? i.totalDuration() : i._totalDuration) - (t - i._startTime) * i._timeScale, e, n) : i.render((t - i._startTime) * i._timeScale, e, n)), i = o; else for (i = this._last; i && (o = i._prev, u === this._time && (!this._paused || m));) {
                                if (i._active || i._startTime <= d && !i._paused && !i._gc) {
                                    if (a === i) {
                                        for (a = i._prev; a && a.endTime() > this._time;) a.render(a._reversed ? a.totalDuration() - (t - a._startTime) * a._timeScale : (t - a._startTime) * a._timeScale, e, n), a = a._prev;
                                        a = null, this.pause()
                                    }
                                    i._reversed ? i.render((i._dirty ? i.totalDuration() : i._totalDuration) - (t - i._startTime) * i._timeScale, e, n) : i.render((t - i._startTime) * i._timeScale, e, n)
                                }
                                i = o
                            }
                            this._onUpdate && (e || (h.length && l(), this._callback("onUpdate"))), r && (this._gc || p !== this._startTime && g === this._timeScale || (0 === this._time || f >= this.totalDuration()) && (s && (h.length && l(), this._timeline.autoRemoveChildren && this._enabled(!1, !1), this._active = !1), !e && this.vars[r] && this._callback(r)))
                        }
                    }, m._hasPausedChild = function () {
                        for (var t = this._first; t;) {
                            if (t._paused || t instanceof s && t._hasPausedChild()) return !0;
                            t = t._next
                        }
                        return !1
                    }, m.getChildren = function (t, e, i, s) {
                        s = s || -9999999999;
                        for (var o = [], r = this._first, c = 0; r;) r._startTime < s || (r instanceof n ? !1 !== e && (o[c++] = r) : (!1 !== i && (o[c++] = r), !1 !== t && (c = (o = o.concat(r.getChildren(!0, e, i))).length))), r = r._next;
                        return o
                    }, m.getTweensOf = function (t, e) {
                        var i, s, o = this._gc, r = [], c = 0;
                        for (o && this._enabled(!0, !0), s = (i = n.getTweensOf(t)).length; --s > -1;) (i[s].timeline === this || e && this._contains(i[s])) && (r[c++] = i[s]);
                        return o && this._enabled(!1, !0), r
                    }, m.recent = function () {
                        return this._recent
                    }, m._contains = function (t) {
                        for (var e = t.timeline; e;) {
                            if (e === this) return !0;
                            e = e.timeline
                        }
                        return !1
                    }, m.shiftChildren = function (t, e, n) {
                        n = n || 0;
                        for (var i, s = this._first, o = this._labels; s;) s._startTime >= n && (s._startTime += t), s = s._next;
                        if (e) for (i in o) o[i] >= n && (o[i] += t);
                        return this._uncache(!0)
                    }, m._kill = function (t, e) {
                        if (!t && !e) return this._enabled(!1, !1);
                        for (var n = e ? this.getTweensOf(e) : this.getChildren(!0, !0, !1), i = n.length, s = !1; --i > -1;) n[i]._kill(t, e) && (s = !0);
                        return s
                    }, m.clear = function (t) {
                        var e = this.getChildren(!1, !0, !0), n = e.length;
                        for (this._time = this._totalTime = 0; --n > -1;) e[n]._enabled(!1, !1);
                        return !1 !== t && (this._labels = {}), this._uncache(!0)
                    }, m.invalidate = function () {
                        for (var e = this._first; e;) e.invalidate(), e = e._next;
                        return t.prototype.invalidate.call(this)
                    }, m._enabled = function (t, n) {
                        if (t === this._gc) for (var i = this._first; i;) i._enabled(t, !0), i = i._next;
                        return e.prototype._enabled.call(this, t, n)
                    }, m.totalTime = function (e, n, i) {
                        this._forcingPlayhead = !0;
                        var s = t.prototype.totalTime.apply(this, arguments);
                        return this._forcingPlayhead = !1, s
                    }, m.duration = function (t) {
                        return arguments.length ? (0 !== this.duration() && 0 !== t && this.timeScale(this._duration / t), this) : (this._dirty && this.totalDuration(), this._duration)
                    }, m.totalDuration = function (t) {
                        if (!arguments.length) {
                            if (this._dirty) {
                                for (var e, n, i = 0, s = this._last, o = 999999999999; s;) e = s._prev, s._dirty && s.totalDuration(), s._startTime > o && this._sortChildren && !s._paused ? this.add(s, s._startTime - s._delay) : o = s._startTime, s._startTime < 0 && !s._paused && (i -= s._startTime, this._timeline.smoothChildTiming && (this._startTime += s._startTime / this._timeScale), this.shiftChildren(-s._startTime, !1, -9999999999), o = 0), (n = s._startTime + s._totalDuration / s._timeScale) > i && (i = n), s = e;
                                this._duration = this._totalDuration = i, this._dirty = !1
                            }
                            return this._totalDuration
                        }
                        return t && this.totalDuration() ? this.timeScale(this._totalDuration / t) : this
                    }, m.paused = function (e) {
                        if (!e) for (var n = this._first, i = this._time; n;) n._startTime === i && "isPause" === n.data && (n._rawPrevTime = 0), n = n._next;
                        return t.prototype.paused.apply(this, arguments)
                    }, m.usesFrames = function () {
                        for (var e = this._timeline; e._timeline;) e = e._timeline;
                        return e === t._rootFramesTimeline
                    }, m.rawTime = function (t) {
                        return t && (this._paused || this._repeat && this.time() > 0 && this.totalProgress() < 1) ? this._totalTime % (this._duration + this._repeatDelay) : this._paused ? this._totalTime : (this._timeline.rawTime(t) - this._startTime) * this._timeScale
                    }, s
                }, !0)
            }), i._gsDefine && i._gsQueue.pop()(), function (n) {
                var s = function () {
                    return (i.GreenSockGlobals || i).TimelineLite
                };
                "function" == typeof define && define.amd ? define(["TweenLite"], s) : void 0 !== e && e.exports && (t("./TweenLite.js"), e.exports = s())
            }(), cc._RF.pop()
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, { "./TweenLite.js": "TweenLite" }], TweenLite: [function (t, e, n) {
        (function (t) {
            "use strict";
            cc._RF.push(e, "b6dabJ0efJG4qiDEJFbK4Ih", "TweenLite");
            var n = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
                return typeof t
            } : function (t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
            };
            !function (t, i) {
                var s = {}, o = t.document, r = t.GreenSockGlobals = t.GreenSockGlobals || t;
                if (!r.TweenLite) {
                    var c, a, h, l, u, f = function (t) {
                        var e, n = t.split("."), i = r;
                        for (e = 0; e < n.length; e++) i[n[e]] = i = i[n[e]] || {};
                        return i
                    }, d = f("com.greensock"), p = function (t) {
                        var e, n = [], i = t.length;
                        for (e = 0; e !== i; n.push(t[e++]));
                        return n
                    }, g = function () {
                    }, m = function () {
                        var t = Object.prototype.toString, e = t.call([]);
                        return function (i) {
                            return null != i && (i instanceof Array || "object" === (void 0 === i ? "undefined" : n(i)) && !!i.push && t.call(i) === e)
                        }
                    }(), y = {}, v = function n(i, o, c, a) {
                        this.sc = y[i] ? y[i].sc : [], y[i] = this, this.gsClass = null, this.func = c;
                        var h = [];
                        this.check = function (l) {
                            for (var u, d, p, g, m, v = o.length, _ = v; --v > -1;) (u = y[o[v]] || new n(o[v], [])).gsClass ? (h[v] = u.gsClass, _--) : l && u.sc.push(this);
                            if (0 === _ && c) {
                                if (d = ("com.greensock." + i).split("."), p = d.pop(), g = f(d.join("."))[p] = this.gsClass = c.apply(c, h), a) if (r[p] = s[p] = g, !(m = void 0 !== e && e.exports) && "function" == typeof define && define.amd) define((t.GreenSockAMDPath ? t.GreenSockAMDPath + "/" : "") + i.split(".").pop(), [], function () {
                                    return g
                                }); else if (m) if ("TweenLite" === i) {
                                    e.exports = s.TweenLite = g;
                                    for (v in s) g[v] = s[v]
                                } else s.TweenLite && (s.TweenLite[p] = g);
                                for (v = 0; v < this.sc.length; v++) this.sc[v].check()
                            }
                        }, this.check(!0)
                    }, _ = t._gsDefine = function (t, e, n, i) {
                        return new v(t, e, n, i)
                    }, b = d._class = function (t, e, n) {
                        return e = e || function () {
                        }, _(t, [], function () {
                            return e
                        }, n), e
                    };
                    _.globals = r;
                    var C = [0, 0, 1, 1], w = b("easing.Ease", function (t, e, n, i) {
                        this._func = t, this._type = n || 0, this._power = i || 0, this._params = e ? C.concat(e) : C
                    }, !0), k = w.map = {}, T = w.register = function (t, e, n, i) {
                        for (var s, o, r, c, a = e.split(","), h = a.length, l = (n || "easeIn,easeOut,easeInOut").split(","); --h > -1;) for (o = a[h], s = i ? b("easing." + o, null, !0) : d.easing[o] || {}, r = l.length; --r > -1;) c = l[r], k[o + "." + c] = k[c + o] = s[c] = t.getRatio ? t : t[c] || new t
                    };
                    for ((h = w.prototype)._calcEnd = !1, h.getRatio = function (t) {
                        if (this._func) return this._params[0] = t, this._func.apply(null, this._params);
                        var e = this._type, n = this._power,
                            i = 1 === e ? 1 - t : 2 === e ? t : t < .5 ? 2 * t : 2 * (1 - t);
                        return 1 === n ? i *= i : 2 === n ? i *= i * i : 3 === n ? i *= i * i * i : 4 === n && (i *= i * i * i * i), 1 === e ? 1 - i : 2 === e ? i : t < .5 ? i / 2 : 1 - i / 2
                    }, a = (c = ["Linear", "Quad", "Cubic", "Quart", "Quint,Strong"]).length; --a > -1;) h = c[a] + ",Power" + a, T(new w(null, null, 1, a), h, "easeOut", !0), T(new w(null, null, 2, a), h, "easeIn" + (0 === a ? ",easeNone" : "")), T(new w(null, null, 3, a), h, "easeInOut");
                    k.linear = d.easing.Linear.easeIn, k.swing = d.easing.Quad.easeInOut;
                    var A = b("events.EventDispatcher", function (t) {
                        this._listeners = {}, this._eventTarget = t || this
                    });
                    (h = A.prototype).addEventListener = function (t, e, n, i, s) {
                        s = s || 0;
                        var o, r, c = this._listeners[t], a = 0;
                        for (this !== l || u || l.wake(), null == c && (this._listeners[t] = c = []), r = c.length; --r > -1;) (o = c[r]).c === e && o.s === n ? c.splice(r, 1) : 0 === a && o.pr < s && (a = r + 1);
                        c.splice(a, 0, { c: e, s: n, up: i, pr: s })
                    }, h.removeEventListener = function (t, e) {
                        var n, i = this._listeners[t];
                        if (i) for (n = i.length; --n > -1;) if (i[n].c === e) return void i.splice(n, 1)
                    }, h.dispatchEvent = function (t) {
                        var e, n, i, s = this._listeners[t];
                        if (s) for ((e = s.length) > 1 && (s = s.slice(0)), n = this._eventTarget; --e > -1;) (i = s[e]) && (i.up ? i.c.call(i.s || n, {
                            type: t,
                            target: n
                        }) : i.c.call(i.s || n))
                    };
                    var q = t.requestAnimationFrame, B = t.cancelAnimationFrame, P = Date.now || function () {
                        return (new Date).getTime()
                    }, S = P();
                    for (a = (c = ["ms", "moz", "webkit", "o"]).length; --a > -1 && !q;) q = t[c[a] + "RequestAnimationFrame"], B = t[c[a] + "CancelAnimationFrame"] || t[c[a] + "CancelRequestAnimationFrame"];
                    b("Ticker", function (t, e) {
                        var n, i, s, r, c, a = this, h = P(), f = !(!1 === e || !q) && "auto", d = 500, p = 33,
                            m = function t(e) {
                                var o, l, u = P() - S;
                                u > d && (h += u - p), S += u, a.time = (S - h) / 1e3, o = a.time - c, (!n || o > 0 || !0 === e) && (a.frame++, c += o + (o >= r ? .004 : r - o), l = !0), !0 !== e && (s = i(t)), l && a.dispatchEvent("tick")
                            };
                        A.call(a), a.time = a.frame = 0, a.tick = function () {
                            m(!0)
                        }, a.lagSmoothing = function (t, e) {
                            d = t || 1e10, p = Math.min(e, d, 0)
                        }, a.sleep = function () {
                            null != s && (f && B ? B(s) : clearTimeout(s), i = g, s = null, a === l && (u = !1))
                        }, a.wake = function (t) {
                            null !== s ? a.sleep() : t ? h += -S + (S = P()) : a.frame > 10 && (S = P() - d + 5), i = 0 === n ? g : f && q ? q : function (t) {
                                return setTimeout(t, 1e3 * (c - a.time) + 1 | 0)
                            }, a === l && (u = !0), m(2)
                        }, a.fps = function (t) {
                            if (!arguments.length) return n;
                            r = 1 / ((n = t) || 60), c = this.time + r, a.wake()
                        }, a.useRAF = function (t) {
                            if (!arguments.length) return f;
                            a.sleep(), f = t, a.fps(n)
                        }, a.fps(t), setTimeout(function () {
                            "auto" === f && a.frame < 5 && "hidden" !== o.visibilityState && a.useRAF(!1)
                        }, 1500)
                    }), (h = d.Ticker.prototype = new d.events.EventDispatcher).constructor = d.Ticker;
                    var x = b("core.Animation", function (t, e) {
                        if (this.vars = e = e || {}, this._duration = this._totalDuration = t || 0, this._delay = Number(e.delay) || 0, this._timeScale = 1, this._active = !0 === e.immediateRender, this.data = e.data, this._reversed = !0 === e.reversed, V) {
                            u || l.wake();
                            var n = this.vars.useFrames ? Y : V;
                            n.add(this, n._time), this.vars.paused && this.paused(!0)
                        }
                    });
                    l = x.ticker = new d.Ticker, (h = x.prototype)._dirty = h._gc = h._initted = h._paused = !1, h._totalTime = h._time = 0, h._rawPrevTime = -1, h._next = h._last = h._onUpdate = h._timeline = h.timeline = null, h._paused = !1;
                    !function t() {
                        u && P() - S > 2e3 && l.wake(), setTimeout(t, 2e3)
                    }(), h.play = function (t, e) {
                        return null != t && this.seek(t, e), this.reversed(!1).paused(!1)
                    }, h.pause = function (t, e) {
                        return null != t && this.seek(t, e), this.paused(!0)
                    }, h.resume = function (t, e) {
                        return null != t && this.seek(t, e), this.paused(!1)
                    }, h.seek = function (t, e) {
                        return this.totalTime(Number(t), !1 !== e)
                    }, h.restart = function (t, e) {
                        return this.reversed(!1).paused(!1).totalTime(t ? -this._delay : 0, !1 !== e, !0)
                    }, h.reverse = function (t, e) {
                        return null != t && this.seek(t || this.totalDuration(), e), this.reversed(!0).paused(!1)
                    }, h.render = function (t, e, n) {
                    }, h.invalidate = function () {
                        return this._time = this._totalTime = 0, this._initted = this._gc = !1, this._rawPrevTime = -1, !this._gc && this.timeline || this._enabled(!0), this
                    }, h.isActive = function () {
                        var t, e = this._timeline, n = this._startTime;
                        return !e || !this._gc && !this._paused && e.isActive() && (t = e.rawTime(!0)) >= n && t < n + this.totalDuration() / this._timeScale
                    }, h._enabled = function (t, e) {
                        return u || l.wake(), this._gc = !t, this._active = this.isActive(), !0 !== e && (t && !this.timeline ? this._timeline.add(this, this._startTime - this._delay) : !t && this.timeline && this._timeline._remove(this, !0)), !1
                    }, h._kill = function (t, e) {
                        return this._enabled(!1, !1)
                    }, h.kill = function (t, e) {
                        return this._kill(t, e), this
                    }, h._uncache = function (t) {
                        for (var e = t ? this : this.timeline; e;) e._dirty = !0, e = e.timeline;
                        return this
                    }, h._swapSelfInParams = function (t) {
                        for (var e = t.length, n = t.concat(); --e > -1;) "{self}" === t[e] && (n[e] = this);
                        return n
                    }, h._callback = function (t) {
                        var e = this.vars, n = e[t], i = e[t + "Params"], s = e[t + "Scope"] || e.callbackScope || this;
                        switch (i ? i.length : 0) {
                            case 0:
                                n.call(s);
                                break;
                            case 1:
                                n.call(s, i[0]);
                                break;
                            case 2:
                                n.call(s, i[0], i[1]);
                                break;
                            default:
                                n.apply(s, i)
                        }
                    }, h.eventCallback = function (t, e, n, i) {
                        if ("on" === (t || "").substr(0, 2)) {
                            var s = this.vars;
                            if (1 === arguments.length) return s[t];
                            null == e ? delete s[t] : (s[t] = e, s[t + "Params"] = m(n) && -1 !== n.join("").indexOf("{self}") ? this._swapSelfInParams(n) : n, s[t + "Scope"] = i), "onUpdate" === t && (this._onUpdate = e)
                        }
                        return this
                    }, h.delay = function (t) {
                        return arguments.length ? (this._timeline.smoothChildTiming && this.startTime(this._startTime + t - this._delay), this._delay = t, this) : this._delay
                    }, h.duration = function (t) {
                        return arguments.length ? (this._duration = this._totalDuration = t, this._uncache(!0), this._timeline.smoothChildTiming && this._time > 0 && this._time < this._duration && 0 !== t && this.totalTime(this._totalTime * (t / this._duration), !0), this) : (this._dirty = !1, this._duration)
                    }, h.totalDuration = function (t) {
                        return this._dirty = !1, arguments.length ? this.duration(t) : this._totalDuration
                    }, h.time = function (t, e) {
                        return arguments.length ? (this._dirty && this.totalDuration(), this.totalTime(t > this._duration ? this._duration : t, e)) : this._time
                    }, h.totalTime = function (t, e, n) {
                        if (u || l.wake(), !arguments.length) return this._totalTime;
                        if (this._timeline) {
                            if (t < 0 && !n && (t += this.totalDuration()), this._timeline.smoothChildTiming) {
                                this._dirty && this.totalDuration();
                                var i = this._totalDuration, s = this._timeline;
                                if (t > i && !n && (t = i), this._startTime = (this._paused ? this._pauseTime : s._time) - (this._reversed ? i - t : t) / this._timeScale, s._dirty || this._uncache(!1), s._timeline) for (; s._timeline;) s._timeline._time !== (s._startTime + s._totalTime) / s._timeScale && s.totalTime(s._totalTime, !0), s = s._timeline
                            }
                            this._gc && this._enabled(!0, !1), this._totalTime === t && 0 !== this._duration || (E.length && X(), this.render(t, e, !1), E.length && X())
                        }
                        return this
                    }, h.progress = h.totalProgress = function (t, e) {
                        var n = this.duration();
                        return arguments.length ? this.totalTime(n * t, e) : n ? this._time / n : this.ratio
                    }, h.startTime = function (t) {
                        return arguments.length ? (t !== this._startTime && (this._startTime = t, this.timeline && this.timeline._sortChildren && this.timeline.add(this, t - this._delay)), this) : this._startTime
                    }, h.endTime = function (t) {
                        return this._startTime + (0 != t ? this.totalDuration() : this.duration()) / this._timeScale
                    }, h.timeScale = function (t) {
                        if (!arguments.length) return this._timeScale;
                        if (t = t || 1e-10, this._timeline && this._timeline.smoothChildTiming) {
                            var e = this._pauseTime, n = e || 0 === e ? e : this._timeline.totalTime();
                            this._startTime = n - (n - this._startTime) * this._timeScale / t
                        }
                        return this._timeScale = t, this._uncache(!1)
                    }, h.reversed = function (t) {
                        return arguments.length ? (t != this._reversed && (this._reversed = t, this.totalTime(this._timeline && !this._timeline.smoothChildTiming ? this.totalDuration() - this._totalTime : this._totalTime, !0)), this) : this._reversed
                    }, h.paused = function (t) {
                        if (!arguments.length) return this._paused;
                        var e, n, i = this._timeline;
                        return t != this._paused && i && (u || t || l.wake(), n = (e = i.rawTime()) - this._pauseTime, !t && i.smoothChildTiming && (this._startTime += n, this._uncache(!1)), this._pauseTime = t ? e : null, this._paused = t, this._active = this.isActive(), !t && 0 !== n && this._initted && this.duration() && (e = i.smoothChildTiming ? this._totalTime : (e - this._startTime) / this._timeScale, this.render(e, e === this._totalTime, !0))), this._gc && !t && this._enabled(!0, !1), this
                    };
                    var I = b("core.SimpleTimeline", function (t) {
                        x.call(this, 0, t), this.autoRemoveChildren = this.smoothChildTiming = !0
                    });
                    (h = I.prototype = new x).constructor = I, h.kill()._gc = !1, h._first = h._last = h._recent = null, h._sortChildren = !1, h.add = h.insert = function (t, e, n, i) {
                        var s, o;
                        if (t._startTime = Number(e || 0) + t._delay, t._paused && this !== t._timeline && (t._pauseTime = t._startTime + (this.rawTime() - t._startTime) / t._timeScale), t.timeline && t.timeline._remove(t, !0), t.timeline = t._timeline = this, t._gc && t._enabled(!0, !0), s = this._last, this._sortChildren) for (o = t._startTime; s && s._startTime > o;) s = s._prev;
                        return s ? (t._next = s._next, s._next = t) : (t._next = this._first, this._first = t), t._next ? t._next._prev = t : this._last = t, t._prev = s, this._recent = t, this._timeline && this._uncache(!0), this
                    }, h._remove = function (t, e) {
                        return t.timeline === this && (e || t._enabled(!1, !0), t._prev ? t._prev._next = t._next : this._first === t && (this._first = t._next), t._next ? t._next._prev = t._prev : this._last === t && (this._last = t._prev), t._next = t._prev = t.timeline = null, t === this._recent && (this._recent = this._last), this._timeline && this._uncache(!0)), this
                    }, h.render = function (t, e, n) {
                        var i, s = this._first;
                        for (this._totalTime = this._time = this._rawPrevTime = t; s;) i = s._next, (s._active || t >= s._startTime && !s._paused) && (s._reversed ? s.render((s._dirty ? s.totalDuration() : s._totalDuration) - (t - s._startTime) * s._timeScale, e, n) : s.render((t - s._startTime) * s._timeScale, e, n)), s = i
                    }, h.rawTime = function () {
                        return u || l.wake(), this._totalTime
                    };
                    var M = b("TweenLite", function (e, n, i) {
                        if (x.call(this, n, i), this.render = M.prototype.render, null == e) throw "Cannot tween a null target.";
                        this.target = e = "string" != typeof e ? e : M.selector(e) || e;
                        var s, o, r,
                            c = e.jquery || e.length && e !== t && e[0] && (e[0] === t || e[0].nodeType && e[0].style && !e.nodeType),
                            a = this.vars.overwrite;
                        if (this._overwrite = a = null == a ? K[M.defaultOverwrite] : "number" == typeof a ? a >> 0 : K[a], (c || e instanceof Array || e.push && m(e)) && "number" != typeof e[0]) for (this._targets = r = p(e), this._propLookup = [], this._siblings = [], s = 0; s < r.length; s++) (o = r[s]) ? "string" != typeof o ? o.length && o !== t && o[0] && (o[0] === t || o[0].nodeType && o[0].style && !o.nodeType) ? (r.splice(s--, 1), this._targets = r = r.concat(p(o))) : (this._siblings[s] = Q(o, this, !1), 1 === a && this._siblings[s].length > 1 && $(o, this, null, 1, this._siblings[s])) : "string" == typeof (o = r[s--] = M.selector(o)) && r.splice(s + 1, 1) : r.splice(s--, 1); else this._propLookup = {}, this._siblings = Q(e, this, !1), 1 === a && this._siblings.length > 1 && $(e, this, null, 1, this._siblings);
                        (this.vars.immediateRender || 0 === n && 0 === this._delay && !1 !== this.vars.immediateRender) && (this._time = -1e-10, this.render(Math.min(0, -this._delay)))
                    }, !0), F = function (e) {
                        return e && e.length && e !== t && e[0] && (e[0] === t || e[0].nodeType && e[0].style && !e.nodeType)
                    }, R = function (t, e) {
                        var n, i = {};
                        for (n in t) G[n] || n in e && "transform" !== n && "x" !== n && "y" !== n && "width" !== n && "height" !== n && "className" !== n && "border" !== n || !(!z[n] || z[n] && z[n]._autoCSS) || (i[n] = t[n], delete t[n]);
                        t.css = i
                    };
                    (h = M.prototype = new x).constructor = M, h.kill()._gc = !1, h.ratio = 0, h._firstPT = h._targets = h._overwrittenProps = h._startAt = null, h._notifyPluginsOfEnabled = h._lazy = !1, M.version = "1.19.1", M.defaultEase = h._ease = new w(null, null, 1, 1), M.defaultOverwrite = "auto", M.ticker = l, M.autoSleep = 120, M.lagSmoothing = function (t, e) {
                        l.lagSmoothing(t, e)
                    }, M.selector = t.$ || t.jQuery || function (e) {
                        var n = t.$ || t.jQuery;
                        return n ? (M.selector = n, n(e)) : void 0 === o ? e : o.querySelectorAll ? o.querySelectorAll(e) : o.getElementById("#" === e.charAt(0) ? e.substr(1) : e)
                    };
                    var E = [], L = {}, N = /(?:(-|-=|\+=)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi, O = function (t) {
                        for (var e, n = this._firstPT; n;) e = n.blob ? 1 === t ? this.end : t ? this.join("") : this.start : n.c * t + n.s, n.m ? e = n.m(e, this._target || n.t) : e < 1e-6 && e > -1e-6 && !n.blob && (e = 0), n.f ? n.fp ? n.t[n.p](n.fp, e) : n.t[n.p](e) : n.t[n.p] = e, n = n._next
                    }, D = function (t, e, n, i) {
                        var s, o, r, c, a, h, l, u = [], f = 0, d = "", p = 0;
                        for (u.start = t, u.end = e, t = u[0] = t + "", e = u[1] = e + "", n && (n(u), t = u[0], e = u[1]), u.length = 0, s = t.match(N) || [], o = e.match(N) || [], i && (i._next = null, i.blob = 1, u._firstPT = u._applyPT = i), a = o.length, c = 0; c < a; c++) l = o[c], d += (h = e.substr(f, e.indexOf(l, f) - f)) || !c ? h : ",", f += h.length, p ? p = (p + 1) % 5 : "rgba(" === h.substr(-5) && (p = 1), l === s[c] || s.length <= c ? d += l : (d && (u.push(d), d = ""), r = parseFloat(s[c]), u.push(r), u._firstPT = {
                            _next: u._firstPT,
                            t: u,
                            p: u.length - 1,
                            s: r,
                            c: ("=" === l.charAt(1) ? parseInt(l.charAt(0) + "1", 10) * parseFloat(l.substr(2)) : parseFloat(l) - r) || 0,
                            f: 0,
                            m: p && p < 4 ? Math.round : 0
                        }), f += l.length;
                        return (d += e.substr(f)) && u.push(d), u.setRatio = O, u
                    }, U = function (t, e, i, s, o, r, c, a, h) {
                        "function" == typeof s && (s = s(h || 0, t));
                        var l = n(t[e]),
                            u = "function" !== l ? "" : e.indexOf("set") || "function" != typeof t["get" + e.substr(3)] ? e : "get" + e.substr(3),
                            f = "get" !== i ? i : u ? c ? t[u](c) : t[u]() : t[e],
                            d = "string" == typeof s && "=" === s.charAt(1), p = {
                                t: t,
                                p: e,
                                s: f,
                                f: "function" === l,
                                pg: 0,
                                n: o || e,
                                m: r ? "function" == typeof r ? r : Math.round : 0,
                                pr: 0,
                                c: d ? parseInt(s.charAt(0) + "1", 10) * parseFloat(s.substr(2)) : parseFloat(s) - f || 0
                            };
                        if (("number" != typeof f || "number" != typeof s && !d) && (c || isNaN(f) || !d && isNaN(s) || "boolean" == typeof f || "boolean" == typeof s ? (p.fp = c, p = {
                            t: D(f, d ? p.s + p.c : s, a || M.defaultStringFilter, p),
                            p: "setRatio",
                            s: 0,
                            c: 1,
                            f: 2,
                            pg: 0,
                            n: o || e,
                            pr: 0,
                            m: 0
                        }) : (p.s = parseFloat(f), d || (p.c = parseFloat(s) - p.s || 0))), p.c) return (p._next = this._firstPT) && (p._next._prev = p), this._firstPT = p, p
                    }, j = M._internals = { isArray: m, isSelector: F, lazyTweens: E, blobDif: D }, z = M._plugins = {},
                        H = j.tweenLookup = {}, W = 0, G = j.reservedProps = {
                            ease: 1,
                            delay: 1,
                            overwrite: 1,
                            onComplete: 1,
                            onCompleteParams: 1,
                            onCompleteScope: 1,
                            useFrames: 1,
                            runBackwards: 1,
                            startAt: 1,
                            onUpdate: 1,
                            onUpdateParams: 1,
                            onUpdateScope: 1,
                            onStart: 1,
                            onStartParams: 1,
                            onStartScope: 1,
                            onReverseComplete: 1,
                            onReverseCompleteParams: 1,
                            onReverseCompleteScope: 1,
                            onRepeat: 1,
                            onRepeatParams: 1,
                            onRepeatScope: 1,
                            easeParams: 1,
                            yoyo: 1,
                            immediateRender: 1,
                            repeat: 1,
                            repeatDelay: 1,
                            data: 1,
                            paused: 1,
                            reversed: 1,
                            autoCSS: 1,
                            lazy: 1,
                            onOverwrite: 1,
                            callbackScope: 1,
                            stringFilter: 1,
                            id: 1
                        }, K = { none: 0, all: 1, auto: 2, concurrent: 3, allOnStart: 4, preexisting: 5, true: 1, false: 0 },
                        Y = x._rootFramesTimeline = new I, V = x._rootTimeline = new I, J = 30,
                        X = j.lazyRender = function () {
                            var t, e = E.length;
                            for (L = {}; --e > -1;) (t = E[e]) && !1 !== t._lazy && (t.render(t._lazy[0], t._lazy[1], !0), t._lazy = !1);
                            E.length = 0
                        };
                    V._startTime = l.time, Y._startTime = l.frame, V._active = Y._active = !0, setTimeout(X, 1), x._updateRoot = M.render = function () {
                        var t, e, n;
                        if (E.length && X(), V.render((l.time - V._startTime) * V._timeScale, !1, !1), Y.render((l.frame - Y._startTime) * Y._timeScale, !1, !1), E.length && X(), l.frame >= J) {
                            J = l.frame + (parseInt(M.autoSleep, 10) || 120);
                            for (n in H) {
                                for (t = (e = H[n].tweens).length; --t > -1;) e[t]._gc && e.splice(t, 1);
                                0 === e.length && delete H[n]
                            }
                            if ((!(n = V._first) || n._paused) && M.autoSleep && !Y._first && 1 === l._listeners.tick.length) {
                                for (; n && n._paused;) n = n._next;
                                n || l.sleep()
                            }
                        }
                    }, l.addEventListener("tick", x._updateRoot);
                    var Q = function (t, e, n) {
                        var i, s, o = t._gsTweenID;
                        if (H[o || (t._gsTweenID = o = "t" + W++)] || (H[o] = {
                            target: t,
                            tweens: []
                        }), e && (i = H[o].tweens, i[s = i.length] = e, n)) for (; --s > -1;) i[s] === e && i.splice(s, 1);
                        return H[o].tweens
                    }, Z = function (t, e, n, i) {
                        var s, o, r = t.vars.onOverwrite;
                        return r && (s = r(t, e, n, i)), (r = M.onOverwrite) && (o = r(t, e, n, i)), !1 !== s && !1 !== o
                    }, $ = function (t, e, n, i, s) {
                        var o, r, c, a;
                        if (1 === i || i >= 4) {
                            for (a = s.length, o = 0; o < a; o++) if ((c = s[o]) !== e) c._gc || c._kill(null, t, e) && (r = !0); else if (5 === i) break;
                            return r
                        }
                        var h, l = e._startTime + 1e-10, u = [], f = 0, d = 0 === e._duration;
                        for (o = s.length; --o > -1;) (c = s[o]) === e || c._gc || c._paused || (c._timeline !== e._timeline ? (h = h || tt(e, 0, d), 0 === tt(c, h, d) && (u[f++] = c)) : c._startTime <= l && c._startTime + c.totalDuration() / c._timeScale > l && ((d || !c._initted) && l - c._startTime <= 2e-10 || (u[f++] = c)));
                        for (o = f; --o > -1;) if (c = u[o], 2 === i && c._kill(n, t, e) && (r = !0), 2 !== i || !c._firstPT && c._initted) {
                            if (2 !== i && !Z(c, e)) continue;
                            c._enabled(!1, !1) && (r = !0)
                        }
                        return r
                    }, tt = function (t, e, n) {
                        for (var i = t._timeline, s = i._timeScale, o = t._startTime; i._timeline;) {
                            if (o += i._startTime, s *= i._timeScale, i._paused) return -100;
                            i = i._timeline
                        }
                        return (o /= s) > e ? o - e : n && o === e || !t._initted && o - e < 2e-10 ? 1e-10 : (o += t.totalDuration() / t._timeScale / s) > e + 1e-10 ? 0 : o - e - 1e-10
                    };
                    h._init = function () {
                        var t, e, n, i, s, o, r = this.vars, c = this._overwrittenProps, a = this._duration,
                            h = !!r.immediateRender, l = r.ease;
                        if (r.startAt) {
                            this._startAt && (this._startAt.render(-1, !0), this._startAt.kill()), s = {};
                            for (i in r.startAt) s[i] = r.startAt[i];
                            if (s.overwrite = !1, s.immediateRender = !0, s.lazy = h && !1 !== r.lazy, s.startAt = s.delay = null, this._startAt = M.to(this.target, 0, s), h) if (this._time > 0) this._startAt = null; else if (0 !== a) return
                        } else if (r.runBackwards && 0 !== a) if (this._startAt) this._startAt.render(-1, !0), this._startAt.kill(), this._startAt = null; else {
                            0 !== this._time && (h = !1), n = {};
                            for (i in r) G[i] && "autoCSS" !== i || (n[i] = r[i]);
                            if (n.overwrite = 0, n.data = "isFromStart", n.lazy = h && !1 !== r.lazy, n.immediateRender = h, this._startAt = M.to(this.target, 0, n), h) {
                                if (0 === this._time) return
                            } else this._startAt._init(), this._startAt._enabled(!1), this.vars.immediateRender && (this._startAt = null)
                        }
                        if (this._ease = l = l ? l instanceof w ? l : "function" == typeof l ? new w(l, r.easeParams) : k[l] || M.defaultEase : M.defaultEase, r.easeParams instanceof Array && l.config && (this._ease = l.config.apply(l, r.easeParams)), this._easeType = this._ease._type, this._easePower = this._ease._power, this._firstPT = null, this._targets) for (o = this._targets.length, t = 0; t < o; t++) this._initProps(this._targets[t], this._propLookup[t] = {}, this._siblings[t], c ? c[t] : null, t) && (e = !0); else e = this._initProps(this.target, this._propLookup, this._siblings, c, 0);
                        if (e && M._onPluginEvent("_onInitAllProps", this), c && (this._firstPT || "function" != typeof this.target && this._enabled(!1, !1)), r.runBackwards) for (n = this._firstPT; n;) n.s += n.c, n.c = -n.c, n = n._next;
                        this._onUpdate = r.onUpdate, this._initted = !0
                    }, h._initProps = function (e, n, i, s, o) {
                        var r, c, a, h, l, u;
                        if (null == e) return !1;
                        L[e._gsTweenID] && X(), this.vars.css || e.style && e !== t && e.nodeType && z.css && !1 !== this.vars.autoCSS && R(this.vars, e);
                        for (r in this.vars) if (u = this.vars[r], G[r]) u && (u instanceof Array || u.push && m(u)) && -1 !== u.join("").indexOf("{self}") && (this.vars[r] = u = this._swapSelfInParams(u, this)); else if (z[r] && (h = new z[r])._onInitTween(e, this.vars[r], this, o)) {
                            for (this._firstPT = l = {
                                _next: this._firstPT,
                                t: h,
                                p: "setRatio",
                                s: 0,
                                c: 1,
                                f: 1,
                                n: r,
                                pg: 1,
                                pr: h._priority,
                                m: 0
                            }, c = h._overwriteProps.length; --c > -1;) n[h._overwriteProps[c]] = this._firstPT;
                            (h._priority || h._onInitAllProps) && (a = !0), (h._onDisable || h._onEnable) && (this._notifyPluginsOfEnabled = !0), l._next && (l._next._prev = l)
                        } else n[r] = U.call(this, e, r, "get", u, r, 0, null, this.vars.stringFilter, o);
                        return s && this._kill(s, e) ? this._initProps(e, n, i, s, o) : this._overwrite > 1 && this._firstPT && i.length > 1 && $(e, this, n, this._overwrite, i) ? (this._kill(n, e), this._initProps(e, n, i, s, o)) : (this._firstPT && (!1 !== this.vars.lazy && this._duration || this.vars.lazy && !this._duration) && (L[e._gsTweenID] = !0), a)
                    }, h.render = function (t, e, n) {
                        var i, s, o, r, c = this._time, a = this._duration, h = this._rawPrevTime;
                        if (t >= a - 1e-7 && t >= 0) this._totalTime = this._time = a, this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1, this._reversed || (i = !0, s = "onComplete", n = n || this._timeline.autoRemoveChildren), 0 === a && (this._initted || !this.vars.lazy || n) && (this._startTime === this._timeline._duration && (t = 0), (h < 0 || t <= 0 && t >= -1e-7 || 1e-10 === h && "isPause" !== this.data) && h !== t && (n = !0, h > 1e-10 && (s = "onReverseComplete")), this._rawPrevTime = r = !e || t || h === t ? t : 1e-10); else if (t < 1e-7) this._totalTime = this._time = 0, this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0, (0 !== c || 0 === a && h > 0) && (s = "onReverseComplete", i = this._reversed), t < 0 && (this._active = !1, 0 === a && (this._initted || !this.vars.lazy || n) && (h >= 0 && (1e-10 !== h || "isPause" !== this.data) && (n = !0), this._rawPrevTime = r = !e || t || h === t ? t : 1e-10)), this._initted || (n = !0); else if (this._totalTime = this._time = t, this._easeType) {
                            var l = t / a, u = this._easeType, f = this._easePower;
                            (1 === u || 3 === u && l >= .5) && (l = 1 - l), 3 === u && (l *= 2), 1 === f ? l *= l : 2 === f ? l *= l * l : 3 === f ? l *= l * l * l : 4 === f && (l *= l * l * l * l), this.ratio = 1 === u ? 1 - l : 2 === u ? l : t / a < .5 ? l / 2 : 1 - l / 2
                        } else this.ratio = this._ease.getRatio(t / a);
                        if (this._time !== c || n) {
                            if (!this._initted) {
                                if (this._init(), !this._initted || this._gc) return;
                                if (!n && this._firstPT && (!1 !== this.vars.lazy && this._duration || this.vars.lazy && !this._duration)) return this._time = this._totalTime = c, this._rawPrevTime = h, E.push(this), void (this._lazy = [t, e]);
                                this._time && !i ? this.ratio = this._ease.getRatio(this._time / a) : i && this._ease._calcEnd && (this.ratio = this._ease.getRatio(0 === this._time ? 0 : 1))
                            }
                            for (!1 !== this._lazy && (this._lazy = !1), this._active || !this._paused && this._time !== c && t >= 0 && (this._active = !0), 0 === c && (this._startAt && (t >= 0 ? this._startAt.render(t, e, n) : s || (s = "_dummyGS")), this.vars.onStart && (0 === this._time && 0 !== a || e || this._callback("onStart"))), o = this._firstPT; o;) o.f ? o.t[o.p](o.c * this.ratio + o.s) : o.t[o.p] = o.c * this.ratio + o.s, o = o._next;
                            this._onUpdate && (t < 0 && this._startAt && -1e-4 !== t && this._startAt.render(t, e, n), e || (this._time !== c || i || n) && this._callback("onUpdate")), s && (this._gc && !n || (t < 0 && this._startAt && !this._onUpdate && -1e-4 !== t && this._startAt.render(t, e, n), i && (this._timeline.autoRemoveChildren && this._enabled(!1, !1), this._active = !1), !e && this.vars[s] && this._callback(s), 0 === a && 1e-10 === this._rawPrevTime && 1e-10 !== r && (this._rawPrevTime = 0)))
                        }
                    }, h._kill = function (t, e, i) {
                        if ("all" === t && (t = null), null == t && (null == e || e === this.target)) return this._lazy = !1, this._enabled(!1, !1);
                        e = "string" != typeof e ? e || this._targets || this.target : M.selector(e) || e;
                        var s, o, r, c, a, h, l, u, f,
                            d = i && this._time && i._startTime === this._startTime && this._timeline === i._timeline;
                        if ((m(e) || F(e)) && "number" != typeof e[0]) for (s = e.length; --s > -1;) this._kill(t, e[s], i) && (h = !0); else {
                            if (this._targets) {
                                for (s = this._targets.length; --s > -1;) if (e === this._targets[s]) {
                                    a = this._propLookup[s] || {}, this._overwrittenProps = this._overwrittenProps || [], o = this._overwrittenProps[s] = t ? this._overwrittenProps[s] || {} : "all";
                                    break
                                }
                            } else {
                                if (e !== this.target) return !1;
                                a = this._propLookup, o = this._overwrittenProps = t ? this._overwrittenProps || {} : "all"
                            }
                            if (a) {
                                if (l = t || a, u = t !== o && "all" !== o && t !== a && ("object" !== (void 0 === t ? "undefined" : n(t)) || !t._tempKill), i && (M.onOverwrite || this.vars.onOverwrite)) {
                                    for (r in l) a[r] && (f || (f = []), f.push(r));
                                    if ((f || !t) && !Z(this, i, e, f)) return !1
                                }
                                for (r in l) (c = a[r]) && (d && (c.f ? c.t[c.p](c.s) : c.t[c.p] = c.s, h = !0), c.pg && c.t._kill(l) && (h = !0), c.pg && 0 !== c.t._overwriteProps.length || (c._prev ? c._prev._next = c._next : c === this._firstPT && (this._firstPT = c._next), c._next && (c._next._prev = c._prev), c._next = c._prev = null), delete a[r]), u && (o[r] = 1);
                                !this._firstPT && this._initted && this._enabled(!1, !1)
                            }
                        }
                        return h
                    }, h.invalidate = function () {
                        return this._notifyPluginsOfEnabled && M._onPluginEvent("_onDisable", this), this._firstPT = this._overwrittenProps = this._startAt = this._onUpdate = null, this._notifyPluginsOfEnabled = this._active = this._lazy = !1, this._propLookup = this._targets ? {} : [], x.prototype.invalidate.call(this), this.vars.immediateRender && (this._time = -1e-10, this.render(Math.min(0, -this._delay))), this
                    }, h._enabled = function (t, e) {
                        if (u || l.wake(), t && this._gc) {
                            var n, i = this._targets;
                            if (i) for (n = i.length; --n > -1;) this._siblings[n] = Q(i[n], this, !0); else this._siblings = Q(this.target, this, !0)
                        }
                        return x.prototype._enabled.call(this, t, e), !(!this._notifyPluginsOfEnabled || !this._firstPT) && M._onPluginEvent(t ? "_onEnable" : "_onDisable", this)
                    }, M.to = function (t, e, n) {
                        return new M(t, e, n)
                    }, M.from = function (t, e, n) {
                        return n.runBackwards = !0, n.immediateRender = 0 != n.immediateRender, new M(t, e, n)
                    }, M.fromTo = function (t, e, n, i) {
                        return i.startAt = n, i.immediateRender = 0 != i.immediateRender && 0 != n.immediateRender, new M(t, e, i)
                    }, M.delayedCall = function (t, e, n, i, s) {
                        return new M(e, 0, {
                            delay: t,
                            onComplete: e,
                            onCompleteParams: n,
                            callbackSlogincope: i,
                            onReverseComplete: e,
                            onReverseCompleteParams: n,
                            immediateRender: !1,
                            lazy: !1,
                            useFrames: s,
                            overwrite: 0
                        })
                    }, M.set = function (t, e) {
                        return new M(t, 0, e)
                    }, M.getTweensOf = function (t, e) {
                        if (null == t) return [];
                        t = "string" != typeof t ? t : M.selector(t) || t;
                        var n, i, s, o;
                        if ((m(t) || F(t)) && "number" != typeof t[0]) {
                            for (n = t.length, i = []; --n > -1;) i = i.concat(M.getTweensOf(t[n], e));
                            for (n = i.length; --n > -1;) for (o = i[n], s = n; --s > -1;) o === i[s] && i.splice(n, 1)
                        } else for (n = (i = Q(t).concat()).length; --n > -1;) (i[n]._gc || e && !i[n].isActive()) && i.splice(n, 1);
                        return i
                    }, M.killTweensOf = M.killDelayedCallsTo = function (t, e, i) {
                        "object" === (void 0 === e ? "undefined" : n(e)) && (i = e, e = !1);
                        for (var s = M.getTweensOf(t, e), o = s.length; --o > -1;) s[o]._kill(i, t)
                    };
                    var et = b("plugins.TweenPlugin", function (t, e) {
                        this._overwriteProps = (t || "").split(","), this._propName = this._overwriteProps[0], this._priority = e || 0, this._super = et.prototype
                    }, !0);
                    if (h = et.prototype, et.version = "1.19.0", et.API = 2, h._firstPT = null, h._addTween = U, h.setRatio = O, h._kill = function (t) {
                        var e, n = this._overwriteProps, i = this._firstPT;
                        if (null != t[this._propName]) this._overwriteProps = []; else for (e = n.length; --e > -1;) null != t[n[e]] && n.splice(e, 1);
                        for (; i;) null != t[i.n] && (i._next && (i._next._prev = i._prev), i._prev ? (i._prev._next = i._next, i._prev = null) : this._firstPT === i && (this._firstPT = i._next)), i = i._next;
                        return !1
                    }, h._mod = h._roundProps = function (t) {
                        for (var e, n = this._firstPT; n;) (e = t[this._propName] || null != n.n && t[n.n.split(this._propName + "_").join("")]) && "function" == typeof e && (2 === n.f ? n.t._applyPT.m = e : n.m = e), n = n._next
                    }, M._onPluginEvent = function (t, e) {
                        var n, i, s, o, r, c = e._firstPT;
                        if ("_onInitAllProps" === t) {
                            for (; c;) {
                                for (r = c._next, i = s; i && i.pr > c.pr;) i = i._next;
                                (c._prev = i ? i._prev : o) ? c._prev._next = c : s = c, (c._next = i) ? i._prev = c : o = c, c = r
                            }
                            c = e._firstPT = s
                        }
                        for (; c;) c.pg && "function" == typeof c.t[t] && c.t[t]() && (n = !0), c = c._next;
                        return n
                    }, et.activate = function (t) {
                        for (var e = t.length; --e > -1;) t[e].API === et.API && (z[(new t[e])._propName] = t[e]);
                        return !0
                    }, _.plugin = function (t) {
                        if (!(t && t.propName && t.init && t.API)) throw "illegal plugin definition.";
                        var e, n = t.propName, i = t.priority || 0, s = t.overwriteProps, o = {
                            init: "_onInitTween",
                            set: "setRatio",
                            kill: "_kill",
                            round: "_mod",
                            mod: "_mod",
                            initAll: "_onInitAllProps"
                        }, r = b("plugins." + n.charAt(0).toUpperCase() + n.substr(1) + "Plugin", function () {
                            et.call(this, n, i), this._overwriteProps = s || []
                        }, !0 === t.global), c = r.prototype = new et(n);
                        c.constructor = r, r.API = t.API;
                        for (e in o) "function" == typeof t[e] && (c[o[e]] = t[e]);
                        return r.version = t.version, et.activate([r]), r
                    }, c = t._gsQueue) {
                        for (a = 0; a < c.length; a++) c[a]();
                        for (h in y) y[h].func || t.console.log("GSAP encountered missing dependency: " + h)
                    }
                    u = !1
                }
            }(void 0 !== e && e.exports && void 0 !== t ? t : window), cc._RF.pop()
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {}], UserInfoWinChild: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "27d86DKpzVCXqCj4AYZBITz", "UserInfoWinChild"), cc.Class({
            extends: cc.Component, properties: { lblName: cc.EditBox, lblfree: cc.Label }, onLoad: function () {
            }, onEnable: function () {
                this.globnum = this.lblfree.node.getChildByName("globnum"), this.glob = this.lblfree.node.getChildByName("glob"), 0 == cc.yqs.userMgr.RenameCount ? (this.lblfree.string = "本次修改免费", this.globnum.active = !1, this.glob.active = !1) : (this.lblfree.string = "本次修改花费", this.globnum.active = !0, this.glob.active = !0)
            }, btnqueding: function () {
                var t = "";
                "" == this.lblName.string ? (cc.yqs.alert.show("", "名字不能为空"), cc.yqs.userMgr.RenameCount--) : this.globnum.active ? this.globnum.active && cc.yqs.userMgr.gems >= 1 ? (t = this.lblName.string, cc.yqs.Hall.lblName.string = t, cc.yqs.UsrInfoWin.lblName.string = t, cc.yqs.userMgr.reName(t, 1), cc.yqs.userMgr.gems--, cc.yqs.alert.show("", "修改成功")) : this.globnum.active && cc.yqs.userMgr.gems < 1 && (cc.yqs.Hall.lblGems.string = "", cc.yqs.alert.show("", "修改失败，金币不足")) : (t = this.lblName.string, cc.yqs.Hall.lblName.string = t, cc.yqs.UsrInfoWin.lblName.string = t, cc.yqs.userMgr.reName(t, 0), cc.yqs.alert.show("", "修改成功")), console.log("修改的次数" + cc.yqs.userMgr.RenameCount), console.log("游戏币" + cc.yqs.userMgr.gems), cc.yqs.userMgr.RenameCount++, cc.yqs.Hall.lblGems.string = cc.yqs.userMgr.gems + ".000", this.node.active = !1
            }, btnBack: function () {
                this.node.active = !1
            }
        }), cc._RF.pop()
    }, {}], UserInfoWin: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "2f0bfD1eEdDbZ2Oy9CrDHFQ", "UserInfoWin"), cc.Class({
            extends: cc.Component,
            properties: {
                commonBg: cc.Node,
                AvatarWin: cc.Node,
                ItemInfoWin: cc.Node,
                BenifitWin: cc.Node,
                lblName: cc.Label,
                lblAccount: cc.Label,
                xiugainicheng: cc.Node,
                daojunum: cc.Label
            },
            onLoad: function () {
                cc.yqs.UsrInfoWin = this, this.lblName.string = cc.yqs.userMgr.userName, this.lblAccount.string = cc.yqs.userMgr.account, this.daojunum.string = cc.yqs.userMgr.item.ice
            },
            onEnable: function () {
                this.commonBg.scale = .2;
                var t = cc.scaleTo(.2, 1.2), e = cc.scaleTo(.1, 1);
                this.commonBg.runAction(cc.sequence(t, e))
            },
            onChangeName: function () {
                this.xiugainicheng.active = !0
            },
            onAvatarClick: function () {
                this.AvatarWin.active = !0
            },
            onVip: function () {
                this.BenifitWin.active = !0, this.active = !1
            },
            onBindPhone: function () {
                cc.yqs.alert.show("", "敬请期待")
            },
            onItemInfo: function () {
                this.ItemInfoWin.active = !0
            },
            onBtnClicked: function (t) {
            },
            onBack: function () {
                var t = cc.scaleTo(.1, 1.2), e = cc.scaleTo(.2, .6), n = cc.callFunc(function () {
                    this.node.active = !1
                }, this);
                this.commonBg.runAction(cc.sequence(t, e, n))
            }
        }), cc._RF.pop()
    }, {}], UserMgr: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "38d89HemsNN3phAA06hQx9b", "UserMgr");
        var i = t("crypto");
        cc.Class({
            extends: cc.Component,
            properties: {
                account: null,
                userId: null,
                userName: null,
                headimg: 0,
                lv: 0,
                exp: 0,
                coins: 0,
                vip: 0,
                money: 0,
                gems: 0,
                sign: 0,
                ip: "",
                sex: 0,
                roomData: null,
                chairId: 1,
                headId: 1,
                RenameCount: 0,
                ReHeadCount: 0,
                item: null
            },
            guestAuth: function () {
                var t = cc.args.account;
                var sign = localStorage.getItem("sign");
                null == t && (t = cc.sys.localStorage.getItem("account")), null == t && (t = Date.now(), cc.sys.localStorage.setItem("account", t)), cc.yqs.http.sendRequest("/guest", { account: t, sign: sign }, this.onAuth)
            },
            onAuth: function (t) {
                var e = cc.yqs.userMgr;
                //modify ljw
                if (0 !== t.errcode) {
                    location.href = t.qqLoginUrl
                    return
                }
                0 !== t.errcode ? console.log(t.errmsg) : (e.account = t.account, e.sign = t.sign, cc.yqs.http.url = "http://" + cc.yqs.SI.hall, e.login())
            },
            login: function () {
                var t = this;
                cc.yqs.wc.show("正在登录游戏"), cc.yqs.http.sendRequest("/login", {
                    account: this.account,
                    sign: this.sign
                }, function (e) {
                    0 !== e.errcode ? console.log(e.errmsg) : e.userid ? (console.log(e), t.account = e.account, t.userId = e.userid, t.userName = e.name, t.headimg = e.headimg, t.lv = e.lv, t.exp = e.exp, t.coins = e.coins, t.vip = e.vip, t.money = e.money, t.gems = parseFloat(e.gems / 1e3).toFixed(3), t.roomData = e.roomid, t.sex = e.sex, t.ip = e.ip, t.RenameCount = e.RenameCount, t.ReHeadCount = e.ReHeadCount, t.item = e.item, cc.director.loadScene("hall")) : cc.director.loadScene("createrole")
                })
            },
            create: function (t) {
                var e = this, n = { account: this.account, sign: this.sign, name: t };
                cc.yqs.http.sendRequest("/create_user", n, function (t) {
                    0 !== t.errcode ? console.log(t.errmsg) : e.login()
                })
            },
            reName: function (t, e) {
                var n = { userId: this.userId, NewName: t, gems: 1e3 * e };
                n.sign = i.md5(this.userId + t + n.gems), cc.yqs.http.sendRequest("/rename_user", n, function (t) {
                })
            },
            enterRoom: function (t, e) {
                var n = this, i = { account: cc.yqs.userMgr.account, sign: cc.yqs.userMgr.sign, roomid: t };
                cc.yqs.wc.show("正在进入房间 " + t), cc.yqs.http.sendRequest("/enter_private_room", i, function (i) {
                    0 !== i.errcode ? -1 == i.errcode ? setTimeout(function () {
                        n.enterRoom(t, e)
                    }, 5e3) : (cc.yqs.wc.hide(), null != e && e(i)) : null != e && e(i)
                })
            },
            enterPublicRoom: function (t, e) {
                var n = this;
                t = Math.round(1e3 * t);
                var i = { account: cc.yqs.userMgr.account, sign: cc.yqs.userMgr.sign, baseParam: t };
                cc.yqs.http.sendRequest("/enter_public_room", i, function (t) {
                    0 !== t.errcode ? -1 == t.errcode ? setTimeout(function () {
                        n.enterPublicRoom(roomId, e)
                    }, 5e3) : (cc.yqs.wc.hide(), null != e && e(t)) : null != e && e(t)
                })
            },
            getHistoryList: function (t) {
                var e = { account: cc.yqs.userMgr.account, sign: cc.yqs.userMgr.sign };
                cc.yqs.http.sendRequest("/get_history_list", e, function (e) {
                    0 !== e.errcode ? console.log(e.errmsg) : (console.log(e.history), null != t && t(e.history))
                })
            },
            getGamesOfRoom: function (t, e) {
                var n = { account: cc.yqs.userMgr.account, sign: cc.yqs.userMgr.sign, uuid: t };
                cc.yqs.http.sendRequest("/get_games_of_room", n, function (t) {
                    0 !== t.errcode ? console.log(t.errmsg) : (console.log(t.data), e(t.data))
                })
            },
            getDetailOfGame: function (t, e, n) {
                var i = { account: cc.yqs.userMgr.account, sign: cc.yqs.userMgr.sign, uuid: t, index: e };
                cc.yqs.http.sendRequest("/get_detail_of_game", i, function (t) {
                    0 !== t.errcode ? console.log(t.errmsg) : (console.log(t.data), n(t.data))
                })
            }
        }), cc._RF.pop()
    }, { crypto: "crypto" }], Utils: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "4e9a7iZTuZLtK5Bqz2Hu3Pg", "Utils"), cc.Class({
            extends: cc.Component,
            properties: {},
            addClickEvent: function (t, e, n, i) {
                var s = new cc.Component.EventHandler;
                s.target = e, s.component = n, s.handler = i, t.getComponent(cc.Button).clickEvents.push(s)
            },
            addSlideEvent: function (t, e, n, i) {
                var s = new cc.Component.EventHandler;
                s.target = e, s.component = n, s.handler = i, t.getComponent(cc.Slider).slideEvents.push(s)
            },
            convertPos: function (t, e, n) {
                var i = t.convertToWorldSpaceAR(n);
                return e.convertToNodeSpaceAR(i)
            },
            transString: function (t) {
                var e = t.toString();
                return (e = (e = e.replace("+", "/")).replace("元", ":")).replace(".", ";")
            },
            getOutOfView: function (t) {
                var e = cc.view.getVisibleSize(), n = t.position;
                return n.x < 0 - e.width / 2 || n.y < 0 - e.height / 2 || n.x > e.width / 2 || n.y > e.height / 2
            }
        }), cc._RF.pop()
    }, {}], WaitingConnection: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "618d6XNdn9JY7RvLKAaquUn", "WaitingConnection"), cc.Class({
            extends: cc.Component,
            properties: { target: cc.Node, _isShow: !1, lblContent: cc.Label },
            onLoad: function () {
                if (null == cc.yqs) return null;
                cc.yqs.wc = this, this.node.active = this._isShow
            },
            update: function (t) {
                this.target.rotation = this.target.rotation - 45 * t
            },
            show: function (t) {
                this._isShow = !0, this.node && (this.node.active = this._isShow), this.lblContent && (null == t && (t = ""), this.lblContent.string = t)
            },
            hide: function () {
                this._isShow = !1, this.node && (this.node.active = this._isShow)
            }
        }), cc._RF.pop()
    }, {}], XiaoxiWin: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "be1b0JuRU5E5oOe/6JZr6jj", "XiaoxiWin"), cc.Class({
            extends: cc.Component,
            properties: { commonBg: cc.Node },
            onLoad: function () {
            },
            onEnable: function () {
                this.commonBg.scale = .2;
                var t = cc.scaleTo(.2, 1.2), e = cc.scaleTo(.1, 1);
                this.commonBg.runAction(cc.sequence(t, e))
            },
            onBtnClicked: function (t) {
            },
            onBack: function () {
                var t = cc.scaleTo(.1, 1.2), e = cc.scaleTo(.2, .6), n = cc.callFunc(function () {
                    this.node.active = !1
                }, this);
                this.commonBg.runAction(cc.sequence(t, e, n))
            }
        }), cc._RF.pop()
    }, {}], bomb: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "43badzRjsRE3L6vv2DxM6Dq", "bomb"), cc.Class({
            extends: cc.Component,
            properties: { gold: { default: null, type: cc.Label } },
            onLoad: function () {
                this.loopResult = .1, this.intial = 10, this.loopFinish = !1
            },
            setScore: function (t) {
                this.loopFinish = !1, this.loopResult = t
            },
            update: function (t) {
                this.loopFinish || (this.intial > this.loopResult ? (this.intial = this.intial - .111, this.intial = parseFloat(this.intial), this.gold.string = cc.yqs.utils.transString(this.intial.toFixed(3))) : (this.loopResult = parseFloat(this.loopResult), this.gold.string = cc.yqs.utils.transString(this.loopResult.toFixed(3)), this.loopFinish = !0, this.intial = 10))
            },
            numberUpdate: function () {
                j -= .001, console.log("@@@@@@@@@@@@@@@@@@@@@@@@" + j + "@@@@@@@" + i + "@@@@@@@@@@@@@@@@@@@@@@@@@"), this.gold.string = cc.yqs.utils.transString(j.toFixed(3)) + ":"
            },
            playbomb: function (t) {
                var t = parseFloat(t);
                this.gold.string = cc.yqs.utils.transString(t.toFixed(3)) + ":"
            }
        }), cc._RF.pop()
    }, {}], coinText: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "a6c7bvVngxNHJC154GAWS4Y", "coinText"), cc.Class({
            extends: cc.Component,
            properties: { kind: { default: 0, visible: !1 } },
            onLoad: function () {
            },
            initWithKind: function (t, e, n) {
                if (null != n) {
                    this.node.getComponent(cc.Label).string = cc.yqs.utils.transString(e), this.node.parent = n.parent, this.node.setLocalZOrder(300), this.node.position = n.position, this.kind = t;
                    var i = cc.callFunc(this.putCoinTextToPool, this);
                    this.node.runAction(cc.sequence(cc.spawn(cc.moveBy(.5, cc.p(0, 50)), cc.fadeTo(.5, 120)), i))
                }
            },
            putCoinTextToPool: function () {
                var t = this;
                this.node.opacity = 255, this.node.removeFromParent(), cc.yqs.nodepool.putCoinTextById(t.node, t.kind)
            }
        }), cc._RF.pop()
    }, {}], crypto: [function (t, e, n) {
        (function (i) {
            "use strict";
            cc._RF.push(e, "af0d0ASg9JHaK1Qlg5Z3yPF", "crypto");
            t("myMd5");
            n.md5 = function (t) {
                return cc.md5Encode(t + "~!@#$(*&^%$&").toLowerCase()
            }, n.toBase64 = function (t) {
                return new i(t).toString("base64")
            }, n.fromBase64 = function (t) {
                return new i(t, "base64").toString()
            }, cc._RF.pop()
        }).call(this, t("buffer").Buffer)
    }, { buffer: 2, myMd5: "myMd5" }], kor: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "745db7TA4FAFokni5dIIR2p", "kor"), window.i18n || (window.i18n = {}), window.i18n.languages || (window.i18n.languages = {}), window.i18n.languages.kor = {
            hello: "你好！",
            bye: "再见！"
        }, cc._RF.pop()
    }, {}], myMd5: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "a36f9gbmoRBN7apzW3P7bGH", "myMd5"), cc.md5Encode = function (t) {
            function e(t) {
                try {
                    console.log(t)
                } catch (t) {
                }
            }

            function n(t) {
                var e = (t >>> 24).toString(16), n = (16777215 & t).toString(16);
                return "00".substr(0, 2 - e.length) + e + "000000".substr(0, 6 - n.length) + n
            }

            function i(t, e) {
                return t << e & 4294967295 | t >>> 32 - e
            }

            function s(t, e, n) {
                return t & e | ~t & n
            }

            function o(t, e, n) {
                return n & t | ~n & e
            }

            function r(t, e, n) {
                return t ^ e ^ n
            }

            function c(t, e, n) {
                return e ^ (t | ~n)
            }

            function a(t, e) {
                return t[e + 3] << 24 | t[e + 2] << 16 | t[e + 1] << 8 | t[e]
            }

            function h(t) {
                for (var e = [], n = 0; n < t.length; n++) if (t.charCodeAt(n) <= 127) e.push(t.charCodeAt(n)); else for (var i = encodeURIComponent(t.charAt(n)).substr(1).split("%"), s = 0; s < i.length; s++) e.push(parseInt(i[s], 16));
                return e
            }

            function l(t, e) {
                return 4294967295 & t + e
            }

            var u = null;
            if ("string" == typeof t) u = h(t); else {
                if (t.constructor != Array) return e("input data type mismatch"), null;
                if (0 === t.length) u = t; else if ("string" == typeof t[0]) u = function (t) {
                    for (var e = [], n = 0; n < t.length; n++) e = e.concat(h(t[n]));
                    return e
                }(t); else {
                    if ("number" != typeof t[0]) return e("input data type mismatch"), null;
                    u = t
                }
            }
            var f = u.length;
            u.push(128);
            var d = u.length % 64;
            if (d > 56) {
                for (var p = 0; p < 64 - d; p++) u.push(0);
                d = u.length % 64
            }
            for (p = 0; p < 56 - d; p++) u.push(0);
            u = u.concat(function (t) {
                for (var e = [], n = 0; n < 8; n++) e.push(255 & t), t >>>= 8;
                return e
            }(8 * f));
            var g = 1732584193, m = 4023233417, y = 2562383102, v = 271733878, _ = 0, b = 0, C = 0, w = 0,
                k = function (t, e, n, s) {
                    var o = w;
                    w = C, C = b, b = l(b, i(l(_, l(t, l(e, n))), s)), _ = o
                };
            for (p = 0; p < u.length / 64; p++) {
                _ = g;
                var T = 64 * p;
                k(s(b = m, C = y, w = v), 3614090360, a(u, T), 7), k(s(b, C, w), 3905402710, a(u, T + 4), 12), k(s(b, C, w), 606105819, a(u, T + 8), 17), k(s(b, C, w), 3250441966, a(u, T + 12), 22), k(s(b, C, w), 4118548399, a(u, T + 16), 7), k(s(b, C, w), 1200080426, a(u, T + 20), 12), k(s(b, C, w), 2821735955, a(u, T + 24), 17), k(s(b, C, w), 4249261313, a(u, T + 28), 22), k(s(b, C, w), 1770035416, a(u, T + 32), 7), k(s(b, C, w), 2336552879, a(u, T + 36), 12), k(s(b, C, w), 4294925233, a(u, T + 40), 17), k(s(b, C, w), 2304563134, a(u, T + 44), 22), k(s(b, C, w), 1804603682, a(u, T + 48), 7), k(s(b, C, w), 4254626195, a(u, T + 52), 12), k(s(b, C, w), 2792965006, a(u, T + 56), 17), k(s(b, C, w), 1236535329, a(u, T + 60), 22), k(o(b, C, w), 4129170786, a(u, T + 4), 5), k(o(b, C, w), 3225465664, a(u, T + 24), 9), k(o(b, C, w), 643717713, a(u, T + 44), 14), k(o(b, C, w), 3921069994, a(u, T), 20), k(o(b, C, w), 3593408605, a(u, T + 20), 5), k(o(b, C, w), 38016083, a(u, T + 40), 9), k(o(b, C, w), 3634488961, a(u, T + 60), 14), k(o(b, C, w), 3889429448, a(u, T + 16), 20), k(o(b, C, w), 568446438, a(u, T + 36), 5), k(o(b, C, w), 3275163606, a(u, T + 56), 9), k(o(b, C, w), 4107603335, a(u, T + 12), 14), k(o(b, C, w), 1163531501, a(u, T + 32), 20), k(o(b, C, w), 2850285829, a(u, T + 52), 5), k(o(b, C, w), 4243563512, a(u, T + 8), 9), k(o(b, C, w), 1735328473, a(u, T + 28), 14), k(o(b, C, w), 2368359562, a(u, T + 48), 20), k(r(b, C, w), 4294588738, a(u, T + 20), 4), k(r(b, C, w), 2272392833, a(u, T + 32), 11), k(r(b, C, w), 1839030562, a(u, T + 44), 16), k(r(b, C, w), 4259657740, a(u, T + 56), 23), k(r(b, C, w), 2763975236, a(u, T + 4), 4), k(r(b, C, w), 1272893353, a(u, T + 16), 11), k(r(b, C, w), 4139469664, a(u, T + 28), 16), k(r(b, C, w), 3200236656, a(u, T + 40), 23), k(r(b, C, w), 681279174, a(u, T + 52), 4), k(r(b, C, w), 3936430074, a(u, T), 11), k(r(b, C, w), 3572445317, a(u, T + 12), 16), k(r(b, C, w), 76029189, a(u, T + 24), 23), k(r(b, C, w), 3654602809, a(u, T + 36), 4), k(r(b, C, w), 3873151461, a(u, T + 48), 11), k(r(b, C, w), 530742520, a(u, T + 60), 16), k(r(b, C, w), 3299628645, a(u, T + 8), 23), k(c(b, C, w), 4096336452, a(u, T), 6), k(c(b, C, w), 1126891415, a(u, T + 28), 10), k(c(b, C, w), 2878612391, a(u, T + 56), 15), k(c(b, C, w), 4237533241, a(u, T + 20), 21), k(c(b, C, w), 1700485571, a(u, T + 48), 6), k(c(b, C, w), 2399980690, a(u, T + 12), 10), k(c(b, C, w), 4293915773, a(u, T + 40), 15), k(c(b, C, w), 2240044497, a(u, T + 4), 21), k(c(b, C, w), 1873313359, a(u, T + 32), 6), k(c(b, C, w), 4264355552, a(u, T + 60), 10), k(c(b, C, w), 2734768916, a(u, T + 24), 15), k(c(b, C, w), 1309151649, a(u, T + 52), 21), k(c(b, C, w), 4149444226, a(u, T + 16), 6), k(c(b, C, w), 3174756917, a(u, T + 44), 10), k(c(b, C, w), 718787259, a(u, T + 8), 15), k(c(b, C, w), 3951481745, a(u, T + 36), 21), g = l(g, _), m = l(m, b), y = l(y, C), v = l(v, w)
            }
            return function (t, e, i, s) {
                for (var o = "", r = 0, c = 0, a = 3; a >= 0; a--) r = 255 & (c = arguments[a]), r <<= 8, r |= 255 & (c >>>= 8), r <<= 8, r |= 255 & (c >>>= 8), r <<= 8, o += n(r |= c >>>= 8);
                return o
            }(v, y, m, g).toUpperCase()
        }, cc._RF.pop()
    }, {}], "polyglot.min": [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "e26fd9yy65A4q3/JkpVnFYg", "polyglot.min");
        var i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
            return typeof t
        } : function (t) {
            return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
        };
        !function (t, s) {
            "function" == typeof define && define.amd ? define([], function () {
                return s(t)
            }) : "object" == (void 0 === n ? "undefined" : i(n)) ? e.exports = s(t) : t.Polyglot = s(t)
        }(void 0, function (t) {
            function e(t) {
                t = t || {}, this.phrases = {}, this.extend(t.phrases || {}), this.currentLocale = t.locale || "en", this.allowMissing = !!t.allowMissing, this.warn = t.warn || h
            }

            function n(t) {
                var e, n, i, s = {};
                for (e in t) if (t.hasOwnProperty(e)) {
                    n = t[e];
                    for (i in n) s[n[i]] = e
                }
                return s
            }

            function s(t) {
                var e = /^\s+|\s+$/g;
                return t.replace(e, "")
            }

            function o(t, e, n) {
                var i, o, r;
                return null != n && t ? (o = t.split(u), r = o[c(e, n)] || o[0], i = s(r)) : i = t, i
            }

            function r(t) {
                var e = n(d);
                return e[t] || e.en
            }

            function c(t, e) {
                return f[r(t)](e)
            }

            function a(t, e) {
                for (var n in e) "_" !== n && e.hasOwnProperty(n) && (t = t.replace(new RegExp("%\\{" + n + "\\}", "g"), e[n]));
                return t
            }

            function h(e) {
                t.console && t.console.warn && t.console.warn("WARNING: " + e)
            }

            function l(t) {
                var e = {};
                for (var n in t) e[n] = t[n];
                return e
            }

            e.VERSION = "0.4.3", e.prototype.locale = function (t) {
                return t && (this.currentLocale = t), this.currentLocale
            }, e.prototype.extend = function (t, e) {
                var n;
                for (var s in t) t.hasOwnProperty(s) && (n = t[s], e && (s = e + "." + s), "object" == (void 0 === n ? "undefined" : i(n)) ? this.extend(n, s) : this.phrases[s] = n)
            }, e.prototype.clear = function () {
                this.phrases = {}
            }, e.prototype.replace = function (t) {
                this.clear(), this.extend(t)
            }, e.prototype.t = function (t, e) {
                var n, i;
                return "number" == typeof (e = null == e ? {} : e) && (e = { smart_count: e }), "string" == typeof this.phrases[t] ? n = this.phrases[t] : "string" == typeof e._ ? n = e._ : this.allowMissing ? n = t : (this.warn('Missing translation for key: "' + t + '"'), i = t), "string" == typeof n && (e = l(e), i = o(n, this.currentLocale, e.smart_count), i = a(i, e)), i
            }, e.prototype.has = function (t) {
                return t in this.phrases
            };
            var u = "||||", f = {
                chinese: function (t) {
                    return 0
                }, german: function (t) {
                    return 1 !== t ? 1 : 0
                }, french: function (t) {
                    return t > 1 ? 1 : 0
                }, russian: function (t) {
                    return t % 10 == 1 && t % 100 != 11 ? 0 : t % 10 >= 2 && t % 10 <= 4 && (t % 100 < 10 || t % 100 >= 20) ? 1 : 2
                }, czech: function (t) {
                    return 1 === t ? 0 : t >= 2 && t <= 4 ? 1 : 2
                }, polish: function (t) {
                    return 1 === t ? 0 : t % 10 >= 2 && t % 10 <= 4 && (t % 100 < 10 || t % 100 >= 20) ? 1 : 2
                }, icelandic: function (t) {
                    return t % 10 != 1 || t % 100 == 11 ? 1 : 0
                }
            }, d = {
                chinese: ["fa", "id", "ja", "ko", "lo", "ms", "th", "tr", "zh"],
                german: ["da", "de", "en", "es", "fi", "el", "he", "hu", "it", "nl", "no", "pt", "sv"],
                french: ["fr", "tl", "pt-br"],
                russian: ["hr", "ru"],
                czech: ["cs"],
                polish: ["pl"],
                icelandic: ["is"]
            };
            return e
        }), cc._RF.pop()
    }, {}], setAvatarWin: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "5c63fGf1kpJUamEobuGmyV7", "setAvatarWin");
        var i = t("crypto");
        cc.Class({
            extends: cc.Component,
            properties: { commonBg: cc.Node, avatars: { default: [], type: cc.Toggle } },
            onLoad: function () {
                for (var t = cc.yqs.userMgr.headimg - 1, e = 0; e < this.avatars.length; e++) this.avatars[e].isChecked = t == e
            },
            onEnable: function () {
                this.commonBg.scale = .2;
                var t = cc.scaleTo(.2, 1.2), e = cc.scaleTo(.1, 1);
                this.commonBg.runAction(cc.sequence(t, e))
            },
            onAvatarClick: function (t) {
                console.log(cc.yqs.userMgr.ReHeadCount);
                var e = this;
                0 == cc.yqs.userMgr.ReHeadCount ? (console.log("=========toggle==========" + t + "====================="), cc.yqs.alert.show("更换头像", "本次更改免费，确定更换头像？", function () {
                    var n = e.avatars.indexOf(t);
                    cc.sys.localStorage.setItem("Avatar", n + 1), cc.yqs.eventCenter.emitCustomEvent("setAvatar", n + 1);
                    var s = { userId: cc.yqs.userMgr.userId, index: n + 1, gems: 0 }, o = s.userId.toString(),
                        r = s.index.toString(), c = s.gems.toString();
                    s.sign = i.md5(o + r + c), cc.yqs.http.sendRequest("/setAvatar", s)
                }, !0)) : cc.yqs.userMgr.ReHeadCount > 0 && cc.yqs.userMgr.gems >= 1 ? cc.yqs.alert.show("更换头像", "本次更改需要花费1元，确定更换头像？", function () {
                    var n = e.avatars.indexOf(t);
                    cc.yqs.userMgr.coins--, cc.sys.localStorage.setItem("Avatar", n + 1), cc.yqs.eventCenter.emitCustomEvent("setAvatar", n + 1);
                    var s = { userId: cc.yqs.userMgr.userId, index: n + 1, gems: 1e3 }, o = s.userId.toString(),
                        r = s.index.toString(), c = s.gems.toString();
                    s.sign = i.md5(o + r + c), cc.yqs.userMgr.gems--, cc.yqs.Hall.lblGems.string = cc.yqs.userMgr.gems + ".000", cc.yqs.http.sendRequest("/setAvatar", s)
                }, !0) : cc.yqs.userMgr.ReHeadCount > 0 && cc.yqs.userMgr.gems < 1 && cc.yqs.alert.show("更换头像", "更换失败，金币不足"), cc.yqs.userMgr.ReHeadCount++
            },
            onBack: function () {
                var t = cc.scaleTo(.1, 1.2), e = cc.scaleTo(.2, .6), n = cc.callFunc(function () {
                    this.node.active = !1
                }, this);
                this.commonBg.runAction(cc.sequence(t, e, n))
            }
        }), cc._RF.pop()
    }, { crypto: "crypto" }], "socket-io": [function (t, e, n) {
        (function (i) {
            "use strict";
            cc._RF.push(e, "82df6Og0adLzoqzNZYsNCLA", "socket-io");
            var s = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (t) {
                return typeof t
            } : function (t) {
                return t && "function" == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype ? "symbol" : typeof t
            };
            cc.sys.isNative || function (t) {
                if ("object" === (void 0 === n ? "undefined" : s(n)) && void 0 !== e) e.exports = t(); else if ("function" == typeof define && define.amd) define([], t); else {
                    ("undefined" != typeof window ? window : void 0 !== i ? i : "undefined" != typeof self ? self : this).io = t()
                }
            }(function () {
                return function e(n, i, s) {
                    function o(c, a) {
                        if (!i[c]) {
                            if (!n[c]) {
                                var h = "function" == typeof t && t;
                                if (!a && h) return h(c, !0);
                                if (r) return r(c, !0);
                                var l = new Error("Cannot find module '" + c + "'");
                                throw l.code = "MODULE_NOT_FOUND", l
                            }
                            var u = i[c] = { exports: {} };
                            n[c][0].call(u.exports, function (t) {
                                var e = n[c][1][t];
                                return o(e || t)
                            }, u, u.exports, e, n, i, s)
                        }
                        return i[c].exports
                    }

                    for (var r = "function" == typeof t && t, c = 0; c < s.length; c++) o(s[c]);
                    return o
                }({
                    1: [function (t, e, n) {
                        e.exports = t("./lib/")
                    }, { "./lib/": 2 }],
                    2: [function (t, e, n) {
                        e.exports = t("./socket"), e.exports.parser = t("engine.io-parser")
                    }, { "./socket": 3, "engine.io-parser": 19 }],
                    3: [function (t, e, n) {
                        (function (n) {
                            function i(t, e) {
                                if (!(this instanceof i)) return new i(t, e);
                                e = e || {}, t && "object" == (void 0 === t ? "undefined" : s(t)) && (e = t, t = null), t ? (t = u(t), e.hostname = t.host, e.secure = "https" == t.protocol || "wss" == t.protocol, e.port = t.port, t.query && (e.query = t.query)) : e.host && (e.hostname = u(e.host).host), this.secure = null != e.secure ? e.secure : n.location && "https:" == location.protocol, e.hostname && !e.port && (e.port = this.secure ? "443" : "80"), this.agent = e.agent || !1, this.hostname = e.hostname || (n.location ? location.hostname : "localhost"), this.port = e.port || (n.location && location.port ? location.port : this.secure ? 443 : 80), this.query = e.query || {}, "string" == typeof this.query && (this.query = d.decode(this.query)), this.upgrade = !1 !== e.upgrade, this.path = (e.path || "/engine.io").replace(/\/$/, "") + "/", this.forceJSONP = !!e.forceJSONP, this.jsonp = !1 !== e.jsonp, this.forceBase64 = !!e.forceBase64, this.enablesXDR = !!e.enablesXDR, this.timestampParam = e.timestampParam || "t", this.timestampRequests = e.timestampRequests, this.transports = e.transports || ["polling", "websocket"], this.readyState = "", this.writeBuffer = [], this.policyPort = e.policyPort || 843, this.rememberUpgrade = e.rememberUpgrade || !1, this.binaryType = null, this.onlyBinaryUpgrades = e.onlyBinaryUpgrades, this.perMessageDeflate = !1 !== e.perMessageDeflate && (e.perMessageDeflate || {}), !0 === this.perMessageDeflate && (this.perMessageDeflate = {}), this.perMessageDeflate && null == this.perMessageDeflate.threshold && (this.perMessageDeflate.threshold = 1024), this.pfx = e.pfx || null, this.key = e.key || null, this.passphrase = e.passphrase || null, this.cert = e.cert || null, this.ca = e.ca || null, this.ciphers = e.ciphers || null, this.rejectUnauthorized = void 0 === e.rejectUnauthorized || e.rejectUnauthorized;
                                var o = "object" == (void 0 === n ? "undefined" : s(n)) && n;
                                o.global === o && e.extraHeaders && Object.keys(e.extraHeaders).length > 0 && (this.extraHeaders = e.extraHeaders), this.open()
                            }

                            function o(t) {
                                var e = {};
                                for (var n in t) t.hasOwnProperty(n) && (e[n] = t[n]);
                                return e
                            }

                            var r = t("./transports"), c = t("component-emitter"),
                                a = t("debug")("engine.io-client:socket"), h = t("indexof"), l = t("engine.io-parser"),
                                u = t("parseuri"), f = t("parsejson"), d = t("parseqs");
                            e.exports = i, i.priorWebsocketSuccess = !1, c(i.prototype), i.protocol = l.protocol, i.Socket = i, i.Transport = t("./transport"), i.transports = t("./transports"), i.parser = t("engine.io-parser"), i.prototype.createTransport = function (t) {
                                a('creating transport "%s"', t);
                                var e = o(this.query);
                                return e.EIO = l.protocol, e.transport = t, this.id && (e.sid = this.id), new r[t]({
                                    agent: this.agent,
                                    hostname: this.hostname,
                                    port: this.port,
                                    secure: this.secure,
                                    path: this.path,
                                    query: e,
                                    forceJSONP: this.forceJSONP,
                                    jsonp: this.jsonp,
                                    forceBase64: this.forceBase64,
                                    enablesXDR: this.enablesXDR,
                                    timestampRequests: this.timestampRequests,
                                    timestampParam: this.timestampParam,
                                    policyPort: this.policyPort,
                                    socket: this,
                                    pfx: this.pfx,
                                    key: this.key,
                                    passphrase: this.passphrase,
                                    cert: this.cert,
                                    ca: this.ca,
                                    ciphers: this.ciphers,
                                    rejectUnauthorized: this.rejectUnauthorized,
                                    perMessageDeflate: this.perMessageDeflate,
                                    extraHeaders: this.extraHeaders
                                })
                            }, i.prototype.open = function () {
                                var t;
                                if (this.rememberUpgrade && i.priorWebsocketSuccess && -1 != this.transports.indexOf("websocket")) t = "websocket"; else {
                                    if (0 === this.transports.length) {
                                        var e = this;
                                        return void setTimeout(function () {
                                            e.emit("error", "No transports available")
                                        }, 0)
                                    }
                                    t = this.transports[0]
                                }
                                this.readyState = "opening";
                                try {
                                    t = this.createTransport(t)
                                } catch (t) {
                                    return this.transports.shift(), void this.open()
                                }
                                t.open(), this.setTransport(t)
                            }, i.prototype.setTransport = function (t) {
                                a("setting transport %s", t.name);
                                var e = this;
                                this.transport && (a("clearing existing transport %s", this.transport.name), this.transport.removeAllListeners()), this.transport = t, t.on("drain", function () {
                                    e.onDrain()
                                }).on("packet", function (t) {
                                    e.onPacket(t)
                                }).on("error", function (t) {
                                    e.onError(t)
                                }).on("close", function () {
                                    e.onClose("transport close")
                                })
                            }, i.prototype.probe = function (t) {
                                function e() {
                                    if (f.onlyBinaryUpgrades) {
                                        var e = !this.supportsBinary && f.transport.supportsBinary;
                                        u = u || e
                                    }
                                    u || (a('probe transport "%s" opened', t), l.send([{
                                        type: "ping",
                                        data: "probe"
                                    }]), l.once("packet", function (e) {
                                        if (!u) if ("pong" == e.type && "probe" == e.data) {
                                            if (a('probe transport "%s" pong', t), f.upgrading = !0, f.emit("upgrading", l), !l) return;
                                            i.priorWebsocketSuccess = "websocket" == l.name, a('pausing current transport "%s"', f.transport.name), f.transport.pause(function () {
                                                u || "closed" != f.readyState && (a("changing transport and sending upgrade packet"), h(), f.setTransport(l), l.send([{ type: "upgrade" }]), f.emit("upgrade", l), l = null, f.upgrading = !1, f.flush())
                                            })
                                        } else {
                                            a('probe transport "%s" failed', t);
                                            var n = new Error("probe error");
                                            n.transport = l.name, f.emit("upgradeError", n)
                                        }
                                    }))
                                }

                                function n() {
                                    u || (u = !0, h(), l.close(), l = null)
                                }

                                function s(e) {
                                    var i = new Error("probe error: " + e);
                                    i.transport = l.name, n(), a('probe transport "%s" failed because of error: %s', t, e), f.emit("upgradeError", i)
                                }

                                function o() {
                                    s("transport closed")
                                }

                                function r() {
                                    s("socket closed")
                                }

                                function c(t) {
                                    l && t.name != l.name && (a('"%s" works - aborting "%s"', t.name, l.name), n())
                                }

                                function h() {
                                    l.removeListener("open", e), l.removeListener("error", s), l.removeListener("close", o), f.removeListener("close", r), f.removeListener("upgrading", c)
                                }

                                a('probing transport "%s"', t);
                                var l = this.createTransport(t, { probe: 1 }), u = !1, f = this;
                                i.priorWebsocketSuccess = !1, l.once("open", e), l.once("error", s), l.once("close", o), this.once("close", r), this.once("upgrading", c), l.open()
                            }, i.prototype.onOpen = function () {
                                if (a("socket open"), this.readyState = "open", i.priorWebsocketSuccess = "websocket" == this.transport.name, this.emit("open"), this.flush(), "open" == this.readyState && this.upgrade && this.transport.pause) {
                                    a("starting upgrade probes");
                                    for (var t = 0, e = this.upgrades.length; t < e; t++) this.probe(this.upgrades[t])
                                }
                            }, i.prototype.onPacket = function (t) {
                                if ("opening" == this.readyState || "open" == this.readyState) switch (a('socket receive: type "%s", data "%s"', t.type, t.data), this.emit("packet", t), this.emit("heartbeat"), t.type) {
                                    case "open":
                                        this.onHandshake(f(t.data));
                                        break;
                                    case "pong":
                                        this.setPing(), this.emit("pong");
                                        break;
                                    case "error":
                                        var e = new Error("server error");
                                        e.code = t.data, this.onError(e);
                                        break;
                                    case "message":
                                        this.emit("data", t.data), this.emit("message", t.data)
                                } else a('packet received with socket readyState "%s"', this.readyState)
                            }, i.prototype.onHandshake = function (t) {
                                this.emit("handshake", t), this.id = t.sid, this.transport.query.sid = t.sid, this.upgrades = this.filterUpgrades(t.upgrades), this.pingInterval = t.pingInterval, this.pingTimeout = t.pingTimeout, this.onOpen(), "closed" != this.readyState && (this.setPing(), this.removeListener("heartbeat", this.onHeartbeat), this.on("heartbeat", this.onHeartbeat))
                            }, i.prototype.onHeartbeat = function (t) {
                                clearTimeout(this.pingTimeoutTimer);
                                var e = this;
                                e.pingTimeoutTimer = setTimeout(function () {
                                    "closed" != e.readyState && e.onClose("ping timeout")
                                }, t || e.pingInterval + e.pingTimeout)
                            }, i.prototype.setPing = function () {
                                var t = this;
                                clearTimeout(t.pingIntervalTimer), t.pingIntervalTimer = setTimeout(function () {
                                    a("writing ping packet - expecting pong within %sms", t.pingTimeout), t.ping(), t.onHeartbeat(t.pingTimeout)
                                }, t.pingInterval)
                            }, i.prototype.ping = function () {
                                var t = this;
                                this.sendPacket("ping", function () {
                                    t.emit("ping")
                                })
                            }, i.prototype.onDrain = function () {
                                this.writeBuffer.splice(0, this.prevBufferLen), this.prevBufferLen = 0, 0 === this.writeBuffer.length ? this.emit("drain") : this.flush()
                            }, i.prototype.flush = function () {
                                "closed" != this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length && (a("flushing %d packets in socket", this.writeBuffer.length), this.transport.send(this.writeBuffer), this.prevBufferLen = this.writeBuffer.length, this.emit("flush"))
                            }, i.prototype.write = i.prototype.send = function (t, e, n) {
                                return this.sendPacket("message", t, e, n), this
                            }, i.prototype.sendPacket = function (t, e, n, i) {
                                if ("function" == typeof e && (i = e, e = void 0), "function" == typeof n && (i = n, n = null), "closing" != this.readyState && "closed" != this.readyState) {
                                    (n = n || {}).compress = !1 !== n.compress;
                                    var s = { type: t, data: e, options: n };
                                    this.emit("packetCreate", s), this.writeBuffer.push(s), i && this.once("flush", i), this.flush()
                                }
                            }, i.prototype.close = function () {
                                function t() {
                                    i.onClose("forced close"), a("socket closing - telling transport to close"), i.transport.close()
                                }

                                function e() {
                                    i.removeListener("upgrade", e), i.removeListener("upgradeError", e), t()
                                }

                                function n() {
                                    i.once("upgrade", e), i.once("upgradeError", e)
                                }

                                if ("opening" == this.readyState || "open" == this.readyState) {
                                    this.readyState = "closing";
                                    var i = this;
                                    this.writeBuffer.length ? this.once("drain", function () {
                                        this.upgrading ? n() : t()
                                    }) : this.upgrading ? n() : t()
                                }
                                return this
                            }, i.prototype.onError = function (t) {
                                a("socket error %j", t), i.priorWebsocketSuccess = !1, this.emit("error", t), this.onClose("transport error", t)
                            }, i.prototype.onClose = function (t, e) {
                                if ("opening" == this.readyState || "open" == this.readyState || "closing" == this.readyState) {
                                    a('socket close with reason: "%s"', t);
                                    var n = this;
                                    clearTimeout(this.pingIntervalTimer), clearTimeout(this.pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), this.readyState = "closed", this.id = null, this.emit("close", t, e), n.writeBuffer = [], n.prevBufferLen = 0
                                }
                            }, i.prototype.filterUpgrades = function (t) {
                                for (var e = [], n = 0, i = t.length; n < i; n++) ~h(this.transports, t[n]) && e.push(t[n]);
                                return e
                            }
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, {
                        "./transport": 4,
                        "./transports": 5,
                        "component-emitter": 15,
                        debug: 17,
                        "engine.io-parser": 19,
                        indexof: 23,
                        parsejson: 26,
                        parseqs: 27,
                        parseuri: 28
                    }],
                    4: [function (t, e, n) {
                        function i(t) {
                            this.path = t.path, this.hostname = t.hostname, this.port = t.port, this.secure = t.secure, this.query = t.query, this.timestampParam = t.timestampParam, this.timestampRequests = t.timestampRequests, this.readyState = "", this.agent = t.agent || !1, this.socket = t.socket, this.enablesXDR = t.enablesXDR, this.pfx = t.pfx, this.key = t.key, this.passphrase = t.passphrase, this.cert = t.cert, this.ca = t.ca, this.ciphers = t.ciphers, this.rejectUnauthorized = t.rejectUnauthorized, this.extraHeaders = t.extraHeaders
                        }

                        var s = t("engine.io-parser"), o = t("component-emitter");
                        e.exports = i, o(i.prototype), i.prototype.onError = function (t, e) {
                            var n = new Error(t);
                            return n.type = "TransportError", n.description = e, this.emit("error", n), this
                        }, i.prototype.open = function () {
                            return "closed" != this.readyState && "" != this.readyState || (this.readyState = "opening", this.doOpen()), this
                        }, i.prototype.close = function () {
                            return "opening" != this.readyState && "open" != this.readyState || (this.doClose(), this.onClose()), this
                        }, i.prototype.send = function (t) {
                            if ("open" != this.readyState) throw new Error("Transport not open");
                            this.write(t)
                        }, i.prototype.onOpen = function () {
                            this.readyState = "open", this.writable = !0, this.emit("open")
                        }, i.prototype.onData = function (t) {
                            var e = s.decodePacket(t, this.socket.binaryType);
                            this.onPacket(e)
                        }, i.prototype.onPacket = function (t) {
                            this.emit("packet", t)
                        }, i.prototype.onClose = function () {
                            this.readyState = "closed", this.emit("close")
                        }
                    }, { "component-emitter": 15, "engine.io-parser": 19 }],
                    5: [function (t, e, n) {
                        (function (e) {
                            var i = t("xmlhttprequest-ssl"), s = t("./polling-xhr"), o = t("./polling-jsonp"),
                                r = t("./websocket");
                            n.polling = function (t) {
                                var n = !1, r = !1, c = !1 !== t.jsonp;
                                if (e.location) {
                                    var a = "https:" == location.protocol, h = location.port;
                                    h || (h = a ? 443 : 80), n = t.hostname != location.hostname || h != t.port, r = t.secure != a
                                }
                                if (t.xdomain = n, t.xscheme = r, "open" in new i(t) && !t.forceJSONP) return new s(t);
                                if (!c) throw new Error("JSONP disabled");
                                return new o(t)
                            }, n.websocket = r
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, { "./polling-jsonp": 6, "./polling-xhr": 7, "./websocket": 9, "xmlhttprequest-ssl": 10 }],
                    6: [function (t, e, n) {
                        (function (n) {
                            function i() {
                            }

                            function s(t) {
                                o.call(this, t), this.query = this.query || {}, c || (n.___eio || (n.___eio = []), c = n.___eio), this.index = c.length;
                                var e = this;
                                c.push(function (t) {
                                    e.onData(t)
                                }), this.query.j = this.index, n.document && n.addEventListener && n.addEventListener("beforeunload", function () {
                                    e.script && (e.script.onerror = i)
                                }, !1)
                            }

                            var o = t("./polling"), r = t("component-inherit");
                            e.exports = s;
                            var c, a = /\n/g, h = /\\n/g;
                            r(s, o), s.prototype.supportsBinary = !1, s.prototype.doClose = function () {
                                this.script && (this.script.parentNode.removeChild(this.script), this.script = null), this.form && (this.form.parentNode.removeChild(this.form), this.form = null, this.iframe = null), o.prototype.doClose.call(this)
                            }, s.prototype.doPoll = function () {
                                var t = this, e = document.createElement("script");
                                this.script && (this.script.parentNode.removeChild(this.script), this.script = null), e.async = !0, e.src = this.uri(), e.onerror = function (e) {
                                    t.onError("jsonp poll error", e)
                                };
                                var n = document.getElementsByTagName("script")[0];
                                n ? n.parentNode.insertBefore(e, n) : (document.head || document.body).appendChild(e), this.script = e, "undefined" != typeof navigator && /gecko/i.test(navigator.userAgent) && setTimeout(function () {
                                    var t = document.createElement("iframe");
                                    document.body.appendChild(t), document.body.removeChild(t)
                                }, 100)
                            }, s.prototype.doWrite = function (t, e) {
                                function n() {
                                    i(), e()
                                }

                                function i() {
                                    if (s.iframe) try {
                                        s.form.removeChild(s.iframe)
                                    } catch (t) {
                                        s.onError("jsonp polling iframe removal error", t)
                                    }
                                    try {
                                        var t = '<iframe src="javascript:0" name="' + s.iframeId + '">';
                                        o = document.createElement(t)
                                    } catch (t) {
                                        (o = document.createElement("iframe")).name = s.iframeId, o.src = "javascript:0"
                                    }
                                    o.id = s.iframeId, s.form.appendChild(o), s.iframe = o
                                }

                                var s = this;
                                if (!this.form) {
                                    var o, r = document.createElement("form"), c = document.createElement("textarea"),
                                        l = this.iframeId = "eio_iframe_" + this.index;
                                    r.className = "socketio", r.style.position = "absolute", r.style.top = "-1000px", r.style.left = "-1000px", r.target = l, r.method = "POST", r.setAttribute("accept-charset", "utf-8"), c.name = "d", r.appendChild(c), document.body.appendChild(r), this.form = r, this.area = c
                                }
                                this.form.action = this.uri(), i(), t = t.replace(h, "\\\n"), this.area.value = t.replace(a, "\\n");
                                try {
                                    this.form.submit()
                                } catch (t) {
                                }
                                this.iframe.attachEvent ? this.iframe.onreadystatechange = function () {
                                    "complete" == s.iframe.readyState && n()
                                } : this.iframe.onload = n
                            }
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, { "./polling": 8, "component-inherit": 16 }],
                    7: [function (t, e, n) {
                        (function (n) {
                            function i() {
                            }

                            function s(t) {
                                if (a.call(this, t), n.location) {
                                    var e = "https:" == location.protocol, i = location.port;
                                    i || (i = e ? 443 : 80), this.xd = t.hostname != n.location.hostname || i != t.port, this.xs = t.secure != e
                                } else this.extraHeaders = t.extraHeaders
                            }

                            function o(t) {
                                this.method = t.method || "GET", this.uri = t.uri, this.xd = !!t.xd, this.xs = !!t.xs, this.async = !1 !== t.async, this.data = void 0 != t.data ? t.data : null, this.agent = t.agent, this.isBinary = t.isBinary, this.supportsBinary = t.supportsBinary, this.enablesXDR = t.enablesXDR, this.pfx = t.pfx, this.key = t.key, this.passphrase = t.passphrase, this.cert = t.cert, this.ca = t.ca, this.ciphers = t.ciphers, this.rejectUnauthorized = t.rejectUnauthorized, this.extraHeaders = t.extraHeaders, this.create()
                            }

                            function r() {
                                for (var t in o.requests) o.requests.hasOwnProperty(t) && o.requests[t].abort()
                            }

                            var c = t("xmlhttprequest-ssl"), a = t("./polling"), h = t("component-emitter"),
                                l = t("component-inherit"), u = t("debug")("engine.io-client:polling-xhr");
                            e.exports = s, e.exports.Request = o, l(s, a), s.prototype.supportsBinary = !0, s.prototype.request = function (t) {
                                return t = t || {}, t.uri = this.uri(), t.xd = this.xd, t.xs = this.xs, t.agent = this.agent || !1, t.supportsBinary = this.supportsBinary, t.enablesXDR = this.enablesXDR, t.pfx = this.pfx, t.key = this.key, t.passphrase = this.passphrase, t.cert = this.cert, t.ca = this.ca, t.ciphers = this.ciphers, t.rejectUnauthorized = this.rejectUnauthorized, t.extraHeaders = this.extraHeaders, new o(t)
                            }, s.prototype.doWrite = function (t, e) {
                                var n = "string" != typeof t && void 0 !== t,
                                    i = this.request({ method: "POST", data: t, isBinary: n }), s = this;
                                i.on("success", e), i.on("error", function (t) {
                                    s.onError("xhr post error", t)
                                }), this.sendXhr = i
                            }, s.prototype.doPoll = function () {
                                u("xhr poll");
                                var t = this.request(), e = this;
                                t.on("data", function (t) {
                                    e.onData(t)
                                }), t.on("error", function (t) {
                                    e.onError("xhr poll error", t)
                                }), this.pollXhr = t
                            }, h(o.prototype), o.prototype.create = function () {
                                var t = {
                                    agent: this.agent,
                                    xdomain: this.xd,
                                    xscheme: this.xs,
                                    enablesXDR: this.enablesXDR
                                };
                                t.pfx = this.pfx, t.key = this.key, t.passphrase = this.passphrase, t.cert = this.cert, t.ca = this.ca, t.ciphers = this.ciphers, t.rejectUnauthorized = this.rejectUnauthorized;
                                var e = this.xhr = new c(t), i = this;
                                try {
                                    u("xhr open %s: %s", this.method, this.uri), e.open(this.method, this.uri, this.async);
                                    try {
                                        if (this.extraHeaders) {
                                            e.setDisableHeaderCheck(!0);
                                            for (var s in this.extraHeaders) this.extraHeaders.hasOwnProperty(s) && e.setRequestHeader(s, this.extraHeaders[s])
                                        }
                                    } catch (t) {
                                    }
                                    if (this.supportsBinary && (e.responseType = "arraybuffer"), "POST" == this.method) try {
                                        this.isBinary ? e.setRequestHeader("Content-type", "application/octet-stream") : e.setRequestHeader("Content-type", "text/plain;charset=UTF-8")
                                    } catch (t) {
                                    }
                                    "withCredentials" in e && (e.withCredentials = !0), this.hasXDR() ? (e.onload = function () {
                                        i.onLoad()
                                    }, e.onerror = function () {
                                        i.onError(e.responseText)
                                    }) : e.onreadystatechange = function () {
                                        4 == e.readyState && (200 == e.status || 1223 == e.status ? i.onLoad() : setTimeout(function () {
                                            i.onError(e.status)
                                        }, 0))
                                    }, u("xhr data %s", this.data), e.send(this.data)
                                } catch (t) {
                                    return void setTimeout(function () {
                                        i.onError(t)
                                    }, 0)
                                }
                                n.document && (this.index = o.requestsCount++, o.requests[this.index] = this)
                            }, o.prototype.onSuccess = function () {
                                this.emit("success"), this.cleanup()
                            }, o.prototype.onData = function (t) {
                                this.emit("data", t), this.onSuccess()
                            }, o.prototype.onError = function (t) {
                                this.emit("error", t), this.cleanup(!0)
                            }, o.prototype.cleanup = function (t) {
                                if (void 0 !== this.xhr && null !== this.xhr) {
                                    if (this.hasXDR() ? this.xhr.onload = this.xhr.onerror = i : this.xhr.onreadystatechange = i, t) try {
                                        this.xhr.abort()
                                    } catch (t) {
                                    }
                                    n.document && delete o.requests[this.index], this.xhr = null
                                }
                            }, o.prototype.onLoad = function () {
                                var t;
                                try {
                                    var e;
                                    try {
                                        e = this.xhr.getResponseHeader("Content-Type").split(";")[0]
                                    } catch (t) {
                                    }
                                    if ("application/octet-stream" === e) t = this.xhr.response; else if (this.supportsBinary) try {
                                        t = String.fromCharCode.apply(null, new Uint8Array(this.xhr.response))
                                    } catch (e) {
                                        for (var n = new Uint8Array(this.xhr.response), i = [], s = 0, o = n.length; s < o; s++) i.push(n[s]);
                                        t = String.fromCharCode.apply(null, i)
                                    } else t = this.xhr.responseText
                                } catch (t) {
                                    this.onError(t)
                                }
                                null != t && this.onData(t)
                            }, o.prototype.hasXDR = function () {
                                return void 0 !== n.XDomainRequest && !this.xs && this.enablesXDR
                            }, o.prototype.abort = function () {
                                this.cleanup()
                            }, n.document && (o.requestsCount = 0, o.requests = {}, n.attachEvent ? n.attachEvent("onunload", r) : n.addEventListener && n.addEventListener("beforeunload", r, !1))
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, {
                        "./polling": 8,
                        "component-emitter": 15,
                        "component-inherit": 16,
                        debug: 17,
                        "xmlhttprequest-ssl": 10
                    }],
                    8: [function (t, e, n) {
                        function i(t) {
                            var e = t && t.forceBase64;
                            l && !e || (this.supportsBinary = !1), s.call(this, t)
                        }

                        var s = t("../transport"), o = t("parseqs"), r = t("engine.io-parser"),
                            c = t("component-inherit"), a = t("yeast"), h = t("debug")("engine.io-client:polling");
                        e.exports = i;
                        var l = null != new (t("xmlhttprequest-ssl"))({ xdomain: !1 }).responseType;
                        c(i, s), i.prototype.name = "polling", i.prototype.doOpen = function () {
                            this.poll()
                        }, i.prototype.pause = function (t) {
                            function e() {
                                h("paused"), n.readyState = "paused", t()
                            }

                            var n = this;
                            if (this.readyState = "pausing", this.polling || !this.writable) {
                                var i = 0;
                                this.polling && (h("we are currently polling - waiting to pause"), i++, this.once("pollComplete", function () {
                                    h("pre-pause polling complete"), --i || e()
                                })), this.writable || (h("we are currently writing - waiting to pause"), i++, this.once("drain", function () {
                                    h("pre-pause writing complete"), --i || e()
                                }))
                            } else e()
                        }, i.prototype.poll = function () {
                            h("polling"), this.polling = !0, this.doPoll(), this.emit("poll")
                        }, i.prototype.onData = function (t) {
                            var e = this;
                            h("polling got data %s", t);
                            r.decodePayload(t, this.socket.binaryType, function (t, n, i) {
                                if ("opening" == e.readyState && e.onOpen(), "close" == t.type) return e.onClose(), !1;
                                e.onPacket(t)
                            }), "closed" != this.readyState && (this.polling = !1, this.emit("pollComplete"), "open" == this.readyState ? this.poll() : h('ignoring poll - transport state "%s"', this.readyState))
                        }, i.prototype.doClose = function () {
                            function t() {
                                h("writing close packet"), e.write([{ type: "close" }])
                            }

                            var e = this;
                            "open" == this.readyState ? (h("transport open - closing"), t()) : (h("transport not open - deferring close"), this.once("open", t))
                        }, i.prototype.write = function (t) {
                            n = this;
                            this.writable = !1;
                            var e = function () {
                                n.writable = !0, n.emit("drain")
                            }, n = this;
                            r.encodePayload(t, this.supportsBinary, function (t) {
                                n.doWrite(t, e)
                            })
                        }, i.prototype.uri = function () {
                            var t = this.query || {}, e = this.secure ? "https" : "http", n = "";
                            return !1 !== this.timestampRequests && (t[this.timestampParam] = a()), this.supportsBinary || t.sid || (t.b64 = 1), t = o.encode(t), this.port && ("https" == e && 443 != this.port || "http" == e && 80 != this.port) && (n = ":" + this.port), t.length && (t = "?" + t), e + "://" + (-1 !== this.hostname.indexOf(":") ? "[" + this.hostname + "]" : this.hostname) + n + this.path + t
                        }
                    }, {
                        "../transport": 4,
                        "component-inherit": 16,
                        debug: 17,
                        "engine.io-parser": 19,
                        parseqs: 27,
                        "xmlhttprequest-ssl": 10,
                        yeast: 30
                    }],
                    9: [function (t, e, n) {
                        (function (n) {
                            function i(t) {
                                t && t.forceBase64 && (this.supportsBinary = !1), this.perMessageDeflate = t.perMessageDeflate, s.call(this, t)
                            }

                            var s = t("../transport"), o = t("engine.io-parser"), r = t("parseqs"),
                                c = t("component-inherit"), a = t("yeast"),
                                h = t("debug")("engine.io-client:websocket"), l = n.WebSocket || n.MozWebSocket, u = l;
                            if (!u && "undefined" == typeof window) try {
                                u = t("ws")
                            } catch (t) {
                            }
                            e.exports = i, c(i, s), i.prototype.name = "websocket", i.prototype.supportsBinary = !0, i.prototype.doOpen = function () {
                                if (this.check()) {
                                    var t = this.uri(),
                                        e = { agent: this.agent, perMessageDeflate: this.perMessageDeflate };
                                    e.pfx = this.pfx, e.key = this.key, e.passphrase = this.passphrase, e.cert = this.cert, e.ca = this.ca, e.ciphers = this.ciphers, e.rejectUnauthorized = this.rejectUnauthorized, this.extraHeaders && (e.headers = this.extraHeaders), this.ws = l ? new u(t) : new u(t, void 0, e), void 0 === this.ws.binaryType && (this.supportsBinary = !1), this.ws.supports && this.ws.supports.binary ? (this.supportsBinary = !0, this.ws.binaryType = "buffer") : this.ws.binaryType = "arraybuffer", this.addEventListeners()
                                }
                            }, i.prototype.addEventListeners = function () {
                                var t = this;
                                this.ws.onopen = function () {
                                    t.onOpen()
                                }, this.ws.onclose = function () {
                                    t.onClose()
                                }, this.ws.onmessage = function (e) {
                                    t.onData(e.data)
                                }, this.ws.onerror = function (e) {
                                    t.onError("websocket error", e)
                                }
                            }, "undefined" != typeof navigator && /iPad|iPhone|iPod/i.test(navigator.userAgent) && (i.prototype.onData = function (t) {
                                var e = this;
                                setTimeout(function () {
                                    s.prototype.onData.call(e, t)
                                }, 0)
                            }), i.prototype.write = function (t) {
                                function e() {
                                    i.emit("flush"), setTimeout(function () {
                                        i.writable = !0, i.emit("drain")
                                    }, 0)
                                }

                                var i = this;
                                this.writable = !1;
                                for (var s = t.length, r = 0, c = s; r < c; r++) !function (t) {
                                    o.encodePacket(t, i.supportsBinary, function (o) {
                                        if (!l) {
                                            var r = {};
                                            t.options && (r.compress = t.options.compress), i.perMessageDeflate && ("string" == typeof o ? n.Buffer.byteLength(o) : o.length) < i.perMessageDeflate.threshold && (r.compress = !1)
                                        }
                                        try {
                                            l ? i.ws.send(o) : i.ws.send(o, r)
                                        } catch (t) {
                                            h("websocket closed before onclose event")
                                        }
                                        --s || e()
                                    })
                                }(t[r])
                            }, i.prototype.onClose = function () {
                                s.prototype.onClose.call(this)
                            }, i.prototype.doClose = function () {
                                void 0 !== this.ws && this.ws.close()
                            }, i.prototype.uri = function () {
                                var t = this.query || {}, e = this.secure ? "wss" : "ws", n = "";
                                return this.port && ("wss" == e && 443 != this.port || "ws" == e && 80 != this.port) && (n = ":" + this.port), this.timestampRequests && (t[this.timestampParam] = a()), this.supportsBinary || (t.b64 = 1), (t = r.encode(t)).length && (t = "?" + t), e + "://" + (-1 !== this.hostname.indexOf(":") ? "[" + this.hostname + "]" : this.hostname) + n + this.path + t
                            }, i.prototype.check = function () {
                                return !(!u || "__initialize" in u && this.name === i.prototype.name)
                            }
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, {
                        "../transport": 4,
                        "component-inherit": 16,
                        debug: 17,
                        "engine.io-parser": 19,
                        parseqs: 27,
                        ws: void 0,
                        yeast: 30
                    }],
                    10: [function (t, e, n) {
                        var i = t("has-cors");
                        e.exports = function (t) {
                            var e = t.xdomain, n = t.xscheme, s = t.enablesXDR;
                            try {
                                if ("undefined" != typeof XMLHttpRequest && (!e || i)) return new XMLHttpRequest
                            } catch (t) {
                            }
                            try {
                                if ("undefined" != typeof XDomainRequest && !n && s) return new XDomainRequest
                            } catch (t) {
                            }
                            if (!e) try {
                                return new ActiveXObject("Microsoft.XMLHTTP")
                            } catch (t) {
                            }
                        }
                    }, { "has-cors": 22 }],
                    11: [function (t, e, n) {
                        function i() {
                        }

                        e.exports = function (t, e, n) {
                            function s(t, i) {
                                if (s.count <= 0) throw new Error("after called too many times");
                                --s.count, t ? (o = !0, e(t), e = n) : 0 !== s.count || o || e(null, i)
                            }

                            var o = !1;
                            return n = n || i, s.count = t, 0 === t ? e() : s
                        }
                    }, {}],
                    12: [function (t, e, n) {
                        e.exports = function (t, e, n) {
                            var i = t.byteLength;
                            if (e = e || 0, n = n || i, t.slice) return t.slice(e, n);
                            if (e < 0 && (e += i), n < 0 && (n += i), n > i && (n = i), e >= i || e >= n || 0 === i) return new ArrayBuffer(0);
                            for (var s = new Uint8Array(t), o = new Uint8Array(n - e), r = e, c = 0; r < n; r++, c++) o[c] = s[r];
                            return o.buffer
                        }
                    }, {}],
                    13: [function (t, e, n) {
                        !function (t) {
                            n.encode = function (e) {
                                var n, i = new Uint8Array(e), s = i.length, o = "";
                                for (n = 0; n < s; n += 3) o += t[i[n] >> 2], o += t[(3 & i[n]) << 4 | i[n + 1] >> 4], o += t[(15 & i[n + 1]) << 2 | i[n + 2] >> 6], o += t[63 & i[n + 2]];
                                return s % 3 == 2 ? o = o.substring(0, o.length - 1) + "=" : s % 3 == 1 && (o = o.substring(0, o.length - 2) + "=="), o
                            }, n.decode = function (e) {
                                var n, i, s, o, r, c = .75 * e.length, a = e.length, h = 0;
                                "=" === e[e.length - 1] && (c--, "=" === e[e.length - 2] && c--);
                                var l = new ArrayBuffer(c), u = new Uint8Array(l);
                                for (n = 0; n < a; n += 4) i = t.indexOf(e[n]), s = t.indexOf(e[n + 1]), o = t.indexOf(e[n + 2]), r = t.indexOf(e[n + 3]), u[h++] = i << 2 | s >> 4, u[h++] = (15 & s) << 4 | o >> 2, u[h++] = (3 & o) << 6 | 63 & r;
                                return l
                            }
                        }("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/")
                    }, {}],
                    14: [function (t, e, n) {
                        (function (t) {
                            function n(t) {
                                for (var e = 0; e < t.length; e++) {
                                    var n = t[e];
                                    if (n.buffer instanceof ArrayBuffer) {
                                        var i = n.buffer;
                                        if (n.byteLength !== i.byteLength) {
                                            var s = new Uint8Array(n.byteLength);
                                            s.set(new Uint8Array(i, n.byteOffset, n.byteLength)), i = s.buffer
                                        }
                                        t[e] = i
                                    }
                                }
                            }

                            function i(t, e) {
                                e = e || {};
                                var i = new o;
                                n(t);
                                for (var s = 0; s < t.length; s++) i.append(t[s]);
                                return e.type ? i.getBlob(e.type) : i.getBlob()
                            }

                            function s(t, e) {
                                return n(t), new Blob(t, e || {})
                            }

                            var o = t.BlobBuilder || t.WebKitBlobBuilder || t.MSBlobBuilder || t.MozBlobBuilder,
                                r = function () {
                                    try {
                                        return 2 === new Blob(["hi"]).size
                                    } catch (t) {
                                        return !1
                                    }
                                }(), c = r && function () {
                                    try {
                                        return 2 === new Blob([new Uint8Array([1, 2])]).size
                                    } catch (t) {
                                        return !1
                                    }
                                }(), a = o && o.prototype.append && o.prototype.getBlob;
                            e.exports = r ? c ? t.Blob : s : a ? i : void 0
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, {}],
                    15: [function (t, e, n) {
                        function i(t) {
                            if (t) return s(t)
                        }

                        function s(t) {
                            for (var e in i.prototype) t[e] = i.prototype[e];
                            return t
                        }

                        e.exports = i, i.prototype.on = i.prototype.addEventListener = function (t, e) {
                            return this._callbacks = this._callbacks || {}, (this._callbacks[t] = this._callbacks[t] || []).push(e), this
                        }, i.prototype.once = function (t, e) {
                            function n() {
                                i.off(t, n), e.apply(this, arguments)
                            }

                            var i = this;
                            return this._callbacks = this._callbacks || {}, n.fn = e, this.on(t, n), this
                        }, i.prototype.off = i.prototype.removeListener = i.prototype.removeAllListeners = i.prototype.removeEventListener = function (t, e) {
                            if (this._callbacks = this._callbacks || {}, 0 == arguments.length) return this._callbacks = {}, this;
                            var n = this._callbacks[t];
                            if (!n) return this;
                            if (1 == arguments.length) return delete this._callbacks[t], this;
                            for (var i, s = 0; s < n.length; s++) if ((i = n[s]) === e || i.fn === e) {
                                n.splice(s, 1);
                                break
                            }
                            return this
                        }, i.prototype.emit = function (t) {
                            this._callbacks = this._callbacks || {};
                            var e = [].slice.call(arguments, 1), n = this._callbacks[t];
                            if (n) for (var i = 0, s = (n = n.slice(0)).length; i < s; ++i) n[i].apply(this, e);
                            return this
                        }, i.prototype.listeners = function (t) {
                            return this._callbacks = this._callbacks || {}, this._callbacks[t] || []
                        }, i.prototype.hasListeners = function (t) {
                            return !!this.listeners(t).length
                        }
                    }, {}],
                    16: [function (t, e, n) {
                        e.exports = function (t, e) {
                            var n = function () {
                            };
                            n.prototype = e.prototype, t.prototype = new n, t.prototype.constructor = t
                        }
                    }, {}],
                    17: [function (t, e, n) {
                        function i() {
                            var t;
                            try {
                                t = n.storage.debug
                            } catch (t) {
                            }
                            return t
                        }

                        (n = e.exports = t("./debug")).log = function () {
                            return "object" === ("undefined" == typeof console ? "undefined" : s(console)) && console.log && Function.prototype.apply.call(console.log, console, arguments)
                        }, n.formatArgs = function () {
                            var t = arguments, e = this.useColors;
                            if (t[0] = (e ? "%c" : "") + this.namespace + (e ? " %c" : " ") + t[0] + (e ? "%c " : " ") + "+" + n.humanize(this.diff), !e) return t;
                            var i = "color: " + this.color, s = 0, o = 0;
                            return (t = [t[0], i, "color: inherit"].concat(Array.prototype.slice.call(t, 1)))[0].replace(/%[a-z%]/g, function (t) {
                                "%%" !== t && (s++, "%c" === t && (o = s))
                            }), t.splice(o, 0, i), t
                        }, n.save = function (t) {
                            try {
                                null == t ? n.storage.removeItem("debug") : n.storage.debug = t
                            } catch (t) {
                            }
                        }, n.load = i, n.useColors = function () {
                            return "WebkitAppearance" in document.documentElement.style || window.console && (console.firebug || console.exception && console.table) || navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31
                        }, n.storage = "undefined" != typeof chrome && void 0 !== chrome.storage ? chrome.storage.local : function () {
                            try {
                                return window.localStorage
                            } catch (t) {
                            }
                        }(), n.colors = ["lightseagreen", "forestgreen", "goldenrod", "dodgerblue", "darkorchid", "crimson"], n.formatters.j = function (t) {
                            return JSON.stringify(t)
                        }, n.enable(i())
                    }, { "./debug": 18 }],
                    18: [function (t, e, n) {
                        function i() {
                            return n.colors[o++ % n.colors.length]
                        }

                        (n = e.exports = function (t) {
                            function e() {
                            }

                            function o() {
                                var t = o, e = +new Date, r = e - (s || e);
                                t.diff = r, t.prev = s, t.curr = e, s = e, null == t.useColors && (t.useColors = n.useColors()), null == t.color && t.useColors && (t.color = i());
                                var c = Array.prototype.slice.call(arguments);
                                c[0] = n.coerce(c[0]), "string" != typeof c[0] && (c = ["%o"].concat(c));
                                var a = 0;
                                c[0] = c[0].replace(/%([a-z%])/g, function (e, i) {
                                    if ("%%" === e) return e;
                                    a++;
                                    var s = n.formatters[i];
                                    if ("function" == typeof s) {
                                        var o = c[a];
                                        e = s.call(t, o), c.splice(a, 1), a--
                                    }
                                    return e
                                }), "function" == typeof n.formatArgs && (c = n.formatArgs.apply(t, c)), (o.log || n.log || console.log.bind(console)).apply(t, c)
                            }

                            e.enabled = !1, o.enabled = !0;
                            var r = n.enabled(t) ? o : e;
                            return r.namespace = t, r
                        }).coerce = function (t) {
                            return t instanceof Error ? t.stack || t.message : t
                        }, n.disable = function () {
                            n.enable("")
                        }, n.enable = function (t) {
                            n.save(t);
                            for (var e = (t || "").split(/[\s,]+/), i = e.length, s = 0; s < i; s++) e[s] && ("-" === (t = e[s].replace(/\*/g, ".*?"))[0] ? n.skips.push(new RegExp("^" + t.substr(1) + "$")) : n.names.push(new RegExp("^" + t + "$")))
                        }, n.enabled = function (t) {
                            var e, i;
                            for (e = 0, i = n.skips.length; e < i; e++) if (n.skips[e].test(t)) return !1;
                            for (e = 0, i = n.names.length; e < i; e++) if (n.names[e].test(t)) return !0;
                            return !1
                        }, n.humanize = t("ms"), n.names = [], n.skips = [], n.formatters = {};
                        var s, o = 0
                    }, { ms: 25 }],
                    19: [function (t, e, n) {
                        (function (e) {
                            function i(t, e) {
                                return e("b" + n.packets[t.type] + t.data.data)
                            }

                            function s(t, e, i) {
                                if (!e) return n.encodeBase64Packet(t, i);
                                var s = t.data, o = new Uint8Array(s), r = new Uint8Array(1 + s.byteLength);
                                r[0] = y[t.type];
                                for (var c = 0; c < o.length; c++) r[c + 1] = o[c];
                                return i(r.buffer)
                            }

                            function o(t, e, i) {
                                if (!e) return n.encodeBase64Packet(t, i);
                                var s = new FileReader;
                                return s.onload = function () {
                                    t.data = s.result, n.encodePacket(t, e, !0, i)
                                }, s.readAsArrayBuffer(t.data)
                            }

                            function r(t, e, i) {
                                if (!e) return n.encodeBase64Packet(t, i);
                                if (m) return o(t, e, i);
                                var s = new Uint8Array(1);
                                return s[0] = y[t.type], i(new b([s.buffer, t.data]))
                            }

                            function c(t, e, n) {
                                for (var i = new Array(t.length), s = f(t.length, n), o = 0; o < t.length; o++) !function (t, n, s) {
                                    e(n, function (e, n) {
                                        i[t] = n, s(e, i)
                                    })
                                }(o, t[o], s)
                            }

                            var a = t("./keys"), h = t("has-binary"), l = t("arraybuffer.slice"),
                                u = t("base64-arraybuffer"), f = t("after"), d = t("utf8"),
                                p = navigator.userAgent.match(/Android/i), g = /PhantomJS/i.test(navigator.userAgent),
                                m = p || g;
                            n.protocol = 3;
                            var y = n.packets = { open: 0, close: 1, ping: 2, pong: 3, message: 4, upgrade: 5, noop: 6 },
                                v = a(y), _ = { type: "error", data: "parser error" }, b = t("blob");
                            n.encodePacket = function (t, n, o, c) {
                                "function" == typeof n && (c = n, n = !1), "function" == typeof o && (c = o, o = null);
                                var a = void 0 === t.data ? void 0 : t.data.buffer || t.data;
                                if (e.ArrayBuffer && a instanceof ArrayBuffer) return s(t, n, c);
                                if (b && a instanceof e.Blob) return r(t, n, c);
                                if (a && a.base64) return i(t, c);
                                var h = y[t.type];
                                return void 0 !== t.data && (h += o ? d.encode(String(t.data)) : String(t.data)), c("" + h)
                            }, n.encodeBase64Packet = function (t, i) {
                                var s = "b" + n.packets[t.type];
                                if (b && t.data instanceof e.Blob) {
                                    var o = new FileReader;
                                    return o.onload = function () {
                                        var t = o.result.split(",")[1];
                                        i(s + t)
                                    }, o.readAsDataURL(t.data)
                                }
                                var r;
                                try {
                                    r = String.fromCharCode.apply(null, new Uint8Array(t.data))
                                } catch (e) {
                                    for (var c = new Uint8Array(t.data), a = new Array(c.length), h = 0; h < c.length; h++) a[h] = c[h];
                                    r = String.fromCharCode.apply(null, a)
                                }
                                return s += e.btoa(r), i(s)
                            }, n.decodePacket = function (t, e, i) {
                                if ("string" == typeof t || void 0 === t) {
                                    if ("b" == t.charAt(0)) return n.decodeBase64Packet(t.substr(1), e);
                                    if (i) try {
                                        t = d.decode(t)
                                    } catch (t) {
                                        return _
                                    }
                                    s = t.charAt(0);
                                    return Number(s) == s && v[s] ? t.length > 1 ? {
                                        type: v[s],
                                        data: t.substring(1)
                                    } : { type: v[s] } : _
                                }
                                var s = new Uint8Array(t)[0], o = l(t, 1);
                                return b && "blob" === e && (o = new b([o])), { type: v[s], data: o }
                            }, n.decodeBase64Packet = function (t, n) {
                                var i = v[t.charAt(0)];
                                if (!e.ArrayBuffer) return { type: i, data: { base64: !0, data: t.substr(1) } };
                                var s = u.decode(t.substr(1));
                                return "blob" === n && b && (s = new b([s])), { type: i, data: s }
                            }, n.encodePayload = function (t, e, i) {
                                function s(t) {
                                    return t.length + ":" + t
                                }

                                "function" == typeof e && (i = e, e = null);
                                var o = h(t);
                                return e && o ? b && !m ? n.encodePayloadAsBlob(t, i) : n.encodePayloadAsArrayBuffer(t, i) : t.length ? void c(t, function (t, i) {
                                    n.encodePacket(t, !!o && e, !0, function (t) {
                                        i(null, s(t))
                                    })
                                }, function (t, e) {
                                    return i(e.join(""))
                                }) : i("0:")
                            }, n.decodePayload = function (t, e, i) {
                                if ("string" != typeof t) return n.decodePayloadAsBinary(t, e, i);
                                "function" == typeof e && (i = e, e = null);
                                var s;
                                if ("" == t) return i(_, 0, 1);
                                for (var o, r, c = "", a = 0, h = t.length; a < h; a++) {
                                    var l = t.charAt(a);
                                    if (":" != l) c += l; else {
                                        if ("" == c || c != (o = Number(c))) return i(_, 0, 1);
                                        if (r = t.substr(a + 1, o), c != r.length) return i(_, 0, 1);
                                        if (r.length) {
                                            if (s = n.decodePacket(r, e, !0), _.type == s.type && _.data == s.data) return i(_, 0, 1);
                                            if (!1 === i(s, a + o, h)) return
                                        }
                                        a += o, c = ""
                                    }
                                }
                                return "" != c ? i(_, 0, 1) : void 0
                            }, n.encodePayloadAsArrayBuffer = function (t, e) {
                                if (!t.length) return e(new ArrayBuffer(0));
                                c(t, function (t, e) {
                                    n.encodePacket(t, !0, !0, function (t) {
                                        return e(null, t)
                                    })
                                }, function (t, n) {
                                    var i = n.reduce(function (t, e) {
                                        var n;
                                        return n = "string" == typeof e ? e.length : e.byteLength, t + n.toString().length + n + 2
                                    }, 0), s = new Uint8Array(i), o = 0;
                                    return n.forEach(function (t) {
                                        var e = "string" == typeof t, n = t;
                                        if (e) {
                                            for (var i = new Uint8Array(t.length), r = 0; r < t.length; r++) i[r] = t.charCodeAt(r);
                                            n = i.buffer
                                        }
                                        s[o++] = e ? 0 : 1;
                                        for (var c = n.byteLength.toString(), r = 0; r < c.length; r++) s[o++] = parseInt(c[r]);
                                        s[o++] = 255;
                                        for (var i = new Uint8Array(n), r = 0; r < i.length; r++) s[o++] = i[r]
                                    }), e(s.buffer)
                                })
                            }, n.encodePayloadAsBlob = function (t, e) {
                                c(t, function (t, e) {
                                    n.encodePacket(t, !0, !0, function (t) {
                                        var n = new Uint8Array(1);
                                        if (n[0] = 1, "string" == typeof t) {
                                            for (var i = new Uint8Array(t.length), s = 0; s < t.length; s++) i[s] = t.charCodeAt(s);
                                            t = i.buffer, n[0] = 0
                                        }
                                        for (var o = (t instanceof ArrayBuffer ? t.byteLength : t.size).toString(), r = new Uint8Array(o.length + 1), s = 0; s < o.length; s++) r[s] = parseInt(o[s]);
                                        if (r[o.length] = 255, b) {
                                            var c = new b([n.buffer, r.buffer, t]);
                                            e(null, c)
                                        }
                                    })
                                }, function (t, n) {
                                    return e(new b(n))
                                })
                            }, n.decodePayloadAsBinary = function (t, e, i) {
                                "function" == typeof e && (i = e, e = null);
                                for (var s = t, o = [], r = !1; s.byteLength > 0;) {
                                    for (var c = new Uint8Array(s), a = 0 === c[0], h = "", u = 1; 255 != c[u]; u++) {
                                        if (h.length > 310) {
                                            r = !0;
                                            break
                                        }
                                        h += c[u]
                                    }
                                    if (r) return i(_, 0, 1);
                                    s = l(s, 2 + h.length), h = parseInt(h);
                                    var f = l(s, 0, h);
                                    if (a) try {
                                        f = String.fromCharCode.apply(null, new Uint8Array(f))
                                    } catch (t) {
                                        var d = new Uint8Array(f);
                                        f = "";
                                        for (u = 0; u < d.length; u++) f += String.fromCharCode(d[u])
                                    }
                                    o.push(f), s = l(s, h)
                                }
                                var p = o.length;
                                o.forEach(function (t, s) {
                                    i(n.decodePacket(t, e, !0), s, p)
                                })
                            }
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, {
                        "./keys": 20,
                        after: 11,
                        "arraybuffer.slice": 12,
                        "base64-arraybuffer": 13,
                        blob: 14,
                        "has-binary": 21,
                        utf8: 29
                    }],
                    20: [function (t, e, n) {
                        e.exports = Object.keys || function (t) {
                            var e = [], n = Object.prototype.hasOwnProperty;
                            for (var i in t) n.call(t, i) && e.push(i);
                            return e
                        }
                    }, {}],
                    21: [function (t, e, n) {
                        (function (n) {
                            var i = t("isarray");
                            e.exports = function (t) {
                                function e(t) {
                                    if (!t) return !1;
                                    if (n.Buffer && n.Buffer.isBuffer(t) || n.ArrayBuffer && t instanceof ArrayBuffer || n.Blob && t instanceof Blob || n.File && t instanceof File) return !0;
                                    if (i(t)) {
                                        for (var o = 0; o < t.length; o++) if (e(t[o])) return !0
                                    } else if (t && "object" == (void 0 === t ? "undefined" : s(t))) {
                                        t.toJSON && (t = t.toJSON());
                                        for (var r in t) if (Object.prototype.hasOwnProperty.call(t, r) && e(t[r])) return !0
                                    }
                                    return !1
                                }

                                return e(t)
                            }
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, { isarray: 24 }],
                    22: [function (t, e, n) {
                        try {
                            e.exports = "undefined" != typeof XMLHttpRequest && "withCredentials" in new XMLHttpRequest
                        } catch (t) {
                            e.exports = !1
                        }
                    }, {}],
                    23: [function (t, e, n) {
                        var i = [].indexOf;
                        e.exports = function (t, e) {
                            if (i) return t.indexOf(e);
                            for (var n = 0; n < t.length; ++n) if (t[n] === e) return n;
                            return -1
                        }
                    }, {}],
                    24: [function (t, e, n) {
                        e.exports = Array.isArray || function (t) {
                            return "[object Array]" == Object.prototype.toString.call(t)
                        }
                    }, {}],
                    25: [function (t, e, n) {
                        function i(t) {
                            if (!((t = "" + t).length > 1e4)) {
                                var e = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(t);
                                if (e) {
                                    var n = parseFloat(e[1]);
                                    switch ((e[2] || "ms").toLowerCase()) {
                                        case "years":
                                        case "year":
                                        case "yrs":
                                        case "yr":
                                        case "y":
                                            return n * u;
                                        case "days":
                                        case "day":
                                        case "d":
                                            return n * l;
                                        case "hours":
                                        case "hour":
                                        case "hrs":
                                        case "hr":
                                        case "h":
                                            return n * h;
                                        case "minutes":
                                        case "minute":
                                        case "mins":
                                        case "min":
                                        case "m":
                                            return n * a;
                                        case "seconds":
                                        case "second":
                                        case "secs":
                                        case "sec":
                                        case "s":
                                            return n * c;
                                        case "milliseconds":
                                        case "millisecond":
                                        case "msecs":
                                        case "msec":
                                        case "ms":
                                            return n
                                    }
                                }
                            }
                        }

                        function s(t) {
                            return t >= l ? Math.round(t / l) + "d" : t >= h ? Math.round(t / h) + "h" : t >= a ? Math.round(t / a) + "m" : t >= c ? Math.round(t / c) + "s" : t + "ms"
                        }

                        function o(t) {
                            return r(t, l, "day") || r(t, h, "hour") || r(t, a, "minute") || r(t, c, "second") || t + " ms"
                        }

                        function r(t, e, n) {
                            if (!(t < e)) return t < 1.5 * e ? Math.floor(t / e) + " " + n : Math.ceil(t / e) + " " + n + "s"
                        }

                        var c = 1e3, a = 60 * c, h = 60 * a, l = 24 * h, u = 365.25 * l;
                        e.exports = function (t, e) {
                            return e = e || {}, "string" == typeof t ? i(t) : e.long ? o(t) : s(t)
                        }
                    }, {}],
                    26: [function (t, e, n) {
                        (function (t) {
                            var n = /^[\],:{}\s]*$/, i = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
                                s = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                                o = /(?:^|:|,)(?:\s*\[)+/g, r = /^\s+/, c = /\s+$/;
                            e.exports = function (e) {
                                return "string" == typeof e && e ? (e = e.replace(r, "").replace(c, ""), t.JSON && JSON.parse ? JSON.parse(e) : n.test(e.replace(i, "@").replace(s, "]").replace(o, "")) ? new Function("return " + e)() : void 0) : null
                            }
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, {}],
                    27: [function (t, e, n) {
                        n.encode = function (t) {
                            var e = "";
                            for (var n in t) t.hasOwnProperty(n) && (e.length && (e += "&"), e += encodeURIComponent(n) + "=" + encodeURIComponent(t[n]));
                            return e
                        }, n.decode = function (t) {
                            for (var e = {}, n = t.split("&"), i = 0, s = n.length; i < s; i++) {
                                var o = n[i].split("=");
                                e[decodeURIComponent(o[0])] = decodeURIComponent(o[1])
                            }
                            return e
                        }
                    }, {}],
                    28: [function (t, e, n) {
                        var i = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/,
                            s = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
                        e.exports = function (t) {
                            var e = t, n = t.indexOf("["), o = t.indexOf("]");
                            -1 != n && -1 != o && (t = t.substring(0, n) + t.substring(n, o).replace(/:/g, ";") + t.substring(o, t.length));
                            for (var r = i.exec(t || ""), c = {}, a = 14; a--;) c[s[a]] = r[a] || "";
                            return -1 != n && -1 != o && (c.source = e, c.host = c.host.substring(1, c.host.length - 1).replace(/;/g, ":"), c.authority = c.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), c.ipv6uri = !0), c
                        }
                    }, {}],
                    29: [function (t, e, n) {
                        (function (t) {
                            !function (i) {
                                function o(t) {
                                    for (var e, n, i = [], s = 0, o = t.length; s < o;) (e = t.charCodeAt(s++)) >= 55296 && e <= 56319 && s < o ? 56320 == (64512 & (n = t.charCodeAt(s++))) ? i.push(((1023 & e) << 10) + (1023 & n) + 65536) : (i.push(e), s--) : i.push(e);
                                    return i
                                }

                                function r(t) {
                                    for (var e, n = t.length, i = -1, s = ""; ++i < n;) (e = t[i]) > 65535 && (s += v((e -= 65536) >>> 10 & 1023 | 55296), e = 56320 | 1023 & e), s += v(e);
                                    return s
                                }

                                function c(t) {
                                    if (t >= 55296 && t <= 57343) throw Error("Lone surrogate U+" + t.toString(16).toUpperCase() + " is not a scalar value")
                                }

                                function a(t, e) {
                                    return v(t >> e & 63 | 128)
                                }

                                function h(t) {
                                    if (0 == (4294967168 & t)) return v(t);
                                    var e = "";
                                    return 0 == (4294965248 & t) ? e = v(t >> 6 & 31 | 192) : 0 == (4294901760 & t) ? (c(t), e = v(t >> 12 & 15 | 224), e += a(t, 6)) : 0 == (4292870144 & t) && (e = v(t >> 18 & 7 | 240), e += a(t, 12), e += a(t, 6)), e += v(63 & t | 128)
                                }

                                function l() {
                                    if (y >= m) throw Error("Invalid byte index");
                                    var t = 255 & g[y];
                                    if (y++, 128 == (192 & t)) return 63 & t;
                                    throw Error("Invalid continuation byte")
                                }

                                function u() {
                                    var t, e, n, i, s;
                                    if (y > m) throw Error("Invalid byte index");
                                    if (y == m) return !1;
                                    if (t = 255 & g[y], y++, 0 == (128 & t)) return t;
                                    if (192 == (224 & t)) {
                                        if ((s = (31 & t) << 6 | (e = l())) >= 128) return s;
                                        throw Error("Invalid continuation byte")
                                    }
                                    if (224 == (240 & t)) {
                                        if (e = l(), n = l(), (s = (15 & t) << 12 | e << 6 | n) >= 2048) return c(s), s;
                                        throw Error("Invalid continuation byte")
                                    }
                                    if (240 == (248 & t) && (e = l(), n = l(), i = l(), (s = (15 & t) << 18 | e << 12 | n << 6 | i) >= 65536 && s <= 1114111)) return s;
                                    throw Error("Invalid UTF-8 detected")
                                }

                                var f = "object" == (void 0 === n ? "undefined" : s(n)) && n,
                                    d = "object" == (void 0 === e ? "undefined" : s(e)) && e && e.exports == f && e,
                                    p = "object" == (void 0 === t ? "undefined" : s(t)) && t;
                                p.global !== p && p.window !== p || (i = p);
                                var g, m, y, v = String.fromCharCode, _ = {
                                    version: "2.0.0", encode: function (t) {
                                        for (var e = o(t), n = e.length, i = -1, s = ""; ++i < n;) s += h(e[i]);
                                        return s
                                    }, decode: function (t) {
                                        g = o(t), m = g.length, y = 0;
                                        for (var e, n = []; !1 !== (e = u());) n.push(e);
                                        return r(n)
                                    }
                                };
                                if (f && !f.nodeType) if (d) d.exports = _; else {
                                    var b = {}.hasOwnProperty;
                                    for (var C in _) b.call(_, C) && (f[C] = _[C])
                                } else i.utf8 = _
                            }(this)
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, {}],
                    30: [function (t, e, n) {
                        function i(t) {
                            var e = "";
                            do {
                                e = r[t % c] + e, t = Math.floor(t / c)
                            } while (t > 0);
                            return e
                        }

                        function s() {
                            var t = i(+new Date);
                            return t !== o ? (h = 0, o = t) : t + "." + i(h++)
                        }

                        for (var o, r = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split(""), c = 64, a = {}, h = 0, l = 0; l < c; l++) a[r[l]] = l;
                        s.encode = i, s.decode = function (t) {
                            var e = 0;
                            for (l = 0; l < t.length; l++) e = e * c + a[t.charAt(l)];
                            return e
                        }, e.exports = s
                    }, {}],
                    31: [function (t, e, n) {
                        function i(t, e) {
                            "object" == (void 0 === t ? "undefined" : s(t)) && (e = t, t = void 0), e = e || {};
                            var n, i = o(t), r = i.source, l = i.id, u = i.path, f = h[l] && u in h[l].nsps;
                            return e.forceNew || e["force new connection"] || !1 === e.multiplex || f ? (a("ignoring socket cache for %s", r), n = c(r, e)) : (h[l] || (a("new io instance for %s", r), h[l] = c(r, e)), n = h[l]), n.socket(i.path)
                        }

                        var o = t("./url"), r = t("socket.io-parser"), c = t("./manager"),
                            a = t("debug")("socket.io-client");
                        e.exports = n = i;
                        var h = n.managers = {};
                        n.protocol = r.protocol, n.connect = i, n.Manager = t("./manager"), n.Socket = t("./socket")
                    }, { "./manager": 32, "./socket": 34, "./url": 35, debug: 39, "socket.io-parser": 47 }],
                    32: [function (t, e, n) {
                        function i(t, e) {
                            if (!(this instanceof i)) return new i(t, e);
                            t && "object" == (void 0 === t ? "undefined" : s(t)) && (e = t, t = void 0), (e = e || {}).path = e.path || "/socket.io", this.nsps = {}, this.subs = [], this.opts = e, this.reconnection(!1 !== e.reconnection), this.reconnectionAttempts(e.reconnectionAttempts || 1 / 0), this.reconnectionDelay(e.reconnectionDelay || 1e3), this.reconnectionDelayMax(e.reconnectionDelayMax || 5e3), this.randomizationFactor(e.randomizationFactor || .5), this.backoff = new d({
                                min: this.reconnectionDelay(),
                                max: this.reconnectionDelayMax(),
                                jitter: this.randomizationFactor()
                            }), this.timeout(null == e.timeout ? 2e4 : e.timeout), this.readyState = "closed", this.uri = t, this.connecting = [], this.lastPing = null, this.encoding = !1, this.packetBuffer = [], this.encoder = new a.Encoder, this.decoder = new a.Decoder, this.autoConnect = !1 !== e.autoConnect, this.autoConnect && this.open()
                        }

                        var o = t("engine.io-client"), r = t("./socket"), c = t("component-emitter"),
                            a = t("socket.io-parser"), h = t("./on"), l = t("component-bind"),
                            u = t("debug")("socket.io-client:manager"), f = t("indexof"), d = t("backo2"),
                            p = Object.prototype.hasOwnProperty;
                        e.exports = i, i.prototype.emitAll = function () {
                            this.emit.apply(this, arguments);
                            for (var t in this.nsps) p.call(this.nsps, t) && this.nsps[t].emit.apply(this.nsps[t], arguments)
                        }, i.prototype.updateSocketIds = function () {
                            for (var t in this.nsps) p.call(this.nsps, t) && (this.nsps[t].id = this.engine.id)
                        }, c(i.prototype), i.prototype.reconnection = function (t) {
                            return arguments.length ? (this._reconnection = !!t, this) : this._reconnection
                        }, i.prototype.reconnectionAttempts = function (t) {
                            return arguments.length ? (this._reconnectionAttempts = t, this) : this._reconnectionAttempts
                        }, i.prototype.reconnectionDelay = function (t) {
                            return arguments.length ? (this._reconnectionDelay = t, this.backoff && this.backoff.setMin(t), this) : this._reconnectionDelay
                        }, i.prototype.randomizationFactor = function (t) {
                            return arguments.length ? (this._randomizationFactor = t, this.backoff && this.backoff.setJitter(t), this) : this._randomizationFactor
                        }, i.prototype.reconnectionDelayMax = function (t) {
                            return arguments.length ? (this._reconnectionDelayMax = t, this.backoff && this.backoff.setMax(t), this) : this._reconnectionDelayMax
                        }, i.prototype.timeout = function (t) {
                            return arguments.length ? (this._timeout = t, this) : this._timeout
                        }, i.prototype.maybeReconnectOnOpen = function () {
                            !this.reconnecting && this._reconnection && 0 === this.backoff.attempts && this.reconnect()
                        }, i.prototype.open = i.prototype.connect = function (t) {
                            if (u("readyState %s", this.readyState), ~this.readyState.indexOf("open")) return this;
                            u("opening %s", this.uri), this.engine = o(this.uri, this.opts);
                            var e = this.engine, n = this;
                            this.readyState = "opening", this.skipReconnect = !1;
                            var i = h(e, "open", function () {
                                n.onopen(), t && t()
                            }), s = h(e, "error", function (e) {
                                if (u("connect_error"), n.cleanup(), n.readyState = "closed", n.emitAll("connect_error", e), t) {
                                    var i = new Error("Connection error");
                                    i.data = e, t(i)
                                } else n.maybeReconnectOnOpen()
                            });
                            if (!1 !== this._timeout) {
                                var r = this._timeout;
                                u("connect attempt will timeout after %d", r);
                                var c = setTimeout(function () {
                                    u("connect attempt timed out after %d", r), i.destroy(), e.close(), e.emit("error", "timeout"), n.emitAll("connect_timeout", r)
                                }, r);
                                this.subs.push({
                                    destroy: function () {
                                        clearTimeout(c)
                                    }
                                })
                            }
                            return this.subs.push(i), this.subs.push(s), this
                        }, i.prototype.onopen = function () {
                            u("open"), this.cleanup(), this.readyState = "open", this.emit("open");
                            var t = this.engine;
                            this.subs.push(h(t, "data", l(this, "ondata"))), this.subs.push(h(t, "ping", l(this, "onping"))), this.subs.push(h(t, "pong", l(this, "onpong"))), this.subs.push(h(t, "error", l(this, "onerror"))), this.subs.push(h(t, "close", l(this, "onclose"))), this.subs.push(h(this.decoder, "decoded", l(this, "ondecoded")))
                        }, i.prototype.onping = function () {
                            this.lastPing = new Date, this.emitAll("ping")
                        }, i.prototype.onpong = function () {
                            this.emitAll("pong", new Date - this.lastPing)
                        }, i.prototype.ondata = function (t) {
                            this.decoder.add(t)
                        }, i.prototype.ondecoded = function (t) {
                            this.emit("packet", t)
                        }, i.prototype.onerror = function (t) {
                            u("error", t), this.emitAll("error", t)
                        }, i.prototype.socket = function (t) {
                            function e() {
                                ~f(i.connecting, n) || i.connecting.push(n)
                            }

                            var n = this.nsps[t];
                            if (!n) {
                                n = new r(this, t), this.nsps[t] = n;
                                var i = this;
                                n.on("connecting", e), n.on("connect", function () {
                                    n.id = i.engine.id
                                }), this.autoConnect && e()
                            }
                            return n
                        }, i.prototype.destroy = function (t) {
                            var e = f(this.connecting, t);
                            ~e && this.connecting.splice(e, 1), this.connecting.length || this.close()
                        }, i.prototype.packet = function (t) {
                            u("writing packet %j", t);
                            var e = this;
                            e.encoding ? e.packetBuffer.push(t) : (e.encoding = !0, this.encoder.encode(t, function (n) {
                                for (var i = 0; i < n.length; i++) e.engine.write(n[i], t.options);
                                e.encoding = !1, e.processPacketQueue()
                            }))
                        }, i.prototype.processPacketQueue = function () {
                            if (this.packetBuffer.length > 0 && !this.encoding) {
                                var t = this.packetBuffer.shift();
                                this.packet(t)
                            }
                        }, i.prototype.cleanup = function () {
                            u("cleanup");
                            for (var t; t = this.subs.shift();) t.destroy();
                            this.packetBuffer = [], this.encoding = !1, this.lastPing = null, this.decoder.destroy()
                        }, i.prototype.close = i.prototype.disconnect = function () {
                            u("disconnect"), this.skipReconnect = !0, this.reconnecting = !1, "opening" == this.readyState && this.cleanup(), this.backoff.reset(), this.readyState = "closed", this.engine && this.engine.close()
                        }, i.prototype.onclose = function (t) {
                            u("onclose"), this.cleanup(), this.backoff.reset(), this.readyState = "closed", this.emit("close", t), this._reconnection && !this.skipReconnect && this.reconnect()
                        }, i.prototype.reconnect = function () {
                            if (this.reconnecting || this.skipReconnect) return this;
                            var t = this;
                            if (this.backoff.attempts >= this._reconnectionAttempts) u("reconnect failed"), this.backoff.reset(), this.emitAll("reconnect_failed"), this.reconnecting = !1; else {
                                var e = this.backoff.duration();
                                u("will wait %dms before reconnect attempt", e), this.reconnecting = !0;
                                var n = setTimeout(function () {
                                    t.skipReconnect || (u("attempting reconnect"), t.emitAll("reconnect_attempt", t.backoff.attempts), t.emitAll("reconnecting", t.backoff.attempts), t.skipReconnect || t.open(function (e) {
                                        e ? (u("reconnect attempt error"), t.reconnecting = !1, t.reconnect(), t.emitAll("reconnect_error", e.data)) : (u("reconnect success"), t.onreconnect())
                                    }))
                                }, e);
                                this.subs.push({
                                    destroy: function () {
                                        clearTimeout(n)
                                    }
                                })
                            }
                        }, i.prototype.onreconnect = function () {
                            var t = this.backoff.attempts;
                            this.reconnecting = !1, this.backoff.reset(), this.updateSocketIds(), this.emitAll("reconnect", t)
                        }
                    }, {
                        "./on": 33,
                        "./socket": 34,
                        backo2: 36,
                        "component-bind": 37,
                        "component-emitter": 38,
                        debug: 39,
                        "engine.io-client": 1,
                        indexof: 42,
                        "socket.io-parser": 47
                    }],
                    33: [function (t, e, n) {
                        e.exports = function (t, e, n) {
                            return t.on(e, n), {
                                destroy: function () {
                                    t.removeListener(e, n)
                                }
                            }
                        }
                    }, {}],
                    34: [function (t, e, n) {
                        function i(t, e) {
                            this.io = t, this.nsp = e, this.json = this, this.ids = 0, this.acks = {}, this.receiveBuffer = [], this.sendBuffer = [], this.connected = !1, this.disconnected = !0, this.io.autoConnect && this.open()
                        }

                        var s = t("socket.io-parser"), o = t("component-emitter"), r = t("to-array"), c = t("./on"),
                            a = t("component-bind"), h = t("debug")("socket.io-client:socket"), l = t("has-binary");
                        e.exports = i;
                        var u = {
                            connect: 1,
                            connect_error: 1,
                            connect_timeout: 1,
                            connecting: 1,
                            disconnect: 1,
                            error: 1,
                            reconnect: 1,
                            reconnect_attempt: 1,
                            reconnect_failed: 1,
                            reconnect_error: 1,
                            reconnecting: 1,
                            ping: 1,
                            pong: 1
                        }, f = o.prototype.emit;
                        o(i.prototype), i.prototype.subEvents = function () {
                            if (!this.subs) {
                                var t = this.io;
                                this.subs = [c(t, "open", a(this, "onopen")), c(t, "packet", a(this, "onpacket")), c(t, "close", a(this, "onclose"))]
                            }
                        }, i.prototype.open = i.prototype.connect = function () {
                            return this.connected ? this : (this.subEvents(), this.io.open(), "open" == this.io.readyState && this.onopen(), this.emit("connecting"), this)
                        }, i.prototype.send = function () {
                            var t = r(arguments);
                            return t.unshift("message"), this.emit.apply(this, t), this
                        }, i.prototype.emit = function (t) {
                            if (u.hasOwnProperty(t)) return f.apply(this, arguments), this;
                            var e = r(arguments), n = s.EVENT;
                            l(e) && (n = s.BINARY_EVENT);
                            var i = { type: n, data: e };
                            return i.options = {}, i.options.compress = !this.flags || !1 !== this.flags.compress, "function" == typeof e[e.length - 1] && (h("emitting packet with ack id %d", this.ids), this.acks[this.ids] = e.pop(), i.id = this.ids++), this.connected ? this.packet(i) : this.sendBuffer.push(i), delete this.flags, this
                        }, i.prototype.packet = function (t) {
                            t.nsp = this.nsp, this.io.packet(t)
                        }, i.prototype.onopen = function () {
                            h("transport is open - connecting"), "/" != this.nsp && this.packet({ type: s.CONNECT })
                        }, i.prototype.onclose = function (t) {
                            h("close (%s)", t), this.connected = !1, this.disconnected = !0, delete this.id, this.emit("disconnect", t)
                        }, i.prototype.onpacket = function (t) {
                            if (t.nsp == this.nsp) switch (t.type) {
                                case s.CONNECT:
                                    this.onconnect();
                                    break;
                                case s.EVENT:
                                case s.BINARY_EVENT:
                                    this.onevent(t);
                                    break;
                                case s.ACK:
                                case s.BINARY_ACK:
                                    this.onack(t);
                                    break;
                                case s.DISCONNECT:
                                    this.ondisconnect();
                                    break;
                                case s.ERROR:
                                    this.emit("error", t.data)
                            }
                        }, i.prototype.onevent = function (t) {
                            var e = t.data || [];
                            h("emitting event %j", e), null != t.id && (h("attaching ack callback to event"), e.push(this.ack(t.id))), this.connected ? f.apply(this, e) : this.receiveBuffer.push(e)
                        }, i.prototype.ack = function (t) {
                            var e = this, n = !1;
                            return function () {
                                if (!n) {
                                    n = !0;
                                    var i = r(arguments);
                                    h("sending ack %j", i);
                                    var o = l(i) ? s.BINARY_ACK : s.ACK;
                                    e.packet({ type: o, id: t, data: i })
                                }
                            }
                        }, i.prototype.onack = function (t) {
                            var e = this.acks[t.id];
                            "function" == typeof e ? (h("calling ack %s with %j", t.id, t.data), e.apply(this, t.data), delete this.acks[t.id]) : h("bad ack %s", t.id)
                        }, i.prototype.onconnect = function () {
                            this.connected = !0, this.disconnected = !1, this.emit("connect"), this.emitBuffered()
                        }, i.prototype.emitBuffered = function () {
                            var t;
                            for (t = 0; t < this.receiveBuffer.length; t++) f.apply(this, this.receiveBuffer[t]);
                            for (this.receiveBuffer = [], t = 0; t < this.sendBuffer.length; t++) this.packet(this.sendBuffer[t]);
                            this.sendBuffer = []
                        }, i.prototype.ondisconnect = function () {
                            h("server disconnect (%s)", this.nsp), this.destroy(), this.onclose("io server disconnect")
                        }, i.prototype.destroy = function () {
                            if (this.subs) {
                                for (var t = 0; t < this.subs.length; t++) this.subs[t].destroy();
                                this.subs = null
                            }
                            this.io.destroy(this)
                        }, i.prototype.close = i.prototype.disconnect = function () {
                            return this.connected && (h("performing disconnect (%s)", this.nsp), this.packet({ type: s.DISCONNECT })), this.destroy(), this.connected && this.onclose("io client disconnect"), this
                        }, i.prototype.compress = function (t) {
                            return this.flags = this.flags || {}, this.flags.compress = t, this
                        }
                    }, {
                        "./on": 33,
                        "component-bind": 37,
                        "component-emitter": 38,
                        debug: 39,
                        "has-binary": 41,
                        "socket.io-parser": 47,
                        "to-array": 51
                    }],
                    35: [function (t, e, n) {
                        (function (n) {
                            var i = t("parseuri"), s = t("debug")("socket.io-client:url");
                            e.exports = function (t, e) {
                                var o = t, e = e || n.location;
                                null == t && (t = e.protocol + "//" + e.host), "string" == typeof t && ("/" == t.charAt(0) && (t = "/" == t.charAt(1) ? e.protocol + t : e.host + t), /^(https?|wss?):\/\//.test(t) || (s("protocol-less url %s", t), t = void 0 !== e ? e.protocol + "//" + t : "https://" + t), s("parse %s", t), o = i(t)), o.port || (/^(http|ws)$/.test(o.protocol) ? o.port = "80" : /^(http|ws)s$/.test(o.protocol) && (o.port = "443")), o.path = o.path || "/";
                                var r = -1 !== o.host.indexOf(":") ? "[" + o.host + "]" : o.host;
                                return o.id = o.protocol + "://" + r + ":" + o.port, o.href = o.protocol + "://" + r + (e && e.port == o.port ? "" : ":" + o.port), o
                            }
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, { debug: 39, parseuri: 45 }],
                    36: [function (t, e, n) {
                        function i(t) {
                            t = t || {}, this.ms = t.min || 100, this.max = t.max || 1e4, this.factor = t.factor || 2, this.jitter = t.jitter > 0 && t.jitter <= 1 ? t.jitter : 0, this.attempts = 0
                        }

                        e.exports = i, i.prototype.duration = function () {
                            var t = this.ms * Math.pow(this.factor, this.attempts++);
                            if (this.jitter) {
                                var e = Math.random(), n = Math.floor(e * this.jitter * t);
                                t = 0 == (1 & Math.floor(10 * e)) ? t - n : t + n
                            }
                            return 0 | Math.min(t, this.max)
                        }, i.prototype.reset = function () {
                            this.attempts = 0
                        }, i.prototype.setMin = function (t) {
                            this.ms = t
                        }, i.prototype.setMax = function (t) {
                            this.max = t
                        }, i.prototype.setJitter = function (t) {
                            this.jitter = t
                        }
                    }, {}],
                    37: [function (t, e, n) {
                        var i = [].slice;
                        e.exports = function (t, e) {
                            if ("string" == typeof e && (e = t[e]), "function" != typeof e) throw new Error("bind() requires a function");
                            var n = i.call(arguments, 2);
                            return function () {
                                return e.apply(t, n.concat(i.call(arguments)))
                            }
                        }
                    }, {}],
                    38: [function (t, e, n) {
                        function i(t) {
                            if (t) return s(t)
                        }

                        function s(t) {
                            for (var e in i.prototype) t[e] = i.prototype[e];
                            return t
                        }

                        e.exports = i, i.prototype.on = i.prototype.addEventListener = function (t, e) {
                            return this._callbacks = this._callbacks || {}, (this._callbacks["$" + t] = this._callbacks["$" + t] || []).push(e), this
                        }, i.prototype.once = function (t, e) {
                            function n() {
                                this.off(t, n), e.apply(this, arguments)
                            }

                            return n.fn = e, this.on(t, n), this
                        }, i.prototype.off = i.prototype.removeListener = i.prototype.removeAllListeners = i.prototype.removeEventListener = function (t, e) {
                            if (this._callbacks = this._callbacks || {}, 0 == arguments.length) return this._callbacks = {}, this;
                            var n = this._callbacks["$" + t];
                            if (!n) return this;
                            if (1 == arguments.length) return delete this._callbacks["$" + t], this;
                            for (var i, s = 0; s < n.length; s++) if ((i = n[s]) === e || i.fn === e) {
                                n.splice(s, 1);
                                break
                            }
                            return this
                        }, i.prototype.emit = function (t) {
                            this._callbacks = this._callbacks || {};
                            var e = [].slice.call(arguments, 1), n = this._callbacks["$" + t];
                            if (n) for (var i = 0, s = (n = n.slice(0)).length; i < s; ++i) n[i].apply(this, e);
                            return this
                        }, i.prototype.listeners = function (t) {
                            return this._callbacks = this._callbacks || {}, this._callbacks["$" + t] || []
                        }, i.prototype.hasListeners = function (t) {
                            return !!this.listeners(t).length
                        }
                    }, {}],
                    39: [function (t, e, n) {
                        arguments[4][17][0].apply(n, arguments)
                    }, { "./debug": 40, dup: 17 }],
                    40: [function (t, e, n) {
                        arguments[4][18][0].apply(n, arguments)
                    }, { dup: 18, ms: 44 }],
                    41: [function (t, e, n) {
                        (function (n) {
                            var i = t("isarray");
                            e.exports = function (t) {
                                function e(t) {
                                    if (!t) return !1;
                                    if (n.Buffer && n.Buffer.isBuffer && n.Buffer.isBuffer(t) || n.ArrayBuffer && t instanceof ArrayBuffer || n.Blob && t instanceof Blob || n.File && t instanceof File) return !0;
                                    if (i(t)) {
                                        for (var o = 0; o < t.length; o++) if (e(t[o])) return !0
                                    } else if (t && "object" == (void 0 === t ? "undefined" : s(t))) {
                                        t.toJSON && "function" == typeof t.toJSON && (t = t.toJSON());
                                        for (var r in t) if (Object.prototype.hasOwnProperty.call(t, r) && e(t[r])) return !0
                                    }
                                    return !1
                                }

                                return e(t)
                            }
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, { isarray: 43 }],
                    42: [function (t, e, n) {
                        arguments[4][23][0].apply(n, arguments)
                    }, { dup: 23 }],
                    43: [function (t, e, n) {
                        arguments[4][24][0].apply(n, arguments)
                    }, { dup: 24 }],
                    44: [function (t, e, n) {
                        arguments[4][25][0].apply(n, arguments)
                    }, { dup: 25 }],
                    45: [function (t, e, n) {
                        arguments[4][28][0].apply(n, arguments)
                    }, { dup: 28 }],
                    46: [function (t, e, n) {
                        (function (e) {
                            var i = t("isarray"), o = t("./is-buffer");
                            n.deconstructPacket = function (t) {
                                function e(t) {
                                    if (!t) return t;
                                    if (o(t)) {
                                        var r = { _placeholder: !0, num: n.length };
                                        return n.push(t), r
                                    }
                                    if (i(t)) {
                                        for (var c = new Array(t.length), a = 0; a < t.length; a++) c[a] = e(t[a]);
                                        return c
                                    }
                                    if ("object" == (void 0 === t ? "undefined" : s(t)) && !(t instanceof Date)) {
                                        c = {};
                                        for (var h in t) c[h] = e(t[h]);
                                        return c
                                    }
                                    return t
                                }

                                var n = [], r = t.data, c = t;
                                return c.data = e(r), c.attachments = n.length, { packet: c, buffers: n }
                            }, n.reconstructPacket = function (t, e) {
                                function n(t) {
                                    if (t && t._placeholder) return e[t.num];
                                    if (i(t)) {
                                        for (var o = 0; o < t.length; o++) t[o] = n(t[o]);
                                        return t
                                    }
                                    if (t && "object" == (void 0 === t ? "undefined" : s(t))) {
                                        for (var r in t) t[r] = n(t[r]);
                                        return t
                                    }
                                    return t
                                }

                                return t.data = n(t.data), t.attachments = void 0, t
                            }, n.removeBlobs = function (t, n) {
                                function r(t, h, l) {
                                    if (!t) return t;
                                    if (e.Blob && t instanceof Blob || e.File && t instanceof File) {
                                        c++;
                                        var u = new FileReader;
                                        u.onload = function () {
                                            l ? l[h] = this.result : a = this.result, --c || n(a)
                                        }, u.readAsArrayBuffer(t)
                                    } else if (i(t)) for (var f = 0; f < t.length; f++) r(t[f], f, t); else if (t && "object" == (void 0 === t ? "undefined" : s(t)) && !o(t)) for (var d in t) r(t[d], d, t)
                                }

                                var c = 0, a = t;
                                r(a), c || n(a)
                            }
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, { "./is-buffer": 48, isarray: 43 }],
                    47: [function (t, e, n) {
                        function i() {
                        }

                        function s(t) {
                            var e = "", i = !1;
                            return e += t.type, n.BINARY_EVENT != t.type && n.BINARY_ACK != t.type || (e += t.attachments, e += "-"), t.nsp && "/" != t.nsp && (i = !0, e += t.nsp), null != t.id && (i && (e += ",", i = !1), e += t.id), null != t.data && (i && (e += ","), e += u.stringify(t.data)), l("encoded %j as %s", t, e), e
                        }

                        function o(t, e) {
                            d.removeBlobs(t, function (t) {
                                var n = d.deconstructPacket(t), i = s(n.packet), o = n.buffers;
                                o.unshift(i), e(o)
                            })
                        }

                        function r() {
                            this.reconstructor = null
                        }

                        function c(t) {
                            var e = {}, i = 0;
                            if (e.type = Number(t.charAt(0)), null == n.types[e.type]) return h();
                            if (n.BINARY_EVENT == e.type || n.BINARY_ACK == e.type) {
                                for (var s = ""; "-" != t.charAt(++i) && (s += t.charAt(i), i != t.length););
                                if (s != Number(s) || "-" != t.charAt(i)) throw new Error("Illegal attachments");
                                e.attachments = Number(s)
                            }
                            if ("/" == t.charAt(i + 1)) for (e.nsp = ""; ++i && "," != (r = t.charAt(i)) && (e.nsp += r, i != t.length);); else e.nsp = "/";
                            var o = t.charAt(i + 1);
                            if ("" !== o && Number(o) == o) {
                                for (e.id = ""; ++i;) {
                                    var r = t.charAt(i);
                                    if (null == r || Number(r) != r) {
                                        --i;
                                        break
                                    }
                                    if (e.id += t.charAt(i), i == t.length) break
                                }
                                e.id = Number(e.id)
                            }
                            if (t.charAt(++i)) try {
                                e.data = u.parse(t.substr(i))
                            } catch (t) {
                                return h()
                            }
                            return l("decoded %s as %j", t, e), e
                        }

                        function a(t) {
                            this.reconPack = t, this.buffers = []
                        }

                        function h(t) {
                            return { type: n.ERROR, data: "parser error" }
                        }

                        var l = t("debug")("socket.io-parser"), u = t("json3"),
                            f = (t("isarray"), t("component-emitter")), d = t("./binary"), p = t("./is-buffer");
                        n.protocol = 4, n.types = ["CONNECT", "DISCONNECT", "EVENT", "BINARY_EVENT", "ACK", "BINARY_ACK", "ERROR"], n.CONNECT = 0, n.DISCONNECT = 1, n.EVENT = 2, n.ACK = 3, n.ERROR = 4, n.BINARY_EVENT = 5, n.BINARY_ACK = 6, n.Encoder = i, n.Decoder = r, i.prototype.encode = function (t, e) {
                            l("encoding packet %j", t), n.BINARY_EVENT == t.type || n.BINARY_ACK == t.type ? o(t, e) : e([s(t)])
                        }, f(r.prototype), r.prototype.add = function (t) {
                            var e;
                            if ("string" == typeof t) e = c(t), n.BINARY_EVENT == e.type || n.BINARY_ACK == e.type ? (this.reconstructor = new a(e), 0 === this.reconstructor.reconPack.attachments && this.emit("decoded", e)) : this.emit("decoded", e); else {
                                if (!p(t) && !t.base64) throw new Error("Unknown type: " + t);
                                if (!this.reconstructor) throw new Error("got binary data when not reconstructing a packet");
                                (e = this.reconstructor.takeBinaryData(t)) && (this.reconstructor = null, this.emit("decoded", e))
                            }
                        }, r.prototype.destroy = function () {
                            this.reconstructor && this.reconstructor.finishedReconstruction()
                        }, a.prototype.takeBinaryData = function (t) {
                            if (this.buffers.push(t), this.buffers.length == this.reconPack.attachments) {
                                var e = d.reconstructPacket(this.reconPack, this.buffers);
                                return this.finishedReconstruction(), e
                            }
                            return null
                        }, a.prototype.finishedReconstruction = function () {
                            this.reconPack = null, this.buffers = []
                        }
                    }, { "./binary": 46, "./is-buffer": 48, "component-emitter": 49, debug: 39, isarray: 43, json3: 50 }],
                    48: [function (t, e, n) {
                        (function (t) {
                            e.exports = function (e) {
                                return t.Buffer && t.Buffer.isBuffer(e) || t.ArrayBuffer && e instanceof ArrayBuffer
                            }
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, {}],
                    49: [function (t, e, n) {
                        arguments[4][15][0].apply(n, arguments)
                    }, { dup: 15 }],
                    50: [function (t, e, n) {
                        (function (t) {
                            (function () {
                                function i(t, e) {
                                    function n(t) {
                                        if (n[t] !== y) return n[t];
                                        var i;
                                        if ("bug-string-char-index" == t) i = "a" != "a"[0]; else if ("json" == t) i = n("json-stringify") && n("json-parse"); else {
                                            var s, o = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
                                            if ("json-stringify" == t) {
                                                var c = e.stringify, h = "function" == typeof c && b;
                                                if (h) {
                                                    (s = function () {
                                                        return 1
                                                    }).toJSON = s;
                                                    try {
                                                        h = "0" === c(0) && "0" === c(new r) && '""' == c(new a) && c(_) === y && c(y) === y && c() === y && "1" === c(s) && "[1]" == c([s]) && "[null]" == c([y]) && "null" == c(null) && "[null,null,null]" == c([y, _, null]) && c({ a: [s, !0, !1, null, "\0\b\n\f\r\t"] }) == o && "1" === c(null, s) && "[\n 1,\n 2\n]" == c([1, 2], null, 1) && '"-271821-04-20T00:00:00.000Z"' == c(new l(-864e13)) && '"+275760-09-13T00:00:00.000Z"' == c(new l(864e13)) && '"-000001-01-01T00:00:00.000Z"' == c(new l(-621987552e5)) && '"1969-12-31T23:59:59.999Z"' == c(new l(-1))
                                                    } catch (t) {
                                                        h = !1
                                                    }
                                                }
                                                i = h
                                            }
                                            if ("json-parse" == t) {
                                                var u = e.parse;
                                                if ("function" == typeof u) try {
                                                    if (0 === u("0") && !u(!1)) {
                                                        var f = 5 == (s = u(o)).a.length && 1 === s.a[0];
                                                        if (f) {
                                                            try {
                                                                f = !u('"\t"')
                                                            } catch (t) {
                                                            }
                                                            if (f) try {
                                                                f = 1 !== u("01")
                                                            } catch (t) {
                                                            }
                                                            if (f) try {
                                                                f = 1 !== u("1.")
                                                            } catch (t) {
                                                            }
                                                        }
                                                    }
                                                } catch (t) {
                                                    f = !1
                                                }
                                                i = f
                                            }
                                        }
                                        return n[t] = !!i
                                    }

                                    t || (t = c.Object()), e || (e = c.Object());
                                    var r = t.Number || c.Number, a = t.String || c.String, h = t.Object || c.Object,
                                        l = t.Date || c.Date, u = t.SyntaxError || c.SyntaxError,
                                        f = t.TypeError || c.TypeError, d = t.Math || c.Math, p = t.JSON || c.JSON;
                                    "object" == (void 0 === p ? "undefined" : s(p)) && p && (e.stringify = p.stringify, e.parse = p.parse);
                                    var g, m, y, v = h.prototype, _ = v.toString, b = new l(-0xc782b5b800cec);
                                    try {
                                        b = -109252 == b.getUTCFullYear() && 0 === b.getUTCMonth() && 1 === b.getUTCDate() && 10 == b.getUTCHours() && 37 == b.getUTCMinutes() && 6 == b.getUTCSeconds() && 708 == b.getUTCMilliseconds()
                                    } catch (t) {
                                    }
                                    if (!n("json")) {
                                        var C = n("bug-string-char-index");
                                        if (!b) var w = d.floor,
                                            k = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
                                            T = function (t, e) {
                                                return k[e] + 365 * (t - 1970) + w((t - 1969 + (e = +(e > 1))) / 4) - w((t - 1901 + e) / 100) + w((t - 1601 + e) / 400)
                                            };
                                        if ((g = v.hasOwnProperty) || (g = function (t) {
                                            var e, n = {};
                                            return (n.__proto__ = null, n.__proto__ = { toString: 1 }, n).toString != _ ? g = function (t) {
                                                var e = this.__proto__, n = t in (this.__proto__ = null, this);
                                                return this.__proto__ = e, n
                                            } : (e = n.constructor, g = function (t) {
                                                var n = (this.constructor || e).prototype;
                                                return t in this && !(t in n && this[t] === n[t])
                                            }), n = null, g.call(this, t)
                                        }), m = function (t, e) {
                                            var n, i, r, c = 0;
                                            (n = function () {
                                                this.valueOf = 0
                                            }).prototype.valueOf = 0, i = new n;
                                            for (r in i) g.call(i, r) && c++;
                                            return n = i = null, c ? m = 2 == c ? function (t, e) {
                                                var n, i = {}, s = "[object Function]" == _.call(t);
                                                for (n in t) s && "prototype" == n || g.call(i, n) || !(i[n] = 1) || !g.call(t, n) || e(n)
                                            } : function (t, e) {
                                                var n, i, s = "[object Function]" == _.call(t);
                                                for (n in t) s && "prototype" == n || !g.call(t, n) || (i = "constructor" === n) || e(n);
                                                (i || g.call(t, n = "constructor")) && e(n)
                                            } : (i = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"], m = function (t, e) {
                                                var n, r, c = "[object Function]" == _.call(t),
                                                    a = !c && "function" != typeof t.constructor && o[s(t.hasOwnProperty)] && t.hasOwnProperty || g;
                                                for (n in t) c && "prototype" == n || !a.call(t, n) || e(n);
                                                for (r = i.length; n = i[--r]; a.call(t, n) && e(n));
                                            }), m(t, e)
                                        }, !n("json-stringify")) {
                                            var A = {
                                                92: "\\\\",
                                                34: '\\"',
                                                8: "\\b",
                                                12: "\\f",
                                                10: "\\n",
                                                13: "\\r",
                                                9: "\\t"
                                            }, q = function (t, e) {
                                                return ("000000" + (e || 0)).slice(-t)
                                            }, B = function (t) {
                                                for (var e = '"', n = 0, i = t.length, s = !C || i > 10, o = s && (C ? t.split("") : t); n < i; n++) {
                                                    var r = t.charCodeAt(n);
                                                    switch (r) {
                                                        case 8:
                                                        case 9:
                                                        case 10:
                                                        case 12:
                                                        case 13:
                                                        case 34:
                                                        case 92:
                                                            e += A[r];
                                                            break;
                                                        default:
                                                            if (r < 32) {
                                                                e += "\\u00" + q(2, r.toString(16));
                                                                break
                                                            }
                                                            e += s ? o[n] : t.charAt(n)
                                                    }
                                                }
                                                return e + '"'
                                            }, P = function t(e, n, i, o, r, c, a) {
                                                var h, l, u, d, p, v, b, C, k, A, P, S, x, I, M, F;
                                                try {
                                                    h = n[e]
                                                } catch (t) {
                                                }
                                                if ("object" == (void 0 === h ? "undefined" : s(h)) && h) if ("[object Date]" != (l = _.call(h)) || g.call(h, "toJSON")) "function" == typeof h.toJSON && ("[object Number]" != l && "[object String]" != l && "[object Array]" != l || g.call(h, "toJSON")) && (h = h.toJSON(e)); else if (h > -1 / 0 && h < 1 / 0) {
                                                    if (T) {
                                                        for (p = w(h / 864e5), u = w(p / 365.2425) + 1970 - 1; T(u + 1, 0) <= p; u++);
                                                        for (d = w((p - T(u, 0)) / 30.42); T(u, d + 1) <= p; d++);
                                                        p = 1 + p - T(u, d), b = w((v = (h % 864e5 + 864e5) % 864e5) / 36e5) % 24, C = w(v / 6e4) % 60, k = w(v / 1e3) % 60, A = v % 1e3
                                                    } else u = h.getUTCFullYear(), d = h.getUTCMonth(), p = h.getUTCDate(), b = h.getUTCHours(), C = h.getUTCMinutes(), k = h.getUTCSeconds(), A = h.getUTCMilliseconds();
                                                    h = (u <= 0 || u >= 1e4 ? (u < 0 ? "-" : "+") + q(6, u < 0 ? -u : u) : q(4, u)) + "-" + q(2, d + 1) + "-" + q(2, p) + "T" + q(2, b) + ":" + q(2, C) + ":" + q(2, k) + "." + q(3, A) + "Z"
                                                } else h = null;
                                                if (i && (h = i.call(n, e, h)), null === h) return "null";
                                                if ("[object Boolean]" == (l = _.call(h))) return "" + h;
                                                if ("[object Number]" == l) return h > -1 / 0 && h < 1 / 0 ? "" + h : "null";
                                                if ("[object String]" == l) return B("" + h);
                                                if ("object" == (void 0 === h ? "undefined" : s(h))) {
                                                    for (I = a.length; I--;) if (a[I] === h) throw f();
                                                    if (a.push(h), P = [], M = c, c += r, "[object Array]" == l) {
                                                        for (x = 0, I = h.length; x < I; x++) S = t(x, h, i, o, r, c, a), P.push(S === y ? "null" : S);
                                                        F = P.length ? r ? "[\n" + c + P.join(",\n" + c) + "\n" + M + "]" : "[" + P.join(",") + "]" : "[]"
                                                    } else m(o || h, function (e) {
                                                        var n = t(e, h, i, o, r, c, a);
                                                        n !== y && P.push(B(e) + ":" + (r ? " " : "") + n)
                                                    }), F = P.length ? r ? "{\n" + c + P.join(",\n" + c) + "\n" + M + "}" : "{" + P.join(",") + "}" : "{}";
                                                    return a.pop(), F
                                                }
                                            };
                                            e.stringify = function (t, e, n) {
                                                var i, r, c, a;
                                                if (o[void 0 === e ? "undefined" : s(e)] && e) if ("[object Function]" == (a = _.call(e))) r = e; else if ("[object Array]" == a) {
                                                    c = {};
                                                    for (var h, l = 0, u = e.length; l < u; h = e[l++], ("[object String]" == (a = _.call(h)) || "[object Number]" == a) && (c[h] = 1));
                                                }
                                                if (n) if ("[object Number]" == (a = _.call(n))) {
                                                    if ((n -= n % 1) > 0) for (i = "", n > 10 && (n = 10); i.length < n; i += " ");
                                                } else "[object String]" == a && (i = n.length <= 10 ? n : n.slice(0, 10));
                                                return P("", (h = {}, h[""] = t, h), r, c, i, "", [])
                                            }
                                        }
                                        if (!n("json-parse")) {
                                            var S, x, I = a.fromCharCode, M = {
                                                92: "\\",
                                                34: '"',
                                                47: "/",
                                                98: "\b",
                                                116: "\t",
                                                110: "\n",
                                                102: "\f",
                                                114: "\r"
                                            }, F = function () {
                                                throw S = x = null, u()
                                            }, R = function () {
                                                for (var t, e, n, i, s, o = x, r = o.length; S < r;) switch (s = o.charCodeAt(S)) {
                                                    case 9:
                                                    case 10:
                                                    case 13:
                                                    case 32:
                                                        S++;
                                                        break;
                                                    case 123:
                                                    case 125:
                                                    case 91:
                                                    case 93:
                                                    case 58:
                                                    case 44:
                                                        return t = C ? o.charAt(S) : o[S], S++, t;
                                                    case 34:
                                                        for (t = "@", S++; S < r;) if ((s = o.charCodeAt(S)) < 32) F(); else if (92 == s) switch (s = o.charCodeAt(++S)) {
                                                            case 92:
                                                            case 34:
                                                            case 47:
                                                            case 98:
                                                            case 116:
                                                            case 110:
                                                            case 102:
                                                            case 114:
                                                                t += M[s], S++;
                                                                break;
                                                            case 117:
                                                                for (e = ++S, n = S + 4; S < n; S++) (s = o.charCodeAt(S)) >= 48 && s <= 57 || s >= 97 && s <= 102 || s >= 65 && s <= 70 || F();
                                                                t += I("0x" + o.slice(e, S));
                                                                break;
                                                            default:
                                                                F()
                                                        } else {
                                                            if (34 == s) break;
                                                            for (s = o.charCodeAt(S), e = S; s >= 32 && 92 != s && 34 != s;) s = o.charCodeAt(++S);
                                                            t += o.slice(e, S)
                                                        }
                                                        if (34 == o.charCodeAt(S)) return S++, t;
                                                        F();
                                                    default:
                                                        if (e = S, 45 == s && (i = !0, s = o.charCodeAt(++S)), s >= 48 && s <= 57) {
                                                            for (48 == s && (s = o.charCodeAt(S + 1)) >= 48 && s <= 57 && F(), i = !1; S < r && (s = o.charCodeAt(S)) >= 48 && s <= 57; S++);
                                                            if (46 == o.charCodeAt(S)) {
                                                                for (n = ++S; n < r && (s = o.charCodeAt(n)) >= 48 && s <= 57; n++);
                                                                n == S && F(), S = n
                                                            }
                                                            if (101 == (s = o.charCodeAt(S)) || 69 == s) {
                                                                for (43 != (s = o.charCodeAt(++S)) && 45 != s || S++, n = S; n < r && (s = o.charCodeAt(n)) >= 48 && s <= 57; n++);
                                                                n == S && F(), S = n
                                                            }
                                                            return +o.slice(e, S)
                                                        }
                                                        if (i && F(), "true" == o.slice(S, S + 4)) return S += 4, !0;
                                                        if ("false" == o.slice(S, S + 5)) return S += 5, !1;
                                                        if ("null" == o.slice(S, S + 4)) return S += 4, null;
                                                        F()
                                                }
                                                return "$"
                                            }, E = function t(e) {
                                                var n, i;
                                                if ("$" == e && F(), "string" == typeof e) {
                                                    if ("@" == (C ? e.charAt(0) : e[0])) return e.slice(1);
                                                    if ("[" == e) {
                                                        for (n = []; "]" != (e = R()); i || (i = !0)) i && ("," == e ? "]" == (e = R()) && F() : F()), "," == e && F(), n.push(t(e));
                                                        return n
                                                    }
                                                    if ("{" == e) {
                                                        for (n = {}; "}" != (e = R()); i || (i = !0)) i && ("," == e ? "}" == (e = R()) && F() : F()), "," != e && "string" == typeof e && "@" == (C ? e.charAt(0) : e[0]) && ":" == R() || F(), n[e.slice(1)] = t(R());
                                                        return n
                                                    }
                                                    F()
                                                }
                                                return e
                                            }, L = function (t, e, n) {
                                                var i = N(t, e, n);
                                                i === y ? delete t[e] : t[e] = i
                                            }, N = function (t, e, n) {
                                                var i, o = t[e];
                                                if ("object" == (void 0 === o ? "undefined" : s(o)) && o) if ("[object Array]" == _.call(o)) for (i = o.length; i--;) L(o, i, n); else m(o, function (t) {
                                                    L(o, t, n)
                                                });
                                                return n.call(t, e, o)
                                            };
                                            e.parse = function (t, e) {
                                                var n, i;
                                                return S = 0, x = "" + t, n = E(R()), "$" != R() && F(), S = x = null, e && "[object Function]" == _.call(e) ? N((i = {}, i[""] = n, i), "", e) : n
                                            }
                                        }
                                    }
                                    return e.runInContext = i, e
                                }

                                var o = { function: !0, object: !0 },
                                    r = o[void 0 === n ? "undefined" : s(n)] && n && !n.nodeType && n,
                                    c = o["undefined" == typeof window ? "undefined" : s(window)] && window || this,
                                    a = r && o[void 0 === e ? "undefined" : s(e)] && e && !e.nodeType && "object" == (void 0 === t ? "undefined" : s(t)) && t;
                                if (!a || a.global !== a && a.window !== a && a.self !== a || (c = a), r) i(c, r); else {
                                    var h = c.JSON, l = c.JSON3, u = !1, f = i(c, c.JSON3 = {
                                        noConflict: function () {
                                            return u || (u = !0, c.JSON = h, c.JSON3 = l, h = l = null), f
                                        }
                                    });
                                    c.JSON = { parse: f.parse, stringify: f.stringify }
                                }
                            }).call(this)
                        }).call(this, "undefined" != typeof self ? self : "undefined" != typeof window ? window : void 0 !== i ? i : {})
                    }, {}],
                    51: [function (t, e, n) {
                        e.exports = function (t, e) {
                            for (var n = [], i = (e = e || 0) || 0; i < t.length; i++) n[i - e] = t[i];
                            return n
                        }
                    }, {}]
                }, {}, [31])(31)
            }), cc._RF.pop()
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {}], zh: [function (t, e, n) {
        "use strict";
        cc._RF.push(e, "77784LRrLtNUZqXof19dK1m", "zh"), window.i18n || (window.i18n = {}), window.i18n.languages || (window.i18n.languages = {}), window.i18n.languages.zh = {
            key1: "入场0.1元",
            key2: "入场1元",
            key3: "入场10元",
            key4: "入场100元",
            key5: "入场1000元",
            key6: "入场10000元",
            key7: "正在加载资源，请稍候",
            key8: "正在连接服务器",
            key9: "连接失败，即将重试",
            key10: "准备登陆",
            key11: "与服务器断开连接，正在尝试重连",
            key12: "每一笔最最少充值10元 \n 需要安装支付宝客户端",
            key13: "每一笔最最少充值10元 \n 需要安装微信客户端",
            key14: "二维码下载",
            key15: "系统消息: 恭喜%s号桌的%s捕获了%s, 获得%s金币",
            key16: "再见！",
            key17: "你好！",
            key18: "积累奖池",
            key19: "充值",
            key20: "支付宝",
            key21: "微信",
            key22: "银商",
            key23: "立即充值",
            key24: "当前账号",
            key25: "充值金额",
            key26: "每一笔最少充值%s元，需要安装支付宝客户端",
            key27: "邮箱",
            key28: "暂时无消息",
            key29: "设置",
            key30: "音效",
            key31: "音乐",
            key32: "客服",
            key33: "新手场",
            key34: "入场",
            key35: "%s元",
            key36: "炮倍",
            key37: "高级场",
            key38: "龙虎斗",
            key39: "初级场",
            key40: "土豪场",
            key41: "百人牛牛",
            key42: "今日赚取排名",
            key43: "我的排名",
            key44: "今日赚取",
            key45: "提现",
            key46: "邮箱",
            key47: "特权",
            key48: "在充值%s元即可升级到vip%s",
            key49: "获取vip%s专属炮台",
            key50: "获取vip%s专属勋章",
            key51: "解锁自动开炮功能",
            key52: "高级vip同时可享可享有所有低级vip特权",
            key53: "欢迎来到《捕鱼大亨》",
            key54: "阅读",
            key55: "奖励",
            key56: "APP下载",
            key57: "快速开始",
            key58: "等待玩家",
            key59: "锁定",
            key60: "登录游戏",
            key61: "一网打尽",
            key62: "元",
            key63: "帮助",
            key64: "设置",
            key65: "离开",
            key66: "昵称",
            key67: "个人信息",
            key68: "账号",
            key69: "账号类型",
            key70: "手机号码",
            key71: "绑定手机",
            key72: "技能道具",
            key73: "拥有数量%s个",
            key74: "鱼要跑？快使用冰封道具",
            key75: "确定",
            key76: "取消",
            key77: "系统消息",
            key78: "恭喜%S桌的%s捕获了%s,获得%s金币",
            key79: "登陆超时",
            key80: "知道了",
            key81: "切换账号",
            key82: "版本",
            key83: "加载资源",
            key84: "亲爱的玩家，建议您尽快将账号绑定手机，以保障您的账号安全。是否立即前往绑定？",
            key85: "现在绑定还附赠%s元启动金",
            key86: "新昵称",
            key87: '%s位"汉"语或%s位英文数字',
            key88: "本次修改免费",
            key89: "游客",
            key90: "输入手机号码",
            key91: "验证码",
            key92: "设置密码",
            key93: "请输入密码",
            key94: "发送验证码",
            key95: "绑定",
            key96: "以上联系方式均为本游戏专属代理，充值系统不稳定时可使用代理充值。",
            key97: "亲爱的用户，你好： 欢迎来到我们的捕鱼游戏！我们秉承着公平、公正的经营理念，致力为玩家提供最优质的服务，如遇到问题请使用【客服】功能进行反馈，祝您游戏愉快！官方网址：%s,访问可下载游戏APP ",
            key98: "公告",
            key99: "在线反馈",
            key100: "请输入您要咨询的问题",
            key101: "问题提交后客服会尽快处理，请注意查看游戏内的邮件回复。",
            key102: "反馈",
            key103: "是否前往下载APP客户端",
            key104: "明日登录还可领取%s元",
            key105: "明日登录奖励需从APP登录领取为避免账号丢失，建议先绑定手机",
            key106: "下载地址",
            key107: "您的位置",
            key108: "任意门",
            key109: "鱼种",
            key110: "“金边蓝底”为奖励鱼",
            key111: "激光炮",
            key112: "长时间未进行操作%s秒后自动退出游戏......",
            key113: "深海宝藏",
            key114: "打鱼可以累积激光能量（不同场次的能量不通用）",
            key115: "对着一群鱼来一发，抓准时机猛赚一笔",
            key116: "满能量状态时，点击炮台，可以切换激光炮",
            key117: "激光炮对炸弹类鱼和聚宝盆无效，激光炮被激活后需要在30秒内发射",
            key118: "夺宝流程",
            key119: "打钻石鱼",
            key120: "集钻石",
            key121: "开宝箱",
            key122: "赢海量金币",
            key123: "赚翻了",
            key124: "金蝉",
            key125: "鲸鲨",
            key126: "鱼场",
            key127: "运气爆棚",
            key128: "换炮",
            key129: "已装备",
            key130: "使用中",
            key131: "更换炮台",
            key132: "瞄准鱼群开炮吧",
            key133: "太棒了",
            key134: "金币不足",
            key135: "回到大厅",
            key136: "继续游戏",
            key137: "您本次捕鱼的成绩",
            key138: "炮弹消耗",
            key139: "捕鱼收获",
            key140: "结算",
            key141: "宝",
            key142: "中奖名单",
            key143: "奖池介绍",
            key144: "在高级场及以上的场次游戏，可通过收集打鱼掉落的钻石打开宝箱，宝箱打开后可获得奖池奖金。",
            key145: "%s等奖",
            key146: "仅对VIP%s及以上的玩家开放",
            key147: "删除",
            key148: "下一条",
            key149: "返回",
            key150: "更多VIP功能开发中",
            key151: "兑换",
            key152: "您的账号尚未绑定手机，请绑定完成后，在进行兑换操作",
            key153: "可提取金额",
            key154: "兑换金额",
            key155: "收款账号",
            key156: "未绑定",
            key157: "绑定",
            key158: "立即兑换",
            key159: "兑换两小时到账，超出时间未到，请联系客服咨询",
            key160: "兑换最低金额%s元，兑换后账号内必须剩余至少%s元",
            key161: "每笔兑换需要收取兑换金额%%s的手续费",
            key162: "金币不足，无法进入房间",
            key163: "金币不足，是否充值",
            key164: "入场",
            key165: "修改昵称",
            key166: "昵称不能为空",
            key167: "成功",
            key168: "修改成功",
            key169: "点击切换激光炮",
            key170: "鲤鱼网",
            key171: "加载资源",
            key172: "敬请期待",
            key173: "与服务器断开连接，请重新登陆",
            key174: "鱼潮来袭",
            key175: "鲤鱼王来袭",
            key176: "不在玩会了吗？土豪~"
        }, cc._RF.pop()
    }, {}]
}, {}, ["TimelineLite", "TweenLite", "crypto", "EasePack", "myMd5", "socket-io", "Demo", "Alert", "Bggems", "Chat", "CreateRole", "EmailWin", "GonggaoWin", "Hall", "HelpWin", "HotUpdate", "ItemInfoWin", "Loading", "Login", "NoticeTip", "PrivilegeWin", "RankWin", "ReConnect", "RechargeWin", "RewardOrderWin", "ServiceCustomWin", "SettingWin", "UserInfoWin", "UserInfoWinChild", "WaitingConnection", "XiaoxiWin", "setAvatarWin", "AudioMgr", "EventCenter", "GameNetMgr", "Global", "HTTP", "HeadIcon", "MathUtil", "Net", "OnBack", "UserMgr", "Utils", "Bullet", "BulletManager", "Cannon", "Coin", "Fish", "FishGameMananger", "FishManager", "GoldColimn", "GoldColimnManager", "Laser", "NodePoolManager", "RewardFish", "RoomMgr", "bomb", "coinText", "kor", "zh", "LanguageData", "LocalizedLabel", "LocalizedSprite", "SpriteFrameSet", "polyglot.min"]);