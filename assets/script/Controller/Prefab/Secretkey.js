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
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        if (this.input.string.length !== 6) {
            window.Global.Dialog.openMessageBox('秘钥长度必须为6');
            return;
        }

        cc.director.getScene().getChildByName('Canvas').getComponent('LoginScene').httpLogin(this.input.string, 'authCodeLogin');
    },

    closeOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        Animation.closeDialog(this.node);
    },
});
