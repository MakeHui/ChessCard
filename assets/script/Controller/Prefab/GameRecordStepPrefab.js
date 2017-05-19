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
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.buttonClick);
        Animation.closeDialog(this.node);
    },

    // TODO: 微信分享
    shareOnClick() {
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.buttonClick);

        var hasWechat = window.NativeExtensionManager.execute('wechatIsWxAppInstalled');
        if (!hasWechat) {
            cc.log('MyRoomPrefab.shareOnClick: 没有安装微信');
            return;
        }

        var node = cc.director.getScene().getChildByName('Canvas');
        window.Tools.captureScreen(node, function(fileName) {
            window.NativeExtensionManager.execute('wechatImageShare', [fileName], function(result) {
                cc.log(result);
            });
        });
        cc.log('shareOnClick');
    },

    init: function(roomId) {
        window.Dialog.openLoading();
        var self = this;
        HttpRequestManager.httpRequest('roomReplay', {roomId: roomId}, (event, result) => {
            window.Dialog.close();
            self.datetime.string = result.datetime;
            var recordInfoDataList = result.recordInfoDataList;
            if (recordInfoDataList.length !== 0) {
                this.gameStepList.removeAllChildren();

                for (let i = 0; i < recordInfoDataList[0].playerInfoList.length; i += 1) {
                    var nickname = recordInfoDataList[0].playerInfoList[i].nickname;
                    self.username[i].string = nickname;
                }

                for (let i = 0; i < recordInfoDataList.length; i += 1) {
                    recordInfoDataList[i].roomUuid = result.roomUuid;
                    var cell = cc.instantiate(this.gameStepCell);
                    cell.getComponent('GameRecordStepCellPrefab').init(recordInfoDataList[i]);
                    this.gameStepList.addChild(cell);
                }
            }
        });
    }
});
