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

        backgroundMusicAudioId: null,
    },

    backgroundMusicInit: function init(audioUrl, isLoop, volume) {
        this.audioRaw = audioUrl ? cc.url.raw(audioUrl) : null;
        this.isLoop = isLoop || false;
        this.volume = volume || 1;
    },

    backgroundMusicPlay: function play() {
        if (this.backgroundMusicAudioId === null) {
            this.backgroundMusicAudioId = cc.audioEngine.play(this.audioRaw, this.isLoop, this.volume);
        } else if (this.backgroundMusicState() !== 1) {
            cc.audioEngine.resume(this.backgroundMusicAudioId);
        }
    },

    backgroundMusicStop: function stop() {
        cc.audioEngine.pause(this.backgroundMusicAudioId);
    },

    backgroundMusicState: function state() {
        return cc.audioEngine.getState(this.backgroundMusicAudioId);
    },

    backgroundMusicSetAudioRaw: function setAudioRaw(audio) {
        if (typeof audio === 'string') {
            this.audioRaw = cc.url.raw(audio);
        } else {
            this.audioRaw = audio;
        }

        return this;
    },

    backgroundMusic: function() {
        if (!this.backgroundMusicAudioId) {
            this.backgroundMusicInit(Global.audioUrl.background.game, true);
        }
        const playMusicConfig = Tools.getLocalData(Global.LSK.playMusicConfig);
        if (playMusicConfig.music) {
            this.backgroundMusicPlay();
        }
        else {
            this.backgroundMusicStop();
        }
    },

    playEffect: function (url) {
        if (!url) {
            cc.log('window.SoundEffect.playEffect: url不存在, ' + url);
            return;
        }
        var playMusicConfig = Tools.getLocalData(Global.LSK.playMusicConfig);
        if (playMusicConfig.effect) {
            var audioRaw = cc.url.raw(url);
            cc.audioEngine.play(audioRaw, false, 1);
        }
    },
});

module.exports = SoundEffect;
