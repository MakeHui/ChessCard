/**
 * 导入对应平台的库文件
 */
let nativeExtension = null;
if (cc.sys.os === cc.sys.OS_IOS) {
    // nativeExtension = require('iOSExtension');
}
else if (cc.sys.os === cc.sys.OS_ANDROID) {
    // nativeExtension = require('AndroidExtension');
}

window.NativeExtensionManager = {};

window.NativeExtensionManager.execute = (args) => {
    if (!nativeExtension) {
        cc.warn('window.NativeExtensionManager.execute: 不是native平台');
        return;
    }

    if (!args) {
        cc.warn('window.NativeExtensionManager.execute: 没有传递参数');
        return;
    }

    const name = args[0];
    args.splice(0, 1);

    if (!nativeExtension[name]) {
        cc.warn(`window.NativeExtensionManager.execute: 没有找到 ${name} 方法`);
        return;
    }

    nativeExtension[name].apply(null, args);
};

window.NativeExtensionManager.callback = {
    _listener: {},

    addListener(key, callback) {
        this._listener[key] = callback;
    },

    removeListener(key) {
        delete this._listener[key];
    },

    startRecord(data) {
        if (this._listener.startRecord) {
            cc.warn('window.NativeExtensionManager.callback.startRecord: 监听者不存在');
            return;
        }

        this._listener.startRecord(JSON.parse(data));
    },

    startLocation(data) {
        if (this._listener.startRecord) {
            cc.warn('window.NativeExtensionManager.callback.startLocation: 监听者不存在');
            return;
        }

        this._listener.startLocation(JSON.parse(data));
    },
};

