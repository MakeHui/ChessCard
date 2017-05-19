cc.Class({
    extends: cc.Component,

    properties: {
        exitTime: 0,
        appUpdatePrefab: cc.Prefab, // app update
    },

    // use this for initialization
    onLoad() {
        cc.game.addPersistRootNode(this.node);

        // 初始化全局类
        window.GlobalConfig = require('GlobalConfig');
        window.Animation = this.node.getComponent('Animation');
        window.Tools = this.node.getComponent('Tools');
        window.Dialog = this.node.getComponent('Dialog');
        window.SoundEffect = this.node.getComponent('SoundEffect');

        // 初始化本地数据
        if (!window.Tools.getLocalData(window.GlobalConfig.LSK.userInfo_location)) {
            window.Tools.setLocalData(window.GlobalConfig.LSK.userInfo_location, '该用户未公开地理位置');
        }
        if (!window.Tools.getLocalData(window.GlobalConfig.LSK.playMusicConfig)) {
            window.Tools.setLocalData(window.GlobalConfig.LSK.playMusicConfig, { music: true, effect: true });
        }
        window.Tools.setLocalData(window.GlobalConfig.LSK.appleReview, true);

        // 初始化背景音效
        window.SoundEffect.backgroundMusic();
        const playMusicConfig = Tools.getLocalData(GlobalConfig.LSK.playMusicConfig);
        if (playMusicConfig.music) {
            window.SoundEffect.backgroundMusicPlay();
        }
        else {
            window.SoundEffect.backgroundMusicStop();
        }

        this.schedule(this.hbt.bind(this), window.GlobalConfig.hbtTime);

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

                if (!window.Tools.getLocalData(window.GlobalConfig.LSK.appleReview)) {
                    NativeExtensionManager.execute('startLocation', [], (result) => {
                        window.Tools.setLocalData(window.GlobalConfig.LSK.userInfo_location, result.result == 0 ? result.data : '该用户未公开地理位置');
                    });
                }
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

    hbt () {
        if (!window.Tools.getLocalData(window.GlobalConfig.LSK.secretKey) ||
            !window.Tools.getLocalData(window.GlobalConfig.LSK.userInfo)) {
            return;
        }
        HttpRequestManager.httpRequest('heartbeat', {}, (event, result) => {
            if (result.code === 1) {
                const scene = cc.director.getScene();
                if (result.isLogin == 0 || result.isLogin == 2) {
                    if (scene.name === 'GameRoom') {
                        WebSocketManager.close();
                    }
                    window.Tools.setLocalData(window.GlobalConfig.LSK.secretKey, '');
                    cc.director.loadScene('Login');
                }

                if (scene.name === 'Lobby') {
                    const lobbyScene = scene.getChildByName('Canvas').getComponent('LobbyScene');
                    lobbyScene.money.string = result.gold;
                }

                const userInfo = window.Tools.getLocalData(window.GlobalConfig.LSK.userInfo);
                userInfo.gold = result.gold;
                window.Tools.setLocalData(window.GlobalConfig.LSK.userInfo, userInfo);
            }
        });
    },

    httpCheckUpdate(callback) {
        HttpRequestManager.httpRequest('check', [], (event, result) => {
            window.Tools.setLocalData(window.GlobalConfig.LSK.appleReview, result.isCheck);
            if (result.code === 1000) {
                var node = cc.instantiate(this.appUpdatePrefab);
                node.init(result, function() {
                    callback();
                });
                window.Animation.openDialog(node, this.node);
            }
            else {
                callback();
            }
        });
    },

});