/**
 * 全局工具类
 *
 * @author   Make.<makehuir@gmail.com>
 * @link     http://huyaohui.com
 * @link     https://github.com/MakeHui
 *
 * @datetime 2017-02-14 18:51:29
 */
window.Tools = {};

/**
 * 删除数组中的值
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-14T18:36:18+0800
 *
 * @param    {array}                 array 待删除的数组
 * @param    {value}                 value 
 * @return   {bool}
 */
window.Tools.removeArrayInValue = function(array, value) {
    let index = ToolKit.indexOf(arrar, value);
    if (index > -1) {
		arrar.splice(index, 1);
        return true;
	}
    
    return false;
};

/**
 * 递归查询当前节点下的指定名称的子节点
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-14T18:37:45+0800
 *
 * @param    {node}                 node 父节点
 * @param    {string}                 name 子节点名称
 * @return   {node}
 */
window.Tools.seekNodeByName = function(node, name) {
    let children = node.children;
    for (let i = 0; i < children.length; ++i) {
        cc.log(children[i].name);
        if (children[i].name !== name) {
            var childrenNode = window.Tools.seekNodeByName(children[i], name);
            if (childrenNode) {
                return node;
            }
        }
        else {
            return children[i];
        }
    }
};

/**
 * 获取本地存储数据
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-14T18:39:14+0800
 *
 * @param    {string}                 key 存储本地数据的key
 * @return   {any}
 */
window.Tools.getLocalData = function(key) {
    var data = cc.sys.localStorage.getItem(key); //从本地读取数据

    return data ? JSON.parse(data) : null;
};

/**
 * 存储数据到本地
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-14T18:40:22+0800
 *
 * @param    {string}                 key  
 * @param    {any}                 data 
 */
window.Tools.setLocalData = function(key, data) {
    cc.sys.localStorage.setItem(key, JSON.stringify(data));
};

window.Tools.setWebImage = function(sprite, url) {
    cc.loader.load(url, function(err, texture) {
        if(err){
            cc.log(err);
        }
        else {
            sprite.spriteFrame = new cc.SpriteFrame(texture);
        }
    });
};

/**
 * 音频管理
 * @type {Object}
 */
window.Tools.audioEngine = {
    audioId: null,

    init: function(audioUrl, isLoop, volume) {
        this.audioRaw = audioUrl ? cc.url.raw(audioUrl) : null;
        this.isLoop = isLoop || false;
        this.volume = volume || 1;

        return clone(this);
    },

    play: function() {
        // if (this.audioId === null) {
            this.audioId = cc.audioEngine.play(this.audioRaw, this.isLoop, this.volume);
        // }
        // else if (this.state() !== 1) {
        //     cc.audioEngine.resume(this.audioId);
        // }
    },

    stop: function() {
        cc.audioEngine.pause(this.audioId);
    },

    state: function() {
        return cc.audioEngine.getState(this.audioId);
    },

    setAudioRaw: function(audioUrl) {
        this.audioRaw = cc.url.raw(audioUrl);
        return this;
    }
};

/**
 * 删除一个对象
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-14T19:08:03+0800
 *
 * @param    {object}                 obj 
 */
window.Tools.destroy = function(obj) {
    obj = null;
    delete obj;
};

/**
 * 日期格式化
 * url: http://blog.csdn.net/vbangle/article/details/5643091/
 * author: meizz   
 *
 * 对Date的扩展，将 Date 转化为指定格式的String   
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
 * 例子：   
 * (new Date()).Format("yyyy-MM-dd hh:ii:ss.S") ==> 2006-07-02 08:09:04.423   
 * (new Date()).Format("yyyy-M-d h:i:s.S")      ==> 2006-7-2 8:9:4.18   
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-15T22:22:55+0800
 *
 * @param    {int|string|object}    datetime
 * @param    {string}               formatString
 * 
 * @return   {string}
 */
window.Tools.formatDatetime = function(formatString, datetime) {
    datetime = datetime || new Date();
    datetime = typeof datetime === 'object' ? datetime : new Date(datetime);

    var o = {   
        "M+" : datetime.getMonth()+1,                 //月份   
        "d+" : datetime.getDate(),                    //日   
        "h+" : datetime.getHours(),                   //小时   
        "i+" : datetime.getMinutes(),                 //分   
        "s+" : datetime.getSeconds(),                 //秒   
        "q+" : Math.floor((datetime.getMonth()+3)/3), //季度   
        "S"  : datetime.getMilliseconds()             //毫秒   
    };   
    if(/(y+)/.test(formatString)) {
        formatString = formatString.replace(RegExp.$1, (datetime.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(formatString)) {
            formatString = formatString.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
        }
    }
    return formatString;   
};

/**
 * 截屏
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-16T18:44:00+0800
 *
 * @param    {node}                 node     需要截取的节点
 * @param    {Function}               callback
 * @param    {string}                 fileName 保存的名称
 */
window.Tools.captureScreen = function(node, callback, fileName) {
    fileName = fileName || "temp.jpg";

    //注意，EditBox，VideoPlayer，Webview 等控件无法截图

    if(CC_JSB) {
        //如果待截图的场景中含有 mask，请开启下面注释的语句
        var renderTexture = cc.RenderTexture.create(node.width, node.height, cc.Texture2D.PIXEL_FORMAT_RGBA8888, gl.DEPTH24_STENCIL8_OES);
        // var renderTexture = cc.RenderTexture.create(node.width, node.height);

        //把 renderTexture 添加到场景中去，否则截屏的时候，场景中的元素会移动
        node.parent._sgNode.addChild(renderTexture);
        //把 renderTexture 设置为不可见，可以避免截图成功后，移除 renderTexture 造成的闪烁
        renderTexture.setVisible(false);

        //实际截屏的代码
        renderTexture.begin();
        //this.richText.node 是我们要截图的节点，如果要截整个屏幕，可以把 this.richText 换成 Canvas 切点即可
        node._sgNode.visit();
        renderTexture.end();
        renderTexture.saveToFile(fileName, cc.IMAGE_FORMAT_JPEG, true, function () {
            //把 renderTexture 从场景中移除
            renderTexture.removeFromParent();
            cc.log("capture screen successfully!");

            callback(jsb.fileUtils.getWritablePath() + fileName);
        });
    }
};

/**
 * 获取本地prefab资源
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-22 15:25:58
 *
 * @param    {string}                 name     需要获取的名称
 * @param    {Function}               callback
 * @param    {string}                 fileName 保存的名称
 */
window.Tools.loadPrefab = function(name, callback) {
    cc.loader.loadRes("prefab/" + name, cc.Prefab, function (error, prefab) {
        if (error) {
            cc.error("window.Tools.loadPrefab: 获取失败~, error: " + error);
            return;
        }
        callback(prefab);
    });
};