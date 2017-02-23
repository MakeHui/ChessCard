cc.Class({
    extends: cc.Component,

    properties: {
        gameStepData: [],

        gameStepCell: cc.Prefab,
        gameStepList: cc.Node,

        datetime: cc.Label,

        username1: cc.Label,
        username2: cc.Label,
        username3: cc.Label,
        username4: cc.Label,
    },
    

    // use this for initialization
    onLoad: function () {
        this.gameStepData = [1,2,3,4,5];
        if (this.gameStepData.length !== 0) {
            this.gameStepList.removeAllChildren();
            for (let i = 0; i < this.gameStepData.length; ++i) {
                // PX258.tempCache = this.gameStepData[i];
                cc.instantiate(this.gameStepCell).parent = this.gameStepList;
            }
        }
    },

    seeOtherRoomOnClick: function() {

    },

    /**
     * 关闭本窗口
     */
    closeOnClick: function(event, data) {
        PX258.closeDialog(this.node);
    },

    shareOnClick: function(evt, data) {

    }
});
