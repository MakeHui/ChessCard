
window.WebSocketManager = {};

window.WebSocketManager.Command = {
    // 公共命令
    SOCKET_CMD_ENTER_ROOM		: 0x0001,		// 进入房间 0x1005
    SOCKET_CMD_ENTRYROOM_DB		: 0x0002,		// 玩家进入退出广播 0x1015
    SOCKET_CMD_EXIT_ROOM		: 0x0003,		// 玩家退出房间 0x1007
    SOCKET_CMD_CLOSE_ROOM		: 0x0004,		// 房主解散房间 0x1006
    SOCKET_CMD_REQCLOSE_ROOM	: 0x0005,		// 请求解散房间 0x1009
    SOCKET_CMD_RETCLOSE_ROOM	: 0x0007,		// 回应请求解散房间 0x1037
    SOCKET_CMD_ONLINE_STATE_DB	: 0x0008,		// 玩家上线状态 0x1016
    SOCKET_CMD_CHAT_BROADCAST	: 0x0009,		// 聊天广播 0x1002
    SOCKET_CMD_USER_READY 		: 0x000A,		// 请求准备 0x1012
    SOCKET_CMD_DEALCARD_DB		: 0x000B,		// 广播发牌 0x2005
    SOCKET_CMD_GrabCard_DB		: 0x000C,		// 广播玩家摸牌 0x1024
    SOCKET_CMD_OutCard_DB		: 0x000D,		// 广播玩家出牌 0x1021
    SOCKET_CMD_UPDATE_HANDCARD	: 0x000E,  		// 服务端主动同步手牌 0x2009

    // 转转红中（包括三人转转麻将）麻将 0x1000 ~ 0x101F
    SOCKET_CMD_GAME_RECONNECT	: 0x1000,		// 玩家重连 0x1014
    SOCKET_CMD_OPERATE_PROMP	: 0x1001,		// 提示玩家操作 0x2007
    SOCKET_CMD_ACTION_REQ		: 0x1002, 		// 动作请求 0x1022
    SOCKET_CMD_UserTing			: 0x1003,		// 玩家听牌 0x1033
    SOCKET_CMD_BIRD_CATCH_DB	: 0x1004,		// 广播抓鸟 0x1026
    SOCKET_CMD_LITTLE_ACCOUNT	: 0x1005,		// 单局结算 0x2004
    SOCKET_CMD_BIG_ACCOUNT		: 0x1006,		// 总局结算 0x2006

    // will remove
    // SOCKET_CMD_XHu_DB			: 0x1031,		// 玩家起手胡牌
    // SOCKET_CMD_CancelLiang_DB	: 0x1032,		// 取消玩家亮牌
    // SOCKET_CMD_KGangOpt			: 0x1034,		// 开杠或补张

    // 海底牌相关
    // SOCKET_CMD_HDiCard_STATE_DB	: 0x1035,		// 玩家回复是否要海底/广播玩家是否要海底
    // SOCKET_CMD_HDiCard_Opt		: 0x2012,		// 海底提示
    // SOCKET_CMD_HDiCard_DB		: 0x2013,		// 广播海底牌
    // SOCKET_CMD_KGangOper		: 0x2011,		// 长沙麻将杠提示
    // SOCKET_CMD_HandCardEnable	: 0x1036,		// 禁用手牌

    // 长沙麻将结算
    // SOCKET_CMD_CSLITTLEACOUNT	: 0x2014,		// 长沙麻将小结算
    // SOCKET_CMD_CSBIGACOUNT		: 0x2015,		// 长沙麻将大结算
    // SOCKET_CMD_BROADCAST_RSP	: 0x2002,		// 超级广播返回
    // SOCKET_CMD_PLAYOPERATE_REP	: 0x4001,		// 玩家出牌
    // SOCKET_CMD_REQUEST_CHIP 	: 0x1004,  		// 客户端请求同步金币
    // SOCKET_CMD_RECHARGE 		: 0x0001  		//充值成功
};

/**
 * WebSocket
 */
window.WebSocketManager.ws = {
    _socket: null,
    
    _onopenListener: [],

    _onmessageListener: [],

    _onerrorListener: [],

    _oncloseListener: [],

    _openSocket: function(url) {
        this._socket = new WebSocket(url);
        let self = this;

        this._socket.onopen = function(evt) {
            for (let i = 0; i < self._onopenListener.length; i++) {
                self._onopenListener[i](evt);
            }
            cc.log("onopen: " + evt);
        };

        this._socket.onmessage = function(evt) {
            for (let i = 0; i < self._onmessageListener.length; i++) {
                self._onmessageListener[i](evt);
            }
            cc.log("onmessage: " + evt.data);
        };

        this._socket.onerror = function(evt) {
            for (let i = 0; i < self._onerrorListener.length; i++) {
                self._onerrorListener[i](evt);
            }
            cc.log("onerror: " + evt);
        };

        this._socket.onclose = function(evt) {
            for (let i = 0; i < self._oncloseListener.length; i++) {
                self._oncloseListener[i](evt);
            }
            cc.log("onclose: " + evt);
        };
    },

    openSocket: function(url) {
        if (this._socket) {
            if (this._socket.readyState == WebSocket.CONNECTING 
                || this._socket.readyState == WebSocket.OPEN) {
                this.closeSocket();
            }
        }
        this._openSocket(url);
    },

    closeSocket: function() {
        this._socket.close();
    },

    sendSocket: function(data) {
        this._socket.send(data);
    },

    addOnopenListener: function(listner) {
        this._onopenListener.push(listner);
    },

    addOnmessageListener: function(listner) {
        this._onmessageListener.push(listner);
    },

    addOnerrorListener: function(listner) {
        this._onerrorListener.push(listner);
    },

    addOncloseListener: function(listner) {
        this._oncloseListener.push(listner);
    },

    removeOnopenListener: function(listner) {
        Tools.removeArrayInValue(this._onopenListener, listner);
    },

    removeOnmessageListener: function(listner) {
        Tools.removeArrayInValue(this._onmessageListener, listner);
    },

    removeOnerrorListener: function(listner) {
        Tools.removeArrayInValue(this._onerrorListener, listner);
    },

    removeOncloseListener: function(listner) {
        Tools.removeArrayInValue(this._oncloseListener, listner);
    }
};

