cc.Class({
    extends: cc.Component,

    properties: {
        diceList: [cc.Node],
        diceAssets: cc.SpriteAtlas,
    },

    init: function(data) {
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.shaizi);
        this.scheduleOnce(function () {
            for (var i = 0; i < 2; i += 1) {
                this.diceList[i].getComponent(cc.Animation).stop();
                var nodeSprite = this.diceList[i].getComponent(cc.Sprite);
                nodeSprite.spriteFrame = this.diceAssets.getSpriteFrame('shaizi_' + (4 * (data['dice' + (i + 1)] - 1) + 1));
            }
            this.scheduleOnce(function() {
                this.node.destroy();
            }, 1);
        }, 1.2);
    }

});
