var Dialog = require('Dialog');
var SoundEffect = require('SoundEffect');
var Animation = require('Animation');
var Tools = require('Tools');

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

        window.Animation = new Animation();
        window.Tools = new Tools();

        window.Dialog = new Dialog();
        window.Dialog.loadingPrefab = this.loading;
        window.Dialog.messagePrefab = this.dialog;

        if (!window.Tools.getLocalData(GlobalConfig.LSK.userInfo_location)) {
            window.Tools.setLocalData(GlobalConfig.LSK.userInfo_location, '该用户未公开地理位置');
        }

        if (!window.Tools.getLocalData(GlobalConfig.LSK.playMusicConfig)) {
            window.Tools.setLocalData(GlobalConfig.LSK.playMusicConfig, { music: true, effect: true });
        }
        window.SoundEffect = new SoundEffect();
        window.SoundEffect.backgroundMusic();


        this.schedule(this.hbt.bind(this), GlobalConfig.hbtTime);

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

        NativeExtensionManager.execute('deleteAudioCache');

        // native test
        NativeExtensionManager.execute('test', [], (result) => {
            cc.log(result);
        });

        // Tools.setLocalData(GlobalConfig.LSK.secretKey, '91d3e19c-1762-11e7-a41e-00163e10f210');
    },

    hbt: function() {
        if (!window.Tools.getLocalData(GlobalConfig.LSK.secretKey)) {
            return;
        }
        HttpRequestManager.httpRequest('heartbeat', {}, (event, result) => {
            if (result.code === 1) {
                const scene = cc.director.getScene();
                if (result.isLogin == 0 || result.isLogin == 2) {
                    if (scene.name === 'GameRoom') {
                        WebSocketManager.close();
                    }
                    window.Tools.setLocalData(GlobalConfig.LSK.secretKey, '');
                    cc.director.loadScene('Login');
                }

                if (scene.name === 'Lobby') {
                    const lobbyScene = scene.getChildByName('Canvas').getComponent('LobbyScene');
                    lobbyScene.money.string = result.gold;
                }

                const userInfo = window.Tools.getLocalData(GlobalConfig.LSK.userInfo);
                userInfo.gold = result.gold;
                window.Tools.setLocalData(GlobalConfig.LSK.userInfo, userInfo);
            }
        });
    },

});