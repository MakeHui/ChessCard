cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        countDownLabel: cc.Label,
    },

    // use this for initialization
    onLoad: function () {

    },

    closeSceneOnClick: function() {
        this.node.parent.destroy();
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
