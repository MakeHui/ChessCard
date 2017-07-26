/**
 * 自己先出牌提示
 */

var FirstOutCardHelper = cc.Class({
    ctor: function() {
        this._checkQueue = [
            this.pickSingleContinue.bind(this),
            this.pickPairContinue.bind(this),
            this.pickThreeTakeXContinue.bind(this),
            this.pickPair.bind(this),
            this.pickSingle.bind(this),
            this.pickFour.bind(this)
        ];
    },

    /**
     * @param {Array} cards 牌的原值
     */
    parse: function(cards) {
        var data = this.genAlgArr(cards);
        var i;
        var len = this._checkQueue.length;
        var checkResult;
        var checkHandler;
        var solutionDatas = [];
        // 检测
        for (i = 0; i < len; i++) {
            checkHandler = this._checkQueue[i];
            checkResult = checkHandler(data);
            if (checkResult && checkResult.length > 0) {
                solutionDatas = solutionDatas.concat(checkResult);
            }
        }
        if (i > 1) {
            // solutionDatas.sort(
            //     function(a, b) {
            //         return b.length - a.length;
            //     }
            // );
        }

        // 提取结果
        if (solutionDatas.length > 0) {
            var solutionResult = [];
            len = solutionDatas.length;
            var card;
            var j;
            var k;
            var len2;
            var len3;
            var cardValue;
            var resultItem;
            var cardsCopy;
            var solutionItem;
            for (i = 0; i < len; i++) {
                resultItem = [];
                cardsCopy = cards.concat();
                solutionItem = solutionDatas[i];
                len3 = solutionItem.length;
                for (k = 0; k < len3; k++) {
                    cardValue = solutionItem[k];
                    len2 = cardsCopy.length;
                    for (j = 0; j < len2; j++) {
                        card = cardsCopy[j];
                        if ((card & 0xff) == cardValue) {
                            resultItem.push(card);
                            cardsCopy.splice(j, 1);
                            break;
                        }
                    }
                }
                solutionResult.push(resultItem);
            }
            return solutionResult;
        }
        return null;
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

    // ////////////////////////////////找顺子/////////////////////////////////////////////////
    /**
     * @param {Array} datas
     * @returns {*}
     */
    pickSingleContinue: function(datas) {
        var i = 3;
        var startIndex = 0;
        var endIndex = startIndex;
        var solutions = [];
        var len = 14;
        for (i; i <= len; i++) {
            if (datas[i] > 0 && datas[i] < 4) {
                if (startIndex == 0) {
                    startIndex = i;
                    endIndex = startIndex;
                } else {
                    endIndex++;
                    if (i == len) {
                        if (endIndex - startIndex + 1 >= 5) {
                            solutions.push(this.getSingleContinueSolution(startIndex, endIndex));
                        }
                    }
                }
            } else {
                if (endIndex - startIndex + 1 >= 5) {
                    solutions.push(this.getSingleContinueSolution(startIndex, endIndex));
                }
                startIndex = 0;
                endIndex = startIndex;
            }
        }
        return solutions;
    },

    getSingleContinueSolution: function(startIndex, endIndex) {
        var result = [];
        for (var i = startIndex; i <= endIndex; i++) {
            result.push(i);
        }
        return result;
    },


    // //////////////////////////////////找连对///////////////////////////////////////////////
    /**
     * @param {Array} datas
     * @returns {*}
     */
    pickPairContinue: function(datas) {
        var i = 3;
        var startIndex = 0;
        var endIndex = startIndex;
        var solutions = [];
        var len = 14;
        for (i; i <= len; i++) {
            if (datas[i] > 1 && datas[i] < 4) {
                if (startIndex == 0) {
                    startIndex = i;
                    endIndex = startIndex;
                } else {
                    endIndex++;
                    if (i == len) {
                        if (endIndex - startIndex + 1 > 2) {
                            solutions.push(this.getPairContinueSolution(startIndex, endIndex));
                        }
                    }
                }
            } else {
                if (endIndex - startIndex + 1 > 2) {
                    solutions.push(this.getPairContinueSolution(startIndex, endIndex));
                }
                startIndex = 0;
                endIndex = startIndex;
            }
        }
        return solutions;
    },

    getPairContinueSolution: function(startIndex, endIndex) {
        var result = [];
        for (var i = startIndex; i <= endIndex; i++) {
            result.push(i);
            result.push(i);
        }
        return result;
    },

    // //////////////////////////找飞机 --带X * n/////////////////////////////////////////////
    /**
     * @param {Array} datas
     * @returns {*}
     */
    pickThreeTakeXContinue: function(datas) {
        // var i = 3;
        // var startIndex = 0;
        // var endIndex = startIndex;
        // var len = 14;
        var solutions = [];
        // for (i; i <= len; i++) {
        //     if (datas[i] == 3) {
        //         if (startIndex == 0) {
        //             startIndex = i;
        //             endIndex = startIndex;
        //         } else {
        //             endIndex++;
        //         }
        //         if (i == len) {
        //             solutions.push(this.getThreeTakeX(startIndex, endIndex, datas));
        //         }
        //     } else {
        //         if (startIndex != 0) {
        //             solutions.push(this.getThreeTakeX(startIndex, endIndex, datas));
        //         }
        //         startIndex = 0;
        //         endIndex = startIndex;
        //     }
        // }

        for (var j = 0; j < datas.length; j += 1) {
            if (datas[j] == 3) {
                for (var k = 0; k < datas.length; k += 1) {
                    if (datas[k] === 1) {
                        solutions.push([j, j, j, k]);
                    }

                    if (datas[k] === 2) {
                        solutions.push([j, j, j, k, k]);
                    }
                }
            }
        }

        return solutions;
    },

    // getThreeTakeX: function(startIndex, endIndex, datas) {
    //     datas = datas.concat();
    //     var stepLen = endIndex - startIndex + 1;
    //     var result = [];
    //     var i;
    //     for (i = startIndex; i <= endIndex; i++) {
    //         result.push(i);
    //         result.push(i);
    //         result.push(i);
    //         datas[i] -= 3;
    //     }
    //     // 带 一张
    //     var takeArr = [];
    //     for (i = 3; i <= 15; i++) {
    //         if (datas[i] == 1) {
    //             takeArr.push(i);
    //             if (takeArr.length == stepLen) break;
    //         }
    //     }
    //     if (takeArr.length == stepLen) {
    //         result = result.concat(takeArr);
    //         return result;
    //     }
    //     // 带 一对
    //     takeArr = [];
    //     for (i = 3; i <= 15; i++) {
    //         if (datas[i] == 2) {
    //             takeArr.push(i);
    //             takeArr.push(i);
    //             if (takeArr.length == stepLen * 2) break;
    //         }
    //     }
    //     if (takeArr.length == stepLen * 2) {
    //         result = result.concat(takeArr);
    //         return result;
    //     }
    //
    //     // 带 两张  单张 一对 三张的组合
    //     takeArr = [];
    //     for (i = 3; i <= 15; i++) {
    //         if (datas[i] == 2) {
    //             takeArr.push(i);
    //             takeArr.push(i);
    //             if (takeArr.length == stepLen * 2) break;
    //         }
    //     }
    //     for (i = 3; i <= 15; i++) {
    //         if (datas[i] == 3) {
    //             takeArr.push(i);
    //             takeArr.push(i);
    //             if (takeArr.length == stepLen * 2) break;
    //         }
    //     }
    //     if (takeArr.length == stepLen * 2) {
    //         result = result.concat(takeArr);
    //         return result;
    //     }
    //     result = result.concat(takeArr);
    //     return result;
    // },

    // ///////////////////////////////////找对子 ///////////////////////////////////////////////
    /**
     * @param {Array} datas
     * @returns {*}
     */
    pickPair: function(datas) {
        var i = 3;
        var solutions = [];
        // var solLen = 0;
        var len = 15;
        for (i; i <= len; i++) {
            if (datas[i] == 2) {
                // solLen = solutions.length;
                solutions.push([i, i]);
            }
        }
        return solutions;
    },

    // ///////////////////////////////////找单张 ///////////////////////////////////////////////
    /**
     * @param {Array} datas
     * @returns {*}
     */
    pickSingle: function(datas) {
        var i = 3;
        var solutions = [];
        // var solLen = 0;
        var len = 17;
        for (i; i <= len; i++) {
            if (datas[i] == 1) {
                solutions.push([i]);
            }
        }
        return solutions;
    },

    // ///////////////////////////////////找炸弹 ///////////////////////////////////////////////
    /**
     * @param {Array} datas
     * @returns {*}
     */
    pickFour: function(datas) {
        datas = datas.concat();
        var i = 3;
        var solutions = [];
        // var sloLen = 0;
        var len = 15;
        for (i; i <= len; i++) {
            if (datas[i] == 4) {
                solutions.push([i, i, i, i]);
            }
        }

        if (datas[16] !== 0 && datas[17] !== 0) {
            solutions.push([16, 17]);
        }

        return solutions;
    }
});

module.exports = FirstOutCardHelper;