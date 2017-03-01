cc.Class({
    extends: cc.Component,

    properties: {
        inputRoomNumber: cc.Prefab,
        gameRecordCell: cc.Prefab,
        gameRecordList: cc.Node,
        gameRecordData: [],

    },

    // use this for initialization
    onLoad: function () {
        cc.log("onLoad");
    },

    start: function() {
        cc.log("start");
    },

    seeOtherRoomOnClick: function() {
        cc.instantiate(this.inputRoomNumber).parent = cc.director.getScene();
    },

    /**
     * 关闭本窗口
     */
    closeOnClick: function(event, data) {
        PX258.closeDialog(this.node);
    },

    setData: function(data) {
        this.roomId = data;
    },

    _getHttpGameRecordData: function () {
        PX258.loading.open(this.node);

        let message = httpRequestManager.getRecordListRequestMessage();
        let self = this;
        httpRequestManager.httpRequest("recordListSelf", message, function(event, result) {
            if (result.getCode() == 1) {
                let roomItemList = result.getRoomItemList();
                if (roomItemList.length !== 0) {
                    self.gameRecordList.removeAllChildren();
                    for (let i = 0; i < roomItemList.length; ++i) {
                        let cell = cc.instantiate(this.gameIngCell);
                        cell.getComponent('GameIngCellPrefab').setData(roomItem[i]);
                        self.gameRecordList.addChild(cell);
                    }
                }
            }
            else {

            }
            PX258.loading.close();
        });
    }
});
