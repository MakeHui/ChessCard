const httpRequestManager = require("HttpRequestManager");

cc.Class({
    extends: cc.Component,

    properties: {
        roomNumber: 0,

        number1: cc.Sprite,
        number2: cc.Sprite,
        number3: cc.Sprite,
        number4: cc.Sprite,
        number5: cc.Sprite,
        number6: cc.Sprite,
    },

    // use this for initialization
    onLoad: function () {
        this.roomNumber = "";
    },

    numberButtonOnClick: function(evt, data) {
        if (this.roomNumber.length !== 6) {
            this.roomNumber += data;
            this["number" + this.roomNumber.length].spriteFrame = evt.target.children[0].getComponent(cc.Sprite).spriteFrame;
        }

        if (this.roomNumber.length === 6) {
            PX258.loading.open(this.node);

            let parameters = {roomId: this.roomNumber};
            let message = httpRequestManager.getRoomEnterRequestMessage(parameters);
            let self = this;
            httpRequestManager.httpRequest("roomEnter", message, function(event, result) {
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
        }
    },

    clearNumberOnClick: function(evt, data) {
        if (this.roomNumber.length !== 0) {
            for (let i = 1; i <= 6; ++i) {
                this["number" + i].spriteFrame = null;
            }
            this.roomNumber = "";
        }
    },

    deleteNumberOnClick: function(evt, data) {
        cc.log(this.roomNumber);
        if (this.roomNumber.length !== 0) {
            this["number" + this.roomNumber.length].spriteFrame = null;
            this.roomNumber = this.roomNumber.substr(0, this.roomNumber.length - 1);
        }
    },

    /**
     * 关闭本窗口
     */
    closeOnClick: function(event, data) {
        PX258.closeDialog(this.node);
    }
});
