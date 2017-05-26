/**
 * 全局应用相关配置类
 *
 * @author   Make.<makehuir@gmail.com>
 * @link     http://huyaohui.com
 * @link     https://github.com/MakeHui
 *
 * @datetime 2017-02-14 18:53:05
 */

const GlobalConfig = cc.Class({
    extends: cc.Component,

    statics: {
        /**
         * app标识
         * @type {Number}
         */
        appUuid: '100000',

        /**
         * app名称
         * @type {String}
         */
        appName: '萍乡棋牌',

        /**
         * 版本号
         * @type {String}
         */
        version: '1.0.0',

        /**
         * 是否是debug环境
         * @type {Boolean}
         */
        debug: true,

        wxPublic: '萍乡棋牌',

        /**
         * 临时数据传递对象
         * @type {object}
         */
        tempCache: null,

        fastChatWaitTime: 0.5,

        fastChatShowTime: 1.5 * 1000,

        hbtTime: 15,

        wsHbtTime: 10,

        downloadPage: 'http://dashboard.px258.qingwuguo.com/player/download',

        aliyunOss: {
            bucketName: 'pxqp',
            objectPath: 'px258/client/audio/',
            domain: 'https://pxqp.oss-cn-hangzhou.aliyuncs.com/'
        },

        /**
         * 本地存储对应key名
         * @type {Object}
         */
        LSK: {
            deviceId: 'DeviceId',
            userInfo: 'UserInfo',
            secretKey: 'SecretKey',
            userInfo_location: 'UserInfo_Location',
            playMusicConfig: 'PlayMusicConfig',
            appleReview: 'AppleReview',
        },

        /**
         * api接口地址
         * @type {Object}
         */
        apiAddress: {
            development: 'http://login.zhongchendev.com/',
            production: 'http://login.zhongchendev.com/'
        },

        audioUrl: {
            background: {
                game: 'resources/audio/background/bgm1.mp3',
                menu: 'resources/audio/background/bg_menu.mp3'
            },
            effect: {
                buttonClick: 'resources/audio/effect/sound_button_click.mp3',
            },
        }
    }
});

module.exports = GlobalConfig;