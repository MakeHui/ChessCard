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

        window.SoundEffect.playEffect(GlobalConfig.audioUrl.effect.buttonClick);
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
        window.SoundEffect.playEffect(GlobalConfig.audioUrl.effect.buttonClick);
        window.Dialog.openLoading();

        const parameters = { gameUuid: this.gameUuid, maxRounds: this.maxRounds, roomConfig: this.playType | this.options };
        HttpRequestManager.httpRequest('roomCreate', parameters, (event, result) => {
            if (result.code === 1) {
                window.Dialog.close();
                GlobalConfig.tempCache = result;
                const userInfo = Tools.getLocalData(GlobalConfig.LSK.userInfo);
                userInfo.gold -= result.payGold;
                Tools.setLocalData(GlobalConfig.LSK.userInfo, userInfo);
                cc.director.loadScene('GameRoom');
            }
            else {
                window.Dialog.close();
            }
        });
    },

    closeOnClick() {
        window.SoundEffect.playEffect(GlobalConfig.audioUrl.effect.buttonClick);
        Animation.closeDialog(this.node);
    },
});
