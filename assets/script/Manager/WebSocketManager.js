'use strict';

window.WebSocketManager = {};

/**
 ***********************************************************************************************************************
 *                                      socket 指令
 ***********************************************************************************************************************
 **/

window.WebSocketManager.Command = {
    // 公共命令
    EnterRoom: 0x0001, // 1、进入房间
    EnterRoomOther: 0x0002, // 2、其他玩家进入房间
    ExitRoom: 0x0003, // 3、离开房间
    DismissRoom: 0x0004, // 4、解散房间
    SponsorVote: 0x0005, // 5、发起投票解散
    HeartBeat: 0x0006,   // 心跳
    PlayerVote: 0x0007, // 6、玩家投票
    OnlineStatus: 0x0008, // 7、玩家上线离线广播
    Speaker: 0x0009, // 8、超级广播命令
    Ready: 0x000A, // 9、准备
    Deal: 0x000B, // 10、起手发牌
    Draw: 0x000C, // 11、抓牌
    Discard: 0x000D, // 12、出牌
    SynchroniseCards: 0x000E, // 13、服务端主动同步手牌

    // PX258 麻将
    // PX258: {
    Reconnect: 0x1000, // 1、玩家断线重连
    Prompt: 0x1001, // 2、操作提示
    Action: 0x1002, // 3、玩家根据提示列表选择动作
    ReadyHand: 0x1003, // 4、听牌提示
    SettleForRound: 0x1005, // 5、小结算
    SettleForRoom: 0x1006
};

/**
 ***********************************************************************************************************************
 *                                      RequestMessage 构造方法
 ***********************************************************************************************************************
 **/

window.WebSocketManager.requestMessage = {
    /**
     *******************************************************************************************************************
     *                                      公共请求 message
     *******************************************************************************************************************
     **/

    /**
     * 1. 自己主动进入房间
     * @param parameters
     * @returns {proto.game.EnterRoomRequest}
     */
    getEnterRoomRequestMessage: function getEnterRoomRequestMessage(parameters) {
        var message = new proto.game.EnterRoomRequest();
        var userInfo = Tools.getLocalData(Global.LSK.userInfo);

        message.setRoomId(parameters.roomId);
        message.setPlayerUuid(userInfo.playerUuid);
        message.setInfo(JSON.stringify({
            gold: userInfo.gold,
            nickname: userInfo.nickname,
            headimgurl: userInfo.headimgurl,
            sex: userInfo.sex,
            ip: userInfo.ip,
            location: userInfo.location
        }));

        return message;
    },


    /**
     * 3. 自己主动退出房间
     * @returns {proto.game.ExitRoomRequest}
     */
    getExitRoomRequestMessage: function getExitRoomRequestMessage() {
        return new proto.game.ExitRoomRequest();
    },


    /**
     * 4、解散房间
     * @returns {proto.game.DismissRoomRequest}
     */
    getDismissRoomRequestMessage: function getDismissRoomRequestMessage() {
        return new proto.game.DismissRoomRequest();
    },


    /**
     * 6、玩家投票
     * @param parameters
     * @returns {proto.game.PlayerVoteRequest}
     */
    getPlayerVoteRequestMessage: function getPlayerVoteRequestMessage(parameters) {
        var message = new proto.game.PlayerVoteRequest();
        message.setFlag(parameters.flag);

        return message;
    },


    /**
     * 8、超级广播命令
     * @param parameters
     * @returns {proto.game.SpeakerRequest}
     */
    getSpeakerRequestMessage: function getSpeakerRequestMessage(parameters) {
        var message = new proto.game.SpeakerRequest();
        message.setContent(parameters.content);

        return message;
    },


    /**
     * 9、准备
     * @returns {proto.game.ReadyRequest}
     */
    getReadyRequestMessage: function getReadyRequestMessage() {
        return new proto.game.ReadyRequest();
    },


    /**
     * 12、出牌
     * @param parameters
     * @returns {proto.game.DiscardRequest}
     */
    getDiscardRequestMessage: function getDiscardRequestMessage(parameters) {
        var message = new proto.game.DiscardRequest();
        var cardMsg = new proto.game.Card();
        cardMsg.setCard(parameters.card);
        message.setCard(cardMsg);

        return message;
    },

    /**
     * wsHbt
     * @returns {proto.game.HeartbeatRequest}
     */
    getHeartBeatRequestMessage: function getDismissRoomRequestMessage() {
        return new proto.game.HeartbeatRequest();
    },


    /**
     *******************************************************************************************************************
     *                                      px258 message
     *******************************************************************************************************************
     **/

    /**
     * 3、玩家根据提示列表选择动作
     * @param parameters
     * @returns {proto.game.ActionRequest}
     */
    getActionRequestMessage: function getActionRequestMessage(parameters) {
        var message = new proto.game.ActionRequest();
        message.setActionId(parameters.actionId);

        return message;
    }
};

/**
 ***********************************************************************************************************************
 *                                      发送接收 socket 请求
 ***********************************************************************************************************************
 **/

/**
 * socket 数据封包解包
 */
window.WebSocketManager.ArrayBuffer = {
    _packageStack: null,

    reader: function reader(buffer) {
        if (this._packageStack) {
            buffer = this.mergeArrayBuffer([this._packageStack, buffer]);
            this._packageStack = null;
        }

        var dataView = new DataView(buffer);
        var size = dataView.getInt32(0);
        if (buffer.byteLength >= size) {
            var cmd = dataView.getInt32(4);
            var data = buffer.slice(8, size);

            var other = buffer.slice(size);
            if (other.byteLength !== 0) {
                this.reader(buffer);
            }

            return { cmd: cmd, data: data };
        } else if (buffer.byteLength < size) {
            this._packageStack = buffer;
            return false;
        }

        cc.log(['没有数据包: ']);
        return false;
    },
    writer: function writer(cmd, message) {
        //         size + cmd + message
        var size = 4 + 4 + message.byteLength;
        var arrayBuffer = new ArrayBuffer(8);
        var dataView = new DataView(arrayBuffer);
        dataView.setUint32(0, size);
        dataView.setUint32(4, cmd);

        return this.mergeArrayBuffer([arrayBuffer, message]);
    },


    /**
     * 合并buffer
     * @param bufferList
     * @returns {*}
     */
    mergeArrayBuffer: function mergeArrayBuffer(bufferList) {
        var size = 0;
        for (var i = 0; i < bufferList.length; i += 1) {
            size += bufferList[i].byteLength;
        }

        if (size === 0) {
            cc.log('mergeArrayBuffer byte number is 0');
            return false;
        }

        var index = 0;
        var uint8Array = new Uint8Array(size);
        for (var _i = 0; _i < bufferList.length; _i += 1) {
            uint8Array.set(new Uint8Array(bufferList[_i]), index);
            index = bufferList[_i].byteLength;
        }

        return uint8Array.buffer;
    }
};

/**
 ***********************************************************************************************************************
 *                                      WebSocket 管理器
 ***********************************************************************************************************************
 **/

window.WebSocketManager.ws = {};
window.WebSocketManager.isClose = false;

/**
 * 链接webSocket
 * @param url
 */
window.WebSocketManager.openSocketLink = function (url) {
    window.WebSocketManager.isClose = false;
    WebSocketManager.ws = new WebSocket(url);

    WebSocketManager.ws.onopen = function(evt) {
        this.binaryType = 'arraybuffer';
        WebSocketManager.onopen(evt);
    };

    WebSocketManager.ws.onclose = function(evt) {
        cc.log(['window.WebSocketManager.openSocketLink.close', evt, WebSocketManager.ws]);
        if (!window.WebSocketManager.isClose) {
            WebSocketManager.onclose(evt);
            setTimeout(function() {
                WebSocketManager.openSocketLink(url);
            }, 3000);
        }
    };

    WebSocketManager.ws.onmessage = WebSocketManager.onmessage;
};

window.WebSocketManager.onmessage = function () {};
window.WebSocketManager.onopen = function () {};
window.WebSocketManager.onclose = function () {};

window.WebSocketManager.close = function () {
    window.WebSocketManager.isClose = true;
    WebSocketManager.ws.close();
};

/**
 * 查询webSocket 状态
 * @param webSocket WebSocket
 * @returns {boolean}
 */
window.WebSocketManager.getSocketState = function (webSocket) {
    return webSocket.readyState === WebSocket.CONNECTING || webSocket.readyState === WebSocket.OPEN;
};

/**
 * 发送 socket 消息
 *
 * @param webSocket WebSocket
 * @param name
 */
window.WebSocketManager.sendSocketMessage = function (webSocket, name) {
    var parameters = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var message = WebSocketManager.requestMessage['get' + name + 'RequestMessage'](parameters);
    var data = WebSocketManager.ArrayBuffer.writer(WebSocketManager.Command[name], message.serializeBinary());
    cc.log(['WebSocketManager.sendMessage.' + name, parameters]);
    webSocket.send(data);
};