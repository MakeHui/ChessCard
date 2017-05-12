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

        appUpdatePrefab: cc.Prefab, // app update
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

        window.Tools.setLocalData(GlobalConfig.LSK.appleReview, true);

        if (!window.Tools.getLocalData(GlobalConfig.LSK.playMusicConfig)) {
            window.Tools.setLocalData(GlobalConfig.LSK.playMusicConfig, { music: true, effect: true });
        }
        window.SoundEffect = new SoundEffect();
        window.SoundEffect.backgroundMusic();

        this.schedule(this.hbt.bind(this), GlobalConfig.hbtTime);

        // window.Tools.setLocalData(GlobalConfig.LSK.secretKey, '91d3e19c-1762-11e7-a41e-00163e10f210');

        window.Dialog.openLoading();

        // 装载资源
        cc.loader.loadResDir('Texture', function(err, assets) {
            cc.log(['AppDelegate.onLoad: 资源装载完成', err, assets]);
        });

        if (cc.sys.isNative) {
            // 检查应用更新
            this.httpCheckUpdate(function() {
                // 检查热更新
                var hotUpdateManager = cc.director.getScene().getChildByName('Canvas').getComponent('HotUpdateManager');
                hotUpdateManager.init();
                hotUpdateManager.hotUpdate(function(code) {
                    if (code == 3) {
                        cc.director.loadScene('Login');
                    }
                    else if (code == 4) {
                        window.SoundEffect.backgroundMusicClear();
                    }
                });
            });

            // TODO: 删除本地音频文件
            // NativeExtensionManager.execute('deleteAudioCache');

            // native test
            NativeExtensionManager.execute('test', [], (result) => {
                cc.log(result);
            });

            if (cc.sys.os === cc.sys.OS_ANDROID) {
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
            }
        }

        if (cc.sys.isBrowser) {
            cc.director.loadScene('Login');
        }
    },

    hbt: function() {
        if (!window.Tools.getLocalData(GlobalConfig.LSK.secretKey) ||
            !window.Tools.getLocalData(GlobalConfig.LSK.userInfo)) {
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

    httpCheckUpdate(callback) {
        HttpRequestManager.httpRequest('check', [], (event, result) => {
            window.Tools.setLocalData(GlobalConfig.LSK.appleReview, result.isCheck);
            if (result.code === 1000) {
                var node = cc.instantiate(this.appUpdatePrefab);
                node.init(result, function() {
                    callback();
                });
                Animation.openDialog(node, this.node);
            }
            else {
                callback();
            }
        });
    },

});