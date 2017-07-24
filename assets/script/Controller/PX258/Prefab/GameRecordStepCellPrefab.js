cc.Class({
    extends: cc.Component,

    properties: {
        inputRoomNumber: cc.Prefab,
        stepNumber: cc.Label,
        winTag: [cc.Sprite],
        point: [cc.Node],
        gameReviewPrefab: cc.Prefab,
        ddzGameReviewPrefab: cc.Prefab,
        layout: cc.Layout,
    },

    playbackOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Dialog.openLoading();

        var parameters = {roomUuid: this._Cache.roomUuid, theRound: this._Cache.theRound};
        window.Global.NetworkManager.httpRequest(window.PX258.NetworkConfig.HttpRequest.replay, parameters, (event, result) => {
            window.Global.Dialog.close();
            if (result.code === 1) {
                var data = JSON.parse(result.replay);
                var parentNode = cc.director.getScene().getChildByName('Canvas');
                if (result.gameUuid === window.PX258.Config.gameUuid[2]) {
                    var node =  cc.instantiate(this.ddzGameReviewPrefab);
                    node.getComponent('DDZGameReview').init(data);
                    window.Global.Animation.openDialog(node, parentNode);
                }
                else {
                    var node =  cc.instantiate(this.gameReviewPrefab);
                    node.getComponent('GameReview').init(data);
                    window.Global.Animation.openDialog(node, parentNode);
                }
            }
            else {
                window.Global.Dialog.openMessageBox('请求失败');
            }
        });
    },

    init(data) {
        this._Cache = data;
        var playerInfoList = data.playerInfoList;

        if (playerInfoList.length === 4) {
            this.layout.spacingX = 72;
        }
        else {
            this.layout.spacingX = 116;
        }

        this.stepNumber.string = '第' + data.theRound + '局';
        for (var i = 0; i < playerInfoList.length; i += 1) {
            this.point[i].getComponent(cc.Label).string = `积分: ${playerInfoList[i].score}`;
            this.point[i].active = true;
        }
    }
});