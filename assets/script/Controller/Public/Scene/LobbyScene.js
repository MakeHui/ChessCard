cc.Class({
    extends: cc.Component,

    properties: {
        avatar: cc.Sprite,
        nickname: cc.Label,
        money: cc.Label,
        notice: cc.Node,
        userInfoPrefab: cc.Prefab,
        gameRecordPrefab: cc.Prefab,
        settingPrefab: cc.Prefab,
        gameRulesPrefab: cc.Prefab,
        createRoomPrefab: cc.Prefab,
        inputRoomNumberPrefab: cc.Prefab,
        myRoomPrefab: cc.Prefab,

        addMoneyButton: cc.Node,
    },

    // use this for initialization
    onLoad() {
        this._userInfo = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);
        window.Global.Tools.setWebImage(this.avatar, this._userInfo.headimgurl);
        this.nickname.string = this._userInfo.nickname;
        this.money.string = this._userInfo.gold;
        this.notice.getComponent(cc.Label).string = this._userInfo.notice;
        window.Global.Animation.openScrollWordAction(this.notice, 50);

        // 如果是上线期间不显示充值按钮
        if (window.Global.Tools.getLocalData(window.Global.Config.LSK.appleReview)) {
            this.addMoneyButton.active = false;
        }
    },

    /**
     * 查看用户信息
     */
    openUserInfoPanelOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Config.tempCache = window.Global.Tools.getLocalData(window.Global.Config.LSK.userInfo);
        window.Global.Animation.openDialog(cc.instantiate(this.userInfoPrefab), this.node, () => {
            cc.log('load success');
        });
    },

    /**
     * 弹出信息
     */
    openPanelOnClick() {
        if (this.addMoneyButton.active) {
            window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
            window.Global.Dialog.openMessageBox('充值请加微信公众号:【' + window.Global.Config.wxPublic + '】');
        }
    },

    /**
     * 游戏记录
     */
    openGameRecordPanelOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        // var gameRecordPrefab = this.gameRecordPrefab.getComponent('GameRecordPrefab');
        // gameRecordPrefab.init();
        window.Global.Animation.openDialog(cc.instantiate(this.gameRecordPrefab), this.node, () => {
            cc.log('load success');
        });
    },

    /**
     * 声音选项
     */
    openSoundPanelOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Animation.openDialog(cc.instantiate(this.settingPrefab), this.node, () => {
            cc.log('load success');
        });
    },

    /**
     * 游戏规则
     */
    openGameRulesPanelOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Animation.openDialog(cc.instantiate(this.gameRulesPrefab), this.node, () => {
            cc.log('load success');
        });
    },

    /**
     * 创建游戏房间
     */
    openCreateRoomPanelOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Animation.openDialog(cc.instantiate(this.createRoomPrefab), this.node, () => {
            cc.log('load success');
        });
    },

    /**
     * 加入游戏房间
     */
    openAddGamePanelOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        const node = cc.instantiate(this.inputRoomNumberPrefab);
        node.getComponent('RoomNumberInputBox').init('Lobby');
        window.Global.Animation.openDialog(node, this.node, () => {
            cc.log('load success');
        });
    },

    /**
     * 我的游戏房间
     */
    openMyRoomPanelOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        // cc.director.loadScene('MyRoom');
        window.Global.Animation.openDialog(cc.instantiate(this.myRoomPrefab), this.node, () => {
            cc.log('load success');
        });
    },

});
