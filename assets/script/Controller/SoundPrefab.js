cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad () {

    },

    /**
     * 关闭本窗口
     */
    closeOnClick(event, data) {
        Global.closeDialog(this.node);
        cc.warn("removeSelf");
    }
});
