/**
 * Created by yangyi on 5/18/15.
 */
/**
 * @type {Function}
 */
window.ByteArray = function() {
    this.fmt = [];
    this.data = [];
    this.length = 0;

    this.ctor = function (bytesBuff, endian) {
        this.bytesBuff = bytesBuff;
        this.bytesBuffView = null;
        if (bytesBuff) {
            this.bytesBuffView = new DataView(this.bytesBuff);
        } else {
            this.fmt = [];
            this.data = [];
        }
        this.endian = SocketConf.endian;
        this.position = 0;
        this.length = 0;
        return true;
    };

    this.destroy = function () {
        this.bytesBuff = null;
        this.fmt = null;
        this.data = null;
        this.bytesBuff = null;
        this.bytesBuffView = null;
    };

    this.readByte = function () {
        let val = this.bytesBuffView.getInt8(this.position);
        this.position += 1;
        return val;
    };

    this.writeByte = function (b) {
        this.fmt.push('b');
        this.data.push(b);
        this.length += 1;
    };

    this.readShort = function () {
        let val = this.bytesBuffView.getInt16(this.position, this.endian);
        this.position += 2;
        return val;
    };

    this.writeShort = function (h) {
        this.fmt.push('h');
        this.data.push(h);
        this.length += 2;
    };

    this.readInt = function () {
        let val = this.bytesBuffView.getInt32(this.position, this.endian);
        this.position += 4;
        return val;
    };

    this.writeInt = function (i) {
        this.fmt.push('i');
        this.data.push(i);
        this.length += 4;
    };

    this.readDouble = function () {
        let val = this.bytesBuffView.getFloat64(this.position, this.endian);
        this.position += 8;
        return val;
    };

    this.writeDouble = function (d) {
        this.fmt.push('d');
        this.data.push(d);
        this.length += 8;
    };

    this.readString = function () {
        let l = this.readShort();
        if (l < 1) return '';
        let u8Arr = new Uint8Array(this.bytesBuff, this.position);
        let arr = [];
        for (let i = 0; i < l; i++) {
            arr[i] = u8Arr[i];
        }
        let ret = Utf8Utils.decode(arr);
        this.position += l;
        return ret;
    };

    this.writeMultiByte = function (str) {
        let len = str.length;
        for (let i = 0; i < len; i++) {
            this.writeByte(str.charCodeAt(i));
        }
    };

    this._uintCharArrToString = function (arr) {
        let ret = '';
        for (let i = 0; i < arr.length; i++) {
            ret += String.fromCharCode(arr[i]);
        }
        return ret;
    };

    this.writeString = function (s, writelen) {
        let arr = Utf8Utils.encode(s);
        if (writelen || typeof writelen == "undefined")
            this.writeShort(arr.length);

        this.fmt.push('s');
        this.data.push(this._uintCharArrToString(arr));
        this.length += arr.length;
    };

    this.getbytes = function () {
        if (this.bytesBuff) {
            return this.bytesBuff;
        } else {
            let buff = new ArrayBuffer(this.length);
            let buffView = new DataView(buff);
            let len = this.fmt.length;
            let dataType = '';
            let elm = 0;
            let index = 0;
            for (let i = 0; i < len; i++) {
                dataType = this.fmt[i];
                elm = this.data[i];
                if (dataType == 'b') {
                    buffView.setInt8(index, elm);
                    index += 1;
                } else if (dataType == 'h') {
                    buffView.setInt16(index, elm, this.endian);
                    index += 2;
                } else if (dataType == 'i') {
                    buffView.setInt32(index, elm, this.endian);
                    index += 4;
                } else if (dataType == 'd') {
                    buffView.setFloat64(index, elm, this.endian);
                    index += 8;
                } else if (dataType == 's') {
                    index += this._fillArryBuffWithString(elm, buff, index);
                }
            }
            return buff;
        }
    };

    this._fillArryBuffWithString = function (strData, arryBuff, offset) {
        if (!strData)
            return;
        let len = strData.length;
        let tempDataView = new DataView(arryBuff, offset);
        for (let i = 0; i < len; i++) {
            tempDataView.setUint8(i, strData.charCodeAt(i));
        }
        return len;
    }
};

