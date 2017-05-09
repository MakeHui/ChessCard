cc.Class({
    extends: cc.Component,

    properties: {
        manifestUrl: cc.RawAsset,
        // 热更新
        progressLabel: cc.Label,
        progressBar: cc.ProgressBar,
    },

    // use this for initialization
    onLoad: function () {
        this._isUpdating = false;
        this._hasUpdate = false;
        this._canRetry = false;
        this._assetsManager = {};
        this._checkUpdateListener = function() {};
        this._hotUpdateListener = function() {};

        this.progressBar.progress = 0;
    },

    /**
     * 初始化热更新类
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-24T18:49:03+0800
     */
    init: function () {
        // Hot update is only available in Native build
        if (!cc.sys.isNative) {
            return;
        }

        var storagePath = (jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-asset';
        cc.log('Storage path for remote asset : ' + storagePath);
        // cc.log('Local manifest URL : ' + this.manifestUrl);

        // 获取 manifest 地址
        this._assetsManager = new jsb.AssetsManager(this.manifestUrl, storagePath);
        if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._assetsManager.retain();
        }

        // Setup your own version compare handler, versionA and B is versions in string
        // if the return value greater than 0, versionA is greater than B,
        // if the return value equals 0, versionA equals to B,
        // if the return value smaller than 0, versionA is smaller than B.
        this._assetsManager.setVersionCompareHandle(function (versionA, versionB) {
            cc.log('JS Custom Version Compare: version A is ' + versionA + ', version B is ' + versionB);
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; i += 1) {
                var a = parseInt(vA[i], 10);
                var b = parseInt(vB[i] || 0, 10);
                if (a !== b) {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            }

            return 0;
        });

        // Setup the verification callback, but we don't have md5 check function yet, so only print some message
        // Return true if the verification passed, otherwise return false
        this._assetsManager.setVerifyCallback(function (path, asset) {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            // var size = asset.size;
            if (compressed) {
                cc.log('Verification passed : ' + relativePath);
                return true;
            }

            cc.log('Verification passed : ' + relativePath + ' (' + expectedMD5 + ')');
            return true;
        });
        cc.log('Hot update is ready, please check or directly update.');
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            // Some Android device may slow down the download process when concurrent tasks is too much.
            // The value may not be accurate, please do more test and find what's most suitable for your game.
            this._assetsManager.setMaxConcurrentTask(2);
            cc.log('Max concurrent tasks count have been limited to 2');
        }
    },

    /**
     * 检查是否有更新更新
     * 回调函数
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-24T18:49:36+0800
     *
     * @param    {Function}               callback
     */
    checkUpdate: function (callback) {
        var self = this;

        this._checkCallback = function (event) {
            cc.log('Code: ' + event.getEventCode());
            var hasUpdate = false;

            switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                cc.log('No local manifest file found, hot update skipped. 没有本地 manifest 文件');
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                cc.log('Fail to download manifest file, hot update skipped. 没有远程 manifest 文件');
                break;
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                cc.log('Fail to download manifest file, hot update skipped. 无法下载');
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                cc.log('Already up to date with the latest remote version. 已经是最新版本, 无需更新');
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                cc.log('New version found, please try to update. 找到新版本');
                hasUpdate = true;
                this.progressBar.progress = 0;
                break;
            default:
                cc.log('error');
                break;
            }

            cc.eventManager.removeListener(self._checkUpdateListener);
            self._checkUpdateListener = null;

            callback(hasUpdate);
        };

        this._checkUpdate();
    },

    /**
     * 检查是否有更新更新
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-24T18:50:20+0800
     *
     */
    _checkUpdate: function () {
        if (!this._assetsManager.getLocalManifest().isLoaded()) {
            cc.log('Failed to load local manifest ...');
            return;
        }

        this._checkUpdateListener = new jsb.EventListenerAssetsManager(this._assetsManager, this._checkCallback.bind(this));
        cc.eventManager.addListener(this._checkUpdateListener, 1);
        this._assetsManager.checkUpdate();
    },

    /**
     * 更新回调函数
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-24T18:50:33+0800
     *
     * @param    {Function}               callback [description]
     */
    hotUpdate: function (callback) {
        var self = this;
        var callback = callback || function() {};

        this._updateCallback = function (event) {
            var needRestart = false;
            var failed = false;
            var byteProgress = 0.0;
            var fileProgress = 0.0;

            switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                cc.log('No local manifest file found, hot update skipped. 没有本地 manifest 文件');
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                byteProgress = event.getPercent() / 100;
                fileProgress = event.getPercentByFile() / 100;

                if (event.getMessage()) {
                    cc.log('Updated file: ' + event.getMessage());
                    cc.log(event.getPercent().toFixed(2) + '% : ' + event.getMessage());
                }

                self.progressLabel.string = '检查资源更新 ' + parseInt(event.getDownloadedBytes() / event.getTotalBytes(), 10) + '%';
                self.progressBar.progress = byteProgress;
                callback(0, byteProgress, fileProgress);
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                cc.log('Fail to download manifest file, hot update skipped. 没有远程 manifest 文件');
                callback(1, byteProgress, fileProgress);
                break;
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                cc.log('Fail to download manifest file, hot update skipped. 无法下载');
                callback(2, byteProgress, fileProgress);
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                cc.log('Already up to date with the latest remote version. 已经是最新版本, 无需更新');
                callback(3, byteProgress, fileProgress);
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                cc.log('Update finished. ' + event.getMessage());
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                cc.log('Update failed. ' + event.getMessage());
                self._isUpdating = false;
                self._canRetry = true;
                needRestart = true;
                break;
            case jsb.EventAssetsManager.ERROR_isUpdating:
                cc.log('Asset update error: ' + event.getAssetId() + ', ' + event.getMessage());
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                cc.log(event.getMessage());
                break;
            default:
                break;
            }

            if (failed) {
                cc.eventManager.removeListener(self._hotUpdateListener);
                self._hotUpdateListener = null;
                self._isUpdating = false;
            }

            if (needRestart) {
                cc.eventManager.removeListener(self._hotUpdateListener);
                self._hotUpdateListener = null;

                // Prepend the manifest's search path
                var searchPaths = jsb.fileUtils.getSearchPaths();
                var newPaths = self._assetsManager.getLocalManifest().getSearchPaths();
                cc.log(JSON.stringify(newPaths));
                Array.prototype.unshift(searchPaths, newPaths);

                // This value will be retrieved and appended to the default search path during game startup,
                // please refer to samples/js-tests/main.js for detailed usage.
                // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
                cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
                jsb.fileUtils.setSearchPaths(searchPaths);
                cc.game.restart();
            }
        };

        this._hotUpdate();
    },

    /**
     * 立即更新
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-24T18:50:53+0800
     *
     */
    _hotUpdate: function () {
        if (this._assetsManager && !this._isUpdating) {
            this._isUpdating = true;
            this._hotUpdateListener = new jsb.EventListenerAssetsManager(this._assetsManager, this._updateCallback.bind(this));
            cc.eventManager.addListener(this._hotUpdateListener, 1);
            this._assetsManager.update();
        }
    },

    /**
     * 断点续传
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-24T18:51:03+0800
     *
     */
    retry: function () {
        if (!this._isUpdating && this._canRetry) {
            this._canRetry = false;
            cc.log('Retry failed Assets...');
            this._assetsManager.downloadFailedAssets();
        }
    },

    /**
     * 销毁当前绑定对象
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-24T18:51:16+0800
     *
     */
    destroy: function () {
        if (this._hotUpdateListener) {
            cc.eventManager.removeListener(this._hotUpdateListener);
            this._hotUpdateListener = null;
        }
        if (this._assetsManager && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
            this._assetsManager.release();
        }
    }
});