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
            type: cc.Label,
        },
        playerPanel: {
            default: [],
            type: cc.Node,
        },
    },

    enterGameRoomOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.loading.open(this.node);

        const self = this;
        const parameters = { roomId: this.roomId };
        HttpRequestManager.httpRequest('roomEnter', parameters, (event, result) => {
            if (result.code === 1) {
                Global.loading.close();
                self.node.destroy();
                cc.director.loadScene('GameRoom');
            }
            else {
                Global.loading.close();
            }
        });
    },

    wechatShareOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
    },

    setData(data) {
        const player = data.playerList;
        for (let i = 0; i < player.length; i += 1) {
            Tools.setWebImage(this.avatar[i], player[i].headimgurl);
            this.nickname[i].string = player[i].playerName;
            this.playerPanel[i].active = true;
        }
        this.roomNumber.string = `房间号: ${data.roomId}`;
        this.roomId = data.roomId;
    },
});
