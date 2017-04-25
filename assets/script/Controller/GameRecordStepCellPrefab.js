cc.Class({
    extends: cc.Component,

    properties: {
        inputRoomNumber: cc.Prefab,
        stepNumber: cc.Label,
        winTag: [cc.Sprite],
        point: [cc.Label],
    },

    playbackOnClick() {
        window.SoundEffect.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    },

    init(data) {
        const playerInfoList = data.playerInfoList;
        for (let i = 0; i < playerInfoList.length; i += 1) {
            this.point.string = `积分: ${playerInfoList[i].getScore()}`;
            if (playerInfoList[i].getFlag() == 1) {
                this.winTag.active = true;
            }
        }
    }
});
