cc.Class({
    extends: cc.Component,

    properties: {
        roomNumber: cc.Label,
        gameName: cc.Label,
        avatar: [cc.Sprite],
        nickname: [cc.Label],
        playerPanel: [cc.Node],
    },

    enterGameRoomOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Dialog.openLoading();

        const parameters = { roomId: this._Cache.roomId };
        window.Global.NetworkManager.httpRequest(window.PX258.NetworkConfig.HttpRequest.roomEnter, parameters, (event, result) => {
            if (result.code === 1) {
                window.Global.Config.tempCache = result;
                if (result.gameUuid ==  window.PX258.Config.gameUuid[0]) {
                    cc.director.loadScene('GameRoom');
                }
                else if (result.gameUuid ==  window.PX258.Config.gameUuid[1]) {
                    cc.director.loadScene('GameRoom');
                }
                else if (result.gameUuid == window.PX258.Config.gameUuid[2]) {
                    cc.director.loadScene('DDZGameRoom');
                }
            }
            else {
                window.Global.Dialog.close();
            }
        });
    },

    wechatShareOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);

        const hasWechat = window.Global.NativeExtensionManager.execute('wechatIsWxAppInstalled');
        if (!hasWechat) {
            cc.log('MyRoomPrefab.shareOnClick: 没有安装微信');
            return;
        }

        var shareInfo = window.Global.Tools.createWechatShareInfo(JSON.parse(this._Cache.config), this._Cache.roomId);
        window.Global.NativeExtensionManager.execute('wechatLinkShare', [window.Global.Config.downloadPage, shareInfo[0], shareInfo[1]]);
        cc.log('shareOnClick');
    },

    init: function(data) {
        this._Cache = data;
        const player = data.playerList;
        for (let i = 0; i < player.length; i += 1) {
            window.Global.Tools.setWebImage(this.avatar[i], player[i].headimgurl);
            this.nickname[i].string = player[i].playerName;
            this.playerPanel[i].active = true;
        }
        this.roomNumber.string = `房间号: ${data.roomId}`;
        this.gameName.string = window.PX258.Config.playTypes[data.gameUuid].name;
    },
});
