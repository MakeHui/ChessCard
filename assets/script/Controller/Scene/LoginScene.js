cc.Class({
    extends: cc.Component,

    properties: {
        userAgreement: cc.Prefab,
        secretKey: cc.Prefab,
        agreeNode: cc.Node,
        appUpdatePrefab: cc.Prefab,
    },

    // use this for initialization
    onLoad() {
        const hasNetwork = NativeExtensionManager.execute('checkNetwork');
        if (!hasNetwork && cc.sys.isNative) {
            cc.log('LoginScene.onLoad: 没有网络');
            return;
        }

        // 检查应用更新
        this.httpCheckUpdate(function() {
            // 判断本地存储中是否有秘钥
            const secretKey = Tools.getLocalData(GlobalConfig.LSK.secretKey);
            if (!secretKey) {
                cc.log('LoginScene.loginOnCLick: 本地没有secretKey');
            }
            else {
                this.httpLogin(secretKey, 'login');
            }
        }.bind(this));

        NativeExtensionManager.execute('startLocation', [], (result) => {
            Tools.setLocalData(GlobalConfig.LSK.userInfo_location, result.data);
        });
    },

    /**
     * 登录接口
     */
    loginOnCLick() {
        window.SoundEffect.playEffect(GlobalConfig.audioUrl.effect.buttonClick);
        // 判断剪切板中是否有秘钥
        var isCheck = NativeExtensionManager.execute('wechatIsWxAppInstalled');
        if (!isCheck) {
            Animation.openDialog(cc.instantiate(this.secretKey), this.node);
        }

        // TODO: 微信登录
    },

    /**
     * 微信登录
     */
    wechatLoginOnClick() {
        window.SoundEffect.playEffect(GlobalConfig.audioUrl.effect.buttonClick);
    },


    /**
     * 用户协议
     */
    userAgreementOnClick() {
        window.SoundEffect.playEffect(GlobalConfig.audioUrl.effect.buttonClick);
        Animation.openDialog(cc.instantiate(this.userAgreement), this.node);
    },

    isAgreeOnClick: function() {
        this.agreeNode.active = !this.agreeNode.active;
    },

    httpLogin(secretKey, requestName) {
        window.Dialog.openLoading();
        this.scheduleOnce(function() {
            const parameters = { wxCode: secretKey, location: Tools.getLocalData(GlobalConfig.LSK.userInfo_location) };
            HttpRequestManager.httpRequest(requestName, parameters, (event, result) => {
                window.Dialog.close();

                if (result.code === 1) {
                    result.location = Tools.getLocalData(GlobalConfig.LSK.userInfo_location);
                    result.roomConfig = JSON.parse(result.roomConfig);
                    Tools.setLocalData(GlobalConfig.LSK.userInfo, result);
                    Tools.setLocalData(GlobalConfig.LSK.secretKey, result.loginKey);

                    if (result.playerReconnection) {
                        GlobalConfig.tempCache = { serverIp: result.playerServerIp, serverPort: result.playerServerPort, roomId: result.playerRoomId, reconnection: true };
                        cc.director.loadScene('GameRoom');
                    }
                    else {
                        cc.director.loadScene('Lobby');
                    }
                    return;
                }

                if (requestName !== 'login') {
                    if (result.code === 1011) {
                        window.Dialog.openMessageBox('登陆失败，验证码错误');
                    }
                    else if (result.code === 1012) {
                        window.Dialog.openMessageBox('登陆失败，账号被封');
                    }
                    else if (result.code === 1013) {
                        window.Dialog.openMessageBox('登陆失败，验证码过期');
                    }
                    else if (result.code === 1031) {
                        window.Dialog.openMessageBox('登陆失败，请稍后重试');
                    }
                }
            });
        }, 1.5);
    },

    httpCheckUpdate(callback) {
        HttpRequestManager.httpRequest('check', [], (event, result) => {
            if (result.code === 1000) {
                var node = cc.instantiate(this.appUpdatePrefab);
                node.init(result, function() {
                    callback();
                });
                Animation.openDialog(node, this.node);
            }
            else {
                callback();
            }
        });
    },

});
