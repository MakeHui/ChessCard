cc.Class({
    extends: cc.Component,

    properties: {
        inputRoomNumber: cc.Prefab,
        gameRecordCell: cc.Prefab,
        gameRecordList: cc.Node,
        gameRecordData: [],

    },

    // use this for initialization
    onLoad() {
        Global.log('onLoad');
    },

    seeOtherRoomOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        cc.instantiate(this.inputRoomNumber).parent = cc.director.getScene();
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    },

    setData(data) {
        this.roomId = data;
    },

    _getHttpGameRecordData() {
        Global.dialog.open('Loading', this.node);

        const self = this;
        HttpRequestManager.httpRequest('recordListSelf', {}, (event, result) => {
            if (result.code === 1) {
                const roomItemList = result.roomItemList;
                if (roomItemList.length !== 0) {
                    self.gameRecordList.removeAllChildren();
                    for (let i = 0; i < roomItemList.length; i += 1) {
                        const cell = cc.instantiate(this.gameIngCell);
                        cell.getComponent('GameIngCellPrefab').setData(roomItemList[i]);
                        self.gameRecordList.addChild(cell);
                    }
                }
            }
            Global.dialog.close();
        });
    },
});
