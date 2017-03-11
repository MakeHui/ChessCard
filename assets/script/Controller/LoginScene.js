cc.Class({
    extends: cc.Component,

    properties: {
        userAgreement: cc.Prefab,
        secretKey: cc.Prefab,
    },

    // use this for initialization
    onLoad() {
        cc.warn(window.UUID);

        window.userLocation = '该用户未公开地理位置';
        NativeExtensionManager.execute(['startLocation']);
        NativeExtensionManager.callback.addListener('startLocation', (data) => {
            window.userLocation = data.data;
        });
        // Global.backgroundMusic = Tools.audioEngine.init(Global.audioResourcesUrl.background.game, true);
        // Global.backgroundMusic.play();
        // Global.backgroundMusic.stop();
        // cc.warn(Global.backgroundMusic.state());
        // Global.backgroundMusic.play();
        // cc.warn("Login1");
    },

    /**
     * 登录接口
     */
    loginOnCLick() {
        const secretKey = NativeExtensionManager.execute(['getPasteboard']);
        if (!secretKey || secretKey.length !== 36) {
            cc.warn('LoginScene.loginOnCLick: 剪切板中没有数据');
            Global.openDialog(cc.instantiate(this.secretKey), this.node);
            return;
        }

        Global.loading.open(this.node);

        const parameters = { wxCode: secretKey, location: window.userLocation };
        HttpRequestManager.httpRequest('login', parameters, (event, result) => {
            if (result.getCode() === 1) {
                result = Tools.protobufToJson(result);
                result.location = window.userLocation;
                Tools.setLocalData(Global.localStorageKey.userInfo, result);
                Global.loading.close();
                cc.director.loadScene(Global.scene.lobby);
            }
        });
    },

    /**
     * 微信登录
     */
    wechatLoginOnClick() {
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
        Global.openDialog(cc.instantiate(this.userAgreement), this.node);
    },

});
