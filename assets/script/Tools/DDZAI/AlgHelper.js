var FirstOutCardHelper = require('FirstOutCardHelper');
var SolutionHelper = require('SolutionHelper');
var CardTypeHelper = require('CardTypeHelper');

var AlgHelper = cc.Class({
    statics: {
        firstOutCardHelper: new FirstOutCardHelper(),
        solutionHelper: new SolutionHelper(),
        cardTypeHelper: new CardTypeHelper(),
        /**
         * 获取牌的有效值
         * @param rawCardVal
         */
        getCardValue: function(rawCardVal) {
            return rawCardVal & 0xff;
        },

        /**
         * 获取花色
         * @param rawValue
         * @returns {number}
         */
        getCardSuit: function(rawValue) {
            return rawValue >> 8;
        },

        /**
         *获取花色和牌值对象
         * @param rawValue
         * @returns {{suit: number, value: number}}
         */
        getCardVo: function(rawValue) {
            if (rawValue == -1) {
                return { suit: 0, value: -1 };
            }

            var suit = this.getCardSuit(rawValue);
            var value = this.getCardValue(rawValue);
            return { suit: suit, value: value };
        },

        /**
         * 将牌排序
         * @param cards
         */
        orderCard: function(cards) {
            return cards.sort(function(a, b) {
                return this.getCardValue(b) - this.getCardValue(a);
            });
        },

        /**
         * 获取牌型
         * @param rawCards 牌原值数组
         * @returns {ddz.logic.ParseData}
         */
        getCardType: function(rawCards) {
            return this.cardTypeHelper.parse(rawCards);
        },

        /**
         * 获取最先开始出牌时的提示
         * @param rawCards 牌原值数组
         * @returns {Array.<Array>}
         */
        getFirstOutCardSolution: function(rawCards) {
            return this.firstOutCardHelper.parse(rawCards);
        },

        /**
         * 获取应对玩家出牌的解决方案
         * @param {ddz.logic.ParseData} parseData 玩家出牌的牌型数据 通过 ddz.logic.this.getCardType 获得
         * @param selfCards 自己手牌原数据
         * @returns {Array.<Array>}
         */
        getReplyOutCardSolution: function(parseData, selfCards) {
            if (!parseData) return null;
            return this.solutionHelper.parse(parseData, selfCards);
        },

        /**
         * 检测两幅牌是否可以比较
         * @param pd1
         * @param pd2
         */
        checkCanCompare: function(pd1, pd2) {
            if (!pd1 || !pd2) return false;
            if (pd1.typeWeight == pd2.typeWeight) {
                if ((pd1.type == pd2.type) && (pd1.step == pd2.step)) {
                    return true;
                }
            } else {
                return true;
            }
            return false;
        },

        /**
         * 比较 两副牌的大小 (确保两副牌是可以比较的 先调用checkCanCompare进行比较)
         */
        compare: function(pd1, pd2) {
            if (!this.checkCanCompare(pd1, pd2)) return false;
            if (pd1.typeWeight > pd2.typeWeight) {
                return true;
            }
            if (pd1.typeWeight < pd2.typeWeight) {
                return false;
            }
            if (pd1.typeWeight == pd2.typeWeight) {
                if (pd1.startCard > pd2.startCard) {
                    return true;
                }
            }
            return false;
        },

        /**
         * 获取牌形数组 用于出牌排序
         */
        getPDOrderArr: function() {

        }
    }
});

module.exports = AlgHelper;