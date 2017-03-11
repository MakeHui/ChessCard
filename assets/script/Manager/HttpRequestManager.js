
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
        protocol: 'CheckVersion',
    },
    login: {
        api: 'client/login',
        description: 'login',
        protocol: 'Login',
    },
    heartbeat: {
        api: 'client/heartbeat',
        description: 'login',
        protocol: ' Heartbeat',
    },
    playerGold: {
        api: 'login/balance',
        description: 'login',
        protocol: 'PlayerGold',
    },
    roomCreate: {
        api: 'room/create',
        description: 'login',
        protocol: 'RoomCreate',
    },
    roomEnter: {
        api: 'room/enter',
        description: 'login',
        protocol: 'RoomEnter',
    },
    roomList: {
        api: 'room/ing_list_for_self',
        description: 'login',
        protocol: 'RoomList',
    },
    recordList: {
        api: 'room/end_list_for_self',
        description: 'login',
        protocol: 'RecordList',
    },
    recordInfo: {
        api: 'room/record',
        description: 'login',
        protocol: 'RecordInfo',
    },
    recordListSelf: {
        api: 'room/record_self',
        description: 'login',
        protocol: 'RecordList',
    },
    replay: {
        api: 'room/replay',
        description: 'login',
        protocol: 'Replay',
    },
    roomReplay: {
        api: 'room/record_by_room_id',
        description: 'login',
        protocol: 'RoomReplay',
    },
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
    getCheckVersionRequestMessage() {
        const message = new proto.login.CheckVersionRequest();
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
    getLoginRequestMessage(parameters) {
        const message = new proto.login.LoginRequest();
        message.setWxCode(parameters.wxCode);
        message.setAppUuid(Global.appUuid);
        message.setDeviceId(Global.getDeviceId());
        message.setVerNo(Global.version);
        message.setLocation(parameters.location);

        cc.warn([parameters.wxCode, Global.appUuid, Global.getDeviceId(), Global.version, parameters.location]);
        return message;
    },

    /**
     * 3、客户端大厅心跳
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-03-01T11:10:07+0800
     *
     * @param    {Array}                 parameters
     */
    getHeartbeatRequestMessage(parameters) {
        const message = new proto.login.HeartbeatRequest();
        message.setPlayerUuid(parameters.playerUuid);
        message.setDeviceId(parameters.deviceId);
        message.setAppUuid(parameters.appUuid);

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
    getPlayerGoldRequestMessage(parameters) {
        const message = new proto.login.PlayerGoldRequest();
        message.setPlayerUuid(parameters.playerUuid);
        message.setAppUuid(Global.appUuid);
        message.setDeviceId(Global.getDeviceId());

        cc.warn([parameters.playerUuid, Global.appUuid, Global.getDeviceId()]);
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
    getRoomCreateRequestMessage(parameters) {
        const message = new proto.login.RoomCreateRequest();
        const userInfo = Tools.getLocalData(Global.localStorageKey.userInfo);

        message.setAppUuid(Global.appUuid);
        message.setGameUuid(parameters.gameUuid);
        message.setPlayerUuid(userInfo.playerUuid);
        message.setDeviceId(Global.getDeviceId());
        message.setMaxRounds(parameters.maxRounds);
        message.setRoomConfig(parameters.roomConfig);

        cc.warn(parameters);
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
    getRoomEnterRequestMessage(parameters) {
        const message = new proto.login.RoomEnterRequest();
        const userInfo = Tools.getLocalData(Global.localStorageKey.userInfo);

        message.setAppUuid(Global.appUuid);
        message.setPlayerUuid(userInfo.playerUuid);
        message.setDeviceId(Global.getDeviceId());
        message.setRoomId(parameters.roomId);

        cc.warn([Global.appUuid, userInfo.playerUuid, userInfo.deviceId, parameters.roomId]);
        return message;
    },

    /**
     * 8、获取玩家进行中房间列表
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-03-01T11:10:07+0800
     *
     */
    getRoomListRequestMessage() {
        const message = new proto.login.RoomListRequest();
        const userInfo = Tools.getLocalData(Global.localStorageKey.userInfo);

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
    getRecordListRequestMessage() {
        const message = new proto.login.RecordListRequest();
        const userInfo = Tools.getLocalData(Global.localStorageKey.userInfo);

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
    getRecordInfoRequestMessage(parameters) {
        const message = new proto.login.RecordInfoRequest();
        message.setAppUuid(parameters.appUuid);
        message.setPlayerUuid(parameters.playerUuid);
        message.setDeviceId(parameters.deviceId);
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
    geReplayRequestMessage(parameters) {
        const message = new proto.login.ReplayRequest();
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
    getRoomReplayRequestMessage(parameters) {
        const message = new proto.login.RoomReplayRequest();
        message.setAppUuid(parameters.appUuid);
        message.setRoomId(parameters.roomId);

        return message;
    },
};

/**
 * http请求方法
 *
 * @param name
 * @param parameters
 * @param callback
 */
window.HttpRequestManager.httpRequest = (name, parameters, callback) => {
    const protocol = HttpRequestManager.requestProtocol[name];
    const message = HttpRequestManager.requestMessage[`get${protocol.protocol}RequestMessage`](parameters);
    const request = cc.loader.getXMLHttpRequest();

    request.open('POST', (Global.debug ? Global.apiAddress.development : Global.apiAddress.production) + protocol.api);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.send(message.serializeBinary());
    request.onload = (event) => {
        let result = goog.crypt.base64.decodeStringToUint8Array(request.responseText);
        result = proto[protocol.description][`${protocol.protocol}Response`].deserializeBinary(result);

        callback(event, result);
        cc.warn(`HttpRequestManager.httpRequest #{name} , code: ${result.getCode()}`);
    };
};
