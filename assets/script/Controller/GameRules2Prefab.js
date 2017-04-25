cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {

    },

    /**
     * 关闭本窗口
     */
    closeOnClick: function(event, data) {
        window.SoundEffect.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    }
});
