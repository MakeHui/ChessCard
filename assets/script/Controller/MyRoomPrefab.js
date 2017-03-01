const httpRequestManager = require("HttpRequestManager");

cc.Class({
    extends: cc.Component,

    properties: {
        gameIngCell: cc.Prefab,
        gameIngPanel: cc.Node,
        gameIngList: cc.Node,

        gameEndCell: cc.Prefab,
        gameEndPanel: cc.Node,
        gameEndList: cc.Node,

        noDataCell: cc.Prefab,

        radioButton: {
            default: [],
            type: cc.Toggle
        },
    },

    // use this for initialization
    onLoad: function () {
        this._getHttpIngListForSelfData();
    },

    shareOnClick: function() {
        cc.log("shareOnClick");
    },

    /**
     * 关闭本窗口
     */
    closeOnClick: function(event, data) {
        PX258.closeDialog(this.node);
    },

    radioButtonClicked: function(toggle) {
        let index = this.radioButton.indexOf(toggle);
        if (index === 0) {
            this.gameEndPanel.active = false;
            this.gameIngPanel.active = true;
            if (this.gameIngList.getChildByName('sa_item_noData') === null) {
                this._getHttpIngListForSelfData();
            }
        }
        else if (index === 1) {
            this.gameIngPanel.active = false;
            this.gameEndPanel.active = true;
            cc.log(this.gameEndList.getChildByName('sa_item_noData'));
            if (this.gameEndList.getChildByName('sa_item_noData') === null) {
                this._getHttpEndListForSelfData();
            }
        }
    },

    _getHttpIngListForSelfData: function() {
        PX258.loading.open(this.node);

        let message = httpRequestManager.getRoomListRequestMessage();
        let self = this;
        httpRequestManager.httpRequest("roomList", message, function(event, result) {
            if (result.getCode() == 1) {
                let roomItem = result.getRoomItemList();
                cc.log(roomItem.length);
                if (roomItem.length === 0) {
                    self.gameIngList.removeAllChildren();
                    self.gameIngList.addChild(cc.instantiate(self.noDataCell));
                }
                for (let i = 0; i < roomItem.length; ++i) {
                    let cell = cc.instantiate(self.gameIngCell);
                    cell.getComponent('GameIngCellPrefab').setData(roomItem[i]);
                    self.gameIngList.addChild(cell);
                }
            }
            else {
                cc.log(self.gameIngList.childrenCount);
                if (self.gameIngList.childrenCount === 0) {
                    self.gameIngList.addChild(cc.instantiate(self.noDataCell));
                }
            }
            PX258.loading.close();
        });
    },

    _getHttpEndListForSelfData: function() {
        PX258.loading.open(this.node);

        let message = httpRequestManager.getRecordListRequestMessage();
        let self = this;
        httpRequestManager.httpRequest("recordList", message, function(event, result) {
            if (result.getCode() == 1) {
                let roomItem = result.getRoomItem();
                if (roomItem.length > 0) {
                    this.gameEndList.removeAllChildren();
                    this.gameEndList.addChild(cc.instantiate(this.noDataCell));
                }
                for (let i = 0; i < roomItem.length; ++i) {
                    let cell = cc.instantiate(this.gameEndCell);
                    cell.getComponent('GameIngCellPrefab').setData(roomItem[i]);
                    self.gameIngList.addChild(cell);
                }
            }
            else {
                if (self.gameEndList.childrenCount === 0) {
                    self.gameEndList.addChild(cc.instantiate(self.noDataCell));
                }
            }
            PX258.loading.close();
        });
    },
});
