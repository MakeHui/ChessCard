cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {
        // this.loading.getComponent("Loading").loadingStart();
        // this.loading.getComponent("Loading").loadingEnd();
    },

    /**
     * 关闭用户协议
     */
    closeOnClick: function(event, data) {
        Global.closeDialog(this.node);
    }
});
