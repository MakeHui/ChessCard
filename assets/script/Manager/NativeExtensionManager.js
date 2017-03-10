/**
 * 导入对应平台的库文件
 */
let nativeExtension = null;
if (cc.sys.os === cc.sys.OS_IOS) {
    nativeExtension = require('iOSExtension');
}
else if (cc.sys.os === cc.sys.OS_ANDROID) {
    nativeExtension = require('AndroidExtension');
}

window.NativeExtensionManager = {};

window.NativeExtensionManager.execute = (args) => {
    if (!nativeExtension) {
        cc.error('window.NativeExtensionManager.execute: 不是native平台');
        return;
    }

    const name = args[0];
    args.splice(0, 1);

    if (!nativeExtension[name]) {
        cc.error(`window.NativeExtensionManager.execute: 没有找到 ${name} 方法`);
        return;
    }

    nativeExtension[name].apply(null, args);
};

window.NativeExtensionManager.callback = {
    record(data) {

    }
}
