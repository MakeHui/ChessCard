var Dialog = require('Dialog');
var SoundEffect = require('SoundEffect');

cc.Class({
    extends: cc.Component,

    properties: {
        loading: cc.Prefab,
        dialog: cc.Prefab,
        exitTime: 0,
    },

    // use this for initialization
    onLoad() {
        cc.game.addPersistRootNode(this.node);

        if (!Tools.getLocalData(Global.LSK.userInfo_location)) {
            Tools.setLocalData(Global.LSK.userInfo_location, '该用户未公开地理位置');
        }

        if (!Tools.getLocalData(Global.LSK.playMusicConfig)) {
            Tools.setLocalData(Global.LSK.playMusicConfig, { music: true, effect: true });
        }
        window.SoundEffect = new SoundEffect();
        window.SoundEffect.backgroundMusic();

        window.Dialog = new Dialog();
        window.Dialog.loadingPrefab = this.loading;
        window.Dialog.messagePrefab = this.dialog;

        this.schedule(this.hbt.bind(this), Global.hbtTime);

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event) => {
            cc.log(this.exitTime);
            if (event.keyCode === cc.KEY.back) {
                if ((+new Date() - this.exitTime) > 2000) {
                    this.exitTime = +new Date();
                }
                else {
                    cc.game.end();
                }
            }
            cc.log(`cc.SystemEvent.EventType.KEY_UP: ${event.keyCode}`);
        }, this);

        // native test
        NativeExtensionManager.execute('test', [], (result) => {
            cc.log(result);
        });
    },

    hbt: function() {
        if (!Tools.getLocalData(Global.LSK.secretKey)) {
            return;
        }
        const scene = cc.director.getScene();
        HttpRequestManager.httpRequest('heartbeat', {}, (event, result) => {
            if (result.code === 1) {
                if (result.isLogin == 0 || result.isLogin == 2) {
                    Tools.setLocalData(Global.LSK.secretKey, '');
                    cc.director.loadScene('Login');
                }

                if (scene.name === 'Lobby') {
                    const lobbyScene = scene.getChildByName('Canvas').getComponent('LobbyScene');
                    lobbyScene.money.string = result.gold;
                }

                const userInfo = Tools.getLocalData(Global.LSK.userInfo);
                userInfo.gold = result.gold;
                userInfo.notice = result.news;
                Tools.setLocalData(Global.LSK.userInfo, userInfo);
            }
        });
    },

});