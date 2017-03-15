cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad() {

    },

    closeCallback() {
        this.node.parent.destroy();
        cc.warn('closeCallback');
    },
});
