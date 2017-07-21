var CardsInspect = require('CardsInspect');
var ParseData = require('ParseData');

/** 牌型类型解析 helper **/
var CardTypeHelper = cc.Class({
    ctor: function() {
        var parseSingle = CardsInspect.parseSingle;
        var parsePair = CardsInspect.parsePair;
        var parseContinuePair = CardsInspect.parseContinuePair;
        var parseContinueSingle = CardsInspect.parseContinueSingle;
        var parseMissile = CardsInspect.parseMissile;
        var parseThreeTakeTwo = CardsInspect.parseThreeTakeTwo;
        var parseThreeTakeOne = CardsInspect.parseThreeTakeOne;
        var parseThree = CardsInspect.parseThree;
        var superMissile = CardsInspect.superMissile;
        var parseFourTakeTwo = CardsInspect.parseFourTakeTwo;
        this._processQueue = [
            [], // 0
            [parseSingle], // 1
            [parsePair, superMissile], // 2
            [parseThree], // 3
            [parseMissile, parseThreeTakeOne], // 4
            [parseContinueSingle, parseThreeTakeTwo], // 5
            [parseContinueSingle, parseContinuePair, parseThree, parseFourTakeTwo], // 6
            [parseContinueSingle], // 7
            [parseContinueSingle, parseContinuePair, parseThreeTakeOne, parseFourTakeTwo], // 8
            [parseContinueSingle, parseThree], // 9
            [parseContinueSingle, parseContinuePair, parseThreeTakeTwo], // 10
            [parseContinueSingle], // 11
            [parseContinueSingle, parseContinuePair, parseThreeTakeOne, parseThree], // 12
            [], // 13
            [parseContinuePair], // 14
            [parseThreeTakeTwo, parseThree], // 15
            [parseContinuePair, parseThreeTakeOne], // 16
            [], // 17
            [parseContinuePair, parseThree], // 18
            [], // 19
            [parseContinuePair, parseThreeTakeOne, parseThreeTakeTwo] // 20
        ];
    },

    /**
     * @param rawCards
     * @returns {ParseData}
     */
    parse: function(rawCards) {
        var pd = new ParseData();
        pd.cards = rawCards;
        pd.parseDataFormat = this.genAlgArr(rawCards);
        var len = pd.cards.length;
        var i;
        var parser = this._processQueue[len];
        cc.log(len);
        if (!parser) return pd;
        len = parser.length;
        for (i = 0; i < len; i++) {
            if (parser[i](pd)) {
                cc.log(i);
                break;
            }
        }
        return pd;
    },

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
});

module.exports = CardTypeHelper;