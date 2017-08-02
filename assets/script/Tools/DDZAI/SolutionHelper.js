/**
 * 应对玩家出牌提示
 */

var CardsInspect = require('CardsInspect');

var SolutionPlan = cc.Class({

    /**
     * @param {ParseData} outCard
     * @param {Array} selfCards
     */
    parse: function(outCard, selfCards) {
        var solution = [];
        this.parseData = outCard;
        this.selfCardArr = selfCards;
        this.getParseDataFormat();

        /** @type{Array} **/
        var tempSolution = null;
        tempSolution = this.getNormalSolution();
        if (tempSolution) solution = tempSolution;
        tempSolution = this.getMissile();
        if (tempSolution) solution = solution.concat(tempSolution);
        tempSolution = this.getSuperMissile();
        if (tempSolution) solution = solution.concat(tempSolution);
        return solution;
    },

    /**
     * 获取普通方案 提供子类重写
     * @returns {Array}
     */
    getNormalSolution: function() {
        return null;
    },

    getSuperMissile: function() {
        var result = [];
        var tempArr = [];
        if (this.parseDataFromatArr[16] > 0 && this.parseDataFromatArr[17] > 0) {
            tempArr.push(this.parseDataFromatArr[16][0]);
            tempArr.push(this.parseDataFromatArr[17][0]);
            result.push(tempArr);
        }
        if (result.length > 0) return result;
        return null;
    },

    getMissile: function() {
        var i = 3;
        var len = 15;
        var tempArr;
        var result = [];
        for (i; i <= len; i++) {
            tempArr = this.parseDataFromatArr[i];
            if (tempArr.length == 4) {
                if (this.parseData.type == CardsInspect.CardType.TYPE_MISSILE) {
                    if (this.parseData.startCard < i) {
                        result.push(tempArr);
                    }
                } else {
                    result.push(tempArr);
                }
            }
        }
        if (result.length > 0) return result;
        return null;
    },

    getParseDataFormat: function() {
        var arr = [0, 0, 0, [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ];
        var i;
        var len = this.selfCardArr.length;
        var index;
        var card;
        for (i = 0; i < len; i++) {
            card = this.selfCardArr[i];
            index = card & 0xff;
            arr[index].push(card);
        }
        this.parseDataFromatArr = arr;
    }
});


/**
 * 单张
 */
var SingleSolution = cc.Class({
    extends: SolutionPlan,

    ctor: function() {

    },

    getNormalSolution: function() {
        var i = this.parseData.startCard + 1;
        var len = 17;
        var solutionArr = [null, [],
            [],
            []
        ];
        var tempArr;
        for (i; i <= len; i++) {
            tempArr = this.parseDataFromatArr[i];
            if (tempArr.length == 1) {
                solutionArr[1].push([tempArr[0]]);
            } else if (tempArr.length == 2) {
                solutionArr[2].push([tempArr[0]]);
            } else if (tempArr.length == 3) {
                solutionArr[3].push([tempArr[0]]);
            }
        }
        return solutionArr[1].concat(solutionArr[2]).concat(solutionArr[3]);
    }
});


/**
 * 一对
 */
var PairSolution = cc.Class({
    extends: SolutionPlan,

    ctor: function() {

    },

    getNormalSolution: function() {
        var i = this.parseData.startCard + 1;
        var len = 15;
        var solutionArr = [null, null, [],
            []
        ];
        var tempArr;
        for (i; i <= len; i++) {
            tempArr = this.parseDataFromatArr[i];
            if (tempArr.length == 2) {
                solutionArr[2].push([tempArr[0], tempArr[1]]);
            } else if (tempArr.length == 3) {
                solutionArr[3].push([tempArr[0], tempArr[1]]);
            }
        }
        return solutionArr[2].concat(solutionArr[3]);
    }
});


/**
 * 连对
 */
var PairContinueSolution = cc.Class({
    extends: SolutionPlan,

    ctor: function() {

    },

    getNormalSolution: function() {
        var startIndex = this.parseData.startCard;
        var step = this.parseData.step;
        var selfCardLen = this.selfCardArr.length;
        if (startIndex + step > 14) return null;
        if (selfCardLen < step * 2) return null;
        var i = startIndex + 1;
        var len = 14;
        var tempArr;

        var startFlag = 0;
        var endFlag = startFlag;
        var solutionArr;
        for (i; i <= len; i++) {
            tempArr = this.parseDataFromatArr[i];
            if (tempArr.length >= 2 && tempArr.length != 4) {
                if (startFlag == 0) {
                    startFlag = i;
                    endFlag = startFlag;
                } else {
                    endFlag++;
                    if (i == len) {
                        if (endFlag - startFlag + 1 >= step) {
                            if (!solutionArr) solutionArr = [];
                            solutionArr = solutionArr.concat(this.splitSolution(startFlag, endFlag, step));
                        }
                    }
                }
            } else {
                if (endFlag - startFlag + 1 >= step) {
                    if (!solutionArr) solutionArr = [];
                    solutionArr = solutionArr.concat(this.splitSolution(startFlag, endFlag, step));
                }
                startFlag = 0;
                endFlag = startFlag;
            }
        }
        return solutionArr;
    },

    splitSolution: function(startFlag, endFlag, step) {
        var result = [];
        var len = endFlag - startFlag + 1 - step;
        var j;
        var len2;
        for (var i = 0; i <= len; i++) {
            len2 = startFlag + step + i;
            result[i] = [];
            for (j = startFlag + i; j < len2; j++) {
                result[i].push(this.parseDataFromatArr[j][0]);
                result[i].push(this.parseDataFromatArr[j][1]);
            }
        }
        return result;
    }
});


/**
 * 顺子
 */
var SingleContinueSolution = cc.Class({
    extends: SolutionPlan,

    ctor: function() {

    },

    getNormalSolution: function() {
        var startIndex = this.parseData.startCard;
        var step = this.parseData.step;
        var selfCardLen = this.selfCardArr.length;
        if (startIndex + step > 14) return null;
        if (selfCardLen < step) return null;
        var i = startIndex + 1;
        var len = 14;
        var tempArr;

        var startFlag = 0;
        var endFlag = startFlag;
        var solutionArr;
        for (i; i <= len; i++) {
            tempArr = this.parseDataFromatArr[i];
            if (tempArr.length >= 1) {
                if (startFlag == 0) {
                    startFlag = i;
                    endFlag = startFlag;
                } else {
                    endFlag++;
                    if (i == len) {
                        if (endFlag - startFlag + 1 >= step) {
                            if (!solutionArr) solutionArr = [];
                            solutionArr = solutionArr.concat(this.splitSolution(startFlag, endFlag, step));
                        }
                    }
                }
            } else {
                if (endFlag - startFlag + 1 >= step) {
                    if (!solutionArr) solutionArr = [];
                    solutionArr = solutionArr.concat(this.splitSolution(startFlag, endFlag, step));
                }
                startFlag = 0;
                endFlag = startFlag;
            }
        }
        return solutionArr;
    },

    splitSolution: function(startFlag, endFlag, step) {
        var result = [];
        var len = endFlag - startFlag + 1 - step;
        var j;
        var len2;
        for (var i = 0; i <= len; i++) {
            len2 = startFlag + step + i;
            result[i] = [];
            for (j = startFlag + i; j < len2; j++) {
                result[i].push(this.parseDataFromatArr[j][0]);
            }
        }
        return result;
    }
});


/**
 * 三带2*X
 */
var ThreeTakeTwoSolution = cc.Class({
    extends: SolutionPlan,

    ctor: function() {

    },

    getNormalSolution: function() {
        var startIndex = this.parseData.startCard;
        var step = this.parseData.step;
        var selfCardLen = this.selfCardArr.length;
        if (selfCardLen < step * 5) return [];
        var startFlag = 0;
        var endFlag = startFlag;
        var solutionArr;
        var tempArr;
        var i = startIndex + 1;
        var len = 14;
        if (step == 1) len = 15;
        for (i; i <= len; i++) {
            tempArr = this.parseDataFromatArr[i];
            if (tempArr.length == 3) {
                if (startFlag == 0) {
                    startFlag = i;
                    endFlag = startFlag;
                } else {
                    endFlag++;
                }
                if (i == len && startFlag > 0) {
                    if (endFlag - startFlag + 1 >= step) {
                        if (!solutionArr) solutionArr = [];
                        solutionArr = solutionArr.concat(this.splitSolution(startFlag, endFlag, step));
                    }
                }
            } else {
                if (startFlag > 0 && (endFlag - startFlag + 1) >= step) {
                    if (!solutionArr) solutionArr = [];
                    solutionArr = solutionArr.concat(this.splitSolution(startFlag, endFlag, step));
                }
                startFlag = 0;
                endFlag = startFlag;
            }
        }
        return solutionArr;
    },

    splitSolution: function(startFlag, endFlag, step) {
        var result = [];
        var len = endFlag - startFlag + 1 - step;
        var j;
        var k;
        var len2;
        var tempArr;
        var carryArr;
        for (var i = 0; i <= len; i++) {
            len2 = startFlag + step + i;
            tempArr = [];
            for (j = startFlag + i; j < len2; j++) {
                tempArr.push(this.parseDataFromatArr[j][0]);
                tempArr.push(this.parseDataFromatArr[j][1]);
                tempArr.push(this.parseDataFromatArr[j][2]);
            }
            // 从单张中找要带的牌
            carryArr = [];
            // 从对子以下中找要带的单牌
            if (carryArr.length < step * 2) {
                carryArr = [];
                for (k = 3; k <= 15; k++) {
                    if (this.parseDataFromatArr[k].length == 2) {
                        carryArr.push(this.parseDataFromatArr[k][0]);
                        carryArr.push(this.parseDataFromatArr[k][1]);
                        if (carryArr.length == step * 2) {
                            tempArr = tempArr.concat(carryArr);
                            result[result.length] = tempArr;
                            break;
                        }
                    }
                }
            }
            // 如果对子不够 从包含3张中找单牌
            if (carryArr.length < step * 2) {
                carryArr = [];
                for (k = 3; k <= 15; k++) {
                    if (this.parseDataFromatArr[k].length >= 2) {
                        if (k < startFlag + i || k >= len2) {
                            carryArr.push(this.parseDataFromatArr[k][0]);
                            carryArr.push(this.parseDataFromatArr[k][1]);
                            if (carryArr.length == step * 2) {
                                tempArr = tempArr.concat(carryArr);
                                result[result.length] = tempArr;
                                break;
                            }
                        }
                    }
                }
            }
        }
        return result;
    }
});

/**
 * 三带1*X
 */
var ThreeTakeOneSolution = cc.Class({
    extends: SolutionPlan,

    ctor: function() {

    },

    getNormalSolution: function() {
        var startIndex = this.parseData.startCard;
        var step = this.parseData.step;
        var selfCardLen = this.selfCardArr.length;
        if (selfCardLen < step * 4) return [];
        var startFlag = 0;
        var endFlag = startFlag;
        var solutionArr;
        var tempArr;
        var i = startIndex + 1;
        var len = 14;
        if (step == 1) len = 15;
        for (i; i <= len; i++) {
            tempArr = this.parseDataFromatArr[i];
            if (tempArr.length == 3) {
                if (startFlag == 0) {
                    startFlag = i;
                    endFlag = startFlag;
                } else {
                    endFlag++;
                }
                if (i == len && startFlag > 0) {
                    if (endFlag - startFlag + 1 >= step) {
                        if (!solutionArr) solutionArr = [];
                        solutionArr = solutionArr.concat(this.splitSolution(startFlag, endFlag, step));
                    }
                }
            } else {
                if (startFlag > 0 && (endFlag - startFlag + 1) >= step) {
                    if (!solutionArr) solutionArr = [];
                    solutionArr = solutionArr.concat(this.splitSolution(startFlag, endFlag, step));
                }
                startFlag = 0;
                endFlag = startFlag;
            }
        }
        return solutionArr;
    },

    splitSolution: function(startFlag, endFlag, step) {
        var result = [];
        var len = endFlag - startFlag + 1 - step;
        var j;
        var k;
        var len2;
        var tempArr;
        var carryArr;
        for (var i = 0; i <= len; i++) {
            len2 = startFlag + step + i;
            tempArr = [];
            for (j = startFlag + i; j < len2; j++) {
                tempArr.push(this.parseDataFromatArr[j][0]);
                tempArr.push(this.parseDataFromatArr[j][1]);
                tempArr.push(this.parseDataFromatArr[j][2]);
            }
            // 从单张中找要带的牌
            carryArr = [];
            for (k = 3; k <= 17; k++) {
                if (this.parseDataFromatArr[k].length == 1) {
                    carryArr.push(this.parseDataFromatArr[k][0]);
                }
                if (carryArr.length == step * 1) {
                    tempArr = tempArr.concat(carryArr);
                    result[result.length] = tempArr;
                    break;
                }
            }
            // 从对子以下中找要带的单牌
            if (carryArr.length < step * 1) {
                carryArr = [];
                for (k = 3; k <= 17; k++) {
                    if (this.parseDataFromatArr[k].length == 1) {
                        carryArr.push(this.parseDataFromatArr[k][0]);
                        if (carryArr.length == step * 1) {
                            tempArr = tempArr.concat(carryArr);
                            result[result.length] = tempArr;
                            break;
                        }
                    } else if (this.parseDataFromatArr[k].length == 2) {
                        carryArr.push(this.parseDataFromatArr[k][0]);
                        if (carryArr.length == step * 1) {
                            tempArr = tempArr.concat(carryArr);
                            result[result.length] = tempArr;
                            break;
                        }
                        carryArr.push(this.parseDataFromatArr[k][1]);
                        if (carryArr.length == step * 1) {
                            tempArr = tempArr.concat(carryArr);
                            result[result.length] = tempArr;
                            break;
                        }
                    }
                }
            }
            // 如果对子不够 从包含3张中找单牌
            if (carryArr.length < step * 1) {
                carryArr = [];
                for (k = 3; k <= 17; k++) {
                    if (this.parseDataFromatArr[k].length == 1) {
                        carryArr.push(this.parseDataFromatArr[k][0]);
                    }
                    if (this.parseDataFromatArr[k].length == 2) {
                        carryArr.push(this.parseDataFromatArr[k][0]);
                        carryArr.push(this.parseDataFromatArr[k][1]);
                    }
                }
                for (k = 3; k <= 15; k++) {
                    if (this.parseDataFromatArr[k].length > 0 && this.parseDataFromatArr[k].length < 4) {
                        if (k < startFlag + i || k >= len2) {
                            if (this.parseDataFromatArr[k].length == 3) {
                                carryArr.push(this.parseDataFromatArr[k][0]);
                                if (carryArr.length == step * 1) {
                                    tempArr = tempArr.concat(carryArr);
                                    result[result.length] = tempArr;
                                    break;
                                }
                                carryArr.push(this.parseDataFromatArr[k][1]);
                                if (carryArr.length == step * 1) {
                                    tempArr = tempArr.concat(carryArr);
                                    result[result.length] = tempArr;
                                    break;
                                }
                                carryArr.push(this.parseDataFromatArr[k][2]);
                                if (carryArr.length == step * 1) {
                                    tempArr = tempArr.concat(carryArr);
                                    result[result.length] = tempArr;
                                    break;
                                }
                            }
                        }
                    }
                    if (carryArr.length == step * 1) {
                        tempArr = tempArr.concat(carryArr);
                        result[result.length] = tempArr;
                        break;
                    }
                }
            }
        }
        return result;
    }
});

/**
 * 三张*X
 */
var ThreeSolution = cc.Class({
    extends: SolutionPlan,

    ctor: function() {

    },

    getNormalSolution: function() {
        var startIndex = this.parseData.startCard;
        var step = this.parseData.step;
        var selfCardLen = this.selfCardArr.length;
        if (selfCardLen < step * 3) return [];
        var startFlag = 0;
        var endFlag = startFlag;
        var solutionArr;
        var tempArr;
        var i = startIndex + 1;
        var len = 14;
        if (step == 1) len = 15;
        for (i; i <= len; i++) {
            tempArr = this.parseDataFromatArr[i];
            if (tempArr.length == 3) {
                if (startFlag == 0) {
                    startFlag = i;
                    endFlag = startFlag;
                } else {
                    endFlag++;
                }
                if (i == len && startFlag > 0) {
                    if (endFlag - startFlag + 1 >= step) {
                        if (!solutionArr) solutionArr = [];
                        solutionArr = solutionArr.concat(this.splitSolution(startFlag, endFlag, step));
                    }
                }
            } else {
                if (startFlag > 0 && (endFlag - startFlag + 1) >= step) {
                    if (!solutionArr) solutionArr = [];
                    solutionArr = solutionArr.concat(this.splitSolution(startFlag, endFlag, step));
                }
                startFlag = 0;
                endFlag = startFlag;
            }
        }
        return solutionArr;
    },

    splitSolution: function(startFlag, endFlag, step) {
        var result = [];
        var len = endFlag - startFlag + 1 - step;
        var j;
        var len2;
        for (var i = 0; i <= len; i++) {
            len2 = startFlag + step + i;
            result[i] = [];
            for (j = startFlag + i; j < len2; j++) {
                result[i].push(this.parseDataFromatArr[j][0]);
                result[i].push(this.parseDataFromatArr[j][1]);
                result[i].push(this.parseDataFromatArr[j][2]);
            }
        }
        return result;
    }
});

/**
 * 应对玩家出牌解决方案 helper
 * @type {Function}
 */
var SolutionHelper = cc.Class({
    ctor: function() {
        this._solutionPLan = new SolutionPlan();
        this._singleSolution = new SingleSolution();
        this._singleContinueSolution = new SingleContinueSolution();
        this._pairSolution = new PairSolution();
        this._pairContinueSolution = new PairContinueSolution();
        this._threeTakeTwoSolution = new ThreeTakeTwoSolution();
        this._threeTakeOneSolution = new ThreeTakeOneSolution();
        this._threeSolution = new ThreeSolution();
    },

    /**
     * @param {ParseData} parseData
     * @param {Array} selfCards
     */
    parse: function(parseData, selfCards) {
        /** @type{SolutionPlan} **/
        var solutionPlan;
        switch (parseData.type) {
        case CardsInspect.CardType.TYPE_SINGLE:
            solutionPlan = this._singleSolution;
            break;
        case CardsInspect.CardType.TYPE_PAIR:
            solutionPlan = this._pairSolution;
            break;
        case CardsInspect.CardType.TYPE_THREE_TAKE_PAIR:
            solutionPlan = this._threeTakeTwoSolution;
            break;
        case CardsInspect.CardType.TYPE_MISSILE:
            solutionPlan = this._solutionPLan;
            break;
        case CardsInspect.CardType.TYPE_CONTINUE_PAIR:
            solutionPlan = this._pairContinueSolution;
            break;
        case CardsInspect.CardType.TYPE_CONTINUE_SINGLE:
            solutionPlan = this._singleContinueSolution;
            break;
        case CardsInspect.CardType.TYPE_THREE_TAKE_ONE:
            solutionPlan = this._threeTakeOneSolution;
            break;
        case CardsInspect.CardType.TYPE_THREE:
            solutionPlan = this._threeSolution;
            break;
        case CardsInspect.CardType.TYPE_SUPER_MISSILE:
            return [];
        default:
            solutionPlan = this._solutionPLan;
        }
        if (solutionPlan) {
            // cc.log("parseData, selfCards:", parseData, selfCards);
            return solutionPlan.parse(parseData, selfCards);
        }
        return [];
    }
});

module.exports = SolutionHelper;