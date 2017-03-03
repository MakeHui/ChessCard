cc.Class({
    extends: cc.Component,

    properties: {
        avatar: cc.Sprite,
        nickname: cc.Label,
        money: cc.Label,
        notice: cc.Node,
        userInfoPrefab: cc.Prefab,
        payOptionsPrefab: cc.Prefab,
        gameRecordPrefab: cc.Prefab,
        soundPrefab: cc.Prefab,
        gameRulesPrefab: cc.Prefab,
        createRoomPrefab: cc.Prefab,
        inputRoomNumberPrefab: cc.Prefab,
        myRoomPrefab: cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        // this.node.setLocalZOrder(-1);
        // cc.game.addPersistRootNode(this.node);

        let userInfo = Tools.getLocalData(PX258.localStorageKey.userInfo);
        if (userInfo) {
            Tools.setWebImage(this.avatar, userInfo.headimgurl);
            this.nickname.string = userInfo.nickname;
            this.money.string = userInfo.gold;
            this.notice.getComponent(cc.Label).string = userInfo.notice;
            // Animation.openScrollWordAction(this.notice, userInfo.notice.length * 0.5);
            Animation.openScrollWordAction(this.notice, 50);
        }
    },

    /**
     * 查看用户信息
     */
    openUserInfoPanelOnClick: function() {
        PX258.openDialog(cc.instantiate(this.userInfoPrefab), this.node, function () {
            cc.log("load success");
        });
    },

    /**
     * 绑定上级代理
     * 如果绑定上级代理, 则为充值
     */
    openPayPanelOnClick: function(evt, data) {
        PX258.openDialog(cc.instantiate(this.payOptionsPrefab), this.node, function () {
            cc.log("load success");
        });
    },

    /**
     * 游戏记录
     */
    openGameRecordPanelOnClick: function(evt, data) {
        // var gameRecordPrefab = this.gameRecordPrefab.getComponent("GameRecordPrefab");
        // gameRecordPrefab.init();
        PX258.openDialog(cc.instantiate(this.gameRecordPrefab), this.node, function () {
            cc.log("load success");
        });
    },

    /**
     * 声音选项
     */
    openSoundPanelOnClick: function(evt, data) {
        PX258.openDialog(cc.instantiate(this.soundPrefab), this.node, function () {
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
        PX258.openDialog(cc.instantiate(this.gameRulesPrefab), this.node, function () {
            cc.log("load success");
        });
    },

    /**
     * 创建游戏房间
     */
    openCreateRoomPanelOnClick: function(evt, data) {
        PX258.openDialog(cc.instantiate(this.createRoomPrefab), this.node, function () {
            cc.log("load success");
        });
    },

    /**
     * 加入游戏房间
     */
    openAddGamePanelOnClick: function(evt, data) {
        let node = cc.instantiate(this.inputRoomNumberPrefab);
        node.getComponent('InputRoomNumberPrefab').setData('GameRoom');
        PX258.openDialog(node, this.node, function () {
            cc.log("load success");
        });
    },

    /**
     * 我的游戏房间
     */
    openMyRoomPanelOnClick: function(evt, data) {
        // cc.director.loadScene('MyRoom');
        PX258.openDialog(cc.instantiate(this.myRoomPrefab), this.node, function () {
            cc.log("load success");
        });
    }

});
