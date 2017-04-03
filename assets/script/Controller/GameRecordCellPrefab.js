cc.Class({
    extends: cc.Component,

    properties: {
        roomIdLabel: cc.Label,
        datetime: cc.Label,
        playerList: [cc.Node],
    },

    onLoad() {
        this.roomIdLabel.string = `房间号: ${Global.tempCache.roomNumber}`;
        this.datetime.string = Global.tempCache.datetime;

        for (let i = 0; i < Global.tempCache.userList.length; i += 1) {
            const obj = Global.tempCache.userList[i];
            Tools.setWebImage(this.playerList[i].getChildByName('itemFace').getComponent(cc.Sprite), obj.avatar);
            this.playerList[i].getChildByName('itemName').getComponent(cc.Label).string = obj.username;
            this.playerList[i].getChildByName('itemScore').getComponent(cc.Label).string = `积分: ${obj.username}`;
        }
    },

    openDetailsOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.openDialog(cc.instantiate(this.gameStep), this.node, () => {
            Global.log('downloader success');
        });
    }
});
