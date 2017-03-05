
window.WebSocketManager = {};

/**********************************************************************************************************************
 *                                      socket 指令
 **********************************************************************************************************************/

window.WebSocketManager.Command = {
    // 公共命令
    EnterRoom		: 0x0001,		// 进入房间 0x1005
    EntryRoom    	: 0x0002,		// 玩家进入退出广播 0x1015
    ExitRoom		: 0x0003,		// 玩家退出房间 0x1007
    CloseRoom		: 0x0004,		// 房主解散房间 0x1006
    REQCLOSE_ROOM	: 0x0005,		// 请求解散房间 0x1009
    RETCLOSE_ROOM	: 0x0007,		// 回应请求解散房间 0x1037
    ONLINE_STATE_DB	: 0x0008,		// 玩家上线状态 0x1016
    CHAT_BROADCAST	: 0x0009,		// 聊天广播 0x1002
    USER_READY 		: 0x000A,		// 请求准备 0x1012
    DEALCARD_DB		: 0x000B,		// 广播发牌 0x2005
    GrabCard_DB		: 0x000C,		// 广播玩家摸牌 0x1024
    OutCard_DB		: 0x000D,		// 广播玩家出牌 0x1021
    UPDATE_HANDCARD	: 0x000E,  		// 服务端主动同步手牌 0x2009

    // 转转红中（包括三人转转麻将）麻将 0x1000 ~ 0x101F
    GAME_RECONNECT	: 0x1000,		// 玩家重连 0x1014
    OPERATE_PROMP	: 0x1001,		// 提示玩家操作 0x2007
    ACTION_REQ		: 0x1002, 		// 动作请求 0x1022
    UserTing		: 0x1003,		// 玩家听牌 0x1033
    BIRD_CATCH_DB	: 0x1004,		// 广播抓鸟 0x1026
    LITTLE_ACCOUNT	: 0x1005,		// 单局结算 0x2004
    BIG_ACCOUNT		: 0x1006,		// 总局结算 0x2006

    // will remove
    // XHu_DB			: 0x1031,		// 玩家起手胡牌
    // CancelLiang_DB	: 0x1032,		// 取消玩家亮牌
    // KGangOpt			: 0x1034,		// 开杠或补张

    // 海底牌相关
    // HDiCard_STATE_DB	: 0x1035,		// 玩家回复是否要海底/广播玩家是否要海底
    // HDiCard_Opt		: 0x2012,		// 海底提示
    // HDiCard_DB		: 0x2013,		// 广播海底牌
    // KGangOper		: 0x2011,		// 长沙麻将杠提示
    // HandCardEnable	: 0x1036,		// 禁用手牌

    // 长沙麻将结算
    // CSLITTLEACOUNT	: 0x2014,		// 长沙麻将小结算
    // CSBIGACOUNT		: 0x2015,		// 长沙麻将大结算
    // BROADCAST_RSP	: 0x2002,		// 超级广播返回
    // PLAYOPERATE_REP	: 0x4001,		// 玩家出牌
    // REQUEST_CHIP 	: 0x1004,  		// 客户端请求同步金币
    // RECHARGE 		: 0x0001  		//充值成功
};

/**********************************************************************************************************************
 *                                      RequestMessage 构造方法
 **********************************************************************************************************************/

window.WebSocketManager.requestMessage = {
    getEnterRoomRequestMessage: function(parameters) {
        let message = new proto.game.EnterRoomRequest();
        let userInfo = Tools.getLocalData(Global.localStorageKey.userInfo);

        message.setRoomId(parameters.roomId);
        message.setPlayerUuid(userInfo.playerUuid);
        message.setInfo({
            Gender: userInfo.gender, Gold: userInfo.gold, Score: 0, Nick: userInfo.nickname,
            HandUrl: userInfo.headimgurl, IP: '0.0.0.0', Location: '该用户不想透露位置'
        });

        return message;
    },
};

/**********************************************************************************************************************
 *                                      发送接收 socket 请求
 **********************************************************************************************************************/

/**
 * socket 数据封包解包
 */
window.WebSocketManager.ArrayBuffer = {
    _packageStack: null,

    reader: function(buffer) {
        if (this._packageStack) {
            buffer = this.mergeArrayBuffer([_packageStack, buffer]);
            this._packageStack = null;
        }

        let dataView = new DataView(buffer);
        let size = dataView.getInt32(0);
        if (buffer.byteLength >= size) {
            let cmd = dataView.getInt32(4);
            let data = buffer.slice(8, size);
            cc.log(data);

            let other = buffer.slice(size);
            if (other.byteLength !== 0) {
                this.reader(buffer);
            }

            return {cmd: cmd, data: data};
        }
        else if (buffer.byteLength < size){
            this._packageStack = buffer;
        }
        else {

            return false;
        }
    },

    writer: function(cmd, message) {
        //         size + cmd + message
        let size = 4 + 4 + message.byteLength;
        let arrayBuffer = new ArrayBuffer(8);
        let dataView = new DataView(arrayBuffer);
        dataView.setUint32(0, size);
        dataView.setUint32(4, cmd);

        return this.mergeArrayBuffer([arrayBuffer, message]);
    },

    /**
     * 合并buffer
     *
     * @param bufferList
     * @returns {ArrayBuffer}
     */
    mergeArrayBuffer: function(bufferList) {
        let size = 0;
        for (let i = 0; i < bufferList.length; i++) {
            size += bufferList[i].byteLength;
        }

        if (size === 0) {

            return;
        }

        let index = 0;
        let uint8Array = new Uint8Array(size);
        for (let i = 0; i < bufferList.length; i++) {
            uint8Array.set(new Uint8Array(bufferList[i]), index);
            index = bufferList[i].byteLength;
        }

        return uint8Array.buffer;
    }
};

/**
 * 发送 socket 消息
 *
 * @param name
 * @param parameters
 */
window.WebSocketManager.sendMessage = function(name, parameters) {
    let message = WebSocketManager.requestMessage['get' + name + 'RequestMessage'](parameters);
    let data = WebSocketManager.ArrayBuffer.writer(WebSocketManager.Command[name], message.serializeBinary());

    WebSocketManager.ws.sendMessage(data);
};

/**********************************************************************************************************************
 *                                      WebSocket 管理器
 **********************************************************************************************************************/

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
            cc.log(["onopen: ", evt]);
        };

        this._socket.onmessage = function(evt) {
            let data = WebSocketManager.ArrayBuffer.reader(evt.data);
            let result = proto.game.EnterRoomResponse.deserializeBinary(data.data);

            for (let i = 0; i < self._onmessageListener.length; i++) {
                self._onmessageListener[i](evt, data);
            }
            cc.log(["onmessage: ", evt]);
        };

        this._socket.onerror = function(evt) {
            for (let i = 0; i < self._onerrorListener.length; i++) {
                self._onerrorListener[i](evt);
            }
            cc.log(["onerror: ", evt]);
        };

        this._socket.onclose = function(evt) {
            for (let i = 0; i < self._oncloseListener.length; i++) {
                self._oncloseListener[i](evt);
            }
            cc.log(["onclose: ", evt]);
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
        this._socket.binaryType = "arraybuffer";
    },

    sendMessage: function(data) {
        this._socket.send(data);
    },

    closeSocket: function() {
        this._socket.close();
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

