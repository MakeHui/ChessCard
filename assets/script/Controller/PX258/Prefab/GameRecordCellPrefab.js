cc.Class({
    extends: cc.Component,

    properties: {
        roomIdLabel: cc.Label,
        datetime: cc.Label,
        playerList: [cc.Node],
        gameRecordStep: cc.Prefab,
        layout: cc.Layout,
    },

    openDetailsOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        var parentNode = cc.director.getScene().getChildByName('Canvas');
        var node = cc.instantiate(this.gameRecordStep);
        node.getComponent('GameRecordStepPrefab').init(this.roomId);
        window.Global.Animation.openDialog(node, parentNode, () => {
            cc.log('downloader success');
        });
    },

    init: function(data) {
        this.roomId = data.roomId;
        this.roomIdLabel.string = `房间号: ${data.roomId}`;
        this.datetime.string = `${window.PX258.Config.playTypes[data.gameUuid].name} (${data.dateTime})`;

        if (data.playerList.length === 4) {
            this.layout.spacingX = 118;
        }
        else {
            this.layout.spacingX = 430;
        }

        for (let i = 0; i < data.playerList.length; i += 1) {
            var obj = data.playerList[i];
            window.Global.Tools.setWebImage(this.playerList[i].getChildByName('itemFace').getComponent(cc.Sprite), obj.headimgurl);
            this.playerList[i].getChildByName('itemName').getComponent(cc.Label).string = obj.playerName;
            this.playerList[i].getChildByName('itemScore').getComponent(cc.Label).string = `积分: ${obj.score}`;
            this.playerList[i].active = true;
        }
    }
});
