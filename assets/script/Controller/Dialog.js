cc.Class({
    extends: cc.Component,

    properties: {
        label: cc.Label,
    },

    // use this for initialization
    onLoad() {
        this.label.string = Global.tempCache;
    },

    closeOnClick() {
        if (this.callback) {
            this.callback();
        }
        this.node.destroy();
    },
});
