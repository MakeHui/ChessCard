cc.Class({
    extends: cc.Component,

    properties: {
        cellData: [],

        stepNumber: cc.Label,

        hu1: cc.Sprite,
        point1: cc.Label,

        hu2: cc.Sprite,
        point2: cc.Label,

        hu3: cc.Sprite,
        point3: cc.Label,

        hu4: cc.Sprite,
        point4: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        // this.cellData = PX258.getTempCache();
        this.cellData = {a:1};
        cc.log(this.cellData.a);

        // cc.log(this,cellData);

        // this.roomNumber.string = "房间号: " + cellData.roomNumber;
        // this.datetime.string = cellData.datetime;
        
        // Tools.setWebImage(this.avatar1, cellData.userList[0].avatar);
        // this.username1.string = cellData.userList[0].username;
        // this.point1.string = "积分:" + cellData.userList[0].username;
        
        // Tools.setWebImage(this.avatar2, cellData.userList[1].avatar);
        // this.username2.string = cellData.userList[1].username;
        // this.point2.string = "积分:" + cellData.userList[1].username;

        // Tools.setWebImage(this.avatar3, cellData.userList[2].avatar);
        // this.username3.string = cellData.userList[2].username;
        // this.point3.string = "积分:" + cellData.userList[2].username;

        // Tools.setWebImage(this.avatar4, cellData.userList[3].avatar);
        // this.username4.string = cellData.userList[3].username;
        // this.point4.string = "积分:" + cellData.userList[3].username;
    },

    playbackOnClick: function() {
        
    }
});
