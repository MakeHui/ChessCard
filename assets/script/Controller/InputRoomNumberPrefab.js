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
            if (this.gotoScene == 'GameRoom') {
                this._getHttpRoomEnterData();
            }
            else if (this.gotoScene == 'ReviewRoom') {

            }
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
        Global.closeDialog(this.node);
    },

    _getHttpRoomEnterData: function() {
        Global.loading.open(this.node);

        let self = this;
        let parameters = {roomId: this.roomNumber};
        HttpRequestManager.httpRequest("roomEnter", parameters, function(event, result) {
            if (result.getCode() == 1) {
                Global.loading.close();
                self.node.destroy();
                Global.tempCache = result;
                cc.director.loadScene('GameRoom');
            }
            else {
                Global.loading.close();
            }
        });
    },

    setData: function(data) {
        this.gotoScene = data;
    }
});
