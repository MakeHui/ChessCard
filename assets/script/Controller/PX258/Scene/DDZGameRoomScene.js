var TouchMoveEnum = cc.Enum({
    None: -1,
    Begin: -1,
    Move: -1,
    End: -1,
});


cc.Class({
    extends: cc.Component,

    properties: {
        settingPrefab: cc.Prefab,
        userInfoPrefab: cc.Prefab,
        smallAccountPrefab: cc.Prefab,
        bigAccountPrefab: cc.Prefab,

        roomInfo: [cc.Label],
        waitPanel: cc.Node,

        actionSprite: [cc.Node],
        clockNode: [cc.Node],

        playerInfoList: [cc.Node],
        inviteButtonList: [cc.Node],

        dipaiNode: cc.Node,

        cardPrefab: [cc.Prefab],
        cardPinList: cc.SpriteAtlas,

        handCardDistrict: cc.Node,
        dirtyCardDistrict: [cc.Node],

        actionNode: cc.Node,
        jiaofenModeButton: [cc.Node],
        jiaodizhuModeButton: [cc.Node],
        chupaiButton: [cc.Node],
        jiaofenSprate: [cc.Node],

        voiceButton: cc.Node,

        // 解散房间
        voteDismiss: cc.Node,
        voteSponsor: cc.Label,
        voteExpireSeconds: cc.Label,
        votePlayers: [cc.Node],
        voteDismissButton: [cc.Node],
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
        this._Cache.robScore = -1;  // 叫分时最高分数

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
            // window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
            if (this.voiceProgressBar.progress > 0) {
                return;
            }
            this.voiceProgressBar.progress = 1.0;
            window.Global.NativeExtensionManager.execute('startRecord');
            cc.log('cc.Node.EventType.TOUCH_START');
        }, this);

        this.voiceButton.on(cc.Node.EventType.TOUCH_END, this.onVoiceEndCallback, this);
        this.voiceButton.on(cc.Node.EventType.TOUCH_CANCEL, this.onVoiceEndCallback, this);

        this._selectCatds();
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

        data.currentRound = 1;
        data.baseScore = 0;
        data.multiple = 0;
        data.kwargs = JSON.parse(data.kwargs);
        this._Cache.gameUuid = data.kwargs.game_uuid;
        this._Cache.ownerUuid = data.ownerUuid;
        this._Cache.currentRound = 1;

        this._initScene();
        this._setRoomInfo(data);
        this._setThisPlayerSeat(data.playerList);

        // 初始化玩家信息
        for (var i = 0; i < data.playerList.length; i += 1) {
            var obj = data.playerList[i];
            obj.info = JSON.parse(obj.info);
            var playerIndex = this._getPlayerIndexBySeat(obj.seat);
            this._setPlayerInfoList(playerIndex, obj.info, obj.totalScore);

            this.inviteButtonList[playerIndex].active = false;
            this.playerInfoList[playerIndex].active = true;

            // 设置房主
            if (obj.playerUuid === data.ownerUuid) {
                this.playerInfoList[playerIndex].getChildByName('img_hostmark').active = true;
            }

            // 是否在线
            if (this._userInfo.playerUuid !== obj.playerUuid) {
                this.playerInfoList[playerIndex].getChildByName('img_offline').active = obj.isOnline === 0;
            }
        }

        this.inviteButtonList[0].active = (data.playerList.length !== 3);

        this._Cache.playerList = data.playerList;
        this._Cache.config = data.kwargs;
    },

    onEnterRoomOtherMessage(data) {
        if (data.code !== 1) {
            return;
        }

        data.info = JSON.parse(data.info);
        this._Cache.playerList.push(data);

        var playerIndex = this._getPlayerIndexBySeat(data.seat);

        this.inviteButtonList[playerIndex].active = false;
        this.playerInfoList[playerIndex].active = true;

        this.playerInfoList[playerIndex].getChildByName('text_nick').getComponent(cc.Label).string = data.info.nickname;
        this.playerInfoList[playerIndex].getChildByName('text_result').getComponent(cc.Label).string = data.totalScore || 0;
        window.Global.Tools.setWebImage(this.playerInfoList[playerIndex].getChildByName('mask').getChildByName('img_handNode').getComponent(cc.Sprite), data.info.headimgurl);

        // 设置房主
        this.playerInfoList[playerIndex].getChildByName('img_hostmark').active = data.playerUuid === this._Cache.ownerUuid;

        // 如果房间人数满了, 关闭邀请按钮
        this.inviteButtonList[0].active = this._Cache.playerList.length !== 3;

        // 检查是否在同一IP
        // this.scheduleOnce(function() {
        //     this._checkIp();
        // }, 2);
    },

    onReconnectDDZMessage(data) {
        data.kwargs = JSON.parse(data.kwargs);
        this._Cache.gameUuid = data.kwargs.game_uuid;
        this._Cache.roomId = data.roomId;
        this._Cache.ownerUuid = data.ownerUuid;
        this._Cache.currentRound = data.currentRound;
        this._Cache.config = data.kwargs;
        this._Cache.playerList = data.playerList;

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

            this.inviteButtonList[playerIndex].active = false;
            this.playerInfoList[playerIndex].active = true;

            // 设置房主
            if (obj.playerUuid === data.ownerUuid) {
                this.playerInfoList[playerIndex].getChildByName('img_hostmark').active = true;
            }

            // 设置地主
            if (data.lairdPlayerUuid) {
                if (obj.playerUuid === data.lairdPlayerUuid) {
                    this.playerInfoList[playerIndex].getChildByName('table_dizhuTag').active = true;
                }
                else {
                    this.playerInfoList[playerIndex].getChildByName('table_nongminTag').active = true;
                }
            }

            // 是否在线
            if (this._userInfo.playerUuid !== obj.playerUuid) {
                this.playerInfoList[playerIndex].getChildByName('img_offline').active = obj.isOnline === 0;
            }

            // 初始化手牌
            if (playerIndex === 0) {
                for (var j = obj.cardsInHandList.length - 1; j >= 0; j -= 1) {
                    this._appendCardToHandCardDistrict(obj.cardsInHandList[j].card);
                }
                if (this.handCardDistrict.children.length > 1) {
                    window.Global.Tools.cardsSort(this.handCardDistrict.children);
                }
            }
            else {
                this._showCardNumber(playerIndex, obj.cardsInHandList.length);
            }

            // 抢地主分数显示
            if (data.roomStatus === window.DDZ.Config.roomStatusCode.RobState) {
                this._showFenshu(playerIndex, obj);
            }
        }

        window.DDZ.Tools.orderCard(this.handCardDistrict.children);

        // 判断是否在抢地主
        if (data.roomStatus === window.DDZ.Config.roomStatusCode.RobState && this._userInfo.playerUuid === data.robPlayerUuid) {
            data.playerList.sort(function (a, b) {
                return b.robScore - a.robScore;
            });
            this._Cache.robScore = data.playerList[0].robScore;
            this._showModButton(this._Cache.robScore);
        }

        // 初始化底牌
        this.dipaiNode.children[1].active = window.DDZ.Config.roomStatusCode.RobState === data.roomStatus;
        if (data.threeCardsList.length > 0) {
            for (var i = 0; i < data.threeCardsList.length; i++) {
                this.dipaiNode.children[0].addChild(this._createCard(data.threeCardsList[i].card));
            }
        }

        // 初始化打出去的牌
        if (data.prevDiscardPlayerUuid) {
            var prevDiscardPlayerIndex = this._getPlayerIndexBySeat(this._getSeatForPlayerUuid(data.prevDiscardPlayerUuid));
            this._addCardToDiscardDistrict(prevDiscardPlayerIndex, data.prevDiscardCardsList);

            // 判断最后出牌玩家是谁, 如果是自己那么就表示你的上家pass
            // if (prevDiscardPlayerIndex === 2) {
            //     this._showActionSprite(0, window.DDZ.Config.cardType.PASS);
            //     this._showActionSprite(1, window.DDZ.Config.cardType.PASS);
            // }
            // else if (prevDiscardPlayerIndex === 1) {
            //     this._showActionSprite(2, window.DDZ.Config.cardType.PASS);
            //     this._showActionSprite(0, window.DDZ.Config.cardType.PASS);
            // }
            // else if (prevDiscardPlayerIndex === 0) {
            //     this._showActionSprite(1, window.DDZ.Config.cardType.PASS);
            //     this._showActionSprite(2, window.DDZ.Config.cardType.PASS);
            // }
            //
            // var discardPlayerIndex = this._getPlayerIndexBySeat(this._getSeatForPlayerUuid(data.discardPlayerUuid));
            // this._hideActionSprite(discardPlayerIndex);
        }

        // 判断当前出牌玩家
        if (data.discardPlayerUuid === this._userInfo.playerUuid) {
            this.dirtyCardDistrict[0].removeAllChildren();
            this._activeChupaiButton(true);
            this._hideActionSprite(0);
        }

        this.inviteButtonList[0].active = (this._Cache.playerList.length !== 3);
    },

    onDiscardDDZMessage(data) {
        if (data.cardType === window.DDZ.Config.cardType.ERRO) {
            cc.log('非法牌形');
            return;
        }

        var playerIndex = this._getPlayerIndexBySeat(this._getSeatForPlayerUuid(data.playerUuid));
        this._addCardToDiscardDistrict(playerIndex, data.cardList);

        // todo: 出牌音效
        // // window.Global.SoundEffect.playEffect(window.DDZ.Config.audioUrl.common[this._userInfo.sex === 1 ? 'man' : 'woman'][data.card.card]);

        if (this._userInfo.playerUuid === data.playerUuid) {
            this._activeChupaiButton(false);
            this._deleteHandCardByCode(data.cardList);
        }

        // 出牌玩家
        if (data.nextDiscardPlayerUuid === this._userInfo.playerUuid) {
            this._activeChupaiButton(true);
            this.dirtyCardDistrict[0].removeAllChildren();
        }
    },

    _deleteHandCardByCode(values) {
        var cardValues = [];
        if (values[0]) {
            for (var i = 0; i < values.length; i += 1) {
                cardValues.push(values[i].card);
            }
        }
        else {
            cardValues = values;
        }

        if (cardValues.length === 0) {
            return;
        }

        for (var i = 0; i < this.handCardDistrict.children.length; i += 1) {
            var card = this.handCardDistrict.children[i];
            var index = cardValues.indexOf(card._userData);
            if (index !== -1) {
                card.destroy();
                cardValues.splice(index, 1);
            }
            if (cardValues.length === 0) {
                break;
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

    onReadyMessage(data) {
        var playerIndex = this._getPlayerIndexBySeat(this._getSeatForPlayerUuid(data.playerUuid));
        this.playerInfoList[playerIndex].getChildByName('img_offline').active = false;
    },

    onSponsorVoteMessage(data) {
        this.voteDismissButton[0].active = true;
        this.voteDismissButton[1].active = true;

        this._votePlayers = [];
        for (let i = 0; i < this._Cache.playerList.length; i += 1) {
            const obj = this._Cache.playerList[i];
            if (obj.playerUuid === data.sponsor) {
                this.voteSponsor.string = obj.info.nickname;
            } else {
                this._votePlayers.push(obj);
            }
        }

        for (let i = 0; i < this._votePlayers.length; i += 1) {
            const obj = this._votePlayers[i];
            this.votePlayers[i].getChildByName('userTxt').getComponent(cc.Label).string = obj.info.nickname;
            this.votePlayers[i].active = true;
        }

        this.voteDismiss.active = true;

        // 如果是自己发起的投票, 就不需要再确认
        if (this._userInfo.playerUuid === data.sponsor) {
            data.expireSeconds = 1;

            this.voteDismissButton[0].active = false;
            this.voteDismissButton[1].active = false;

            this.voteExpireSeconds.string = '等待倒计时：0秒';
        } else {
            this.voteExpireSeconds.string = `等待倒计时：${data.expireSeconds}秒`;
        }

        const self = this;
        this._expireSeconds = () => {
            if (data.expireSeconds > 0) {
                data.expireSeconds -= 1;
                self.voteExpireSeconds.string = `等待倒计时：${data.expireSeconds}秒`;
            } else if (data.expireSeconds === 0) {
                self.unschedule(this._expireSeconds);
            }
        };
        this.schedule(this._expireSeconds, 1);
    },

    onDismissRoomMessage(data) {
        if (data.code === 5003) {
            window.Global.Dialog.openMessageBox('您不是房主, 无法解散房间');
            return;
        }

        if (data.code !== 1) {
            return;
        }

        if (data.flag === 0) {
            if (this._Cache.ownerUuid === this._userInfo.playerUuid) {
                window.Global.NetworkManager.close();
                cc.director.loadScene('Lobby');
            } else {
                window.Global.Dialog.openMessageBox('房主已解散房间', function() {
                    window.Global.NetworkManager.close();
                    cc.director.loadScene('Lobby');
                });
            }
        } else if (data.flag === 1) {
            window.Global.NetworkManager.close();
            cc.director.loadScene('Lobby');
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

    onDealDDZMessage(data) {
        this._Cache.waitJiaofeng = true;

        this._initCardDistrict();

        // 初始化手牌
        var index = data.cardsInHandList.length - 1;
        this.schedule(() => {
            // window.Global.SoundEffect.playEffect(window.DDZ.Config.audioUrl.effect.dealCard);
            this._appendCardToHandCardDistrict(data.cardsInHandList[index].card);
            index -= 1;
            if (index === -1) {
                window.DDZ.Tools.orderCard(this.handCardDistrict.children);
                this._Cache.waitJiaofeng = false;
            }
        }, 0.2, data.cardsInHandList.length - 1);


        // 初始化其他玩家的手牌数量
        for (var j = 1; j < 3; j += 1) {
            this._showCardNumber(j, data.cardsInHandList.length);
        }

        // 设置底牌
        for (var i = 0; i < data.threeCardsList.length; i++) {
            this.dipaiNode.children[0].addChild(this._createCard(data.threeCardsList[i].card));
        }

        if (this._userInfo.playerUuid === data.firstRobUuid) {
            this._Cache.robScore = -1;
            this._showModButton(this._Cache.robScore);
        }
    },

    onRobDDZMessage(data) {
        // 更新叫分时的最高分
        if (this._Cache.robScore < data.score) {
            this._Cache.robScore = data.score;
        }
        // 如果下一个叫分玩家是自己就显示叫分按钮
        if (this._userInfo.playerUuid === data.nextRobPlayerUuid) {
            this._showModButton(this._Cache.robScore);
        }

        // 如果是自己叫分, 就把自己的叫分按钮隐藏
        if (this._userInfo.playerUuid === data.playerUuid) {
            this._hideActionNode();
        }

        // 显示叫分玩家叫的分数
        var playerIndex = this._getPlayerIndexBySeat(this._getSeatForPlayerUuid(data.playerUuid));
        this._showFenshu(playerIndex, data);

        // 是否已经有人成为地主
        if (data.lairdPlayerUuid) {
            this._hideJiaofenSprite();
            var lairdPayerIndex = this._getPlayerIndexBySeat(this._getSeatForPlayerUuid(data.lairdPlayerUuid));
            this._showDizhuPanel(lairdPayerIndex);
            this.dipaiNode.children[1].active = false;
            // 添加底牌给地主
            if (this._userInfo.playerUuid === data.lairdPlayerUuid) {
                for (var i = 0; i < this.dipaiNode.children[0].children.length; i++) {
                    var obj = this.dipaiNode.children[0].children[i];
                    this.handCardDistrict.addChild(this._addClickEventToCard(this._createCard(obj._userData)));
                }

                this._activeChupaiButton(true);
                window.DDZ.Tools.orderCard(this.handCardDistrict.children);
            }
        }
        // 如果没人成为地主, 并且没有下一个叫分的玩家, 需要重新发牌
        else if (!data.nextRobPlayerUuid) {
            this._hideJiaofenSprite();
            this._initCardDistrict();
        }
    },

    onPlayerVoteMessage(data) {
        if (!data.flag) {
            this.voteDismiss.active = false;
            return;
        }
        for (let i = 0; i < this._votePlayers.length; i += 1) {
            const obj = this._votePlayers[i];
            if (obj.playerUuid === data.playerUuid) {
                this.votePlayers[i].getChildByName('userSelectTxt').getComponent(cc.Label).string = data.flag ? '同意' : '拒绝';
            }
        }
    },

    onSettleForRoundDDZMessage(data) {
        this._initCardDistrict();
        this._hideActionNode();
        const self = this;
        const node = cc.instantiate(this.smallAccountPrefab);
        node.getComponent('DDZSmallAccount').init({ data: data, playerInfoList: this._Cache.playerList });
        window.Global.Animation.openDialog(node, this.node, () => {
            self._hideDipaiNode();
        });
    },

    onSettleForRoomDDZMessage(data) {
        if (this.voteDismiss.active || this._Cache.settleForRoomData) {
            this.voteDismiss.active = false;
            window.Global.NetworkManager.close();
            var node = cc.instantiate(this.bigAccountPrefab);
            node.getComponent('DDZBigAccount').init({
                data: data, playerInfoList: this._Cache.playerList,
                gameRule: this.roomInfo[3].string,
                roomId: this.roomInfo[0].string,
                ownerUuid: this._Cache.ownerUuid
            });
            window.Global.Animation.openDialog(node, this.node);
        } else {
            this._Cache.settleForRoomData = data;
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
        // window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Animation.openDialog(cc.instantiate(this.soundPrefab), this.node, () => {
            cc.log('load success');
        });
    },

    /**
     * 解散房间
     */
    dismissOnClick() {
        // window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.DismissRoom);
    },

    voteOnClick(evt, data) {
        // window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.PlayerVote, { flag: data == 1 });

        this.voteDismissButton[0].active = false;
        this.voteDismissButton[1].active = false;

        this.unschedule(this._expireSeconds);
    },

    /**
     * 出牌
     *
     * @param event
     * @param data
     */
    selectedHandCardOnClick(event) {
        cc.log(event.target.getPositionY());
        if (event.target.getPositionY() === 0) {
            event.target.setPositionY(24);
        }
        else {
            event.target.setPositionY(0);
        }
    },

    /**
     * 叫分模式按钮回调
     */

    jiaofenOnClick(event, data) {
        window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.RobDDZ, {flag: data > 0 ? 1 : 2, score: parseInt(data, 10)});
    },

    jiaodizhuOnClick(event, data) {
        window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.RobDDZ, {flag: parseInt(data, 10), score: 1});
    },

    chupaiOnClick(event, data) {
        if (data == 0) {
            var discards = this._getDiscardValues();
            if (discards.length === 0) {
                cc.log('没有要出的牌');
                return;
            }
            this._discard(discards);
        }
        else if (data == 1) {

        }
        else if (data == 2) {
            this._discard([]);
        }
    },

    _getDiscardValues() {
        var discardValues = [];
        for (var i = 0; i < this.handCardDistrict.children.length; i += 1) {
            var card = this.handCardDistrict.children[i];
            if (card.getChildByName('Background').getPositionY() > 0) {
                discardValues.push(card._userData);
            }
        }
        return discardValues;
    },

    _discard(data) {
        window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.DiscardDDZ, { cards: data });
        // window.Global.SoundEffect.playEffect(window.DDZ.Config.audioUrl.effect.cardOut);  // 胡牌音效
    },

    closeOnClick() {
        // window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        if (this._Cache.playerList.length !== 3) {
            window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.ExitRoom, { roomId: this._Cache.roomId });
        } else {
            window.Global.Dialog.openMessageBox('游戏中无法退出');
        }
    },

    /**
     *******************************************************************************************************************
     *                                       callback
     *******************************************************************************************************************
     **/

    readyGameCallback() {
        cc.log('readyGameCallback');
        if (this._Cache.settleForRoomData) {
            this.onSettleForRoomDDZMessage(this._Cache.settleForRoomData);
        } else if (this.handCardDistrict.length === 0) {
            cc.log('readyGameCallback.Ready');
            window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.Ready);
            this.roomInfo[1].string = `局数: ${this._Cache.currentRound += 1}/${this._Cache.config.max_rounds}`;
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
    _hideActionSprite(playerIndex) {
        if (typeof playerIndex === 'undefined') {
            for (var i = 0; i < this.actionSprite.length; i++) {
                for (var j = 0; j < this.actionSprite[i].children.length; j += 1) {
                    this.actionSprite[i].children[j].active = false;
                }
            }
        }
        else {
            for (var j = 0; j < this.actionSprite[playerIndex].children.length; j += 1) {
                this.actionSprite[playerIndex].children[j].active = false;
            }
        }
    },

    _showActionSprite(playerIndex, cardType) {
        var actionChildren = this.actionSprite[playerIndex].children;

        // todo: 根据不同的牌形显示不同的提示
        if (cardType === window.DDZ.Config.cardType.PASS) {
            actionChildren[0].active = true;
        }
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
     * 叫分模式
     */
    _hideJiaofenModButton() {
        for (let i = 0; i < this.jiaofenModeButton.length; i += 1) {
            this.jiaofenModeButton[i].active = false;
        }
    },

    _showJiaofenModButton(score) {
        for (let i = 0; i < this.jiaofenModeButton.length; i += 1) {
            if (i > score) {
                this.jiaofenModeButton[i].active = true;
            }
        }
        this.jiaofenModeButton[0].active = true;
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

    _activeChupaiButton(active) {
        for (let i = 0; i < this.chupaiButton.length; i += 1) {
            this.chupaiButton[i].active = active;
        }
    },
    // TODO: 出牌按钮显示逻辑相对复杂

    /**
     * 添加牌到手牌区
     *
     * @param card
     * @private
     */
    _appendCardToHandCardDistrict(card) {
        var node = this._addClickEventToCard(this._createCard(card));
        this.handCardDistrict.addChild(node);
    },

    /**
     * 构造每张牌
     */
    _createCard(card) {
        var cardValue = window.DDZ.Tools.getCardVo(card);
        var node;

        if (cardValue.suit === 5) {
            node = cc.instantiate(this.cardPrefab[cardValue.value === 17 ? 2 : 1]);
        }
        else {
            node = cc.instantiate(this.cardPrefab[0]);

            var color = [1, 3].indexOf(cardValue.suit) !== -1 ? 'black' : 'red';

            var nodeSpriteChildren = node.getChildByName('Background').children;
            nodeSpriteChildren[0].getComponent(cc.Sprite).spriteFrame = this.cardPinList.getSpriteFrame(cardValue.value + '_' + color);
            nodeSpriteChildren[1].getComponent(cc.Sprite).spriteFrame = this.cardPinList.getSpriteFrame(cardValue.suit);
            nodeSpriteChildren[2].getComponent(cc.Sprite).spriteFrame = this.cardPinList.getSpriteFrame(cardValue.suit);
        }

        node._userData = card;

        return node;
    },

    _addClickEventToCard(node) {
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
    _addCardToDiscardDistrict(playerIndex, cards, cardType) {
        this._hideActionSprite();
        this.dirtyCardDistrict[playerIndex].removeAllChildren();
        for (var i = 0; i < cards.length; i += 1) {
            var node = this._createCard(cards[i].card);
            this.dirtyCardDistrict[playerIndex].addChild(node);
        }

        if (cards.length === 0) {
            this.actionSprite[playerIndex].children[0].active = true;
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

    _hideJiaofenSprite() {
        for (var i = 0; i < this.jiaofenSprate.length; i += 1) {
            for (var j = 0; j < this.jiaofenSprate[i].children.length; j += 1) {
                this.jiaofenSprate[i].children[j].active = false;
            }
        }
    },

    _showDizhuPanel(playerIndex) {
        for (var i = 0; i < this.playerInfoList.length; i += 1) {
            if (i === playerIndex) {
                this.playerInfoList[i].getChildByName('table_dizhuTag').active = true;
            }
            else {
                this.playerInfoList[i].getChildByName('table_nongminTag').active = true;
            }
        }
    },

    _showFenshu(playerIndex, data) {
        if ((this._Cache.config.options & 0b10) !== 0) {
            var flag = data.robFlag || data.flag;

            if (flag === 2) {
                this.jiaofenSprate[playerIndex].children[0].active = true;
            }
        }
        else {
            var score = data.robScore || data.score;
            if (score !== -1) {
                this.jiaofenSprate[playerIndex].children[score].active = true;
            }
        }
    },

    _showModButton(score) {
        if ((this._Cache.config.options & 0b10) !== 0) {
            this._activeJiaodizhuModButton(true);
        }
        else {
            this._showJiaofenModButton(score);
        }
    },

    _hideActionNode() {
        for (var i = 0; i < this.actionNode.children.length; i++) {
            this.actionNode.children[i].active = false;
        }
    },

    _initScene: function() {
        for (var i = 0; i < this.playerInfoList.length; i++) {
            this.playerInfoList[i].active = false;
            this.inviteButtonList[i].active = true;
            this.clockNode[i].active = false;
            this.dirtyCardDistrict[i].removeAllChildren();
        }
        this.handCardDistrict.removeAllChildren();

        this._hideJiaofenSprite();
        this._hideActionNode();
        this._hideActionSprite();
        this._hideDipaiNode();
    },

    _hideDipaiNode() {
        this.dipaiNode.children[1].active = true;
        this.dipaiNode.children[0].removeAllChildren();
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

    _initCardDistrict() {
        for (var i = 0; i < this.dirtyCardDistrict.length; i++) {
            this.dirtyCardDistrict[i].removeAllChildren();
        }
        this.handCardDistrict.removeAllChildren();
    },

    _showCardNumber(playerIndex, number) {
        var cardNumberNode = this.playerInfoList[playerIndex].getChildByName('cardNumber');
        cardNumberNode.active = true;
        cardNumberNode.getChildByName('Number').getComponent(cc.Label).string = number;
    },

    _resetHandCardPosition() {
        for (let i = 0; i < this.handCardDistrict.childrenCount; i += 1) {
            this.handCardDistrict.children[i].setPositionY(0);
        }
    },

    /**
     * 滑动选择卡牌
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-07-12T16:04:33+0800
     *
     * @return   {[type]}                 [description]
     */
    _selectCatds() {
        this.handCardDistrict.on(cc.Node.EventType.TOUCH_START, function(event) {
            this._touchMoveEnum = TouchMoveEnum.Begin;
            this._touchMoveBeginEvent = event;
        }, this);

        this.handCardDistrict.on(cc.Node.EventType.TOUCH_MOVE, function(event) {
            this._touchMoveEnum = TouchMoveEnum.Move;
            for (var i = 0; i < this.handCardDistrict.children.length; i++) {
                var pos = this.handCardDistrict.children[i].convertToNodeSpace(event.getLocation());
                cc.log([event.getLocation(), pos]);
                cc.log('cc.Node.EventType.TOUCH_MOVE');
                // 是否被选中
                if (pos.x > 0 && pos.x <= 24) {
                    this.handCardDistrict.children[i].getChildByName('Background').getChildByName('mask').active = true;
                }
            }
        }, this);

        this._touchEndBySelectCatds = function() {
            for (var i = 0; i < this.handCardDistrict.children.length; i++) {
                // 设置牌是否为选中状态
                cc.log(this.handCardDistrict.children[i].getChildByName('Background').getChildByName('mask').active);
                if (this.handCardDistrict.children[i].getChildByName('Background').getChildByName('mask').active) {
                    if (this.handCardDistrict.children[i].getPositionY() == 0) {
                        this.handCardDistrict.children[i].setPositionY(24);
                    } else {
                        this.handCardDistrict.children[i].setPositionY(0);
                    }
                }
                this.handCardDistrict.children[i].getChildByName('Background').getChildByName('mask').active = false;
            }
            cc.log('cc.Node.EventType.TOUCH_END');
        };

        this.handCardDistrict.on(cc.Node.EventType.TOUCH_END, this._touchEndBySelectCatds, this);
        this.handCardDistrict.on(cc.Node.EventType.TOUCH_CANCEL, this._touchEndBySelectCatds, this);
    },

});