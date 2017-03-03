cc.Class({
    extends: cc.Component,

    properties: {
        roomNumber: cc.Label,
        avatar: {
            default: [],
            type: cc.Sprite,
        },
        nickname: {
            default: [],
            type: cc.Label
        },
        playerPanel: {
            default: [],
            type: cc.Node,
        }
    },

    enterGameRoomOnClick: function() {
        PX258.loading.open(this.node);

        let self = this;
        let parameters = {roomId: this.roomId};
        httpRequestManager.httpRequest("roomEnter", parameters, function(event, result) {
            if (result.getCode() == 1) {
                PX258.roomInfo = Tools.protobufToJson(result);
                PX258.loading.close();
                self.node.destroy();
                cc.director.loadScene('GameRoom');
            }
            else {
                PX258.loading.close();
            }
        });
    },

    wechatShareOnClick: function() {

    },

    setData: function(data) {
        let player = data.getPlayerList();
        for (let i = 0; i < player.length; ++i) {
            Tools.setWebImage(this.avatar[i], player[i].getHeadimgurl());
            this.nickname[i].string = player[i].getPlayerName();
            this.playerPanel[i].active = true;
        }
        this.roomNumber.string = '房间号: ' + data.getRoomId();
        this.roomId = data.getRoomId();
    }
});
