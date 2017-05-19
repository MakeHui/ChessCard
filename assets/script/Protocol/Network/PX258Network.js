const PX258Network = cc.Class({
    extends: cc.Component,

    statics: {
        HttpRequest: {
            config: {
                roomCreate: {
                    api: 'room/create',
                    description: 'login',
                    request: 'RoomCreate',
                    response: 'RoomCreate',
                },
                roomEnter: {
                    api: 'room/enter',
                    description: 'login',
                    request: 'RoomEnter',
                    response: 'RoomEnter',
                },
                roomList: {
                    api: 'room/ing_list_for_self',
                    description: 'login',
                    request: 'RoomList',
                    response: 'RoomList',
                },
                recordList: {
                    api: 'room/end_list_for_self',
                    description: 'login',
                    request: 'RecordList',
                    response: 'RecordList',
                },
                recordInfo: {
                    api: 'room/record',
                    description: 'login',
                    request: 'RecordInfo',
                    response: 'RecordInfo',
                },
                recordListSelf: {
                    api: 'room/record_self',
                    description: 'login',
                    request: 'RecordList',
                    response: 'RecordList',
                },
                replay: {
                    api: 'room/replay',
                    description: 'login',
                    request: 'Replay',
                    response: 'Replay',
                },
                roomReplay: {
                    api: 'room/record_by_room_id',
                    description: 'login',
                    request: 'RoomReplay',
                    response: 'RecordInfo',
                },
            },
            message: {
                /**
                 * 6、创建房间
                 *
                 * @author Make.<makehuir@gmail.com>
                 * @datetime 2017-03-01T11:10:07+0800
                 *
                 * @param    {Array}                 parameters
                 */
                getRoomCreateRequestMessage: function (parameters) {
                    var message = new proto.login.RoomCreateRequest();
                    var userInfo = Tools.getLocalData(GlobalConfig.LSK.userInfo);

                    message.setAppUuid(GlobalConfig.appUuid);
                    message.setGameUuid(parameters.gameUuid);
                    message.setPlayerUuid(userInfo.playerUuid);
                    message.setDeviceId(Tools.getDeviceId());
                    message.setMaxRounds(parameters.maxRounds);
                    message.setRoomConfig(parameters.roomConfig);

                    cc.log(parameters);
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
                getRoomEnterRequestMessage: function (parameters) {
                    var message = new proto.login.RoomEnterRequest();
                    var userInfo = Tools.getLocalData(GlobalConfig.LSK.userInfo);

                    message.setAppUuid(GlobalConfig.appUuid);
                    message.setPlayerUuid(userInfo.playerUuid);
                    message.setDeviceId(Tools.getDeviceId());
                    message.setRoomId(parameters.roomId);

                    cc.log([GlobalConfig.appUuid, userInfo.playerUuid, userInfo.deviceId, parameters.roomId]);
                    return message;
                },

                /**
                 * 8、获取玩家进行中房间列表
                 *
                 * @author Make.<makehuir@gmail.com>
                 * @datetime 2017-03-01T11:10:07+0800
                 *
                 */
                getRoomListRequestMessage: function () {
                    var message = new proto.login.RoomListRequest();
                    var userInfo = Tools.getLocalData(GlobalConfig.LSK.userInfo);

                    message.setAppUuid(GlobalConfig.appUuid);
                    message.setPlayerUuid(userInfo.playerUuid);
                    message.setDeviceId(Tools.getDeviceId());

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
                getRecordListRequestMessage: function () {
                    var message = new proto.login.RecordListRequest();
                    var userInfo = Tools.getLocalData(GlobalConfig.LSK.userInfo);

                    message.setAppUuid(GlobalConfig.appUuid);
                    message.setPlayerUuid(userInfo.playerUuid);
                    message.setDeviceId(Tools.getDeviceId());

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
                getRecordInfoRequestMessage: function (parameters) {
                    var message = new proto.login.RecordInfoRequest();
                    var userInfo = Tools.getLocalData(GlobalConfig.LSK.userInfo);
                    message.setAppUuid(GlobalConfig.appUuid);
                    message.setPlayerUuid(userInfo.playerUuid);
                    message.setDeviceId(Tools.getDeviceId());
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
                getReplayRequestMessage: function (parameters) {
                    var message = new proto.login.ReplayRequest();
                    message.setAppUuid(GlobalConfig.appUuid);
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
                getRoomReplayRequestMessage: function (parameters) {
                    var message = new proto.login.RoomReplayRequest();
                    message.setAppUuid(GlobalConfig.appUuid);
                    message.setRoomId(parameters.roomId);

                    cc.log([GlobalConfig.appUuid, parameters.roomId]);
                    return message;
                }
            }
        },
        WebSocket: {
            config: {
                // 公共命令
                EnterRoom: 0x0001, // 1、进入房间
                EnterRoomOther: 0x0002, // 2、其他玩家进入房间
                ExitRoom: 0x0003, // 3、离开房间
                DismissRoom: 0x0004, // 4、解散房间
                SponsorVote: 0x0005, // 5、发起投票解散
                HeartBeat: 0x0006,   // 心跳
                PlayerVote: 0x0007, // 6、玩家投票
                OnlineStatus: 0x0008, // 7、玩家上线离线广播
                Speaker: 0x0009, // 8、超级广播命令
                Ready: 0x000A, // 9、准备
                Deal: 0x000B, // 10、起手发牌
                Draw: 0x000C, // 11、抓牌
                Discard: 0x000D, // 12、出牌
                SynchroniseCards: 0x000E, // 13、服务端主动同步手牌
                SynchroniseScore: 0x000F, // 15、玩家分数发生改变，同步分数

                Reconnect: 0x1000, // 1、玩家断线重连
                Prompt: 0x1001, // 2、操作提示
                Action: 0x1002, // 3、玩家根据提示列表选择动作
                ReadyHand: 0x1003, // 4、听牌提示
                SettleForRound: 0x1005, // 5、小结算
                SettleForRoom: 0x1006
            },
            message: {
                /**
                 *******************************************************************************************************************
                 *                                      公共请求 message
                 *******************************************************************************************************************
                 **/

                /**
                 * 1. 自己主动进入房间
                 * @param parameters
                 * @returns {proto.game.EnterRoomRequest}
                 */
                getEnterRoomRequestMessage: function (parameters) {
                    var message = new proto.game.EnterRoomRequest();
                    var userInfo = Tools.getLocalData(GlobalConfig.LSK.userInfo);

                    message.setRoomId(parameters.roomId);
                    message.setPlayerUuid(userInfo.playerUuid);
                    message.setInfo(JSON.stringify({
                        gold: userInfo.gold,
                        nickname: userInfo.nickname,
                        headimgurl: userInfo.headimgurl,
                        sex: userInfo.sex,
                        ip: userInfo.ip,
                        location: userInfo.location
                    }));

                    return message;
                },


                /**
                 * 3. 自己主动退出房间
                 * @returns {proto.game.ExitRoomRequest}
                 */
                getExitRoomRequestMessage: function () {
                    return new proto.game.ExitRoomRequest();
                },


                /**
                 * 4、解散房间
                 * @returns {proto.game.DismissRoomRequest}
                 */
                getDismissRoomRequestMessage: function () {
                    return new proto.game.DismissRoomRequest();
                },


                /**
                 * 6、玩家投票
                 * @param parameters
                 * @returns {proto.game.PlayerVoteRequest}
                 */
                getPlayerVoteRequestMessage: function (parameters) {
                    var message = new proto.game.PlayerVoteRequest();
                    message.setFlag(parameters.flag);

                    return message;
                },


                /**
                 * 8、超级广播命令
                 * @param parameters
                 * @returns {proto.game.SpeakerRequest}
                 */
                getSpeakerRequestMessage: function (parameters) {
                    var message = new proto.game.SpeakerRequest();
                    message.setContent(parameters.content);

                    return message;
                },


                /**
                 * 9、准备
                 * @returns {proto.game.ReadyRequest}
                 */
                getReadyRequestMessage: function () {
                    return new proto.game.ReadyRequest();
                },


                /**
                 * 12、出牌
                 * @param parameters
                 * @returns {proto.game.DiscardRequest}
                 */
                getDiscardRequestMessage: function (parameters) {
                    var message = new proto.game.DiscardRequest();
                    var cardMsg = new proto.game.Card();
                    cardMsg.setCard(parameters.card);
                    message.setCard(cardMsg);

                    return message;
                },

                /**
                 * wsHbt
                 * @returns {proto.game.HeartbeatRequest}
                 */
                getHeartBeatRequestMessage: function () {
                    return new proto.game.HeartbeatRequest();
                },


                /**
                 *******************************************************************************************************************
                 *                                      px258 message
                 *******************************************************************************************************************
                 **/

                /**
                 * 3、玩家根据提示列表选择动作
                 * @param parameters
                 * @returns {proto.game.ActionRequest}
                 */
                getActionRequestMessage: function (parameters) {
                    var message = new proto.game.ActionRequest();
                    message.setActionId(parameters.actionId);

                    return message;
                }
            }
        }
    }
});

module.exports = PX258Network;