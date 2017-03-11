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

        if (!Global.tempCache) {
            return;
        }

        let bigLosser = 0;
        let bigWinner = 0;

        for (let i = 0; i < Global.tempCache.data.playerDataList.length; i += 1) {
            const playerData = Global.tempCache.data.playerDataList[i];
            const playerNode = this.playerList[playerData.seat];
            const avatar = playerNode.getChildByName('headNode').getComponent(cc.Sprite);

            Tools.setWebImage(avatar, this._getAvatarInList(playerData.playerUuid));
            playerNode.getChildByName('text_nick').getComponent(cc.Label).string = this._getNicknameInList(playerData.playerUuid);

            if (playerData.isOwner === 1) {
                playerNode.getChildByName('roomHolderMark').active = true;
            }

            const detailList = playerNode.getChildByName('detailPanel').children;
            for (let j = 0; j < detailList.length; j += 1) {
                const obj = playerData[j];
                if (i === 0) {
                    obj.getChildByName('atlasLable').getComponent(cc.Label).string = playerData.bigWinDrawCnt;
                }
                else if (i === 1) {
                    obj.getChildByName('atlasLable').getComponent(cc.Label).string = playerData.bigWinDiscardCnt;
                }
                else if (i === 2) {
                    obj.getChildByName('atlasLable').getComponent(cc.Label).string = playerData.smallWinDrawCnt;
                }
                else if (i === 3) {
                    obj.getChildByName('atlasLable').getComponent(cc.Label).string = playerData.smallWinDiscardCnt;
                }
                else if (i === 4) {
                    obj.getChildByName('atlasLable').getComponent(cc.Label).string = playerData.paoCnt;
                }
                else if (i === 5) {
                    obj.getChildByName('atlasLable').getComponent(cc.Label).string = playerData.totalScore;
                }
            }

            if (bigLosser < playerData.paoCnt) {
                bigLosser = playerData.paoCnt;
            }

            if (bigWinner < playerData.totalScore) {
                bigWinner = playerData.totalScore;
            }
        }

        for (let i = 0; i < Global.tempCache.data.playerDataList.length; i += 1) {
            const playerData = Global.tempCache.data.playerDataList[i];
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
        // todo: 微信分享
    },

    closeOnClick() {
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
    },

    _getAvatarInList(playerUuid) {
        for (let i = 0; i < Global.tempCache.playerInfoList.length; i += 1) {
            const obj = Global.tempCache.playerInfoList[i];
            if (obj.playerUuid === playerUuid) {
                return obj.headimgurl;
            }
        }
        return false;
    },

});
