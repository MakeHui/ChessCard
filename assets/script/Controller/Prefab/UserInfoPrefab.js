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
        const userInfo = GlobalConfig.tempCache;
        if (userInfo) {
            Tools.setWebImage(this.avatar, userInfo.headimgurl);
            this.ip.string = `IP地址: ${userInfo.ip}`;
            this.nickname.string = `昵称: ${userInfo.nickname}`;
            this.location.string = `地理位置: ${userInfo.location}`;
        }
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.buttonClick);
        Animation.closeDialog(this.node);
    },
});
