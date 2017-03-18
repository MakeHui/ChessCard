cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad() {
        cc.warn('InitApp');
        cc.game.addPersistRootNode(this.node);

        if (!Tools.getLocalData(Global.LSK.userInfo_location)) {
            Tools.setLocalData(Global.LSK.userInfo_location, '该用户未公开地理位置');
        }

        if (!Tools.getLocalData(Global.LSK.playMusicConfig)) {
            Tools.setLocalData(Global.LSK.playMusicConfig, { music: true, effect: true });
        }

        this.hbt();
        this.backgroundMusic();
    },

    hbt() {
        cc.director.getScheduler().schedule(() => {
            const scene = cc.director.getScene();
            if (scene.name !== 'Lobby') {
                return;
            }

            HttpRequestManager.httpRequest('heartbeat', {}, (event, result) => {
                if (result.code === 1) {
                    if (result.isLogin == 0 || result.isLogin == 2) {
                        cc.director.loadScene('LoginScene');
                    }

                    const lobbyScene = scene.getChildByName('Canvas').getComponent('LobbyScene');
                    lobbyScene.money.string = result.glod;
                    lobbyScene.notice.getComponent(cc.Label).string = result.news;

                    const userInfo = Tools.getLocalData(Global.LSK.userInfo);
                    userInfo.gold = result.glod;
                    userInfo.notice = result.news;
                    Tools.setLocalData(Global.LSK.userInfo, userInfo);
                }
            });
        }, this, 30, true);
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
