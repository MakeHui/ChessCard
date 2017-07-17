const PX258Network = cc.Class({
    extends: cc.Component,

    statics: {
        HttpRequest: {
            // 6、创建房间
            roomCreate: {
                api: 'room/create',
                description: 'login',
                request: 'RoomCreate',
                response: 'RoomCreate',
                message: function (parameters) {
                    var message = new proto.login.RoomCreateRequest();
                    var userInfo = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);

                    message.setAppUuid(window.Global.Config.appUuid);
                    message.setGameUuid(parameters.gameUuid);
                    message.setPlayerUuid(userInfo.playerUuid);
                    message.setDeviceId(window.Global.Tools.getDeviceId());
                    message.setMaxRounds(parameters.maxRounds);
                    message.setRoomConfig(parameters.roomConfig);

                    cc.log(parameters);
                    return message;
                }
            },
            // 7、进入房间
            roomEnter: {
                api: 'room/enter',
                description: 'login',
                request: 'RoomEnter',
                response: 'RoomEnter',
                message: function (parameters) {
                    var message = new proto.login.RoomEnterRequest();
                    var userInfo = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);

                    message.setAppUuid(window.Global.Config.appUuid);
                    message.setPlayerUuid(userInfo.playerUuid);
                    message.setDeviceId(window.Global.Tools.getDeviceId());
                    message.setRoomId(parameters.roomId);

                    cc.log([window.Global.Config.appUuid, userInfo.playerUuid, userInfo.deviceId, parameters.roomId]);
                    return message;
                },
            },
            // 8、获取玩家进行中房间列表
            roomList: {
                api: 'room/ing_list_for_self',
                description: 'login',
                request: 'RoomList',
                response: 'RoomList',
                message: function () {
                    var message = new proto.login.RoomListRequest();
                    var userInfo = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);

                    message.setAppUuid(window.Global.Config.appUuid);
                    message.setGameUuid(window.PX258.Config.gameUuid.toString());
                    message.setPlayerUuid(userInfo.playerUuid);
                    message.setDeviceId(window.Global.Tools.getDeviceId());

                    return message;
                },
            },
            //  9、获取玩家已结束房间列表
            recordList: {
                api: 'room/end_list_for_self',
                description: 'login',
                request: 'RecordList',
                response: 'RecordList',
                message: function () {
                    var message = new proto.login.RecordListRequest();
                    var userInfo = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);

                    message.setAppUuid(window.Global.Config.appUuid);
                    message.setGameUuid(window.PX258.Config.gameUuid.toString());
                    message.setPlayerUuid(userInfo.playerUuid);
                    message.setDeviceId(window.Global.Tools.getDeviceId());

                    return message;
                },
            },
            // 10、获取玩家战绩详情
            recordInfo: {
                api: 'room/record',
                description: 'login',
                request: 'RecordInfo',
                response: 'RecordInfo',
                message: function (parameters) {
                    var message = new proto.login.RecordInfoRequest();
                    var userInfo = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);

                    message.setAppUuid(window.Global.Config.appUuid);
                    message.setPlayerUuid(userInfo.playerUuid);
                    message.setDeviceId(window.Global.Tools.getDeviceId());
                    message.setRoomUuid(parameters.roomUuid);

                    return message;
                },
            },
            // 11、获取玩家战绩
            recordListSelf: {
                api: 'room/record_self',
                description: 'login',
                request: 'RecordList',
                response: 'RecordList',
                message: function () {
                    var message = new proto.login.RecordListRequest();
                    var userInfo = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);

                    message.setAppUuid(window.Global.Config.appUuid);
                    message.setGameUuid(window.PX258.Config.gameUuid.toString());
                    message.setPlayerUuid(userInfo.playerUuid);
                    message.setDeviceId(window.Global.Tools.getDeviceId());

                    return message;
                },
            },
            // 12、获取回放数据
            replay: {
                api: 'room/replay',
                description: 'login',
                request: 'Replay',
                response: 'Replay',
                message: function (parameters) {
                    var message = new proto.login.ReplayRequest();
                    message.setAppUuid(window.Global.Config.appUuid);
                    message.setRoomUuid(parameters.roomUuid);
                    message.setTheRound(parameters.theRound);

                    return message;
                },
            },
            // 13、根据6位房间id获取数据
            roomReplay: {
                api: 'room/record_by_room_id',
                description: 'login',
                request: 'RoomReplay',
                response: 'RecordInfo',
                message: function (parameters) {
                    var message = new proto.login.RoomReplayRequest();
                    message.setAppUuid(window.Global.Config.appUuid);
                    message.setRoomId(parameters.roomId);

                    cc.log([window.Global.Config.appUuid, parameters.roomId]);
                    return message;
                }
            },
        },
        WebSocket: {
            // 公共命令
            EnterRoom: {
                cmd: 0x0001, // 1、进入房间
                response: 'EnterRoom',
                message: function (parameters) {
                    var message = new proto.game.EnterRoomRequest();
                    var userInfo = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);

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
            },
            EnterRoomOther: {
                cmd: 0x0002, // 2、其他玩家进入房间
                response: 'EnterRoomOther',
            },
            ExitRoom: {
                cmd: 0x0003, // 3、离开房间
                response: 'ExitRoom',
                message: function () {
                    return new proto.game.ExitRoomRequest();
                }
            },
            DismissRoom: {
                cmd: 0x0004, // 4、解散房间
                response: 'DismissRoom',
                message: function () {
                    return new proto.game.DismissRoomRequest();
                }
            },
            SponsorVote: {
                cmd: 0x0005, // 5、发起投票解散
                response: 'SponsorVote',
            },
            HeartBeat: {
                cmd: 0x0006,   // 心跳
                response: 'HeartBeat',
                message: function () {
                    return new proto.game.HeartbeatRequest();
                },
            },
            PlayerVote: {
                cmd: 0x0007, // 6、玩家投票
                response: 'PlayerVote',
                message: function (parameters) {
                    var message = new proto.game.PlayerVoteRequest();
                    message.setFlag(parameters.flag);

                    return message;
                },
            },
            OnlineStatus: {
                cmd: 0x0008, // 7、玩家上线离线广播
                response: 'OnlineStatus',
            },
            Speaker: {
                cmd: 0x0009, // 8、超级广播命令
                response: 'Speaker',
                message: function (parameters) {
                    var message = new proto.game.SpeakerRequest();
                    message.setContent(parameters.content);

                    return message;
                },
            },
            Ready: {
                cmd: 0x000A, // 9、准备
                response: 'Ready',
                message: function () {
                    return new proto.game.ReadyRequest();
                },
            },
            Deal: {
                cmd: 0x000B, // 10、起手发牌
                response: 'Deal',
            },
            Draw: {
                cmd: 0x000C, // 11、抓牌
                response: 'Draw',
            },
            Discard: {
                cmd: 0x000D, // 12、出牌
                response: 'Discard',
                message: function (parameters) {
                    var message = new proto.game.DiscardRequest();
                    var cardMsg = new proto.game.Card();
                    cardMsg.setCard(parameters.card);
                    message.setCard(cardMsg);

                    return message;
                },
            },
            SynchroniseCards: {
                cmd: 0x000E, // 13、服务端主动同步手牌
                response: 'SynchroniseCards',
            },
            SynchroniseScore: {
                cmd: 0x000F, // 15、玩家分数发生改变，同步分数
                response: 'SynchroniseScore',
            },

            Reconnect: {
                cmd: 0x1000, // 1、玩家断线重连
                response: 'Reconnect',
            },
            Prompt: {
                cmd: 0x1001, // 2、操作提示
                response: 'Prompt',
            },
            Action: {
                cmd: 0x1002, // 3、玩家根据提示列表选择动作
                response: 'Action',
                message: function (parameters) {
                    var message = new proto.game.ActionRequest();
                    message.setActionId(parameters.actionId);

                    return message;
                }
            },
            ReadyHand: {
                cmd: 0x1003, // 4、听牌提示
                response: 'ReadyHand',
            },
            SettleForRound: {
                cmd: 0x1005, // 5、小结算
                response: 'SettleForRound',
            },
            SettleForRoom: {
                cmd: 0x1006,
                response: 'SettleForRoom',
            },

            // 转转麻将, 抓鸟
            DrawNiao: {
                cmd: 0x3001,
                response: 'DrawNiao',
            },
            SettleForRoundZZ: {
                cmd: 0x3002,
                response: 'SettleForRoundZZ',
            },

            // 斗地主
            DealDDZ: {
                cmd: 0x2001, // 1、起手发牌
                response: 'DealDDZ',
            },
            DiscardDDZ: {
                cmd: 0x2004, // 2、出牌
                response: 'DiscardDDZ',
                message: function (parameters) {
                    var message = new proto.game.DiscardDDZRequest();
                    for (var i = 0; i < parameters.cards.length; i++) {
                        var cardMsg = new proto.game.Card();
                        cardMsg.setCard(parameters.cards[i]);
                        message.setCard(cardMsg);
                    }

                    return message;
                },
            },
            RobDDZ: {
                cmd: 0x2006, // 2、抢地主
                response: 'RobDDZ',
                message: function (parameters) {
                    var message = new proto.game.RobDDZRequest();
                    message.setFlag(parameters.flag);
                    message.setScore(parameters.score);

                    return message;
                },
            },
            ReconnectDDZ: {
                cmd: 0x2007, // 4、断线重连
                response: 'ReconnectDDZ',
            },
            SettleForRoundDDZ: {
                cmd: 0x2002, // 5、小结算
                response: 'SettleForRoundDDZ',
            },
            SettleForRoomDDZ: {
                cmd: 0x2003, // 6、大结算
                response: 'SettleForRoomDDZ',
            },
        }
    }
});

module.exports = PX258Network;