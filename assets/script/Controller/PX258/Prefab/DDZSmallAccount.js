cc.Class({
    extends: cc.Component,

    properties: {
        playerList: [cc.Node],
        winPanel: [cc.Node],
        cardPinList: cc.SpriteAtlas,
        cardPrefab: cc.Prefab,
        titleLabel: cc.Label,

        zhuaniaoCardPrefab: cc.Prefab,
        zhuaniaoNode: cc.Node,
    },

    init(data) {
        this._Cache = data;
        this.titleLabel.string = `局数 ${this._Cache.currentRound}/${this._Cache.maxRounds}`;

        var layoutNode = this.zhuaniaoNode.getChildByName('layout');

        if (this._Cache.data.drawNiaoList && this._Cache.data.drawNiaoList.length > 0) {
            for (let i = 0; i < this._Cache.data.drawNiaoList.length; i += 1) {
                var card = `0x${this._Cache.data.drawNiaoList[i].card.toString(16)}`;
                var node = cc.instantiate(this.zhuaniaoCardPrefab);
                node._userData = this._Cache.data.drawNiaoList[i].card;
                var nodeSprite = window.Global.Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_${card}`);

                layoutNode.addChild(node);
            }

            this.zhuaniaoNode.active = true;
        }

        for (let i = 0; i < this._Cache.data.playerDataList.length; i += 1) {
            const playerNode = this.playerList[i];
            const playerData = this._Cache.data.playerDataList[i];
            const cardPanel = playerNode.getChildByName('CardPanel');
            const playerUserInfo = this._getUserInfoInList(playerData.playerUuid);

            playerNode.getChildByName('text_nick').getComponent(cc.Label).string = playerUserInfo.nickname;
            playerNode.getChildByName('txt_fanshu').getComponent(cc.Label).string = `积分:${playerData.total}`;
            playerNode.getChildByName('txt_score').getComponent(cc.Label).string = playerData.score;
            window.Global.Tools.setWebImage(playerNode.getChildByName('avatar').getComponent(cc.Sprite), playerUserInfo.headimgurl);

            var chowList = [];
            var pongList = [];
            var kongList = [];

            for (let j = 0; j < playerData.cardsGroupListList.length; j += 1) {
                var obj = playerData.cardsGroupListList[j];
                if (obj.type == 'chow') {
                    chowList.push(obj.cardList);
                }
                else if (obj.type == 'pong') {
                    pongList.push(obj.cardList);
                }
                else {
                    kongList.push(obj.cardList);
                }
            }

            var positionXOffset = 0;

            for (var j = 0; j < chowList.length; j += 1) {
                var obj = chowList[j];

                for (var k = 0; k < obj.length; k += 1) {
                    var node = cc.instantiate(this.cardPrefab);
                    var nodeSprite = window.Global.Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                    nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj[k].card.toString(16)}`);
                    node.getChildByName('Background').setPositionX(positionXOffset);
                    cardPanel.addChild(node);
                }

                positionXOffset += 12;
            }

            for (var j = 0; j < pongList.length; j += 1) {
                var obj = pongList[j];

                for (var k = 0; k < obj.length; k += 1) {
                    var node = cc.instantiate(this.cardPrefab);
                    var nodeSprite = window.Global.Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                    nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj[k].card.toString(16)}`);
                    node.getChildByName('Background').setPositionX(positionXOffset);
                    cardPanel.addChild(node);
                }

                positionXOffset += 12;
            }

            for (var j = 0; j < kongList.length; j += 1) {
                var obj = kongList[j];

                for (var k = 0; k < obj.length; k += 1) {
                    var node = cc.instantiate(this.cardPrefab);
                    var nodeSprite = window.Global.Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                    nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj[k].card.toString(16)}`);
                    node.getChildByName('Background').setPositionX(positionXOffset);
                    cardPanel.addChild(node);
                }

                positionXOffset += 12;
            }

            positionXOffset += 24;

            for (var j = 0; j < playerData.cardsInHandList.length; j += 1) {
                var obj = playerData.cardsInHandList[j];
                var node = cc.instantiate(this.cardPrefab);
                node.getChildByName('Background').setPositionX(positionXOffset);

                var nodeSprite = window.Global.Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj.card.toString(16)}`);
                cardPanel.addChild(node);

                if (this._Cache.gameUuid == window.PX258.Config.gameUuid[1] && `0x${obj.card.toString(16)}` == 0x51) {
                    window.Global.Tools.findNode(node, 'Background>laizhi').active = true;
                }
            }

            if (playerData.winType !== window.PX258.Config.winType.None) {
                window.Global.Tools.findNode(playerNode, `_Little>littleTxt_${playerData.winType}`).active = true;
                playerNode.getChildByName('WinType').getComponent(cc.Label).string = window.PX258.Config.winFlag[playerData.winFlag] || '';

                // 胡牌
                if ([1, 2].indexOf(playerData.winType) !== -1) {
                    positionXOffset += 24;
                    var node = cc.instantiate(this.cardPrefab);
                    node.getChildByName('Background').setPositionX(positionXOffset);
                    var nodeSprite = window.Global.Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                    nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${playerData.winCard.card.toString(16)}`);
                    cardPanel.addChild(node);
                }
            }

            if (playerData.cardsDrawNiaoList && playerData.cardsDrawNiaoList.length > 0) {
                for (var j = 0; j < playerData.cardsDrawNiaoList.length; j += 1) {
                    for (var k = 0; k < layoutNode.children.length; k += 1) {
                        if (layoutNode.children[k]._userData == playerData.cardsDrawNiaoList[j].card) {
                            if (`0x${playerData.cardsDrawNiaoList[j].card.toString(16)}` == 0x51) {
                                window.Global.Tools.findNode(layoutNode.children[k], 'Background>laizhi').active = true;
                            }
                            else {
                                window.Global.Tools.findNode(layoutNode.children[k], 'Background>zhuaniao').active = true;
                            }
                        }
                    }
                }
            }
        }
    },

    wechatShareOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        // todo: 微信分享
        var hasWechat = window.Global.NativeExtensionManager.execute('wechatIsWxAppInstalled');
        if (!hasWechat) {
            cc.log('MyRoomPrefab.shareOnClick: 没有安装微信');
            return;
        }

        var node = cc.director.getScene().getChildByName('Canvas');
        window.Global.Tools.captureScreen(node, function(fileName) {
            window.Global.NativeExtensionManager.execute('wechatImageShare', [fileName], function(result) {
                cc.log(result);
            });
        });
    },

    gameAgenOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        const node = cc.director.getScene().getChildByName('Canvas');
        node.getComponent('GameRoomScene').readyGameCallback();
        window.Global.Animation.closeDialog(this.node);
    },

    _getUserInfoInList(playerUuid) {
        for (let i = 0; i < this._Cache.playerInfoList.length; i += 1) {
            const obj = this._Cache.playerInfoList[i];
            if (obj.playerUuid === playerUuid) {
                return obj.info;
            }
        }
        return false;
    },

});
