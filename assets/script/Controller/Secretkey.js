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
        window.SoundEffect.playEffect(GlobalConfig.audioUrl.effect.buttonClick);
        if (this.input.string.length !== 6) {
            window.Dialog.openMessageBox('秘钥长度必须为6');
            return;
        }

        cc.director.getScene().getChildByName('Canvas').getComponent('LoginScene').httpLogin(this.input.string, 'authCodeLogin');
    },

    closeOnClick() {
        window.SoundEffect.playEffect(GlobalConfig.audioUrl.effect.buttonClick);
        Animation.closeDialog(this.node);
    },
});
