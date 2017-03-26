cc.Class({
    extends: cc.Component,

    properties: {
        userAgreement: cc.Prefab,
        secretKey: cc.Prefab,
    },

    // use this for initialization
    onLoad() {
        Global.log('LoginScene');
        NativeExtensionManager.execute('startLocation', [], (data) => {
            Tools.setLocalData(Global.LSK.userInfo_location, data.data);
        });

        // 判断本地存储中是否有秘钥
        const secretKey = Tools.getLocalData(Global.LSK.secretKey);
        Global.log(secretKey);
        if (!secretKey) {
            Global.log('LoginScene.loginOnCLick: 本地没有secretKey');
        }
        else {
            this.httpLogin(secretKey, 'login');
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
            Global.log('LoginScene.loginOnCLick: 剪切板中没有数据');
            Global.openDialog(cc.instantiate(this.secretKey), this.node);
            return;
        }

        this.httpLogin(secretKey, 'login');
    },

    /**
     * 微信登录
     */
    wechatLoginOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        // webSocketManager.addOnopenListener(function(evt) {
        //     Global.log("open");
        // });
        // webSocketManager.openSocket("ws://game.7005.Global.qingwuguo.com/ws");
        // webSocketManager.addOncloseListener(function(evt) {
        //     Global.log("close");
        // });
        // webSocketManager.closeSocket();
    },


    /**
     * 用户协议
     */
    userAgreementOnClick() {
        // jsb.reflection.callStaticMethod('com/huyaohui/cocos/extension/CocosExtensionTest', 'test');
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.openDialog(cc.instantiate(this.userAgreement), this.node);
    },

    httpLogin(secretKey, requestName) {
        Global.dialog.open('Loading', this.node);
        const parameters = { wxCode: secretKey, location: window.userLocation };
        HttpRequestManager.httpRequest(requestName, parameters, (event, result) => {
            Global.dialog.close();

            if (result.code === 1) {
                result.location = Tools.getLocalData(Global.LSK.userInfo_location);
                Tools.setLocalData(Global.LSK.userInfo, result);
                Tools.setLocalData(Global.LSK.secretKey, result.loginKey);

                if (result.playerReconnection) {
                    Global.tempCache = { serverIp: result.playerServerIp, serverPort: result.playerServerPort, roomId: result.playerRoomId, reconnection: true };
                    cc.director.loadScene('GameRoom');
                }
                else {
                    cc.director.loadScene('Lobby');
                }
                return;
            }

            if (result.code === 1011) {
                Global.tempCache = '登陆失败，用户不存在';
            }
            else if (result.code === 1012) {
                Global.tempCache = '登陆失败，账号被封';
            }
            else if (result.code === 1013) {
                Global.tempCache = '登陆失败，验证码过期';
            }
            else if (result.code === 1031) {
                Global.tempCache = '登陆失败，请稍后重试';
            }
            Global.dialog.open('Dialog', this.node);
        });
    },

});
