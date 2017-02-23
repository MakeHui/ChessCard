cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {

    },

    selectedOnClick: function(toggle, data) {
        cc.log(toggle.isChecked);
        cc.log(data);
    },

    createRoomOnClick: function() {

    },

    closeOnClick: function() {
        PX258.closeDialog(this.node);
    }
    
});
