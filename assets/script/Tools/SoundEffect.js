var SoundEffect = cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...

        backgroundMusicUrl: '',

        backgroundMusicAudioId: {
            default: null,
            visible: false,
        },
    },

    backgroundMusicInit (audioUrl, isLoop, volume) {
        this.audioRaw = audioUrl ? cc.url.raw(audioUrl) : null;
        this.isLoop = isLoop || false;
        this.volume = volume || 1;
    },

    backgroundMusicPlay () {
        if (this.backgroundMusicAudioId === null) {
            this.backgroundMusicAudioId = cc.audioEngine.play(this.audioRaw, this.isLoop, this.volume);
        } else if (this.backgroundMusicState() !== 1) {
            cc.audioEngine.resume(this.backgroundMusicAudioId);
        }
    },

    backgroundMusicStop () {
        cc.audioEngine.pause(this.backgroundMusicAudioId);
    },

    backgroundMusicClear () {
        cc.audioEngine.pause(this.backgroundMusicAudioId);
        this.backgroundMusicAudioId = null;
    },

    backgroundMusicState () {
        return cc.audioEngine.getState(this.backgroundMusicAudioId);
    },

    backgroundMusicSetAudioRaw (audio) {
        if (typeof audio === 'string') {
            this.audioRaw = cc.url.raw(audio);
        } else {
            this.audioRaw = audio;
        }

        return this;
    },

    backgroundMusic () {
        if (!this.backgroundMusicAudioId) {
            this.backgroundMusicInit(this.backgroundMusicUrl, true);
        }
    },

    playEffect (url) {
        if (!url) {
            cc.log('window.SoundEffect.playEffect: url不存在, ' + url);
            return;
        }
        var playMusicConfig = Tools.getLocalData(GlobalConfig.LSK.playMusicConfig);
        if (playMusicConfig.effect) {
            var audioRaw = cc.url.raw(url);
            cc.audioEngine.play(audioRaw, false, 1);
        }
    },
});

module.exports = SoundEffect;
