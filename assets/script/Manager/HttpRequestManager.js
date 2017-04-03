'use strict';

window.HttpRequestManager = {};

/**
 **********************************************************************************************************************
 *                                      接口名协议, 配置项
 **********************************************************************************************************************
 **/

window.HttpRequestManager.requestProtocol = {
    check: {
        api: 'client/check',
        description: 'login',
        protocol: 'CheckVersion'
    },
    login: {
        api: 'client/login',
        description: 'login',
        protocol: 'Login'
    },
    authCodeLogin: {
        api: 'client/login/auth_code',
        description: 'login',
        protocol: 'Login'
    },
    heartbeat: {
        api: 'client/heartbeat',
        description: 'login',
        protocol: 'Heartbeat'
    },
    playerGold: {
        api: 'login/balance',
        description: 'login',
        protocol: 'PlayerGold'
    },
    roomCreate: {
        api: 'room/create',
        description: 'login',
        protocol: 'RoomCreate'
    },
    roomEnter: {
        api: 'room/enter',
        description: 'login',
        protocol: 'RoomEnter'
    },
    roomList: {
        api: 'room/ing_list_for_self',
        description: 'login',
        protocol: 'RoomList'
    },
    recordList: {
        api: 'room/end_list_for_self',
        description: 'login',
        protocol: 'RecordList'
    },
    recordInfo: {
        api: 'room/record',
        description: 'login',
        protocol: 'RecordInfo'
    },
    recordListSelf: {
        api: 'room/record_self',
        description: 'login',
        protocol: 'RecordList'
    },
    replay: {
        api: 'room/replay',
        description: 'login',
        protocol: 'Replay'
    },
    roomReplay: {
        api: 'room/record_by_room_id',
        description: 'login',
        protocol: 'RoomReplay'
    }
};

/**
 **********************************************************************************************************************
 *                                      RequestMessage 构造方法
 **********************************************************************************************************************
 **/

window.HttpRequestManager.requestMessage = {
    /**
     * 1、客户端检测
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-03-01T11:10:07+0800
     *
     */
    getCheckVersionRequestMessage: function getCheckVersionRequestMessage() {
        var message = new proto.login.CheckVersionRequest();
        message.setAppUuid(Global.appUuid);
        message.setVerNo(Global.version);
        message.setAndroidOrIos(Global.os);

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
    getLoginRequestMessage: function getLoginRequestMessage(parameters) {
        var message = new proto.login.LoginRequest();
        message.setWxCode(parameters.wxCode);
        message.setAppUuid(Global.appUuid);
        message.setDeviceId(Global.getDeviceId());
        message.setVerNo(Global.version);
        message.setLocation(parameters.location);

        Global.log([parameters.wxCode, Global.appUuid, Global.getDeviceId(), Global.version, parameters.location]);
        return message;
    },


    /**
     * 3、客户端大厅心跳
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-03-01T11:10:07+0800
     *
     */
    getHeartbeatRequestMessage: function getHeartbeatRequestMessage() {
        var message = new proto.login.HeartbeatRequest();
        var userInfo = Tools.getLocalData(Global.LSK.userInfo);

        message.setPlayerUuid(userInfo.playerUuid);
        message.setDeviceId(Global.getDeviceId());
        message.setAppUuid(Global.appUuid);

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
    getPlayerGoldRequestMessage: function getPlayerGoldRequestMessage(parameters) {
        var message = new proto.login.PlayerGoldRequest();
        message.setPlayerUuid(parameters.playerUuid);
        message.setAppUuid(Global.appUuid);
        message.setDeviceId(Global.getDeviceId());

        Global.log([parameters.playerUuid, Global.appUuid, Global.getDeviceId()]);
        return message;
    },


    /**
     * 6、创建房间
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-03-01T11:10:07+0800
     *
     * @param    {Array}                 parameters
     */
    getRoomCreateRequestMessage: function getRoomCreateRequestMessage(parameters) {
        var message = new proto.login.RoomCreateRequest();
        var userInfo = Tools.getLocalData(Global.LSK.userInfo);

        message.setAppUuid(Global.appUuid);
        message.setGameUuid(parameters.gameUuid);
        message.setPlayerUuid(userInfo.playerUuid);
        message.setDeviceId(Global.getDeviceId());
        message.setMaxRounds(parameters.maxRounds);
        message.setRoomConfig(parameters.roomConfig);

        Global.log(parameters);
        return message;
    },


    /**
     * 7、进入房间
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-03-01T11:10:07+0800
     *
     * @param    {Array}                 parameters
     */
    getRoomEnterRequestMessage: function getRoomEnterRequestMessage(parameters) {
        var message = new proto.login.RoomEnterRequest();
        var userInfo = Tools.getLocalData(Global.LSK.userInfo);

        message.setAppUuid(Global.appUuid);
        message.setPlayerUuid(userInfo.playerUuid);
        message.setDeviceId(Global.getDeviceId());
        message.setRoomId(parameters.roomId);

        Global.log([Global.appUuid, userInfo.playerUuid, userInfo.deviceId, parameters.roomId]);
        return message;
    },


    /**
     * 8、获取玩家进行中房间列表
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-03-01T11:10:07+0800
     *
     */
    getRoomListRequestMessage: function getRoomListRequestMessage() {
        var message = new proto.login.RoomListRequest();
        var userInfo = Tools.getLocalData(Global.LSK.userInfo);

        message.setAppUuid(Global.appUuid);
        message.setPlayerUuid(userInfo.playerUuid);
        message.setDeviceId(Global.getDeviceId());

        return message;
    },


    /**
     * 9、获取玩家已结束房间列表
     * 11、获取玩家战绩
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-03-01T11:10:07+0800
     *
     */
    getRecordListRequestMessage: function getRecordListRequestMessage() {
        var message = new proto.login.RecordListRequest();
        var userInfo = Tools.getLocalData(Global.LSK.userInfo);

        message.setAppUuid(Global.appUuid);
        message.setPlayerUuid(userInfo.playerUuid);
        message.setDeviceId(Global.getDeviceId());

        return message;
    },


    /**
     * 10、获取玩家战绩详情
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-03-01T11:10:07+0800
     *
     * @param    {Array}                 parameters
     */
    getRecordInfoRequestMessage: function getRecordInfoRequestMessage(parameters) {
        var message = new proto.login.RecordInfoRequest();
        var userInfo = Tools.getLocalData(Global.LSK.userInfo);
        message.setAppUuid(Global.appUuid);
        message.setPlayerUuid(userInfo.playerUuid);
        message.setDeviceId(Global.getDeviceId());
        message.setRoomUuid(parameters.roomUuid);

        return message;
    },


    /**
     * 12、获取回放数据
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-03-01T11:10:07+0800
     *
     * @param    {Array}                 parameters
     */
    geReplayRequestMessage: function geReplayRequestMessage(parameters) {
        var message = new proto.login.ReplayRequest();
        message.setAppUuid(parameters.appUuid);
        message.setRoomUuid(parameters.roomUuid);
        message.setTheRound(parameters.theRound);

        return message;
    },


    /**
     * 13、根据6位房间id获取数据
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-03-01T11:10:07+0800
     *
     * @param    {Array}                 parameters
     */
    getRoomReplayRequestMessage: function getRoomReplayRequestMessage(parameters) {
        var message = new proto.login.RoomReplayRequest();
        message.setAppUuid(parameters.appUuid);
        message.setRoomId(parameters.roomId);

        return message;
    }
};

/**
 * http请求方法
 *
 * @param name
 * @param parameters
 * @param callback
 */
window.HttpRequestManager.httpRequest = function (name, parameters, callback) {
    var protocol = HttpRequestManager.requestProtocol[name];
    var message = HttpRequestManager.requestMessage['get' + protocol.protocol + 'RequestMessage'](parameters);
    var request = cc.loader.getXMLHttpRequest();

    request.open('POST', (Global.debug ? Global.apiAddress.development : Global.apiAddress.production) + protocol.api);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send(message.serializeBinary());
    request.onload = function (event) {
        var result = goog.crypt.base64.decodeStringToUint8Array(request.responseText);
        result = proto[protocol.description][protocol.protocol + 'Response'].deserializeBinary(result);
        result = Tools.protobufToJson(result);

        Global.log(['HttpRequestManager.httpRequest ' + name, result]);
        callback(event, result);
    };
};