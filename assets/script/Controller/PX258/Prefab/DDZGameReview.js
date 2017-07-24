cc.Class({
    extends: cc.Component,

    properties: {
        roomInfo: [cc.Label],

        actionSprite: [cc.Node],

        playerInfoList: [cc.Node],

        dipaiNode: cc.Node,

        cardPrefab: [cc.Prefab],
        cardPinList: cc.SpriteAtlas,

        handCardDistrict: [cc.Node],
        dirtyCardDistrict: [cc.Node],
    },

    init: function(data) {
        for (var i = 0; i < this.actionSprite.length; i++) {
            for (var j = 0; j < this.actionSprite[i].children.length; j += 1) {
                this.actionSprite[i].children[j].active = false;
            }
        }

        this._Cache = data;
        this._Cache.isPause = false;
        this._userInfo = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);
        this._setRoomInfo(data);

        for (var key in data.user) {
            var userInfo = JSON.parse(data.user[key][1]);
            this.playerInfoList[key].getChildByName('text_nick').getComponent(cc.Label).string = userInfo.nickname;
            this.playerInfoList[key].getChildByName('text_result').getComponent(cc.Label).string = 0;
            window.Global.Tools.setWebImage(this.playerInfoList[key].getChildByName('mask').getChildByName('img_handNode').getComponent(cc.Sprite), userInfo.headimgurl);

            for (var i = 0; i < data.deal[key].length; i += 1) {
                this._appendCardToHandCardDistrict(key, data.deal[key][i]);
            }
            window.DDZ.Tools.orderCard(this.handCardDistrict[key].children);
        }

        var i = 0;
        this.schedule(function() {
            var obj = data.procedure[i];
            var keys = Object.keys(obj);
            if (keys[0] == 'discard') {
                this._addCardToDiscardDistrict(obj.discard[0], obj.discard[1]);
                this._deleteHandCardByCode(obj.discard[0], obj.discard[1]);
            }
            i += 1;
        }, 1, data.procedure.length - 1);
    },

    update() {
        this.roomInfo[4].string = window.Global.Tools.formatDatetime('hh:ii:ss');
    },

    onPauseAndResumeGameClick: function(event) {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        this._Cache.isPause = !this._Cache.isPause;
        if (this._Cache.isPause) {
            event.target.getChildByName('pause').active = false;
            event.target.getChildByName('resume').active = true;
            cc.director.pause();
        }
        else {
            event.target.getChildByName('pause').active = true;
            event.target.getChildByName('resume').active = false;
            cc.director.resume();
        }
    },

    onCloseClick: function () {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);

        window.Global.Animation.closeDialog(this.node);
    },

    /**
     * 设置房间信息
     *
     * @param {Object} data
     * @private
     */
    _setRoomInfo(data) {
        // 游戏玩法
        var playTypes = window.PX258.Config.playTypes[data.conf.game_uuid];
        var options = `0b${data.conf.options.toString(2)}`;

        if (data.conf.game_uuid == window.PX258.Config.gameUuid[2]) {
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

        this.roomInfo[0].string = `房间号: ${data.room_id}`;
        this.roomInfo[1].string = `局数: ${data.round}/${data.conf.max_rounds}`;
        this.roomInfo[2].string = 0;
    },

    /**
     * 添加牌到手牌区
     *
     * @param playerIndex
     * @param card
     * @private
     */
    _appendCardToHandCardDistrict(playerIndex, card) {
        var node = this._createCard(card);
        this.handCardDistrict[playerIndex].addChild(node);
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

    /**
     * 添加牌到打出去的区域
     *
     * @param playerIndex
     * @param cards
     * @private
     */
    _addCardToDiscardDistrict(playerIndex, cards) {
        this.actionSprite[playerIndex].children[0].active = false;
        this.dirtyCardDistrict[playerIndex].removeAllChildren();
        for (var i = 0; i < cards.length; i += 1) {
            var node = this._createCard(cards[i]);
            this.dirtyCardDistrict[playerIndex].addChild(node);
        }

        if (cards.length === 0) {
            this.actionSprite[playerIndex].children[0].active = true;
        }

        window.DDZ.Tools.orderCard(this.dirtyCardDistrict[playerIndex].children);
    },


    _deleteHandCardByCode(playerIndex, values) {
        var cardValues = values;

        for (var i = 0; i < this.handCardDistrict[playerIndex].children.length; i += 1) {
            var card = this.handCardDistrict[playerIndex].children[i];
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
});
