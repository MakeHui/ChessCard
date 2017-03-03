cc.Class({
    extends: cc.Component,

    properties: {
        gameStepData: [],

        gameStepCell: cc.Prefab,
        gameStepList: cc.Node,

        datetime: cc.Label,

        username1: cc.Label,
        username2: cc.Label,
        username3: cc.Label,
        username4: cc.Label,
    },

    // use this for initialization
    onLoad: function () {

    },

    seeOtherRoomOnClick: function() {

    },

    /**
     * 关闭本窗口
     */
    closeOnClick: function(event, data) {
        PX258.closeDialog(this.node);
    },

    shareOnClick: function(evt, data) {

    },

    setData: function(data) {
        this.roomId = data;
        this._getHttpRecordInfoData();
    },

    _getHttpRecordInfoData: function() {
        PX258.loading.open(this.node);

        let self = this;
        HttpRequestManager.httpRequest("recordInfo", {}, function(event, result) {
            if (result.getCode() == 1) {
                self.datetime.string = result.getDatetime();
                let recordInfoDataList = result.getRecordInfoDataList();
                if (recordInfoDataList.length !== 0) {
                    self.gameRecordList.removeAllChildren();
                    for (let i = 0; i < recordInfoDataList.length; ++i) {
                        let cell = cc.instantiate(this.gameStepCell);
                        cell.getComponent('GameStepCellPrefab').setData(recordInfoDataList[i], this.roomId);
                        self.gameStepList.addChild(cell);
                    }

                }
            }
            else {

            }
            PX258.loading.close();
        });
    }
});
