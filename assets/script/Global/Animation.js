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

window.Animation.shaiziAction = function() {
    var shaiziNode = new cc.Sprite(spriteFrameCache.getSpriteFrame("shaizi_3.png"));
    node.addChild(shaiziNode);
    var animation = ToolKit.getAnimation("shaizi_", 1, 24, 0.04, false );
    var action = cc.animate(animation);
    var stopIndex = (stopindex-1) * 4 + 1;
    var automove = automove;
    shaiziNode.setPosition(-80,80);
    shaiziNode.runAction(cc.sequence(
        // cc.moveTo(1.5,cc.p(0,0)).clone().easing(cc.easeBackOut()),
        cc.jumpTo(0.5, cc.p(0, 0), 80, 2),
        cc.repeat(action, time),
        cc.callFunc( function() {
            var file = "shaizi_" + stopIndex + ".png";
            shaiziNode.initWithSpriteFrame(spriteFrameCache.getSpriteFrame(file));
        }),
        cc.delayTime(1),
        cc.callFunc( function(node) {
            node.removeFromParent(true);
        })
    ));
};

/**
 * 打开场景执行的动画
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-14T15:13:50+0800
 *
 * @param    {node}                 node     [动画节点]
 * @param    {function}                 cellback [执行成功后的回调]
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
 * @param    {node}                 node     [动画节点]
 * @param    {function}                 cellback [执行成功后的回调]
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
 * 打开面板
 * 主要是把面板从viewport外移动到viewpore中
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-16T20:18:25+0800
 *
 * @param    {node}                 node     需要移动的节点
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
 * @param    {node}                 node     需要移动的节点
 * @param    {Function}               callback 移动完成后的回调
 */
window.Animation.closePanel = function(node, callback) {
    callback = callback || function() {};

    node.runAction(cc.sequence(
        cc.moveBy(0.15, cc.p(node.width, 0)),
        cc.callFunc(callback, this)
    ));
};