cc.Class({
    extends: cc.Component,

    properties: {
        inputRoomNumber: cc.Prefab,
        stepNumber: cc.Label,
        winTag: [cc.Sprite],
        point: [cc.Label],
        gameReviewPrefab: cc.Prefab,
    },

    playbackOnClick() {
        window.SoundEffect.playEffect(window.PX258Config.audioUrl.effect.buttonClick);
        window.Dialog.openLoading();

        var parameters = {roomUuid: this._Cache.roomUuid, theRound: this._Cache.theRound};
        HttpRequestManager.httpRequest('replay', parameters, (event, result) => {
            window.Dialog.close();
            if (result.code === 1) {
                var data = JSON.parse(result.replay);
                var node =  cc.instantiate(this.gameReviewPrefab);
                var parentNode = cc.director.getScene().getChildByName('Canvas');
                node.getComponent('GameReview').init(data);
                window.Animation.openDialog(node, parentNode);
            }
            else {
                window.Dialog.openMessageBox('请求失败');
            }
        });
    },

    init(data) {
        this._Cache = data;
        var playerInfoList = data.playerInfoList;
        this.stepNumber.string = '第' + data.theRound + '局';
        for (var i = 0; i < playerInfoList.length; i += 1) {
            this.point[i].string = `积分: ${playerInfoList[i].score}`;
        }
    }
});
