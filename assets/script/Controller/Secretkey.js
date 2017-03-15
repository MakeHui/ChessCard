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
            Global.tempCache = '秘钥长度必须为36';
            Global.dialog.open('Dialog', this.node);
            return;
        }

        cc.director.getScene().getChildByName('Canvas').getComponent('LoginScene')._httpLogin(this.input.string);

        // const self = this;
        // const parameters = { wxCode: , location: window.userLocation };
        // HttpRequestManager.httpRequest('login', parameters, (event, result) => {
        //     if (result.code === 1) {
        //         result.location = Tools.getLocalData(Global.LSK.userInfo_location);
        //         Tools.setLocalData(Global.LSK.userInfo, result);
        //         Tools.setLocalData(Global.LSK.secretKey, self.input.string);
        //         cc.director.loadScene('Lobby');
        //     }
        //     else {
        //         Global.tempCache = '登录失败, 秘钥错误';
        //         Global.dialog.open('Dialog', this.node);
        //     }
        //
        //     Global.dialog.close();
        // });
    },

    closeOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    },
});
