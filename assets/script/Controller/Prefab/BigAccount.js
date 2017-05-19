cc.Class({
    extends: cc.Component,

    properties: {
        playerList: {
            default: [],
            type: cc.Node,
        },
    },

    // use this for initialization
    onLoad() {
        /*
         // string player_uuid = 1;  // 玩家UUID
         // uint32 seat = 2;  // 玩家座位号
         // int32 total_score = 3;  // 玩家总分
         // int32 top_score = 4;  // 玩家最高分
         // uint32 big_win_draw_cnt = 5;  // 玩家大胡自摸次数
         // uint32 big_win_discard_cnt = 6;  // 玩家大胡点炮胡次数
         // uint32 small_win_draw_cnt = 7;  // 玩家小胡自摸次数
         // uint32 small_win_discard_cnt = 8;  // 玩家小胡点炮胡次数
         // uint32 pao_cnt = 9;  // 玩家放炮次数
         // uint32 is_owner = 10;  // 是否为房主
         */

        if (!GlobalConfig.tempCache) {
            return;
        }

        let bigLosser = 0;
        let bigWinner = 0;

        for (let i = 0; i < GlobalConfig.tempCache.data.playerDataList.length; i += 1) {
            const playerData = GlobalConfig.tempCache.data.playerDataList[i];
            const playerNode = this.playerList[playerData.seat];
            const userInfo = this._getUserInfoInList(playerData.playerUuid);

            Tools.setWebImage(playerNode.getChildByName('headNode').getComponent(cc.Sprite), userInfo.headimgurl);
            playerNode.getChildByName('text_nick').getComponent(cc.Label).string = userInfo.nickname;

            if (playerData.isOwner === 1) {
                playerNode.getChildByName('roomHolderMark').active = true;
            }

            const detailList = playerNode.getChildByName('detailPanel');
            Tools.findNode(detailList, 'item1>atlasLable').getComponent(cc.Label).string = playerData.winDrawCnt;
            Tools.findNode(detailList, 'item2>atlasLable').getComponent(cc.Label).string = playerData.winDiscardCnt;
            Tools.findNode(detailList, 'item3>atlasLable').getComponent(cc.Label).string = playerData.paoCnt;
            Tools.findNode(detailList, 'item4>atlasLable').getComponent(cc.Label).string = playerData.kongConcealedCnt;
            Tools.findNode(detailList, 'item5>atlasLable').getComponent(cc.Label).string = playerData.kongExposedCnt;
            Tools.findNode(detailList, 'item6>atlasLable').getComponent(cc.Label).string = playerData.totalScore;

            if (bigLosser < playerData.paoCnt) {
                bigLosser = playerData.paoCnt;
            }

            if (bigWinner < playerData.totalScore) {
                bigWinner = playerData.totalScore;
            }
        }

        for (let i = 0; i < GlobalConfig.tempCache.data.playerDataList.length; i += 1) {
            const playerData = GlobalConfig.tempCache.data.playerDataList[i];
            const playerNode = this.playerList[playerData.seat];

            if (bigLosser === playerData.paoCnt) {
                playerNode.getChildByName('bigLosser').active = true;
            }

            if (bigWinner === playerData.totalScore) {
                playerNode.getChildByName('bigWinner').active = true;
            }
        }
    },

    wechatShareOnClick() {
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.buttonClick);
        // todo: 微信分享
    },

    closeOnClick() {
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.buttonClick);
        this.node.destroy();
        cc.director.loadScene('Lobby');
    },

    _getUserInfoInList(playerUuid) {
        for (let i = 0; i < GlobalConfig.tempCache.playerInfoList.length; i += 1) {
            const obj = GlobalConfig.tempCache.playerInfoList[i];
            if (obj.playerUuid === playerUuid) {
                return obj.info;
            }
        }
        return false;
    },

});
