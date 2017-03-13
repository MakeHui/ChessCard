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

window.NativeExtensionManager = {
    _listener: {},

    execute(name, args = [], callback = Function) {
        if (!nativeExtension) {
            cc.warn('window.NativeExtensionManager.execute: 不是native平台');
            return;
        }

        if (!args) {
            cc.warn('window.NativeExtensionManager.execute: 没有传递参数');
            return;
        }

        if (!nativeExtension[name]) {
            cc.warn(`window.NativeExtensionManager.execute: 没有找到 ${name} 方法`);
            return;
        }

        nativeExtension[name].apply(null, args);
        this._listener[name] = callback;
    },

    callback(name, result) {
        this._listener[name](result);
        delete this._listener[name];
    },
};

