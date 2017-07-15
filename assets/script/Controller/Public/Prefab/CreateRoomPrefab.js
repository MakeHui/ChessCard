cc.Class({
    extends: cc.Component,

    properties: {
        px258RoomLabel: [cc.Label],
        zzmjRoomLabel: [cc.Label],
        ddzRoomLabel: [cc.Label],
        px258Panel: cc.Node,
        zzmjPanel: cc.Node,
        ddzPanel: cc.Node,
    },

    // use this for initialization
    onLoad() {
        this.gameUuid = window.PX258.Config.gameUuid[0];
        this.roomConfig = {
            100100: {
                maxRounds: 8,
                playType: 0x1,
                options: 0x100,
            },
            100300: {
                maxRounds: 8,
                playType: 0x1,
                options: 0x0,
                zhuaniao: 0x0,
            },
            100200: {
                maxRounds: 8,
                playType: 0b10,
                options: 0b1000,
            }
        };

        var roomConfig = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo).roomConfig;
        for (var key in roomConfig) {
            var i = 0;
            for (var k in roomConfig[key]) {
                if (key == window.PX258.Config.gameUuid[0]) {
                    this.px258RoomLabel[i].string = k + '局(' + roomConfig[key][k] + '金币)';
                }
                else if (key == window.PX258.Config.gameUuid[1]) {
                    this.zzmjRoomLabel[i].string = k + '局(' + roomConfig[key][k] + '金币)';
                }
                else if (key == window.PX258.Config.gameUuid[2]) {
                    this.ddzRoomLabel[i].string = k + '局(' + roomConfig[key][k] + '金币)';
                }
                i += 1;
            }
        }
    },

    selectedOnClick(event, data) {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        data = data.split('-');
        if (data[0] == 0) {
            this.roomConfig[this.gameUuid].maxRounds = parseInt(data[1], 10);
        }
        else if (data[0] == 1) {
            this.roomConfig[this.gameUuid].playType = data[1];
        }
        else if (data[0] == 2) {
            this.roomConfig[this.gameUuid].options = event.isChecked ? data[1] : 0x0;
        }
        else if (data[0] == 3) {
            this.roomConfig[this.gameUuid].zhuaniao = data[1];
        }
        cc.log([data, this.roomConfig[this.gameUuid]]);
    },

    createRoomOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Dialog.openLoading();

        var parameters = { gameUuid: this.gameUuid, maxRounds: this.roomConfig[this.gameUuid].maxRounds, roomConfig: this.createRoomConfig() };
        window.Global.NetworkManager.httpRequest(window.PX258.NetworkConfig.HttpRequest.roomCreate, parameters, (event, result) => {
            window.Global.Dialog.close();
            if (result.code === 1) {
                window.Global.Config.tempCache = result;
                const userInfo = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);
                userInfo.gold -= result.payGold;
                window.Global.Tools.setLocalData(window.Global.Config.LSK.userInfo, userInfo);
                if (this.gameUuid ==  window.PX258.Config.gameUuid[0]) {
                    cc.director.loadScene('GameRoom');
                }
                else if (this.gameUuid ==  window.PX258.Config.gameUuid[1]) {
                    cc.director.loadScene('GameRoom');
                }
                else if (this.gameUuid == window.PX258.Config.gameUuid[2]) {
                    cc.director.loadScene('DDZGameRoom');
                }
            }
            else if (result.code === 1023) {
                window.Global.Dialog.openMessageBox('充值请加微信公众号:【' + window.Global.Config.wxPublic + '】');
            }
        });
    },

    radioButtonClicked(toggle, data) {
        if (data == 0) {
            this.gameUuid = window.PX258.Config.gameUuid[0];
            this._hidePanel();
            this.px258Panel.active = true;
        }
        else if (data == 1) {
            this.gameUuid = window.PX258.Config.gameUuid[1];
            this._hidePanel();
            this.zzmjPanel.active = true;
        }
        else if (data == 2) {
            this.gameUuid = window.PX258.Config.gameUuid[2];
            this._hidePanel();
            this.ddzPanel.active = true;
        }
    },

    createRoomConfig() {
        var roomConfig;

        if (this.gameUuid == window.PX258.Config.gameUuid[0]) {
            roomConfig = this.roomConfig[this.gameUuid].playType | this.roomConfig[this.gameUuid].options;
        }
        else if (this.gameUuid == window.PX258.Config.gameUuid[1]) {
            roomConfig = this.roomConfig[this.gameUuid].playType | this.roomConfig[this.gameUuid].options;
            roomConfig = roomConfig | this.roomConfig[this.gameUuid].zhuaniao;
        }
        else if (this.gameUuid == window.PX258.Config.gameUuid[2]) {
            roomConfig = this.roomConfig[this.gameUuid].playType | this.roomConfig[this.gameUuid].options;
        }

        return roomConfig;
    },

    _hidePanel() {
        this.px258Panel.active = false;
        this.zzmjPanel.active = false;
        this.ddzPanel.active = false;
    },

    closeOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Animation.closeDialog(this.node);
    },
});
