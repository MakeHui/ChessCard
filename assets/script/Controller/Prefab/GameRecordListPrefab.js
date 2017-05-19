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
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        const node = cc.instantiate(this.inputRoomNumberPrefab);
        node.getComponent('RoomNumberInputBox').init('GameRecordList');
        Animation.openDialog(node, this.node);
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        Animation.closeDialog(this.node);
    },

    _getHttpGameRecordInfoData(scene, roomUuid) {
        const self = this;
        window.Global.Dialog.openLoading();
        HttpRequestManager.httpRequest('recordListSelf', { roomUuid }, (event, result) => {
            window.Global.Dialog.close();
            if (result.code == 1) {
                Animation.closeDialog(scene.node);
                const node = cc.instantiate(self.gameRecordStep);
                node.getComponent('GameRecordStepPrefab').init(result);
                Animation.openDialog(node, self.node);
            }
            else if (result.code === 1021) {
                window.Global.Dialog.openMessageBox('没有可查询的数据');
            }
        });
    },

    _getHttpRecordListSelfData() {
        window.Global.Dialog.openLoading();

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
            window.Global.Dialog.close();
        });
    },
});
