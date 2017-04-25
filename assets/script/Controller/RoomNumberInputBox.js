cc.Class({
    extends: cc.Component,

    properties: {
        number1: cc.Sprite,
        number2: cc.Sprite,
        number3: cc.Sprite,
        number4: cc.Sprite,
        number5: cc.Sprite,
        number6: cc.Sprite,

        gameRecordStep: cc.Prefab,
    },

    onLoad: function() {
        this.roomNumber = '';
    },

    init(fromScene) {
        this.fromScene = fromScene;
    },

    numberButtonOnClick(evt, data) {
        window.SoundEffect.playEffect(Global.audioUrl.effect.buttonClick);
        if (this.roomNumber.length !== 6) {
            this.roomNumber += data;
            this[`number${this.roomNumber.length}`].spriteFrame = evt.target.children[0].getComponent(cc.Sprite).spriteFrame;
        }

        if (this.roomNumber.length === 6) {
            if (this.fromScene === 'Lobby') {
                this._getHttpRoomEnterData();
            }
            else if (this.fromScene === 'GameRecordList') {
                var parentNode = cc.director.getScene().getChildByName('Canvas');
                var node = cc.instantiate(this.gameRecordStep);
                node.getComponent('GameRecordStepPrefab').init(this.roomId);
                Global.openDialog(node, parentNode, () => {
                    cc.log('downloader success');
                });
            }
        }
    },

    clearNumberOnClick() {
        window.SoundEffect.playEffect(Global.audioUrl.effect.buttonClick);
        if (this.roomNumber.length !== 0) {
            for (let i = 1; i <= 6; i += 1) {
                this[`number${i}`].spriteFrame = null;
            }
            this.roomNumber = '';
        }
    },

    deleteNumberOnClick() {
        window.SoundEffect.playEffect(Global.audioUrl.effect.buttonClick);
        cc.log(this.roomNumber);
        if (this.roomNumber.length !== 0) {
            this[`number${this.roomNumber.length}`].spriteFrame = null;
            this.roomNumber = this.roomNumber.substr(0, this.roomNumber.length - 1);
        }
    },

    /**
     * 关闭本窗口
     */
    closeOnClick() {
        window.SoundEffect.playEffect(Global.audioUrl.effect.buttonClick);
        Global.closeDialog(this.node);
    },

    _getHttpRoomEnterData() {
        Dialog.openLoading();

        const parameters = { roomId: this.roomNumber };
        HttpRequestManager.httpRequest('roomEnter', parameters, (event, result) => {
            Dialog.close();

            if (result.code === 1) {
                Dialog.close();
                Global.tempCache = result;
                cc.director.loadScene('GameRoom');
            }
            else if (result.code === 1041) {
                Dialog.openMessageBox('房间号不存在', function() {
                    cc.log('Dialog.openMessageBox.callback');
                });
            }
        });
    },
});
