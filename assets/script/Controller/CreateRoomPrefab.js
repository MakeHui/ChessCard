cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad() {
        this.gameUuid = '100100';
        this.maxRounds = 8;
        this.roomConfig = {
            play_type: {
                is_small_win: 1,
            },
            options: {
                small_win: 1,
                big_win: 0,
                two_win: 0,
                three_win: 0,
                four_win: 0,
            },
        };
    },

    selectedOnClick(toggle, data) {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        data = data.split('-');
        if (parseInt(data[0], 10) === 1) {
            if (parseInt(data[1], 10) === 1) {
                this.maxRounds = 8;
            }
            else {
                this.maxRounds = 16;
            }
        }
        else if (parseInt(data[0], 10) === 3) {
            for (const k in this.roomConfig.options) {
                this.roomConfig.options[k] = 0;
            }
            this.roomConfig.options[data[1]] = 1;
        }
    },

    createRoomOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.dialog.open('Loading', this.node);

        const parameters = {
            gameUuid: this.gameUuid,
            maxRounds: this.maxRounds,
            roomConfig: JSON.stringify(this.roomConfig),
        };
        HttpRequestManager.httpRequest('roomCreate', parameters, (event, result) => {
            if (result.code === 1) {
                Global.dialog.close();
                Global.tempCache = result;
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
