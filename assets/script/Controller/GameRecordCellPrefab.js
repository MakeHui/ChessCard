cc.Class({
    extends: cc.Component,

    properties: {
        roomIdLabel: cc.Label,
        datetime: cc.Label,
        playerList: [cc.Node],
    },

    openDetailsOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.openDialog(cc.instantiate(this.gameStep), this.node, () => {
            cc.log('downloader success');
        });
    },

    init: function(data) {
        this.roomId = data.roomId;
        this.roomIdLabel.string = `房间号: ${data.roomId}`;
        this.datetime.string = data.dateTime;

        for (let i = 0; i < data.playerList.length; i += 1) {
            var obj = data.playerList[i];
            Tools.setWebImage(this.playerList[i].getChildByName('itemFace').getComponent(cc.Sprite), obj.headimgurl);
            this.playerList[i].getChildByName('itemName').getComponent(cc.Label).string = obj.playerName;
            this.playerList[i].getChildByName('itemScore').getComponent(cc.Label).string = `积分: ${obj.score}`;
        }
    }
});
