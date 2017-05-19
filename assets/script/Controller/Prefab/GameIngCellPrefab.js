cc.Class({
    extends: cc.Component,

    properties: {
        roomNumber: cc.Label,
        avatar: [cc.Sprite],
        nickname: [cc.Label],
        playerPanel: [cc.Node],
    },

    onLoad () {
        // 没有安装微信, 不显示分享按钮
        if (!window.Global.NativeExtensionManager.execute('wechatIsWxAppInstalled')) {
            window.Global.Tools.findNode(this.node, 'btn_share').active = false;
        }
    },

    enterGameRoomOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Dialog.openLoading();

        const parameters = { roomId: this._Cache.roomId };
        HttpRequestManager.httpRequest('roomEnter', parameters, (event, result) => {
            if (result.code === 1) {
                GlobalConfig.tempCache = result;
                cc.director.loadScene('GameRoom');
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
            Tools.setWebImage(this.avatar[i], player[i].headimgurl);
            this.nickname[i].string = player[i].playerName;
            this.playerPanel[i].active = true;
        }
        this.roomNumber.string = `房间号: ${data.roomId}`;
    },
});
