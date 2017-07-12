var CardsInspect = cc.Class({
    statics: {
        /**
         * 检测王炸
         * @param {ParseData} parseData
         * @returns {boolean}
         */
        superMissile: function(parseData) {
            var len = parseData.cards.length;
            if (len != 2) return false;
            var arr = parseData.parseDataFormat;
            if (arr[16] == 1 && arr[17] == 1) {
                parseData.type = CardType.TYPE_SUPER_MISSILE;
                parseData.typeWeight = CardType.TYPE_OF_WEIGHT_SUPERMISSILE;
                parseData.startCard = parseData.cards[0] & 0xff;
                return true;
            }
            return false;
        },

        /**
         * 检测单张
         * @param {ParseData} parseData
         * @returns {boolean}
         */
        parseSingle: function(parseData) {
            var len = parseData.cards.length;
            if (len == 1) {
                parseData.type = CardType.TYPE_SINGLE;
                parseData.startCard = parseData.cards[0] & 0xff;
                return true;
            }
            return false;
        },

        /**
         * 检测一对
         * @param {ParseData} parseData
         * @returns {boolean}
         */
        parsePair: function(parseData) {
            var len = parseData.cards.length;
            if (len != 2) return false;
            var i = 0;
            var arr = parseData.parseDataFormat;
            len = arr.length;
            for (i = 3; i < len; i++) {
                if (arr[i] == 2) {
                    parseData.type = CardType.TYPE_PAIR;
                    parseData.startCard = parseData.cards[0] & 0xff;
                    return true;
                }
            }
            return false;
        },

        /**
         * 检测连对
         * @param {ParseData} parseData
         * @returns {boolean}
         */
        parseContinuePair: function(parseData) {
            var len = parseData.cards.length;
            if (len < 6 || len % 2 != 0) return false;
            var i = 0;
            var arr = parseData.parseDataFormat;
            len = arr.length;
            var beginIndex = 0;
            var endIndex = 0;
            for (i = 3; i < 15; i++) {
                if (arr[i] == 2) {
                    beginIndex = i;
                    break;
                }
            };
            if (beginIndex == 0) return false;
            endIndex = beginIndex + 1;
            for (i = endIndex; i < 16; i++) {
                if (arr[i] != 2) {
                    endIndex = i;
                    break;
                }
            };
            if ((endIndex - beginIndex) * 2 == parseData.cards.length) {
                parseData.type = CardType.TYPE_CONTINUE_PAIR;
                parseData.startCard = beginIndex;
                parseData.step = endIndex - beginIndex;
                return true;
            }
            return false;
        },

        /**
         * 检测顺子
         * @param {ParseData} parseData
         * @returns {boolean}
         */
        parseContinueSingle: function(parseData) {
            var len = parseData.cards.length;
            if (len < 5 || len > 12) return false;
            var i = 0;
            var arr = parseData.parseDataFormat;
            len = arr.length;
            var beginIndex = 0;
            var endIndex = 0;
            for (i = 3; i < 15; i++) {
                if (arr[i] == 1) {
                    beginIndex = i;
                    break;
                }
            };
            if (beginIndex == 0) return false;
            endIndex = beginIndex + 1;
            for (i = endIndex; i < 16; i++) {
                if (arr[i] != 1) {
                    endIndex = i;
                    break;
                }
            };
            if ((endIndex - beginIndex) == parseData.cards.length) {
                parseData.type = CardType.TYPE_CONTINUE_SINGLE;
                parseData.startCard = beginIndex;
                parseData.step = endIndex - beginIndex;
                return true;
            }
            return false;
        },

        /**
         * 检测炸弹
         * @param {ParseData} parseData
         * @returns {boolean}
         */
        parseMissile: function(parseData) {
            if (parseData.cards.length != 4) return false;
            var i;
            var arr = parseData.parseDataFormat;
            var len = arr.length;
            for (i = 3; i < len; i++) {
                if (arr[i] == 4) {
                    parseData.type = CardType.TYPE_MISSILE;
                    parseData.typeWeight = CardType.TYPE_OF_WEIGHT_MISSILE;
                    parseData.startCard = parseData.cards[0] & 0xff;
                    return true;
                }
            }
            return false;
        },

        /**
         * 检测三张 3*x
         * @param {ParseData} parseData
         * @returns {boolean}
         */
        parseThree: function(parseData) {
            var len = parseData.cards.length;
            if (len % 3 != 0) return false;
            var i = 0;
            var arr = parseData.parseDataFormat;
            len = arr.length;
            var beginIndex = 0;
            var endIndex = 0;
            for (i = 3; i < len; i++) {
                if (arr[i] == 3) {
                    beginIndex = i;
                    break;
                }
            };
            if (beginIndex == 0) return false;
            endIndex = beginIndex + 1;
            for (i = endIndex; i < len; i++) {
                if (arr[i] != 3) {
                    endIndex = i;
                    break;
                }
            };
            if ((endIndex - beginIndex) * 3 == parseData.cards.length) {
                var tempStep = endIndex - beginIndex;
                if (endIndex == 16 && tempStep > 1) return false;
                parseData.type = CardType.TYPE_THREE;
                parseData.startCard = beginIndex & 0xff;
                parseData.step = tempStep;
                return true;
            }
            return false;
        },

        /**
         * 检测3带1*X
         * @param {ParseData} parseData
         * @returns {boolean}
         */
        parseThreeTakeOne: function(parseData) {
            var getCarryCards = function(parseData) {
                var i;
                var arr = parseData.parseDataFormat;
                var len = arr.length;
                var resultArr = [];
                for (i = 3; i < len; i++) {
                    if (arr[i] == 1)
                        resultArr.push(i);
                    //if(arr[i] != 0) {
                    //    if(arr[i] != 3) {
                    //        resultArr.push(i);
                    //        if(arr[i] == 2) resultArr.push(i);
                    //        if(arr[i] == 4) {
                    //            if(arr[i+1]<3 && arr[i-1] < 3){
                    //                resultArr.push(i);
                    //                resultArr.push(i);
                    //                resultArr.push(i);
                    //            }
                    //        }
                    //    }else {
                    //        //处理带的牌中含有3张 的问题
                    //        if(parseData.cards.length > 11){
                    //            if(arr[i+1]<3 && arr[i-1] < 3){
                    //                resultArr.push(i);
                    //                resultArr.push(i);
                    //                resultArr.push(i);
                    //            }
                    //        }
                    //    }
                    //}
                }
                return resultArr;
            };

            var len = parseData.cards.length;
            if (len % 4 != 0) return false;
            var i = 0;
            var arr = parseData.parseDataFormat;
            len = arr.length;
            var beginIndex = 0;
            var endIndex = 0;
            for (i = 3; i < len; i++) {
                if (arr[i] == 3 || arr[i] == 4) {
                    if (parseData.cards.length < 11) {
                        beginIndex = i;
                        break;
                    } else {
                        //12 15 18张3连带的牌是3张相同的牌
                        if (arr[i + 1] >= 3) {
                            beginIndex = i;
                            break;
                        }
                    }
                }
            };
            if (beginIndex == 0) return false;
            endIndex = beginIndex + 1;
            for (i = endIndex; i < len; i++) {
                if (arr[i] != 3 && arr[i] != 4) {
                    endIndex = i;
                    break;
                }
            };
            if ((endIndex - beginIndex) * 4 == parseData.cards.length) {
                var tempStep = endIndex - beginIndex;
                if (endIndex == 16 && tempStep > 1) return false;
                parseData.carryCards = getCarryCards(parseData);
                if (parseData.carryCards.length != tempStep) return false;
                parseData.type = CardType.TYPE_THREE_TAKE_ONE;
                parseData.startCard = beginIndex & 0xff;
                parseData.step = tempStep;
                return true;
            }
            return false;
        },

        /**
         * 3带2*X
         * @param {ParseData} parseData
         * @returns {boolean}
         */
        parseThreeTakeTwo: function(parseData) {
            var getCarryCards = function(parseData) {
                var i;
                var arr = parseData.parseDataFormat;
                var len = arr.length;
                var resultArr = [];
                for (i = 3; i < len; i++) {
                    if (arr[i] == 2) {
                        resultArr.push(i);
                        resultArr.push(i);
                        // if(arr[i] == 2) resultArr.push(i);
                    } else {
                        //if(arr[i] == 4) {
                        //    // if(arr[i+1]<3 && arr[i-1] < 3){
                        //        resultArr.push(i);
                        //        resultArr.push(i);
                        //        resultArr.push(i);
                        //        resultArr.push(i);
                        //    // }
                        //}
                    }
                }
                return resultArr;
            };

            var len = parseData.cards.length;
            if (len % 5 != 0) return false;
            var i = 0;
            var arr = parseData.parseDataFormat;
            len = arr.length;
            var beginIndex = 0;
            var endIndex = 0;
            for (i = 3; i < len; i++) {
                if (arr[i] == 3) {
                    // if(parseData.cards.length < 10){
                    beginIndex = i;
                    break;
                    // }else {
                    //15、20张连带的牌是3张相同的牌
                    // if(arr[i]==3) {
                    // beginIndex=i;
                    // break;
                    // }
                }
                // }
            };
            if (beginIndex == 0) return false;
            endIndex = beginIndex + 1;
            for (i = endIndex; i < len; i++) {
                if (arr[i] != 3 && arr[i] != 4) {
                    endIndex = i;
                    break;
                }
            };
            if ((endIndex - beginIndex) * 5 == parseData.cards.length) {
                var tempStep = endIndex - beginIndex;
                if (endIndex > 15 && tempStep > 1) return false;

                parseData.carryCards = getCarryCards(parseData);
                if (parseData.carryCards.length != tempStep * 2) return false;
                parseData.type = CardType.TYPE_THREE_TAKE_PAIR;
                parseData.startCard = beginIndex;
                parseData.step = tempStep;
                return true;
            }
            return false;
        },

        /**
         * 4带2*X
         * @param {ParseData} parseData
         * @returns {boolean}
         */
        parseFourTakeTwo: function(parseData) {
            var getCarryCards = function(parseData) {
                var i;
                var arr = parseData.parseDataFormat;
                var len = arr.length;
                var resultArr = [];
                var flag = 0;
                for (i = 3; i < len; i++) {
                    if (arr[i] == 1 && parseData.cards.length == 6 && resultArr.length < 2 && flag != 2) {
                        flag = 1;
                        resultArr.push(i);
                    } else {
                        if (arr[i] == 2 && parseData.cards.length == 8 && resultArr.length < 4 && flag != 1) {
                            flag = 2
                            resultArr.push(i);
                            resultArr.push(i);
                        }
                    }
                }
                return resultArr;
            };

            var len = parseData.cards.length;
            var i = 0;
            var arr = parseData.parseDataFormat;
            len = arr.length;
            var beginIndex = 0;
            var endIndex = 0;
            for (i = 3; i < len; i++) {
                if (arr[i] == 4) {
                    beginIndex = i;
                    break;
                }
            };
            if (beginIndex == 0) return false;
            endIndex = beginIndex;
            if (parseData.cards.length == 6 || parseData.cards.length == 8) {
                parseData.carryCards = getCarryCards(parseData);
                if (parseData.carryCards.length != parseData.cards.length - 4) return false;
                parseData.type = CardType.TYPE_FOUR_TAKE_TOW;
                parseData.startCard = beginIndex;
                return true
            }
            return false;
        },
    }
});

module.exports = CardsInspect;