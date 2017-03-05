cc.Class({
    extends: cc.Component,

    properties: {
        userAgreement: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        // Global.backgroundMusic = Tools.audioEngine.init(Global.audioResourcesUrl.background.game, true);
        // Global.backgroundMusic.play();
        // Global.backgroundMusic.stop();
        // cc.log(Global.backgroundMusic.state());
        // Global.backgroundMusic.play();
        // cc.log("Login1");
    },

    /**
     * 检查客户端更新
     */
    checkVersion: function() {
        let message = HttpRequestManager.getCheckVersionRequestMessage(123, "123", 1);
        HttpRequestManager.httpRequest(Global.httpRequestName.check, message, function(event, data) {
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
        Global.loading.open(this.node);

        let parameters = {wxCode: "fe8ad7d8-fcb3-11e6-b3d8-00163e10f210", location: "江西 南昌"};
        HttpRequestManager.httpRequest("login", parameters, function(event, result) {
            if (result.getCode() == 1) {
                result = Tools.protobufToJson(result);
                Tools.setLocalData(Global.localStorageKey.userInfo, result);
                
                Global.loading.close();
                cc.director.loadScene(Global.scene.lobby);
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
        // webSocketManager.openSocket("ws://game.7005.Global.qingwuguo.com/ws");
        // webSocketManager.addOncloseListener(function(evt) {
        //     cc.log("close");
        // });
        // webSocketManager.closeSocket();
    },

    /**
     * 用户协议
     */
    userAgreementOnClick: function(event, data) {
        this.wsUrl = 'ws://game.7005.Global.qingwuguo.com/ws';
        WebSocketManager.ws.openSocket(this.wsUrl);
        let self = this;
        WebSocketManager.ws.addOnmessageListener(function(evt) {
            window.xxxx = evt;
            self.test();
            let data = WebSocketManager.ArrayBuffer.reader(evt.data);
            window.xx2 = proto.game.EnterRoomResponse.deserializeBinary(data.data);
        });
        WebSocketManager.ws.addOnopenListener(function(evt) {
            WebSocketManager.sendMessage('EnterRoom', {roomId: 10000});
        });

        // Global.openDialog(cc.instantiate(this.userAgreement), this.node, function () {
        //     cc.log("load success");
        // });
    },

    test: function () {
        cc.log("test");
    }
});
