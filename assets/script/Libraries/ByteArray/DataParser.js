
window.DataParser = function() {
    this._buffer = null;
    this._headerSize = 8;

    this.parse2 = function (arrBuffer) {
        this._buffer = arrBuffer;
        var pack = this._parseHeader(this._buffer);
        pack.data = ArrayUtils.copyArrayBuffer(this._buffer, this._headerSize, pack.bodySize);
        console.log(pack);
        this.readPacket(pack);
    };

    this._parseHeader = function (buff) {
        var dv = new DataView(buff);
        var pack = new Pack();
        pack.bodySize = dv.getInt32(0);
        pack.bodySize -= this._headerSize;
        pack.cmd = dv.getInt32(4);
        return pack;
    };

    this.readPacket = function(pack) {
        var info = {};
        info.cmd = pack.cmd;
        var uint8View = new Uint8Array(pack.data);
        info.data = this._commonReader.readerPacket(pack.cmd, uint8View);
        console.log(info);
        return info;
    };
};