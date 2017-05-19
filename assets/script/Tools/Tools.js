var Tools = cc.Class({
    extends: cc.Component,

    /**
     * 获取设备id
     * 这里只是简单的生成了一个随机的id, 并保存在了本地
     * 当重新登录后会重新生成
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-14T18:48:54+0800
     *
     * @return   {string}
     */
    getDeviceId: function () {
        var deviceId = this.getLocalData(GlobalConfig.LSK.deviceId);
        if (deviceId === null) {
            deviceId = md5(+new Date() + Math.random());
            this.setLocalData(GlobalConfig.LSK.deviceId, deviceId);
        }
        return deviceId;
    },

    /**
     * 手牌排序
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-21 18:49:45
     *
     * @param {Array} listView
     */
    cardsSort: function (listView) {
        if (listView.length === 0) {
            cc.log('cardsSort: listView 不能为空~');
            return;
        }

        listView.sort(function (nodeA, nodeB) {
            return nodeB._userData - nodeA._userData;
        });

        for (var i = 0; i < listView.length; i += 1) {
            listView[i].setLocalZOrder(i);
        }
    },

    /**
     * 删除数组中的值
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-14T18:36:18+0800
     *
     * @param    {Array}                 array 待删除的数组
     * @param    {value}                 value
     * @return   {Boolean}
     */
    removeArrayInValue: function (array, value) {
        var index = array.indexOf(value);
        if (index > -1) {
            array.splice(index, 1);
            return true;
        }

        return false;
    },

    /**
     * 递归查询当前节点下的指定名称的子节点
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-14T18:37:45+0800
     *
     * @param    {cc.Node}                 node 父节点
     * @param    {string}                  path 子节点名称
     * @return   {cc.Node}
     */
    findNode: function (node, path) {
        path = path.split('>');

        for (var i = 0; i < path.length; i += 1) {
            node = this._findNode(node, path[i]);
            if (node === false) {
                return false;
            }
        }

        return node;
    },

    _findNode: function (node, name) {
        return node.getChildByName(name) || false;
    },

    /**
     * 获取本地存储数据
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-14T18:39:14+0800
     *
     * @param    {string}                 key 存储本地数据的key
     * @return   {Object}
     */
    getLocalData: function (key) {
        var data = cc.sys.localStorage.getItem(key); // 从本地读取数据

        return data ? JSON.parse(data) : null;
    },

    /**
     * 存储数据到本地
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-14T18:40:22+0800
     *
     * @param    {string}                 key
     * @param    {Object}                 data
     */
    setLocalData: function (key, data) {
        cc.sys.localStorage.setItem(key, JSON.stringify(data));
    },

    /**
     * 获取并设置网络图片
     *
     * @param {cc.Sprite} sprite
     * @param url
     */
    setWebImage: function (sprite, url) {
        if (!url) {
            cc.log(['setWebImage', 'url 不存在']);
            return;
        }
        cc.loader.load(url, function (err, texture) {
            if (err) {
                cc.log(err);
            } else {
                sprite.spriteFrame = new cc.SpriteFrame(texture);
            }
        });
    },

    /**
     * 日期格式化
     * url: http://blog.csdn.net/vbangle/article/details/5643091/
     * author: meizz
     *
     * 对Date的扩展，将 Date 转化为指定格式的String
     * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
     * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
     * 例子：
     * (new Date()).Format('yyyy-MM-dd hh:ii:ss.S') ==> 2006-07-02 08:09:04.423
     * (new Date()).Format('yyyy-M-d h:i:s.S')      ==> 2006-7-2 8:9:4.18
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-15T22:22:55+0800
     *
     * @param    {int|string|Date}    datetime
     * @param    {string}               formatString
     *
     * @return   {string}
     */
    formatDatetime: function (formatString, datetime) {
        datetime = datetime || new Date();
        datetime = typeof datetime === 'object' ? datetime : new Date(datetime);

        var o = {
            'M+': datetime.getMonth() + 1, // 月份
            'd+': datetime.getDate(), // 日
            'h+': datetime.getHours(), // 小时
            'i+': datetime.getMinutes(), // 分
            's+': datetime.getSeconds(), // 秒
            'q+': Math.floor((datetime.getMonth() + 3) / 3), // 季度
            S: datetime.getMilliseconds() };
        // 毫秒
        if (/(y+)/.test(formatString)) {
            formatString = formatString.replace(RegExp.$1, datetime.getFullYear().toString().substr(4 - RegExp.$1.length));
        }

        for (var k in o) {
            if (new RegExp('(' + k + ')').test(formatString)) {
                formatString = formatString.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(o[k].toString().length));
            }
        }
        return formatString;
    },

    /**
     * 截屏
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-16T18:44:00+0800
     *
     * @param    {cc.Node}                 node     需要截取的节点
     * @param    {Function}               callback
     * @param    {string}                 fileName 保存的名称
     */
    captureScreen: function (node, callback, fileName) {
        fileName = fileName || 'temp.png';

        // 注意，EditBox，VideoPlayer，Webview 等控件无法截图

        if (CC_JSB) {
            (function () {
                // 如果待截图的场景中含有 mask，请开启下面注释的语句
                cc.log(JSON.stringify([node.width, node.height, cc.Texture2D.PIXEL_FORMAT_RGBA8888, gl.DEPTH24_STENCIL8_OES]));
                var renderTexture = cc.RenderTexture(node.width, node.height, cc.Texture2D.PIXEL_FORMAT_RGBA8888, gl.DEPTH24_STENCIL8_OES);
                // var renderTexture = cc.RenderTexture.create(node.width, node.height);
                // 把 renderTexture 添加到场景中去，否则截屏的时候，场景中的元素会移动
                node.parent._sgNode.addChild(renderTexture);
                // 把 renderTexture 设置为不可见，可以避免截图成功后，移除 renderTexture 造成的闪烁
                renderTexture.setVisible(false);

                // 实际截屏的代码
                renderTexture.begin();
                // this.richText.node 是我们要截图的节点，如果要截整个屏幕，可以把 this.richText 换成 Canvas 切点即可
                node._sgNode.visit();
                renderTexture.end();
                renderTexture.saveToFile(fileName, cc.ImageFormat.JPG, true, function () {
                    // 把 renderTexture 从场景中移除
                    renderTexture.removeFromParent();
                    cc.log('capture screen successfully! path: ' + jsb.fileUtils.getWritablePath() + fileName);

                    callback(jsb.fileUtils.getWritablePath() + fileName);
                });
            })();
        }
    },

    /**
     * 获取本地prefab资源
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-22 15:25:58
     *
     * @param    {string}                 name     需要获取的名称
     * @param    {Object}                 type
     * @param    {Function}               callback
     */
    loadRes: function (name, type, callback) {
        var folder = '';
        if (type === cc.Prefab) {
            folder = 'prefab';
        } else if (type === cc.SpriteFrame) {
            folder = 'Texture';
        }

        cc.loader.loadRes(folder + '/' + name, type, function (error, resource) {
            if (error) {
                cc.log('loadRes: 获取失败~, error: ' + error);
                return;
            }
            callback(resource);
        });
    },

    /**
     * 创建一个绑定待绑定的handler
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-23 16:08:50
     *
     * @param    {cc.Node}                 node     这个 node 节点是你的事件处理代码组件所属的节点
     * @param    {string}               component 这个是代码文件名
     * @param    {string}               handler 响应事件函数名
     * @param    {string}               customEventData 自定义事件数据
     */
    createEventHandler: function (node, component, handler, customEventData) {
        var eventHandler = new cc.Component.EventHandler();
        eventHandler.target = node;
        eventHandler.component = component;
        eventHandler.handler = handler;
        eventHandler.customEventData = customEventData;

        return eventHandler;
    },

    /**
     * 字符串首字母大写
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-27 17:19:37
     *
     * @param    {string}                 str
     */
    firstUpperCase: function (str) {
        return str.replace(/\b[a-z]/g, function (s) {
            return s.toUpperCase();
        });
    },

    /**
     * 字符串首字母小写
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-27 17:19:37
     *
     * @param    {string}                 str
     */
    firstLowerCase: function (str) {
        return str.replace(/^\S/g, function (s) {
            return s.toLowerCase();
        });
    },

    /**
     * protobuf 转 json
     *
     * @author Make.<makehuir@gmail.com>
     * @datetime 2017-02-27 17:19:37
     *
     * @param    {Object} protobuf
     */
    protobufToJson: function (protobuf) {
        var result = {};
        for (var _name in protobuf) {
            if (_name.substring(0, 3) === 'get') {
                var data = protobuf[_name]();
                if (this.isArray(data)) {
                    var array = [];
                    for (var i = 0; i < data.length; i += 1) {
                        array.push(this.protobufToJson(data[i]));
                    }
                    result[this.firstLowerCase(_name.substring(3))] = array;
                } else if (this.isObject(data)) {
                    result[this.firstLowerCase(_name.substring(3))] = this.protobufToJson(data);
                } else {
                    result[this.firstLowerCase(_name.substring(3))] = data;
                }
            }
        }

        return result;
    },

    /**
     * 通过值查找key
     * @param {Object} obj
     * @param value
     * @returns {string}
     */
    findKeyForValue: function (obj, value) {
        for (var key in obj) {
            if (value === obj[key]) {
                return key;
            }
        }
        return false;
    },

    unique: function (array) {
        return Array.from(new Set(array));
    },

    isArray: function (object) {
        return Object.prototype.toString.call(object) === '[object Array]';
    },

    isObject: function (object) {
        return Object.prototype.toString.call(object) === '[object Object]';
    },

    createWechatShareInfo(info, roomId) {
        // 游戏玩法
        const playTypes = window.PX258Config.playTypes[info.game_uuid];
        info.options = `0x${info.options.toString(16)}`;
        const num = info.options & 0x1;

        var title = playTypes.name + ': ' + roomId;
        var description = '局数: ' + info.max_rounds + '局' + `, 玩法: ${playTypes.playType[num]}, 封顶: ${playTypes.options[info.options ^ num]}`;

        return [title, description];
    },

    groupByIp: function (data) {
        var group = {};
        for (var i = 0; i < data.length; i++) {
            if (!group[data[i].info.ip]) {
                group[data[i].info.ip] = [];
            }
            group[data[i].info.ip].push(data[i].info);
        }

        for (var key in group) {
            if (group[key].length > 1) {
                return group[key];
            }
        }
        return [];
    }

});

module.exports = Tools;