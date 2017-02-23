const httpRequestManager = require("HttpRequestManager");
const webSocketManager = require("WebSocketManager");

cc.Class({
    extends: cc.Component,

    properties: {
        userAgreement: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        cc.loader.loadRes('prefab/Loging', cc.Node, function (error, spriteFrame) {
            if (error) {
                cc.error(error);
                return;
            }
            
        });
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
        var message = httpRequestManager.getCheckVersionRequestMessage(123, "123", 1);
        httpRequestManager.httpRequest(PX258.httpRequestName.check, message, function(event, data) {
            data = proto.login.CheckVersionResponse.deserializeBinary(data);
            cc.log(event);
            cc.log(data.getCode());
            cc.log(data.getMandatoryUpdate());
            cc.log(data.getDownloadLink());
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

        // var message = httpRequestManager.getLoginRequestMessage("", data, "江西 南昌");
        // httpRequestManager.httpRequest(PX258.httpRequestName.login, message, function(event, data) {
        //     data = proto.login.LoginResponse.deserializeBinary(data);
        //     if (data.getCode() == 1) {
        //         cc.sys.localStorage.setItem(PX258.localStorageKey.userInfo, JSON.stringify({
        //             nickname: data.getNickname(),   // 用户昵称
        //             olkey: data.getOlkey(),         // 登录 token
        //             gold: data.getGold(),           // 用户金币
        //             sex: data.getSex(),             // 用户性别，0：未知；1：男；2：女
        //             playeId: data.getPlayerId(),  // 用户数字 ID，显示的5位用户id
        //             playerUuid: data.getPlayerUuid(),   // 用户系统唯一 32 位 ID
        //             headimgurl: data.getHeadimgurl(),   // 用户头像
        //             parentId: data.getParentId(),      // 用户上级代理32 位 ID
        //             ip: data.getIp(),                   // 用户 IP
        //             location: data.getLocation(),       // 用户地理位置信息
        //             isMaintain: data.getIsMaintain(),  // 服务器维护状态
        //             maintainInfo: data.getMaintainInfo(),  // 维护信息
        //             notice: data.getNotice(),               // 显示的公告
        //             shareIco: data.getShareIco(),          // 分享小图标
        //             shareUrl: data.getShareUrl(),          // 分享下载地址用户当前所在服务器信息，可以为空
        //             playerReconnection: data.getPlayerReconnection(),  // 是否重连
        //             playerRoomId: data.getPlayerRoomId(),             // 返回房间 ID
        //             playerServerIp: data.getPlayerServerIp(),         // ip
        //             playerServerPort: data.getPlayerServerPort(),     // 端口
        //         }));
        //         cc.log(data.getNickname());
        //     }
        //     else {
                
        //     }
        // });
    },

    /**
     * 用户协议
     */
    userAgreementOnClick: function(event, data) {
        cc.log("xxxxxxx");
        PX258.openDialog(this.userAgreement, this.node, function () {
            cc.log("load success");
        });
    }
});
