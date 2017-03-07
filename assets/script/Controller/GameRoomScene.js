cc.Class({
    extends: cc.Component,

    properties: {
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
        if (Global.tempCache) {
            this.wsUrl = `ws://${Global.tempCache.getServerIp()}:${Global.tempCache.getServerPort()}/ws`;
            this.roomId = Global.tempCache.getRoomId();
            const self = this;
            const scriptName = 'GameRoomScene';

            WebSocketManager.ws.openSocket(this.wsUrl);
            WebSocketManager.ws.addOnopenListener(scriptName, (evt) => {
                WebSocketManager.sendMessage('EnterRoom', { roomId: self.roomId });
            });
            WebSocketManager.ws.addOnmessageListener(scriptName, (evt, commandName, result) => {
                self[`on${commandName}Message`](result);
            });
            WebSocketManager.ws.addOnerrorListener(scriptName, (evt) => {

            });
            WebSocketManager.ws.addOncloseListener(scriptName, (evt) => {

            });
        }

        this.emojiNode = cc.Node;
        this.fastChatShowTime = +new Date();

        this.fastChatPanelPosition = this.fastChatPanel.position;
        this.menuPanelPosition = this.menuPanel.position;

        this.audio = Tools.audioEngine.init();
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
        if (data.getCode() === 1) {
            let kwargs = JSON.parse(data.getKwargs());
            let restCards = data.getRestCards();
            let playerList = data.getPlayerList();
            for (let i = 0; i < playerList.length; i += 1) {
                cc.log(playerList[i].getPlayerUuid());
            }
        }
    },

    onExitRoomMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onDismissRoomMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onSponsorVoteMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onPlayerVoteMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onOnlineStatusMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onSpeakerMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onReadyMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onDealMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onDrawMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onDiscardMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onSynchroniseCardsMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    /**
     *******************************************************************************************************************
     *                                       px258 socket on message
     *******************************************************************************************************************
     **/

    onReconnectMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onPromptMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onActionMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onReadyHandMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onSettleForRoundMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    onSettleForRoomMessage(data) {
        if (data.getCode() !== 1) {
            return;
        }
    },

    /**
     *******************************************************************************************************************
     *                                       button on click
     *******************************************************************************************************************
     **/

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
        this.fastChatProgressBar.progress = 1.0;
        this.audio.setAudioRaw(Global.audioResourcesUrl.fastChat[`fw_male_${data}`]).play();

        Animation.closePanel(this.fastChatPanel);
    },

    emojiChatOnClick(evt, data) {
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

    selectedHandCardOnClick(event, data) {
        if (this.handCardIsSelected === data) {
            event.target.parent.destroy();
            const node = cc.instantiate(this.dirtyCardPrefabs[0]);
            // const backgroundNode = node.getChildByName('background');
            this.dirtyCardDistrict[0].addChild(node);
            return;
        }

        this.handCardIsSelected = data;

        this._resetHandCardPosition();
        event.target.setPositionY(24);

        cc.log(event.target.parent.getChildByName('UserData').string);
    },

    closeOnClick() {
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

    _appendCardToHandCardDistrict(player, data) {
        for (let i = 0; i < data.length; i += 1) {
            const node = cc.instantiate(this.handCardPrefabs[player]);
            if (player === 0) {
                const backgroundNode = node.getChildByName('background');
                const clickEventHandler = Tools.createEventHandler(this.node, 'GameRoomScene', 'selectedHandCardOnClick', i);
                backgroundNode.getComponent(cc.Button).clickEvents.push(clickEventHandler);
                // todo: 数据组装
            }
            node.getChildByName('UserData').string = 'xxxxxx';

            this.handCardDistrict[player].addChild(node);

            // if (player === 0 && i === 0) {
            //     backgroundNode.setPositionX(24);
            // }
        }
    },

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

});
