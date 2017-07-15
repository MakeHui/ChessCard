cc.Class({
    extends: cc.Component,

    properties: {
        DDZDismiss: cc.Prefab,
        settingPrefab: cc.Prefab,
        userInfoPrefab: cc.Prefab,

        roomInfo: [cc.Label],
        waitPanel: cc.Node,

        actionSprite: [cc.Node],
        clockNode: [cc.Node],

        playerInfoList: [cc.Node],
        inviteButtonList: [cc.Node],

        dipaiNode: cc.Node,

        handCardDistrict: cc.Node,
        dirtyCardDistrict: [cc.Node],

        actionNode: cc.Node,
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

    /**
     * 滑动选择卡牌
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-07-12T16:04:33+0800
     *
     * @return   {[type]}                 [description]
     */
    selectCatds() {
        this.cardList.on(cc.Node.EventType.TOUCH_MOVE, function(event) {
            for (var i = 0; i < this.cardList.children.length; i++) {
                var pos = this.cardList.children[i].convertToNodeSpace(event.getLocation());
                cc.log([event.getLocation(), pos]);
                cc.log('cc.Node.EventType.TOUCH_MOVE');
                // 是否被选中
                if (pos.x > 0 && pos.x <= 20) {
                    this.cardList.children[i].opacity = 100;
                }
            }
        }, this);

        this._touchEnd = function() {
            this._touchStart = false;
            for (var i = 0; i < this.cardList.children.length; i++) {
                // 设置牌是否为选中状态
                cc.log(this.cardList.children[i].opacity);
                if (this.cardList.children[i].opacity === 100) {
                    if (this.cardList.children[i].getPositionY() == 0) {
                        this.cardList.children[i].setPositionY(24);
                    } else {
                        this.cardList.children[i].setPositionY(0);
                    }
                }
                this.cardList.children[i].opacity = 255;
            }
            cc.log('cc.Node.EventType.TOUCH_END');
        };

        this.cardList.on(cc.Node.EventType.TOUCH_END, this._touchEnd, this);
        this.cardList.on(cc.Node.EventType.TOUCH_CANCEL, this._touchEnd, this);
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
            var obj = data.playerList[i];
            var playerIndex = this._getPlayerIndexBySeat(obj.seat);
            obj.info = JSON.parse(obj.info);

            if (playerIndex !== 0) {
                this.inviteButtonList[playerIndex].active = false;
            }

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

        if (data.playerList.length !== 3) {
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

    onReconnectDDZMessage(data) {
        data.kwargs = JSON.parse(data.kwargs);
        this._Cache.gameUuid = data.kwargs.game_uuid;
        this._Cache.roomId = data.roomId;
        this._Cache.ownerUuid = data.ownerUuid;
        this._Cache.currentRound = data.currentRound;
        this._Cache.config = data.kwargs;

        this._initScene();

        // 初始化房间信息
        this._setRoomInfo(data);

        // 设置当前玩家的座位号
        this._setThisPlayerSeat(data.playerList);

        // 初始化玩家信息
        for (var i = 0; i < data.playerList.length; i += 1) {
            var obj = data.playerList[i];
            obj.info = JSON.parse(obj.info);
            var playerIndex = this._getPlayerIndexBySeat(obj.seat);
            this._setPlayerInfoList(playerIndex, obj.info, obj.totalScore);

            // 设置房主
            if (obj.playerUuid === data.ownerUuid) {
                this.playerInfoList[playerIndex].getChildByName('img_hostmark').active = true;
            }

            // 是否在线
            if (this._userInfo.playerUuid !== obj.playerUuid) {
                this.playerInfoList[playerIndex].getChildByName('img_offline').active = obj.isOnline === 0;
            }

            // 初始化手牌
            for (var j = obj.cardsInHandList.length - 1; j >= 0; j -= 1) {
                this._appendCardToHandCardDistrict(playerIndex, obj.cardsInHandList[j].card);
            }
            if (playerIndex === 0 && this.handCardDistrict.children.length > 1) {
                window.Global.Tools.cardsSort(this.handCardDistrict.children);
            }

            // 初始化打出去的牌
            this._addCardToDiscardDistrict(playerIndex, obj.cardsDiscardList);
        }

        this._Cache.playerList = data.playerList;

        // 初始化底牌
        if (data.threeCardsList.length > 0) {
            this.dipaiNode.children[1].active = false;
            for (var i = 0; i < this.dipaiNode.children[0].children.length; i++) {
                // todo: 需要设置牌
            }
        }
    },

    onOnlineStatusMessage(data) {
        const playerIndex = this._getPlayerIndexBySeat(this._getSeatForPlayerUuid(data.playerUuid));
        this.playerInfoList[playerIndex].getChildByName('img_offline').active = !data.status;
        if (this._Cache.playerList.length === 3) {
            if (data.status) {
                this._hideWaitPanel();
            } else {
                this._showWaitPanel(1);
            }
        }
    },


    onExitRoomMessage(data) {
        if (data.playerUuid == this._userInfo.playerUuid) {
            window.Global.NetworkManager.close();
            cc.director.loadScene('Lobby');
            return;
        }

        var playerIndex = this._getPlayerIndexBySeat(this._getSeatForPlayerUuid(data.playerUuid));
        this._showInviteButton(playerIndex);
        this._hidePlayerInfoList([playerIndex]);

        // 从玩家列表中删除该用户
        for (let i = 0; i < this._Cache.playerList.length; i += 1) {
            if (this._Cache.playerList[i].playerUuid === data.playerUuid) {
                cc.js.array.removeAt(this._Cache.playerList, i);
                break;
            }
        }
    },

    /**
     *******************************************************************************************************************
     *                                       onClick
     *******************************************************************************************************************
     */

    /**
     * 声音选项
     */
    openSoundPanelOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Animation.openDialog(cc.instantiate(this.soundPrefab), this.node, () => {
            cc.log('load success');
        });
    },

    /**
     * 解散房间
     */
    dismissOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.DismissRoom);
    },

    voteOnClick(evt, data) {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.PlayerVote, { flag: data == 1 });

        this.voteDismissButton[0].active = false;
        this.voteDismissButton[1].active = false;

        this.unschedule(this._expireSeconds);
    },

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
     * @param playerIndex
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
     * @param {Object} data
     * @private
     */
    _setRoomInfo(data) {
        // 游戏玩法
        var playTypes = window.PX258.Config.playTypes[data.kwargs.game_uuid];
        var options = `0b${data.kwargs.options.toString(2)}`;

        if (data.kwargs.game_uuid == window.PX258.Config.gameUuid[2]) {
            for (var key in playTypes.playType) {
                if ((options & key) !== 0) {
                    this.roomInfo[3].string = playTypes.playType[key] + '玩法';
                }
            }

            for (var key in playTypes.options) {
                if ((options & key) !== 0) {
                    this.roomInfo[3].string += '\n炸弹上限: ' + playTypes.options[key];
                }
            }
        }

        this.roomInfo[0].string = `房间号: ${this._Cache.roomId}`;
        this.roomInfo[1].string = `局数: ${data.currentRound}/${data.kwargs.max_rounds}`;
        this.roomInfo[2].string = data.baseScore * data.multiple;
    },

    _showWaitPanel(messageId) {
        if (messageId === 1) {
            this.waitPanel.getComponent(cc.Label).string = '玩家可能离线或者离开，等待操作中...';
        } else if (messageId === 2) {
            this.waitPanel.getComponent(cc.Label).string = '断线重连中，请稍等...';
        }
        this.waitPanel.active = true;
    },

    _hideWaitPanel() {
        this.waitPanel.active = false;
    },

    _initScene: function() {
        this.dipaiNode.children[1].active = true;
        this.dipaiNode.children[0].removeAllChildren();

        this.waitPanel.active = false;

        for (var i = 0; i < this.actionNode.children.length; i++) {
            this.actionNode.children[i].active = false;
        }

        for (var i = 0; i < this.playerInfoList.length; i++) {
            this.playerInfoList[i].active = false;
            this.inviteButtonList[i].active = true;
            this.clockNode[i].active = false;
            this.actionSprite[i].active = false;
            this.dirtyCardDistrict[i].removeAllChildren();
        }
        this.handCardDistrict.removeAllChildren();
    },

    /**
     * 获取用户座位号
     */
    _getSeatForPlayerUuid(playerUuid) {
        for (let i = 0; i < this._Cache.playerList.length; i += 1) {
            if (this._Cache.playerList[i].playerUuid === playerUuid) {
                return this._Cache.playerList[i].seat;
            }
        }
        return -1;
    },

    _getPlayerIndexBySeat(playerSeat) {
        var displaySeat = playerSeat - this._Cache.thisPlayerSeat;
        return (displaySeat < 0 ? displaySeat + 3 : displaySeat);
    },

    /**
     * 设置当前玩家座位号
     */
    _setThisPlayerSeat(playerList) {
        for (let i = 0; i < playerList.length; i += 1) {
            var obj = playerList[i];
            if (obj.playerUuid === this._userInfo.playerUuid) {
                this._Cache.thisPlayerSeat = obj.seat;
                break;
            }
        }
    },

    _setPlayerInfoList(playerIndex, data, totalScore) {
        if (this._Cache.playerList.length === 3 && playerIndex === 0) {
            this.inviteButtonList[playerIndex].active = false;
        }
        this.playerInfoList[playerIndex].active = true;

        this.playerInfoList[playerIndex].getChildByName('text_nick').getComponent(cc.Label).string = data.nickname;
        this.playerInfoList[playerIndex].getChildByName('text_result').getComponent(cc.Label).string = totalScore || 0;
        window.Global.Tools.setWebImage(this.playerInfoList[playerIndex].getChildByName('mask').getChildByName('img_handNode').getComponent(cc.Sprite), data.headimgurl);
    },

});