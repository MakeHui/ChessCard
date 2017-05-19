cc.Class({
    extends: cc.Component,

    properties: {
        roomLabel: [cc.Label],
    },

    // use this for initialization
    onLoad() {
        this.gameUuid = '100100';
        this.maxRounds = 8;
        this.playType = 0x1;
        this.options = 0x100;

        var userInfo = Tools.getLocalData(GlobalConfig.LSK.userInfo).roomConfig;
        var i = 0;
        for (var key in userInfo[this.gameUuid]) {
            this.roomLabel[i].string = key + '局(' + userInfo[this.gameUuid][key] + '金币)';
            i += 1;
        }
    },

    selectedOnClick(toggle, data) {
        cc.log(arguments);

        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
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
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Dialog.openLoading();

        const parameters = { gameUuid: this.gameUuid, maxRounds: this.maxRounds, roomConfig: this.playType | this.options };
        HttpRequestManager.httpRequest('roomCreate', parameters, (event, result) => {
            window.Global.Dialog.close();
            if (result.code === 1) {
                window.Global.Dialog.close();
                GlobalConfig.tempCache = result;
                const userInfo = Tools.getLocalData(GlobalConfig.LSK.userInfo);
                userInfo.gold -= result.payGold;
                Tools.setLocalData(GlobalConfig.LSK.userInfo, userInfo);
                cc.director.loadScene('GameRoom');
            }
            else if (result.code === 1023) {
                Dialog.openMessageBox('金币不足请到 ' + GlobalConfig.wxPublic + ' 公众号进行充值');
            }
        });
    },

    closeOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        Animation.closeDialog(this.node);
    },
});
