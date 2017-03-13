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
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.loading.open(this.node);

        let self = this;
        let parameters = {roomId: this.roomId};
        HttpRequestManager.httpRequest("roomEnter", parameters, function(event, result) {
            if (result.getCode() == 1) {
                Global.roomInfo = Tools.protobufToJson(result);
                Global.loading.close();
                self.node.destroy();
                cc.director.loadScene('GameRoom');
            }
            else {
                Global.loading.close();
            }
        });
    },

    wechatShareOnClick: function() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);

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
