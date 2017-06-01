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
        var _hasNetwork = window.Global.NativeExtensionManager.execute('checkNetwork');
        if (cc.sys.isNative && !_hasNetwork) {
            cc.log('LoginScene.onLoad: 没有网络');
            return;
        }

        // 检查是否在审核阶段
        var appleReview = window.Global.Tools.getLocalData(window.Global.Config.LSK.appleReview);
        if (!appleReview) {
            this.touristLoginpanel.active = false;
        }
        else {
            this.loginButtonPanel.active = false;
        }

        // 判断本地存储中是否有秘钥
        var secretKey = window.Global.Tools.getLocalData(window.Global.Config.LSK.secretKey);
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
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);

        var _hasNetwork = window.Global.NativeExtensionManager.execute('checkNetwork');
        if (cc.sys.isNative && !_hasNetwork) {
            window.Global.Dialog.openMessageBox('请链接网络');
            return;
        }

        // 是否安装了微信
        var isCheck = window.Global.NativeExtensionManager.execute('wechatIsWxAppInstalled');
        if (!isCheck) {
            window.Global.Dialog.openMessageBox('请先安装微信');
        }

        const self = this;
        window.Global.NativeExtensionManager.execute('wechatLogin', [], (result) => {
            if (result.result == 0) {
                self.httpLogin(result.data, 'wechatLogin');
            }
            else {
                window.Global.Dialog.openMessageBox('微信登录失败');
            }
        });
    },

    /**
     * 游客登录
     */
    touristLoginOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);

        var _hasNetwork = window.Global.NativeExtensionManager.execute('checkNetwork');
        if (cc.sys.isNative && !_hasNetwork) {
            window.Global.Dialog.openMessageBox('请链接网络');
            return;
        }

        window.Global.Animation.openDialog(cc.instantiate(this.secretKey), this.node);
    },

    /**
     * 用户协议
     */
    userAgreementOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Animation.openDialog(cc.instantiate(this.userAgreement), this.node);
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
        window.Global.Dialog.openLoading();
        this.scheduleOnce(function() {
            const parameters = { wxCode: secretKey, location: window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo_location) };
            window.Global.NetworkManager.httpRequest(window.Global.NetworkConfig.HttpRequest[requestName], parameters, (event, result) => {
                window.Global.Dialog.close();

                if (result.code === 1) {
                    result.location = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo_location);
                    result.roomConfig = JSON.parse(result.roomConfig);
                    window.Global.Tools.setLocalData(window.Global.Config.LSK.userInfo, result);
                    window.Global.Tools.setLocalData(window.Global.Config.LSK.secretKey, result.loginKey);

                    if (result.playerReconnection) {
                        window.Global.Config.tempCache = { serverIp: result.playerServerIp, serverPort: result.playerServerPort, roomId: result.playerRoomId, reconnection: true };
                        cc.director.loadScene('GameRoom');
                    }
                    else {
                        cc.director.loadScene('Lobby');
                    }
                    return;
                }

                if (requestName !== 'login') {
                    if (result.code === 1011) {
                        window.Global.Dialog.openMessageBox('登陆失败，验证码错误');
                    }
                    else if (result.code === 1012) {
                        window.Global.Dialog.openMessageBox('登陆失败，账号被封');
                    }
                    else if (result.code === 1013) {
                        window.Global.Dialog.openMessageBox('登陆失败，验证码过期');
                    }
                    else if (result.code === 1031) {
                        window.Global.Dialog.openMessageBox('登陆失败，请稍后重试');
                    }
                }
            });
        }, 1.5);
    },

});
