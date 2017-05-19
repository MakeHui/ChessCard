cc.Class({
    extends: cc.Component,

    properties: {
        message: cc.Label,
        closeButton: cc.Node,
    },

    init: function(data, callback) {
        this._Cache = data;
        this.callback = callback || function() {};
        this.message.string = data.msg;
        if (!data.mandatoryUpdate) {
            this.closeButton.active = false;
        }
    },

    onConfirmClick: function() {
        cc.sys.openURL(this._Cache.downloadLink);
    },

    onCloseClick: function() {
        window.Global.Animation.closeDialog(this.node, function() {
            this.callback();
        }.bind(this));
    }
});
