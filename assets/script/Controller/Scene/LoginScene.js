cc.Class({
    extends: cc.Component,

    properties: {
        userAgreement: cc.Prefab,
        secretKey: cc.Prefab,
        agreeNode: cc.Node,
        loginButton: cc.Node,
        loginButtonBlock: cc.Node,
        loginButtonPanel: cc.Node,
        touristLoginButton: cc.Node,
        touristLoginButtonBlock: cc.Node,
        touristLoginpanel: cc.Node,
    },

    // use this for initialization
    onLoad() {
        var _hasNetwork = NativeExtensionManager.execute('checkNetwork');
        if (cc.sys.isNative && !_hasNetwork) {
            cc.log('LoginScene.onLoad: 没有网络');
            return;
        }

        // 检查是否在审核阶段
        var appleReview = window.Tools.getLocalData(GlobalConfig.LSK.appleReview);
        if (!appleReview) {
            this.touristLoginpanel.active = false;
        }
        else {
            this.loginButtonPanel.active = false;
        }

        // 判断本地存储中是否有秘钥
        var secretKey = window.Tools.getLocalData(GlobalConfig.LSK.secretKey);
        if (!secretKey) {
            cc.log('LoginScene.loginOnCLick: 本地没有secretKey');
        }
        else {
            this.httpLogin(secretKey, 'login');
        }
    },

    /**
     * 微信登录
     */
    loginOnCLick() {
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.buttonClick);

        var _hasNetwork = NativeExtensionManager.execute('checkNetwork');
        if (cc.sys.isNative && !_hasNetwork) {
            window.Dialog.openMessageBox('请链接网络');
            return;
        }

        // TODO: 微信登录
        // 是否安装了微信
        var isCheck = NativeExtensionManager.execute('wechatIsWxAppInstalled');
        if (!isCheck) {

        }
    },

    /**
     * 游客登录
     */
    touristLoginOnClick() {
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.buttonClick);

        var _hasNetwork = NativeExtensionManager.execute('checkNetwork');
        if (cc.sys.isNative && !_hasNetwork) {
            window.Dialog.openMessageBox('请链接网络');
            return;
        }

        Animation.openDialog(cc.instantiate(this.secretKey), this.node);
    },

    /**
     * 用户协议
     */
    userAgreementOnClick() {
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.buttonClick);
        Animation.openDialog(cc.instantiate(this.userAgreement), this.node);
    },

    isAgreeOnClick: function() {
        this.agreeNode.active = !this.agreeNode.active;
        if (this.agreeNode.active) {
            this.loginButton.active = true;
            this.loginButtonBlock.active = false;

            this.touristLoginButton.active = true;
            this.touristLoginButtonBlock.active = false;
        }
        else {
            this.loginButton.active = false;
            this.loginButtonBlock.active = true;

            this.touristLoginButton.active = false;
            this.touristLoginButtonBlock.active = true;
        }
    },

    httpLogin(secretKey, requestName) {
        window.Dialog.openLoading();
        this.scheduleOnce(function() {
            const parameters = { wxCode: secretKey, location: window.Tools.getLocalData(GlobalConfig.LSK.userInfo_location) };
            HttpRequestManager.httpRequest(requestName, parameters, (event, result) => {
                window.Dialog.close();

                if (result.code === 1) {
                    result.location = window.Tools.getLocalData(GlobalConfig.LSK.userInfo_location);
                    result.roomConfig = JSON.parse(result.roomConfig);
                    window.Tools.setLocalData(GlobalConfig.LSK.userInfo, result);
                    window.Tools.setLocalData(GlobalConfig.LSK.secretKey, result.loginKey);

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

});
