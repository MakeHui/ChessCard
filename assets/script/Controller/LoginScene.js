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
        this.roomId = 100000;
        let self = this;
        let scriptName = 'GameRoomScene';

        WebSocketManager.ws.openSocket(this.wsUrl);
        WebSocketManager.ws.addOnopenListener(scriptName, function (evt) {
            WebSocketManager.sendMessage('EnterRoom', {roomId: self.roomId});
        });
        WebSocketManager.ws.addOnmessageListener(scriptName, function (evt, commandName, result) {
            self['on' + commandName + 'Callback'](result);
        });
        WebSocketManager.ws.addOnerrorListener(scriptName, function (evt) {

        });
        WebSocketManager.ws.addOncloseListener(scriptName, function (evt) {

        });
    }
});
