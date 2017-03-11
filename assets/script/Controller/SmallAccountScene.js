cc.Class({
    extends: cc.Component,

    properties: {
        playerList: {
            default: [],
            type: cc.Node,
        }
    },

    // use this for initialization
    onLoad() {
        /*
         //PLAYER_WIN_PAO = -1 # 放炮
         //PLAYER_WIN_TYPE_NONE = 0 # 平局
         //PLAYER_WIN_TYPE_DISCARD = 1 # 点炮胡
         //PLAYER_WIN_TYPE_DRAW = 2  # 自摸胡

         // string player_uuid = 1;  // 玩家UUID
         // repeated Card cards_group = 2;  // 玩家组坎排
         // repeated Card cards_in_hand = 3;  // 玩家手牌，如果胡牌则是胡的牌
         // Card win_card = 5;  // 玩家胡的牌
         // int32 score = 6;  // 玩家当局分数
         // int32 total = 7;  // 玩家累计总分
         // int32 win_type = 8;  // 玩家胡牌类型
         // string win_flag = 9;  // 胡牌牌型
         */
        for (let i = 0; i < this.playerList.length; i += 1) {
            const playerNode = this.playerList[i];
            const playerData = Global.tempCache.data.playerDataList[i];
            const cardPanel = playerNode.getChildByName('CardPanel');

            playerNode.getChildByName('text_nick').getComponent(cc.Label).string = this._getNicknameInList(playerData.playerUuid);
            playerNode.getChildByName('txt_fanshu').getComponent(cc.Label).string = playerData.score;
            playerNode.getChildByName('txt_score').getComponent(cc.Label).string = playerData.total;

            for (let j = 0; j < playerData.cardsGroup.length; j += 1) {
                const obj = playerData[j];
                const node = cc.instantiate(this.handCardPrefabs[0]);
                const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                Tools.loadRes(`card_pin.plist/value_${obj.card}`, cc.SpriteFrame, (spriteFrame) => {
                    nodeSprite.spriteFrame = spriteFrame;
                });
                cardPanel.addChild(node);
            }

            for (let j = 0; j < playerData.cardsInHand.length; j += 1) {
                const obj = playerData[j];
                const node = cc.instantiate(this.handCardPrefabs[0]);
                node.getChildByName('Background').setPositionX(24);

                const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                Tools.loadRes(`card_pin.plist/value_${obj.card}`, cc.SpriteFrame, (spriteFrame) => {
                    nodeSprite.spriteFrame = spriteFrame;
                });
                cardPanel.addChild(node);
            }

            if (playerData.winType !== 0) {
                Tools.findNode(playerNode, `_Little>littleTxt_${playerData.winType}`).active = true;
            }

            // 胡牌
            if (playerData.winCard) {
                playerNode.getChildByName('WinType').getComponent(cc.Label).string = Tools.winFlag[playerData.winFlag];
                playerNode.getChildByName('littleHuMark').active = true;

                const node = cc.instantiate(this.handCardPrefabs[0]);
                node.getChildByName('Background').setPositionX(48);

                const nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
                Tools.loadRes(`card_pin.plist/value_${playerData.winCard}`, cc.SpriteFrame, (spriteFrame) => {
                    nodeSprite.spriteFrame = spriteFrame;
                });
                cardPanel.addChild(node);
            }
        }
    },

    wechatShareOnClick() {
        // todo: 微信分享
    },

    gameAgenOnClick() {
        const node = cc.director.getScene().getChildByName('Canvas');
        node.getComponent('GameRoomScene').onReadyGame();
        this.node.destroy();
    },

    _getNicknameInList(playerUuid) {
        for (let i = 0; i < Global.tempCache.playerInfoList.length; i += 1) {
            const obj = Global.tempCache.playerInfoList[i];
            if (obj.playerUuid === playerUuid) {
                return obj.nickname;
            }
        }
        return false;
    }

});
