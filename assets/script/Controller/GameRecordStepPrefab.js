cc.Class({
    extends: cc.Component,

    properties: {
        gameStepCell: cc.Prefab,
        gameStepList: cc.Node,
        datetime: cc.Label,
        username: [cc.Label],
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        window.SoundEffect.playEffect(GlobalConfig.audioUrl.effect.buttonClick);
        Animation.closeDialog(this.node);
    },

    // TODO: 微信分享
    shareOnClick() {
        window.SoundEffect.playEffect(GlobalConfig.audioUrl.effect.buttonClick);

        const hasWechat = NativeExtensionManager.execute('wechatIsWxAppInstalled');
        if (!hasWechat) {
            cc.log('MyRoomPrefab.shareOnClick: 没有安装微信');
            return;
        }

        var node = cc.director.getScene().getChildByName('Canvas');
        window.Tools.captureScreen(node, function(fileName) {
            NativeExtensionManager.execute('wechatImageShare', [fileName], function(result) {
                cc.log(result);
            });
        });
        cc.log('shareOnClick');
    },

    // TODO:Bug
    init: function(roomId) {
        window.Dialog.openLoading();
        const self = this;
        HttpRequestManager.httpRequest('roomReplay', {roomId: roomId}, (event, result) => {
            self.datetime.string = result.datetime;
            const recordInfoDataList = result.recordInfoDataList;
            if (recordInfoDataList.length !== 0) {
                this.gameStepList.removeAllChildren();

                for (let i = 0; i < recordInfoDataList[0].playerInfoList.length; i += 1) {
                    var nickname = recordInfoDataList[0].playerInfoList[i].nickname;
                    self.username[i].string = nickname;
                }

                for (let i = 0; i < recordInfoDataList.length; i += 1) {
                    const cell = cc.instantiate(this.gameStepCell);
                    cell.getComponent('GameRecordStepCellPrefab').init(recordInfoDataList[i], this.roomId);
                    this.gameStepList.addChild(cell);
                }
            }
            window.Dialog.close();
        });
    }
});
