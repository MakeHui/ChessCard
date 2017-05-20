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
            var self = this;

            request.open('POST', (window.Global.Config.debug ? window.Global.Config.apiAddress.development : window.Global.Config.apiAddress.production) + protocol.api);
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.send(message.serializeBinary());
            request.onload = function (event) {
                var result = goog.crypt.base64.decodeStringToUint8Array(request.responseText);
                result = proto[protocol.description][protocol.response + 'Response'].deserializeBinary(result);
                result = self.protobufToJson(result);

                cc.log(['window.Global.NetworkManager.httpRequest.' + protocol.response, result]);
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
         * 链接webSocket
         * @param url
         */
        openSocketLink: function (url) {
            const self = this;
            this._isClose = false;
            this._ws = new WebSocket(url);

            this._ws.onopen = (evt) => {
                self._ws.binaryType = 'arraybuffer';
                self.onopen(evt);
            };

            this._ws.onclose = (evt) => {
                cc.log(['window.Global.NetworkManager.openSocketLink.close', evt, self.ws]);
                if (!self._isClose) {
                    self.onclose(evt);
                    setTimeout(() => {
                        self.openSocketLink(url);
                    }, 3000);
                }
            };

            this._ws.onmessage = (evt) => {
                cc.log(['window.Global.NetworkManager.onmessage: ', evt]);
                const data = self.ArrayBuffer.reader(evt.data);
                if (data === false) {
                    cc.log('window.Global.NetworkManager.onmessage: WebSocket数据解析失败');
                    return;
                }

                const commandName = self.findKeyForValue(data.cmd);
                if (commandName === false) {
                    cc.log('window.Global.NetworkManager.findKeyForValue: 数据解析失败');
                    return;
                }

                const result = self.protobufToJson(proto.game[`${commandName}Response`].deserializeBinary(data.data));
                if (!result) {
                    cc.log('window.Global.NetworkManager.protobufToJson: 数据解析失败');
                    return;
                }

                cc.log([`window.Global.NetworkManager.onmessage.${commandName}: `, result]);
                self.onmessage(commandName, result);
            };
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
         * @param protocol
         * @param parameters
         */
        sendSocketMessage (protocol, parameters = {}) {
            var message = protocol.message(parameters);
            var data = this.ArrayBuffer.writer(protocol.cmd, message.serializeBinary());
            cc.log(['window.Global.NetworkManager.sendMessage.' + protocol.response, protocol, parameters]);
            this._ws.send(data);
        },

        /**
         ***************************************************************************************************************
         *                                      Tools Function
         ***************************************************************************************************************
         */

        /**
         * 通过值查找key
         * @param value
         * @returns {string}
         */
        findKeyForValue (value) {
            for (var key in window.PX258.NetworkConfig.WebSocket) {
                var obj = window.PX258.NetworkConfig.WebSocket[key];
                if (value === obj.cmd) {
                    return obj.response;
                }
            }

            return false;
        },

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
         * protobuf 转 json
         *
         * @author Make.<makehuir@gmail.com>
         * @datetime 2017-02-27 17:19:37
         *
         * @param    {Object} protobuf
         */
        protobufToJson (protobuf) {
            var result = {};
            for (var _name in protobuf) {
                if (_name.substring(0, 3) === 'get') {
                    var data = protobuf[_name]();
                    if (window.Global.Tools.isArray(data)) {
                        var array = [];
                        for (var i = 0; i < data.length; i += 1) {
                            array.push(this.protobufToJson(data[i]));
                        }
                        result[window.Global.Tools.firstLowerCase(_name.substring(3))] = array;
                    } else if (window.Global.Tools.isObject(data)) {
                        result[window.Global.Tools.firstLowerCase(_name.substring(3))] = this.protobufToJson(data);
                    } else {
                        result[window.Global.Tools.firstLowerCase(_name.substring(3))] = data;
                    }
                }
            }

            return result;
        },

    }
});

module.exports = HttpRequestManager;