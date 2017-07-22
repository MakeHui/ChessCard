var SoundEffect = cc.Class({
    statics: {
        backgroundMusicPlay(audioUrl, isLoop, volume) {
            var playMusicConfig = window.Global.Tools.getLocalData(window.Global.Config.LSK.playMusicConfig);
            if (!playMusicConfig.music) {
                return;
            }
            var audioRaw = cc.url.raw(audioUrl);
            isLoop = isLoop || false;
            volume = volume || 1;

            this.backgroundMusicStop();
            cc.audioEngine.play(audioRaw, isLoop, volume);
        },

        backgroundMusicStop () {
            cc.audioEngine.uncacheAll();
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
    }
});

module.exports = SoundEffect;
