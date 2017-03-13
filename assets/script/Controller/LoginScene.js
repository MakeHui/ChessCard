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
        Global.loading.open(this.node);
        const parameters = { wxCode: secretKey, location: window.userLocation };
        HttpRequestManager.httpRequest('login', parameters, (event, result) => {
            if (result.getCode() === 1) {
                result = Tools.protobufToJson(result);
                result.location = Tools.getLocalData(Global.LSK.userInfo_location);
                Tools.setLocalData(Global.LSK.userInfo, result);
                Tools.setLocalData(Global.LSK.secretKey, secretKey);
                cc.director.loadScene('Lobby');
                Global.loading.close();
            }
            else {
                Global.loading.close();
            }
        });
    },

});
