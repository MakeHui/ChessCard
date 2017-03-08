
window.WebSocketManager = {};

/**
 ***********************************************************************************************************************
 *                                      socket 指令
 ***********************************************************************************************************************
 **/

window.WebSocketManager.Command = {
    // 公共命令
    EnterRoom       : 0x0001,       // 1、进入房间
    EnterRoomOther  : 0x0002,       // 2、其他玩家进入房间
    ExitRoom        : 0x0003,       // 3、离开房间
    DismissRoom     : 0x0004,       // 4、解散房间
    SponsorVote     : 0x0005,       // 5、发起投票解散
    PlayerVot       : 0x0007,       // 6、玩家投票
    OnlineStatus    : 0x0008,       // 7、玩家上线离线广播
    Speaker         : 0x0009,       // 8、超级广播命令
    Ready           : 0x000A,       // 9、准备
    Deal            : 0x000B,       // 10、起手发牌
    Draw            : 0x000C,       // 11、抓牌
    Discard         : 0x000D,       // 12、出牌
    SynchroniseCards: 0x000E,       // 13、服务端主动同步手牌

    // PX258 麻将
    PX258: {
        Reconnect       : 0x1000,       // 1、玩家断线重连
        Prompt          : 0x1001,       // 2、操作提示
        Action          : 0x1002,       // 3、玩家根据提示列表选择动作
        ReadyHand       : 0x1003,       // 4、听牌提示
        SettleForRound  : 0x1004,       // 5、小结算
        SettleForRoom   : 0x1005,       // 6、大结算
    },
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
    getEnterRoomRequestMessage(parameters) {
        const message = new proto.game.EnterRoomRequest();
        const userInfo = Tools.getLocalData(Global.localStorageKey.userInfo);

        message.setRoomId(parameters.roomId);
        message.setPlayerUuid(userInfo.playerUuid);
        message.setInfo(JSON.stringify({
            gender: userInfo.gender,
            gold: userInfo.gold,
            score: 0,
            nickname: userInfo.nickname,
            headimgurl: userInfo.headimgurl,
            ip: '0.0.0.0',
            location: '该用户不想透露位置',
        }));

        return message;
    },

    /**
     * 3. 自己主动退出房间
     * @param parameters
     * @returns {proto.game.ExitRoomRequest}
     */
    getExitRoomRequestMessage() {
        return new proto.game.ExitRoomRequest();
    },

    /**
     * 4、解散房间
     * @param parameters
     * @returns {proto.game.DismissRoomRequest}
     */
    getDismissRoomRequestMessage() {
        return new proto.game.DismissRoomRequest();
    },

    /**
     * 6、玩家投票
     * @param parameters
     * @returns {proto.game.PlayerVoteRequest}
     */
    getPlayerVoteRequestMessage(parameters) {
        const message = new proto.game.PlayerVoteRequest();
        message.setFlag(parameters.flag);

        return message;
    },

    /**
     * 8、超级广播命令
     * @param parameters
     * @returns {proto.game.SpeakerRequest}
     */
    getSpeakerRequestMessage(parameters) {
        const message = new proto.game.SpeakerRequest();
        message.setContent(parameters.content);

        return message;
    },

    /**
     * 9、准备
     * @param parameters
     * @returns {proto.game.ReadyRequest}
     */
    getReadyRequestMessage() {
        return new proto.game.ReadyRequest();
    },

    /**
     * 12、出牌
     * @param parameters
     * @returns {proto.game.DiscardRequest}
     */
    getDiscardRequestMessage(parameters) {
        const message = new proto.game.DiscardRequest();
        const cardMsg = new proto.game.Card();
        cardMsg.setCard(parameters.card);
        message.setCard(cardMsg);

        return message;
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
    getActionRequestMessage(parameters) {
        const message = new proto.game.ActionRequest();
        message.setActionId(parameters.actionId);

        return message;
    },
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

    reader(buffer) {
        if (this._packageStack) {
            buffer = this.mergeArrayBuffer([this._packageStack, buffer]);
            this._packageStack = null;
        }

        const dataView = new DataView(buffer);
        const size = dataView.getInt32(0);
        if (buffer.byteLength >= size) {
            const cmd = dataView.getInt32(4);
            const data = buffer.slice(8, size);
            cc.log(data);

            const other = buffer.slice(size);
            if (other.byteLength !== 0) {
                this.reader(buffer);
            }

            return { cmd, data };
        }
        else if (buffer.byteLength < size) {
            this._packageStack = buffer;
            return false;
        }

        cc.log(['没有数据包: ']);
        return false;
    },

    writer(cmd, message) {
        //         size + cmd + message
        const size = 4 + 4 + message.byteLength;
        const arrayBuffer = new ArrayBuffer(8);
        const dataView = new DataView(arrayBuffer);
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
    mergeArrayBuffer(bufferList) {
        let size = 0;
        for (let i = 0; i < bufferList.length; i += 1) {
            size += bufferList[i].byteLength;
        }

        if (size === 0) {
            cc.log('mergeArrayBuffer byte number is 0');
            return false;
        }

        let index = 0;
        const uint8Array = new Uint8Array(size);
        for (let i = 0; i < bufferList.length; i += 1) {
            uint8Array.set(new Uint8Array(bufferList[i]), index);
            index = bufferList[i].byteLength;
        }

        return uint8Array.buffer;
    },
};

/**
 * 发送 socket 消息
 *
 * @param name
 * @param parameters
 */
window.WebSocketManager.sendMessage = (name, parameters) => {
    const message = WebSocketManager.requestMessage[`get${name}RequestMessage`](parameters);
    const data = WebSocketManager.ArrayBuffer.writer(WebSocketManager.Command[name], message.serializeBinary());
    cc.log(data);
    WebSocketManager.ws.sendMessage(data);
};

/**
 ***********************************************************************************************************************
 *                                      WebSocket 管理器
 ***********************************************************************************************************************
 **/

window.WebSocketManager.ws = {
    _socket: null,
    _onopenListener: {},
    _onmessageListener: {},
    _onerrorListener: {},
    _oncloseListener: {},

    _openSocket(url) {
        this._socket = new WebSocket(url);
        const self = this;

        this._socket.onopen = (evt) => {
            for (const listener in self._onopenListener) {
                self._onopenListener[listener](evt);
            }
            cc.log(['onopen: ', evt]);
        };

        this._socket.onmessage = (evt) => {
            const data = WebSocketManager.ArrayBuffer.reader(evt.data);
            if (data !== false) {
                const commandName = Tools.findKeyForValue(WebSocketManager.Command, data.cmd);
                const result = proto.game[`${commandName}Response`].deserializeBinary(data.data);

                for (const linstener in self._onmessageListener) {
                    self._onmessageListener[linstener](evt, commandName, result);
                }
                cc.log([`socket onmessage ${commandName} code: `, result.getCode()]);
            }
            cc.log(['onmessage: ', evt]);
        };

        this._socket.onerror = (evt) => {
            for (const linstener in self._onerrorListener) {
                self._onerrorListener[linstener](evt);
            }
            cc.log(['onerror: ', evt]);
        };

        this._socket.onclose = (evt) => {
            for (const linstener in self._oncloseListener) {
                self._oncloseListener[linstener](evt);
            }
            cc.log(['onclose: ', evt]);
        };
    },

    openSocket(url) {
        if (this._socket) {
            if (this._socket.readyState !== WebSocket.CONNECTING
                || this._socket.readyState !== WebSocket.OPEN) {
                this.closeSocket();
                this._openSocket(url);
            }
        }
        else {
            this._openSocket(url);
        }
        this._socket.binaryType = 'arraybuffer';
    },

    sendMessage(data) {
        this._socket.send(data);
    },

    closeSocket() {
        this._socket.close();
    },

    addOnopenListener(name, listner) {
        this._onopenListener[name] = listner;
    },

    addOnmessageListener(name, listner) {
        this._onmessageListener[name] = listner;
    },

    addOnerrorListener(name, listner) {
        this._onerrorListener[name] = listner;
    },

    addOncloseListener(name, listner) {
        this._oncloseListener[name] = listner;
    },

    removeOnopenListener(name) {
        delete this._onopenListener[name];
    },

    removeOnmessageListener(name) {
        delete this._onmessageListener[name];
    },

    removeOnerrorListener(name) {
        delete this._onerrorListener[name];
    },

    removeOncloseListener(name) {
        delete this._oncloseListener[name];
    },
};

