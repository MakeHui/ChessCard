cc.Class({
    extends: cc.Component,

    properties: {
        gameStepCell: cc.Prefab,
        gameStepList: cc.Node,
        datetime: cc.Label,
        username: [cc.Label],
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        window.SoundEffect.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    },

    // TODO: 微信分享
    shareOnClick() {
        window.SoundEffect.playEffect(Global.audioUrl.effect.buttonClick);
    },

    // TODO:Bug
    init: function(roomId) {
        window.Dialog.openLoading();
        const self = this;
        HttpRequestManager.httpRequest('roomReplay', {roomId: roomId}, (event, result) => {
            self.datetime.string = result.datetime;
            const recordInfoDataList = result.recordInfoDataList;
            if (recordInfoDataList.length !== 0) {
                this.gameStepList.removeAllChildren();

                for (let i = 0; i < recordInfoDataList[0].playerInfoList.length; i += 1) {
                    var nickname = recordInfoDataList[0].playerInfoList[i].nickname;
                    self.username[i].string = nickname;
                }

                for (let i = 0; i < recordInfoDataList.length; i += 1) {
                    const cell = cc.instantiate(this.gameStepCell);
                    cell.getComponent('GameRecordStepCellPrefab').init(recordInfoDataList[i], this.roomId);
                    this.gameStepList.addChild(cell);
                }
            }
            window.Dialog.close();
        });
    }
});
