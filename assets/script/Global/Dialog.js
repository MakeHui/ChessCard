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

        cc.director.getScheduler().schedule(this.close.bind(this), this, 20, false);
    },

    openMessageBox: function(message, callback) {
        callback = callback || function () {};

        this.popuNode = cc.instantiate(this.messagePrefab);
        this.popuNode.getComponent('MessageBox').addMessage(message, callback);
        var node = cc.director.getScene().getChildByName('Canvas');
        node.addChild(this.popuNode);
    },

    close: function() {
        // TODO: HBT后会莫名调用这个方法, 原因迷, 暂时简单判断下
        if (this.popuNode._name) {
            this.popuNode.destroy();
            cc.director.getScheduler().unschedule(this.close.bind(this), this);
        }
    }
});

module.exports = Dialog;