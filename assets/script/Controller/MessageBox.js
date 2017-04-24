cc.Class({
    extends: cc.Component,
    properties: {
        label: cc.Label,
    },

    addMessage: function(message, callback) {
        this.label.string = message;
        this.callback = callback;
    },

    closeOnClick() {
        if (this.callback) {
            this.callback();
        }
        this.node.destroy();
    },
});