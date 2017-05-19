cc.Class({
    extends: cc.Component,

    properties: {
        shopStore: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {

    },

    /**
     * 关闭本窗口
     */
    closeOnClick: function(event, data) {
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.buttonClick);
        Animation.closeDialog(this.node);
    },

    payOnClick: function(evt, data) {
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.buttonClick);
        Animation.openDialog(cc.instantiate(this.shopStore), this.node, function () {
            cc.log("load success");
        });
    }
});
