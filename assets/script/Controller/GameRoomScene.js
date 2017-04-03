cc.Class({
    extends: cc.Component,

    properties: {
        soundPrefab: cc.Prefab,
        userInfoPrefab: cc.Prefab,
        cardMarkPrefab: cc.Prefab,
        smallAccountPrefab: cc.Prefab,
        bigAccountPrefab: cc.Prefab,

        cardPinList: cc.SpriteAtlas,
        emojiList: [cc.Prefab],
        countDownAnimation: cc.Animation,

        makeSeat: [cc.Node],        // 当前出牌的人前面的标识
        tingCardDistrict: cc.Node,  // 听牌提示

        // 解散房间
        voteDismiss: cc.Node,
        voteSponsor: cc.Label,
        voteExpireSeconds: cc.Label,
        votePlayers: [cc.Node],
        voteDismissButton: [cc.Node],

        getHandcard: [cc.Node], // 摸到的牌

        // 玩家手牌
        handCardPrefabs: [cc.Prefab],
        handCardDistrict: [cc.Node],

        // 打出去的牌
        dirtyCardPrefabs: [cc.Prefab],
        dirtyCardDistrict: [cc.Node],

        // 吃碰杠
        pongKongChowDistrict: [cc.Node],
        pongAndChowPrefab: [cc.Prefab], // 碰和吃
        exposedPrefab: [cc.Prefab],     // 明杠
        concealedKongPrefab: [cc.Prefab],   // 暗杠

        playerInfoList: [cc.Node],
        inviteButtonList: [cc.Node],
        chatList: [cc.Node],
        roomInfo: [cc.Label],

        // 动作相关
        actionPanel: [cc.Node],
        actionSprite: [cc.Node],
        selectChi: [cc.Node],
        actionSpriteFrame: [cc.SpriteFrame],

        waitPanel: cc.Node,
        fastChatPanel: cc.Node,
        menuPanel: cc.Node,
        bonusPoint: cc.Label,
        fastChatProgressBar: cc.ProgressBar,
        voiceProgressBar: cc.ProgressBar,
        wechatInviteButton: cc.Button,
    },

    onLoad() {
        this._GameRoomCache = {};
        this._GameRoomCache.roomId = '';        // 房间号
        this._GameRoomCache.ownerUuid = '';     // 房主uuid
        this._GameRoomCache.cardCount = 0;     // 剩余牌数
        this._GameRoomCache.playerList = [];    // 玩家信息列表
        this._GameRoomCache.promptList = [];    // 提示操作信息
        this._GameRoomCache.thisPlayerSeat = 0; // 当前玩家实际座位号
        this._GameRoomCache.thisDealerSeat = 0; // 当前庄家相对座位号
        this._GameRoomCache.activeCardFlag = null;  // 最后出的那张牌上面的标识
        this._GameRoomCache.activeCard = null;      // 当前最后出的那张牌
        this._GameRoomCache.waitDraw = false;       // 是否等待抓拍, 客户端逻辑
        this._GameRoomCache.allowOutCard = false;   // 是否允许出牌
        this._GameRoomCache.lastHasAction = false;  // 上一次出牌是否有action
        this._GameRoomCache.settleForRoomData = null;    // 大结算数据

        // todo: 需要删除
        this._initScene();

        if (Global.tempCache) {
            const self = this;
            this._GameRoomCache.roomId = Global.tempCache.roomId;
            this.wsUrl = `ws://${Global.tempCache.serverIp}:${Global.tempCache.serverPort}/ws`;

            WebSocketManager.onopen = (evt) => {
                Global.log(['WebSocket.open: ', evt]);
                self._hideWaitPanel();
                WebSocketManager.sendSocketMessage(WebSocketManager.ws, 'EnterRoom', { roomId: self._GameRoomCache.roomId });
                WebSocketManager.sendSocketMessage(WebSocketManager.ws, 'Ready');
            };
            WebSocketManager.onclose = (evt) => {
                Global.log(['WebSocket.onclose: ', evt]);
                self._showWaitPanel(2);
            };
            WebSocketManager.onmessage = (evt) => {
                const data = WebSocketManager.ArrayBuffer.reader(evt.data);
                Global.log(`WebSocket onmessage: ${JSON.stringify(data)}`);
                if (data === false) {
                    Global.log('WebSocket.message: WebSocket数据解析失败');
                    return;
                }

                const commandName = Tools.findKeyForValue(WebSocketManager.Command, data.cmd);
                if (commandName === false) {
                    Global.log('WebSocket.message: Tools.findKeyForValue数据解析失败');
                    return;
                }

                const result = Tools.protobufToJson(proto.game[`${commandName}Response`].deserializeBinary(data.data));
                if (!result) {
                    Global.log('WebSocket.message: Tools.protobufToJson数据解析失败');
                    return;
                }

                Global.log([`WebSocket.message ${commandName}: `, result]);
                self[`on${commandName}Message`](result);
            };
            WebSocketManager.openSocketLink(this.wsUrl);

            this.roomInfo[1].string = `房间号: ${this._GameRoomCache.roomId}`;
        }

        this.fastChatPanelPosition = this.fastChatPanel.position;
        this.menuPanelPosition = this.menuPanel.position;

        this.audio = Tools.audioEngine.init();

        this._userInfo = Tools.getLocalData(Global.LSK.userInfo);
        this.playerInfoList[0].getChildByName('text_nick').getComponent(cc.Label).string = this._userInfo.nickname;
        Tools.setWebImage(this.playerInfoList[0].getChildByName('img_handNode').getComponent(cc.Sprite), this._userInfo.headimgurl);

        // TODO: 录音长按监听
        // this.myButton.on(cc.Node.EventType.TOUCH_START, () => {
        //     cc.log('cc.Node.EventType.TOUCH_START');
        // }, this);
    },

    update(dt) {
        this.roomInfo[0].string = Tools.formatDatetime('hh:ii:ss');

        if (this.fastChatProgressBar.progress <= 1.0 && this.fastChatProgressBar.progress >= 0) {
            this.fastChatProgressBar.progress -= dt * Global.fastChatWaitTime;
        }

        if (this.voiceProgressBar.progress <= 1.0 && this.voiceProgressBar.progress >= 0) {
            this.voiceProgressBar.progress -= dt * Global.fastChatWaitTime;
        }
    },

    /**
     *******************************************************************************************************************
     *                                       public socket on message
     *******************************************************************************************************************
     **/

    onEnterRoomMessage(data) {
        if (data.code !== 1) {
            return;
        }

        data.kwargs = JSON.parse(data.kwargs);
        this._GameRoomCache.ownerUuid = data.ownerUuid;
        this._setRoomInfo(data.kwargs, 0, data.restCards);

        this._setThisPlayerSeat(data.playerList);

        for (let i = 0; i < data.playerList.length; i += 1) {
            const obj = data.playerList[i];
            const playerIndex = this._computeSeat(obj.seat);
            obj.info = JSON.parse(obj.info);

            this.inviteButtonList[playerIndex].active = false;
            this.playerInfoList[playerIndex].active = true;
            this.playerInfoList[playerIndex].getChildByName('text_nick').getComponent(cc.Label).string = obj.info.nickname;
            this.playerInfoList[playerIndex].getChildByName('text_result').getComponent(cc.Label).string = obj.totalScore || 0;
            Tools.setWebImage(this.playerInfoList[playerIndex].getChildByName('img_handNode').getComponent(cc.Sprite), obj.info.headimgurl);

            // 设置房主
            if (obj.playerUuid === data.ownerUuid) {
                this.playerInfoList[playerIndex].getChildByName('img_hostmark').active = true;
            }

            // 是否在线
            if (this._userInfo.playerUuid !== obj.playerUuid) {
                this.playerInfoList[playerIndex].getChildByName('img_offline').active = obj.isOnline === 0;
            }

            if (playerIndex !== 0) {
                this.inviteButtonList[playerIndex].active = false;
                this.playerInfoList[playerIndex].active = true;
            }
        }

        if (data.playerList.length !== 4) {
            this.inviteButtonList[0].active = true;
        }

        this._GameRoomCache.playerList = data.playerList;
    },

    onEnterRoomOtherMessage(data) {
        if (data.code !== 1) {
            return;
        }

        data.info = JSON.parse(data.info);
        this._GameRoomCache.playerList.push(data);

        const playerIndex = this._computeSeat(data.seat);

        this.inviteButtonList[playerIndex].active = false;
        this.playerInfoList[playerIndex].active = true;

        this.playerInfoList[playerIndex].getChildByName('text_nick').getComponent(cc.Label).string = data.info.nickname;
        this.playerInfoList[playerIndex].getChildByName('text_result').getComponent(cc.Label).string = data.totalScore || 0;
        Tools.setWebImage(this.playerInfoList[playerIndex].getChildByName('img_handNode').getComponent(cc.Sprite), data.info.headimgurl);

        // 设置房主
        if (data.playerUuid === this._GameRoomCache.ownerUuid) {
            this.playerInfoList[playerIndex].getChildByName('img_hostmark').active = true;
        }

        // 如果房间人数满了, 关闭邀请按钮
        if (this._GameRoomCache.playerList.length === 4) {
            this.inviteButtonList[0].active = false;
        }
    },

    onExitRoomMessage(data) {
        const playerIndex = this._computeSeat(this._getSeatForPlayerUuid(data.playerUuid));
        this._showInviteButton([playerIndex]);
        this._hidePlayerInfoList([playerIndex]);

        // 从玩家列表中删除该用户
        for (let i = 0; i < this._GameRoomCache.playerList.length; i += 1) {
            if (this._GameRoomCache.playerList[i].playerUuid === data.playerUuid) {
                cc.js.array.removeAt(this._GameRoomCache.playerList, i);
                break;
            }
        }
    },

    onDismissRoomMessage(data) {
        if (data.code === 5003) {
            Global.tempCache = '您不是房主, 无法解散房间';
            Global.dialog.open('Dialog', this.node);
            return;
        }

        if (data.code !== 1) {
            return;
        }

        if (data.flag === 0) {
            if (this._GameRoomCache.ownerUuid === this._userInfo.playerUuid) {
                WebSocketManager.close();
                cc.director.loadScene('Lobby');
            }
            else {
                Global.tempCache = '房主已解散房间';
                Global.dialog.open('Dialog', this.node, () => {
                    WebSocketManager.close();
                    cc.director.loadScene('Lobby');
                });
            }
        }
        else if (data.flag === 1) {
            WebSocketManager.close();
            cc.director.loadScene('Lobby');
        }
    },

    onSponsorVoteMessage(data) {
        this._initVotePanel(data);
    },

    onPlayerVoteMessage(data) {
        for (let i = 0; i < this._votePlayers.length; i += 1) {
            const obj = this._votePlayers[i];
            if (obj.playerUuid === data.playerUuid) {
                this.votePlayers[i].getChildByName('userSelectTxt').getComponent(cc.Label).string = data.flag ? '同意' : '拒绝';
            }
        }
    },

    onOnlineStatusMessage(data) {
        const playerIndex = this._computeSeat(this._getSeatForPlayerUuid(data.playerUuid));
        this.playerInfoList[playerIndex].getChildByName('img_offline').active = !data.status;
        if (this._GameRoomCache.playerList.length === 4) {
            if (data.status) {
                this._hideWaitPanel();
            }
            else {
                this._showWaitPanel(1);
            }
        }
    },

    // todo: 需要优化, 每个表情都需要定位到玩家前面, 或者干脆就不要表情了
    onSpeakerMessage(data) {
        data.content = JSON.parse(data.content);

        for (let i = 0; i < this._GameRoomCache.playerList.length; i += 1) {
            if (this._GameRoomCache.playerList[i].playerUuid === data.playerUuid) {
                const playerIndex = this._computeSeat(this._GameRoomCache.playerList[i].seat);
                const self = this;

                // 评论
                if (data.content.type === 1) {
                    Global.playEffect(Global.audioUrl.fastChat[`fw_${this._GameRoomCache.playerList[i].info.sex === 1 ? 'male' : 'female'}_${data.content.data}`]);
                    const text = Tools.findNode(this.fastChatPanel, `fastChatView1>content>fastViewItem${data.content.data}>Label`).getComponent(cc.Label).string;
                    this.chatList[playerIndex].getChildByName('txtMsg').getComponent(cc.Label).string = text;
                    this.chatList[playerIndex].active = true;
                    this.scheduleOnce(() => {
                        self.chatList[playerIndex].active = false;
                    }, 3);
                }
                // 表情
                else if (data.content.type === 2) {
                    const node = cc.instantiate(this.emojiList[data.content.data - 1]);
                    node.getComponent(cc.Animation).play(`emotion${data.content.data}`);
                    if (playerIndex === 0) {
                        node.setPosition(0, -126);
                    }
                    else if (playerIndex === 1) {
                        node.setPosition(162, 0);
                        node.rotation = 270;
                    }
                    else if (playerIndex === 2) {
                        node.setPosition(0, 126);
                        node.rotation = 180;
                    }
                    else if (playerIndex === 3) {
                        node.setPosition(-162, 0);
                        node.rotation = 90;
                    }

                    this.node.addChild(node);
                    this.scheduleOnce(() => {
                        node.destroy();
                    }, 3);
                }
                // 语音
                else if (data.content.type === 3) {
                    // Tools.setWebAudio(data.content.data, (audioRaw) => {
                    //     self.audio.setAudioRaw(audioRaw).play();
                    // });
                }

                break;
            }
        }
    },

    onReadyMessage(data) {
        const playerIndex = this._computeSeat(this._getSeatForPlayerUuid(data.playerUuid));
        this.playerInfoList[playerIndex].getChildByName('img_offline').active = false;
    },

    onDealMessage(data) {
        this._GameRoomCache.gameing = false;
        this._GameRoomCache.waitDraw = true;

        // 移动三号位的玩家头像到右边, 避免被挡住
        this.playerInfoList[2].setPositionX(-134);

        // 庄家
        this._GameRoomCache.thisDealerSeat = this._computeSeat(this._getSeatForPlayerUuid(data.dealerUuid));
        this.playerInfoList[this._GameRoomCache.thisDealerSeat].getChildByName('img_zhuang').active = true;

        // 初始化手牌
        this._appendCardToHandCardDistrict(0, data.cardsInHandList);
        this._appendCardToHandCardDistrict(1, new Array(13));
        this._appendCardToHandCardDistrict(2, new Array(13));
        this._appendCardToHandCardDistrict(3, new Array(13));

        this._GameRoomCache.gameing = true;
    },

    onDrawMessage(data) {
        Global.playEffect(Global.audioUrl.effect.dealCard);
        this.countDownAnimation.play();

        // 抓拍后剩余牌数减一
        const cardCount = parseInt(this.roomInfo[3].string.replace('剩余牌数: ', ''), 10);
        this.roomInfo[3].string = `剩余牌数: ${cardCount - 1}`;

        const playerIndex = this._computeSeat(this._getSeatForPlayerUuid(data.playerUuid));
        this._openLight(playerIndex);

        if (data.card.card === 0) {
            return;
        }

        this._GameRoomCache.allowOutCard = true;

        const self = this;
        this.scheduleOnce(() => {
            // 如果抓拍的人是自己才对数据进行处理
            if (playerIndex === 0) {
                const clickEventHandler = Tools.createEventHandler(self.node, 'GameRoomScene', 'selectedHandCardOnClick', data.card.card);
                self.getHandcard[playerIndex].getChildByName('GetHandCard').getComponent(cc.Button).clickEvents[0] = clickEventHandler;
                const nodeSprite = Tools.findNode(self.getHandcard[playerIndex], 'GetHandCard>value').getComponent(cc.Sprite);
                nodeSprite.spriteFrame = self.cardPinList.getSpriteFrame(`value_0x${data.card.card.toString(16)}`);
            }

            self.getHandcard[playerIndex].active = true;
        }, this._GameRoomCache.waitDraw ? 3 : 0);

        this._GameRoomCache.waitDraw = false;   // 不是起手抓拍, 不需要再等待
    },

    onDiscardMessage(data) {
        const playerIndex = this._computeSeat(this._getSeatForPlayerUuid(data.playerUuid));
        this._GameRoomCache.activeCard = this._appendCardToDiscardDistrict(playerIndex, [{ card: data.card.card }]);
        this._createActiveCardFlag(playerIndex);

        Global.playEffect(Global.audioUrl.common[this._userInfo.sex === 1 ? 'man' : 'woman'][data.card.card]);
    },

    // todo: 需要完善
    onSynchroniseCardsMessage(data) {
        if (data.code !== 1) {
            return;
        }

        this.handCardDistrict[0].removeAll();

        for (let i = 0; i < data.card.length; i += 1) {
            const obj = data.card[i];
            const node = cc.instantiate(this.handCardPrefabs[0]);
            const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj.card.toString(16)}`);

            this.handCardDistrict[0].addChild(node);
        }
    },

    /**
     *******************************************************************************************************************
     *                                       px258 socket on message
     *******************************************************************************************************************
     **/

    onReconnectMessage(data) {
        data.kwargs = JSON.parse(data.kwargs);
        this._GameRoomCache.roomId = data.roomId;
        this._GameRoomCache.ownerUuid = data.ownerUuid;
        this._GameRoomCache.gameing = true;
        this._GameRoomCache.waitDraw = false;

        this._initScene();

        if (data.playerList.length === 4) {
            this._hideInviteButton();
            this.playerInfoList[2].setPositionX(-134);  // 移动三号位的玩家头像到右边, 避免被挡住
        }

        // 初始化房间信息
        this._setRoomInfo(data.kwargs, data.currentRound, data.restCards);

        // 设置当前玩家的座位号
        this._setThisPlayerSeat(data.playerList);

        // 初始化玩家信息
        for (let i = 0; i < data.playerList.length; i += 1) {
            const obj = data.playerList[i];
            obj.info = JSON.parse(obj.info);
            const playerIndex = this._computeSeat(obj.seat);
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
            this._appendCardToHandCardDistrict(playerIndex, obj.cardsInHandList);
            this._appendCardToDiscardDistrict(playerIndex, obj.cardsDiscardList);
            this._appendConcealedKongToDistrict(playerIndex, obj.cardsKongConcealedList);
            this._appendExposedToDistrict(playerIndex, obj.cardsKongExposedList);
            this._appendPongToDistrict(playerIndex, obj.cardsPongList);
            this._appendChowToDistrict(playerIndex, obj.cardsChowList);
        }

        // 庄家
        this._GameRoomCache.thisDealerSeat = this._computeSeat(data.dealer);
        this.playerInfoList[this._GameRoomCache.thisDealerSeat].getChildByName('img_zhuang').active = true;

        this._GameRoomCache.playerList = data.playerList;

        // 当前活动玩家座位号, 打出去的牌上面的小标识
        if (data.discardSeat !== -1) {
            const discardSeatIndex = this._computeSeat(data.discardSeat);
            this._createActiveCardFlag(discardSeatIndex);
            this._GameRoomCache.activeCard = this.dirtyCardDistrict[discardSeatIndex].children[this.dirtyCardDistrict[discardSeatIndex].childrenCount - 1];
        }

        // 当前出牌玩家
        if (data.activeSeat !== -1) {
            this._openLight(this._computeSeat(data.activeSeat));
        }
    },

    onPromptMessage(data) {
        if (this.tingCardDistrict.childrenCount > 1) {
            this._initReadyHand();
        }

        this.countDownAnimation.play();
        this._GameRoomCache.promptList = data.promptList;

        let promptType = [];

        for (let i = 0; i < data.promptList.length; i += 1) {
            promptType.push(data.promptList[i].prompt);
        }

        promptType = Tools.unique(promptType);
        this._showActionPrompt(promptType);
    },

    onActionMessage(data) {
        this._hideActionPrompt();
        this.countDownAnimation.play();

        this._GameRoomCache.lastHasAction = true;
        const playerIndex = this._computeSeat(this._getSeatForPlayerUuid(data.playerUuid));

        if (data.playerUuid === this._userInfo.playerUuid) {
            this._GameRoomCache.allowOutCard = true;
        }

        if (data.activeType === Global.promptType.Chow) {
            Global.playEffect(Global.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].chow);

            // 删除需要删除的手牌
            for (let i = 0; i < data.refCardList.length; i += 1) {
                const obj = data.refCardList[i];
                this._deleteHandCardByCode(playerIndex, obj.card.toString(16));
            }
            this._GameRoomCache.activeCard.destroy();

            data.refCardList.push(data.activeCard);
            data.refCardList.sort((a, b) => {
                return a - b;
            });
            this._appendChowToDistrict(playerIndex, data.refCardList);

            this.actionSprite[playerIndex].spriteFrame = this.actionSpriteFrame[0];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }
        else if (data.activeType === Global.promptType.Pong) {
            Global.playEffect(Global.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].pong);

            // 删除需要删除的手牌
            for (let i = 0; i < data.refCardList.length; i += 1) {
                const obj = data.refCardList[i];
                this._deleteHandCardByCode(playerIndex, obj.card.toString(16));
            }
            this._GameRoomCache.activeCard.destroy();

            data.refCardList.push(data.activeCard);
            this._appendPongToDistrict(playerIndex, data.refCardList);

            this.actionSprite[playerIndex].spriteFrame = this.actionSpriteFrame[1];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }
        else if (data.activeType === Global.promptType.kongExposed) {
            Global.playEffect(Global.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].kong);

            // 删除需要删除的手牌
            for (let i = 0; i < data.refCardList.length; i += 1) {
                const obj = data.refCardList[i];
                this._deleteHandCardByCode(playerIndex, obj.card.toString(16));
            }
            this._GameRoomCache.activeCard.destroy();

            data.refCardList.push(data.activeCard);
            this._appendExposedToDistrict(playerIndex, data.refCardList);

            this.actionSprite[playerIndex].spriteFrame = this.actionSpriteFrame[2];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }
        else if (data.activeType === Global.promptType.KongConcealed) {
            Global.playEffect(Global.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].ankong);

            // 删除需要删除的手牌
            for (let i = 0; i < data.refCardList.length; i += 1) {
                const obj = data.refCardList[i];
                this._deleteHandCardByCode(playerIndex, obj.card.toString(16));
            }
            const card = Tools.findNode(this.getHandcard[playerIndex], 'GetHandCard>value').getComponent(cc.Sprite).spriteFrame._name.replace(/value_0x/, '');
            if (card == data.activeCard.card) {
                this._hideGetHandCard(playerIndex);
            }

            this._appendConcealedKongToDistrict(playerIndex, data.refCardList);

            this.actionSprite[playerIndex].spriteFrame = this.actionSpriteFrame[2];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }
        else if (data.activeType === Global.promptType.KongPong) {
            Global.playEffect(Global.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].kong);

            // 删除需要删除的手牌
            this._deleteHandCardByCode(playerIndex, data.refCardList[0].card.toString(16));
            if (this.getHandcard[playerIndex].active) {
                const card = Tools.findNode(this.getHandcard[playerIndex], 'GetHandCard>value').getComponent(cc.Sprite).spriteFrame._name.replace(/value_0x/, '');
                if (card == data.refCardList[0].card.toString(16)) {
                    this._hideGetHandCard(playerIndex);
                }
            }

            for (let i = 0; i < this.pongKongChowDistrict[playerIndex].childrenCount; i += 1) {
                const children = this.pongKongChowDistrict[playerIndex].children[i];
                const card = Tools.findNode(children, 'Background>value').getComponent(cc.Sprite).spriteFrame._name.replace(/value_0x/, '');
                if (card == data.refCardList[0].card.toString(16)) {
                    children.destroy();
                    break;
                }
            }

            for (let i = 0; i < 3; i += 1) {
                data.refCardList.push({ card: data.refCardList[0].card });
            }
            this._appendExposedToDistrict(playerIndex, data.refCardList);

            this.actionSprite[playerIndex].spriteFrame = this.actionSpriteFrame[2];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }
        else if (data.activeType === Global.promptType.WinDraw) {
            Global.playEffect(Global.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].zimo);

            // todo: 胡牌动画, 更改为胡了之后显示该张牌
            this.actionSprite[playerIndex].spriteFrame = this.actionSpriteFrame[3];
            // this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }
        else if (data.activeType === Global.promptType.WinDiscard) {
            Global.playEffect(Global.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].win);

            // todo: 胡牌动画, 更改为胡了之后显示该张牌
            // this.actionSprite[playerIndex].spriteFrame = this.actionSpriteFrame[3];
            // this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }

        this._openLight(playerIndex);
    },

    onReadyHandMessage(data) {
        if (this._actionIsShow()) {
            return;
        }

        this._initReadyHand();

        for (let i = 0; i < data.cardList.length; i += 1) {
            const node = cc.instantiate(this.dirtyCardPrefabs[0]);
            const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data.cardList[i].card.toString(16)}`);
            this.tingCardDistrict.addChild(node);
        }

        this.tingCardDistrict.active = true;
    },

    onSettleForRoundMessage(data) {
        const self = this;
        Global.tempCache = { data, playerInfoList: this._GameRoomCache.playerList };
        Global.openDialog(cc.instantiate(this.smallAccountPrefab), this.node, () => {
            for (let i = 0; i < 4; i += 1) {
                self.handCardDistrict[i].removeAllChildren();
                self.dirtyCardDistrict[i].removeAllChildren();
                self.pongKongChowDistrict[i].removeAllChildren();
            }

            this.roomInfo[3].string = `剩余牌数: ${this._GameRoomCache.cardCount}`;
            this._initReadyHand();
            this._hideSelectChiPanel();
        });
    },

    onSettleForRoomMessage(data) {
        if (this.voteDismiss.active || this._GameRoomCache.settleForRoomData) {
            this.voteDismiss.active = false;
            WebSocketManager.close();
            Global.tempCache = { data, playerInfoList: this._GameRoomCache.playerList };
            Global.openDialog(cc.instantiate(this.bigAccountPrefab), this.node);
        }
        else {
            this._GameRoomCache.settleForRoomData = data;
        }
    },

    /**
     *******************************************************************************************************************
     *                                       button on click
     *******************************************************************************************************************
     **/

    showUserInfoOnClick(evt, data) {
        for (let i = 0; i < this._GameRoomCache.playerList.length; i += 1) {
            const playerIndex = this._computeSeat(this._GameRoomCache.playerList[i].seat);
            if (playerIndex == data) {
                Global.tempCache = this._GameRoomCache.playerList[i].info;
                Global.openDialog(cc.instantiate(this.userInfoPrefab), this.node);
                break;
            }
        }
    },

    /**
     * 微信邀请
     */
    wechatInviteOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Tools.captureScreen(this.node, (filePath) => {
            Global.log(filePath);
        });
    },

    openFastChatPanelOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.log([this.fastChatProgressBar.progress, this.fastChatPanel.position.x, this.fastChatPanelPosition.x]);
        if (this.fastChatProgressBar.progress <= 0) {
            if (this.fastChatPanel.position.x === this.fastChatPanelPosition.x) {
                Animation.openPanel(this.fastChatPanel);
            }
            else {
                const self = this;
                Animation.closePanel(this.fastChatPanel, () => {
                    self.fastChatPanel.setPositionX(self.fastChatPanelPosition.x);
                });
            }
        }
    },

    /**
     * 发送语音
     */
    voiceOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        if (this.voiceProgressBar.progress <= 0) {
            this.voiceProgressBar.progress = 1.0;
            Global.log('voiceOnClick');
        }
    },

    openMenuOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.log([parseInt(this.menuPanel.position.x.toFixed(0), 10), this.menuPanelPosition.x]);
        if (this.menuPanel.position.x === this.menuPanelPosition.x) {
            Animation.openPanel(this.menuPanel);
        }
        else {
            const self = this;
            Animation.closePanel(this.menuPanel, () => {
                self.menuPanel.setPositionX(self.menuPanelPosition.x);
            });
        }
    },

    closeDialogOnClick() {
        // 检查是否关闭聊天面板
        if (this.fastChatPanel.position.x !== this.fastChatPanelPosition.x) {
            Animation.closePanel(this.fastChatPanel);
        }

        // 检查是否关闭菜单面板
        if (this.menuPanel.position.x !== this.menuPanelPosition.x) {
            Animation.closePanel(this.menuPanel);
        }

        // 手牌复位
        if (this.handCardDistrict[0].childrenCount > 0) {
            this._resetHandCardPosition();
        }

        // 关闭听提示
        if (this.tingCardDistrict.active) {
            this.tingCardDistrict.active = false;
        }
    },

    switchFastChatPanelOnClick(evt, data) {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        if (data == 1) {
            this.fastChatPanel.getChildByName('fastChatView1').active = true;
            this.fastChatPanel.getChildByName('fastChatView2').active = false;
        }
        else {
            this.fastChatPanel.getChildByName('fastChatView1').active = false;
            this.fastChatPanel.getChildByName('fastChatView2').active = true;
        }
    },

    wordChatOnClick(evt, data) {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        const content = JSON.stringify({ type: 1, data });
        WebSocketManager.sendSocketMessage(WebSocketManager.ws, 'Speaker', { content });

        this.fastChatProgressBar.progress = 1.0;

        Animation.closePanel(this.fastChatPanel);
    },

    emojiChatOnClick(evt, data) {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        const content = JSON.stringify({ type: 2, data });
        WebSocketManager.sendSocketMessage(WebSocketManager.ws, 'Speaker', { content });

        this.fastChatProgressBar.progress = 1.0;

        Animation.closePanel(this.fastChatPanel);
    },

    actionOnClick(event, data) {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        this.countDownAnimation.play();

        this._hideActionPrompt();

        let actionId = null;
        const actionIdList = JSON.parse(data);

        if (actionIdList.length === 1) {
            actionId = actionIdList[0].actionId;
        }
        // 大于1表示需要弹出吃的选择
        else if (actionIdList.length > 1) {
            for (let i = 0; i < actionIdList.length; i += 1) {
                const obj = actionIdList[i];

                const clickEventHandler = Tools.createEventHandler(this.node, 'GameRoomScene', 'selectChiOnClick', JSON.stringify(obj));
                this.selectChi[i].getComponent(cc.Button).clickEvents[0] = clickEventHandler;

                const children = this.selectChi[i].children;
                for (let j = 0; j < children.length; j += 1) {
                    const nodeSprite = children[j].getChildByName('value').getComponent(cc.Sprite);
                    if (j === 0) {
                        nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj.opCard.card.toString(16)}`);
                    }
                    else {
                        nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj.refCardList[j - 1].card.toString(16)}`);
                    }
                }

                this.selectChi[i].active = true;
            }
            this.selectChi[3].active = true;
            return;
        }

        WebSocketManager.sendSocketMessage(WebSocketManager.ws, 'Action', { actionId });
    },

    /**
     * 出牌
     *
     * @param event
     * @param data
     */
    selectedHandCardOnClick(event, data) {
        // 关闭听提示
        if (this.tingCardDistrict.active) {
            this.tingCardDistrict.active = false;
        }

        if (event.target.getPositionY() !== 0) {
            if (!this._GameRoomCache.allowOutCard) {
                return;
            }
            this._GameRoomCache.allowOutCard = false;
            if (event.target.name === 'GetHandCard') {
                this._hideGetHandCard(0);
            }
            else {
                event.target.parent.destroy();
            }

            if (this.getHandcard[0].active) {
                const card = Tools.findNode(this.getHandcard[0], 'GetHandCard>value').getComponent(cc.Sprite).spriteFrame._name.replace(/value_0x/, '');
                this._appendCardToHandCardDistrict(0, [{ card: parseInt(card, 16) }]);
                this._hideGetHandCard(0);
            }

            WebSocketManager.sendSocketMessage(WebSocketManager.ws, 'Discard', { card: data });

            Global.playEffect(Global.audioUrl.effect.cardOut);
        }
        else {
            this._resetHandCardPosition();
            event.target.setPositionY(24);
        }
    },

    /**
     * 声音选项
     */
    openSoundPanelOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.openDialog(cc.instantiate(this.soundPrefab), this.node, () => {
            Global.log('load success');
        });
    },

    /**
     * 解散房间
     */
    dismissOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        WebSocketManager.sendSocketMessage(WebSocketManager.ws, 'DismissRoom');
    },

    voteOnClick(evt, data) {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        WebSocketManager.sendSocketMessage(WebSocketManager.ws, 'PlayerVote', { flag: data == 1 });

        this.voteDismissButton[0].active = false;
        this.voteDismissButton[1].active = false;

        this.unschedule(this._expireSeconds);
    },

    /**
     * 选择需要吃的牌
     */
    selectChiOnClick(evt, data) {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        this._hideSelectChiPanel();

        data = JSON.parse(data);
        WebSocketManager.sendSocketMessage(WebSocketManager.ws, 'Action', { actionId: data.actionId });
    },

    closeOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        if (this._GameRoomCache.playerList.length !== 4) {
            WebSocketManager.sendSocketMessage(WebSocketManager.ws, 'ExitRoom', { roomId: this._GameRoomCache.roomId });
            WebSocketManager.close();
            cc.director.loadScene('Lobby');
        }
        else {
            Global.tempCache = '游戏中无法退出';
            Global.dialog.open('Dialog', this.node);
        }
    },

    /**
     *******************************************************************************************************************
     *                                       callback
     *******************************************************************************************************************
     **/

    readyGameCallback() {
        if (this._GameRoomCache.settleForRoomData) {
            this.onSettleForRoomMessage(this._GameRoomCache.settleForRoomData);
        }
        else {
            WebSocketManager.sendSocketMessage(WebSocketManager.ws, 'Ready');
            const currentRound = this.roomInfo[2].string.match(/: ([0-9]?)\//);
            this.roomInfo[2].string = this.roomInfo[2].string.replace(/: [0-9]?\//, `: ${parseInt(currentRound[1], 10) + 1}/`);
        }
    },

    /**
     *******************************************************************************************************************
     *                                       function
     *******************************************************************************************************************
     **/

    /**
     * 删除手牌
     */
    _deleteHandCardByCode(player, data) {
        Global.log([player, data]);
        for (let i = 0; i < this.handCardDistrict[player].childrenCount; i += 1) {
            const obj = this.handCardDistrict[player].children[i];
            if (player === 0) {
                const code = Tools.findNode(obj, 'Background>value').getComponent(cc.Sprite).spriteFrame._name.replace(/value_0x/, '');
                if (code == data && obj.active) {
                    obj.active = false;
                    obj.destroy();
                    break;
                }
            }
            else if (obj.active) {
                obj.active = false;
                obj.destroy();
                break;
            }
        }
    },

    /**
     * 添加牌到手牌区
     *
     * @param player
     * @param data
     * @private
     */
    _appendCardToHandCardDistrict(player, data) {
        const self = this;
        function insert(card) {
            const node = cc.instantiate(self.handCardPrefabs[player]);
            self.handCardDistrict[player].addChild(node);

            if (player === 0) {
                const clickEventHandler = Tools.createEventHandler(self.node, 'GameRoomScene', 'selectedHandCardOnClick', card);
                node.getChildByName('Background').getComponent(cc.Button).clickEvents.push(clickEventHandler);
                const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                nodeSprite.spriteFrame = self.cardPinList.getSpriteFrame(`value_0x${card.toString(16)}`);
            }
        }

        if (this._GameRoomCache.gameing) {
            for (let i = data.length - 1; i >= 0; i -= 1) {
                if (!data[i]) {
                    data[i] = { card: 0 };
                }
                insert(data[i].card);
            }
            if (player === 0) {
                Global.cardsSort(this.handCardDistrict[0].children);
            }
        }
        else if (data.length > 0) {
            let i = data.length - 1;
            this.schedule(() => {
                Global.playEffect(Global.audioUrl.effect.dealCard);
                if (!data[i]) {
                    data[i] = { card: 0 };
                }
                insert(data[i].card);
                i -= 1;
                if (i === -1 && player === 0) {
                    Global.cardsSort(this.handCardDistrict[0].children);
                }
            }, 0.2, (data.length - 1));
        }
    },

    /**
     * 暗杠
     *
     * @param player
     * @param data
     * @private
     */
    _appendConcealedKongToDistrict(player, data) {
        for (let i = 0; i < data.length; i += 1) {
            if (i % 4 === 0) {
                const node = cc.instantiate(this.concealedKongPrefab[player]);
                this.pongKongChowDistrict[player].addChild(node);

                const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[i].card.toString(16)}`);
            }
        }
    },

    /**
     * 明杠
     *
     * @param player
     * @param data
     * @private
     */
    _appendExposedToDistrict(player, data) {
        let node = cc.Node;
        for (let j = 0; j < data.length; j += 1) {
            if (j % 4 === 0) {
                node = cc.instantiate(this.exposedPrefab[player]);
                this.pongKongChowDistrict[player].addChild(node);
            }

            const nodeSprite = node.children[j % 4].getChildByName('value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[j].card.toString(16)}`);
        }
    },

    /**
     * 碰
     *
     * @param player
     * @param data
     * @private
     */
    _appendPongToDistrict(player, data) {
        let node = cc.Node;
        for (let j = 0; j < data.length; j += 1) {
            if (j % 3 === 0) {
                node = cc.instantiate(this.pongAndChowPrefab[player]);
                this.pongKongChowDistrict[player].addChild(node);
            }

            const nodeSprite = node.children[j % 3].getChildByName('value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[j].card.toString(16)}`);
        }
    },

    /**
     * 吃
     *
     * @param player
     * @param data
     * @private
     */
    _appendChowToDistrict(player, data) {
        let node = cc.Node;
        for (let j = 0; j < data.length; j += 1) {
            if (j % 3 === 0) {
                node = cc.instantiate(this.pongAndChowPrefab[player]);
                this.pongKongChowDistrict[player].addChild(node);
            }

            const nodeSprite = node.children[j % 3].getChildByName('value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[j].card.toString(16)}`);
        }
    },

    /**
     * 添加牌到打出去的区域
     *
     * @param player
     * @param data
     * @return cc.Node
     * @private
     */
    _appendCardToDiscardDistrict(player, data) {
        let node = cc.Node;
        for (let i = 0; i < data.length; i += 1) {
            node = cc.instantiate(this.dirtyCardPrefabs[player]);
            let nodeSprite = {};
            if (player === 0 || player === 3) {
                nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            }
            else {
                nodeSprite = Tools.findNode(node, 'Mask>Background>value').getComponent(cc.Sprite);
                // TODO: 处理特殊排列问题
                if (player === 1) {
                    if (this.dirtyCardDistrict[player].childrenCount % 10 !== 0) {
                        node.getChildByName('Mask').height = 60;
                    }
                }
                else if (player === 2) {
                    if (this.dirtyCardDistrict[player].childrenCount >= 10) {
                        node.getChildByName('Mask').height = 81;
                    }
                }
            }

            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[i].card.toString(16)}`);
            this.dirtyCardDistrict[player].addChild(node);
        }

        return node;
    },

    _resetHandCardPosition() {
        for (let i = 0; i < this.handCardDistrict[0].childrenCount; i += 1) {
            this.handCardDistrict[0].children[i].getChildByName('Background').setPositionY(0);
        }

        if (this.getHandcard[0].active) {
            this.getHandcard[0].getChildByName('GetHandCard').setPositionY(0);
        }
    },

    _computeSeat(playerSeat) {
        const desplaySeat = playerSeat - this._GameRoomCache.thisPlayerSeat;
        return (desplaySeat < 0 ? desplaySeat + 4 : desplaySeat);
    },

    _initVotePanel(data) {
        this._votePlayers = [];
        for (let i = 0; i < this._GameRoomCache.playerList.length; i += 1) {
            const obj = this._GameRoomCache.playerList[i];
            if (obj.playerUuid === data.sponsor) {
                this.voteSponsor.string = obj.info.nickname;
            }
            else {
                this._votePlayers.push(obj);
            }
        }

        for (let i = 0; i < this._votePlayers.length; i += 1) {
            const obj = this._votePlayers[i];
            this.votePlayers[i].getChildByName('userTxt').getComponent(cc.Label).string = obj.info.nickname;
        }

        this.voteDismiss.active = true;

        // 如果是自己发起的投票, 就不需要再确认
        if (this._userInfo.playerUuid === data.sponsor) {
            data.expireSeconds = 1;

            this.voteDismissButton[0].active = false;
            this.voteDismissButton[1].active = false;

            this.voteExpireSeconds.string = '等待倒计时：0秒';
        }
        else {
            this.voteExpireSeconds.string = `等待倒计时：${data.expireSeconds}秒`;
        }

        const self = this;
        this._expireSeconds = () => {
            if (data.expireSeconds > 0) {
                data.expireSeconds -= 1;
                self.voteExpireSeconds.string = `等待倒计时：${data.expireSeconds}秒`;
            }
            else if (data.expireSeconds === 0) {
                self.unschedule(this._expireSeconds);
            }
        };
        this.schedule(this._expireSeconds, 1);
    },


    /**
     * 设置房间信息
     *
     * @param {Object} info
     * @param currentRound
     * @param restCards
     * @private
     */
    _setRoomInfo(info, currentRound, restCards) {
        // 游戏玩法
        const playTypes = Global.playTypes[info.game_uuid];
        info.options = `0x${info.options.toString(16)}`;
        const num = info.options & 0x1;

        this.roomInfo[4].string = `玩法: ${playTypes.playType[num]}\n封顶: ${playTypes.options[info.options ^ num]}`;
        this.roomInfo[1].string = `房间号: ${this._GameRoomCache.roomId}`;
        this.roomInfo[2].string = `局数: ${currentRound}/${info.max_rounds}`;
        this.roomInfo[3].string = `剩余牌数: ${restCards}`;

        this._GameRoomCache.cardCount = restCards;
    },

    _getActionIdFromPromptList(prompt) {
        const promptList = [];
        for (let i = 0; i < this._GameRoomCache.promptList.length; i += 1) {
            const obj = this._GameRoomCache.promptList[i];
            if (prompt.indexOf(obj.prompt) !== -1) {
                promptList.push(obj);
            }
        }
        return promptList;
    },

    /**
     * 生成标识
     */
    _createActiveCardFlag(index) {
        this._deleteActiveCardFlag();
        if (this.dirtyCardDistrict[index].childrenCount > 0) {
            this._GameRoomCache.activeCardFlag = cc.instantiate(this.cardMarkPrefab);
            const node = this.dirtyCardDistrict[index].children[this.dirtyCardDistrict[index].childrenCount - 1];
            node.addChild(this._GameRoomCache.activeCardFlag);
        }
    },

    _deleteActiveCardFlag() {
        if (this._GameRoomCache.activeCardFlag) {
            this._GameRoomCache.activeCardFlag.destroy();
        }
    },

    /**
     * 当玩家出牌时前面的灯是亮的
     */
    _openLight(index) {
        this._closeAllLight();
        this.makeSeat[index].getComponent(cc.Animation).play();
    },

    _closeAllLight() {
        for (let i = 0; i < 4; i += 1) {
            this.makeSeat[i].getComponent(cc.Animation).stop();
            this.makeSeat[i].opacity = 255;
        }
    },

    /**
     * 邀请按钮
     */
    _hideInviteButton(indexs) {
        indexs = indexs || [0, 1, 2, 3];
        for (let i = 0; i < indexs.length; i += 1) {
            this.inviteButtonList[indexs[i]].active = false;
        }
    },

    _showInviteButton(indexs) {
        indexs = indexs || [0, 1, 2, 3];
        for (let i = 0; i < indexs.length; i += 1) {
            this.inviteButtonList[indexs[i]].active = true;
        }
    },

    /**
     * 玩家信息
     */
    _hidePlayerInfoList(indexs) {
        indexs = indexs || [0, 1, 2, 3];
        for (let i = 0; i < indexs.length; i += 1) {
            this.playerInfoList[indexs[i]].active = false;
        }
    },

    _showPlayerInfoList(indexs) {
        indexs = indexs || [0, 1, 2, 3];
        for (let i = 0; i < indexs.length; i += 1) {
            this.playerInfoList[indexs[i]].active = true;
        }
    },

    _setPlayerInfoList(index, data, totalScore) {
        this._hideInviteButton([index]);
        this._showPlayerInfoList([index]);

        this.playerInfoList[index].getChildByName('text_nick').getComponent(cc.Label).string = data.nickname;
        this.playerInfoList[index].getChildByName('text_result').getComponent(cc.Label).string = totalScore || 0;
        Tools.setWebImage(this.playerInfoList[index].getChildByName('img_handNode').getComponent(cc.Sprite), data.headimgurl);
    },

    /**
     * 初始化场景
     */
    _initScene() {
        const smallAccountNode = Tools.findNode(cc.director.getScene(), 'Canvas>SmallAccount');
        if (smallAccountNode) {
            smallAccountNode.destroy();
        }

        for (let i = 0; i < 4; i += 1) {
            this.handCardDistrict[i].removeAllChildren();
            this.dirtyCardDistrict[i].removeAllChildren();
            this.pongKongChowDistrict[i].removeAllChildren();

            this.playerInfoList[i].getChildByName('img_zhuang').active = false;
            this.playerInfoList[i].getChildByName('img_hostmark').active = false;
        }

        this._showInviteButton([0, 1, 2, 3]);
        this._hidePlayerInfoList([0, 1, 2, 3]);
        this._closeAllLight();
        this._hideActionPrompt();
        this._initReadyHand();
        this._hideSelectChiPanel();

        this.playerInfoList[2].setPositionX(-554);  // 移动三号位的玩家头像到中间
    },

    /**
     * 查找当前玩家的座位号
     */
    _setThisPlayerSeat(playerList) {
        for (let i = 0; i < playerList.length; i += 1) {
            const obj = playerList[i];
            if (obj.playerUuid === this._userInfo.playerUuid) {
                this._GameRoomCache.thisPlayerSeat = obj.seat;
                break;
            }
        }
    },

    /**
     * 获取用户座位号
     */
    _getSeatForPlayerUuid(playerUuid) {
        for (let i = 0; i < this._GameRoomCache.playerList.length; i += 1) {
            if (this._GameRoomCache.playerList[i].playerUuid === playerUuid) {
                return this._GameRoomCache.playerList[i].seat;
            }
        }
        return -1;
    },

    /**
     * 提示信息
     */
    _hideActionPrompt() {
        for (let i = 0; i < this.actionPanel.length; i += 1) {
            const obj = this.actionPanel[i];
            obj.active = false;
        }
    },

    _showActionPrompt(promptType) {
        this._hideActionPrompt();

        if (promptType.length > 0) {
            this.actionPanel[0].active = true;
        }

        for (let i = 0; i < promptType.length; i += 1) {
            let actionPanelIndex = 0;
            if (promptType[i] === Global.promptType.Chow) {
                actionPanelIndex = 1;
            }
            else if (promptType[i] === Global.promptType.Pong) {
                actionPanelIndex = 2;
            }
            else if (promptType[i] === Global.promptType.KongConcealed || promptType[i] === Global.promptType.kongExposed
                || promptType[i] === Global.promptType.KongPong) {
                actionPanelIndex = 3;
            }
            else if (promptType[i] === Global.promptType.WinDiscard || promptType[i] === Global.promptType.WinDraw) {
                actionPanelIndex = 4;
            }

            const promptList = this._getActionIdFromPromptList([promptType[i]]);
            const clickEventHandler = Tools.createEventHandler(this.node, 'GameRoomScene', 'actionOnClick', JSON.stringify(promptList));
            this.actionPanel[actionPanelIndex].getComponent(cc.Button).clickEvents[0] = clickEventHandler;
            this.actionPanel[actionPanelIndex].active = true;
        }
    },

    _hideSelectChiPanel() {
        for (let i = 0; i < this.selectChi.length; i += 1) {
            this.selectChi[i].active = false;
        }
    },

    _actionIsShow() {
        for (let i = 0; i < this.actionPanel.length; i += 1) {
            if (this.actionPanel[i].active) {
                return true;
            }
        }
        for (let i = 0; i < this.selectChi.length; i += 1) {
            if (this.selectChi[i].active) {
                return true;
            }
        }
        return false;
    },

    /**
     * 隐藏摸到的手牌
     */
    _hideGetHandCard(index) {
        this.getHandcard[index].active = false;
        this.getHandcard[0].getChildByName('GetHandCard').setPositionY(0);
    },

    /**
     * 听牌提示
     */
    _initReadyHand() {
        for (let j = 0; j < this.tingCardDistrict.children.length; j += 1) {
            if (j !== 0) {
                this.tingCardDistrict.children[j].destroy();
            }
        }
        this.tingCardDistrict.active = false;
    },

    _showWaitPanel(messageId) {
        if (messageId === 1) {
            this.waitPanel.getChildByName('txt_wait').getComponent(cc.Label).string = '玩家可能离线或者离开，等待操作中...';
        }
        else if (messageId === 2) {
            this.waitPanel.getChildByName('txt_wait').getComponent(cc.Label).string = '断线重连中，请稍等...';
        }
        this.waitPanel.active = true;
    },

    _hideWaitPanel() {
        this.waitPanel.active = false;
    },

});
