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
        if (this.input.string.length !== 6) {
            Dialog.openMessageBox('秘钥长度必须为6');
            return;
        }

        cc.director.getScene().getChildByName('Canvas').getComponent('LoginScene').httpLogin(this.input.string, 'authCodeLogin');
    },

    closeOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    },
});
