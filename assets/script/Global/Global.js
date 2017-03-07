
/**
 * 全局应用相关配置类
 *
 * @author   Make.<makehuir@gmail.com>
 * @link     http://huyaohui.com
 * @link     https://github.com/MakeHui
 *
 * @datetime 2017-02-14 18:53:05
 */

window.Global = {
    /**
     * app标识
     * @type {Number}
     */
    appUuid: '100000',

    /**
     * app名称
     * @type {String}
     */
    appName: '萍乡258',

    /**
     * 版本号
     * @type {String}
     */
    version: '0.0.1',

    /**
     * 操作系统
     * @type {[type]}
     */
    os: cc.sys.os === cc.sys.OS_IOS ? 1 : 0,

    /**
     * 是否是debug环境
     * @type {Boolean}
     */
    debug: true,

    /**
     * 临时数据传递对象
     * @type {object}
     */
    tempCache: null,

    /**
     * 背景音乐管理对象
     * @type {object}
     */
    backgroundMusic: null,

    fastChatWaitTime: 0.5,

    fastChatShowTime: 1.5 * 1000,

    /**
     * 本地存储对应key名
     * @type {Object}
     */
    localStorageKey: {
        deviceId: 'DeviceId',
        userInfo: 'UserInfo',
    },

    /**
     * 场景对应名称
     * @type {Object}
     */
    scene: {
        login: 'Login',
        lobby: 'Lobby',
    },

    /**
     * api接口地址
     * @type {Object}
     */
    apiAddress: {
        development: 'http://login.px258.qingwuguo.com/',
        production: 'http://login.px258.qingwuguo.com/',
    },

    /**
     * 音频本地地址
     * @type {Object}
     */
    audioResourcesUrl: {
        background: {
            game: 'resources/audio/background/bgm1.mp3',
            menu: 'resources/audio/background/bg_menu.mp3',
        },
        effect: {
            sound_button_click: 'resources/audio/effect/sound_button_click.mp3',
            sound_card_out: 'resources/audio/effect/sound_card_out.mp3',
            sound_deal_card: 'resources/audio/effect/sound_deal_card.mp3',
            sound_ready: 'resources/audio/effect/sound_ready.mp3',
            sound_shaizi: 'resources/audio/effect/sound_shaizi.mp3',
            sound_start: 'resources/audio/effect/sound_start.mp3',
            sound_timeup_alarm: 'resources/audio/effect/sound_timeup_alarm.mp3',
        },
        fastChat: {
            fw_female_0: 'resources/audio/fast_chat/fw_female_0.mp3',
            fw_female_1: 'resources/audio/fast_chat/fw_female_1.mp3',
            fw_female_2: 'resources/audio/fast_chat/fw_female_2.mp3',
            fw_female_3: 'resources/audio/fast_chat/fw_female_3.mp3',
            fw_female_4: 'resources/audio/fast_chat/fw_female_4.mp3',
            fw_female_5: 'resources/audio/fast_chat/fw_female_5.mp3',
            fw_female_6: 'resources/audio/fast_chat/fw_female_6.mp3',
            fw_female_7: 'resources/audio/fast_chat/fw_female_7.mp3',
            fw_male_0: 'resources/audio/fast_chat/fw_male_0.mp3',
            fw_male_1: 'resources/audio/fast_chat/fw_male_1.mp3',
            fw_male_2: 'resources/audio/fast_chat/fw_male_2.mp3',
            fw_male_3: 'resources/audio/fast_chat/fw_male_3.mp3',
            fw_male_4: 'resources/audio/fast_chat/fw_male_4.mp3',
            fw_male_5: 'resources/audio/fast_chat/fw_male_5.mp3',
            fw_male_6: 'resources/audio/fast_chat/fw_male_6.mp3',
            fw_male_7: 'resources/audio/fast_chat/fw_male_7.mp3',
        },
        game: {
            common: {
                card_man10: 'resources/audio/game/common/card_man10.mp3',
                card_man11: 'resources/audio/game/common/card_man11.mp3',
                card_man12: 'resources/audio/game/common/card_man12.mp3',
                card_man13: 'resources/audio/game/common/card_man13.mp3',
                card_man14: 'resources/audio/game/common/card_man14.mp3',
                card_man15: 'resources/audio/game/common/card_man15.mp3',
                card_man16: 'resources/audio/game/common/card_man16.mp3',
                card_man17: 'resources/audio/game/common/card_man17.mp3',
                card_man18: 'resources/audio/game/common/card_man18.mp3',
                card_man19: 'resources/audio/game/common/card_man19.mp3',
                card_man21: 'resources/audio/game/common/card_man21.mp3',
                card_man22: 'resources/audio/game/common/card_man22.mp3',
                card_man23: 'resources/audio/game/common/card_man23.mp3',
                card_man24: 'resources/audio/game/common/card_man24.mp3',
                card_man25: 'resources/audio/game/common/card_man25.mp3',
                card_man26: 'resources/audio/game/common/card_man26.mp3',
                card_man27: 'resources/audio/game/common/card_man27.mp3',
                card_man28: 'resources/audio/game/common/card_man28.mp3',
                card_man29: 'resources/audio/game/common/card_man29.mp3',
                card_man31: 'resources/audio/game/common/card_man31.mp3',
                card_man32: 'resources/audio/game/common/card_man32.mp3',
                card_man33: 'resources/audio/game/common/card_man33.mp3',
                card_man34: 'resources/audio/game/common/card_man34.mp3',
                card_man35: 'resources/audio/game/common/card_man35.mp3',
                card_man36: 'resources/audio/game/common/card_man36.mp3',
                card_man37: 'resources/audio/game/common/card_man37.mp3',
                card_man38: 'resources/audio/game/common/card_man38.mp3',
                card_man39: 'resources/audio/game/common/card_man39.mp3',
                card_man_dianpao: 'resources/audio/game/common/card_man_dianpao.mp3',
                card_man_gang: 'resources/audio/game/common/card_man_gang.mp3',
                card_man_hu: 'resources/audio/game/common/card_man_hu.mp3',
                card_man_peng: 'resources/audio/game/common/card_man_peng.mp3',
                card_man_peng1: 'resources/audio/game/common/card_man_peng1.mp3',
                card_man_zimo: 'resources/audio/game/common/card_man_zimo.mp3',
                card_woman10: 'resources/audio/game/common/card_woman10.mp3',
                card_woman11: 'resources/audio/game/common/card_woman11.mp3',
                card_woman12: 'resources/audio/game/common/card_woman12.mp3',
                card_woman13: 'resources/audio/game/common/card_woman13.mp3',
                card_woman14: 'resources/audio/game/common/card_woman14.mp3',
                card_woman15: 'resources/audio/game/common/card_woman15.mp3',
                card_woman16: 'resources/audio/game/common/card_woman16.mp3',
                card_woman17: 'resources/audio/game/common/card_woman17.mp3',
                card_woman18: 'resources/audio/game/common/card_woman18.mp3',
                card_woman19: 'resources/audio/game/common/card_woman19.mp3',
                card_woman21: 'resources/audio/game/common/card_woman21.mp3',
                card_woman22: 'resources/audio/game/common/card_woman22.mp3',
                card_woman23: 'resources/audio/game/common/card_woman23.mp3',
                card_woman24: 'resources/audio/game/common/card_woman24.mp3',
                card_woman25: 'resources/audio/game/common/card_woman25.mp3',
                card_woman26: 'resources/audio/game/common/card_woman26.mp3',
                card_woman27: 'resources/audio/game/common/card_woman27.mp3',
                card_woman28: 'resources/audio/game/common/card_woman28.mp3',
                card_woman29: 'resources/audio/game/common/card_woman29.mp3',
                card_woman31: 'resources/audio/game/common/card_woman31.mp3',
                card_woman32: 'resources/audio/game/common/card_woman32.mp3',
                card_woman33: 'resources/audio/game/common/card_woman33.mp3',
                card_woman34: 'resources/audio/game/common/card_woman34.mp3',
                card_woman35: 'resources/audio/game/common/card_woman35.mp3',
                card_woman36: 'resources/audio/game/common/card_woman36.mp3',
                card_woman37: 'resources/audio/game/common/card_woman37.mp3',
                card_woman38: 'resources/audio/game/common/card_woman38.mp3',
                card_woman39: 'resources/audio/game/common/card_woman39.mp3',
                card_woman_dianpao: 'resources/audio/game/common/card_woman_dianpao.mp3',
                card_woman_gang: 'resources/audio/game/common/card_woman_gang.mp3',
                card_woman_hu: 'resources/audio/game/common/card_woman_hu.mp3',
                card_woman_peng: 'resources/audio/game/common/card_woman_peng.mp3',
                card_woman_peng1: 'resources/audio/game/common/card_woman_peng1.mp3',
                card_woman_zimo: 'resources/audio/game/common/card_woman_zimo.mp3',
            },
        },
    },
};

/**
 * 弹出层
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-14T18:46:33+0800
 *
 * @param    {cc.Node}                 node     需要弹出的节点对象
 * @param    {cc.Node}                 parentNode 父节点对象
 * @param    {function}               callback   执行完毕后的回调方法
 */
window.Global.openDialog = (node, parentNode, callback) => {
    parentNode.addChild(node);

    // Animation.openSceneTransitionAction(node.getChildByName('Dialog'), callback);
};

/**
 * 关闭弹出层
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-14T18:47:30+0800
 *
 * @param    {cc.Node}                 node     需要关闭的节点对象
 * @param    {Function}               callback 自行完毕后的回调方法
 */
window.Global.closeDialog = (node, callback) => {
    callback = callback || (() => {});

    Animation.closeSceneTransitionAction(node.getChildByName('Dialog'), () => {
        node.destroy();
        callback();
    });
};

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
window.Global.getDeviceId = () => {
    let deviceId = cc.sys.localStorage.getItem(window.Global.localStorageKey.deviceId);
    if (deviceId === null) {
        deviceId = md5(+new Date() + Math.random());
        cc.sys.localStorage.setItem(window.Global.localStorageKey.deviceId, deviceId);
    }
    return deviceId;
};

/**
 * 手牌排序
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-21 18:49:45
 *
 * @param {Array} listView
 */
window.Global.cardsSort = (listView) => {
    if (listView.length === 0) {
        cc.error('window.Global.cardsSort: listView 不能为空~');
        return;
    }

    const lastNode = listView[0];
    listView.sort();
    for (let i = 0; i < listView.length; i += 1) {
        listView[i].setLocalZOrder(i);
    }
    lastNode.setLocalZOrder(-1);
};

/**
 * loading控制器
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-27 15:04:48
 */
window.Global.loading = {
    loadingNode: null,

    open: (node) => {
        const self = this;
        window.Tools.loadPrefab('Loading', (prefab) => {
            self.loadingNode = cc.instantiate(prefab);
            self._open(node);
        });

        cc.director.getScheduler().schedule(() => {
            self.close();
        }, this, 30, 0);
    },

    _open: (node) => {
        node.addChild(this.loadingNode);
    },

    close: () => {
        this.loadingNode.destroy();
    },
};

/**
 * 检查应用更新
 */
window.Global.checkUpdate = () => {
};

/**
 * 应用初始化需要自行的操作
 *
 * @param {Object} args
 */
window.Global.appInit = (args) => {
    if (args.checkUpdate) {
        Global.checkUpdate.apply(this, args.checkUpdate);
    }
    else {
        cc.log('window.Global.appInit: checkUpdate 参数不存在');
    }
};
