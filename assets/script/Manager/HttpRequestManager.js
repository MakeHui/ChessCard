module.exports = {
    /**
     * 接口名协议
     * @type {Object}
     */
    requestProtocol: {
        check: {
            api: "client/check",
            description: "login", 
            protocol: "CheckVersion"
        },
        login: {
            api: "client/login",
            description: "login", 
            protocol: "Login"
        },
        heartbeat: {
            api: "client/heartbeat",
            description: "login", 
            protocol: " Heartbeat"
        },
        playerGold: {
            api: "login/balance",
            description: "login", 
            protocol: "PlayerGold"
        },
        roomCreate: {
            api: "room/create",
            description: "login",
            protocol: "RoomCreate"
        },
        roomEnter: {
            api: "room/enter",
            description: "login",
            protocol: "RoomEnter"
        },
        roomList: {
            api: "room/ing_list_for_self",
            description: "login",
            protocol: "RoomList"
        },
        recordList: {
            api: "room/end_list_for_self",
            description: "login",
            protocol: "RecordList"
        },
        recordInfo: {
            api: "room/record",
            description: "login",
            protocol: "RecordInfo"
        },
        recordList2: {
            api: "room/record_self",
            description: "login",
            protocol: "RecordList"
        },
        replay: {
            api: "room/replay",
            description: "login",
            protocol: "Replay"
        },
        roomReplay: {
            api: "room/record_by_room_id",
            description: "login",
            protocol: "RoomReplay"
        }
    },

    /**
     * 1、客户端检测
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-03-01T11:10:07+0800
     *
     * @param    {Array}                 parameters
     */
    getCheckVersionRequestMessage: function(parameters) {
        let message = new proto.login.CheckVersionRequest();
        message.setAppUuid(PX258.appUuid);
        message.setVerNo(PX258.version);
        message.setAndroidOrIos(PX258.os);

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
    getLoginRequestMessage: function(parameters) {
        let message = new proto.login.LoginRequest();
        message.setWxCode(parameters.wxCode);
        message.setAppUuid(PX258.appUuid);
        message.setDeviceId(PX258.getDeviceId());
        message.setVerNo(PX258.version);
        message.setLocation(parameters.location);
        
        cc.log([parameters.wxCode, PX258.appUuid, PX258.getDeviceId(), PX258.version, parameters.location]);
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
    getHeartbeatRequestMessage: function(parameters) {
        let message = new proto.login.HeartbeatRequest();
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
    getPlayerGoldRequestMessage: function(parameters) {
        let message = new proto.login.PlayerGoldRequest();
        message.setPlayerUuid(parameters.playerUuid);
        message.setAppUuid(PX258.appUuid);
        message.setDeviceId(PX258.getDeviceId());
        
        cc.log([parameters.playerUuid, PX258.appUuid, PX258.getDeviceId()]);
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
    getRoomCreateRequestMessage: function(parameters) {
        let message = new proto.login.RoomCreateRequest();
        message.setAppUuid(PX258.appUuid);
        message.setGameUuid(parameters.gameUuid);
        message.setPlayerUuid(parameters.playerUuid);
        message.setDeviceId(PX258.getDeviceId());
        message.setMaxRounds(parameters.maxRounds);
        message.setRoomConfig(parameters.roomConfig);

        cc.log([parameters.playerUuid, PX258.appUuid, PX258.getDeviceId()]);
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
    getRoomEnterRequestMessage: function(parameters) {
        let message = new proto.login.RoomEnterRequest();
        message.setAppUuid(parameters.appUuid);
        message.setGameUuid(parameters.gameUuid);
        message.setPlayerUuid(parameters.playerUuid);
        message.setDeviceId(parameters.deviceId);
        message.setRoomId(parameters.roomId);

        return message;
    },

    /**
     * 8、获取玩家进行中房间列表
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-03-01T11:10:07+0800
     *
     * @param    {Array}                 parameters
     */
    getRoomListRequestMessage: function(parameters) {
        let message = new proto.login.RoomListRequest();
        message.setAppUuid(parameters.appUuid);
        message.setPlayerUuid(parameters.playerUuid);
        message.setDeviceId(parameters.deviceId);

        return message;
    },

    /**
     * 9、获取玩家已结束房间列表
     * 11、获取玩家战绩
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-03-01T11:10:07+0800
     *
     * @param    {Array}                 parameters
     */
    getRecordListRequestMessage: function(parameters) {
        let message = new proto.login.RecordListRequest();
        message.setAppUuid(parameters.appUuid);
        message.setPlayerUuid(parameters.playerUuid);
        message.setDeviceId(parameters.deviceId);

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
    getRecordInfoRequestMessage: function(parameters) {
        let message = new proto.login.RecordInfoRequest();
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
    geReplayRequestMessage: function(parameters) {
        let message = new proto.login.ReplayRequest();
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
    getRoomReplayRequestMessage: function(parameters) {
        let message = new proto.login.RoomReplayRequest();
        message.setAppUuid(parameters.appUuid);
        message.setRoomId(parameters.roomId);

        return message;
    },

    httpRequest: function(protocolName, message, callback) {
        let protocol = this.requestProtocol[protocolName];
        let request = cc.loader.getXMLHttpRequest();
        request.open("POST", (PX258.debug ? PX258.apiAddress.development : PX258.production) + protocol.api);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send(message.serializeBinary());
        request.onload = function(event) {
            let result = goog.crypt.base64.decodeStringToUint8Array(request.responseText);
            result = proto[protocol.description][protocol.protocol + "Response"].deserializeBinary(result);
            
            callback(event, result);
            cc.log("HttpRequestManager.httpRequest " + protocolName + " , code: "  + result.getCode());
        };
    }
};