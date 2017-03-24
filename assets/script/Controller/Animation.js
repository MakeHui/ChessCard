cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad() {

    },

    closeAnimationCallback() {
        this.node.active = true;
        Global.log('closeAnimationCallback');
    },

    hideAnimationCallback() {
        this.node.active = false;
        Global.log('hideAnimationCallback');
    },

    closeTrojanScanCallback() {
        this.node.destroy();
        Global.log('closeTrojanScanCallback');
    },
});
