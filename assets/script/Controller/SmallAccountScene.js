cc.Class({
    extends: cc.Component,

    properties: {
        playerList: [cc.Node],
        winPanel: [cc.Node],
        cardPinList: cc.SpriteAtlas,
    },

    // use this for initialization
    onLoad() {
        if (!Global.tempCache.data.playerDataList) {
            return;
        }

        if (Global.tempCache.data.winType === -1) {
            this.winPanel[0].active = true;
        }
        else if (Global.tempCache.data.winType === 0) {
            this.winPanel[1].active = true;
        }
        else if ([1, 2].indexOf(Global.tempCache.data.winType) !== -1) {
            this.winPanel[2].active = true;
        }

        for (let i = 0; i < Global.tempCache.data.playerDataList.length; i += 1) {
            const playerNode = this.playerList[i];
            const playerData = Global.tempCache.data.playerDataList[i];
            const cardPanel = playerNode.getChildByName('CardPanel');

            playerNode.getChildByName('text_nick').getComponent(cc.Label).string = this._getNicknameInList(playerData.playerUuid);
            playerNode.getChildByName('txt_fanshu').getComponent(cc.Label).string = `总: ${playerData.total}`;
            playerNode.getChildByName('txt_score').getComponent(cc.Label).string = playerData.score;

            let positionXOffset = 0;
            let lastValue = playerData.cardsGroupList.length > 0 ? playerData.cardsGroupList[0].card : false;
            let isChi = false;

            for (let j = 0; j < playerData.cardsGroupList.length; j += 1) {
                const obj = playerData.cardsGroupList[j];
                if (j !== 0) {
                    if (obj.card === lastValue + 1 && isChi === false) {
                        isChi = 3;
                    }
                    else if (j % 3 === 0 && isChi === 3) {
                        isChi = false;
                        positionXOffset += 12;
                    }
                    else if (obj.card !== lastValue && isChi === false) {
                        positionXOffset += 12;
                    }
                }
                lastValue = obj.card;

                const node = cc.instantiate(this.testPrefab);
                const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj.card.toString(16)}`);
                node.getChildByName('Background').setPositionX(positionXOffset);
                cardPanel.addChild(node);
            }

            for (let j = 0; j < playerData.cardsInHandList.length; j += 1) {
                const obj = playerData.cardsInHandList[j];
                const node = cc.instantiate(this.testPrefab);
                node.getChildByName('Background').setPositionX(positionXOffset + 24);

                const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj.card.toString(16)}`);
                cardPanel.addChild(node);
            }

            if (playerData.winType !== 0) {
                Tools.findNode(playerNode, `_Little>littleTxt_${playerData.winType}`).active = true;
                playerNode.getChildByName('WinType').getComponent(cc.Label).string = Global.winFlag[playerData.winFlag] || '';

                // 胡牌
                if ([1, 2].indexOf(playerData.winType) !== -1) {
                    playerNode.getChildByName('littleHuMark').active = true;

                    const node = cc.instantiate(this.testPrefab);
                    node.getChildByName('Background').setPositionX(48);
                    const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                    nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${playerData.winCard.card.toString(16)}`);
                    cardPanel.addChild(node);
                }
            }
        }
    },

    wechatShareOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        // todo: 微信分享
    },

    gameAgenOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        const node = cc.director.getScene().getChildByName('Canvas');
        node.getComponent('GameRoomScene').readyGameCallback();
        Global.closeDialog(this.node);
    },

    _getNicknameInList(playerUuid) {
        for (let i = 0; i < Global.tempCache.playerInfoList.length; i += 1) {
            const obj = Global.tempCache.playerInfoList[i];
            if (obj.playerUuid === playerUuid) {
                return obj.info.nickname;
            }
        }
        return false;
    },

});
