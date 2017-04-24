var Dialog = cc.Class({
    extends: cc.Component,

    properties: {
        loadingPrefab: cc.Prefab,
        messagePrefab: cc.Prefab,
        popuNode: cc.Node,
    },

    openLoading: function() {
        this.popuNode = cc.instantiate(this.loadingPrefab);
        var node = cc.director.getScene().getChildByName('Canvas');
        node.addChild(this.popuNode);

        this.scheduleOnce(function() {
            this.close();
        }.bind(this), 20);
    },

    openMessageBox: function(message, callback) {
        this.popuNode = cc.instantiate(this.messagePrefab);
        this.popuNode.getComponent('MessageBox').addMessage(callback);
        var node = cc.director.getScene().getChildByName('Canvas');
        node.addChild(this.popuNode);
    },

    close: function close() {
        this.popuNode.destroy();
    }
});

module.exports = Dialog;