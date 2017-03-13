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
        cc.warn(target.isChecked);
        this.playMusicConfig.music = target.isChecked;
        Tools.setLocalData(Global.LSK.playMusicConfig, this.playMusicConfig);
        Global.initBackgroundMusic();
    },

    voiceToggleOnClick(target) {
        this.playMusicConfig.effect = target.isChecked;
        Tools.setLocalData(Global.LSK.playMusicConfig, this.playMusicConfig);
        Global.initBackgroundMusic();
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        Global.closeDialog(this.node);
        cc.warn('removeSelf');
    },
});
