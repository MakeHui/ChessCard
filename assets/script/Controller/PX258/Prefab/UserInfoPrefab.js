cc.Class({
    extends: cc.Component,

    properties: {
        avatar: cc.Sprite,
        ip: cc.Label,
        nickname: cc.Label,
        location: cc.Label,
    },

    // use this for initialization
    onLoad() {
        const userInfo = window.Global.Config.tempCache;
        if (userInfo) {
           window.Global.Tools.setWebImage(this.avatar, userInfo.headimgurl);
            this.ip.string = `IP地址: ${userInfo.ip}`;
            this.nickname.string = `昵称: ${userInfo.nickname}`;
            this.location.string = `地理位置: ${userInfo.location}`;
        }
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Animation.closeDialog(this.node);
    },
});
