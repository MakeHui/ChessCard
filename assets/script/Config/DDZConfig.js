const PX258Config = cc.Class({
    extends: cc.Component,

    statics: {

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

            // /** 非法牌型 **/
            // TYPE_ILLEGAL: 0,
            // /** (单张)**/
            // TYPE_SINGLE: 1,
            // /** (火箭[天炸])**/
            // TYPE_SUPER_MISSILE: 2, //
            // /** (一对)**/
            // TYPE_PAIR: 3,
            // /** (三张*X)**/
            // TYPE_THREE: 4,
            // /** (炸弹)**/
            // TYPE_MISSILE: 5,
            // /** (4带1)**/
            // TYPE_FOUR_TAKE_ONE: 6, //
            // /** (4带2)**/
            // TYPE_FOUR_TAKE_TOW: 7,
            // /** (4带3)**/
            // TYPE_FOUR_TAKE_THREE: 12, //
            // /** ((3+1)*X)**/
            // TYPE_THREE_TAKE_ONE: 8,
            // /** ((3+2)*X)**/
            // TYPE_THREE_TAKE_PAIR: 9,
            // /** (连对)**/
            // TYPE_CONTINUE_PAIR: 10,
            // /** (顺子)**/
            // TYPE_CONTINUE_SINGLE: 11,
            // // 王炸 **/
            // // TYPE_JOKERMISSILE = 13,
            //
            // // 牌型权重
            // /** 炸弹**/
            // TYPE_OF_WEIGHT_MISSILE: 10,
            // /** 普通牌型**/
            // TYPE_OF_WEIGHT_NORMAL: 1,
            // /** 王炸**/
            // TYPE_OF_WEIGHT_SUPERMISSILE: 20,
        },
    }
});

module.exports = PX258Config;