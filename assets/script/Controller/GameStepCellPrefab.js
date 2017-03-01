cc.Class({
    extends: cc.Component,

    properties: {
        inputRoomNumber: cc.Prefab,
        stepNumber: cc.Label,

        winTag: {
            default: [],
            type: cc.Sprite
        },

        point: {
            default: [],
            type: cc.Label
        }
    },

    // use this for initialization
    onLoad: function () {

    },

    playbackOnClick: function() {
        PX258.openDialog(cc.instantiate(this.inputRoomNumber), this.node);
    },

    setData: function(data, roomId) {
        this.roomId = roomId;
        let playerInfoList = data.getPlayerInfoList();
        this.theRound = playerInfoList.getTheRound();

        for (let i = 0; i < playerInfoList.length; ++i) {
            this.point.string = "积分:" + playerInfoList[i].getScore();
            if (playerInfoList[i].getFlag() == 1) {
                this.winTag.active = true;
            }
        }
    }
});
