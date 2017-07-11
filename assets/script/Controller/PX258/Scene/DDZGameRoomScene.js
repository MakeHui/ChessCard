cc.Class({
    extends: cc.Component,

    properties: {
        DDZDismiss: cc.Prefab,
        settingPrefab: cc.Prefab,
        userInfoPrefab: cc.Prefab,

        roomInfo: [cc.Label],
        waitPanel: cc.Label,

        actionSprite: [cc.Node],
        clockNode: [cc.Node],

        playerInfoList: [cc.Node],
        inviteButtonList: [cc.Node],

        dipaiNode: [cc.Node],
        dipaiHideNode: cc.Node,

        handCardDistrict: cc.Node,
        dirtyCardDistrict: [cc.Node],

        jiaofenModeButton: [cc.Node],
        jiaodizhuModeButton: [cc.Node],
        chupaiButton: [cc.Node],

        voiceButton: cc.Node,
    },
    onLoad() {
        this._Cache = {};
        this._Cache.roomId = ''; // 房间号
        this._Cache.ownerUuid = ''; // 房主uuid
        this._Cache.playerList = []; // 玩家信息列表
        this._Cache.thisPlayerSeat = 0; // 当前玩家实际座位号
        this._Cache.thisDealerSeat = 0; // 当前庄家相对座位号
        this._Cache.allowOutCard = false; // 是否允许出牌
        this._Cache.settleForRoomData = null; // 大结算数据
        this._Cache.currentRound = 0; // 局数
        this._Cache.config = {}; // 房间信息

        cc.log(window.Global.Config.tempCache);
        if (window.Global.Config.tempCache) {
            const self = this;
            this._Cache.roomId = window.Global.Config.tempCache.roomId;

            this.wsUrl = `ws://${window.Global.Config.tempCache.serverIp}:${window.Global.Config.tempCache.serverPort}/ws`;
            cc.log(this.wsUrl);
            window.Global.NetworkManager.onopen = () => {
                self._hideWaitPanel();
                window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.EnterRoom, { roomId: self._Cache.roomId });
                window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.Ready);

                this.unschedule(this.wsHbtSchedule);
                this.schedule(this.wsHbtSchedule, window.Global.Config.debug ? window.Global.Config.development.wsHbtTime : window.Global.Config.production.wsHbtTime);
            };
            window.Global.NetworkManager.onclose = () => {
                self.unschedule(self.wsHbtSchedule);
                self._showWaitPanel(2);
            };
            window.Global.NetworkManager.onmessage = (commandName, result) => {
                self[`on${commandName}Message`](result);
            };
            window.Global.NetworkManager.openSocketLink(this.wsUrl);

            this.roomInfo[0].string = `房间号: ${this._Cache.roomId}`;
        }

        this._userInfo = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);
        this.playerInfoList[0].getChildByName('text_nick').getComponent(cc.Label).string = this._userInfo.nickname;
        window.Global.Tools.setWebImage(this.playerInfoList[0].getChildByName('img_handNode').getComponent(cc.Sprite), this._userInfo.headimgurl);

        // 发送语音
        this.voiceButton.on(cc.Node.EventType.TOUCH_START, () => {
            window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
            if (this.voiceProgressBar.progress > 0) {
                return;
            }
            this.voiceProgressBar.progress = 1.0;
            window.Global.NativeExtensionManager.execute('startRecord');
            cc.log('cc.Node.EventType.TOUCH_START');
        }, this);

        this.voiceButton.on(cc.Node.EventType.TOUCH_END, this.onVoiceEndCallback, this);
        this.voiceButton.on(cc.Node.EventType.TOUCH_CANCEL, this.onVoiceEndCallback, this);
    },

    onVoiceEndCallback: function() {
        if (this.voiceProgressBar.progress != 1) {
            return;
        }

        this.schedule(function() {
            this.voiceProgressBar.progress -= 0.0025;
        }, 0.005, 400);

        var voiceFilePath = window.Global.NativeExtensionManager.execute('stopRecord');
        var webPath = window.Global.Config.aliyunOss.objectPath + window.Global.Tools.formatDatetime('yyyy/MM/dd/') + md5(+new Date() + Math.random().toString()) + '.amr';
        var parameters = [window.Global.Config.aliyunOss.bucketName, webPath, voiceFilePath];
        window.Global.NativeExtensionManager.execute('ossUpload', parameters, function(result) {
            if (result.result == 0) {
                const content = JSON.stringify({ type: 3, data: window.Global.Config.aliyunOss.domain + webPath });
                window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.Speaker, { content });
            }
        });
        cc.log('GameRoomScene.onVoiceEndCallback: ' + this.voiceFilePath);
    },

    wsHbtSchedule() {
        if (window.window.Global.NetworkManager.isClose) {
            this.unschedule(this.wsHbtSchedule);
            return;
        }
        window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.HeartBeat);
    },

    /**
     *******************************************************************************************************************
     *                                       public socket on message
     *******************************************************************************************************************
     **/

    onEnterRoomMessage(data) {
        if (data.code !== 1) {
            // cc.director.loadScene('Lobby');
            return;
        }

        data.kwargs = JSON.parse(data.kwargs);
        this._Cache.gameUuid = data.kwargs.game_uuid;
        this._Cache.ownerUuid = data.ownerUuid;
        this._Cache.currentRound = 1;
        this._setRoomInfo(data.kwargs, 1, data.restCards);

        this._setThisPlayerSeat(data.playerList);

        for (let i = 0; i < data.playerList.length; i += 1) {
            const obj = data.playerList[i];
            const playerIndex = this._getPlayerIndexBySeat(obj.seat);
            obj.info = JSON.parse(obj.info);

            this.inviteButtonList[playerIndex].active = false;
            this.playerInfoList[playerIndex].active = true;
            this.playerInfoList[playerIndex].getChildByName('text_nick').getComponent(cc.Label).string = obj.info.nickname;
            this.playerInfoList[playerIndex].getChildByName('text_result').getComponent(cc.Label).string = obj.totalScore || 0;
            window.Global.Tools.setWebImage(this.playerInfoList[playerIndex].getChildByName('mask').getChildByName('img_handNode').getComponent(cc.Sprite), obj.info.headimgurl);

            // 设置房主
            if (obj.playerUuid === data.ownerUuid) {
                this.playerInfoList[playerIndex].getChildByName('img_hostmark').active = true;
            }

            // 是否在线
            if (this._userInfo.playerUuid !== obj.playerUuid) {
                this.playerInfoList[playerIndex].getChildByName('mask').getChildByName('img_offline').active = obj.isOnline === 0;
            }

            if (playerIndex !== 0) {
                this.inviteButtonList[playerIndex].active = false;
                this.playerInfoList[playerIndex].active = true;
            }
        }

        if (data.playerList.length !== 4) {
            this.inviteButtonList[0].active = true;
        }

        this._Cache.playerList = data.playerList;
        this._Cache.config = data.kwargs;

        this._initLight();
    },

    onEnterRoomOtherMessage(data) {
        if (data.code !== 1) {
            return;
        }

        data.info = JSON.parse(data.info);
        this._Cache.playerList.push(data);

        const playerIndex = this._getPlayerIndexBySeat(data.seat);

        this.inviteButtonList[playerIndex].active = false;
        this.playerInfoList[playerIndex].active = true;

        this.playerInfoList[playerIndex].getChildByName('text_nick').getComponent(cc.Label).string = data.info.nickname;
        this.playerInfoList[playerIndex].getChildByName('text_result').getComponent(cc.Label).string = data.totalScore || 0;
        window.Global.Tools.setWebImage(this.playerInfoList[playerIndex].getChildByName('mask').getChildByName('img_handNode').getComponent(cc.Sprite), data.info.headimgurl);

        // 设置房主
        if (data.playerUuid === this._Cache.ownerUuid) {
            this.playerInfoList[playerIndex].getChildByName('img_hostmark').active = true;
        }

        // 如果房间人数满了, 关闭邀请按钮
        if (this._Cache.playerList.length === 4) {
            this.inviteButtonList[0].active = false;
        }

        // 检查是否在同一IP
        this.scheduleOnce(function() {
            this._checkIp();
        }, 2);
    },

    /**
     *******************************************************************************************************************
     *                                       onClick
     *******************************************************************************************************************
     */

    /**
     * 叫分模式按钮回调
     */

    jiaofenOnClick(event, data) {
        if (data == 0) { // 叫1分

        } else if (data == 1) { // 叫2分

        } else if (data == 2) { // 叫3分

        } else if (data == 3) { // 不叫

        }
    },

    jiaodizhuOnClick(event, data) {
        if (data == 0) { // 叫地主

        } else if (data == 1) { // 不叫

        }
    },

    chupaiOnClick(event, data) {
        if (data == 0) { // 不出

        } else if (data == 1) { // 提示

        } else if (data == 2) { // 出牌

        }
    },

    closeOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        if (this._Cache.playerList.length !== 3) {
            window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.ExitRoom, { roomId: this._Cache.roomId });
        } else {
            window.Global.Dialog.openMessageBox('游戏中无法退出');
        }
    },

    /**
     *******************************************************************************************************************
     *                                       function
     *******************************************************************************************************************
     */

    /**
     * 动作提示, 比如: 要不起
     */
    _hideActionSprite() {
        for (var i = 0; i < this.actionSprite.length; i++) {
            this.actionSprite[i].active = false;
        }
    },

    _showActionSprite(index) {
        this.actionSprite[index].active = true;
    },

    /**
     * 倒计时时钟
     */
    _hideClockNode() {
        for (var i = 0; i < this.clockNode.length; i++) {
            this.clockNode[i].active = false;
        }
    },

    _showClockNode(index) {
        this.clockNode[index].active = true;
        // this.clockNode[index].getComponent(cc.Animation).play();
    },

    /**
     * 玩家信息
     */
    _hidePlayerInfoList() {
        for (let i = 0; i < this.playerInfoList.length; i += 1) {
            this.playerInfoList[i].active = false;
        }
    },

    _showPlayerInfoList(index) {
        this.playerInfoList[index].active = true;
    },

    /**
     * 邀请按钮
     */
    _hideInviteButtonList() {
        for (let i = 0; i < this.inviteButtonList.length; i += 1) {
            this.inviteButtonList[i].active = false;
        }
    },

    _showInviteButtonList(index) {
        this.inviteButtonList[index].active = true;
    },

    /**
     * 处理底牌
     */
    _hideDipaiNode() {
        this.dipaiHideNode.active = true;
    },

    _showDipaiNode(cards) {
        for (let i = 0; i < this.dipaiNode.length; i += 1) {
            this.dipaiNode[i] = cards[i];
        }
        this.dipaiHideNode.active = false;
    },

    /**
     * 叫分模式
     */
    _hideJiaofenModButton() {
        for (let i = 0; i < this.jiaofenModeButton.length; i += 1) {
            this.jiaofenModeButton[i].active = true;
        }
    },

    _showJiaofenModButton() {
        // TODO: 需要完善逻辑
        for (let i = 0; i < this.jiaofenModeButton.length; i += 1) {
            this.jiaofenModeButton[i].active = false;
        }
    },

    /**
     * 叫地主模式
     */
    _activeJiaodizhuModButton(active) {
        for (let i = 0; i < this.jiaodizhuModeButton.length; i += 1) {
            this.jiaodizhuModeButton[i].active = active;
        }
    },

    /**
     * 出牌按钮
     */
    _hideChupaiButton(active) {
        for (let i = 0; i < this.chupaiButton.length; i += 1) {
            this.chupaiButton[i].active = active;
        }
    },

    _showChupaiButton(active) {
        for (let i = 0; i < 3; i += 1) {
            this.chupaiButton[i].active = active;
        }
    },
    // TODO: 出牌按钮显示逻辑相对复杂

    /**
     * 添加牌到手牌区
     *
     * @param playerIndex
     * @param card
     * @private
     */
    _appendCardToHandCardDistrict(playerIndex, card) {
        if (playerIndex === 0) {
            var node = this._addClickEventToCard(this._createCard(card));
            this.handCardDistrict.addChild(node);
            // this._initDragStuffs(node);
        }
    },

    /**
     * 构造每张牌
     */
    _createCard(card) {
        var node = cc.instantiate(this.cardPrefab);
        node._userData = card;

        // TODO: 还没有弄完
        var nodeSprite = window.Global.Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
        nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${card.toString(16)}`);

        return node;
    },

    _addClickEventToCard(node) {
        // TODO: 还没有弄完
        var clickEventHandler = window.Global.Tools.createEventHandler(this.node, 'DDZGameRoomScene', 'selectedHandCardOnClick');
        node.getChildByName('Background').getComponent(cc.Button).clickEvents[0] = clickEventHandler;

        return node;
    },

    /**
     * 添加牌到打出去的区域
     *
     * @param player
     * @param cards
     * @private
     */
    _addCardToDiscardDistrict(playerIndex, cards) {
        for (var i = 0; i < cards.length; i += 1) {
            var node = this._createCard(cards[i]);
            this.dirtyCardDistrict[playerIndex].addChild(node);
        }
    },

    remiveCardFromDiscardDistrict(playerIndex) {
        this.dirtyCardDistrict[playerIndex].removeAllChilden();
    },

    /**
     * 设置房间信息
     *
     * @param {Object} info
     * @param currentRound
     * @param restCards
     * @private
     */
    _setRoomInfo(info, currentRound) {
        // 游戏玩法
        var playTypes = window.PX258.Config.playTypes[info.game_uuid];
        var options = `0x${info.options.toString(16)}`;

        if (info.game_uuid == window.PX258.Config.gameUuid[2]) {
            for (var key in playTypes.playType) {
                if ((options & key) !== 0) {
                    this.roomInfo[4].string = '玩法: ' + playTypes.playType[key];
                }
            }

            for (var key in playTypes.options) {
                if ((options & key) !== 0) {
                    this.roomInfo[4].string += ', ' + playTypes.options[key];
                }
            }

            for (var key in playTypes.zhuaniao) {
                if ((options & key) !== 0) {
                    this.roomInfo[4].string += '\n抓鸟: ' + playTypes.zhuaniao[key];
                }
            }

            // 显示是抓鸟还是抓飞鸟
            if (((options & 0x100000) !== 0) || ((options & 0x1000000) !== 0)) {
                this.zhuaniaoNode.getChildByName('title').children[1].active = true;
            } else {
                this.zhuaniaoNode.getChildByName('title').children[0].active = true;
            }
        }

        this.roomInfo[0].string = `房间号: ${this._Cache.roomId}`;
        this.roomInfo[1].string = `局数: ${currentRound}/${info.max_rounds}`;
    },

    _showWaitPanel(messageId) {
        if (messageId === 1) {
            this.waitPanel.string = '玩家可能离线或者离开，等待操作中...';
        } else if (messageId === 2) {
            this.waitPanel.string = '断线重连中，请稍等...';
        }
        this.waitPanel.active = true;
    },

    _hideWaitPanel() {
        this.waitPanel.active = false;
    },

});