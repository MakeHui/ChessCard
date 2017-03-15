cc.Class({
    extends: cc.Component,

    properties: {
        userAgreement: cc.Prefab,
        secretKey: cc.Prefab,
    },

    // use this for initialization
    onLoad() {
        Global.appInit();

        NativeExtensionManager.execute('startLocation', [], (data) => {
            Tools.setLocalData(Global.LSK.userInfo_location, data.data);
        });

        // 判断本地存储中是否有秘钥
        const secretKey = Tools.getLocalData(Global.LSK.secretKey);
        cc.warn(secretKey);
        if (!secretKey) {
            cc.warn('LoginScene.loginOnCLick: 本地没有secretKey');
        }
        else {
            this._httpLogin(secretKey);
        }
    },

    /**
     * 登录接口
     */
    loginOnCLick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        // 判断剪切板中是否有秘钥
        const secretKey = NativeExtensionManager.execute('getPasteboard');
        if (!secretKey || secretKey.length !== 36) {
            cc.warn('LoginScene.loginOnCLick: 剪切板中没有数据');
            Global.openDialog(cc.instantiate(this.secretKey), this.node);
            return;
        }

        this._httpLogin(secretKey);
    },

    /**
     * 微信登录
     */
    wechatLoginOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        // webSocketManager.addOnopenListener(function(evt) {
        //     cc.warn("open");
        // });
        // webSocketManager.openSocket("ws://game.7005.Global.qingwuguo.com/ws");
        // webSocketManager.addOncloseListener(function(evt) {
        //     cc.warn("close");
        // });
        // webSocketManager.closeSocket();
    },


    /**
     * 用户协议
     */
    userAgreementOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.openDialog(cc.instantiate(this.userAgreement), this.node);
    },

    _httpLogin(secretKey) {
        Global.dialog.open('Loading', this.node);
        const parameters = { wxCode: secretKey, location: window.userLocation };
        HttpRequestManager.httpRequest('login', parameters, (event, result) => {
            try {
                Global.dialog.close();
            }
            catch (e) {
                cc.error(e);
            }

            if (result.code === 1) {
                result.location = Tools.getLocalData(Global.LSK.userInfo_location);
                Tools.setLocalData(Global.LSK.userInfo, result);
                Tools.setLocalData(Global.LSK.secretKey, secretKey);

                if (result.playerReconnection) {
                    Global.tempCache = { serverIp: result.playerServerIp, serverPort: result.playerServerPort, roomId: result.playerRoomId, reconnection: true };
                    cc.director.loadScene('GameRoom');
                }
                else {
                    cc.director.loadScene('Lobby');
                }
            }
            else {
                Global.tempCache = '登录失败, 秘钥错误';
                Global.dialog.open('Dialog', this.node);
            }
        });
    },

});
