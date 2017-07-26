cc.Class({
    extends: cc.Component,

    properties: {
        playerList: [cc.Node],
        ownerUserInfo: cc.Node,
        info: [cc.Label],
    },

    // use this for initialization
    init(data) {
        this._Cache = data;
        cc.log(this._Cache);

        this.info[0].string = data.roomId;
        this.info[1].string = data.gameRule;

        var ownerInfo = this._getUserInfoInList(this._Cache.ownerUuid);
        this.ownerUserInfo.getChildByName('useNameID').getComponent(cc.Label).string = ownerInfo.nickname;
        window.Global.Tools.setWebImage(this.ownerUserInfo.getChildByName('usePhoto').getComponent(cc.Sprite), ownerInfo.headimgurl);

        var bigWinner = 0;

        for (let i = 0; i < this._Cache.data.playerDataList.length; i += 1) {
            var playerData = this._Cache.data.playerDataList[i];
            var playerNode = this.playerList[playerData.seat];
            var userInfo = this._getUserInfoInList(playerData.playerUuid);

            window.Global.Tools.setWebImage(playerNode.getChildByName('usePhoto').getComponent(cc.Sprite), userInfo.headimgurl);
            playerNode.getChildByName('useNameID').getComponent(cc.Label).string = userInfo.nickname;
            playerNode.getChildByName('pscore2').getComponent(cc.Label).string = playerData.topScore;
            playerNode.getChildByName('pscore3').getComponent(cc.Label).string = playerData.allBoomCnt;
            playerNode.getChildByName('pscore4').getComponent(cc.Label).string = `${playerData.winTotalCnt}胜${playerData.loseTotalCnt}负`;
            playerNode.getChildByName('pscore5').getComponent(cc.Label).string = playerData.totalScore;

            if (bigWinner < playerData.totalScore) {
                bigWinner = playerData.totalScore;
            }
        }

        for (let i = 0; i < this._Cache.data.playerDataList.length; i += 1) {
            var playerData = this._Cache.data.playerDataList[i];
            var playerNode = this.playerList[playerData.seat];

            if (bigWinner === playerData.totalScore) {
                playerNode.getChildByName('winner').active = true;
            }
            else {
                playerNode.getChildByName('lost').active = true;
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
