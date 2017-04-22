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
            type: cc.Toggle,
        },
    },

    // use this for initialization
    onLoad() {
        this._getHttpIngListForSelfData();
    },

    shareOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        var node = Tools.findNode(this.node, 'Dialog>Panel_Middle');
        cc.log(this.node);
        cc.log(node);
        Tools.captureScreen(node, function(path) {
            cc.log(path);
        });
        cc.log('shareOnClick');
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);

        Global.closeDialog(this.node);
    },

    radioButtonClicked(toggle) {
        const index = this.radioButton.indexOf(toggle);
        if (index === 0) {
            this.gameEndPanel.active = false;
            this.gameIngPanel.active = true;
            cc.log(this.gameIngList.getChildByName('MyRoomNoDataCell'));
            if (this.gameIngList.childrenCount === 0) {
                this._getHttpIngListForSelfData();
            }
        }
        else if (index === 1) {
            this.gameIngPanel.active = false;
            this.gameEndPanel.active = true;
            cc.log(this.gameEndList.getChildByName('MyRoomNoDataCell'));
            if (this.gameEndList.childrenCount === 0) {
                this._getHttpEndListForSelfData();
            }
        }
    },

    _getHttpIngListForSelfData() {
        Global.dialog.open('Loading', this.node);

        const self = this;
        HttpRequestManager.httpRequest('roomList', {}, (event, result) => {
            Global.dialog.close();

            if (result.code === 1) {
                const roomItem = result.roomItemList;
                cc.log(roomItem.length);
                if (roomItem.length === 0) {
                    self.gameIngList.removeAllChildren();
                    self.gameIngList.addChild(cc.instantiate(self.noDataCell));
                }
                for (let i = 0; i < roomItem.length; i += 1) {
                    const cell = cc.instantiate(self.gameIngCell);
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
        });
    },

    _getHttpEndListForSelfData() {
        Global.dialog.open('Loading', this.node);

        const self = this;
        HttpRequestManager.httpRequest('recordList', {}, (event, result) => {
            if (result.code === 1) {
                const roomItem = result.getRoomItem();
                if (roomItem.length > 0) {
                    this.gameEndList.removeAllChildren();
                    this.gameEndList.addChild(cc.instantiate(this.noDataCell));
                }
                for (let i = 0; i < roomItem.length; i += 1) {
                    const cell = cc.instantiate(this.gameEndCell);
                    cell.getComponent('GameIngCellPrefab').setData(roomItem[i]);
                    self.gameEndList.addChild(cell);
                }
            }
            else if (self.gameEndList.childrenCount === 0) {
                self.gameEndList.addChild(cc.instantiate(self.noDataCell));
            }
            Global.dialog.close();
        });
    },
});
