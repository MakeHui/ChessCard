cc.Class({
    extends: cc.Component,

    properties: {
        userAgreement: cc.Prefab,
        secretKey: cc.Prefab,
    },

    // use this for initialization
    onLoad() {
        const hasNetwork = NativeExtensionManager.execute('checkNetwork');
        if (!hasNetwork && cc.sys.isNative) {
            cc.log('LoginScene.onLoad: 没有网络');
            return;
        }

        NativeExtensionManager.execute('startLocation', [], (result) => {
            Tools.setLocalData(Global.LSK.userInfo_location, result.data);
        });

        // 判断本地存储中是否有秘钥
        const secretKey = Tools.getLocalData(Global.LSK.secretKey);
        if (!secretKey) {
            cc.log('LoginScene.loginOnCLick: 本地没有secretKey');
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
            cc.log('LoginScene.loginOnCLick: 剪切板中没有数据');
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
    },


    /**
     * 用户协议
     */
    userAgreementOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.openDialog(cc.instantiate(this.userAgreement), this.node);
    },

    httpLogin(secretKey, requestName) {
        Dialog.openLoading();
        this.scheduleOnce(function() {
            const parameters = { wxCode: secretKey, location: Tools.getLocalData(Global.LSK.userInfo_location) };
            HttpRequestManager.httpRequest(requestName, parameters, (event, result) => {
                Dialog.close();

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

                if (requestName !== 'login') {
                    if (result.code === 1011) {
                        Dialog.openMessageBox('登陆失败，验证码错误');
                    }
                    else if (result.code === 1012) {
                        Dialog.openMessageBox('登陆失败，账号被封');
                    }
                    else if (result.code === 1013) {
                        Dialog.openMessageBox('登陆失败，验证码过期');
                    }
                    else if (result.code === 1031) {
                        Dialog.openMessageBox('登陆失败，请稍后重试');
                    }
                }
            });
        }, 1.5);
    },

});
