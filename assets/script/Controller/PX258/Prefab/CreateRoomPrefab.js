cc.Class({
    extends: cc.Component,

    properties: {
        px258RoomLabel: [cc.Label],
        zzmjRoomLabel: [cc.Label],
        px258Panel: cc.Node,
        zzmjPanel: cc.Node
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
            }
        };

        var roomConfig = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo).roomConfig;
        for (var key in roomConfig) {
            if (window.PX258.Config.gameUuid.indexOf(key) === -1) {
                continue;
            }
            var i = 0;
            for (var k in roomConfig[key]) {
                if (key == window.PX258.Config.gameUuid[0]) {
                    this.px258RoomLabel[i].string = k + '局(' + roomConfig[key][k] + '金币)';
                }
                else if (key == window.PX258.Config.gameUuid[1]) {
                    this.zzmjRoomLabel[i].string = k + '局(' + roomConfig[key][k] + '金币)';
                }
                i += 1;
            }
        }
    },

    selectedOnClick(toggle, data) {
        cc.log(arguments);

        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        data = data.split('-');
        if (data[0] == 0) {
            this.roomConfig[this.gameUuid].maxRounds = parseInt(data[1], 10);
        }
        else if (data[0] == 1) {
            this.roomConfig[this.gameUuid].playType = data[1];
        }
        else if (data[0] == 2) {
            this.roomConfig[this.gameUuid].options = data[1];
        }
    },

    createRoomOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Dialog.openLoading();

        var roomConfig = this.roomConfig[this.gameUuid].playType;
        if (this.gameUuid == window.PX258.Config.gameUuid[0]) {
            roomConfig = roomConfig | this.roomConfig[this.gameUuid].options;
        }
        var parameters = { gameUuid: this.gameUuid, maxRounds: this.roomConfig[this.gameUuid].maxRounds, roomConfig: roomConfig };
        window.Global.NetworkManager.httpRequest(window.PX258.NetworkConfig.HttpRequest.roomCreate, parameters, (event, result) => {
            window.Global.Dialog.close();
            if (result.code === 1) {
                window.Global.Dialog.close();
                window.Global.Config.tempCache = result;
                const userInfo = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);
                userInfo.gold -= result.payGold;
                window.Global.Tools.setLocalData(window.Global.Config.LSK.userInfo, userInfo);
                cc.director.loadScene('GameRoom');
            }
            else if (result.code === 1023) {
                window.Global.Dialog.openMessageBox('充值请加微信公众号:【' + window.Global.Config.wxPublic + '】');
            }
        });
    },

    radioButtonClicked(toggle, data) {
        if (data == 0) {
            this.gameUuid = window.PX258.Config.gameUuid[0];
            this.px258Panel.active = true;
            this.zzmjPanel.active = false;
        }
        else if (data == 1) {
            this.gameUuid = window.PX258.Config.gameUuid[1];
            this.px258Panel.active = false;
            this.zzmjPanel.active = true;
        }
    },

    closeOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Animation.closeDialog(this.node);
    },
});
