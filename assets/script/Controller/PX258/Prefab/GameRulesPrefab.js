cc.Class({
    extends: cc.Component,

    properties: {
        rules: [cc.Node]
    },

    radioButtonClicked(toggle, data) {
        this.rules[0].active = false;
        this.rules[1].active = false;
        this.rules[data].active = true;
    },

    /**
     * 关闭本窗口
     */
    closeOnClick: function() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Animation.closeDialog(this.node);
    }
});
