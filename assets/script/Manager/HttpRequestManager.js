module.exports = {
    getCheckVersionRequestMessage: function() {
        var message = new proto.login.CheckVersionRequest();
        message.setAppUuid(PX258.appUuid);
        message.setVerNo(PX258.version);
        message.setAndroidOrIos(PX258.os);

        return message;
    },

    getLoginRequestMessage: function(wxCode, location) {
        var message = new proto.login.LoginRequest();
        message.setWxCode(wxCode);
        message.setAppUuid(PX258.appUuid);
        message.setDeviceId(PX258.getDeviceId());
        message.setVerNo(PX258.version);
        message.setLocation(location);
        
        cc.log([wxCode, PX258.appUuid, PX258.getDeviceId(), PX258.version, location]);
        return message;
    },

    httpRequest: function(api, message, callback) {
        var request = cc.loader.getXMLHttpRequest();
        request.open("POST", (PX258.debug ? PX258.apiAddress.development : PX258.production) + api);
        request.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
        request.send(message.serializeBinary());
        request.onload = function(event) {
            var result = goog.crypt.base64.decodeStringToUint8Array(request.responseText);
            callback(event, result);
        };
    }
}