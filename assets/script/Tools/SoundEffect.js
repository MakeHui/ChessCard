var SoundEffect = cc.Class({
    extends: cc.Component,

    properties: {
        backgroundMusicUrl: '',

        backgroundMusicAudioId: {
            default: null,
            visible: false,
        },
    },

    backgroundMusic (audioUrl, isLoop, volume) {
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
        // cc.audioEngine.pause(this.backgroundMusicAudioId);
        this.backgroundMusicClear();
    },

    backgroundMusicClear () {
        // cc.audioEngine.pause(this.backgroundMusicAudioId);
        cc.audioEngine.uncache(this.audioRaw);
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

    init () {
        if (!this.backgroundMusicAudioId) {
            this.backgroundMusic(this.backgroundMusicUrl, true);
        }
        return this;
    },

    playEffect (url) {
        if (!url) {
            cc.log('window.Global.SoundEffect.playEffect: url不存在, ' + url);
            return;
        }
        var playMusicConfig = window.Global.Tools.getLocalData(window.Global.Config.LSK.playMusicConfig);
        if (playMusicConfig.effect) {
            var audioRaw = cc.url.raw(url);
            cc.audioEngine.play(audioRaw, false, 1);
        }
    },
});

module.exports = SoundEffect;
