const PX258Config = cc.Class({
    extends: cc.Component,

    statics: {

        /**
         * 音频本地地址
         * @type {Object}
         */
        audioUrl: {
            background: 'resources/audio/game/ddz/bgm1.mp3',
            effect: {
                comm_deal_sound: 'resources/audio/effect/ddz/comm_deal_sound.mp3',
                comm_enter: 'resources/audio/effect/ddz/comm_enter.mp3',
                comm_left: 'resources/audio/effect/ddz/comm_left.mp3',
                comm_liuju: 'resources/audio/effect/ddz/comm_liuju.mp3',
                comm_lose: 'resources/audio/effect/ddz/comm_lose.mp3',
                comm_ready: 'resources/audio/effect/ddz/comm_ready.mp3',
                comm_timeup_alarm: 'resources/audio/effect/ddz/comm_timeup_alarm.mp3',
                comm_win: 'resources/audio/effect/ddz/comm_win.mp3',
                start: 'resources/audio/effect/ddz/start.mp3'
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
                    dz_259: 'resources/audio/game/ddz/man/male_pk_3.mp3', // 单张黑桃3
                    dz_260: 'resources/audio/game/ddz/man/male_pk_4.mp3', // 单张黑桃4
                    dz_261: 'resources/audio/game/ddz/man/male_pk_5.mp3', // 单张黑桃5
                    dz_262: 'resources/audio/game/ddz/man/male_pk_6.mp3', // 单张黑桃6
                    dz_263: 'resources/audio/game/ddz/man/male_pk_7.mp3', // 单张黑桃7
                    dz_264: 'resources/audio/game/ddz/man/male_pk_8.mp3', // 单张黑桃8
                    dz_265: 'resources/audio/game/ddz/man/male_pk_9.mp3', // 单张黑桃9
                    dz_266: 'resources/audio/game/ddz/man/male_pk_10.mp3', // 单张黑桃10
                    dz_267: 'resources/audio/game/ddz/man/male_pk_11.mp3', // 单张黑桃J
                    dz_268: 'resources/audio/game/ddz/man/male_pk_12.mp3', // 单张黑桃Q
                    dz_269: 'resources/audio/game/ddz/man/male_pk_13.mp3', // 单张黑桃K
                    dz_270: 'resources/audio/game/ddz/man/male_pk_14.mp3', // 单张黑桃A
                    dz_271: 'resources/audio/game/ddz/man/male_pk_15.mp3', // 单张黑桃2
                    dz_515: 'resources/audio/game/ddz/man/male_pk_3.mp3', // 单张红心3
                    dz_516: 'resources/audio/game/ddz/man/male_pk_4.mp3', // 单张红心4
                    dz_517: 'resources/audio/game/ddz/man/male_pk_5.mp3', // 单张红心5
                    dz_518: 'resources/audio/game/ddz/man/male_pk_6.mp3', // 单张红心6
                    dz_519: 'resources/audio/game/ddz/man/male_pk_7.mp3', // 单张红心7
                    dz_520: 'resources/audio/game/ddz/man/male_pk_8.mp3', // 单张红心8
                    dz_521: 'resources/audio/game/ddz/man/male_pk_9.mp3', // 单张红心9
                    dz_522: 'resources/audio/game/ddz/man/male_pk_10.mp3', // 单张红心10
                    dz_523: 'resources/audio/game/ddz/man/male_pk_11.mp3', // 单张红心J
                    dz_524: 'resources/audio/game/ddz/man/male_pk_12.mp3', // 单张红心Q
                    dz_525: 'resources/audio/game/ddz/man/male_pk_13.mp3', // 单张红心K
                    dz_526: 'resources/audio/game/ddz/man/male_pk_14.mp3', // 单张红心A
                    dz_527: 'resources/audio/game/ddz/man/male_pk_15.mp3', // 单张红心2
                    dz_771: 'resources/audio/game/ddz/man/male_pk_3.mp3', // 单张梅花3
                    dz_772: 'resources/audio/game/ddz/man/male_pk_4.mp3', // 单张梅花4
                    dz_773: 'resources/audio/game/ddz/man/male_pk_5.mp3', // 单张梅花5
                    dz_774: 'resources/audio/game/ddz/man/male_pk_6.mp3', // 单张梅花6
                    dz_775: 'resources/audio/game/ddz/man/male_pk_7.mp3', // 单张梅花7
                    dz_776: 'resources/audio/game/ddz/man/male_pk_8.mp3', // 单张梅花8
                    dz_777: 'resources/audio/game/ddz/man/male_pk_9.mp3', // 单张梅花9
                    dz_778: 'resources/audio/game/ddz/man/male_pk_10.mp3', // 单张梅花10
                    dz_779: 'resources/audio/game/ddz/man/male_pk_11.mp3', // 单张梅花J
                    dz_780: 'resources/audio/game/ddz/man/male_pk_12.mp3', // 单张梅花Q
                    dz_781: 'resources/audio/game/ddz/man/male_pk_13.mp3', // 单张梅花K
                    dz_782: 'resources/audio/game/ddz/man/male_pk_14.mp3', // 单张梅花A
                    dz_783: 'resources/audio/game/ddz/man/male_pk_15.mp3', // 单张梅花2
                    dz_1027: 'resources/audio/game/ddz/man/male_pk_3.mp3', // 单张方块3
                    dz_1028: 'resources/audio/game/ddz/man/male_pk_4.mp3', // 单张方块4
                    dz_1029: 'resources/audio/game/ddz/man/male_pk_5.mp3', // 单张方块5
                    dz_1030: 'resources/audio/game/ddz/man/male_pk_6.mp3', // 单张方块6
                    dz_1031: 'resources/audio/game/ddz/man/male_pk_7.mp3', // 单张方块7
                    dz_1032: 'resources/audio/game/ddz/man/male_pk_8.mp3', // 单张方块8
                    dz_1033: 'resources/audio/game/ddz/man/male_pk_9.mp3', // 单张方块9
                    dz_1034: 'resources/audio/game/ddz/man/male_pk_10.mp3', // 单张方块10
                    dz_1035: 'resources/audio/game/ddz/man/male_pk_11.mp3', // 单张方块J
                    dz_1036: 'resources/audio/game/ddz/man/male_pk_12.mp3', // 单张方块Q
                    dz_1037: 'resources/audio/game/ddz/man/male_pk_13.mp3', // 单张方块K
                    dz_1038: 'resources/audio/game/ddz/man/male_pk_14.mp3', // 单张方块A
                    dz_1039: 'resources/audio/game/ddz/man/male_pk_15.mp3', // 单张方块2
                    dz_1296: 'resources/audio/game/ddz/man/male_pk_16.mp3', // 小王
                    dz_1297: 'resources/audio/game/ddz/man/male_pk_17.mp3', // 大王
                    // 对子
                    dui_259: 'resources/audio/game/ddz/man/male_dui3.mp3', // 对黑桃3
                    dui_260: 'resources/audio/game/ddz/man/male_dui4.mp3', // 对黑桃4
                    dui_261: 'resources/audio/game/ddz/man/male_dui5.mp3', // 对黑桃5
                    dui_262: 'resources/audio/game/ddz/man/male_dui6.mp3', // 对黑桃6
                    dui_263: 'resources/audio/game/ddz/man/male_dui7.mp3', // 对黑桃7
                    dui_264: 'resources/audio/game/ddz/man/male_dui8.mp3', // 对黑桃8
                    dui_265: 'resources/audio/game/ddz/man/male_dui9.mp3', // 对黑桃9
                    dui_266: 'resources/audio/game/ddz/man/male_dui10.mp3', // 对黑桃10
                    dui_267: 'resources/audio/game/ddz/man/male_dui11.mp3', // 对黑桃J
                    dui_268: 'resources/audio/game/ddz/man/male_dui12.mp3', // 对黑桃Q
                    dui_269: 'resources/audio/game/ddz/man/male_dui13.mp3', // 对黑桃K
                    dui_270: 'resources/audio/game/ddz/man/male_dui14.mp3', // 对黑桃A
                    dui_271: 'resources/audio/game/ddz/man/male_dui15.mp3', // 对黑桃2
                    dui_515: 'resources/audio/game/ddz/man/male_dui3.mp3', // 对红心3
                    dui_516: 'resources/audio/game/ddz/man/male_dui4.mp3', // 对红心4
                    dui_517: 'resources/audio/game/ddz/man/male_dui5.mp3', // 对红心5
                    dui_518: 'resources/audio/game/ddz/man/male_dui6.mp3', // 对红心6
                    dui_519: 'resources/audio/game/ddz/man/male_dui7.mp3', // 对红心7
                    dui_520: 'resources/audio/game/ddz/man/male_dui8.mp3', // 对红心8
                    dui_521: 'resources/audio/game/ddz/man/male_dui9.mp3', // 对红心9
                    dui_522: 'resources/audio/game/ddz/man/male_dui10.mp3', // 对红心10
                    dui_523: 'resources/audio/game/ddz/man/male_dui11.mp3', // 对红心J
                    dui_524: 'resources/audio/game/ddz/man/male_dui12.mp3', // 对红心Q
                    dui_525: 'resources/audio/game/ddz/man/male_dui13.mp3', // 对红心K
                    dui_526: 'resources/audio/game/ddz/man/male_dui14.mp3', // 对红心A
                    dui_527: 'resources/audio/game/ddz/man/male_dui15.mp3', // 对红心2
                    dui_771: 'resources/audio/game/ddz/man/male_dui3.mp3', // 对梅花3
                    dui_772: 'resources/audio/game/ddz/man/male_dui4.mp3', // 对梅花4
                    dui_773: 'resources/audio/game/ddz/man/male_dui5.mp3', // 对梅花5
                    dui_774: 'resources/audio/game/ddz/man/male_dui6.mp3', // 对梅花6
                    dui_775: 'resources/audio/game/ddz/man/male_dui7.mp3', // 对梅花7
                    dui_776: 'resources/audio/game/ddz/man/male_dui8.mp3', // 对梅花8
                    dui_777: 'resources/audio/game/ddz/man/male_dui9.mp3', // 对梅花9
                    dui_778: 'resources/audio/game/ddz/man/male_dui10.mp3', // 对梅花10
                    dui_779: 'resources/audio/game/ddz/man/male_dui11.mp3', // 对梅花J
                    dui_780: 'resources/audio/game/ddz/man/male_dui12.mp3', // 对梅花Q
                    dui_781: 'resources/audio/game/ddz/man/male_dui13.mp3', // 对梅花K
                    dui_782: 'resources/audio/game/ddz/man/male_dui14.mp3', // 对梅花A
                    dui_783: 'resources/audio/game/ddz/man/male_dui15.mp3', // 对梅花2
                    dui_1027: 'resources/audio/game/ddz/man/male_dui3.mp3', // 对方块3
                    dui_1028: 'resources/audio/game/ddz/man/male_dui4.mp3', // 对方块4
                    dui_1029: 'resources/audio/game/ddz/man/male_dui5.mp3', // 对方块5
                    dui_1030: 'resources/audio/game/ddz/man/male_dui6.mp3', // 对方块6
                    dui_1031: 'resources/audio/game/ddz/man/male_dui7.mp3', // 对方块7
                    dui_1032: 'resources/audio/game/ddz/man/male_dui8.mp3', // 对方块8
                    dui_1033: 'resources/audio/game/ddz/man/male_dui9.mp3', // 对方块9
                    dui_1034: 'resources/audio/game/ddz/man/male_dui10.mp3', // 对方块10
                    dui_1035: 'resources/audio/game/ddz/man/male_dui11.mp3', // 对方块J
                    dui_1036: 'resources/audio/game/ddz/man/male_dui12.mp3', // 对方块Q
                    dui_1037: 'resources/audio/game/ddz/man/male_dui13.mp3', // 对方块K
                    dui_1038: 'resources/audio/game/ddz/man/male_dui14.mp3', // 对方块A
                    dui_1039: 'resources/audio/game/ddz/man/male_dui15.mp3', // 对方块2
                    // 其它
                    baojing1: 'resources/audio/game/ddz/man/male_baojing1.mp3', // 我就一张牌啦
                    baojing2: 'resources/audio/game/ddz/man/male_baojing2.mp3', // 我就两张牌啦
                    buyao1: 'resources/audio/game/ddz/man/male_buyao1.mp3', // 不要
                    buyao2: 'resources/audio/game/ddz/man/male_buyao2.mp3', // PASS
                    buyao3: 'resources/audio/game/ddz/man/male_buyao3.mp3', // 过
                    buyao4: 'resources/audio/game/ddz/man/male_buyao4.mp3', // 要不起
                    dani1: 'resources/audio/game/ddz/man/male_dani1.mp3', // 大你
                    dani2: 'resources/audio/game/ddz/man/male_dani2.mp3', // 管上
                    dani3: 'resources/audio/game/ddz/man/male_dani3.mp3', // 押死
                    feiji: 'resources/audio/game/ddz/man/male_feiji.mp3', // 飞机
                    liandui: 'resources/audio/game/ddz/man/male_liandui.mp3', // 连对
                    noOrder: 'resources/audio/game/ddz/man/male_noOrder.mp3', // 不叫
                    noRob: 'resources/audio/game/ddz/man/male_noRob.mp3', // 不抢
                    order: 'resources/audio/game/ddz/man/male_order.mp3', // 叫地主
                    rob1: 'resources/audio/game/ddz/man/male_rob1.mp3', // 抢地主
                    sandaiyi: 'resources/audio/game/ddz/man/male_sandaiyi.mp3', // 三带一
                    sandaiyidui: 'resources/audio/game/ddz/man/male_sandaiyidui.mp3', // 三带一对
                    sange: 'resources/audio/game/ddz/man/male_sange.mp3', // 三个
                    shunzi: 'resources/audio/game/ddz/man/male_shunzi.mp3', // 顺子
                    sidaier: 'resources/audio/game/ddz/man/male_sidaier.mp3', // 四带二
                    wangzha: 'resources/audio/game/ddz/man/male_wangzha.mp3', // 王炸
                    win: 'resources/audio/game/ddz/man/male_win.mp3', // 我赢了
                    xianchu: 'resources/audio/game/ddz/man/male_xianchu.mp3', // 我先出
                    zhadan: 'resources/audio/game/ddz/man/male_zhadan.mp3', //炸弹
                },
                woman: {
                    dz_259: 'resources/audio/game/ddz/man/female_pk_3.mp3', // 单张黑桃3
                    dz_260: 'resources/audio/game/ddz/man/female_pk_4.mp3', // 单张黑桃4
                    dz_261: 'resources/audio/game/ddz/man/female_pk_5.mp3', // 单张黑桃5
                    dz_262: 'resources/audio/game/ddz/man/female_pk_6.mp3', // 单张黑桃6
                    dz_263: 'resources/audio/game/ddz/man/female_pk_7.mp3', // 单张黑桃7
                    dz_264: 'resources/audio/game/ddz/man/female_pk_8.mp3', // 单张黑桃8
                    dz_265: 'resources/audio/game/ddz/man/female_pk_9.mp3', // 单张黑桃9
                    dz_266: 'resources/audio/game/ddz/man/female_pk_10.mp3', // 单张黑桃10
                    dz_267: 'resources/audio/game/ddz/man/female_pk_11.mp3', // 单张黑桃J
                    dz_268: 'resources/audio/game/ddz/man/female_pk_12.mp3', // 单张黑桃Q
                    dz_269: 'resources/audio/game/ddz/man/female_pk_13.mp3', // 单张黑桃K
                    dz_270: 'resources/audio/game/ddz/man/female_pk_14.mp3', // 单张黑桃A
                    dz_271: 'resources/audio/game/ddz/man/female_pk_15.mp3', // 单张黑桃2
                    dz_515: 'resources/audio/game/ddz/man/female_pk_3.mp3', // 单张红心3
                    dz_516: 'resources/audio/game/ddz/man/female_pk_4.mp3', // 单张红心4
                    dz_517: 'resources/audio/game/ddz/man/female_pk_5.mp3', // 单张红心5
                    dz_518: 'resources/audio/game/ddz/man/female_pk_6.mp3', // 单张红心6
                    dz_519: 'resources/audio/game/ddz/man/female_pk_7.mp3', // 单张红心7
                    dz_520: 'resources/audio/game/ddz/man/female_pk_8.mp3', // 单张红心8
                    dz_521: 'resources/audio/game/ddz/man/female_pk_9.mp3', // 单张红心9
                    dz_522: 'resources/audio/game/ddz/man/female_pk_10.mp3', // 单张红心10
                    dz_523: 'resources/audio/game/ddz/man/female_pk_11.mp3', // 单张红心J
                    dz_524: 'resources/audio/game/ddz/man/female_pk_12.mp3', // 单张红心Q
                    dz_525: 'resources/audio/game/ddz/man/female_pk_13.mp3', // 单张红心K
                    dz_526: 'resources/audio/game/ddz/man/female_pk_14.mp3', // 单张红心A
                    dz_527: 'resources/audio/game/ddz/man/female_pk_15.mp3', // 单张红心2
                    dz_771: 'resources/audio/game/ddz/man/female_pk_3.mp3', // 单张梅花3
                    dz_772: 'resources/audio/game/ddz/man/female_pk_4.mp3', // 单张梅花4
                    dz_773: 'resources/audio/game/ddz/man/female_pk_5.mp3', // 单张梅花5
                    dz_774: 'resources/audio/game/ddz/man/female_pk_6.mp3', // 单张梅花6
                    dz_775: 'resources/audio/game/ddz/man/female_pk_7.mp3', // 单张梅花7
                    dz_776: 'resources/audio/game/ddz/man/female_pk_8.mp3', // 单张梅花8
                    dz_777: 'resources/audio/game/ddz/man/female_pk_9.mp3', // 单张梅花9
                    dz_778: 'resources/audio/game/ddz/man/female_pk_10.mp3', // 单张梅花10
                    dz_779: 'resources/audio/game/ddz/man/female_pk_11.mp3', // 单张梅花J
                    dz_780: 'resources/audio/game/ddz/man/female_pk_12.mp3', // 单张梅花Q
                    dz_781: 'resources/audio/game/ddz/man/female_pk_13.mp3', // 单张梅花K
                    dz_782: 'resources/audio/game/ddz/man/female_pk_14.mp3', // 单张梅花A
                    dz_783: 'resources/audio/game/ddz/man/female_pk_15.mp3', // 单张梅花2
                    dz_1027: 'resources/audio/game/ddz/man/female_pk_3.mp3', // 单张方块3
                    dz_1028: 'resources/audio/game/ddz/man/female_pk_4.mp3', // 单张方块4
                    dz_1029: 'resources/audio/game/ddz/man/female_pk_5.mp3', // 单张方块5
                    dz_1030: 'resources/audio/game/ddz/man/female_pk_6.mp3', // 单张方块6
                    dz_1031: 'resources/audio/game/ddz/man/female_pk_7.mp3', // 单张方块7
                    dz_1032: 'resources/audio/game/ddz/man/female_pk_8.mp3', // 单张方块8
                    dz_1033: 'resources/audio/game/ddz/man/female_pk_9.mp3', // 单张方块9
                    dz_1034: 'resources/audio/game/ddz/man/female_pk_10.mp3', // 单张方块10
                    dz_1035: 'resources/audio/game/ddz/man/female_pk_11.mp3', // 单张方块J
                    dz_1036: 'resources/audio/game/ddz/man/female_pk_12.mp3', // 单张方块Q
                    dz_1037: 'resources/audio/game/ddz/man/female_pk_13.mp3', // 单张方块K
                    dz_1038: 'resources/audio/game/ddz/man/female_pk_14.mp3', // 单张方块A
                    dz_1039: 'resources/audio/game/ddz/man/female_pk_15.mp3', // 单张方块2
                    dz_1296: 'resources/audio/game/ddz/man/female_pk_16.mp3', // 小王
                    dz_1297: 'resources/audio/game/ddz/man/female_pk_17.mp3', // 大王
                    // 对子
                    dui_259: 'resources/audio/game/ddz/man/female_dui3.mp3', // 对黑桃3
                    dui_260: 'resources/audio/game/ddz/man/female_dui4.mp3', // 对黑桃4
                    dui_261: 'resources/audio/game/ddz/man/female_dui5.mp3', // 对黑桃5
                    dui_262: 'resources/audio/game/ddz/man/female_dui6.mp3', // 对黑桃6
                    dui_263: 'resources/audio/game/ddz/man/female_dui7.mp3', // 对黑桃7
                    dui_264: 'resources/audio/game/ddz/man/female_dui8.mp3', // 对黑桃8
                    dui_265: 'resources/audio/game/ddz/man/female_dui9.mp3', // 对黑桃9
                    dui_266: 'resources/audio/game/ddz/man/female_dui10.mp3', // 对黑桃10
                    dui_267: 'resources/audio/game/ddz/man/female_dui11.mp3', // 对黑桃J
                    dui_268: 'resources/audio/game/ddz/man/female_dui12.mp3', // 对黑桃Q
                    dui_269: 'resources/audio/game/ddz/man/female_dui13.mp3', // 对黑桃K
                    dui_270: 'resources/audio/game/ddz/man/female_dui14.mp3', // 对黑桃A
                    dui_271: 'resources/audio/game/ddz/man/female_dui15.mp3', // 对黑桃2
                    dui_515: 'resources/audio/game/ddz/man/female_dui3.mp3', // 对红心3
                    dui_516: 'resources/audio/game/ddz/man/female_dui4.mp3', // 对红心4
                    dui_517: 'resources/audio/game/ddz/man/female_dui5.mp3', // 对红心5
                    dui_518: 'resources/audio/game/ddz/man/female_dui6.mp3', // 对红心6
                    dui_519: 'resources/audio/game/ddz/man/female_dui7.mp3', // 对红心7
                    dui_520: 'resources/audio/game/ddz/man/female_dui8.mp3', // 对红心8
                    dui_521: 'resources/audio/game/ddz/man/female_dui9.mp3', // 对红心9
                    dui_522: 'resources/audio/game/ddz/man/female_dui10.mp3', // 对红心10
                    dui_523: 'resources/audio/game/ddz/man/female_dui11.mp3', // 对红心J
                    dui_524: 'resources/audio/game/ddz/man/female_dui12.mp3', // 对红心Q
                    dui_525: 'resources/audio/game/ddz/man/female_dui13.mp3', // 对红心K
                    dui_526: 'resources/audio/game/ddz/man/female_dui14.mp3', // 对红心A
                    dui_527: 'resources/audio/game/ddz/man/female_dui15.mp3', // 对红心2
                    dui_771: 'resources/audio/game/ddz/man/female_dui3.mp3', // 对梅花3
                    dui_772: 'resources/audio/game/ddz/man/female_dui4.mp3', // 对梅花4
                    dui_773: 'resources/audio/game/ddz/man/female_dui5.mp3', // 对梅花5
                    dui_774: 'resources/audio/game/ddz/man/female_dui6.mp3', // 对梅花6
                    dui_775: 'resources/audio/game/ddz/man/female_dui7.mp3', // 对梅花7
                    dui_776: 'resources/audio/game/ddz/man/female_dui8.mp3', // 对梅花8
                    dui_777: 'resources/audio/game/ddz/man/female_dui9.mp3', // 对梅花9
                    dui_778: 'resources/audio/game/ddz/man/female_dui10.mp3', // 对梅花10
                    dui_779: 'resources/audio/game/ddz/man/female_dui11.mp3', // 对梅花J
                    dui_780: 'resources/audio/game/ddz/man/female_dui12.mp3', // 对梅花Q
                    dui_781: 'resources/audio/game/ddz/man/female_dui13.mp3', // 对梅花K
                    dui_782: 'resources/audio/game/ddz/man/female_dui14.mp3', // 对梅花A
                    dui_783: 'resources/audio/game/ddz/man/female_dui15.mp3', // 对梅花2
                    dui_1027: 'resources/audio/game/ddz/man/female_dui3.mp3', // 对方块3
                    dui_1028: 'resources/audio/game/ddz/man/female_dui4.mp3', // 对方块4
                    dui_1029: 'resources/audio/game/ddz/man/female_dui5.mp3', // 对方块5
                    dui_1030: 'resources/audio/game/ddz/man/female_dui6.mp3', // 对方块6
                    dui_1031: 'resources/audio/game/ddz/man/female_dui7.mp3', // 对方块7
                    dui_1032: 'resources/audio/game/ddz/man/female_dui8.mp3', // 对方块8
                    dui_1033: 'resources/audio/game/ddz/man/female_dui9.mp3', // 对方块9
                    dui_1034: 'resources/audio/game/ddz/man/female_dui10.mp3', // 对方块10
                    dui_1035: 'resources/audio/game/ddz/man/female_dui11.mp3', // 对方块J
                    dui_1036: 'resources/audio/game/ddz/man/female_dui12.mp3', // 对方块Q
                    dui_1037: 'resources/audio/game/ddz/man/female_dui13.mp3', // 对方块K
                    dui_1038: 'resources/audio/game/ddz/man/female_dui14.mp3', // 对方块A
                    dui_1039: 'resources/audio/game/ddz/man/female_dui15.mp3', // 对方块2
                    // 其它
                    baojing1: 'resources/audio/game/ddz/man/female_baojing1.mp3', // 我就一张牌啦
                    baojing2: 'resources/audio/game/ddz/man/female_baojing2.mp3', // 我就两张牌啦
                    buyao1: 'resources/audio/game/ddz/man/female_buyao1.mp3', // 不要
                    buyao2: 'resources/audio/game/ddz/man/female_buyao2.mp3', // PASS
                    buyao3: 'resources/audio/game/ddz/man/female_buyao3.mp3', // 过
                    buyao4: 'resources/audio/game/ddz/man/female_buyao4.mp3', // 要不起
                    dani1: 'resources/audio/game/ddz/man/female_dani1.mp3', // 大你
                    dani2: 'resources/audio/game/ddz/man/female_dani2.mp3', // 管上
                    dani3: 'resources/audio/game/ddz/man/female_dani3.mp3', // 押死
                    feiji: 'resources/audio/game/ddz/man/female_feiji.mp3', // 飞机
                    liandui: 'resources/audio/game/ddz/man/female_liandui.mp3', // 连对
                    noOrder: 'resources/audio/game/ddz/man/female_noOrder.mp3', // 不叫
                    noRob: 'resources/audio/game/ddz/man/female_noRob.mp3', // 不抢
                    order: 'resources/audio/game/ddz/man/female_order.mp3', // 叫地主
                    rob1: 'resources/audio/game/ddz/man/female_rob1.mp3', // 抢地主
                    sandaiyi: 'resources/audio/game/ddz/man/female_sandaiyi.mp3', // 三带一
                    sandaiyidui: 'resources/audio/game/ddz/man/female_sandaiyidui.mp3', // 三带一对
                    sange: 'resources/audio/game/ddz/man/female_sange.mp3', // 三个
                    shunzi: 'resources/audio/game/ddz/man/female_shunzi.mp3', // 顺子
                    sidaier: 'resources/audio/game/ddz/man/female_sidaier.mp3', // 四带二
                    wangzha: 'resources/audio/game/ddz/man/female_wangzha.mp3', // 王炸
                    win: 'resources/audio/game/ddz/man/female_win.mp3', // 我赢了
                    xianchu: 'resources/audio/game/ddz/man/female_xianchu.mp3', // 我先出
                    zhadan: 'resources/audio/game/ddz/man/female_zhadan.mp3', //炸弹
                }
            }
        },

        /**
         * 房间状态码
         */
        roomStatusCode: {
            InitState: 0,  // 初始
            ReadyState: 1,  // 准备
            DealState: 2,  // 发牌
            RobState: 3,  // 抢地主
            WaitState: 4,  // 等待
            StepState: 5,  // 一圈出牌中
            EndState: 6,  // 结束
            RestartState: 7,  // 重置
            SettleForRoundState: 8,  // 小结算
            SettleForRoomState: 9,  // 大结算
        },

        /**
         * 斗地主
         */
        cardType: {
            ERRO: 0,  // 非法
            DANZ: 1,  // 单张
            YDUI: 2,  // 一对
            SANZ: 3,  // 三张牌（什么也不带）
            SDYI: 4,  // 三带一（带一张单牌）
            SDER: 5,  // 三带二（带一对）
            DANS: 6,  // 单顺子
            LDUI: 7,  // 连对（双顺子）
            SANS: 8,  // 三顺子，飞机（什么都不带）
            SSDY: 9,  // 三顺子，飞机（带单牌）
            SSDE: 10,  // 三顺子，飞机（带对）
            ZHAD: 11,  // 炸弹
            HUOJ: 12,  // 王炸，火箭
            SDLZ: 13,  // 四带二（带两张单牌）
            SDLD: 14,  // 四带二（带两对）
            PASS: 15,  // pass
        },
    }
});

module.exports = PX258Config;