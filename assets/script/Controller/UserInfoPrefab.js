cc.Class({
    extends: cc.Component,

    properties: {
        avatar: cc.Sprite,
        id: cc.Label,
        ip: cc.Label,
        location: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        var userInfo = Tools.getLocalData(PX258.localStorageKey.userInfo);
        cc.log(userInfo);

        Tools.setWebImage(this.avatar, userInfo.headimgurl);
        this.id.string = "ID: " + userInfo.nickname;
        this.ip.string = "IP: " + userInfo.ip;
        this.location.string = userInfo.location;
    },

    /**
     * 关闭本窗口
     */
    closeOnClick: function(event, data) {
        PX258.closeDialog(this.node);
    }
});
