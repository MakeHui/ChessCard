cc.Class({
    extends: cc.Component,

    properties: {
        gameIngCell: cc.Prefab,
        gameIngPanel: cc.Node,
        gameIngList: cc.Node,
        gameIngData: [],

        gameEndCell: cc.Prefab,
        gameEndPanel: cc.Node,
        gameEndList: cc.Node,
        gameEndData: [],

        radioButton: {
            default: [],
            type: cc.Toggle
        },
    },

    // use this for initialization
    onLoad: function () {
        this.gameIngData = [1,2,3,4];
        this.gameEndData = [1,2,3,4];
    },

    shareOnClick: function() {
        cc.log("shareOnClick");
    },

    /**
     * 关闭本窗口
     */
    closeOnClick: function(event, data) {
        PX258.closeDialog(this.node);
    },

    radioButtonClicked: function(toggle) {
        let index = this.radioButton.indexOf(toggle);
        if (index === 0 && this.gameIngData.length !== 0) {
            this.gameEndPanel.active = false;
            this.gameIngPanel.active = true;
            this.gameIngList.removeAllChildren();
            for (let i = 0; i < this.gameIngData.length; ++i) {
                PX258.tempCache = this.gameIngData[i];
                cc.instantiate(this.gameIngCell).parent = this.gameIngList;
            }
        }
        else if (index === 1 && this.gameEndData.length !== 0) {
            cc.log("xxx");
            this.gameIngPanel.active = false;
            this.gameEndPanel.active = true;
            this.gameEndList.removeAllChildren();
            for (let i = 0; i < this.gameEndData.length; ++i) {
                PX258.tempCache = this.gameEndData[i];
                cc.instantiate(this.gameEndCell).parent = this.gameEndList;
            }
        }
    }
});
