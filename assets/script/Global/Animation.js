var Animation = cc.Class({
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

    /**
     **********************************************************************************************************************
     *                                      全局, 动画方法
     **********************************************************************************************************************
     **/

    /**
     * 打开场景执行的动画
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-14T15:13:50+0800
     *
     * @param    {cc.Node}                 node     [动画节点]
     * @param    {Function}                callback [执行成功后的回调]
     */
    openSceneTransitionAction: function (node, callback) {
        callback = callback || function () {};

        node.scale = 0;
        node.runAction(cc.sequence(cc.scaleTo(0.2, 1.2, 1.2), cc.scaleTo(0.1, 1, 1), cc.callFunc(callback, undefined)));
    },

    /**
     * 关闭场景执行的动画
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-14T15:13:50+0800
     *
     * @param    {cc.Node}                 node     [动画节点]
     * @param    {function}                 callback [执行成功后的回调]
     */
    closeSceneTransitionAction: function (node, callback) {
        callback = callback || function () {};

        node.runAction(cc.sequence(cc.scaleTo(0.1, 1.2, 1.2), cc.scaleTo(0.2, 0, 0), cc.callFunc(callback, undefined)));
    },

    /**
     * 打开场景执行的动画
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-14T15:13:50+0800
     *
     * @param    {cc.Node}                 node     [动画节点]
     * @param    {number}                 duration 执行时长
     */
    openScrollWordAction: function (node, duration) {
        if (duration === 0) {
            return;
        }

        var nodeX = node.x;
        node.runAction(cc.repeat(cc.sequence(cc.moveBy(duration, cc.p(-node.width - 800, 0)), cc.callFunc(function () {
            node.x = nodeX;
        }, undefined)), 999999999));
    },

    /**
     * 打开面板
     * 主要是把面板从viewport外移动到viewpore中
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-16T20:18:25+0800
     *
     * @param    {cc.Node}                 node     需要移动的节点
     * @param    {Function}               callback 移动完成后的回调
     */
    openPanel: function (node, callback) {
        callback = callback || function () {};

        node.runAction(cc.sequence(cc.moveBy(0.15, cc.p(-node.width, 0)), cc.callFunc(callback, undefined)));
    },

    /**
     * 打开面板
     * 主要是把面板从viewport外移动到viewpore中
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-16T20:18:25+0800
     *
     * @param    {cc.Node}                 node     需要移动的节点
     * @param    {Function}               callback 移动完成后的回调
     */
    closePanel: function (node, callback) {
        callback = callback || function () {};

        node.runAction(cc.sequence(cc.moveBy(0.15, cc.p(node.width, 0)), cc.callFunc(callback, undefined)));
    },

    /**
     * 弹出层
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-14T18:46:33+0800
     *
     * @param node          cc.Node     需要弹出的节点对象
     * @param parentNode    cc.Node     父节点对象
     // * @param callback      Function    回调方法
     */
    openDialog: function (node, parentNode) {
        var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Function;

        parentNode.addChild(node);

        callback();

        // this.openSceneTransitionAction(node.getChildByName('Dialog'), callback);
    },

    /**
     * 关闭弹出层
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-14T18:47:30+0800
     *
     * @param    {cc.Node}                 node     需要关闭的节点对象
     * @param    {Function}               callback 自行完毕后的回调方法
     */
    closeDialog: function (node, callback) {
        callback = callback || function () {};

        this.closeSceneTransitionAction(node.getChildByName('Dialog'), function () {
            node.destroy();
            callback();
        });
    },
});

module.exports = Animation;
