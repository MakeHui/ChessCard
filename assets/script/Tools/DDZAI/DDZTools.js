/**
 * 牌值
 * 3~15代表扑克牌的3到2
 * 16小王，17大王
 * 牌用于计算的存储结构
 [
    0,0,0,
    0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,//3~2
 ];
 **/

var DDZTools = cc.Class({
    statics: {
        /**
         * 生成用于计算的结构数组
         * @param rawCardArr
         */
        genAlgArr: function(rawCardArr) {
            var arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            var i;
            var len = rawCardArr.length;
            var temp;
            for (i = 0; i < len; i++) {
                temp = rawCardArr[i] & 0xff;
                arr[temp]++;
            }
            return arr;
        },

        checkSingle: function(baseCardArray) {
            var cardUIArray = game.pdkTable.cardCtrl.handCardCtrl.cardGroupContainer.cardUIArray;
            var okCardArray = [];
            for (var i = cardUIArray.length - 1; i >= 0; i--) {
                if (cardUIArray[i].cardV > ddz.logic.AlgHelper.getCardValue(baseCardArray[0])) {
                    okCardArray.push(cardUIArray[i]);
                }
            }
            return okCardArray;
        },

        checkPairs: function(baseCardArray) {
            var cardUIArray = game.pdkTable.cardCtrl.handCardCtrl.cardGroupContainer.cardUIArray;
            if (cardUIArray.length < 2) {
                return false;
            }
        },

        printRawCards: function(cards) {
            if (!cards) return;
            var len = cards.length;
            for (var i = 0; i < len; i++) {
                cc.log("rawcard:" + cards[i] + " cardV:" + (cards[i] & 0xff));
            }
        }
    }
});

module.exports = DDZTools;