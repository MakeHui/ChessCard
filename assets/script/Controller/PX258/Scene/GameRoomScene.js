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

        makeSeat: [cc.Node], // 当前出牌的人前面的标识
        makeSeatPanel: cc.Node,

        tingCardDistrict: cc.Node, // 听牌提示

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
        pongPrefab: [cc.Prefab], // 碰
        ChowPrefab: [cc.Prefab], // 吃
        exposedPrefab: [cc.Prefab], // 明杠
        concealedKongPrefab: [cc.Prefab], // 暗杠

        playerInfoList: [cc.Node],
        inviteButtonList: [cc.Node],
        chatList: [cc.Node],
        roomInfo: [cc.Label],

        // 动作相关
        actionPanel: [cc.Node],
        actionSprite: [cc.Node],
        selectChiPanel: cc.Node,
        selectKongPanel: cc.Node,
        chiKongButtonPrefab: [cc.Prefab],
        actionSpriteFrame: [cc.SpriteFrame],

        waitPanel: cc.Node,
        fastChatPanel: cc.Node,
        menuPanel: cc.Node,
        fastChatProgressBar: cc.ProgressBar,
        voiceButton: cc.Node,
        voiceProgressBar: cc.ProgressBar,
        wechatInviteButton: cc.Button,

        dicePrefab: cc.Prefab,

        zhuaniaoNode: cc.Node,

        chupaidrag: cc.Node,
    },

    onLoad() {
        this._Cache = {};
        this._Cache.gameUuid = ''; // 游戏uuid
        this._Cache.roomId = ''; // 房间号
        this._Cache.ownerUuid = ''; // 房主uuid
        this._Cache.playerList = []; // 玩家信息列表
        this._Cache.thisPlayerSeat = 0; // 当前玩家实际座位号
        this._Cache.thisDealerSeat = 0; // 当前庄家相对座位号
        this._Cache.activeCardFlag = null; // 最后出的那张牌上面的标识
        this._Cache.activeCard = null; // 当前最后出的那张牌
        this._Cache.waitDraw = false; // 是否等待抓拍, 客户端逻辑
        this._Cache.allowOutCard = false; // 是否允许出牌
        this._Cache.settleForRoomData = null; // 大结算数据
        this._Cache.currentRound = 0; // 局数
        this._Cache.config = {}; // 房间信息

        if (window.Global.Config.tempCache) {
            const self = this;
            this._Cache.roomId = window.Global.Config.tempCache.roomId;
            this.wsUrl = `ws://${window.Global.Config.tempCache.serverIp}:${window.Global.Config.tempCache.serverPort}/ws`;

            window.Global.NetworkManager.onopen = () => {
                self._hideWaitPanel();
                window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.EnterRoom, { roomId: self._Cache.roomId });
                window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.Ready);

                this.unschedule(this.wsHbtSchedule);
                this.schedule(this.wsHbtSchedule, window.Global.Config.debug ? window.Global.Config.development.wsHbtTime : window.Global.Config.production.wsHbtTime);
            };
            window.Global.NetworkManager.onclose = () => {
                this.unschedule(this.wsHbtSchedule);
                self._showWaitPanel(2);
            };
            window.Global.NetworkManager.onmessage = (commandName, result) => {
                self[`on${commandName}Message`](result);
            };
            window.Global.NetworkManager.openSocketLink(this.wsUrl);

            this.roomInfo[1].string = `房间号: ${this._Cache.roomId}`;
        }

        this._userInfo = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);
        this.playerInfoList[0].getChildByName('text_nick').getComponent(cc.Label).string = this._userInfo.nickname;
        window.Global.Tools.setWebImage(this.playerInfoList[0].getChildByName('mask').getChildByName('img_handNode').getComponent(cc.Sprite), this._userInfo.headimgurl);

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

        // 没有安装微信, 不显示分享按钮
        if (!window.Global.NativeExtensionManager.execute('wechatIsWxAppInstalled')) {
            for (var i = 0; i < this.inviteButtonList.length; i += 1) {
                this.inviteButtonList[i].active = false;
            }
        }
    },

    update(dt) {
        this.roomInfo[0].string = window.Global.Tools.formatDatetime('hh:ii:ss');

        if (this.fastChatProgressBar.progress <= 1.0 && this.fastChatProgressBar.progress >= 0) {
            this.fastChatProgressBar.progress -= dt * window.Global.Config.fastChatWaitTime;
        }
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

    onExitRoomMessage(data) {
        if (data.playerUuid == this._userInfo.playerUuid) {
            window.Global.NetworkManager.close();
            cc.director.loadScene('Lobby');
            return;
        }

        const playerIndex = this._getPlayerIndexBySeat(this._getSeatForPlayerUuid(data.playerUuid));
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

    onSponsorVoteMessage(data) {
        this._initVotePanel(data);
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

    onOnlineStatusMessage(data) {
        const playerIndex = this._getPlayerIndexBySeat(this._getSeatForPlayerUuid(data.playerUuid));
        this.playerInfoList[playerIndex].getChildByName('mask').getChildByName('img_offline').active = !data.status;
        if (this._Cache.playerList.length === 4) {
            if (data.status) {
                this._hideWaitPanel();
            } else {
                this._showWaitPanel(1);
            }
        }
    },

    onSpeakerMessage(data) {
        data.content = JSON.parse(data.content);

        // 语音
        if (data.content.type === 3 && this._userInfo.playerUuid !== data.playerUuid) {
            if (cc.sys.os === cc.sys.OS_IOS) {
                var filePath = data.content.data.replace(window.Global.Config.aliyunOss.domain, '');
                window.Global.NativeExtensionManager.execute('ossDownload', [window.Global.Config.aliyunOss.bucketName, filePath], (result) => {
                    if (result.result == 0) {
                        window.Global.NativeExtensionManager.execute('playerAudio', [result.data]);
                    }
                });
            } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                window.Global.NativeExtensionManager.execute('playerAudio', [data.content.data]);
            }
            return;
        }

        for (let i = 0; i < this._Cache.playerList.length; i += 1) {
            if (this._Cache.playerList[i].playerUuid === data.playerUuid) {
                const playerIndex = this._getPlayerIndexBySeat(this._Cache.playerList[i].seat);
                const self = this;

                // 评论
                if (data.content.type === 1) {
                    window.Global.SoundEffect.playEffect(window.PX258.Config.audioUrl.fastChat[`fw_${this._Cache.playerList[i].info.sex === 1 ? 'male' : 'female'}_${data.content.data}`]);
                    const text = window.Global.Tools.findNode(this.fastChatPanel, `fastChatView1>content>fastViewItem${data.content.data}>Label`).getComponent(cc.Label).string;
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
                    } else if (playerIndex === 1) {
                        node.setPosition(162, 0);
                        node.rotation = 270;
                    } else if (playerIndex === 2) {
                        node.setPosition(0, 126);
                        node.rotation = 180;
                    } else if (playerIndex === 3) {
                        node.setPosition(-162, 0);
                        node.rotation = 90;
                    }

                    this.node.addChild(node);
                    this.scheduleOnce(() => {
                        node.destroy();
                    }, 3);
                }
                break;
            }
        }
    },

    onReadyMessage(data) {
        const playerIndex = this._getPlayerIndexBySeat(this._getSeatForPlayerUuid(data.playerUuid));
        this.playerInfoList[playerIndex].getChildByName('mask').getChildByName('img_offline').active = false;
    },

    onDealMessage(data) {
        this._Cache.waitDraw = true;

        this._initCardDistrict();

        // 筛子动画
        this.showDice(data.dice);

        // 移动三号位的玩家头像到右边, 避免被挡住
        this.playerInfoList[2].setPositionX(-134);

        // 庄家
        this._Cache.thisDealerSeat = this._getPlayerIndexBySeat(this._getSeatForPlayerUuid(data.dealerUuid));
        this.playerInfoList[this._Cache.thisDealerSeat].getChildByName('img_zhuang').active = true;

        // 初始化手牌
        var i = data.cardsInHandList.length - 1;
        this.schedule(() => {
            window.Global.SoundEffect.playEffect(window.PX258.Config.audioUrl.effect.dealCard);
            this._appendCardToHandCardDistrict(0, data.cardsInHandList[i].card);
            this._appendCardToHandCardDistrict(1, 0);
            this._appendCardToHandCardDistrict(2, 0);
            this._appendCardToHandCardDistrict(3, 0);
            i -= 1;
            if (i === -1) {
                window.Global.Tools.cardsSort(this.handCardDistrict[0].children);
                this._Cache.waitDraw = false;
            }
        }, 0.2, data.cardsInHandList.length - 1);

        this._initLight();
    },

    onDrawMessage(data) {
        window.Global.SoundEffect.playEffect(window.PX258.Config.audioUrl.effect.dealCard);
        this.countDownAnimation.play();

        // 抓拍后剩余牌数减一
        this.roomInfo[3].string = `剩余牌数: ${data.restCards}`;

        const playerSeat = this._getSeatForPlayerUuid(data.playerUuid);
        const playerIndex = this._getPlayerIndexBySeat(playerSeat);
        this._openLight(playerSeat);

        const self = this;
        this.scheduleOnce(() => {
            // 如果抓拍的人是自己才对数据进行处理
            if (playerIndex === 0) {        
                if (data.card.card === 0) {
                    return;
                }

                var clickEventHandler = window.Global.Tools.createEventHandler(self.node, 'GameRoomScene', 'selectedHandCardOnClick', data.card.card);
                self.getHandcard[playerIndex].getChildByName('GetHandCard').getComponent(cc.Button).clickEvents[0] = clickEventHandler;
                self.getHandcard[playerIndex]._userData = data.card.card;
                var nodeSprite = window.Global.Tools.findNode(self.getHandcard[playerIndex], 'GetHandCard>value').getComponent(cc.Sprite);
                nodeSprite.spriteFrame = self.cardPinList.getSpriteFrame(`value_0x${data.card.card.toString(16)}`);

                if (this._Cache.gameUuid == window.PX258.Config.gameUuid[1]) {
                    window.Global.Tools.findNode(self.getHandcard[playerIndex], 'GetHandCard>laizhi').active = `0x${data.card.card.toString(16)}` == 0x51;
                }

                self._initDragStuffs(self.getHandcard[playerIndex]);

                self._Cache.allowOutCard = true;
            }

            self.getHandcard[playerIndex].active = true;

            // 是否有操作提示
            if (playerIndex == 0) {
                self.onPromptMessage({ promptList: data.promptList });
            }
        }, this._Cache.waitDraw ? 3 : 0);
    },

    onDiscardMessage(data) {
        const playerIndex = this._getPlayerIndexBySeat(this._getSeatForPlayerUuid(data.playerUuid));
        this._Cache.activeCard = this._appendCardToDiscardDistrict(playerIndex, [{ card: data.card.card }]);
        this._createActiveCardFlag(playerIndex);
        this.getHandcard[playerIndex].active = false;

        // 是否有操作提示
        this.onPromptMessage({ promptList: data.promptList });

        window.Global.SoundEffect.playEffect(window.PX258.Config.audioUrl.common[this._userInfo.sex === 1 ? 'man' : 'woman'][data.card.card]);
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
            const nodeSprite = window.Global.Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj.card.toString(16)}`);

            this.handCardDistrict[0].addChild(node);
        }
    },

    onHeartBeatMessage(data) {
        cc.log(data);
    },

    onSynchroniseScoreMessage(data) {
        if (data.scoreDataList.length == 0) {
            return;
        }

        for (var i = 0; i < data.scoreDataList.length; i += 1) {
            var obj = data.scoreDataList[i];
            var playerIndex = this._getPlayerIndexBySeat(obj.seat);
            this.playerInfoList[playerIndex].getChildByName('text_result').getComponent(cc.Label).string = obj.score;
        }
    },

    /**
     *******************************************************************************************************************
     *                                       px258 socket on message
     *******************************************************************************************************************
     **/

    onReconnectMessage(data) {
        // 起手抓拍还没有结束, 不允许重连
        if (this._Cache.waitDraw) {
            return;
        }
        data.kwargs = JSON.parse(data.kwargs);
        this._Cache.gameUuid = data.kwargs.game_uuid;
        this._Cache.roomId = data.roomId;
        this._Cache.ownerUuid = data.ownerUuid;
        this._Cache.currentRound = data.currentRound;
        this._Cache.waitDraw = false;
        this._Cache.config = data.kwargs;

        this._initScene();

        if (data.playerList.length === 4) {
            for (var i = 0; i < 4; i += 1) {
                this._hideInviteButton(i);
            }
            this.playerInfoList[2].setPositionX(-134); // 移动三号位的玩家头像到右边, 避免被挡住
        }

        // 初始化房间信息
        this._setRoomInfo(data.kwargs, data.currentRound, data.restCards);

        // 设置当前玩家的座位号
        this._setThisPlayerSeat(data.playerList);

        // 初始化玩家信息
        for (var i = 0; i < data.playerList.length; i += 1) {
            const obj = data.playerList[i];
            obj.info = JSON.parse(obj.info);
            const playerIndex = this._getPlayerIndexBySeat(obj.seat);
            this._setPlayerInfoList(playerIndex, obj.info, obj.totalScore);

            // 设置房主
            if (obj.playerUuid === data.ownerUuid) {
                this.playerInfoList[playerIndex].getChildByName('img_hostmark').active = true;
            }

            // 是否在线
            if (this._userInfo.playerUuid !== obj.playerUuid) {
                this.playerInfoList[playerIndex].getChildByName('mask').getChildByName('img_offline').active = obj.isOnline === 0;
            }

            // 初始化手牌
            for (var j = obj.cardsInHandList.length - 1; j >= 0; j -= 1) {
                this._appendCardToHandCardDistrict(playerIndex, obj.cardsInHandList[j].card);
            }
            if (playerIndex == 0) {
                window.Global.Tools.cardsSort(this.handCardDistrict[0].children);
            }

            // 初始化打出去的牌
            this._appendCardToDiscardDistrict(playerIndex, obj.cardsDiscardList);

            for (var j = 0; j < obj.cardsGroupListList.length; j += 1) {
                var obj1 = obj.cardsGroupListList[j];
                var triggerIndex = this._getPlayerIndexBySeat(obj1.triggerSeat);
                if (obj1.type == 'chow') {
                    this._appendChowToDistrict(playerIndex, obj1.cardList);
                } else if (obj1.type == 'pong') {
                    this._appendPongToDistrict(playerIndex, triggerIndex, obj1.cardList);
                } else if (obj1.type == 'discard_exposed_kong' || obj1.type == 'draw_exposed_kong') {
                    this._appendExposedToDistrict(playerIndex, triggerIndex, obj1.cardList);
                } else if (obj1.type == 'draw_concealed_kong') {
                    this._appendConcealedKongToDistrict(playerIndex, obj1.cardList);
                }
            }
        }

        // 庄家
        this._Cache.thisDealerSeat = this._getPlayerIndexBySeat(data.dealer);
        this.playerInfoList[this._Cache.thisDealerSeat].getChildByName('img_zhuang').active = true;

        this._Cache.playerList = data.playerList;

        this._initLight();

        // 当前活动玩家座位号, 打出去的牌上面的小标识
        if (data.discardSeat !== -1) {
            const discardSeatIndex = this._getPlayerIndexBySeat(data.discardSeat);
            this._createActiveCardFlag(discardSeatIndex);
            this._Cache.activeCard = this.dirtyCardDistrict[discardSeatIndex].children[this.dirtyCardDistrict[discardSeatIndex].childrenCount - 1];
        }

        // 当前出牌玩家
        if (data.activeSeat !== -1) {
            this._openLight(data.activeSeat);
        }
    },

    onPromptMessage(data) {
        if (data.promptList.length == 0) {
            return;
        }

        var hasOutCard = 'pass';
        if (this._Cache.allowOutCard) {
            hasOutCard += '_true';
        } else {
            hasOutCard += '_false';
        }

        this._Cache.allowOutCard = false;
        this._initReadyHand();
        this._hideActionPrompt();
        this.countDownAnimation.play();

        let promptType = [];
        for (let i = 0; i < data.promptList.length; i += 1) {
            promptType.push(data.promptList[i].prompt);
        }
        promptType = window.Global.Tools.unique(promptType);

        if (promptType.length > 0) {
            clickEventHandler = window.Global.Tools.createEventHandler(this.node, 'GameRoomScene', 'actionOnClick', hasOutCard);
            this.actionPanel[0].getComponent(cc.Button).clickEvents[0] = clickEventHandler;
            this.actionPanel[0].active = true;
        }

        for (let i = 0; i < promptType.length; i += 1) {
            let actionPanelIndex = 0;
            if (promptType[i] === window.PX258.Config.promptType.Chow) {
                actionPanelIndex = 1;
            }
            else if (promptType[i] === window.PX258.Config.promptType.Pong) {
                actionPanelIndex = 2;
            }
            else if ([window.PX258.Config.promptType.KongConcealed, window.PX258.Config.promptType.kongExposed, window.PX258.Config.promptType.KongPong].indexOf(promptType[i]) !== -1) {
                actionPanelIndex = 3;
            }
            else if (promptType[i] === window.PX258.Config.promptType.WinDiscard || promptType[i] === window.PX258.Config.promptType.WinDraw) {
                actionPanelIndex = 4;
            }

            // 计算出需要显示的同类型提示
            var promptList = [];
            for (var j = 0; j < data.promptList.length; j += 1) {
                if (data.promptList[j].prompt == promptType[i]) {
                    promptList.push(data.promptList[j]);
                }
            }

            var actionId;
            if (promptList.length > 1) {
                if (promptType[i] === window.PX258.Config.promptType.Chow) {
                    for (var j = 0; j < promptList.length; j += 1) {
                        var obj = promptList[j];
                        obj.refCardList.push(obj.opCard);
                        obj.refCardList.sort(function(a, b) {
                            return a.card - b.card;
                        });

                        var node = cc.instantiate(this.chiKongButtonPrefab[0]);
                        for (var k = 0; k < node.children.length; k += 1) {
                            var obj1 = node.children[k];
                            var nodeSprite = obj1.getChildByName('value').getComponent(cc.Sprite);
                            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj.refCardList[k].card.toString(16)}`);
                        }

                        const clickEventHandler = window.Global.Tools.createEventHandler(this.node, 'GameRoomScene', 'actionOnClick', promptList[i].actionId);
                        node.getComponent(cc.Button).clickEvents[0] = clickEventHandler;

                        this.selectChiPanel.addChild(node);
                    }

                    var passButton = cc.instantiate(this.chiKongButtonPrefab[2]);
                    const clickEventHandler = window.Global.Tools.createEventHandler(this.node, 'GameRoomScene', 'actionOnClick', hasOutCard);
                    passButton.getComponent(cc.Button).clickEvents[0] = clickEventHandler;
                    this.selectChiPanel.addChild(passButton);

                    actionId = 'openSelectChi';
                } else if ([window.PX258.Config.promptType.KongConcealed, window.PX258.Config.promptType.kongExposed, window.PX258.Config.promptType.KongPong].indexOf(promptType[i]) !== -1) {
                    for (var j = 0; j < promptList.length; j += 1) {
                        var obj = promptList[j];

                        var node = cc.instantiate(this.chiKongButtonPrefab[1]);
                        for (var k = 0; k < node.children.length; k += 1) {
                            var obj1 = node.children[k];
                            var nodeSprite = obj1.getChildByName('value').getComponent(cc.Sprite);
                            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj.refCardList[0].card.toString(16)}`);
                        }

                        var clickEventHandler = window.Global.Tools.createEventHandler(this.node, 'GameRoomScene', 'actionOnClick', promptList[i].actionId);
                        node.getComponent(cc.Button).clickEvents[0] = clickEventHandler;

                        this.selectKongPanel.addChild(node);
                    }

                    var passButton = cc.instantiate(this.chiKongButtonPrefab[2]);
                    var clickEventHandler = window.Global.Tools.createEventHandler(this.node, 'GameRoomScene', 'actionOnClick', hasOutCard);
                    passButton.getComponent(cc.Button).clickEvents[0] = clickEventHandler;
                    this.selectKongPanel.addChild(passButton);

                    actionId = 'openSelectKong';
                }
            } else {
                actionId = promptList[0].actionId;
            }

            clickEventHandler = window.Global.Tools.createEventHandler(this.node, 'GameRoomScene', 'actionOnClick', actionId);
            this.actionPanel[actionPanelIndex].getComponent(cc.Button).clickEvents[0] = clickEventHandler;
            this.actionPanel[actionPanelIndex].active = true;
        }
    },

    onActionMessage(data) {
        this._hideActionPrompt();
        this.countDownAnimation.play();

        const playerSeat = this._getSeatForPlayerUuid(data.playerUuid);
        const playerIndex = this._getPlayerIndexBySeat(playerSeat);
        var triggerIndex = this._getPlayerIndexBySeat(data.triggerSeat);

        if (data.activeType === window.PX258.Config.promptType.Chow) {
            window.Global.SoundEffect.playEffect(window.PX258.Config.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].chow);

            // 删除需要删除的手牌
            for (let i = 0; i < data.refCardList.length; i += 1) {
                const obj = data.refCardList[i];
                this._deleteHandCardByCode(playerIndex, obj.card);
            }
            this._Cache.activeCard.destroy();

            data.refCardList.push(data.activeCard);
            data.refCardList.sort((a, b) => {
                return a - b;
            });
            this._appendChowToDistrict(playerIndex, data.refCardList);

            this.actionSprite[playerIndex].getComponent(cc.Sprite).spriteFrame = this.actionSpriteFrame[0];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();

            // 如果是当前玩家吃牌后即可再出一张牌
            if (data.playerUuid === this._userInfo.playerUuid) {
                this._Cache.allowOutCard = true;
            }
        } else if (data.activeType === window.PX258.Config.promptType.Pong) {
            window.Global.SoundEffect.playEffect(window.PX258.Config.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].pong);

            // 删除需要删除的手牌
            for (let i = 0; i < data.refCardList.length; i += 1) {
                const obj = data.refCardList[i];
                this._deleteHandCardByCode(playerIndex, obj.card);
            }
            this._Cache.activeCard.destroy();

            data.refCardList.push(data.activeCard);
            this._appendPongToDistrict(playerIndex, triggerIndex, data.refCardList);

            this.actionSprite[playerIndex].getComponent(cc.Sprite).spriteFrame = this.actionSpriteFrame[1];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();

            // 如果是当前玩家碰牌后即可再出一张牌
            if (data.playerUuid === this._userInfo.playerUuid) {
                this._Cache.allowOutCard = true;
            }
        } else if (data.activeType === window.PX258.Config.promptType.kongExposed) {
            window.Global.SoundEffect.playEffect(window.PX258.Config.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].kong);

            // 杠完后不能出牌
            if (data.playerUuid === this._userInfo.playerUuid) {
                this._Cache.allowOutCard = false;
            }

            // 删除需要删除的手牌
            for (let i = 0; i < data.refCardList.length; i += 1) {
                const obj = data.refCardList[i];
                this._deleteHandCardByCode(playerIndex, obj.card);
            }
            this._Cache.activeCard.destroy();

            data.refCardList.push(data.activeCard);
            this._appendExposedToDistrict(playerIndex, triggerIndex, data.refCardList);

            this.actionSprite[playerIndex].getComponent(cc.Sprite).spriteFrame = this.actionSpriteFrame[2];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        } else if (data.activeType === window.PX258.Config.promptType.KongConcealed) {
            window.Global.SoundEffect.playEffect(window.PX258.Config.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].ankong);

            // 杠完后不能出牌
            if (data.playerUuid === this._userInfo.playerUuid) {
                this._Cache.allowOutCard = false;
            }

            // 删除需要删除的手牌
            if (this.getHandcard[playerIndex].active) {
                var card = this.getHandcard[playerIndex]._userData;
                this._hideGetHandCard(playerIndex);
                this._appendCardToHandCardDistrict(playerIndex, card);
                if (playerIndex == 0) {
                    window.Global.Tools.cardsSort(this.handCardDistrict[0].children);
                }
            }
            for (var i = 0; i < 4; i += 1) {
                this._deleteHandCardByCode(playerIndex, data.refCardList[0].card);
            }

            this._appendConcealedKongToDistrict(playerIndex, data.refCardList);

            this.actionSprite[playerIndex].getComponent(cc.Sprite).spriteFrame = this.actionSpriteFrame[2];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        } else if (data.activeType === window.PX258.Config.promptType.KongPong) {
            window.Global.SoundEffect.playEffect(window.PX258.Config.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].kong);

            // 杠完后不能出牌
            if (data.playerUuid === this._userInfo.playerUuid) {
                this._Cache.allowOutCard = false;
            }

            // 删除需要删除的手牌
            if (this.getHandcard[playerIndex].active) {
                var card = this.getHandcard[playerIndex]._userData;
                this._hideGetHandCard(playerIndex);
                this._appendCardToHandCardDistrict(playerIndex, card);
                if (playerIndex == 0) {
                    window.Global.Tools.cardsSort(this.handCardDistrict[0].children);
                }
            }
            this._deleteHandCardByCode(playerIndex, data.refCardList[0].card);

            // 删除碰
            for (var i = 0; i < this.pongKongChowDistrict[playerIndex].childrenCount; i += 1) {
                const children = this.pongKongChowDistrict[playerIndex].children[i];
                if (children._userData && children._userData[0].card == data.refCardList[0].card) {
                    children.destroy();
                    break;
                }
            }

            // 添加杠
            this._appendExposedToDistrict(playerIndex, triggerIndex, data.refCardList);

            this.actionSprite[playerIndex].getComponent(cc.Sprite).spriteFrame = this.actionSpriteFrame[2];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        } else if (data.activeType === window.PX258.Config.promptType.WinDraw) {
            window.Global.SoundEffect.playEffect(window.PX258.Config.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].zimo);

            // todo: 胡牌动画, 更改为胡了之后显示该张牌
            this.actionSprite[playerIndex].getComponent(cc.Sprite).spriteFrame = this.actionSpriteFrame[3];
            // this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        } else if (data.activeType === window.PX258.Config.promptType.WinDiscard) {
            window.Global.SoundEffect.playEffect(window.PX258.Config.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].win);

            // todo: 胡牌动画, 更改为胡了之后显示该张牌
            this.actionSprite[playerIndex].getComponent(cc.Sprite).spriteFrame = this.actionSpriteFrame[3];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }

        // 是否有操作提示
        if (data.promptList) {
            this.onPromptMessage({ promptList: data.promptList });
        }

        this._openLight(playerSeat);
    },

    onReadyHandMessage(data) {
        if (this._actionIsShow()) {
            return;
        }

        this._initReadyHand();

        for (let i = 0; i < data.cardList.length; i += 1) {
            const node = cc.instantiate(this.dirtyCardPrefabs[0]);
            const nodeSprite = window.Global.Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data.cardList[i].card.toString(16)}`);
            this.tingCardDistrict.addChild(node);
        }

        this.tingCardDistrict.active = true;
    },

    onSettleForRoundMessage(data) {
        this._initCardDistrict();
        const self = this;
        const node = cc.instantiate(this.smallAccountPrefab);
        node.getComponent('SmallAccountScene').init({ data: data, playerInfoList: this._Cache.playerList, currentRound: this._Cache.currentRound, maxRounds: this._Cache.config.max_rounds });
        window.Global.Animation.openDialog(node, this.node, () => {
            for (let i = 0; i < 4; i += 1) {
                self.handCardDistrict[i].removeAllChildren();
                self.dirtyCardDistrict[i].removeAllChildren();
                self.pongKongChowDistrict[i].removeAllChildren();
            }

            this._initReadyHand();
            this._hideSelectChiKongPanel();
        });
    },

    onSettleForRoomMessage(data) {
        if (this.voteDismiss.active || this._Cache.settleForRoomData) {
            this.voteDismiss.active = false;
            window.Global.NetworkManager.close();
            var node = cc.instantiate(this.bigAccountPrefab);
            node.getComponent('BigAccount').init({ data, playerInfoList: this._Cache.playerList });
            window.Global.Animation.openDialog(node, this.node);
        } else {
            this._Cache.settleForRoomData = data;
        }
    },

    /**
     *******************************************************************************************************************
     *                                       转转麻将
     *******************************************************************************************************************
     */

    onDrawNiaoMessage(data) {
        if (data.niaoList.length === 0) {
            return;
        }

        var layoutNode = this.zhuaniaoNode.getChildByName('layout');

        for (let i = 0; i < data.niaoList.length; i += 1) {
            var card = `0x${data.niaoList[i].card.toString(16)}`;
            var node = cc.instantiate(this.handCardPrefabs[0]);
            var nodeSprite = window.Global.Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_${card}`);
            layoutNode.addChild(node);
        }
        this.zhuaniaoNode.active = true;

        this.scheduleOnce(() => {
            this.zhuaniaoNode.active = false;
        }, 1.5);
    },

    onSettleForRoundZZMessage(data) {
        this._initCardDistrict();
        const self = this;
        const node = cc.instantiate(this.smallAccountPrefab);
        node.getComponent('SmallAccountScene').init({ data: data, playerInfoList: this._Cache.playerList, currentRound: this._Cache.currentRound, maxRounds: this._Cache.config.max_rounds, isZhuaniao: this.zhuaniaoNode.getChildByName('title').children[0].active });
        window.Global.Animation.openDialog(node, this.node, () => {
            for (let i = 0; i < 4; i += 1) {
                self.handCardDistrict[i].removeAllChildren();
                self.dirtyCardDistrict[i].removeAllChildren();
                self.pongKongChowDistrict[i].removeAllChildren();
            }

            this._initReadyHand();
            this._hideSelectChiKongPanel();
        });
    },

    /**
     *******************************************************************************************************************
     *                                       button on click
     *******************************************************************************************************************
     **/

    showUserInfoOnClick(evt, data) {
        for (let i = 0; i < this._Cache.playerList.length; i += 1) {
            const playerIndex = this._getPlayerIndexBySeat(this._Cache.playerList[i].seat);
            if (playerIndex == data) {
                window.Global.Config.tempCache = this._Cache.playerList[i].info;
                window.Global.Animation.openDialog(cc.instantiate(this.userInfoPrefab), this.node);
                break;
            }
        }
    },

    /**
     * 微信邀请
     */
    wechatInviteOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);

        const hasWechat = window.Global.NativeExtensionManager.execute('wechatIsWxAppInstalled');
        if (!hasWechat) {
            cc.log('MyRoomPrefab.shareOnClick: 没有安装微信');
            return;
        }

        var shareInfo = window.Global.Tools.createWechatShareInfo(this._Cache.config, this._Cache.roomId);
        window.Global.NativeExtensionManager.execute('wechatLinkShare', [window.Global.Config.downloadPage, shareInfo[0], shareInfo[1]]);
        cc.log('shareOnClick');
    },

    openFastChatPanelOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        if (this.fastChatProgressBar.progress <= 0) {
            var animationName = (this.fastChatPanel.getPositionX() > 114) ? 'OpenFastChatPanel' : 'CloseFastChatPanel';
            this.fastChatPanel.getComponent(cc.Animation).play(animationName);
        }
    },

    openMenuOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);

        var animationName = (this.menuPanel.getPositionY() > 222) ? 'OpenMenu' : 'CloseMenu';
        this.menuPanel.getComponent(cc.Animation).play(animationName);
    },

    closeDialogOnClick() {
        // 检查是否关闭聊天面板
        if (this.fastChatPanel.getPositionX() <= 114) {
            this.fastChatPanel.getComponent(cc.Animation).play('CloseFastChatPanel');
        }

        // 检查是否关闭菜单面板
        if (this.menuPanel.getPositionY() <= 222) {
            this.menuPanel.getComponent(cc.Animation).play('CloseMenu');
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
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        if (data == 1) {
            this.fastChatPanel.getChildByName('fastChatView1').active = true;
            this.fastChatPanel.getChildByName('fastChatView2').active = false;
        } else {
            this.fastChatPanel.getChildByName('fastChatView1').active = false;
            this.fastChatPanel.getChildByName('fastChatView2').active = true;
        }
    },

    wordChatOnClick(evt, data) {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        const content = JSON.stringify({ type: 1, data });
        window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.Speaker, { content });

        this.fastChatProgressBar.progress = 1.0;

        this.fastChatPanel.getComponent(cc.Animation).play('CloseFastChatPanel');
    },

    emojiChatOnClick(evt, data) {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        const content = JSON.stringify({ type: 2, data });
        window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.Speaker, { content });

        this.fastChatProgressBar.progress = 1.0;

        this.fastChatPanel.getComponent(cc.Animation).play('CloseFastChatPanel');
    },

    actionOnClick(event, data) {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);

        this.countDownAnimation.play();
        this._hideActionPrompt();

        if (data == 'openSelectKong') {
            this.selectKongPanel.active = true;
        } else if (data == 'openSelectChi') {
            this.selectChiPanel.active = true;
        } else {
            if (data == 'pass_true') {
                this._Cache.allowOutCard = true;
            }

            if (['pass_true', 'pass_false', 0, '0'].indexOf(data) != -1) {
                data = 0;
            }

            window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.Action, { actionId: data });

            this._initActionPrompt();
        }
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

        // 如果选中的牌是红中,跳过操作
        if (this._Cache.gameUuid == window.PX258.Config.gameUuid[1] && `0x${data.toString(16)}` == 0x51) {
            return;
        }

        if (event.target.getPositionY() !== 0) {
            if (!this._Cache.allowOutCard) {
                return;
            }
            this._discard(event.target, data);
        } else {
            this._resetHandCardPosition();
            event.target.setPositionY(24);
        }
    },

    /**
     * 声音选项
     */
    openSoundPanelOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        // 检查是否关闭菜单面板
        if (this.menuPanel.getPositionY() <= 222) {
            this.menuPanel.getComponent(cc.Animation).play('CloseMenu');
        }
        window.Global.Animation.openDialog(cc.instantiate(this.soundPrefab), this.node, () => {
            cc.log('load success');
        });
    },

    /**
     * 解散房间
     */
    dismissOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        // 检查是否关闭菜单面板
        if (this.menuPanel.getPositionY() <= 222) {
            this.menuPanel.getComponent(cc.Animation).play('CloseMenu');
        }
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
     * 选择需要吃的牌
     * 选择需要杠的牌
     */
    selectChiKongActionOnClick(evt, data) {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        this._hideSelectChiKongPanel();

        data = JSON.parse(data);
        window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.Action, { actionId: data.actionId });
    },

    closeOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        if (this._Cache.playerList.length !== 4) {
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
            this.onSettleForRoomMessage(this._Cache.settleForRoomData);
        } else if (this.handCardDistrict[0].children.length == 0) {
            cc.log('readyGameCallback.Ready');
            window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.Ready);
            this.roomInfo[2].string = `局数: ${this._Cache.currentRound += 1}/${this._Cache.config.max_rounds}`;
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
    _deleteHandCardByCode(playerIndex, data) {
        cc.log([playerIndex, data]);
        for (let i = 0; i < this.handCardDistrict[playerIndex].childrenCount; i += 1) {
            var obj = this.handCardDistrict[playerIndex].children[i];
            if (playerIndex === 0) {
                if (obj._userData == data && obj.active) {
                    obj.active = false;
                    obj.destroy();
                    break;
                }
            } else if (obj.active) {
                obj.active = false;
                obj.destroy();
                break;
            }
        }
    },

    /**
     * 添加牌到手牌区
     *
     * @param playerIndex
     * @param card
     * @private
     */
    _appendCardToHandCardDistrict(playerIndex, card) {
        var node = cc.instantiate(this.handCardPrefabs[playerIndex]);
        this.handCardDistrict[playerIndex].addChild(node);

        if (playerIndex === 0) {
            node._userData = card;
            var clickEventHandler = window.Global.Tools.createEventHandler(this.node, 'GameRoomScene', 'selectedHandCardOnClick', card);
            node.getChildByName('Background').getComponent(cc.Button).clickEvents.push(clickEventHandler);
            var nodeSprite = window.Global.Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${card.toString(16)}`);

            if (this._Cache.gameUuid == window.PX258.Config.gameUuid[1]) {
                window.Global.Tools.findNode(node, 'Background>laizhi').active = `0x${card.toString(16)}` == 0x51;
            }

            this._initDragStuffs(node);
        }
    },

    /**
     * 暗杠
     *
     * @param playerIndex
     * @param data
     * @private
     */
    _appendConcealedKongToDistrict(playerIndex, data) {
        var node = cc.instantiate(this.concealedKongPrefab[playerIndex]);
        this.pongKongChowDistrict[playerIndex].addChild(node);

        if (playerIndex == 0) {
            var nodeSprite = window.Global.Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[0].card.toString(16)}`);
        }
    },

    /**
     * 明杠
     *
     * @param playerIndex
     * @param triggerIndex
     * @param data
     * @private
     */
    _appendExposedToDistrict(playerIndex, triggerIndex, data) {
        var node = cc.instantiate(this.exposedPrefab[playerIndex]);
        this.pongKongChowDistrict[playerIndex].addChild(node);

        var index = Math.abs(triggerIndex - playerIndex) - 1;
        // 修复prefab顺序问题
        if (playerIndex == 0) {
            index = Math.abs(2 - index);
        }

        for (var i = 0; i < 4; i += 1) {
            if (i === index) {
                node.children[i].getChildByName('hide').active = true;
            } else {
                var nodeSprite = window.Global.Tools.findNode(node.children[i], 'show>value').getComponent(cc.Sprite);
                nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[0].card.toString(16)}`);
            }
        }
    },

    /**
     * 碰
     *
     * @param playerIndex
     * @param triggerIndex
     * @param data
     * @private
     */
    _appendPongToDistrict(playerIndex, triggerIndex, data) {
        var node = cc.instantiate(this.pongPrefab[playerIndex]);
        node._userData = data;
        this.pongKongChowDistrict[playerIndex].addChild(node);

        var index = Math.abs(triggerIndex - playerIndex) - 1;
        // 修复prefab顺序问题
        if (playerIndex == 0) {
            index = Math.abs(2 - index);
        }

        for (var i = 0; i < data.length; i += 1) {
            if (i === index) {
                node.children[i].getChildByName('hide').active = true;
            } else {
                var nodeSprite = window.Global.Tools.findNode(node.children[i], 'show>value').getComponent(cc.Sprite);
                nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[i].card.toString(16)}`);
            }
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
        var node = cc.instantiate(this.ChowPrefab[player]);
        this.pongKongChowDistrict[player].addChild(node);

        data.sort(function(a, b) {
            return a.card - b.card;
        });

        for (var i = 0; i < data.length; i += 1) {
            var nodeSprite = node.children[i].getChildByName('value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[i].card.toString(16)}`);
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
                nodeSprite = window.Global.Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            } else {
                nodeSprite = window.Global.Tools.findNode(node, 'Mask>Background>value').getComponent(cc.Sprite);
                // 处理特殊排列问题
                if (player === 1) {
                    if (this.dirtyCardDistrict[player].childrenCount % 10 !== 0) {
                        node.getChildByName('Mask').height = 60;
                    }
                } else if (player === 2) {
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

    _getPlayerIndexBySeat(playerSeat) {
        const displaySeat = playerSeat - this._Cache.thisPlayerSeat;
        return (displaySeat < 0 ? displaySeat + 4 : displaySeat);
    },

    _initVotePanel(data) {
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
        var playTypes = window.PX258.Config.playTypes[info.game_uuid];
        var options = `0x${info.options.toString(16)}`;

        if (info.game_uuid == window.PX258.Config.gameUuid[0]) {
            var num = info.options & 0x1;

            this.roomInfo[4].string = '玩法: ' + playTypes.playType[num];
            this.roomInfo[4].string += '\n封顶: ' + playTypes.options[options ^ num];
        }
        else if (info.game_uuid == window.PX258.Config.gameUuid[1]) {
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
            }
            else {
                this.zhuaniaoNode.getChildByName('title').children[0].active = true;
            }
        }

        this.roomInfo[1].string = `房间号: ${this._Cache.roomId}`;
        this.roomInfo[2].string = `局数: ${currentRound}/${info.max_rounds}`;
        this.roomInfo[3].string = `剩余牌数: ${restCards}`;
    },

    _getActionIdFromPromptList(promptList, prompt) {
        var _promptList = [];
        for (let i = 0; i < promptList.length; i += 1) {
            if (prompt.indexOf(promptList[i].prompt) !== -1) {
                _promptList.push(promptList[i]);
            }
        }
        return _promptList;
    },

    /**
     * 生成标识
     */
    _createActiveCardFlag(playerIndex) {
        this._deleteActiveCardFlag();
        if (this.dirtyCardDistrict[playerIndex].childrenCount > 0) {
            this._Cache.activeCardFlag = cc.instantiate(this.cardMarkPrefab);
            var node = this.dirtyCardDistrict[playerIndex].children[this.dirtyCardDistrict[playerIndex].childrenCount - 1];
            node.addChild(this._Cache.activeCardFlag);

            // var point = this.node.convertToWorldSpace(this.dirtyCardDistrict[playerIndex].children[this.dirtyCardDistrict[playerIndex].childrenCount - 1].getPosition());
            // this._Cache.activeCardFlag = cc.instantiate(this.cardMarkPrefab);
            // this._Cache.activeCardFlag.setPosition(this.node.convertToNodeSpace(point));
            // this.node.addChild(this._Cache.activeCardFlag);
        }
    },

    _deleteActiveCardFlag() {
        if (this._Cache.activeCardFlag) {
            this._Cache.activeCardFlag.destroy();
        }
    },

    /**
     * 当玩家出牌时前面的灯是亮的
     */
    _openLight(index) {
        this._closeAllLight();
        // index -= 2;
        // index = index < 0 ? index + 4 : index;

            this.makeSeat[index].color = new cc.Color(255, 246, 0);
    },

    _closeAllLight() {
        for (let i = 0; i < 4; i += 1) {
            this.makeSeat[i].color = new cc.Color(164, 81, 54);
        }
    },

    _initLight() {
        for (let i = 0; i < this._Cache.playerList.length; i += 1) {
            const obj = this._Cache.playerList[i];
            if (obj.seat === 0) {
                const seat = this._getPlayerIndexBySeat(obj.seat);
                this.makeSeatPanel.rotation = seat * -90;
                break;
            }
        }
    },

    /**
     * 邀请按钮
     */
    _hideInviteButton(playerIndex) {
        this.inviteButtonList[playerIndex].active = false;
    },

    _showInviteButton(playerIndex) {
        if (!window.Global.NativeExtensionManager.execute('wechatIsWxAppInstalled')) {
            return;
        }
        this.inviteButtonList[playerIndex].active = true;
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
        this._hideInviteButton(index);
        this._showPlayerInfoList([index]);

        this.playerInfoList[index].getChildByName('text_nick').getComponent(cc.Label).string = data.nickname;
        this.playerInfoList[index].getChildByName('text_result').getComponent(cc.Label).string = totalScore || 0;
        window.Global.Tools.setWebImage(this.playerInfoList[index].getChildByName('mask').getChildByName('img_handNode').getComponent(cc.Sprite), data.headimgurl);
    },

    /**
     * 初始化场景
     */
    _initScene() {
        const smallAccountNode = window.Global.Tools.findNode(cc.director.getScene(), 'Canvas>SmallAccount');
        if (smallAccountNode) {
            smallAccountNode.destroy();
        }

        this._initCardDistrict();

        for (var i = 0; i < 4; i += 1) {
            this._showInviteButton(i);
        }

        this._hidePlayerInfoList([0, 1, 2, 3]);
        this._closeAllLight();
        this._hideActionPrompt();
        this._initReadyHand();
        this._hideSelectChiKongPanel();
        this._initActionPrompt();

        this.playerInfoList[2].setPositionX(-554); // 移动三号位的玩家头像到中间
    },

    _initCardDistrict() {
        for (let i = 0; i < 4; i += 1) {
            this.handCardDistrict[i].removeAllChildren();
            this.dirtyCardDistrict[i].removeAllChildren();
            this.pongKongChowDistrict[i].removeAllChildren();
            this._hideGetHandCard(i);

            this.playerInfoList[i].getChildByName('img_zhuang').active = false;
            this.playerInfoList[i].getChildByName('img_hostmark').active = false;
        }
    },

    /**
     * 查找当前玩家的座位号
     */
    _setThisPlayerSeat(playerList) {
        for (let i = 0; i < playerList.length; i += 1) {
            const obj = playerList[i];
            if (obj.playerUuid === this._userInfo.playerUuid) {
                this._Cache.thisPlayerSeat = obj.seat;
                break;
            }
        }
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

    /**
     * 提示信息
     */
    _hideActionPrompt() {
        for (let i = 0; i < this.actionPanel.length; i += 1) {
            this.actionPanel[i].active = false;
        }
    },

    _initActionPrompt: function() {
        this._hideActionPrompt();
        this.selectChiPanel.active = false;
        this.selectKongPanel.active = false;

        for (var i = 0; i < this.selectChiPanel.children.length; i += 1) {
            this.selectChiPanel.children[i].destroy();
        }

        for (var i = 0; i < this.selectKongPanel.children.length; i += 1) {
            this.selectKongPanel.children[i].destroy();
        }
    },

    _hideSelectChiKongPanel() {
        this.selectChiPanel.active = false;
        this.selectKongPanel.active = false;
    },

    _actionIsShow() {
        for (let i = 0; i < this.actionPanel.length; i += 1) {
            if (this.actionPanel[i].active) {
                return true;
            }
        }
        if (this.selectChiPanel.active) {
            return true;
        } else if (this.selectKongPanel.active) {
            return true;
        }
        return false;
    },

    /**
     * 隐藏摸到的手牌
     */
    _hideGetHandCard(index) {
        this.getHandcard[index].getChildByName('GetHandCard').setPositionY(0);
        this.getHandcard[index].active = false;
    },

    /**
     * 听牌提示
     */
    _initReadyHand() {
        if (this.tingCardDistrict.children.length == 0) {
            return;
        }
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
        } else if (messageId === 2) {
            this.waitPanel.getChildByName('txt_wait').getComponent(cc.Label).string = '断线重连中，请稍等...';
        }
        this.waitPanel.active = true;
    },

    _hideWaitPanel() {
        this.waitPanel.active = false;
    },

    /**
     * 检查是否有玩家在同一ip
     * @private
     */
    _checkIp: function() {
        var groupUserList = window.Global.Tools.groupByIp(this._Cache.playerList);
        if (groupUserList.length > 0) {
            var text = '请注意: ';
            for (var i = 0; i < groupUserList.length; i += 1) {
                text += groupUserList[i].nickname + ', ';
            }
            text += 'IP地址相同, 请小心对待';
            window.Global.Dialog.openMessageBox(text);
        }
    },

    /**
     * 显示筛子点数
     */
    showDice: function(diceList) {
        var node = cc.instantiate(this.dicePrefab);
        node.getComponent('Dice').init(diceList);
        this.node.addChild(node);
    },

    _initDragStuffs: function (node) {
        // 如果选中的牌是红中,跳过操作
        if (this._Cache.gameUuid == window.PX258.Config.gameUuid[1] && `0x${node._userData.toString(16)}` == 0x51) {
            return;
        }
        var bgNode = node.getChildByName('Background');
        if (!bgNode) {
            bgNode = node.getChildByName('GetHandCard');
        }
        bgNode.on(cc.Node.EventType.TOUCH_START, function (event) {
            cc.log('cc.Node.EventType.TOUCH_START');
            if (!this._Cache.allowOutCard) {
                return;
            }
            
            cc.log([event.getLocationX(), event.getLocationY()]);

            bgNode.getChildByName('mask').active = false;
            this.chupaidrag.active = false;
            var nodeSprite = bgNode.getChildByName('value').getComponent(cc.Sprite);
            window.Global.Tools.findNode(this.chupaidrag, 'Background>value').getComponent(cc.Sprite).spriteFrame = nodeSprite.spriteFrame;
            this.chupaidrag.x = event.getLocationX() - cc.director.getVisibleSize().width / 2;
            this.chupaidrag.y = event.getLocationY() - cc.director.getVisibleSize().height / 2;
        }.bind(this));

        bgNode.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            cc.log('cc.Node.EventType.TOUCH_MOVE');
            if (!this._Cache.allowOutCard) {
                return;
            }

            if (Math.abs(event.getDeltaX()) + Math.abs(event.getDeltaY()) < 0.5) {
                return;
            }
            this.chupaidrag.active = true;
            bgNode.getChildByName('mask').active = true;
            this.chupaidrag.scaleX = 1;
            this.chupaidrag.scaleY = 1;
            this.chupaidrag.x = event.getLocationX() - cc.director.getVisibleSize().width / 2;
            this.chupaidrag.y = event.getLocationY() - cc.director.getVisibleSize().height / 2;
            bgNode.y = 0;
        }.bind(this));

        bgNode.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (!this._Cache.allowOutCard) {
                return;
            }

            cc.log('cc.Node.EventType.TOUCH_END');
            this.chupaidrag.active = false;
            bgNode.getChildByName('mask').active = false;
            if (event.getLocationY() >= 200) {
                this._discard(bgNode, node._userData);
            }
        }.bind(this));

        bgNode.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            if (!this._Cache.allowOutCard) {
                return;
            }

            cc.log('cc.Node.EventType.TOUCH_CANCEL');
            this.chupaidrag.active = false;
            bgNode.getChildByName('mask').active = false;
            if (event.getLocationY() >= 200) {
                this._discard(bgNode, node._userData);
            } else if (event.getLocationY() >= 150) {
                // this._huadongtishi.active = true;
                // this._huadongtishi.getComponent(cc.Animation).play('huadongtishi');
            }
        }.bind(this));
    },

    _discard(node, data) {
        if (!this._Cache.allowOutCard) {
            return;
        }
        this._Cache.allowOutCard = false;

        if (node.name === 'GetHandCard') {
            this._hideGetHandCard(0);
        } else {
            node.parent.destroy();
        }

        if (this.getHandcard[0].active) {
            var card = this.getHandcard[0]._userData;
            this._appendCardToHandCardDistrict(0, card);
            window.Global.Tools.cardsSort(this.handCardDistrict[0].children);
            this._hideGetHandCard(0);
        }

        window.Global.NetworkManager.sendSocketMessage(window.PX258.NetworkConfig.WebSocket.Discard, { card: data });

        window.Global.SoundEffect.playEffect(window.PX258.Config.audioUrl.effect.cardOut);
    }

});