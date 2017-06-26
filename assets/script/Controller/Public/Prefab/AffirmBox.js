cc.Class({
    extends: cc.Component,

    properties: {
        message: cc.Label,
    },

    init (data, callback = function() {}) {
        this.callback = callback;
        this.message.string = data;
    },

    onConfirmClick: function() {
        window.Global.Animation.closeDialog(this.node, function() {
            this.callback();
        }.bind(this));
    },

    onCloseClick: function() {
        window.Global.Animation.closeDialog(this.node);
    }
});
