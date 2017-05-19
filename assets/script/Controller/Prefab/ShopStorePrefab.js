cc.Class({
    extends: cc.Component,

    properties: {
        radioButton: {
            default: [],
            type: cc.Toggle
        },
        money: cc.Label,
        gold: cc.Label,

        goldNumberData: [],
    },

    // use this for initialization
    onLoad: function () {
        this.goldNumberData = [6, 12, 30, 50, 128];
    },

    radioButtonClicked: function(toggle) {
        let index = this.radioButton.indexOf(toggle);
        this.money.string = this.goldNumberData[index];
        this.gold.string = "金币:" + (this.goldNumberData[index] * 10) + " 赠送:" + this.goldNumberData[index];
    },

    payOnClick: function() {
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.buttonClick);

    },

    closeOnClick: function() {
        window.SoundEffect.playEffect(window.GlobalConfig.audioUrl.effect.buttonClick);
        Animation.closeDialog(this.node);
    }
});
