const GlobalNetwork = cc.Class({
    extends: cc.Component,

    statics: {
        HttpRequest: {
            protocol: {
                check: {
                    api: 'client/check',
                    description: 'login',
                    request: 'CheckVersion',
                    response: 'CheckVersion',
                },
                login: {
                    api: 'client/login',
                    description: 'login',
                    request: 'Login',
                    response: 'Login',
                },
                authCodeLogin: {
                    api: 'client/login/auth_code',
                    description: 'login',
                    request: 'Login',
                    response: 'Login',
                },
                wechatLogin: {
                    api: 'client/wechat_login',
                    description: 'login',
                    request: 'Login',
                    response: 'Login',
                },
                heartbeat: {
                    api: 'client/heartbeat',
                    description: 'login',
                    request: 'Heartbeat',
                    response: 'Heartbeat',
                },
                playerGold: {
                    api: 'login/balance',
                    description: 'login',
                    request: 'PlayerGold',
                    response: 'PlayerGold',
                }
            },
            message: {
                /**
                 * 1、客户端检测
                 *
                 * @author Make.<makehuir@gmail.com>
                 * @datetime 2017-03-01T11:10:07+0800
                 *
                 */
                getCheckVersionRequestMessage: function () {
                    var message = new proto.login.CheckVersionRequest();
                    message.setAppUuid(GlobalConfig.appUuid);
                    message.setVerNo(GlobalConfig.version);
                    message.setAndroidOrIos(cc.sys.os == 'ios' ? 1 : 2);

                    return message;
                },

                /**
                 * 2、登陆
                 *
                 * @author Make.<makehuir@gmail.com>
                 * @datetime 2017-03-01T11:10:07+0800
                 *
                 * @param    {Array}                 parameters
                 */
                getLoginRequestMessage: function (parameters) {
                    var message = new proto.login.LoginRequest();
                    message.setWxCode(parameters.wxCode);
                    message.setAppUuid(GlobalConfig.appUuid);
                    message.setDeviceId(Tools.getDeviceId());
                    message.setVerNo(GlobalConfig.version);
                    message.setLocation(parameters.location);

                    cc.log([parameters.wxCode, GlobalConfig.appUuid, Tools.getDeviceId(), GlobalConfig.version, parameters.location]);
                    return message;
                },

                /**
                 * 3、客户端大厅心跳
                 *
                 * @author Make.<makehuir@gmail.com>
                 * @datetime 2017-03-01T11:10:07+0800
                 *
                 */
                getHeartbeatRequestMessage: function () {
                    var message = new proto.login.HeartbeatRequest();
                    var userInfo = Tools.getLocalData(GlobalConfig.LSK.userInfo);

                    message.setPlayerUuid(userInfo.playerUuid);
                    message.setDeviceId(Tools.getDeviceId());
                    message.setAppUuid(GlobalConfig.appUuid);

                    return message;
                },

                /**
                 * 4、用户获取账户信息，获取用户金币
                 *
                 * @author Make.<makehuir@gmail.com>
                 * @datetime 2017-03-01T11:10:07+0800
                 *
                 * @param    {Array}                 parameters
                 */
                getPlayerGoldRequestMessage: function (parameters) {
                    var message = new proto.login.PlayerGoldRequest();
                    message.setPlayerUuid(parameters.playerUuid);
                    message.setAppUuid(GlobalConfig.appUuid);
                    message.setDeviceId(Tools.getDeviceId());

                    cc.log([parameters.playerUuid, GlobalConfig.appUuid, Tools.getDeviceId()]);
                    return message;
                },
            }
        }
    }
});

module.exports = GlobalNetwork;