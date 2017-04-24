cc.Class({
    extends: cc.Component,

    properties: {
        inputRoomNumberPrefab: cc.Prefab,
        gameRecordCell: cc.Prefab,
        gameRecordStep: cc.Prefab,
    },

    onLoad() {
        this._getGameRecordListData();
    },

    seeOtherRoomOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        const node = cc.instantiate(this.inputRoomNumberPrefab);
        node.getComponent('InputRoomNumberPrefab').setData('GameRecordList');
        Global.openDialog(node, this.node);
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    },

    onGetGameRecordInfoDataCallback(scene, roomUuid) {
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

    _getGameRecordListData() {
        Global.dialog.open('Loading', this.node);

        const self = this;
        HttpRequestManager.httpRequest('recordInfo', {}, (event, result) => {
            if (result.code === 1) {
                const roomItemList = result.roomItemList;
                if (roomItemList.length !== 0) {
                    self.gameRecordList.removeAllChildren();
                    for (let i = 0; i < roomItemList.length; i += 1) {
                        const cell = cc.instantiate(this.gameRecordCell).getComponent('GameRecordCellPrefab').init(roomItemList[i]);
                        self.gameRecordList.addChild(cell);
                    }
                }
            }
            Global.dialog.close();
        });
    },
});
