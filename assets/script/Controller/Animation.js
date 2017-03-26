cc.Class({
    extends: cc.Component,

    properties: {
        countDownLabel: cc.Label,
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

    countDownCallback(data) {
        this.countDownLabel.string = data;
    },
});
