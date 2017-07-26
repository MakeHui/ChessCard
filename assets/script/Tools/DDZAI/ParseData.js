var ParseData = cc.Class({
    ctor() {
        this.cards = [];            // 牌的数据
        this.type = 0;              // 类型(默认是非法牌型)
        this.typeWeight = 0;        // 类型权重
        this.startCard = 0;         // 开始的牌
        this.step = 1;              // 递增步数
        this.carryCards = [];       // 携带的牌
        this.parseDataFormat = [];  // 用于牌型检测的数据结构
    }
});

module.exports = ParseData;