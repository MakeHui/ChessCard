const HttpRequestManager = cc.Class({
    extends: cc.Component,

    statics: {
        /**
         * http请求方法
         *
         * @param protocol
         * @param parameters
         * @param callback
         */
        httpRequest (protocol, parameters, callback) {
            var message = protocol.message(parameters);
            var request = cc.loader.getXMLHttpRequest();

            request.open('POST', (window.Global.Config.debug ? window.Global.Config.apiAddress.development : window.Global.Config.apiAddress.production) + protocol.api);
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.send(message.serializeBinary());
            request.onload = function (event) {
                var result = goog.crypt.base64.decodeStringToUint8Array(request.responseText);
                result = proto[protocol.description][protocol.response + 'Response'].deserializeBinary(result);
                result = window.Global.Tools.protobufToJson(result);

                cc.log(['window.Global.NetworkManager.httpRequest ' + name, result]);
                callback(event, result);
            };
        },


        /**
         ***************************************************************************************************************
         *                                      WebSocket 管理器
         ***************************************************************************************************************
         **/

        _ws: {},
        _isClose: false,
        onmessage: function () {},
        onopen: function () {},
        onclose: function () {},

        /**
         * socket 数据封包解包
         */
        ArrayBuffer: {
            _packageStack: null,

            reader: function reader(buffer) {
                if (this._packageStack) {
                    buffer = this.mergeArrayBuffer([this._packageStack, buffer]);
                    this._packageStack = null;
                }

                var dataView = new DataView(buffer);
                var size = dataView.getInt32(0);
                if (buffer.byteLength >= size) {
                    var cmd = dataView.getInt32(4);
                    var data = buffer.slice(8, size);

                    var other = buffer.slice(size);
                    if (other.byteLength !== 0) {
                        this.reader(buffer);
                    }

                    return { cmd: cmd, data: data };
                } else if (buffer.byteLength < size) {
                    this._packageStack = buffer;
                    return false;
                }

                cc.log(['没有数据包: ']);
                return false;
            },
            writer: function writer(cmd, message) {
                //         size + cmd + message
                var size = 4 + 4 + message.byteLength;
                var arrayBuffer = new ArrayBuffer(8);
                var dataView = new DataView(arrayBuffer);
                dataView.setUint32(0, size);
                dataView.setUint32(4, cmd);

                return this.mergeArrayBuffer([arrayBuffer, message]);
            },


            /**
             * 合并buffer
             * @param bufferList
             * @returns {*}
             */
            mergeArrayBuffer: function mergeArrayBuffer(bufferList) {
                var size = 0;
                for (var i = 0; i < bufferList.length; i += 1) {
                    size += bufferList[i].byteLength;
                }

                if (size === 0) {
                    cc.log('mergeArrayBuffer byte number is 0');
                    return false;
                }

                var index = 0;
                var uint8Array = new Uint8Array(size);
                for (var _i = 0; _i < bufferList.length; _i += 1) {
                    uint8Array.set(new Uint8Array(bufferList[_i]), index);
                    index = bufferList[_i].byteLength;
                }

                return uint8Array.buffer;
            }
        },

        /**
         * 链接webSocket
         * @param url
         */
        openSocketLink: function (url) {
            const self = this;
            this._isClose = false;
            this._ws = new WebSocket(url);

            this._ws.onopen = (evt) => {
                this.binaryType = 'arraybuffer';
                self.onopen(evt);
            };

            this._ws.onclose = (evt) => {
                cc.log(['window.WebSocketManager.openSocketLink.close', evt, self.ws]);
                if (!self._isClose) {
                    self.onclose(evt);
                    setTimeout(() => {
                        self.openSocketLink(url);
                    }, 3000);
                }
            };

            this._ws.onmessage = this.onmessage;
        },

        close () {
            this._isClose = true;
            this._ws.close();
        },

        /**
         * 查询webSocket 状态
         * @returns {boolean}
         */
        getSocketState: function () {
            return this._ws.readyState === WebSocket.CONNECTING || this._ws.readyState === WebSocket.OPEN;
        },

        /**
         * 发送 socket 消息
         *
         * @param webSocket WebSocket
         * @param name
         */
        sendSocketMessage (webSocket, name) {
            var parameters = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            var message = WebSocketManager.requestMessage['get' + name + 'RequestMessage'](parameters);
            var data = WebSocketManager.ArrayBuffer.writer(WebSocketManager.Command[name], message.serializeBinary());
            cc.log(['WebSocketManager.sendMessage.' + name, parameters]);
            webSocket.send(data);
        }
    }
});

module.exports = HttpRequestManager;