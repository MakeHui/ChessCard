
const NativeExtensionManager = cc.Class({
    extends: cc.Component,

    statics: {
        _listener: {},

        _androidExtension: {
            test: function () {
                return jsb.reflection.callStaticMethod('com/huyaohui/cocosextension/CocosExtension', 'test', '()V');
            },

            /**
             获取系统剪切板中的数据
             */
            getPasteboard: function () {
                return jsb.reflection.callStaticMethod('com/huyaohui/cocosextension/CocosExtension', 'getPasteboard', '()Ljava/lang/String;');
            },

            /**
             开始录音
             */
            startRecord: function () {
                return jsb.reflection.callStaticMethod('com/huyaohui/cocosextension/CocosExtension', 'startRecord', '()V');
            },

            /**
             关闭录音
             */
            stopRecord: function () {
                return jsb.reflection.callStaticMethod('com/huyaohui/cocosextension/CocosExtension', 'stopRecord', '()Ljava/lang/String;');
            },

            /**
             * 播放音频
             * @param url
             * @returns {*}
             */
            playerAudio: function (url) {
                return jsb.reflection.callStaticMethod('com/huyaohui/cocosextension/CocosExtension', 'playerAudio', '(Ljava/lang/String;)V', url);
            },

            // /**
            //  * 微信是否安装
            //  * @returns bool
            //  */
            // wechatIsWxAppInstalled: function () {
            //     return jsb.reflection.callStaticMethod('com/huyaohui/cocosextension/CocosExtension', 'wechatIsWxAppInstalled', '()V');
            // },
            //
            //
            // /**
            //  微信分享土图片
            //  @param path 图片地址
            //  */
            // wechatImageShare: function (path) {
            //     return jsb.reflection.callStaticMethod('com/huyaohui/cocosextension/CocosExtension', 'wechatImageShare:', '(Ljava/lang/String;)V', path);
            // },
            //
            //
            // /**
            //  微信链接分享
            //  @param link 链接
            //  @param title 标题
            //  @param description 说明
            //  */
            // wechatLinkShare: function (link, title, description) {
            //     return jsb.reflection.callStaticMethod('com/huyaohui/cocosextension/CocosExtension', 'wechatLinkShare', '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V', link, title, description);
            // },

            /**
             初始化oss client
             @param endpoint 端点
             @param accessKey 访问key
             @param secretKey 访问秘钥
             */
            // ossInit: function (endpoint, accessKey, secretKey) {
            //     return jsb.reflection.callStaticMethod('com/huyaohui/cocosextension/CocosExtension', 'ossInit', '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V', endpoint, accessKey, secretKey);
            // },

            /**
             上传文件
             @param bucketName bucke 名称
             @param objectKey 存储到oss上的文件名
             @param file 本地文件路径
             */
            ossUpload: function (bucketName, objectKey, file) {
                return jsb.reflection.callStaticMethod('com/huyaohui/cocosextension/CocosExtension', 'ossUpload', '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V', bucketName, objectKey, file);
            },

            /**
             开始定位
             */
            startLocation: function () {
                return jsb.reflection.callStaticMethod('com/huyaohui/cocosextension/CocosExtension', 'startLocation', '()V');
            },

            /**
             检查网络是否通畅
             @return bool
             */
            checkNetwork: function () {
                return jsb.reflection.callStaticMethod('com/huyaohui/cocosextension/CocosExtension', 'checkNetwork', '()Z');
            }
        },

        _iOSExtension: {
            test: function () {
                return jsb.reflection.callStaticMethod('MHCocosExtension', 'test');
            },

            /**
             获取系统剪切板中的数据
             */
            getPasteboard: function () {
                return jsb.reflection.callStaticMethod('MHCocosExtension', 'getPasteboard');
            },


            /**
             开始录音
             */
            startRecord: function () {
                return jsb.reflection.callStaticMethod('MHCocosExtension', 'startRecord');
            },

            /**
             关闭录音
             */
            stopRecord: function () {
                return jsb.reflection.callStaticMethod('MHCocosExtension', 'stopRecord');
            },

            /**
             * 播放音频
             * @param filePath
             * @return {*}
             */
            playerAudio: function (filePath) {
                return jsb.reflection.callStaticMethod('MHCocosExtension', 'playerAudio:', filePath);
            },

            /**
             * 删除音频缓存
             * @return {*}
             */
            deleteAudioCache: function() {
                return jsb.reflection.callStaticMethod('MHCocosExtension', 'deleteAudioCache');
            },

            /**
             * 微信是否安装
             * @returns bool
             */
            wechatIsWxAppInstalled: function() {
                return jsb.reflection.callStaticMethod('MHCocosExtension', 'wechatIsWxAppInstalled');
            },


            /**
             微信分享土图片
             @param path 图片地址
             */
            wechatImageShare: function (path) {
                return jsb.reflection.callStaticMethod('MHCocosExtension', 'wechatImageShare:', path);
            },


            /**
             微信链接分享
             @param link 链接
             @param title 标题
             @param description 说明
             */
            wechatLinkShare: function (link, title, description) {
                return jsb.reflection.callStaticMethod('MHCocosExtension', 'wechatLinkShare:setTitle:setDescription:', link, title, description);
            },


            /**
             初始化oss client
             @param endpoint 端点
             @param accessKey 访问key
             @param secretKey 访问秘钥
             */
            // ossInit: function (endpoint, accessKey, secretKey) {
            //     return jsb.reflection.callStaticMethod('MHCocosExtension', 'ossInit:setAccessKeyId:setSecretKey:', endpoint, accessKey, secretKey);
            // },


            /**
             上传文件
             @param bucketName bucke 名称
             @param objectKey 存储到oss上的文件名
             @param file 本地文件路径
             */
            ossUpload: function (bucketName, objectKey, file) {
                return jsb.reflection.callStaticMethod('MHCocosExtension', 'ossUpload:setObjectKey:setUrl:', bucketName, objectKey, file);
            },

            /**
             上传文件
             @param bucketName bucke 名称
             @param objectKey oss上的文件名
             */
            ossDownload: function (bucketName, objectKey) {
                return jsb.reflection.callStaticMethod('MHCocosExtension', 'ossDownload:setObjectKey:', bucketName, objectKey);
            },

            /**
             开始定位
             */
            startLocation: function () {
                return jsb.reflection.callStaticMethod('MHCocosExtension', 'startLocation');
            },


            /**
             检查网络是否通畅
             @return bool
             */
            checkNetwork: function () {
                return jsb.reflection.callStaticMethod('MHCocosExtension', 'checkNetwork');
            }
        },

        /**
         * 导入对应平台的库文件
         */
        init () {
            if (cc.sys.os === cc.sys.OS_IOS) {
                this._nativeExtension = this._iOSExtension;
            } else if (cc.sys.os === cc.sys.OS_ANDROID) {
                this._nativeExtension = this._androidExtension;
            } else {
                cc.log('window.Global.NativeExtensionManager.init: 不是native平台');
            }
            return this;
        },

        execute (name) {
            var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
            var callback = arguments.length <= 2 || arguments[2] === undefined ? Function : arguments[2];

            if (!this._nativeExtension) {
                cc.log('window.Global.NativeExtensionManager.execute: 不是native平台');
                return false;
            }

            if (!args) {
                cc.log('window.Global.NativeExtensionManager.execute: 没有传递参数');
                return false;
            }

            if (!this._nativeExtension[name]) {
                cc.log('window.Global.NativeExtensionManager.execute: 没有找到 ' + name + ' 方法');
                return false;
            }

            this._listener[name] = callback;

            return this._nativeExtension[name].apply(null, args);
        },

        callback (name, result) {
            cc.log('NativeExtensionManager.callback.' + name + ': ' + JSON.stringify(result));
            this._listener[name](result);
            delete this._listener[name];
        }
    }
});

module.exports = NativeExtensionManager;