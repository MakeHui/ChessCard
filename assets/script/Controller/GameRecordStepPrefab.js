cc.Class({
    extends: cc.Component,

    properties: {
        gameStepCell: cc.Prefab,
        gameStepList: cc.Node,

        datetime: cc.Label,

        username1: cc.Label,
        username2: cc.Label,
        username3: cc.Label,
        username4: cc.Label,
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    },

    // TODO: 微信分享
    shareOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
    },

    setData(data) {
        this.datetime.string = data.datetime;
        const recordInfoDataList = data.recordInfoDataList;
        if (recordInfoDataList.length !== 0) {
            this.gameRecordList.removeAllChildren();
            for (let i = 0; i < recordInfoDataList.length; i += 1) {
                const cell = cc.instantiate(this.gameStepCell);
                cell.getComponent('GameRecordStepCellPrefab').setData(recordInfoDataList[i], this.roomId);
                this.gameStepList.addChild(cell);
            }
        }
    }
});
