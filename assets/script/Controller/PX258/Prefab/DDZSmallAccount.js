cc.Class({
    extends: cc.Component,

    properties: {
        playerList: [cc.Node],
    },

    init(data) {
        this._Cache = data;

        for (let i = 0; i < this._Cache.data.playerDataList.length; i += 1) {
            var playerData = this._Cache.data.playerDataList[i];
            var playerNode = this.playerList[i];
            var userInfo = this._getUserInfoInList(playerData.playerUuid);

            window.Global.Tools.setWebImage(playerNode.getChildByName('usePhoto').getComponent(cc.Sprite), userInfo.headimgurl);
            playerNode.getChildByName('useNameID').getComponent(cc.Label).string = userInfo.nickname;
            playerNode.getChildByName('pscore2').getComponent(cc.Label).string = playerData.cardsInHandList.length;
            playerNode.getChildByName('pscore3').getComponent(cc.Label).string = playerData.bombCount;
            playerNode.getChildByName('pscore4').getComponent(cc.Label).string = playerData.score;

            if (playerData.isWin === 1) {
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

    gameAgenOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        const node = cc.director.getScene().getChildByName('Canvas');
        node.getComponent('DDZGameRoomScene').readyGameCallback();
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
