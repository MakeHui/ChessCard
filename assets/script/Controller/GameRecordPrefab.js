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
        Global.closeDialog(this.node);
    },

    setData: function(data) {
        this.roomId = data;
    },

    _getHttpGameRecordData: function () {
        Global.loading.open(this.node);

        let self = this;
        HttpRequestManager.httpRequest("recordListSelf", {}, function(event, result) {
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
            Global.loading.close();
        });
    }
});
