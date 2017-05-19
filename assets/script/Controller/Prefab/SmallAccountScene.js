cc.Class({
    extends: cc.Component,

    properties: {
        playerList: [cc.Node],
        winPanel: [cc.Node],
        cardPinList: cc.SpriteAtlas,
        cardPrefab: cc.Prefab,
    },

    // use this for initialization
    onLoad() {
        if (!GlobalConfig.tempCache.data.playerDataList) {
            return;
        }

        const userInfo = Tools.getLocalData(GlobalConfig.LSK.userInfo);

        for (let i = 0; i < GlobalConfig.tempCache.data.playerDataList.length; i += 1) {
            const playerNode = this.playerList[i];
            const playerData = GlobalConfig.tempCache.data.playerDataList[i];
            const cardPanel = playerNode.getChildByName('CardPanel');

            playerNode.getChildByName('text_nick').getComponent(cc.Label).string = this._getNicknameInList(playerData.playerUuid);
            playerNode.getChildByName('txt_fanshu').getComponent(cc.Label).string = `总: ${playerData.total}`;
            playerNode.getChildByName('txt_score').getComponent(cc.Label).string = playerData.score;

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
                    const node = cc.instantiate(this.cardPrefab);
                    const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                    nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj[k].card.toString(16)}`);
                    node.getChildByName('Background').setPositionX(positionXOffset);
                    cardPanel.addChild(node);
                }

                positionXOffset += 12;
            }

            for (var j = 0; j < pongList.length; j += 1) {
                var obj = pongList[j];

                for (var k = 0; k < obj.length; k += 1) {
                    const node = cc.instantiate(this.cardPrefab);
                    const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                    nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj[k].card.toString(16)}`);
                    node.getChildByName('Background').setPositionX(positionXOffset);
                    cardPanel.addChild(node);
                }

                positionXOffset += 12;
            }

            for (var j = 0; j < kongList.length; j += 1) {
                var obj = kongList[j];

                for (var k = 0; k < obj.length; k += 1) {
                    const node = cc.instantiate(this.cardPrefab);
                    const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
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

                const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj.card.toString(16)}`);
                cardPanel.addChild(node);
            }

            if (playerData.winType !== window.PX258.Config.winType.None) {
                Tools.findNode(playerNode, `_Little>littleTxt_${playerData.winType}`).active = true;
                playerNode.getChildByName('WinType').getComponent(cc.Label).string = window.PX258.Config.winFlag[playerData.winFlag] || '';

                // 胡牌
                if ([1, 2].indexOf(playerData.winType) !== -1) {
                    playerNode.getChildByName('littleHuMark').active = true;

                    positionXOffset += 24;
                    var node = cc.instantiate(this.cardPrefab);
                    node.getChildByName('Background').setPositionX(positionXOffset);
                    var nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                    nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${playerData.winCard.card.toString(16)}`);
                    cardPanel.addChild(node);
                }
            }

            if (userInfo.playerUuid === playerData.playerUuid) {
                if (playerData.winType === window.PX258.Config.winType.Pao) {
                    this.winPanel[0].active = true;
                }
                else if (playerData.winType === window.PX258.Config.winType.None) {
                    this.winPanel[2].active = true;
                }
                else if ([window.PX258.Config.winType.Discard, window.PX258.Config.winType.Draw].indexOf(playerData.winType) !== -1) {
                    this.winPanel[1].active = true;
                }
            }
        }
    },

    wechatShareOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        // todo: 微信分享
    },

    gameAgenOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        const node = cc.director.getScene().getChildByName('Canvas');
        node.getComponent('GameRoomScene').readyGameCallback();
        Animation.closeDialog(this.node);
    },

    _getNicknameInList(playerUuid) {
        for (let i = 0; i < GlobalConfig.tempCache.playerInfoList.length; i += 1) {
            const obj = GlobalConfig.tempCache.playerInfoList[i];
            if (obj.playerUuid === playerUuid) {
                return obj.info.nickname;
            }
        }
        return false;
    },

});
