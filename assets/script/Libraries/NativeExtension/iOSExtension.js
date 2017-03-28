var iOSExtension = {

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
        jsb.reflection.callStaticMethod('MHCocosExtension', 'getPasteboard:');
    },

    /**
     关闭录音
     */
    stopRecord() {
        jsb.reflection.callStaticMethod('MHCocosExtension', 'getPasteboard:');
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

};

module.exports = iOSExtension;
