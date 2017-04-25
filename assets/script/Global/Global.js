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
     * 是否是debug环境
     * @type {Boolean}
     */
    debug: true,

    /**
     * 临时数据传递对象
     * @type {object}
     */
    tempCache: null,

    fastChatWaitTime: 0.5,

    fastChatShowTime: 1.5 * 1000,

    hbtTime: 15,

    wsHbtTime: 10,

    aliyunOss: {
        bucketName: 'collegevscollege',
        objectPath: 'px258/client/audio/'
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
        showTrojanScan: 'ShowTrojanScan'
    },

    /**
     * api接口地址
     * @type {Object}
     */
    apiAddress: {
        development: 'http://login.px258.qingwuguo.com/',
        production: 'http://login.px258.qingwuguo.com/'
    },

    /**
     * 音频本地地址
     * @type {Object}
     */
    audioUrl: {
        background: {
            game: 'resources/audio/background/bgm1.mp3',
            menu: 'resources/audio/background/bg_menu.mp3'
        },
        effect: {
            buttonClick: 'resources/audio/effect/sound_button_click.mp3',
            cardOut: 'resources/audio/effect/sound_card_out.mp3',
            dealCard: 'resources/audio/effect/sound_deal_card.mp3',
            ready: 'resources/audio/effect/sound_ready.mp3',
            shaizi: 'resources/audio/effect/sound_shaizi.mp3',
            start: 'resources/audio/effect/sound_start.mp3',
            timeupAlarm: 'resources/audio/effect/sound_timeup_alarm.mp3'
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
            fw_male_7: 'resources/audio/fast_chat/fw_male_7.mp3'
        },
        common: {
            man: {
                0x11: 'resources/audio/game/common/man/card/wan1.mp3',
                0x12: 'resources/audio/game/common/man/card/wan2.mp3',
                0x13: 'resources/audio/game/common/man/card/wan3.mp3',
                0x14: 'resources/audio/game/common/man/card/wan4.mp3',
                0x15: 'resources/audio/game/common/man/card/wan5.mp3',
                0x16: 'resources/audio/game/common/man/card/wan6.mp3',
                0x17: 'resources/audio/game/common/man/card/wan7.mp3',
                0x18: 'resources/audio/game/common/man/card/wan8.mp3',
                0x19: 'resources/audio/game/common/man/card/wan9.mp3',
                0x21: 'resources/audio/game/common/man/card/tong1.mp3',
                0x22: 'resources/audio/game/common/man/card/tong2.mp3',
                0x23: 'resources/audio/game/common/man/card/tong3.mp3',
                0x24: 'resources/audio/game/common/man/card/tong4.mp3',
                0x25: 'resources/audio/game/common/man/card/tong5.mp3',
                0x26: 'resources/audio/game/common/man/card/tong6.mp3',
                0x27: 'resources/audio/game/common/man/card/tong7.mp3',
                0x28: 'resources/audio/game/common/man/card/tong8.mp3',
                0x29: 'resources/audio/game/common/man/card/tong9.mp3',
                0x31: 'resources/audio/game/common/man/card/tiao1.mp3',
                0x32: 'resources/audio/game/common/man/card/tiao2.mp3',
                0x33: 'resources/audio/game/common/man/card/tiao3.mp3',
                0x34: 'resources/audio/game/common/man/card/tiao4.mp3',
                0x35: 'resources/audio/game/common/man/card/tiao5.mp3',
                0x36: 'resources/audio/game/common/man/card/tiao6.mp3',
                0x37: 'resources/audio/game/common/man/card/tiao7.mp3',
                0x38: 'resources/audio/game/common/man/card/tiao8.mp3',
                0x39: 'resources/audio/game/common/man/card/tiao9.mp3',
                0x41: 'resources/audio/game/common/man/card/feng_dong.mp3',
                0x42: 'resources/audio/game/common/man/card/feng_nan.mp3',
                0x43: 'resources/audio/game/common/man/card/feng_xi.mp3',
                0x44: 'resources/audio/game/common/man/card/feng_bei.mp3',
                0x51: 'resources/audio/game/common/man/card/zfb_zhong.mp3',
                0x52: 'resources/audio/game/common/man/card/zfb_fa.mp3',
                0x53: 'resources/audio/game/common/man/card/zfb_bai.mp3',
                chow: 'resources/audio/game/common/man/action/chi.mp3',
                pong: 'resources/audio/game/common/man/action/peng.mp3',
                kong: 'resources/audio/game/common/man/action/gang.mp3',
                ankong: 'resources/audio/game/common/man/action/angang.mp3',
                win: 'resources/audio/game/common/man/action/hu.mp3',
                ting: 'resources/audio/game/common/man/action/ting.mp3',
                zimo: 'resources/audio/game/common/man/action/zimo.mp3'
            },
            woman: {
                0x11: 'resources/audio/game/common/woman/card/wan1.mp3',
                0x12: 'resources/audio/game/common/woman/card/wan2.mp3',
                0x13: 'resources/audio/game/common/woman/card/wan3.mp3',
                0x14: 'resources/audio/game/common/woman/card/wan4.mp3',
                0x15: 'resources/audio/game/common/woman/card/wan5.mp3',
                0x16: 'resources/audio/game/common/woman/card/wan6.mp3',
                0x17: 'resources/audio/game/common/woman/card/wan7.mp3',
                0x18: 'resources/audio/game/common/woman/card/wan8.mp3',
                0x19: 'resources/audio/game/common/woman/card/wan9.mp3',
                0x21: 'resources/audio/game/common/woman/card/tong1.mp3',
                0x22: 'resources/audio/game/common/woman/card/tong2.mp3',
                0x23: 'resources/audio/game/common/woman/card/tong3.mp3',
                0x24: 'resources/audio/game/common/woman/card/tong4.mp3',
                0x25: 'resources/audio/game/common/woman/card/tong5.mp3',
                0x26: 'resources/audio/game/common/woman/card/tong6.mp3',
                0x27: 'resources/audio/game/common/woman/card/tong7.mp3',
                0x28: 'resources/audio/game/common/woman/card/tong8.mp3',
                0x29: 'resources/audio/game/common/woman/card/tong9.mp3',
                0x31: 'resources/audio/game/common/woman/card/tiao1.mp3',
                0x32: 'resources/audio/game/common/woman/card/tiao2.mp3',
                0x33: 'resources/audio/game/common/woman/card/tiao3.mp3',
                0x34: 'resources/audio/game/common/woman/card/tiao4.mp3',
                0x35: 'resources/audio/game/common/woman/card/tiao5.mp3',
                0x36: 'resources/audio/game/common/woman/card/tiao6.mp3',
                0x37: 'resources/audio/game/common/woman/card/tiao7.mp3',
                0x38: 'resources/audio/game/common/woman/card/tiao8.mp3',
                0x39: 'resources/audio/game/common/woman/card/tiao9.mp3',
                0x41: 'resources/audio/game/common/woman/card/feng_dong.mp3',
                0x42: 'resources/audio/game/common/woman/card/feng_nan.mp3',
                0x43: 'resources/audio/game/common/woman/card/feng_xi.mp3',
                0x44: 'resources/audio/game/common/woman/card/feng_bei.mp3',
                0x51: 'resources/audio/game/common/woman/card/zfb_zhong.mp3',
                0x52: 'resources/audio/game/common/woman/card/zfb_fa.mp3',
                0x53: 'resources/audio/game/common/woman/card/zfb_bai.mp3',
                chow: 'resources/audio/game/common/woman/action/chi.mp3',
                pong: 'resources/audio/game/common/woman/action/peng.mp3',
                kong: 'resources/audio/game/common/woman/action/gang.mp3',
                ankong: 'resources/audio/game/common/woman/action/angang.mp3',
                win: 'resources/audio/game/common/woman/action/hu.mp3',
                ting: 'resources/audio/game/common/woman/action/ting.mp3',
                zimo: 'resources/audio/game/common/woman/action/zimo.mp3'
            }
        }
    },

    /**
     * 房间状态吗
     */
    roomStatusCode: {
        InitState: 0, // 初始状态
        ReadyState: 1, // 准备状态
        DealState: 2, // 发牌状态
        StepState: 3, // 玩家出完牌后桌子进入step状态
        WaitState: 4, // 等待状态
        EndState: 5, // 结束状态
        LiujuState: 6, // 流局
        RestartState: 7, // 再来
        SettleForRoundState: 8, // 小结算
        SettleForRoomState: 9 },

    /**
     * 操作类型
     */
    promptType: {
        Chow: 1, // 吃
        Pong: 2, // 碰
        KongConcealed: 3, // 暗杠
        kongExposed: 4, // 明杠
        KongPong: 5, // 碰杠（转弯杠）
        WinDiscard: 6, // 放炮胡
        WinDraw: 7 },

    winType: {
        Pao: -1, // 放炮
        None: 0, // 平局
        Discard: 1, // 点炮胡
        Draw: 2 },

    /**
     * 胡牌类型
     */
    winFlag: {
        PH: '平胡', // 平胡： 即为最普通的胡牌，可吃可碰，可杠，但是在所胡的牌中，必须要有一对 2 或者 5 或者 8 为头才允许胡牌（即“有 258 将的要求”），否则不允许胡牌。

        QYS: '清一色', // 一和子 清一色：不带 258 做头，俗称不带“ 真 将 ”，可吃可碰
        QDZ: '七对子', // 一和子 七对子：无需 258 将的要求
        DDH: '对对胡', // 一和子 对对胡：（有 258 将的要求）举例：“ 222 万， 333 索， 444 筒，东东东， 6 万”，并无听叫，不能胡牌！必须要 是有真将 “ 222 万， 333 索， 444 筒，东东东， 8 万”，听牌只能胡“ 8 万”，其他牌不能胡。再比如：“ 22 万， 333 梭， 444 筒， 777 筒，北北”，听牌只能胡“北风”，其他牌不能胡。 『不管有没有碰或者杠，只要没有吃牌，最后牌型为 4 组刻子（其中允许存在明、暗刻子或者杠）+真将即可』
        LJ: '乱将', // 一和子 乱将：（可碰，无吃牌，即为手上所有的牌都为 2 或者 5 或者 8 ，不论万索筒均可，而无其他任何平和牌的规则，只需全部为 258 即可）举例：“ 2258 万， 225558 索， 288 筒”，听牌能胡“所有的 258 数字的牌，不论万索筒”
        YTL: '一条龙', // 一和子 一条龙：（有 258 将的要求，而且龙不能下水，即龙不能吃，只能最后一张牌胡别人的）举例：“ 12345678 万，吃了 345 筒， 88 索”，听牌能胡“ 9 万”，算一条龙！举例：“ 12378 万，吃了 456 万， 345 筒， 88 索”，听牌胡“ 69 万”，但只能算平胡，不能算一条龙大胡！

        QYSDZJ: '清一色带真将', // 双和子 清一色带真将：有 258 做头，俗称带“真将”，可吃可碰，也有 *2 包牌规则
        LQ: '龙七', // 双和子 龙七：（无 258 将的要求，和普通七对子的唯一区别为：七对子中有四张同样的牌，即称为隆七）举例：“ 2233 万， 2244 索， 8888 筒，中”，听牌胡“中字”，其他牌不能胡。清一色的七对（有无真将相同）。字一色的七对。举例：“ 2233 万， 2244 索， 88 筒，中中中”，听牌胡“中字”，其他牌不能胡。
        SSL: '十三烂', // 双和子 十三烂：（无 258 将的要求，要求非常严格，必须为五个字，万筒索中必须为 147 、 258 、 369 ，不允许重复）举例：“ 147 万， 258 索， 369 万，东南西北”，听牌胡“中发白”，其他牌不能胡。举例：“ 369 万， 14 索， 258 筒，东南西北中”，听牌只能胡“ 7 索”，其他牌不能胡。
        ZYS: '字一色', // 双和子 字一色：（规则类似于乱将，无 258 将要求，只需手中所有牌均为字牌即可，可碰，无吃牌）举例：“东东东东，西西西，南南南，中中白”，听牌胡“任何字牌”
        QYSQD: '清一色七对', // 双和子 清一色七对 ：可带，但不能全是将
        QYSDDH: '清一色对对胡', // 双和子 清一色对对胡 ：( 不带真将 )( 规则如对对胡和清一色 , 但无将做头 )
        JYSQD: '将一色七对', // 双和子 将一色七对
        JYSDDH: '将一色对对胡', // 双和子 将一色对对胡

        QYSDDHDZJ: '清一色对对和带 真 将', // 三和子 清一色对对和带 真 将 （规则同上，只是同时符合三种规则）
        SLQ: '双龙七', // 三和子 双龙七 （无 258 将的要求，和龙七的唯一区别为：七对子中有两个四张同样的牌，即称为双龙七）
        ZYSDDH: '字一色对对和', // 三和子 字一色对对和 （顾名思义）
        QYSYTL: '清一色一条龙', // 三和子 清一色一条龙

        SANLQ: '三龙七', // 四和子 三龙七（顾名思义）
        TH: '天胡', // 四和子 天胡 （即庄家起牌上手十四张牌为胡牌，平胡即可，不累计大胡或者双和子三和子）
        DU: '地胡' },

    // 游戏玩法对应中文名称
    playTypes: {
        100100: {
            playType: {
                0x1: '小胡子胡',
                0x0: '小胡子不可胡'
            },
            options: {
                0x10: '平胡(1番)',
                0x100: '普通大胡(4番)',
                0x1000: '双和子(8番)',
                0x10000: '三和子(16番)',
                0x100000: '四和子(32番)'
            }
        }
    }
};

/**
 * 弹出层
 *
 * @author Make.<makehuir@gmail.com>
 * @datetime 2017-02-14T18:46:33+0800
 *
 * @param node          cc.Node     需要弹出的节点对象
 * @param parentNode    cc.Node     父节点对象
 // * @param callback      Function    回调方法
 */
window.Global.openDialog = function (node, parentNode) {
    var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Function;

    parentNode.addChild(node);

    callback();

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
window.Global.closeDialog = function (node, callback) {
    callback = callback || function () {};

    Animation.closeSceneTransitionAction(node.getChildByName('Dialog'), function () {
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
window.Global.getDeviceId = function () {
    var deviceId = Tools.getLocalData(Global.LSK.deviceId);
    if (deviceId === null) {
        deviceId = md5(+new Date() + Math.random());
        Tools.setLocalData(Global.LSK.deviceId, deviceId);
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
window.Global.cardsSort = function (listView) {
    if (listView.length === 0) {
        cc.log('window.Global.cardsSort: listView 不能为空~');
        return;
    }

    listView.sort(function (nodeA, nodeB) {
        var cardA = Tools.findNode(nodeA, 'Background>value').getComponent(cc.Sprite).spriteFrame._name.replace(/value_0x/, '');
        var cardB = Tools.findNode(nodeB, 'Background>value').getComponent(cc.Sprite).spriteFrame._name.replace(/value_0x/, '');
        return parseInt(cardB, 16) - parseInt(cardA, 16);
    });

    for (var i = 0; i < listView.length; i += 1) {
        listView[i].setLocalZOrder(i);
    }
};