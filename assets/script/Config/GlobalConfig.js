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
         * 是否是debug环境
         * @type {Boolean}
         */
        debug: true,

        development: {
            apiAddress: 'http://login.zhongchendev.com/',
            hbtTime: 3000000,
            wsHbtTime: 15000000,

        },

        production: {
            apiAddress: 'https://login.zhongchendev.com/',
            hbtTime: 30,
            wsHbtTime: 15,
        },

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
        version: '2.0.0',

        wxPublic: '盛宸萍乡棋牌',

        /**
         * 临时数据传递对象
         * @type {object}
         */
        tempCache: null,

        fastChatWaitTime: 0.5,

        fastChatShowTime: 1.5 * 1000,

        downloadPage: 'http://m.zhongchendev.com',

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