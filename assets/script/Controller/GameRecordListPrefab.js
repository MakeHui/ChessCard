cc.Class({
    extends: cc.Component,

    properties: {
        inputRoomNumberPrefab: cc.Prefab,
        gameRecordCell: cc.Prefab,
        gameRecordStep: cc.Prefab,
        gameRecordList: cc.Node,
    },

    onLoad() {
        this._getHttpRecordListSelfData();
    },

    seeOtherRoomOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        const node = cc.instantiate(this.inputRoomNumberPrefab);
        node.getComponent('RoomNumberInputBox').init('GameRecordList');
        Global.openDialog(node, this.node);
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    },

    _getHttpGameRecordInfoData(scene, roomUuid) {
        const self = this;
        Global.dialog.open('Loading', this.node);
        HttpRequestManager.httpRequest('recordListSelf', { roomUuid }, (event, result) => {
            Global.dialog.close();
            if (result.code == 1) {
                Global.closeDialog(scene.node);
                const node = cc.instantiate(self.gameRecordStep);
                node.getComponent('GameRecordStepPrefab').setData(result);
                Global.openDialog(node, self.node);
            }
            else if (result.code === 1021) {
                Global.tempCache = '没有可查询的数据';
                Global.dialog.open('Dialog', this.node);
            }
        });
    },

    _getHttpRecordListSelfData() {
        Global.dialog.open('Loading', this.node);

        const self = this;
        HttpRequestManager.httpRequest('recordListSelf', {}, (event, result) => {
            if (result.code === 0) {
                const recordItemList = result.recordItemList;
                if (recordItemList.length !== 0) {
                    self.gameRecordList.removeAllChildren();
                    for (let i = 0; i < recordItemList.length; i += 1) {
                        const cell = cc.instantiate(this.gameRecordCell);
                        cell.getComponent('GameRecordCellPrefab').init(recordItemList[i]);
                        self.gameRecordList.addChild(cell);
                    }
                }
            }
            Global.dialog.close();
        });
    },
});
