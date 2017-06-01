cc.Class({
    extends: cc.Component,

    properties: {
        datetime: cc.Label,
        roomNumber: cc.Label,
        avatar: {
            default: [],
            type: cc.Sprite,
        },
        nickname: {
            default: [],
            type: cc.Label
        },
        point: {
            default: [],
            type: cc.Label,
        },

        gameRecord: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {

    },

    openGameRecordOnClick: function() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Dialog.openLoading();

        let node = cc.instantiate(self.gameRecord);
        node.getComponent('GameStep').init(this.roomId);
        window.Global.Animation.openDialog(node, self.node);
    },

    init: function(data) {
        let player = data.getPlayer();
        for (let i = 0; i < player.length; i += 1) {
           window.Global.Tools.setWebImage(this.avatar[i], player[i].getHeadimgurl());
            this.nickname[i].string = player[i].getPlayerName();
            this.point[i].string = '积分:' + player[i].getPoint();
        }
        this.roomNumber.string = '房间号: ' + data.getRoomId();
        this.datetime.string = data.getDateTime();

        this.roomId = data.getRoomId();
    }
});
