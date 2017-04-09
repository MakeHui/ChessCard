cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad() {
        this.gameUuid = '100100';
        this.maxRounds = 8;
        this.playType = 0x1;
        this.options = 0x100;
    },

    selectedOnClick(toggle, data) {
        cc.log(arguments);

        Global.playEffect(Global.audioUrl.effect.buttonClick);
        data = data.split('-');
        if (data[0] == 0) {
            this.maxRounds = parseInt(data[1], 10);
        }
        else if (data[0] == 1) {
            this.playType = data[1];
        }
        else if (data[0] == 2) {
            this.options = data[1];
        }
    },

    createRoomOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.dialog.open('Loading', this.node);

        const parameters = { gameUuid: this.gameUuid, maxRounds: this.maxRounds, roomConfig: this.playType | this.options };
        HttpRequestManager.httpRequest('roomCreate', parameters, (event, result) => {
            if (result.code === 1) {
                Global.dialog.close();
                Global.tempCache = result;
                const userInfo = Tools.getLocalData(Global.LSK.userInfo);
                userInfo.gold -= result.payGold;
                Tools.setLocalData(Global.LSK.userInfo, userInfo);
                cc.director.loadScene('GameRoom');
            }
            else {
                Global.dialog.close();
            }
        });
    },

    closeOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    },
});
