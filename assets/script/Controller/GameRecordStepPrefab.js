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
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    },

    // TODO: 微信分享
    shareOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
    },

    // TODO:Bug
    init: function(roomId) {
        Dialog.openLoading();
        const self = this;
        HttpRequestManager.httpRequest('roomReplay', {roomId: roomId}, (event, result) => {
            cc.log(result);
            // if (result.code === 0 && result.recordItemList.length !== 0) {
            //     this.gameEndList.removeAllChildren();
            //     const roomItem = result.recordItemList;
            //     for (let i = 0; i < roomItem.length; i += 1) {
            //         const cell = cc.instantiate(this.gameEndCell);
            //         cell.getComponent('GameRecordCellPrefab').init(roomItem[i]);
            //         self.gameEndList.addChild(cell);
            //     }
            // }
            // else {
            //     self.gameEndList.addChild(cc.instantiate(self.noDataCell));
            // }
            Dialog.close();
        });

        // this.datetime.string = data.datetime;
        // const recordInfoDataList = data.recordInfoDataList;
        // if (recordInfoDataList.length !== 0) {
        //     this.gameRecordList.removeAllChildren();
        //     for (let i = 0; i < recordInfoDataList.length; i += 1) {
        //         const cell = cc.instantiate(this.gameStepCell);
        //         cell.getComponent('GameRecordStepCellPrefab').setData(recordInfoDataList[i], this.roomId);
        //         this.gameStepList.addChild(cell);
        //     }
        // }
    }
});
