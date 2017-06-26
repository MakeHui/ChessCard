cc.Class({
    extends: cc.Component,

    properties: {
        playerList: [cc.Node],
        layout: cc.Layout,
    },

    // use this for initialization
    init(data) {
        this._Cache = data;
        cc.log(this._Cache);

        let bigLosser = 0;
        let bigWinner = 0;

        for (let i = 0; i < this._Cache.data.playerDataList.length; i += 1) {
            var playerData = this._Cache.data.playerDataList[i];
            var playerNode = this.playerList[playerData.seat];
            var userInfo = this._getUserInfoInList(playerData.playerUuid);
            var iswinchildren = playerNode.getChildByName('_iswin').children;

            window.Global.Tools.setWebImage(playerNode.getChildByName('headNode').getComponent(cc.Sprite), userInfo.headimgurl);
            playerNode.getChildByName('text_nick').getComponent(cc.Label).string = userInfo.nickname;

            if (playerData.isOwner === 1) {
                playerNode.getChildByName('roomHolderMark').active = true;
            }

            var detailList = playerNode.getChildByName('detailPanel');
            window.Global.Tools.findNode(detailList, 'item1>atlasLabel').getComponent(cc.Label).string = playerData.winDrawCnt;
            window.Global.Tools.findNode(detailList, 'item2>atlasLabel').getComponent(cc.Label).string = playerData.winDiscardCnt;
            window.Global.Tools.findNode(detailList, 'item3>atlasLabel').getComponent(cc.Label).string = playerData.paoCnt;
            window.Global.Tools.findNode(detailList, 'item4>atlasLabel').getComponent(cc.Label).string = playerData.kongConcealedCnt;
            window.Global.Tools.findNode(detailList, 'item5>atlasLabel').getComponent(cc.Label).string = playerData.kongExposedCnt;

            var totalScoreNode = window.Global.Tools.findNode(detailList, 'item6>atlasLabel');
            if (playerData.totalScore == 0) {
                iswinchildren[0].active = true;
                totalScoreNode.color = new cc.Color(151, 133, 32);
                totalScoreNode.getComponent(cc.Label).string = playerData.totalScore;
            }
            else if (playerData.totalScore > 0) {
                iswinchildren[1].active = true;
                totalScoreNode.color = new cc.Color(173, 106, 32);
                totalScoreNode.getComponent(cc.Label).string = `+ ${playerData.totalScore}`;
            }
            else {
                iswinchildren[2].active = true;
                totalScoreNode.color = new cc.Color(119, 117, 112);
                totalScoreNode.getComponent(cc.Label).string = `- ${playerData.totalScore}`;
            }

            if (bigLosser < playerData.paoCnt) {
                bigLosser = playerData.paoCnt;
            }

            if (bigWinner < playerData.totalScore) {
                bigWinner = playerData.totalScore;
            }
        }

        for (let i = 0; i < this._Cache.data.playerDataList.length; i += 1) {
            var playerData = this._Cache.data.playerDataList[i];
            var playerNode = this.playerList[playerData.seat];

            if (bigLosser === playerData.paoCnt) {
                playerNode.getChildByName('bigLosser').active = true;
            }

            if (bigWinner === playerData.totalScore) {
                playerNode.getChildByName('bigWinner').active = true;
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

    closeOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        this.node.destroy();
        cc.director.loadScene('Lobby');
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
