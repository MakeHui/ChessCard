const httpRequestManager = require("HttpRequestManager");

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {
        this.gameUuid = "100100";
        this.maxRounds = 8;
        this.roomConfig = {
            play_type:{
                is_small_win: 1,
            },
            options:{
                small_win: 1,
                big_win: 0,
                two_win: 0,
                three_win: 0,
                four_win: 0
            }
        };
    },

    selectedOnClick: function(toggle, data) {
        data = data.split('-');
        if (data[0] == 1) {
            if (data[1] == 1) {
                this.maxRounds = 8;
            }
            else {
                this.maxRounds = 16;
            }
        }
        else if (data[0] == 3) {
            for (let i in this.roomConfig.options) {
                this.roomConfig.options[i] = 0;
            }
            this.roomConfig.options[data[1]] = 1;
        }
    },

    createRoomOnClick: function() {
        PX258.loading.open(this.node);

        let parameters = {gameUuid: this.gameUuid, maxRounds: this.maxRounds, roomConfig: JSON.stringify(this.roomConfig)};
        let message = httpRequestManager.getRoomCreateRequestMessage(parameters);
        let self = this;
        httpRequestManager.httpRequest("roomCreate", message, function(event, result) {
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

    closeOnClick: function() {
        PX258.closeDialog(this.node);
    }
    
});
