cc.Class({
    extends: cc.Component,

    properties: {
        loading: cc.Prefab,
        dialog: cc.Prefab,
        exitTime: 0,
    },

    // use this for initialization
    onLoad() {
        cc.log('InitApp');
        cc.game.addPersistRootNode(this.node);

        if (!Tools.getLocalData(Global.LSK.userInfo_location)) {
            Tools.setLocalData(Global.LSK.userInfo_location, '该用户未公开地理位置');
        }

        if (!Tools.getLocalData(Global.LSK.playMusicConfig)) {
            Tools.setLocalData(Global.LSK.playMusicConfig, { music: true, effect: true });
        }

        this.hbt();
        this.backgroundMusic();

        Global.dialog.loadingPrefab = this.loading;
        Global.dialog.dialogPrefab = this.dialog;

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
    },

    hbt() {
        this.schedule(() => {
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
                        lobbyScene.notice.getComponent(cc.Label).string = result.news;
                    }

                    const userInfo = Tools.getLocalData(Global.LSK.userInfo);
                    userInfo.gold = result.gold;
                    userInfo.notice = result.news;
                    Tools.setLocalData(Global.LSK.userInfo, userInfo);
                }
            });
        }, Global.hbtTime);
    },

    backgroundMusic() {
        if (!Global.backgroundMusic) {
            Global.backgroundMusic = Tools.audioEngine.init(Global.audioUrl.background.game, true);
        }
        const playMusicConfig = Tools.getLocalData(Global.LSK.playMusicConfig);
        if (playMusicConfig.music) {
            Global.backgroundMusic.play();
        }
        else {
            Global.backgroundMusic.stop();
        }
    },

});
