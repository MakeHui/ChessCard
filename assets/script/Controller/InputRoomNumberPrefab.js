cc.Class({
    extends: cc.Component,

    properties: {
        roomNumber: 0,

        number1: cc.Sprite,
        number2: cc.Sprite,
        number3: cc.Sprite,
        number4: cc.Sprite,
        number5: cc.Sprite,
        number6: cc.Sprite,
    },

    // use this for initialization
    onLoad() {
        this.roomNumber = '';
    },

    numberButtonOnClick(evt, data) {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        if (this.roomNumber.length !== 6) {
            this.roomNumber += data;
            this[`number${this.roomNumber.length}`].spriteFrame = evt.target.children[0].getComponent(cc.Sprite).spriteFrame;
        }

        if (this.roomNumber.length === 6) {
            if (this.fromScene === 'Lobby') {
                this._getHttpRoomEnterData();
            }
            else if (this.fromScene === 'GameRecordList') {
                const script = cc.director.getScene().getChildByName('Canvas').getChildByName('GameRecordList').getComponent('GameRecordListPrefab');
                script.onGetGameRecordInfoDataCallback(this, this.roomNumber);
            }
        }
    },

    clearNumberOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        if (this.roomNumber.length !== 0) {
            for (let i = 1; i <= 6; i += 1) {
                this[`number${i}`].spriteFrame = null;
            }
            this.roomNumber = '';
        }
    },

    deleteNumberOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.log(this.roomNumber);
        if (this.roomNumber.length !== 0) {
            this[`number${this.roomNumber.length}`].spriteFrame = null;
            this.roomNumber = this.roomNumber.substr(0, this.roomNumber.length - 1);
        }
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        Global.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    },

    _getHttpRoomEnterData() {
        Global.dialog.open('Loading', this.node);

        const parameters = { roomId: this.roomNumber };
        HttpRequestManager.httpRequest('roomEnter', parameters, (event, result) => {
            Global.dialog.close();

            if (result.code === 1) {
                Global.dialog.close();
                Global.tempCache = result;
                cc.director.loadScene('GameRoom');
            }
            else if (result.code === 1041) {
                Global.tempCache = '房间号不存在';
                Global.dialog.open('Dialog', this.node);
            }
        });
    },

    setData(data) {
        this.fromScene = data;
    },
});
