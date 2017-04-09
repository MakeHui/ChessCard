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
        cc.log('closeAnimationCallback');
    },

    hideAnimationCallback() {
        this.node.active = false;
        cc.log('hideAnimationCallback');
    },

    closeTrojanScanCallback() {
        this.node.destroy();
        cc.log('closeTrojanScanCallback');
    },

    countDownCallback(data) {
        this.countDownLabel.string = data;
    },
});
