cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {

    },

    createRoomOnClick: function() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);

    },

    closeOnClick: function() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    }
    
});
