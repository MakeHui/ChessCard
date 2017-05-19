cc.Class({
    extends: cc.Component,

    properties: {
        cardMarkPrefab: cc.Prefab,

        // 牌面资源
        cardPinList: cc.SpriteAtlas,

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
        exposedPrefab: [cc.Prefab],     // 明杠
        concealedKongPrefab: [cc.Prefab],   // 暗杠

        playerInfoList: [cc.Node],
        roomInfo: [cc.Label],

        // 动作相关
        actionSprite: [cc.Node],
        actionSpriteFrame: [cc.SpriteFrame],
    },

    init: function(data) {
        this._Cache = data;
        this._Cache.isPause = false;
        this._userInfo = window.Tools.getLocalData(GlobalConfig.LSK.userInfo);
        this._setRoomInfo(data.conf, data.round, 84);
        this.playerInfoList[data.dealer].getChildByName('img_zhuang').active = true;

        for (var key in data.user) {
            var userInfo = JSON.parse(data.user[key][1]);
            this.playerInfoList[key].getChildByName('text_nick').getComponent(cc.Label).string = userInfo.nickname;
            this.playerInfoList[key].getChildByName('text_result').getComponent(cc.Label).string = 0;
            Tools.setWebImage(this.playerInfoList[key].getChildByName('img_handNode').getComponent(cc.Sprite), userInfo.headimgurl);

            for (var i = 0; i < data.deal[key].length; i += 1) {
                this._appendCardToHandCardDistrict(key, data.deal[key][i]);
            }
            window.Tools.cardsSort(this.handCardDistrict[key].children);
        }

        var i = 0;
        this.schedule(function() {
            var obj = data.procedure[i];
            var keys = Object.keys(obj);
            if (keys[0] == 'draw') {
                this.getHandcard[obj.draw[0]]._userData = obj.draw[1];
                var nodeSprite = window.Tools.findNode(this.getHandcard[obj.draw[0]], 'GetHandCard>value').getComponent(cc.Sprite);
                nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${obj.draw[1].toString(16)}`);
                this.getHandcard[obj.draw[0]].active = true;
                this.roomInfo[3].string = '剩余牌数: ' + (this._Cache.restCards -= 1);
            }
            else if (keys[0] == 'discard') {
                if (this.getHandcard[obj.discard[0]].active) {
                    this.getHandcard[obj.discard[0]].active = false;
                    this._appendCardToHandCardDistrict(obj.discard[0], this.getHandcard[obj.discard[0]]._userData);
                    window.Tools.cardsSort(this.handCardDistrict[obj.discard[0]].children);
                }
                this._deleteHandCardByCode(obj.discard[0], obj.discard[1]);
                this._Cache.activeCard = this._appendCardToDiscardDistrict(obj.discard[0], obj.discard[1]);
                this._createActiveCardFlag(obj.discard[0]);
                window.SoundEffect.playEffect(window.PX258Config.audioUrl.common[this._userInfo.sex === 1 ? 'man' : 'woman'][obj.discard[1]]);
            }
            else {
                for (var j = 0; j < obj.length; j += 1) {
                    this.onAction(obj[j].seat, obj[j].action);
                }
            }
            i += 1;
        }, 0.5, data.procedure.length - 1);
    },

    update() {
        this.roomInfo[0].string = Tools.formatDatetime('hh:ii:ss');
    },

    onAction: function(playerIndex, data) {
        if (data.prompt === window.PX258Config.promptType.Chow) {
            window.SoundEffect.playEffect(window.PX258Config.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].chow);

            // 删除需要删除的手牌
            for (let i = 0; i < data.ref_cards.length; i += 1) {
                const obj = data.ref_cards[i];
                this._deleteHandCardByCode(playerIndex, obj);
            }
            this._Cache.activeCard.destroy();

            data.ref_cards.push(data.op_card);
            data.ref_cards.sort((a, b) => {
                return a - b;
            });
            this._appendChowToDistrict(playerIndex, data.ref_cards);

            this.actionSprite[playerIndex].getComponent(cc.Sprite).spriteFrame = this.actionSpriteFrame[0];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }
        else if (data.prompt === window.PX258Config.promptType.Pong) {
            window.SoundEffect.playEffect(window.PX258Config.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].pong);

            // 删除需要删除的手牌
            for (let i = 0; i < data.ref_cards.length; i += 1) {
                const obj = data.ref_cards[i];
                this._deleteHandCardByCode(playerIndex, obj);
            }
            this._Cache.activeCard.destroy();

            data.ref_cards.push(data.op_card);
            this._appendPongToDistrict(playerIndex, data.ref_cards);

            this.actionSprite[playerIndex].getComponent(cc.Sprite).spriteFrame = this.actionSpriteFrame[1];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }
        else if (data.prompt === window.PX258Config.promptType.kongExposed) {
            window.SoundEffect.playEffect(window.PX258Config.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].kong);

            // 删除需要删除的手牌
            for (let i = 0; i < data.ref_cards.length; i += 1) {
                const obj = data.ref_cards[i];
                this._deleteHandCardByCode(playerIndex, obj);
            }
            this._Cache.activeCard.destroy();

            data.ref_cards.push(data.op_card);
            this._appendExposedToDistrict(playerIndex, data.ref_cards);

            this.actionSprite[playerIndex].getComponent(cc.Sprite).spriteFrame = this.actionSpriteFrame[2];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }
        else if (data.prompt === window.PX258Config.promptType.KongConcealed) {
            window.SoundEffect.playEffect(window.PX258Config.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].ankong);

            // 删除需要删除的手牌
            if (this.getHandcard[playerIndex].active) {
                var card = this.getHandcard[playerIndex]._userData;
                this.getHandcard[playerIndex].active = false;
                this._appendCardToHandCardDistrict(playerIndex, card);
            }
            for (var i = 0; i < 4; i += 1) {
                this._deleteHandCardByCode(playerIndex, data.ref_cards[0]);
            }

            this._appendConcealedKongToDistrict(playerIndex, data.ref_cards);

            this.actionSprite[playerIndex].getComponent(cc.Sprite).spriteFrame = this.actionSpriteFrame[2];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }
        else if (data.prompt === window.PX258Config.promptType.KongPong) {
            window.SoundEffect.playEffect(window.PX258Config.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].kong);

            // 删除需要删除的手牌
            if (this.getHandcard[playerIndex].active) {
                var card = this.getHandcard[playerIndex]._userData;
                this.getHandcard[playerIndex].active = false;
                this._appendCardToHandCardDistrict(playerIndex, card);
            }
            this._deleteHandCardByCode(playerIndex, data.ref_cards[0]);

            // 删除碰
            for (var i = 0; i < this.pongKongChowDistrict[playerIndex].childrenCount; i += 1) {
                const children = this.pongKongChowDistrict[playerIndex].children[i];
                if (children._userData && children._userData[0] == data.ref_cards[0]) {
                    children.destroy();
                    break;
                }
            }

            // 添加杠
            this._appendExposedToDistrict(playerIndex, data.ref_cards);

            this.actionSprite[playerIndex].getComponent(cc.Sprite).spriteFrame = this.actionSpriteFrame[2];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }
        else if (data.prompt === window.PX258Config.promptType.WinDraw) {
            window.SoundEffect.playEffect(window.PX258Config.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].zimo);

            // todo: 胡牌动画, 更改为胡了之后显示该张牌
            this.actionSprite[playerIndex].getComponent(cc.Sprite).spriteFrame = this.actionSpriteFrame[3];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }
        else if (data.prompt === window.PX258Config.promptType.WinDiscard) {
            window.SoundEffect.playEffect(window.PX258Config.audioUrl.common[this._userInfo.sex == 1 ? 'man' : 'woman'].win);

            // todo: 胡牌动画, 更改为胡了之后显示该张牌
            this.actionSprite[playerIndex].getComponent(cc.Sprite).spriteFrame = this.actionSpriteFrame[3];
            this.actionSprite[playerIndex].getComponent(cc.Animation).play();
        }
    },

    onPauseAndResumeGameClick: function(event) {
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.buttonClick);
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
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.buttonClick);

        window.Animation.closeDialog(this.node);
    },

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
     * @param playerIndex
     * @param card
     * @private
     */
    _appendCardToHandCardDistrict(playerIndex, card) {
        var node = cc.instantiate(this.handCardPrefabs[playerIndex]);
        this.handCardDistrict[playerIndex].addChild(node);

        node._userData = card;
        var findPath = [0, 3].indexOf(parseInt(playerIndex, 10)) != -1 ? 'Background>value' : 'Mask>Background>value';

        var nodeSprite = Tools.findNode(node, findPath).getComponent(cc.Sprite);
        nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${card.toString(16)}`);
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
            var nodeSprite = Tools.findNode(node, 'Background>value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[0].toString(16)}`);
        }
    },

    /**
     * 明杠
     *
     * @param playerIndex
     * @param data
     * @private
     */
    _appendExposedToDistrict(playerIndex, data) {
        var node = cc.instantiate(this.exposedPrefab[playerIndex]);
        this.pongKongChowDistrict[playerIndex].addChild(node);

        for (var i = 0; i < 4; i += 1) {
            var nodeSprite = Tools.findNode(node.children[i], 'show>value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[0].toString(16)}`);
        }
    },

    /**
     * 碰
     *
     * @param playerIndex
     * @param data
     * @private
     */
    _appendPongToDistrict(playerIndex, data) {
        var node = cc.instantiate(this.pongPrefab[playerIndex]);
        node._userData = data;
        this.pongKongChowDistrict[playerIndex].addChild(node);

        for (var i = 0; i < data.length; i += 1) {
            var nodeSprite = Tools.findNode(node.children[i], 'show>value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[i].toString(16)}`);
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
            return a - b;
        });

        for (var i = 0; i < data.length; i += 1) {
            var nodeSprite = node.children[i].getChildByName('value').getComponent(cc.Sprite);
            nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data[i].toString(16)}`);
        }
    },

    /**
     * 添加牌到打出去的区域
     *
     * @param playerIndex
     * @param data
     * @return cc.Node
     * @private
     */
    _appendCardToDiscardDistrict(playerIndex, data) {
        var node = cc.instantiate(this.dirtyCardPrefabs[playerIndex]);
        var findPath = [0, 3].indexOf(playerIndex) != -1 ? 'Background>value' : 'Mask>Background>value';
        var nodeSprite = Tools.findNode(node, findPath).getComponent(cc.Sprite);

        // TODO: 处理特殊排列问题
        if (playerIndex === 1) {
            if (this.dirtyCardDistrict[playerIndex].childrenCount % 10 !== 0) {
                node.getChildByName('Mask').height = 60;
            }
        }
        else if (playerIndex === 2) {
            if (this.dirtyCardDistrict[playerIndex].childrenCount >= 10) {
                node.getChildByName('Mask').height = 81;
            }
        }

        nodeSprite.spriteFrame = this.cardPinList.getSpriteFrame(`value_0x${data.toString(16)}`);
        this.dirtyCardDistrict[playerIndex].addChild(node);

        return node;
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
        const playTypes = window.PX258Config.playTypes[info.game_uuid];
        info.options = `0x${info.options.toString(16)}`;
        const num = info.options & 0x1;

        this.roomInfo[4].string = `玩法: ${playTypes.playType[num]}\n封顶: ${playTypes.options[info.options ^ num]}`;
        this.roomInfo[1].string = `房间号: ${this._Cache.room_id}`;
        this.roomInfo[2].string = `局数: ${currentRound}/${info.max_rounds}`;
        this.roomInfo[3].string = `剩余牌数: ${restCards}`;

        this._Cache.restCards = restCards;
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
        }
    },

    _deleteActiveCardFlag() {
        if (this._Cache.activeCardFlag) {
            this._Cache.activeCardFlag.destroy();
        }
    },

});
