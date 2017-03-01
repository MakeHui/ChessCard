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
            type: cc.Label
        }
    },

    // use this for initialization
    onLoad: function () {

    },

    setData: function(data) {
        let player = data.getPlayer();
        for (let i = 0; i < player.length; ++i) {
            Tools.setWebImage(this.avatar[i], player[i].getHeadimgurl());
            this.nickname[i].string = player[i].getPlayerName();
        }
        this.roomNumber.string = '房间号: ' + data.getRoomId();
    }
});
