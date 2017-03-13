cc.Class({
    extends: cc.Component,

    properties: {
        input: cc.EditBox,
        info: cc.Label,
    },

    // use this for initialization
    onLoad() {

    },

    loginOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        if (this.input.string.length !== 36) {
            this.info.string = '* 秘钥长度为: 36';
            return;
        }

        const self = this;
        const parameters = { wxCode: this.input.string, location: window.userLocation };
        HttpRequestManager.httpRequest('login', parameters, (event, result) => {
            if (result.code === 1) {
                result.location = Tools.getLocalData(Global.LSK.userInfo_location);
                Tools.setLocalData(Global.LSK.userInfo, result);
                Tools.setLocalData(Global.LSK.secretKey, self.input.string);
                cc.director.loadScene('Lobby');
            }
            else {
                self.info.string = '* 登录失败, 秘钥错误';
            }
            Global.loading.close();
        });
    },

    closeOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    },
});
