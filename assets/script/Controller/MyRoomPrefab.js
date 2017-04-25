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
        window.SoundEffect.playEffect(Global.audioUrl.effect.buttonClick);

        const hasWechat = NativeExtensionManager.execute('wechatIsWxAppInstalled');
        if (!hasWechat) {
            cc.log('MyRoomPrefab.shareOnClick: 没有安装微信');
            // return;
        }

        var node = cc.director.getScene().getChildByName('Canvas');
        Tools.captureScreen(node, function(fileName) {
            NativeExtensionManager.execute('wechatImageShare', [fileName], function(result) {

            });
        });
        cc.log('shareOnClick');
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        window.SoundEffect.playEffect(Global.audioUrl.effect.buttonClick);

        Global.closeDialog(this.node);
    },

    radioButtonClicked(toggle) {
        const index = this.radioButton.indexOf(toggle);
        if (index === 0) {
            this.gameEndPanel.active = false;
            this.gameIngPanel.active = true;
            if (this.gameIngList.childrenCount === 0) {
                this._getHttpIngListForSelfData();
            }
        }
        else if (index === 1) {
            this.gameIngPanel.active = false;
            this.gameEndPanel.active = true;
            if (this.gameEndList.childrenCount === 0) {
                this._getHttpEndListForSelfData();
            }
        }
    },

    _getHttpIngListForSelfData() {
        window.Dialog.openLoading();

        const self = this;
        HttpRequestManager.httpRequest('roomList', {}, (event, result) => {
            window.Dialog.close();
            if (result.code === 1 && result.roomItemList.length !== 0) {
                self.gameIngList.removeAllChildren();
                const roomItem = result.roomItemList;
                for (let i = 0; i < roomItem.length; i += 1) {
                    const cell = cc.instantiate(self.gameIngCell);
                    cell.getComponent('GameIngCellPrefab').setData(roomItem[i]);
                    self.gameIngList.addChild(cell);
                }
            }
            else {
                self.gameIngList.addChild(cc.instantiate(self.noDataCell));
            }
        });
    },

    _getHttpEndListForSelfData() {
        window.Dialog.openLoading();

        const self = this;
        HttpRequestManager.httpRequest('recordList', {}, (event, result) => {
            if (result.code === 0 && result.recordItemList.length !== 0) {
                this.gameEndList.removeAllChildren();
                const roomItem = result.recordItemList;
                for (let i = 0; i < roomItem.length; i += 1) {
                    const cell = cc.instantiate(this.gameEndCell);
                    cell.getComponent('GameRecordCellPrefab').init(roomItem[i]);
                    self.gameEndList.addChild(cell);
                }
            }
            else {
                self.gameEndList.addChild(cc.instantiate(self.noDataCell));
            }
            window.Dialog.close();
        });
    },
});
