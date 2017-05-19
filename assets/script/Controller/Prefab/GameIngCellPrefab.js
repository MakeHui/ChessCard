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
        if (!NativeExtensionManager.execute('wechatIsWxAppInstalled')) {
            window.Tools.findNode(this.node, 'btn_share').active = false;
        }
    },

    enterGameRoomOnClick() {
        window.SoundEffect.playEffect(GlobalConfig.audioUrl.effect.buttonClick);
        window.Dialog.openLoading();

        const parameters = { roomId: this._Cache.roomId };
        HttpRequestManager.httpRequest('roomEnter', parameters, (event, result) => {
            if (result.code === 1) {
                GlobalConfig.tempCache = result;
                cc.director.loadScene('GameRoom');
            }
            else {
                window.Dialog.close();
            }
        });
    },

    wechatShareOnClick() {
        window.SoundEffect.playEffect(GlobalConfig.audioUrl.effect.buttonClick);

        const hasWechat = NativeExtensionManager.execute('wechatIsWxAppInstalled');
        if (!hasWechat) {
            cc.log('MyRoomPrefab.shareOnClick: 没有安装微信');
            return;
        }

        var shareInfo = window.Tools.createWechatShareInfo(JSON.parse(this._Cache.config), this._Cache.roomId);
        NativeExtensionManager.execute('wechatLinkShare', [GlobalConfig.px258.downloadPage, shareInfo[0], shareInfo[1]]);
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
