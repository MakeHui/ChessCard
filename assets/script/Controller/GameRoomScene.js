cc.Class({
    extends: cc.Component,
    // 708034
    properties: {
        soundPrefab: cc.Prefab,

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
        const scriptName = 'GameRoomScene';
        if (Global.tempCache) {
            const self = this;
            this.wsUrl = `ws://${Global.tempCache.serverIp}:${Global.tempCache.serverPort}/ws`;
            this.roomId = Global.tempCache.roomId;

            WebSocketManager.ws.openSocket(this.wsUrl);
            WebSocketManager.ws.addOnopenListener(scriptName, () => {
                WebSocketManager.sendMessage('EnterRoom', { roomId: self.roomId });
            });
            WebSocketManager.ws.addOnmessageListener(scriptName, (evt, commandName, result) => {
                if (commandName === false) {
                    cc.log(['WebSocketManager.ws.addOnmessageListener', '数据解析失败']);
                    return;
                }
                self[`on${commandName}Message`](result);
            });
            WebSocketManager.ws.addOnerrorListener(scriptName, () => {

            });
            WebSocketManager.ws.addOncloseListener(scriptName, () => {

            });

            this.roomInfo[1].string = `房间号: ${this.roomId}`;
        }

        this.emojiNode = cc.Node;
        this.fastChatShowTime = +new Date();

        this.fastChatPanelPosition = this.fastChatPanel.position;
        this.menuPanelPosition = this.menuPanel.position;

        this.audio = Tools.audioEngine.init();

        this.userInfo = Tools.getLocalData(Global.localStorageKey.userInfo);
        this.playerInfoList[0].getChildByName('text_nick').getComponent(cc.Label).string = this.userInfo.nickname;
        Tools.setWebImage(this.playerInfoList[0].getChildByName('img_handNode').getComponent(cc.Sprite), this.userInfo.headimgurl);
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

        this.roomInfoData = data;
        this.roomInfoData.kwargs = JSON.parse(this.roomInfoData.kwargs);

        // 游戏玩法
        const _gameInfo = Global.playerTypes[this.roomInfoData.kwargs.game_uuid];
        let gameInfo = '玩法: ';
        for (const k in this.roomInfoData.kwargs.play_type) {
            if (this.roomInfoData.kwargs.play_type[k] === 1) {
                gameInfo += `${_gameInfo.play_type[k]},`;
            }
        }
        gameInfo = `${gameInfo.substr(0, gameInfo.length - 1)}\n可选: `;

        for (const k in this.roomInfoData.kwargs.options) {
            if (this.roomInfoData.kwargs.options[k] === 1) {
                gameInfo += `${_gameInfo.options[k]},`;
            }
        }
        gameInfo = gameInfo.substr(0, gameInfo.length - 1);

        this.roomInfo[1].string = `房间号: ${this.roomInfoData.roomId}`;
        this.roomInfo[2].string = `局数: ${this.roomInfoData.restCards}`;
        this.roomInfo[3].string = `剩余牌数: ${this.roomInfoData.restCards}`;
        this.roomInfo[4].string = gameInfo;

        this.thisPlayerSeat = '';

        for (let i = 0; i < this.roomInfoData.playerList.length; i += 1) {
            if (this.roomInfoData.playerList[i].playerUuid === this.userInfo.playerUuid) {
                this.thisPlayerSeat = this.roomInfoData.playerList[i].seat;
            }
        }

        for (let i = 0; i < this.roomInfoData.playerList.length; i += 1) {
            const seat = this._computeSeat(this.roomInfoData.playerList[i].seat);
            this.roomInfoData.playerList[i].info = JSON.parse(this.roomInfoData.playerList[i].info);

            this.playerInfoList[seat].getChildByName('text_nick').getComponent(cc.Label).string = this.roomInfoData.playerList[i].info.nickname;
            this.playerInfoList[seat].getChildByName('text_result').getComponent(cc.Label).string = this.roomInfoData.playerList[i].totalScore;
            Tools.setWebImage(this.playerInfoList[seat].getChildByName('img_handNode').getComponent(cc.Sprite), this.roomInfoData.playerList[i].info.headimgurl);

            // 设置房主
            if (this.roomInfoData.playerList[i].playerUuid === this.userInfo.playerUuid) {
                this.playerInfoList[seat].getChildByName('img_hostmark').active = true;
            }

            // 是否在线
            this.playerInfoList[seat].getChildByName('img_offline').active = this.roomInfoData.playerList[i].isOnline === 0;

            if (seat !== 0) {
                this.inviteButtonList[seat].active = false;
                this.playerInfoList[seat].active = true;
            }
        }
    },

    onEnterRoomOtherMessage(data) {
        if (data.code !== 1) {
            return;
        }

        data.info = JSON.parse(data.info);
        this.roomInfoData.playerInfoList.push(data);

        const seat = this._computeSeat(data.seat);
        this.playerInfoList[seat].getChildByName('text_nick').getComponent(cc.Label).string = data.info.nickname;
        this.playerInfoList[seat].getChildByName('text_result').getComponent(cc.Label).string = data.totalScore;
        Tools.setWebImage(this.playerInfoList[seat].getChildByName('img_handNode').getComponent(cc.Sprite), data.info.headimgurl);

        // 设置房主
        if (data.playerUuid === this.userInfo.playerUuid) {
            this.playerInfoList[seat].getChildByName('img_hostmark').active = true;
        }

        this.inviteButtonList[seat].active = false;
        this.playerInfoList[seat].active = true;
    },

    onExitRoomMessage(data) {
        if (data.code !== 1) {
            return;
        }

        for (let i; i < this.roomInfoData.playerInfoList.length; i += 1) {
            if (this.roomInfoData.playerInfoList[i].playerUuid === data.playerUuid) {
                const seat = this._computeSeat(this.roomInfoData.playerInfoList[i].seat);

                this.inviteButtonList[seat].active = true;
                this.playerInfoList[seat].active = false;

                cc.js.array.removeAt(this.roomInfoData.playerInfoList, i);
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
        for (let i; i < this.roomInfoData.playerInfoList.length; i += 1) {
            if (this.roomInfoData.playerInfoList[i].playerUuid === data.sponsor) {
                this.voteSponsor.string = this.roomInfoData.playerInfoList[i].nickname;
            }

            this._votePlayers.push(this.roomInfoData.playerInfoList[i]);
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
        if (data.code !== 1) {
            return;
        }

        for (let i = 0; i < this.roomInfoData.playerInfoList.length; i += 1) {
            if (this.roomInfoData.playerInfoList[i].playerUuid === data.playerUuid) {
                const seat = this._computeSeat(this.roomInfoData.playerInfoList[i].seat);
                this.playerInfoList[seat].getChildByName('img_offline').active = false;

                break;
            }
        }
    },

    onSpeakerMessage(data) {
        if (data.code !== 1) {
            return;
        }

        data.content = JSON.parse(data.content);

        for (let i = 0; i < this.roomInfoData.playerInfoList.length; i += 1) {
            if (this.roomInfoData.playerInfoList[i].playerUuid === data.playerUuid) {
                const seat = this._computeSeat(this.roomInfoData.playerInfoList[i].seat);
                const self = this;

                // 评论
                if (data.content.type === 1) {
                    this.audio.setAudioRaw(Global.audioResourcesUrl.fastChat[`fw_${this.roomInfoData.playerInfoList[i].sex === 1 ? 'male' : 'female'}_${data.content.data}`]).play();

                    const text = Tools.findNode(this.fastChatPanel, `fastChatView1>fastViewItem${data.content.data}>Label`).getComponent(cc.Label).string;
                    this.chatList[seat].getChildByName('txtMsg').getComponent(cc.Label).string = text;

                    self.chatList[seat].active = true;
                    this.scheduleOnce(() => {
                        self.chatList[seat].active = false;
                    }, 3);
                }
                // 表情
                else if (data.content.type === 2) {
                    Tools.loadPrefab(`emoji/emotion${data.content.data}`, (prefab) => {
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

        for (let i = 0; i < this.roomInfoData.playerInfoList.length; i += 1) {
            if (this.roomInfoData.playerInfoList[i].playerUuid === data.playerUuid) {
                const seat = this._computeSeat(this.roomInfoData.playerInfoList[i].seat);
                this.playerInfoList[seat].getChildByName('img_offline').active = false;

                break;
            }
        }
    },

    onDealMessage(data) {
        if (data.code !== 1) {
            return;
        }

        const self = this;
        let i = -1;
        this.schedule(() => {
            const obj = data.cardsInHandList[i += 1];
            self._appendCardToHandCardDistrict(0, obj.card);
            self._appendCardToHandCardDistrict(1);
            self._appendCardToHandCardDistrict(2);
            self._appendCardToHandCardDistrict(3);
        }, 500, data.cardsInHandList.length);
    },

    onDrawMessage(data) {
        if (data.code !== 1) {
            return;
        }

        if (data.playerUuid === this.userInfo.playerUuid) {
            const node = cc.instantiate(this.handCardPrefabs[0]);
            node.setPositionX(24);

            const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            Tools.loadRes(`card_pin.plist/value_${data.card.card}`, cc.SpriteFrame, (spriteFrame) => {
                nodeSprite.spriteFrame = spriteFrame;
            });

            this.handCardDistrict[0].addChild(node);
        }
    },

    onDiscardMessage(data) {
        if (data.code !== 1) {
            return;
        }

        for (let i = 0; i < this.roomInfoData.playerList.length; i += 1) {
            if (data.roomInfoData.playerList[i].playerUuid === data.playerUuid) {
                const seat = this._computeSeat(this.roomInfoData.playerList[i].seat);
                const node = cc.instantiate(this.dirtyCardPrefabs[seat]);

                const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                Tools.loadRes(`card_pin.plist/value_${data.card.card}`, cc.SpriteFrame, (spriteFrame) => {
                    nodeSprite.spriteFrame = spriteFrame;
                });

                this.dirtyCardDistrict[seat].addChild(node);
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
            Tools.loadRes(`card_pin.plist/value_${obj.card}`, cc.SpriteFrame, (spriteFrame) => {
                nodeSprite.spriteFrame = spriteFrame;
            });

            this.handCardDistrict[0].addChild(node);
        }
    },

    /**
     *******************************************************************************************************************
     *                                       px258 socket on message
     *******************************************************************************************************************
     **/

    onReconnectMessage(data) {
        if (data.code !== 1) {
            return;
        }
    },

    onPromptMessage(data) {
        if (data.code !== 1) {
            return;
        }
    },

    onActionMessage(data) {
        if (data.code !== 1) {
            return;
        }
    },

    onReadyHandMessage(data) {
        if (data.code !== 1) {
            return;
        }
    },

    onSettleForRoundMessage(data) {
        if (data.code !== 1) {
            return;
        }
    },

    onSettleForRoomMessage(data) {
        if (data.code !== 1) {
            return;
        }
    },

    /**
     *******************************************************************************************************************
     *                                       button on click
     *******************************************************************************************************************
     **/

    /**
     * 微信邀请
     */
    wechatInviteOnClick() {
        Tools.captureScreen(this.node, (filePath) => {
            cc.log(filePath);
        });
    },

    openFastChatPanelOnClick() {
        cc.log([this.fastChatProgressBar.progress, this.fastChatPanel.position.x, this.fastChatPanelPosition.x]);
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
        if (this.voiceProgressBar.progress <= 0) {
            this.voiceProgressBar.progress = 1.0;
            cc.log('voiceOnClick');
        }
    },

    openMenuOnClick() {
        cc.log([parseInt(this.menuPanel.position.x.toFixed(0), 10), this.menuPanelPosition.x]);
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
    },

    switchFastChatPanelOnClick(evt, data) {
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
        const content = JSON.stringify({ type: 1, data });
        WebSocketManager.sendMessage('Speaker', { content });

        this.fastChatProgressBar.progress = 1.0;
        this.audio.setAudioRaw(Global.audioResourcesUrl.fastChat[`fw_male_${data}`]).play();

        Animation.closePanel(this.fastChatPanel);
    },

    emojiChatOnClick(evt, data) {
        const content = JSON.stringify({ type: 2, data });
        WebSocketManager.sendMessage('Speaker', { content });

        this.fastChatProgressBar.progress = 1.0;
        this.fastChatShowTime = +new Date();
        const self = this;

        Tools.loadPrefab(`emoji/emotion${data}`, (prefab) => {
            const node = cc.instantiate(prefab);
            self.emojiNode = node;
            self.node.addChild(node);
            node.getComponent(cc.Animation).play(`emotion${data}`);
        });

        Animation.closePanel(this.fastChatPanel);
    },

    actionOnClick(event, data) {
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
        if (this.handCardIsSelected === data) {
            event.target.parent.destroy();
            const node = cc.instantiate(this.dirtyCardPrefabs[0]);
            const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            Tools.loadRes(`card_pin.plist/value_${data}`, cc.SpriteFrame, (spriteFrame) => {
                nodeSprite.spriteFrame = spriteFrame;
            });
            // const backgroundNode = node.getChildByName('background');
            this.dirtyCardDistrict[0].addChild(node);

            WebSocketManager.sendMessage('Discard', { card: data });

            return;
        }

        this.handCardIsSelected = data;

        this._resetHandCardPosition();
        event.target.setPositionY(24);

        cc.log(event.target.parent.getChildByName('UserData').string);
    },

    /**
     * 声音选项
     */
    openSoundPanelOnClick() {
        Global.openDialog(cc.instantiate(this.soundPrefab), this.node, () => {
            cc.log('load success');
        });
    },

    dismissOnClick() {
        WebSocketManager.sendMessage('DismissRoom', {});
    },

    voteConfirmOnClick() {

        this.dismissButton[0].active = false;
        this.dismissButton[1].active = false;
    },

    voteDisagreeOnClick() {

        this.dismissButton[0].active = false;
        this.dismissButton[1].active = false;
    },

    closeOnClick() {
        WebSocketManager.sendMessage('ExitRoom', { roomId: this.roomId });
        cc.director.loadScene('Lobby');
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
        const node = cc.instantiate(this.handCardPrefabs[player]);
        if (player === 0) {
            const clickEventHandler = Tools.createEventHandler(this.node, 'GameRoomScene', 'selectedHandCardOnClick', data);
            node.getChildByName('Background').getComponent(cc.Button).clickEvents.push(clickEventHandler);
            const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            Tools.loadRes(`card_pin.plist/value_${data}`, cc.SpriteFrame, (spriteFrame) => {
                nodeSprite.spriteFrame = spriteFrame;
            });
            // node.getChildByName('UserData').string = 'xxxxxx';
        }

        this.handCardDistrict[player].addChild(node);
    },

    /**
     * 碰, 吃, 杠, 区域
     *
     * @param player
     * @param data
     * @private
     */
    _appendCardToPongKongChowDistrict(player, data) {
        const index = player % 2;
        let node = cc.Node;
        if (data.type === 'gang') {
            node = cc.instantiate(this.concealedKongPrefab[index]);
            // todo: 数据组装
        }
        this.pongKongChowDistrict[player].addChild(node);
    },

    _resetHandCardPosition() {
        for (let i = 0; i < this.handCardDistrict[0].childrenCount; i += 1) {
            this.handCardDistrict[0].children[i].getChildByName('background').setPositionY(0);
        }
    },

    _computeSeat(playerSeat) {
        const desplaySeat = playerSeat - this.thisPlayerSeat;
        return (desplaySeat < 0 ? desplaySeat + 4 : desplaySeat);
    }

});
