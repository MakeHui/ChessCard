cc.Class({
    extends: cc.Component,

    properties: {
        musicToggle: cc.Toggle,
        voiceToggle: cc.Toggle,
    },

    // use this for initialization
    onLoad() {
        this.playMusicConfig = Tools.getLocalData(Global.LSK.playMusicConfig);

        this.musicToggle.isChecked = this.playMusicConfig.music;
        this.voiceToggle.isChecked = this.playMusicConfig.effect;
    },

    musicToggleOnClick(target) {
        window.SoundEffect.playEffect(Global.audioUrl.effect.buttonClick);
        this.playMusicConfig.music = target.isChecked;
        Tools.setLocalData(Global.LSK.playMusicConfig, this.playMusicConfig);
        window.SoundEffect.backgroundMusic();
    },

    voiceToggleOnClick(target) {
        window.SoundEffect.playEffect(Global.audioUrl.effect.buttonClick);
        this.playMusicConfig.effect = target.isChecked;
        Tools.setLocalData(Global.LSK.playMusicConfig, this.playMusicConfig);
        window.SoundEffect.backgroundMusic();
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        window.SoundEffect.playEffect(Global.audioUrl.effect.buttonClick);
        Animation.closeDialog(this.node);
        cc.log('removeSelf');
    },

    /**
     * 登出
     */
    logoutOnClick() {
        window.SoundEffect.playEffect(Global.audioUrl.effect.buttonClick);
        Tools.setLocalData(Global.LSK.secretKey, '');
        cc.director.loadScene('Login');
    },

});
