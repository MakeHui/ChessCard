const GlobalNetwork = cc.Class({
    extends: cc.Component,

    statics: {
        HttpRequest: {
            // 1、客户端检测
            check: {
                api: 'client/check',
                description: 'login',
                request: 'CheckVersion',
                response: 'CheckVersion',
                message () {
                    var message = new proto.login.CheckVersionRequest();
                    message.setAppUuid(window.Global.Config.appUuid);
                    message.setVerNo(window.Global.Config.version);
                    message.setAndroidOrIos(cc.sys.os == 'ios' ? 1 : 2);

                    return message;
                }
            },
            // 2、登陆
            login: {
                api: 'client/login',
                description: 'login',
                request: 'Login',
                response: 'Login',
                message (parameters) {
                    var message = new proto.login.LoginRequest();
                    message.setAppUuid(window.Global.Config.appUuid);
                    message.setVerNo(window.Global.Config.version);
                    message.setDeviceId(window.Global.Tools.getDeviceId());
                    message.setWxCode(parameters.wxCode);
                    message.setLocation(parameters.location);

                    cc.log([parameters.wxCode, window.Global.Config.appUuid, window.Global.Tools.getDeviceId(), window.Global.Config.version, parameters.location]);
                    return message;
                }
            },
            authCodeLogin: {
                api: 'client/login/auth_code',
                description: 'login',
                request: 'Login',
                response: 'Login',
                message (parameters) {
                    var message = new proto.login.LoginRequest();
                    message.setAppUuid(window.Global.Config.appUuid);
                    message.setVerNo(window.Global.Config.version);
                    message.setDeviceId(window.Global.Tools.getDeviceId());
                    message.setWxCode(parameters.wxCode);
                    message.setLocation(parameters.location);

                    cc.log([parameters.wxCode, window.Global.Config.appUuid, window.Global.Tools.getDeviceId(), window.Global.Config.version, parameters.location]);
                    return message;
                }
            },
            wechatLogin: {
                api: 'client/wechat_login',
                description: 'login',
                request: 'Login',
                response: 'Login',
                message (parameters) {
                    var message = new proto.login.LoginRequest();
                    message.setAppUuid(window.Global.Config.appUuid);
                    message.setVerNo(window.Global.Config.version);
                    message.setDeviceId(window.Global.Tools.getDeviceId());
                    message.setWxCode(parameters.wxCode);
                    message.setLocation(parameters.location);

                    cc.log([parameters.wxCode, window.Global.Config.appUuid, window.Global.Tools.getDeviceId(), window.Global.Config.version, parameters.location]);
                    return message;
                }
            },
            // 3、客户端大厅心跳
            heartbeat: {
                api: 'client/heartbeat',
                description: 'login',
                request: 'Heartbeat',
                response: 'Heartbeat',
                message () {
                    var message = new proto.login.HeartbeatRequest();
                    var userInfo = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);
                    message.setPlayerUuid(userInfo.playerUuid);
                    message.setDeviceId(window.Global.Tools.getDeviceId());
                    message.setAppUuid(window.Global.Config.appUuid);

                    return message;
                }
            },
            // 4、用户获取账户信息，获取用户金币
            playerGold: {
                api: 'login/balance',
                description: 'login',
                request: 'PlayerGold',
                response: 'PlayerGold',
                message (parameters) {
                    var message = new proto.login.PlayerGoldRequest();
                    message.setPlayerUuid(parameters.playerUuid);
                    message.setAppUuid(window.Global.Config.appUuid);
                    message.setDeviceId(window.Global.Tools.getDeviceId());

                    cc.log([parameters.playerUuid, window.Global.Config.appUuid, window.Global.Tools.getDeviceId()]);
                    return message;
                },
            }
        }
    }
});

module.exports = GlobalNetwork;