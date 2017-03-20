cc.Class({
    extends: cc.Component,
    // 708034
    properties: {
        soundPrefab: cc.Prefab,
        userInfoPrefab: cc.Prefab,
        cardMarkPrefab: cc.Prefab,

        cardPinList: cc.SpriteAtlas,

        // 当前出牌的人前面的标识
        makeSeat: {
            default: [],
            type: cc.Node,
        },

        // 听牌提示
        tingCardDistrict: cc.Node,

        /**
         * 解散房间
         */
        voteDismiss: cc.Node,
        voteSponsor: cc.Label,
        voteExpireSeconds: cc.Label,
        votePlayers: {
            default: [],
            type: cc.Node,
        },
        voteDismissButton: {
            default: [],
            type: cc.Node,
        },

        /**
         * 摸到的牌
         */
        getHandcard: {
            default: [],
            type: cc.Node,
        },

        /**
         * 0: 玩家1
         * 1: 玩家24
         * 3: 玩家3
         */
        handCardPrefabs: {
            default: [],
            type: cc.Prefab,
        },

        handCardDistrict: {
            default: [],
            type: cc.Node,
        },

        /**
         * 0: 玩家13
         * 1: 玩家24
         */
        dirtyCardPrefabs: {
            default: [],
            type: cc.Prefab,
        },

        dirtyCardDistrict: {
            default: [],
            type: cc.Node,
        },

        // 碰和吃
        pongAndChowPrefab: {
            default: [],
            type: cc.Prefab,
        },

        // 明杠
        exposedPrefab: {
            default: [],
            type: cc.Prefab,
        },

        // 暗杠
        concealedKongPrefab: {
            default: [],
            type: cc.Prefab,
        },

        pongKongChowDistrict: {
            default: [],
            type: cc.Node,
        },

        playerInfoList: {
            default: [],
            type: cc.Node,
        },

        inviteButtonList: {
            default: [],
            type: cc.Node,
        },

        chatList: {
            default: [],
            type: cc.Node,
        },

        roomInfo: {
            default: [],
            type: cc.Label,
        },

        actionPanel: {
            default: [],
            type: cc.Node,
        },

        waitPanel: cc.Node,

        fastChatPanel: cc.Node,

        menuPanel: cc.Node,

        hupaiPrompt: cc.Node,

        bonusPoint: cc.Label,

        fastChatProgressBar: cc.ProgressBar,

        voiceProgressBar: cc.ProgressBar,

        wechatInviteButton: cc.Button,

        handCardIsSelected: 0,
    },

    onLoad() {
        this._GameRoomCache = {};
        const scriptName = 'GameRoomScene';
        if (Global.tempCache) {
            const self = this;
            this.wsUrl = `ws://${Global.tempCache.serverIp}:${Global.tempCache.serverPort}/ws`;
            this._GameRoomCache.roomId = Global.tempCache.roomId;

            WebSocketManager.ws.openSocket(this.wsUrl);
            WebSocketManager.ws.addOnopenListener(scriptName, () => {
                WebSocketManager.sendMessage('EnterRoom', { roomId: self._GameRoomCache.roomId });
                WebSocketManager.sendMessage('Ready');
            });
            WebSocketManager.ws.addOnmessageListener(scriptName, (evt, commandName, result) => {
                if (commandName === false) {
                    cc.warn(['WebSocketManager.ws.addOnmessageListener', '数据解析失败']);
                    return;
                }
                self[`on${commandName}Message`](result);
            });
            WebSocketManager.ws.addOnerrorListener(scriptName, () => {

            });
            WebSocketManager.ws.addOncloseListener(scriptName, () => {

            });

            this.roomInfo[1].string = `房间号: ${this._GameRoomCache.roomId}`;
        }

        this.emojiNode = cc.Node;
        this.fastChatShowTime = +new Date();

        this.fastChatPanelPosition = this.fastChatPanel.position;
        this.menuPanelPosition = this.menuPanel.position;

        this.audio = Tools.audioEngine.init();

        this._userInfo = Tools.getLocalData(Global.LSK.userInfo);
        this.playerInfoList[0].getChildByName('text_nick').getComponent(cc.Label).string = this._userInfo.nickname;
        Tools.setWebImage(this.playerInfoList[0].getChildByName('img_handNode').getComponent(cc.Sprite), this._userInfo.headimgurl);
    },

    update(dt) {
        this.roomInfo[0].string = Tools.formatDatetime('hh:ii:ss');

        // 每次聊天的冷却时间
        if (+new Date() > Global.fastChatShowTime + this.fastChatShowTime) {
            if (this.emojiNode.isValid) {
                this.emojiNode.destroy();
            }
        }

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
        this._roomInfo(data.kwargs, 0, data.restCards);

        for (let i = 0; i < data.playerList.length; i += 1) {
            const obj = data.playerList[i];
            if (obj.playerUuid === this._userInfo.playerUuid) {
                this._GameRoomCache.thisPlayerSeat = obj.seat;
            }
        }

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

        if (this._GameRoomCache.playerList.length === 4) {
            // 移动三号位的玩家头像到右边, 避免被挡住
            this.playerInfoList[2].setPositionX(-134);
        }

        const playerIndex = this._computeSeat(data.seat);

        this.inviteButtonList[playerIndex].active = false;
        this.playerInfoList[playerIndex].active = true;

        this.playerInfoList[playerIndex].getChildByName('text_nick').getComponent(cc.Label).string = data.info.nickname;
        this.playerInfoList[playerIndex].getChildByName('text_result').getComponent(cc.Label).string = data.totalScore || 0;
        Tools.setWebImage(this.playerInfoList[playerIndex].getChildByName('img_handNode').getComponent(cc.Sprite), data.info.headimgurl);

        // 设置房主
        if (data.playerUuid === this._userInfo.playerUuid) {
            this.playerInfoList[playerIndex].getChildByName('img_hostmark').active = true;
        }

        // 如果房间人数满了, 关闭邀请按钮
        if (this._GameRoomCache.playerList.length === 4) {
            this.inviteButtonList[0].active = false;
        }
    },

    onExitRoomMessage(data) {
        if (data.code !== 1) {
            return;
        }

        for (let i; i < this._GameRoomCache.playerList.length; i += 1) {
            if (this._GameRoomCache.playerList[i].playerUuid === data.playerUuid) {
                const playerIndex = this._computeSeat(this._GameRoomCache.playerList[i].seat);

                this.inviteButtonList[playerIndex].active = true;
                this.playerInfoList[playerIndex].active = false;

                cc.js.array.removeAt(this._GameRoomCache.playerList, i);
                break;
            }
        }
    },

    onDismissRoomMessage(data) {
        if (data.code !== 1) {
            return;
        }

        cc.director.loadScene('GameRoom');
    },

    onSponsorVoteMessage(data) {
        if (data.code !== 1) {
            return;
        }

        this._votePlayers = {};
        for (let i; i < this._GameRoomCache.playerList.length; i += 1) {
            if (this._GameRoomCache.playerList[i].playerUuid === data.sponsor) {
                this.voteSponsor.string = this._GameRoomCache.playerList[i].nickname;
            }

            this._votePlayers.push(this._GameRoomCache.playerList[i]);
        }

        for (let i; i < this._votePlayers.length; i += 1) {
            this.votePlayers[i].getChildByName('userTxt').getComponent(cc.Label).string = this._votePlayers[i].nickname;
        }

        this.voteDismiss.active = true;
    },

    onPlayerVoteMessage(data) {
        if (data.code !== 1) {
            return;
        }

        for (let i; i < this._votePlayers.length; i += 1) {
            if (this._votePlayers[i] === data.playerUuid) {
                this.votePlayers[i].getChildByName('userSelectTxt').getComponent(cc.Label).string = data.flag ? '同意' : '拒绝';
            }
        }
    },

    onOnlineStatusMessage(data) {
        for (let i = 0; i < this._GameRoomCache.playerList.length; i += 1) {
            if (this._GameRoomCache.playerList[i].playerUuid === data.playerUuid) {
                const playerIndex = this._computeSeat(this._GameRoomCache.playerList[i].seat);
                this.playerInfoList[playerIndex].getChildByName('img_offline').active = !data.status;

                break;
            }
        }
    },

    onSpeakerMessage(data) {
        if (data.code !== 1) {
            return;
        }

        data.content = JSON.parse(data.content);

        for (let i = 0; i < this._GameRoomCache.playerList.length; i += 1) {
            if (this._GameRoomCache.playerList[i].playerUuid === data.playerUuid) {
                const playerIndex = this._computeSeat(this._GameRoomCache.playerList[i].seat);
                const self = this;

                // 评论
                if (data.content.type === 1) {
                    this.audio.setAudioRaw(Global.audioUrl.fastChat[`fw_${this._GameRoomCache.playerList[i].sex === 1 ? 'male' : 'female'}_${data.content.data}`]).play();

                    const text = Tools.findNode(this.fastChatPanel, `fastChatView1>fastViewItem${data.content.data}>Label`).getComponent(cc.Label).string;
                    this.chatList[playerIndex].getChildByName('txtMsg').getComponent(cc.Label).string = text;

                    self.chatList[playerIndex].active = true;
                    this.scheduleOnce(() => {
                        self.chatList[playerIndex].active = false;
                    }, 3);
                }
                // 表情
                else if (data.content.type === 2) {
                    Tools.loadRes(`emoji/emotion${data.content.data}`, cc.Prefab, (prefab) => {
                        const node = cc.instantiate(prefab);
                        self.emojiNode = node;
                        self.node.addChild(node);
                        node.getComponent(cc.Animation).play(`emotion${data.content.data}`);
                    });
                }
                // 语音
                else if (data.content.type === 3) {
                    Tools.setWebAudio(data.content.data, (audioRaw) => {
                        self.audio.setAudioRaw(audioRaw).play();
                    });
                }

                break;
            }
        }
    },

    onReadyMessage(data) {
        if (data.code !== 1) {
            return;
        }

        for (let i = 0; i < this._GameRoomCache.playerList.length; i += 1) {
            if (this._GameRoomCache.playerList[i].playerUuid === data.playerUuid) {
                const playerIndex = this._computeSeat(this._GameRoomCache.playerList[i].seat);
                this.playerInfoList[playerIndex].getChildByName('img_offline').active = false;

                break;
            }
        }
    },

    onDealMessage(data) {
        if (data.code !== 1) {
            return;
        }

        // 移动三号位的玩家头像到右边, 避免被挡住
        this.playerInfoList[2].setPositionX(-134);

        this._GameRoomCache.gameing = false;

        // 庄家
        for (let i = 0; i < this._GameRoomCache.playerList.length; i += 1) {
            if (this._GameRoomCache.playerList[i].playerUuid === data.dealerUuid) {
                this._GameRoomCache.dealeSeat = this._computeSeat(this._GameRoomCache.playerList[i].seat);
                this.playerInfoList[this._GameRoomCache.dealeSeat].getChildByName('img_zhuang').active = false;

                break;
            }
        }

        this._appendCardToHandCardDistrict(0, data.cardsInHandList);
        this._appendCardToHandCardDistrict(1);
        this._appendCardToHandCardDistrict(2);
        this._appendCardToHandCardDistrict(3);
    },

    onDrawMessage(data) {
        for (let i = 0; i < this._GameRoomCache.playerList.length; i += 1) {
            if (data.roomInfoData.playerList[i].playerUuid === data.playerUuid) {
                const playerIndex = this._computeSeat(this._GameRoomCache.playerList[i].seat);
                const nodeSprite = Tools.findNode(this.getHandcard[0], 'Background>value').getComponent(cc.Sprite);
                nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data.card.card.toString(16)}`);

                this.getHandcard[playerIndex].active = true;
                break;
            }
        }
    },

    onDiscardMessage(data) {
        if (data.code !== 1) {
            return;
        }

        for (let i = 0; i < this._GameRoomCache.playerList.length; i += 1) {
            if (data.roomInfoData.playerList[i].playerUuid === data.playerUuid) {
                const playerIndex = this._computeSeat(this._GameRoomCache.playerList[i].seat);
                const node = cc.instantiate(this.dirtyCardPrefabs[playerIndex]);

                const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data.card.card.toString(16)}`);

                this.dirtyCardDistrict[playerIndex].addChild(node);
                break;
            }
        }
    },

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
        this._GameRoomCache.gameing = true;

        if (data.playerList[0].cardsInHandList.length > 0) {
            // 移动三号位的玩家头像到右边, 避免被挡住
            this.playerInfoList[2].setPositionX(-134);
        }

        // 初始化房间信息
        this._roomInfo(data.kwargs, data.currentRound, data.restCards);

        // 清空当前所有玩家信息等待重新初始化
        for (let i = 0; i < 4; i += 1) {
            this.handCardDistrict[i].removeAllChildren();
            this.dirtyCardDistrict[i].removeAllChildren();
            this.pongKongChowDistrict[i].removeAllChildren();

            this.inviteButtonList[i].active = true;
            this.playerInfoList[i].active = false;

            this.makeSeat[i].getComponent(cc.Animation).stop();
            this.makeSeat[i].opacity = 255;
        }

        // 查找当前玩家的座位号
        for (let i = 0; i < data.playerList.length; i += 1) {
            const obj = data.playerList[i];
            if (obj.playerUuid === this._userInfo.playerUuid) {
                this._GameRoomCache.thisPlayerSeat = obj.seat;
            }
        }

        // 初始化玩家信息
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

            // 初始化手牌
            this._appendCardToHandCardDistrict(playerIndex, obj.cardsInHandList);
            this._appendCardToDiscardDistrict(playerIndex, obj.cardsDiscardList);
            this._appendConcealedKongToDistrict(playerIndex, obj.cardsKongConcealedList);
            this._appendExposedToDistrict(playerIndex, obj.cardsKongExposedList);
            this._appendPongToDistrict(playerIndex, obj.cardsPongList);
            this._appendChowToDistrict(playerIndex, obj.cardsChowList);
        }

        // 庄家
        this._GameRoomCache.dealerSeat = this._computeSeat(data.dealer);
        this.playerInfoList[this._GameRoomCache.dealerSeat].getChildByName('img_zhuang').active = true;

        // 玩家摸到的牌
        // if (data.cardDraw) {
        //     const nodeSprite = this.getHandcard[0].getChildByName('value').getComponent(cc.Sprite);
        //     cc.loader.loadRes('Texture/card_pin', cc.SpriteAtlas, (err, atlas) => {
        //         nodeSprite.spriteFrame = atlas.getSpriteFrame(`value_0x${data.cardDraw}`);
        //     });
        // }

        if (data.playerList.length !== 4) {
            this.inviteButtonList[0].active = true;
        }

        this._GameRoomCache.playerList = data.playerList;

        // 当前活动玩家座位号, 打出去的牌上面的小标识
        if (data.discardSeat !== -1) {
            const playerIndex = this._computeSeat(data.discardSeat);
            const childrenNode = this.dirtyCardDistrict[playerIndex].children[this.dirtyCardDistrict[playerIndex].childrenCount - 1];
            childrenNode.addChild(cc.instantiate(this.cardMarkPrefab));
        }

        // 当前出牌玩家
        if (data.activeSeat !== -1) {
            const playerIndex = this._computeSeat(data.activeSeat);
            this.makeSeat[playerIndex].getComponent(cc.Animation).play();
        }
    },

    onPromptMessage(data) {
        if (data.code !== 1) {
            return;
        }

        this._GameRoomCache.promptList = data;

        if (data.length > 0) {
            this.actionPanel[0].active = true;
        }

        for (let i = 0; i < data.length; i += 1) {
            const obj = data[i];

            if (obj.prompt === Global.promptType.Chow) {
                this.actionPanel[1].active = true;
            }
            else if (obj.prompt === Global.promptType.Pong) {
                this.actionPanel[2].active = true;
            }
            else if (obj.prompt === Global.promptType.KongConcealed || obj.prompt === Global.promptType.kongExposed) {
                this.actionPanel[3].active = true;
            }
            else if (obj.prompt === Global.promptType.WinDiscard || obj.prompt === Global.promptType.WinDraw) {
                this.actionPanel[4].active = true;
            }
        }
    },

    onActionMessage(data) {
        if (data.code !== 1) {
            return;
        }

        if (data.activeCard) {
            this._GameRoomCache.activeCard.destroy();
        }

        const playerIndex = this._computeSeat(data.triggerSeat);

        // todo: 音频, 根据不同的用户的位置动画提示
        if (data.activeType === Global.promptType.Chow) {
            this._appendChowToDistrict(playerIndex, data.refCard);
        }
        else if (data.activeType === Global.promptType.Pong) {
            this._appendPongToDistrict(playerIndex, data.refCard);
        }
        else if (data.activeType === Global.promptType.KongConcealed) {
            this._appendConcealedKongToDistrict(playerIndex, data.refCard);
        }
        else if (data.activeType === Global.promptType.kongExposed) {
            this._appendExposedToDistrict(playerIndex, data.refCard);
        }
        else if (data.activeType === Global.promptType.WinDiscard || data.activeType === Global.promptType.WinDraw) {
            // todo: 胡牌
        }
    },

    onReadyHandMessage(data) {
        if (data.code !== 1) {
            return;
        }

        for (let j = 0; j < this.tingCardDistrict.children.length; j += 1) {
            if (j !== 0) {
                this.tingCardDistrict.children[j].destroy();
            }
        }

        this.tingCardDistrict.active = true;

        for (let i = 0; i < data.length; i += 1) {
            const node = cc.instantiate(this.dirtyCardPrefabs[0]);
            const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[i].card.toString(16)}`);

            this.tingCardDistrict.addChild(node);
        }
    },

    onSettleForRoundMessage(data) {
        if (data.code !== 1) {
            return;
        }

        Global.tempCache = { data, playerInfoList: this._GameRoomCache.playerList };
        cc.director.loadScene('SmallAccount');
    },

    onSettleForRoomMessage(data) {
        if (data.code !== 1) {
            return;
        }

        Global.tempCache = { data, playerInfoList: this._GameRoomCache.playerList };
        cc.director.loadScene('SmallAccount');
    },

    /**
     *******************************************************************************************************************
     *                                       button on click
     *******************************************************************************************************************
     **/

    showUserInfoOnClick(evt, data) {
        cc.warn(this._GameRoomCache);
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
            cc.warn(filePath);
        });
    },

    openFastChatPanelOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        cc.warn([this.fastChatProgressBar.progress, this.fastChatPanel.position.x, this.fastChatPanelPosition.x]);
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
            cc.warn('voiceOnClick');
        }
    },

    openMenuOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        cc.warn([parseInt(this.menuPanel.position.x.toFixed(0), 10), this.menuPanelPosition.x]);
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
        if (data === 1) {
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
        WebSocketManager.sendMessage('Speaker', { content });

        this.fastChatProgressBar.progress = 1.0;
        Global.playEffect(Global.audioUrl.fastChat[`fw_male_${data}`]);

        Animation.closePanel(this.fastChatPanel);
    },

    emojiChatOnClick(evt, data) {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        const content = JSON.stringify({ type: 2, data });
        WebSocketManager.sendMessage('Speaker', { content });

        this.fastChatProgressBar.progress = 1.0;
        this.fastChatShowTime = +new Date();
        const self = this;

        Tools.loadRes(`emoji/emotion${data}`, cc.Prefab, (prefab) => {
            const node = cc.instantiate(prefab);
            self.emojiNode = node;
            self.node.addChild(node);
            node.getComponent(cc.Animation).play(`emotion${data}`);
        });

        Animation.closePanel(this.fastChatPanel);
    },

    actionOnClick(event, data) {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        this._hideActionPanel();
        if (data !== 0) {
            this.actionPanel[5].getComponent(cc.Sprite).spriteFrame = event.target.getComponent(cc.Sprite).spriteFrame;
            this._showActionPanel([5]);
        }
    },

    /**
     * 出牌
     *
     * @param event
     * @param data
     */
    selectedHandCardOnClick(event, data) {
        Global.playEffect(Global.audioUrl.effect.cardOut);
        if (this.handCardIsSelected === data) {
            event.target.parent.destroy();
            const node = cc.instantiate(this.dirtyCardPrefabs[0]);
            const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data.toString(16)}`);
            this.dirtyCardDistrict[0].addChild(node);

            WebSocketManager.sendMessage('Discard', { card: data });

            return;
        }

        this.handCardIsSelected = data;

        this._resetHandCardPosition();
        event.target.setPositionY(24);

        cc.warn(event.target.parent.getChildByName('UserData').string);
    },

    /**
     * 声音选项
     */
    openSoundPanelOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.openDialog(cc.instantiate(this.soundPrefab), this.node, () => {
            cc.warn('load success');
        });
    },

    dismissOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        WebSocketManager.sendMessage('DismissRoom');
        WebSocketManager.ws.closeSocket();

        cc.director.loadScene('Lobby');
    },

    voteConfirmOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);

        this.dismissButton[0].active = false;
        this.dismissButton[1].active = false;
    },

    voteDisagreeOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);

        this.dismissButton[0].active = false;
        this.dismissButton[1].active = false;
    },

    closeOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        if (this._GameRoomCache.playerList.length !== 4) {
            WebSocketManager.sendMessage('ExitRoom', { roomId: this._GameRoomCache.roomId });
            WebSocketManager.ws.closeSocket();
            cc.director.loadScene('Lobby');
        }
    },

    /**
     *******************************************************************************************************************
     *                                       callback
     *******************************************************************************************************************
     **/

    onReadyGame() {
        WebSocketManager.sendMessage('Ready');
    },

    /**
     *******************************************************************************************************************
     *                                       function
     *******************************************************************************************************************
     **/

    /**
     * 0: 过
     * 1: 吃
     * 2: 碰
     * 3: 杠
     * 4: 胡
     * 5: 中间显示当前选择的动作, 0 除外
     */
    _hideActionPanel() {
        for (let i = 0; i < this.actionPanel.length; i += 1) {
            this.actionPanel[i].active = false;
        }
    },

    _showActionPanel(indexs) {
        if (indexs.length === 1) {
            const self = this;
            self._hideActionPanel();
            this.scheduleOnce(() => {
                self._hideActionPanel();
            }, 1);
        }

        for (let i = 0; i < indexs.length; i += 1) {
            this.actionPanel[indexs[i]].active = true;
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
                insert(data[i].card);
            }
        }
        else {
            let i = data.length;
            this.schedule(() => {
                Global.playEffect(Global.audioUrl.effect.dealCard);
                insert(data[i].card);
                i -= 1;
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
     * @private
     */
    _appendCardToDiscardDistrict(player, data) {
        for (let i = 0; i < data.length; i += 1) {
            const node = cc.instantiate(this.dirtyCardPrefabs[player]);
            this.dirtyCardDistrict[player].addChild(node);

            const nodeSprite = Tools.findNode(node, 'Background>value');
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[i].card.toString(16)}`);
        }
    },

    _resetHandCardPosition() {
        for (let i = 0; i < this.handCardDistrict[0].childrenCount; i += 1) {
            this.handCardDistrict[0].children[i].getChildByName('Background').setPositionY(0);
        }
    },

    _computeSeat(playerSeat) {
        const desplaySeat = playerSeat - this._GameRoomCache.thisPlayerSeat;
        return (desplaySeat < 0 ? desplaySeat + 4 : desplaySeat);
    },

    /**
     * 设置房间信息
     *
     * @param {Object} info
     * @param currentRound
     * @param restCards
     * @private
     */
    _roomInfo(info, currentRound, restCards) {
        // 游戏玩法
        const _gameInfo = Global.playerTypes[info.game_uuid];
        let gameInfo = '玩法: ';
        for (const k in info.play_type) {
            if (info.play_type[k] === 1) {
                gameInfo += `${_gameInfo.play_type[k]},`;
            }
        }
        gameInfo = `${gameInfo.substr(0, gameInfo.length - 1)}\n可选: `;

        for (const k in info.options) {
            if (info.options[k] === 1) {
                gameInfo += `${_gameInfo.options[k]},`;
            }
        }
        gameInfo = gameInfo.substr(0, gameInfo.length - 1);

        this.roomInfo[1].string = `房间号: ${this._GameRoomCache.roomId}`;
        this.roomInfo[2].string = `局数: ${currentRound}/${info.max_rounds}`;
        this.roomInfo[3].string = `剩余牌数: ${restCards}`;
        this.roomInfo[4].string = gameInfo;
    },

});
