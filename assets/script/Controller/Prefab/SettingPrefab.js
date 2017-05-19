cc.Class({
    extends: cc.Component,

    properties: {
        musicToggle: cc.Toggle,
        voiceToggle: cc.Toggle,
    },

    // use this for initialization
    onLoad() {
        this.playMusicConfig =window.Global.Tools.getLocalData(window.Global.Config.LSK.playMusicConfig);

        this.musicToggle.isChecked = this.playMusicConfig.music;
        this.voiceToggle.isChecked = this.playMusicConfig.effect;
    },

    musicToggleOnClick(target) {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        this.playMusicConfig.music = target.isChecked;
       window.Global.Tools.setLocalData(window.Global.Config.LSK.playMusicConfig, this.playMusicConfig);

        if (this.playMusicConfig.music) {
            window.Global.SoundEffect.backgroundMusicPlay();
        }
        else {
            window.Global.SoundEffect.backgroundMusicStop();
        }
    },

    voiceToggleOnClick(target) {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        this.playMusicConfig.effect = target.isChecked;
       window.Global.Tools.setLocalData(window.Global.Config.LSK.playMusicConfig, this.playMusicConfig);
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
        window.Global.Animation.closeDialog(this.node);
        cc.log('removeSelf');
    },

    /**
     * 登出
     */
    logoutOnClick() {
        window.Global.SoundEffect.playEffect(window.Global.Config.audioUrl.effect.buttonClick);
       window.Global.Tools.setLocalData(window.Global.Config.LSK.secretKey, '');
        cc.director.loadScene('Login');
    },

});
