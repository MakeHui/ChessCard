cc.Class({
    extends: cc.Component,

    properties: {
        inputRoomNumber: cc.Prefab,
        gameRecordCell: cc.Prefab,
        gameRecordList: cc.Node,
        gameRecordData: [],
    },

    // use this for initialization
    onLoad: function () {
        this.gameRecordData = [
            {
                roomNumber: 123123123,
                datetime: "2017-02-12",
                userList: [
                    {
                        avatar: "http://ww3.sinaimg.cn/mw690/ab41dfeegw1emxsjnhwcnj205k05kt8w.jpg",
                        username: "xxxx",
                        point: 123,
                    },
                    {
                        avatar: "http://image.famishare.cn/default/dajinkuai.png",
                        username: "xxxx",
                        point: 123,
                    },
                    {
                        avatar: "http://ww3.sinaimg.cn/mw690/ab41dfeegw1emxsjnhwcnj205k05kt8w.jpg",
                        username: "xxxx",
                        point: 123,
                    },
                    {
                        avatar: "http://collegevscollege.oss-cn-hangzhou.aliyuncs.com/px258/test/guest_headimg.png",
                        username: "xxxx",
                        point: 123,
                    }
                ],
            },
            {
                roomNumber: 123123123,
                datetime: "2017-02-13",
                userList: [
                    {
                        avatar: "https://www.google.com.hk/logos/doodles/2017/lantern-festival-2017-china-hong-kong-5653647470886912.2-scta.png",
                        username: "xxxx",
                        point: 123,
                    },
                    {
                        avatar: "https://www.google.com.hk/logos/doodles/2017/lantern-festival-2017-china-hong-kong-5653647470886912.2-scta.png",
                        username: "xxxx",
                        point: 123,
                    },
                    {
                        avatar: "https://www.google.com.hk/logos/doodles/2017/lantern-festival-2017-china-hong-kong-5653647470886912.2-scta.png",
                        username: "xxxx",
                        point: 123,
                    },
                    {
                        avatar: "https://www.google.com.hk/logos/doodles/2017/lantern-festival-2017-china-hong-kong-5653647470886912.2-scta.png",
                        username: "xxxx",
                        point: 123,
                    }
                ],
            }
        ];

        if (this.gameRecordData.length !== 0) {
            this.gameRecordList.removeAllChildren();
            for (let i = 0; i < this.gameRecordData.length; ++i) {
                PX258.tempCache = this.gameRecordData[i];
                cc.instantiate(this.gameRecordCell).parent = this.gameRecordList;
            }
        }
    },

    seeOtherRoomOnClick: function() {
        cc.instantiate(this.inputRoomNumber).parent = cc.director.getScene();
    },

    /**
     * 关闭本窗口
     */
    closeOnClick: function(event, data) {
        PX258.closeDialog(this.node);
    }
});
