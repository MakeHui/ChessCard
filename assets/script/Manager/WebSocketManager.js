window.webSocketManager = {
    _socket: null,
    
    _onopenListener: [],

    _onmessageListener: [],

    _onerrorListener: [],

    _oncloseListener: [],

    _openSocket: function(url) {
        this._socket = new WebSocket(url);
        let self = this;

        this._socket.onopen = function(evt) {
            for (let i = 0; i < self._onopenListener.length; i++) {
                self._onopenListener[i](evt)
            }
            cc.log("onopen: " + evt);
        };

        this._socket.onmessage = function(evt) {
            for (let i = 0; i < self._onmessageListener.length; i++) {
                self._onmessageListener[i](evt)
            }
            cc.log("onmessage: " + evt.data);
        };

        this._socket.onerror = function(evt) {
            for (let i = 0; i < self._onerrorListener.length; i++) {
                self._onerrorListener[i](evt)
            }
            cc.log("onerror: " + evt);
        };

        this._socket.onclose = function(evt) {
            for (let i = 0; i < self._oncloseListener.length; i++) {
                self._oncloseListener[i](evt)
            }
            cc.log("onclose: " + evt);
        };
    },

    openSocket: function(url) {
        if (this._socket) {
            if (this._socket.readyState == WebSocket.CONNECTING 
                || this._socket.readyState == WebSocket.OPEN) {
                this.closeSocket();
            }
        }
        this._openSocket(url);
    },

    closeSocket: function() {
        this._socket.close();
    },

    sendSocket: function(data) {
        this._socket.send(data);
    },

    addOnopenListener: function(listner) {
        this._onopenListener.push(listner);
    },

    addOnmessageListener: function(listner) {
        this._onmessageListener.push(listner);
    },

    addOnerrorListener: function(listner) {
        this._onerrorListener.push(listner);
    },

    addOncloseListener: function(listner) {
        this._oncloseListener.push(listner);
    },

    removeOnopenListener: function(listner) {
        Global.removeArrayInValue(this._onopenListener, listner);
    },

    removeOnmessageListener: function(listner) {
        Global.removeArrayInValue(this._onmessageListener, listner);
    },

    removeOnerrorListener: function(listner) {
        Global.removeArrayInValue(this._onerrorListener, listner);
    },

    removeOncloseListener: function(listner) {
        Global.removeArrayInValue(this._oncloseListener, listner);
    },

};