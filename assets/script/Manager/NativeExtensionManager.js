'use strict';

/**
 * 导入对应平台的库文件
 */
var nativeExtension = null;
if (cc.sys.os === cc.sys.OS_IOS) {
    // nativeExtension = require('../Libraries/NativeExtension/iOSExtension');
} else if (cc.sys.os === cc.sys.OS_ANDROID) {
    // nativeExtension = require('../Libraries/NativeExtension/AndroidExtension');
}

window.NativeExtensionManager = {
    _listener: {},

    execute: function execute(name) {
        var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
        var callback = arguments.length <= 2 || arguments[2] === undefined ? Function : arguments[2];

        if (!nativeExtension) {
            Global.log('window.NativeExtensionManager.execute: 不是native平台');
            return;
        }

        if (!args) {
            Global.log('window.NativeExtensionManager.execute: 没有传递参数');
            return;
        }

        if (!nativeExtension[name]) {
            Global.log('window.NativeExtensionManager.execute: 没有找到 ' + name + ' 方法');
            return;
        }

        nativeExtension[name].apply(null, args);
        this._listener[name] = callback;
    },
    callback: function callback(name, result) {
        this._listener[name](result);
        delete this._listener[name];
    }
};