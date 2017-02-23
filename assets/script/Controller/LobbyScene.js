cc.Class({
    extends: cc.Component,

    properties: {
        userInfoPrefab: cc.Prefab,
        payOptionsPrefab: cc.Prefab,
        gameRecordPrefab: cc.Prefab,
        soundPrefab: cc.Prefab,
        gameRulesPrefab: cc.Prefab,
        createRoomPrefab: cc.Prefab,
        addGamePrefab: cc.Prefab,
        myRoomPrefab: cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        cc.loader.load("http://ww3.sinaimg.cn/mw690/ab41dfeegw1emxsjnhwcnj205k05kt8w.jpg", {isCrossOrigin: true}, function (err, data) {
            if(err){
                cc.log(err);
            }
        })
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    /**
     * 查看用户信息
     */
    openUserInfoPanelOnClick: function(evt, data) {
        PX258.openDialog(this.userInfoPrefab, this.node, function () {
            cc.log("load success");
        });
    },

    /**
     * 绑定上级代理
     * 如果绑定上级代理, 则为充值
     */
    openPayPanelOnClick: function(evt, data) {
        PX258.openDialog(this.payOptionsPrefab, this.node, function () {
            cc.log("load success");
        });
    },

    /**
     * 游戏记录
     */
    openGameRecordPanelOnClick: function(evt, data) {
        // var gameRecordPrefab = this.gameRecordPrefab.getComponent("GameRecordPrefab");
        // gameRecordPrefab.init();
        PX258.openDialog(this.gameRecordPrefab, this.node, function () {
            cc.log("load success");
        });
    },

    /**
     * 声音选项
     */
    openSoundPanelOnClick: function(evt, data) {
        PX258.openDialog(this.soundPrefab, this.node, function () {
            cc.log("load success");
        });
    },

    /**
     * 登出
     */
    logoutOnClick: function(evt, data) {

    },

    /**
     * 游戏规则
     */
    openGameRulesPanelOnClick: function(evt, data) {
        PX258.openDialog(this.gameRulesPrefab, this.node, function () {
            cc.log("load success");
        });
    },

    /**
     * 创建游戏房间
     */
    openCreateRoomPanelOnClick: function(evt, data) {

    },

    /**
     * 加入游戏房间
     */
    openAddGamePanelOnClick: function(evt, data) {

    },

    /**
     * 我的游戏房间
     */
    openMyRoomPanelOnClick: function(evt, data) {

    },

});
