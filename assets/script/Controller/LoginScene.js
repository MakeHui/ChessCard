cc.Class({
    extends: cc.Component,

    properties: {
        userAgreement: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        // PX258.backgroundMusic = Tools.audioEngine.init(PX258.audioResourcesUrl.background.game, true);
        // PX258.backgroundMusic.play();
        // PX258.backgroundMusic.stop();
        // cc.log(PX258.backgroundMusic.state());
        // PX258.backgroundMusic.play();
        // cc.log("Login1");
    },

    /**
     * 检查客户端更新
     */
    checkVersion: function() {
        let message = httpRequestManager.getCheckVersionRequestMessage(123, "123", 1);
        httpRequestManager.httpRequest(PX258.httpRequestName.check, message, function(event, data) {
            data = proto.login.CheckVersionResponse.deserializeBinary(data);
            cc.log(event);
            cc.log(data.getCode());
            cc.log(data.getMandatoryUpdate());
            cc.log(data.getDownloadLink());
        });
    },

    /**
     * 登录接口
     */
    loginOnCLick: function(event, data) {
        PX258.loading.open(this.node);

        let parameters = {wxCode: "fe8ad7d8-fcb3-11e6-b3d8-00163e10f210", location: "江西 南昌"};
        let message = httpRequestManager.getLoginRequestMessage(parameters);
        httpRequestManager.httpRequest("login", message, function(event, result) {
            if (result.getCode() == 1) {
                result = Tools.protobufToJson(result);
                Tools.setLocalData(PX258.localStorageKey.userInfo, result);
                
                PX258.loading.close();
                cc.director.loadScene(PX258.scene.lobby);
            }
        });
    },

    /**
     * 微信登录
     */
    wechatLoginOnClick: function(event, data) {
        

        // webSocketManager.addOnopenListener(function(evt) {
        //     cc.log("open");
        // });
        // webSocketManager.openSocket("ws://game.7005.px258.qingwuguo.com/ws");
        // webSocketManager.addOncloseListener(function(evt) {
        //     cc.log("close");
        // });
        // webSocketManager.closeSocket();
    },

    /**
     * 用户协议
     */
    userAgreementOnClick: function(event, data) {
        cc.log("xxxxxxx");
        PX258.openDialog(cc.instantiate(this.userAgreement), this.node, function () {
            cc.log("load success");
        });
    }
});
