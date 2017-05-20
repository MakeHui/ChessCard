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
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Animation.closeDialog(this.node);
    },

    // TODO: 微信分享
    shareOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);

        var hasWechat = window.Global.NativeExtensionManager.execute('wechatIsWxAppInstalled');
        if (!hasWechat) {
            cc.log('MyRoomPrefab.shareOnClick: 没有安装微信');
            return;
        }

        var node = cc.director.getScene().getChildByName('Canvas');
        window.Global.Tools.captureScreen(node, function(fileName) {
            window.Global.NativeExtensionManager.execute('wechatImageShare', [fileName], function(result) {
                cc.log(result);
            });
        });
        cc.log('shareOnClick');
    },

    init: function(roomId) {
        window.Global.Dialog.openLoading();
        var self = this;
        window.Global.NetworkManager.httpRequest(window.PX258.NetworkConfig.HttpRequest.roomReplay, {roomId: roomId}, (event, result) => {
            window.Global.Dialog.close();
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
