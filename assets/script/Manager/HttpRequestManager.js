module.exports = {
    getCheckVersionRequestMessage: function() {
        var message = new proto.login.CheckVersionRequest();
        message.setAppUuid(Global.appUuid);
        message.setVerNo(Global.version);
        message.setAndroidOrIos(Global.os);

        return message;
    },

    getLoginRequestMessage: function(wxCode, channel, location) {
        var message = new proto.login.LoginRequest();
        message.setWxCode(wxCode);
        message.setChannel(channel);
        message.setAppUuid(Global.appUuid);
        message.setDeviceId(Global.getDeviceId());
        message.setVerNo(Global.version);
        message.setLocation(location);

        return message;
    },

    httpRequest: function(api, message, callback) {
        var request = cc.loader.getXMLHttpRequest();
        request.open("POST", (Global.debug ? Global.apiAddress.development : Global.production) + api);
        request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        request.send(message.serializeBinary());
        request.onload = function(event) {
            var result = goog.crypt.base64.decodeStringToUint8Array(request.responseText);
            callback(event, result);
        };
    }
}