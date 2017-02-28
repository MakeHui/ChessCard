/**
 * 全局动画类
 *
 * @author   Make.<makehuir@gmail.com>
 * @link     http://huyaohui.com
 * @link     https://github.com/MakeHui
 *
 * @datetime 2017-02-14 18:50:48
 */

window.Animation = {};

/**
 * 打开场景执行的动画
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-14T15:13:50+0800
 *
 * @param    {cc.Node}                 node     [动画节点]
 * @param    {Function}                callback [执行成功后的回调]
 */
window.Animation.openSeneTransitionAction = function(node, callback) {
    callback = callback || function() {};

    node.scale = 0;
    node.runAction(cc.sequence(
        cc.scaleTo(0.2, 1.2, 1.2),
        cc.scaleTo(0.1, 1, 1),
        cc.callFunc(callback, this)
    ));
};

/**
 * 关闭场景执行的动画
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-14T15:13:50+0800
 *
 * @param    {cc.Node}                 node     [动画节点]
 * @param    {function}                 callback [执行成功后的回调]
 */
window.Animation.closeSeneTransitionAction = function(node, callback) {
    callback = callback || function() {};

    node.runAction(cc.sequence(
        cc.scaleTo(0.1, 1.2, 1.2),
        cc.scaleTo(0.2, 0, 0),
        cc.callFunc(callback, this)
    ));
};

/**
 * 打开场景执行的动画
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-14T15:13:50+0800
 *
 * @param    {cc.Node}                 node     [动画节点]
 * @param    {int}                 duration 执行时长
 */
window.Animation.openScrollWordAction = function(node, duration) {
    let nodeX = node.x;
    node.runAction(cc.repeat(cc.sequence(
        cc.moveBy(duration, cc.p(-node.width - 800, 0)),
        cc.callFunc(function () {
            node.x = nodeX;
        }, this)
    ), 999999999));
};

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
window.Animation.openPanel = function(node, callback) {
    callback = callback || function() {};

    node.runAction(cc.sequence(
        cc.moveBy(0.15, cc.p(-node.width, 0)),
        cc.callFunc(callback, this)
    ));
};

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
window.Animation.closePanel = function(node, callback) {
    callback = callback || function() {};

    node.runAction(cc.sequence(
        cc.moveBy(0.15, cc.p(node.width, 0)),
        cc.callFunc(callback, this)
    ));
};