cc.Class({
    extends: cc.Component,

    properties: {
        inputRoomNumber: cc.Prefab,
        stepNumber: cc.Label,
        winTag: [cc.Sprite],
        point: [cc.Label],
    },

    playbackOnClick() {
        window.SoundEffect.playEffect(GlobalConfig.audioUrl.effect.buttonClick);
        Animation.closeDialog(this.node);
    },

    init(data) {
        const playerInfoList = data.playerInfoList;
        this.stepNumber.string = '第' + data.theRound + '局';
        for (let i = 0; i < playerInfoList.length; i += 1) {
            this.point[i].string = `积分: ${playerInfoList[i].score}`;
        }
    }
});
