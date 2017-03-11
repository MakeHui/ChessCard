cc.Class({
    extends: cc.Component,

    properties: {
        gameStep: cc.Prefab,

        roomNumber: cc.Label,
        datetime: cc.Label,

        avatar1: cc.Sprite,
        username1: cc.Label,
        point1: cc.Label,

        avatar2: cc.Sprite,
        username2: cc.Label,
        point2: cc.Label,

        avatar3: cc.Sprite,
        username3: cc.Label,
        point3: cc.Label,

        avatar4: cc.Sprite,
        username4: cc.Label,
        point4: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        var cellData = Global.getTempCache();

        cc.warn(this.cellData);

        this.roomNumber.string = "房间号: " + cellData.roomNumber;
        this.datetime.string = cellData.datetime;
        
        Tools.setWebImage(this.avatar1, cellData.userList[0].avatar);
        this.username1.string = cellData.userList[0].username;
        this.point1.string = "积分:" + cellData.userList[0].username;
        
        Tools.setWebImage(this.avatar2, cellData.userList[1].avatar);
        this.username2.string = cellData.userList[1].username;
        this.point2.string = "积分:" + cellData.userList[1].username;

        Tools.setWebImage(this.avatar3, cellData.userList[2].avatar);
        this.username3.string = cellData.userList[2].username;
        this.point3.string = "积分:" + cellData.userList[2].username;

        Tools.setWebImage(this.avatar4, cellData.userList[3].avatar);
        this.username4.string = cellData.userList[3].username;
        this.point4.string = "积分:" + cellData.userList[3].username;
    },

    openDetailsOnClick: function() {
        Global.openDialog(cc.instantiate(this.gameStep), this.node, function () {
            cc.warn("downloader success");
        });
    }
});
