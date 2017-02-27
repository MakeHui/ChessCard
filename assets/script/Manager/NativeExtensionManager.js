
if (cc.sys.os == cc.sys.OS_IOS) {
    const nativeExtension = require("iOSExtension");
}
else if (cc.sys.os == cc.sys.OS_ANDROID) {
    const nativeExtension = require("AndroidExtension");
}

window.NativeExtensionManager = {
    execute: function(methodName) {
        if (!nativeExtension[methodName]) {
            cc.error("window.NativeExtensionManager.execute: 没有找到 " + methodName + "方法");
            return;
        }

        var args = Array.prototype.slice.call(arguments);
        args.splice(0, 1);
        nativeExtension[methodName].apply(this, args);
    }
};