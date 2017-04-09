
window.NativeExtensionManager = {
    _nativeExtension: null,

    _listener: {},

    _androidExtension: {
        /**
         获取系统剪切板中的数据
         */
        getPasteboard() {
            return jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'getPasteboard', '()V');
        },

        /**
         开始录音
         */
        startRecord() {
            jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'startRecord', '()V');
        },

        /**
         关闭录音
         */
        stopRecord() {
            jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'stopRecord', '()V');
        },

        /**
         * 微信是否安装
         * @returns bool
         */
        wechatIsWxAppInstalled() {
            return jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'wechatIsWxAppInstalled', '()V');
        },

        /**
         微信分享土图片

         @param path 图片地址
         */
        wechatImageShare(path) {
            jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'wechatImageShare:', '(Ljava/lang/String;)V', path);
        },

        /**
         微信链接分享

         @param link 链接
         @param title 标题
         @param description 说明
         */
        wechatLinkShare(link, title, description) {
            jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'wechatLinkShare', '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V', link, title, description);
        },

        /**
         初始化oss client

         @param endpoint 端点
         @param accessKey 访问key
         @param secretKey 访问秘钥
         */
        ossInit(endpoint, accessKey, secretKey) {
            jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'ossInit', '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V', endpoint, accessKey, secretKey);
        },

        /**
         上传文件

         @param bucketName bucke 名称
         @param objectKey 存储到oss上的文件名
         @param file 本地文件路径
         */
        ossUpload(bucketName, objectKey, file) {
            jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity', 'ossUpload', '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V', bucketName, objectKey, file);
        },

        /**
         开始定位
         */
        startLocation() {
            jsb.reflection.callStaticMethod('MHCocosExtension', 'startLocation', '()V');
        },

        /**
         检查网络是否通畅

         @return bool
         */
        checkNetwork() {
            jsb.reflection.callStaticMethod('MHCocosExtension', 'checkNetwork', '()V');
        },
    },

    _iOSExtension: {

        /**
         获取系统剪切板中的数据
         */
        getPasteboard() {
            return jsb.reflection.callStaticMethod('MHCocosExtension', 'getPasteboard:');
        },

        /**
         开始录音
         */
        startRecord() {
            jsb.reflection.callStaticMethod('MHCocosExtension', 'startRecord:');
        },

        /**
         关闭录音
         */
        stopRecord() {
            jsb.reflection.callStaticMethod('MHCocosExtension', 'stopRecord:');
        },

        /**
         * 微信是否安装
         * @returns bool
         */
        wechatIsWxAppInstalled() {
            return jsb.reflection.callStaticMethod('MHCocosExtension', 'wechatIsWxAppInstalled:');
        },

        /**
         微信分享土图片

         @param path 图片地址
         */
        wechatImageShare(path) {
            jsb.reflection.callStaticMethod('MHCocosExtension', 'wechatImageShare:', path);
        },

        /**
         微信链接分享

         @param link 链接
         @param title 标题
         @param description 说明
         */
        wechatLinkShare(link, title, description) {
            jsb.reflection.callStaticMethod('MHCocosExtension', 'wechatLinkShare:setTitle:setDescription:', link, title, description);
        },

        /**
         初始化oss client

         @param endpoint 端点
         @param accessKey 访问key
         @param secretKey 访问秘钥
         */
        ossInit(endpoint, accessKey, secretKey) {
            jsb.reflection.callStaticMethod('MHCocosExtension', 'ossInit:setAccessKeyId:setSecretKey:', endpoint, accessKey, secretKey);
        },

        /**
         上传文件

         @param bucketName bucke 名称
         @param objectKey 存储到oss上的文件名
         @param file 本地文件路径
         */
        ossUpload(bucketName, objectKey, file) {
            jsb.reflection.callStaticMethod('MHCocosExtension', 'ossUpload:setObjectKey:setUrl:', bucketName, objectKey, file);
        },

        /**
         开始定位
         */
        startLocation() {
            jsb.reflection.callStaticMethod('MHCocosExtension', 'startLocation:');
        },

        /**
         检查网络是否通畅

         @return bool
         */
        checkNetwork() {
            jsb.reflection.callStaticMethod('MHCocosExtension', 'checkNetwork:');
        },

    },

    /**
     * 导入对应平台的库文件
     */
    init() {
        if (cc.sys.os === cc.sys.OS_IOS) {
            this._nativeExtension = this._iOSExtension;
        }
        else if (cc.sys.os === cc.sys.OS_ANDROID) {
            this._nativeExtension = this._androidExtension;
        }
    },

    execute: function execute(name) {
        var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
        var callback = arguments.length <= 2 || arguments[2] === undefined ? Function : arguments[2];

        if (!this._nativeExtension) {
            Global.log('window.NativeExtensionManager.execute: 不是native平台');
            return;
        }

        if (!args) {
            Global.log('window.NativeExtensionManager.execute: 没有传递参数');
            return;
        }

        if (!this._nativeExtension[name]) {
            Global.log('window.NativeExtensionManager.execute: 没有找到 ' + name + ' 方法');
            return;
        }

        this._nativeExtension[name].apply(null, args);
        this._listener[name] = callback;
    },
    callback: function callback(name, result) {
        this._listener[name](result);
        delete this._listener[name];
    }
};

NativeExtensionManager.init();