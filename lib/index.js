'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

var qrcode = createCommonjsModule(function (module, exports) {
//---------------------------------------------------------------------
// QRCode for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
// Re-written in TypeScript by Makito <sumimakito@hotmail.com>
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//   http://www.opensource.org/licenses/mit-license.php
//
// The word "QR Code" is registered trademark of
// DENSO WAVE INCORPORATED
//   http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRMath = exports.QRUtil = exports.QRMaskPattern = exports.QRErrorCorrectLevel = exports.QRCodeModel = void 0;
function checkQRVersion(version, sText, nCorrectLevel) {
    var length = _getUTF8Length(sText);
    var i = version - 1;
    var nLimit = 0;
    switch (nCorrectLevel) {
        case exports.QRErrorCorrectLevel.L:
            nLimit = QRCodeLimitLength[i][0];
            break;
        case exports.QRErrorCorrectLevel.M:
            nLimit = QRCodeLimitLength[i][1];
            break;
        case exports.QRErrorCorrectLevel.Q:
            nLimit = QRCodeLimitLength[i][2];
            break;
        case exports.QRErrorCorrectLevel.H:
            nLimit = QRCodeLimitLength[i][3];
            break;
    }
    return length <= nLimit;
}
function _getTypeNumber(sText, nCorrectLevel) {
    var nType = 1;
    var length = _getUTF8Length(sText);
    for (var i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
        var nLimit = 0;
        switch (nCorrectLevel) {
            case exports.QRErrorCorrectLevel.L:
                nLimit = QRCodeLimitLength[i][0];
                break;
            case exports.QRErrorCorrectLevel.M:
                nLimit = QRCodeLimitLength[i][1];
                break;
            case exports.QRErrorCorrectLevel.Q:
                nLimit = QRCodeLimitLength[i][2];
                break;
            case exports.QRErrorCorrectLevel.H:
                nLimit = QRCodeLimitLength[i][3];
                break;
        }
        if (length <= nLimit) {
            break;
        }
        else {
            nType++;
        }
    }
    if (nType > QRCodeLimitLength.length) {
        throw new Error("Too long data");
    }
    return nType;
}
function _getUTF8Length(sText) {
    var replacedText = encodeURI(sText)
        .toString()
        .replace(/\%[0-9a-fA-F]{2}/g, "a");
    return replacedText.length + (replacedText.length != Number(sText) ? 3 : 0);
}
var QR8bitByte = /** @class */ (function () {
    function QR8bitByte(data) {
        this.mode = QRMode.MODE_8BIT_BYTE;
        this.parsedData = [];
        this.data = data;
        var byteArrays = [];
        // Added to support UTF-8 Characters
        for (var i = 0, l = this.data.length; i < l; i++) {
            var byteArray = [];
            var code = this.data.charCodeAt(i);
            if (code > 0x10000) {
                byteArray[0] = 0xf0 | ((code & 0x1c0000) >>> 18);
                byteArray[1] = 0x80 | ((code & 0x3f000) >>> 12);
                byteArray[2] = 0x80 | ((code & 0xfc0) >>> 6);
                byteArray[3] = 0x80 | (code & 0x3f);
            }
            else if (code > 0x800) {
                byteArray[0] = 0xe0 | ((code & 0xf000) >>> 12);
                byteArray[1] = 0x80 | ((code & 0xfc0) >>> 6);
                byteArray[2] = 0x80 | (code & 0x3f);
            }
            else if (code > 0x80) {
                byteArray[0] = 0xc0 | ((code & 0x7c0) >>> 6);
                byteArray[1] = 0x80 | (code & 0x3f);
            }
            else {
                byteArray[0] = code;
            }
            byteArrays.push(byteArray);
        }
        this.parsedData = Array.prototype.concat.apply([], byteArrays);
        if (this.parsedData.length != this.data.length) {
            this.parsedData.unshift(191);
            this.parsedData.unshift(187);
            this.parsedData.unshift(239);
        }
    }
    QR8bitByte.prototype.getLength = function () {
        return this.parsedData.length;
    };
    QR8bitByte.prototype.write = function (buffer) {
        for (var i = 0, l = this.parsedData.length; i < l; i++) {
            buffer.put(this.parsedData[i], 8);
        }
    };
    return QR8bitByte;
}());
var QRCodeModel = /** @class */ (function () {
    function QRCodeModel(typeNumber, errorCorrectLevel) {
        if (typeNumber === void 0) { typeNumber = -1; }
        if (errorCorrectLevel === void 0) { errorCorrectLevel = exports.QRErrorCorrectLevel.L; }
        this.moduleCount = 0;
        this.dataList = [];
        this.typeNumber = typeNumber;
        this.errorCorrectLevel = errorCorrectLevel;
        this.moduleCount = 0;
        this.dataList = [];
    }
    QRCodeModel.prototype.addData = function (data) {
        if (this.typeNumber <= 0) {
            this.typeNumber = _getTypeNumber(data, this.errorCorrectLevel);
        }
        else if (this.typeNumber > 40) {
            throw new Error("Invalid QR version: " + this.typeNumber);
        }
        else {
            if (!checkQRVersion(this.typeNumber, data, this.errorCorrectLevel)) {
                throw new Error("Data is too long for QR version: " + this.typeNumber);
            }
        }
        var newData = new QR8bitByte(data);
        this.dataList.push(newData);
        this.dataCache = undefined;
    };
    QRCodeModel.prototype.isDark = function (row, col) {
        if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
            throw new Error(row + "," + col);
        }
        return this.modules[row][col];
    };
    QRCodeModel.prototype.getModuleCount = function () {
        return this.moduleCount;
    };
    QRCodeModel.prototype.make = function () {
        this.makeImpl(false, this.getBestMaskPattern());
    };
    QRCodeModel.prototype.makeImpl = function (test, maskPattern) {
        this.moduleCount = this.typeNumber * 4 + 17;
        this.modules = new Array(this.moduleCount);
        for (var row = 0; row < this.moduleCount; row++) {
            this.modules[row] = new Array(this.moduleCount);
            for (var col = 0; col < this.moduleCount; col++) {
                this.modules[row][col] = null;
            }
        }
        this.setupPositionProbePattern(0, 0);
        this.setupPositionProbePattern(this.moduleCount - 7, 0);
        this.setupPositionProbePattern(0, this.moduleCount - 7);
        this.setupPositionAdjustPattern();
        this.setupTimingPattern();
        this.setupTypeInfo(test, maskPattern);
        if (this.typeNumber >= 7) {
            this.setupTypeNumber(test);
        }
        if (this.dataCache == null) {
            this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
        }
        this.mapData(this.dataCache, maskPattern);
    };
    QRCodeModel.prototype.setupPositionProbePattern = function (row, col) {
        for (var r = -1; r <= 7; r++) {
            if (row + r <= -1 || this.moduleCount <= row + r)
                continue;
            for (var c = -1; c <= 7; c++) {
                if (col + c <= -1 || this.moduleCount <= col + c)
                    continue;
                if ((0 <= r && r <= 6 && (c == 0 || c == 6)) ||
                    (0 <= c && c <= 6 && (r == 0 || r == 6)) ||
                    (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
                    this.modules[row + r][col + c] = true;
                }
                else {
                    this.modules[row + r][col + c] = false;
                }
            }
        }
    };
    QRCodeModel.prototype.getBestMaskPattern = function () {
        if (Number.isInteger(this.maskPattern) && Object.values(exports.QRMaskPattern).includes(this.maskPattern)) {
            return this.maskPattern;
        }
        var minLostPoint = 0;
        var pattern = 0;
        for (var i = 0; i < 8; i++) {
            this.makeImpl(true, i);
            var lostPoint = QRUtil.getLostPoint(this);
            if (i == 0 || minLostPoint > lostPoint) {
                minLostPoint = lostPoint;
                pattern = i;
            }
        }
        return pattern;
    };
    QRCodeModel.prototype.setupTimingPattern = function () {
        for (var r = 8; r < this.moduleCount - 8; r++) {
            if (this.modules[r][6] != null) {
                continue;
            }
            this.modules[r][6] = r % 2 == 0;
        }
        for (var c = 8; c < this.moduleCount - 8; c++) {
            if (this.modules[6][c] != null) {
                continue;
            }
            this.modules[6][c] = c % 2 == 0;
        }
    };
    QRCodeModel.prototype.setupPositionAdjustPattern = function () {
        var pos = QRUtil.getPatternPosition(this.typeNumber);
        for (var i = 0; i < pos.length; i++) {
            for (var j = 0; j < pos.length; j++) {
                var row = pos[i];
                var col = pos[j];
                if (this.modules[row][col] != null) {
                    continue;
                }
                for (var r = -2; r <= 2; r++) {
                    for (var c = -2; c <= 2; c++) {
                        if (r == -2 || r == 2 || c == -2 || c == 2 || (r == 0 && c == 0)) {
                            this.modules[row + r][col + c] = true;
                        }
                        else {
                            this.modules[row + r][col + c] = false;
                        }
                    }
                }
            }
        }
    };
    QRCodeModel.prototype.setupTypeNumber = function (test) {
        var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
        for (var i = 0; i < 18; i++) {
            var mod = !test && ((bits >> i) & 1) == 1;
            this.modules[Math.floor(i / 3)][(i % 3) + this.moduleCount - 8 - 3] = mod;
        }
        for (var i = 0; i < 18; i++) {
            var mod = !test && ((bits >> i) & 1) == 1;
            this.modules[(i % 3) + this.moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
        }
    };
    QRCodeModel.prototype.setupTypeInfo = function (test, maskPattern) {
        var data = (this.errorCorrectLevel << 3) | maskPattern;
        var bits = QRUtil.getBCHTypeInfo(data);
        for (var i = 0; i < 15; i++) {
            var mod = !test && ((bits >> i) & 1) == 1;
            if (i < 6) {
                this.modules[i][8] = mod;
            }
            else if (i < 8) {
                this.modules[i + 1][8] = mod;
            }
            else {
                this.modules[this.moduleCount - 15 + i][8] = mod;
            }
        }
        for (var i = 0; i < 15; i++) {
            var mod = !test && ((bits >> i) & 1) == 1;
            if (i < 8) {
                this.modules[8][this.moduleCount - i - 1] = mod;
            }
            else if (i < 9) {
                this.modules[8][15 - i - 1 + 1] = mod;
            }
            else {
                this.modules[8][15 - i - 1] = mod;
            }
        }
        this.modules[this.moduleCount - 8][8] = !test;
    };
    QRCodeModel.prototype.mapData = function (data, maskPattern) {
        var inc = -1;
        var row = this.moduleCount - 1;
        var bitIndex = 7;
        var byteIndex = 0;
        for (var col = this.moduleCount - 1; col > 0; col -= 2) {
            if (col == 6)
                col--;
            while (true) {
                for (var c = 0; c < 2; c++) {
                    if (this.modules[row][col - c] == null) {
                        var dark = false;
                        if (byteIndex < data.length) {
                            dark = ((data[byteIndex] >>> bitIndex) & 1) == 1;
                        }
                        var mask = QRUtil.getMask(maskPattern, row, col - c);
                        if (mask) {
                            dark = !dark;
                        }
                        this.modules[row][col - c] = dark;
                        bitIndex--;
                        if (bitIndex == -1) {
                            byteIndex++;
                            bitIndex = 7;
                        }
                    }
                }
                row += inc;
                if (row < 0 || this.moduleCount <= row) {
                    row -= inc;
                    inc = -inc;
                    break;
                }
            }
        }
    };
    QRCodeModel.createData = function (typeNumber, errorCorrectLevel, dataList) {
        var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
        var buffer = new QRBitBuffer();
        for (var i = 0; i < dataList.length; i++) {
            var data = dataList[i];
            buffer.put(data.mode, 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
            data.write(buffer);
        }
        var totalDataCount = 0;
        for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
        }
        if (buffer.getLengthInBits() > totalDataCount * 8) {
            throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")");
        }
        if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
            buffer.put(0, 4);
        }
        while (buffer.getLengthInBits() % 8 != 0) {
            buffer.putBit(false);
        }
        while (true) {
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
                break;
            }
            buffer.put(QRCodeModel.PAD0, 8);
            if (buffer.getLengthInBits() >= totalDataCount * 8) {
                break;
            }
            buffer.put(QRCodeModel.PAD1, 8);
        }
        return QRCodeModel.createBytes(buffer, rsBlocks);
    };
    QRCodeModel.createBytes = function (buffer, rsBlocks) {
        var offset = 0;
        var maxDcCount = 0;
        var maxEcCount = 0;
        var dcdata = new Array(rsBlocks.length);
        var ecdata = new Array(rsBlocks.length);
        for (var r = 0; r < rsBlocks.length; r++) {
            var dcCount = rsBlocks[r].dataCount;
            var ecCount = rsBlocks[r].totalCount - dcCount;
            maxDcCount = Math.max(maxDcCount, dcCount);
            maxEcCount = Math.max(maxEcCount, ecCount);
            dcdata[r] = new Array(dcCount);
            for (var i = 0; i < dcdata[r].length; i++) {
                dcdata[r][i] = 0xff & buffer.buffer[i + offset];
            }
            offset += dcCount;
            var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
            var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
            var modPoly = rawPoly.mod(rsPoly);
            ecdata[r] = new Array(rsPoly.getLength() - 1);
            for (var i = 0; i < ecdata[r].length; i++) {
                var modIndex = i + modPoly.getLength() - ecdata[r].length;
                ecdata[r][i] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
            }
        }
        var totalCodeCount = 0;
        for (var i = 0; i < rsBlocks.length; i++) {
            totalCodeCount += rsBlocks[i].totalCount;
        }
        var data = new Array(totalCodeCount);
        var index = 0;
        for (var i = 0; i < maxDcCount; i++) {
            for (var r = 0; r < rsBlocks.length; r++) {
                if (i < dcdata[r].length) {
                    data[index++] = dcdata[r][i];
                }
            }
        }
        for (var i = 0; i < maxEcCount; i++) {
            for (var r = 0; r < rsBlocks.length; r++) {
                if (i < ecdata[r].length) {
                    data[index++] = ecdata[r][i];
                }
            }
        }
        return data;
    };
    QRCodeModel.PAD0 = 0xec;
    QRCodeModel.PAD1 = 0x11;
    return QRCodeModel;
}());
exports.QRCodeModel = QRCodeModel;
exports.QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 };
var QRMode = { MODE_NUMBER: 1 << 0, MODE_ALPHA_NUM: 1 << 1, MODE_8BIT_BYTE: 1 << 2, MODE_KANJI: 1 << 3 };
exports.QRMaskPattern = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7,
};
var QRUtil = /** @class */ (function () {
    function QRUtil() {
    }
    QRUtil.getBCHTypeInfo = function (data) {
        var d = data << 10;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
            d ^= QRUtil.G15 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15));
        }
        return ((data << 10) | d) ^ QRUtil.G15_MASK;
    };
    QRUtil.getBCHTypeNumber = function (data) {
        var d = data << 12;
        while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
            d ^= QRUtil.G18 << (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18));
        }
        return (data << 12) | d;
    };
    QRUtil.getBCHDigit = function (data) {
        var digit = 0;
        while (data != 0) {
            digit++;
            data >>>= 1;
        }
        return digit;
    };
    QRUtil.getPatternPosition = function (typeNumber) {
        return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    };
    QRUtil.getMask = function (maskPattern, i, j) {
        switch (maskPattern) {
            case exports.QRMaskPattern.PATTERN000:
                return (i + j) % 2 == 0;
            case exports.QRMaskPattern.PATTERN001:
                return i % 2 == 0;
            case exports.QRMaskPattern.PATTERN010:
                return j % 3 == 0;
            case exports.QRMaskPattern.PATTERN011:
                return (i + j) % 3 == 0;
            case exports.QRMaskPattern.PATTERN100:
                return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
            case exports.QRMaskPattern.PATTERN101:
                return ((i * j) % 2) + ((i * j) % 3) == 0;
            case exports.QRMaskPattern.PATTERN110:
                return (((i * j) % 2) + ((i * j) % 3)) % 2 == 0;
            case exports.QRMaskPattern.PATTERN111:
                return (((i * j) % 3) + ((i + j) % 2)) % 2 == 0;
            default:
                throw new Error("bad maskPattern:" + maskPattern);
        }
    };
    QRUtil.getErrorCorrectPolynomial = function (errorCorrectLength) {
        var a = new QRPolynomial([1], 0);
        for (var i = 0; i < errorCorrectLength; i++) {
            a = a.multiply(new QRPolynomial([1, QRMath.gexp(i)], 0));
        }
        return a;
    };
    QRUtil.getLengthInBits = function (mode, type) {
        if (1 <= type && type < 10) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 10;
                case QRMode.MODE_ALPHA_NUM:
                    return 9;
                case QRMode.MODE_8BIT_BYTE:
                    return 8;
                case QRMode.MODE_KANJI:
                    return 8;
                default:
                    throw new Error("mode:" + mode);
            }
        }
        else if (type < 27) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 12;
                case QRMode.MODE_ALPHA_NUM:
                    return 11;
                case QRMode.MODE_8BIT_BYTE:
                    return 16;
                case QRMode.MODE_KANJI:
                    return 10;
                default:
                    throw new Error("mode:" + mode);
            }
        }
        else if (type < 41) {
            switch (mode) {
                case QRMode.MODE_NUMBER:
                    return 14;
                case QRMode.MODE_ALPHA_NUM:
                    return 13;
                case QRMode.MODE_8BIT_BYTE:
                    return 16;
                case QRMode.MODE_KANJI:
                    return 12;
                default:
                    throw new Error("mode:" + mode);
            }
        }
        else {
            throw new Error("type:" + type);
        }
    };
    QRUtil.getLostPoint = function (qrCode) {
        var moduleCount = qrCode.getModuleCount();
        var lostPoint = 0;
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount; col++) {
                var sameCount = 0;
                var dark = qrCode.isDark(row, col);
                for (var r = -1; r <= 1; r++) {
                    if (row + r < 0 || moduleCount <= row + r) {
                        continue;
                    }
                    for (var c = -1; c <= 1; c++) {
                        if (col + c < 0 || moduleCount <= col + c) {
                            continue;
                        }
                        if (r == 0 && c == 0) {
                            continue;
                        }
                        if (dark == qrCode.isDark(row + r, col + c)) {
                            sameCount++;
                        }
                    }
                }
                if (sameCount > 5) {
                    lostPoint += 3 + sameCount - 5;
                }
            }
        }
        for (var row = 0; row < moduleCount - 1; row++) {
            for (var col = 0; col < moduleCount - 1; col++) {
                var count = 0;
                if (qrCode.isDark(row, col))
                    count++;
                if (qrCode.isDark(row + 1, col))
                    count++;
                if (qrCode.isDark(row, col + 1))
                    count++;
                if (qrCode.isDark(row + 1, col + 1))
                    count++;
                if (count == 0 || count == 4) {
                    lostPoint += 3;
                }
            }
        }
        for (var row = 0; row < moduleCount; row++) {
            for (var col = 0; col < moduleCount - 6; col++) {
                if (qrCode.isDark(row, col) &&
                    !qrCode.isDark(row, col + 1) &&
                    qrCode.isDark(row, col + 2) &&
                    qrCode.isDark(row, col + 3) &&
                    qrCode.isDark(row, col + 4) &&
                    !qrCode.isDark(row, col + 5) &&
                    qrCode.isDark(row, col + 6)) {
                    lostPoint += 40;
                }
            }
        }
        for (var col = 0; col < moduleCount; col++) {
            for (var row = 0; row < moduleCount - 6; row++) {
                if (qrCode.isDark(row, col) &&
                    !qrCode.isDark(row + 1, col) &&
                    qrCode.isDark(row + 2, col) &&
                    qrCode.isDark(row + 3, col) &&
                    qrCode.isDark(row + 4, col) &&
                    !qrCode.isDark(row + 5, col) &&
                    qrCode.isDark(row + 6, col)) {
                    lostPoint += 40;
                }
            }
        }
        var darkCount = 0;
        for (var col = 0; col < moduleCount; col++) {
            for (var row = 0; row < moduleCount; row++) {
                if (qrCode.isDark(row, col)) {
                    darkCount++;
                }
            }
        }
        var ratio = Math.abs((100 * darkCount) / moduleCount / moduleCount - 50) / 5;
        lostPoint += ratio * 10;
        return lostPoint;
    };
    QRUtil.PATTERN_POSITION_TABLE = [
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
        [6, 30, 54],
        [6, 32, 58],
        [6, 34, 62],
        [6, 26, 46, 66],
        [6, 26, 48, 70],
        [6, 26, 50, 74],
        [6, 30, 54, 78],
        [6, 30, 56, 82],
        [6, 30, 58, 86],
        [6, 34, 62, 90],
        [6, 28, 50, 72, 94],
        [6, 26, 50, 74, 98],
        [6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],
        [6, 32, 58, 84, 110],
        [6, 30, 58, 86, 114],
        [6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],
        [6, 30, 54, 78, 102, 126],
        [6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],
        [6, 34, 60, 86, 112, 138],
        [6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],
        [6, 30, 54, 78, 102, 126, 150],
        [6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],
        [6, 32, 58, 84, 110, 136, 162],
        [6, 26, 54, 82, 110, 138, 166],
        [6, 30, 58, 86, 114, 142, 170],
    ];
    QRUtil.G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    QRUtil.G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    QRUtil.G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);
    return QRUtil;
}());
exports.QRUtil = QRUtil;
var QRMath = /** @class */ (function () {
    function QRMath() {
    }
    QRMath.glog = function (n) {
        if (n < 1) {
            throw new Error("glog(" + n + ")");
        }
        return QRMath.LOG_TABLE[n];
    };
    QRMath.gexp = function (n) {
        while (n < 0) {
            n += 255;
        }
        while (n >= 256) {
            n -= 255;
        }
        return QRMath.EXP_TABLE[n];
    };
    QRMath.EXP_TABLE = new Array(256);
    QRMath.LOG_TABLE = new Array(256);
    QRMath._constructor = (function () {
        for (var i = 0; i < 8; i++) {
            QRMath.EXP_TABLE[i] = 1 << i;
        }
        for (var i = 8; i < 256; i++) {
            QRMath.EXP_TABLE[i] =
                QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
        }
        for (var i = 0; i < 255; i++) {
            QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
        }
    })();
    return QRMath;
}());
exports.QRMath = QRMath;
var QRPolynomial = /** @class */ (function () {
    function QRPolynomial(num, shift) {
        if (num.length == undefined) {
            throw new Error(num.length + "/" + shift);
        }
        var offset = 0;
        while (offset < num.length && num[offset] == 0) {
            offset++;
        }
        this.num = new Array(num.length - offset + shift);
        for (var i = 0; i < num.length - offset; i++) {
            this.num[i] = num[i + offset];
        }
    }
    QRPolynomial.prototype.get = function (index) {
        return this.num[index];
    };
    QRPolynomial.prototype.getLength = function () {
        return this.num.length;
    };
    QRPolynomial.prototype.multiply = function (e) {
        var num = new Array(this.getLength() + e.getLength() - 1);
        for (var i = 0; i < this.getLength(); i++) {
            for (var j = 0; j < e.getLength(); j++) {
                num[i + j] ^= QRMath.gexp(QRMath.glog(this.get(i)) + QRMath.glog(e.get(j)));
            }
        }
        return new QRPolynomial(num, 0);
    };
    QRPolynomial.prototype.mod = function (e) {
        if (this.getLength() - e.getLength() < 0) {
            return this;
        }
        var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
        var num = new Array(this.getLength());
        for (var i = 0; i < this.getLength(); i++) {
            num[i] = this.get(i);
        }
        for (var i = 0; i < e.getLength(); i++) {
            num[i] ^= QRMath.gexp(QRMath.glog(e.get(i)) + ratio);
        }
        return new QRPolynomial(num, 0).mod(e);
    };
    return QRPolynomial;
}());
var QRRSBlock = /** @class */ (function () {
    function QRRSBlock(totalCount, dataCount) {
        this.totalCount = totalCount;
        this.dataCount = dataCount;
    }
    QRRSBlock.getRSBlocks = function (typeNumber, errorCorrectLevel) {
        var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
        if (rsBlock == undefined) {
            throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
        }
        var length = rsBlock.length / 3;
        var list = [];
        for (var i = 0; i < length; i++) {
            var count = rsBlock[i * 3 + 0];
            var totalCount = rsBlock[i * 3 + 1];
            var dataCount = rsBlock[i * 3 + 2];
            for (var j = 0; j < count; j++) {
                list.push(new QRRSBlock(totalCount, dataCount));
            }
        }
        return list;
    };
    QRRSBlock.getRsBlockTable = function (typeNumber, errorCorrectLevel) {
        switch (errorCorrectLevel) {
            case exports.QRErrorCorrectLevel.L:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
            case exports.QRErrorCorrectLevel.M:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
            case exports.QRErrorCorrectLevel.Q:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
            case exports.QRErrorCorrectLevel.H:
                return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
            default:
                return undefined;
        }
    };
    QRRSBlock.RS_BLOCK_TABLE = [
        [1, 26, 19],
        [1, 26, 16],
        [1, 26, 13],
        [1, 26, 9],
        [1, 44, 34],
        [1, 44, 28],
        [1, 44, 22],
        [1, 44, 16],
        [1, 70, 55],
        [1, 70, 44],
        [2, 35, 17],
        [2, 35, 13],
        [1, 100, 80],
        [2, 50, 32],
        [2, 50, 24],
        [4, 25, 9],
        [1, 134, 108],
        [2, 67, 43],
        [2, 33, 15, 2, 34, 16],
        [2, 33, 11, 2, 34, 12],
        [2, 86, 68],
        [4, 43, 27],
        [4, 43, 19],
        [4, 43, 15],
        [2, 98, 78],
        [4, 49, 31],
        [2, 32, 14, 4, 33, 15],
        [4, 39, 13, 1, 40, 14],
        [2, 121, 97],
        [2, 60, 38, 2, 61, 39],
        [4, 40, 18, 2, 41, 19],
        [4, 40, 14, 2, 41, 15],
        [2, 146, 116],
        [3, 58, 36, 2, 59, 37],
        [4, 36, 16, 4, 37, 17],
        [4, 36, 12, 4, 37, 13],
        [2, 86, 68, 2, 87, 69],
        [4, 69, 43, 1, 70, 44],
        [6, 43, 19, 2, 44, 20],
        [6, 43, 15, 2, 44, 16],
        [4, 101, 81],
        [1, 80, 50, 4, 81, 51],
        [4, 50, 22, 4, 51, 23],
        [3, 36, 12, 8, 37, 13],
        [2, 116, 92, 2, 117, 93],
        [6, 58, 36, 2, 59, 37],
        [4, 46, 20, 6, 47, 21],
        [7, 42, 14, 4, 43, 15],
        [4, 133, 107],
        [8, 59, 37, 1, 60, 38],
        [8, 44, 20, 4, 45, 21],
        [12, 33, 11, 4, 34, 12],
        [3, 145, 115, 1, 146, 116],
        [4, 64, 40, 5, 65, 41],
        [11, 36, 16, 5, 37, 17],
        [11, 36, 12, 5, 37, 13],
        [5, 109, 87, 1, 110, 88],
        [5, 65, 41, 5, 66, 42],
        [5, 54, 24, 7, 55, 25],
        [11, 36, 12],
        [5, 122, 98, 1, 123, 99],
        [7, 73, 45, 3, 74, 46],
        [15, 43, 19, 2, 44, 20],
        [3, 45, 15, 13, 46, 16],
        [1, 135, 107, 5, 136, 108],
        [10, 74, 46, 1, 75, 47],
        [1, 50, 22, 15, 51, 23],
        [2, 42, 14, 17, 43, 15],
        [5, 150, 120, 1, 151, 121],
        [9, 69, 43, 4, 70, 44],
        [17, 50, 22, 1, 51, 23],
        [2, 42, 14, 19, 43, 15],
        [3, 141, 113, 4, 142, 114],
        [3, 70, 44, 11, 71, 45],
        [17, 47, 21, 4, 48, 22],
        [9, 39, 13, 16, 40, 14],
        [3, 135, 107, 5, 136, 108],
        [3, 67, 41, 13, 68, 42],
        [15, 54, 24, 5, 55, 25],
        [15, 43, 15, 10, 44, 16],
        [4, 144, 116, 4, 145, 117],
        [17, 68, 42],
        [17, 50, 22, 6, 51, 23],
        [19, 46, 16, 6, 47, 17],
        [2, 139, 111, 7, 140, 112],
        [17, 74, 46],
        [7, 54, 24, 16, 55, 25],
        [34, 37, 13],
        [4, 151, 121, 5, 152, 122],
        [4, 75, 47, 14, 76, 48],
        [11, 54, 24, 14, 55, 25],
        [16, 45, 15, 14, 46, 16],
        [6, 147, 117, 4, 148, 118],
        [6, 73, 45, 14, 74, 46],
        [11, 54, 24, 16, 55, 25],
        [30, 46, 16, 2, 47, 17],
        [8, 132, 106, 4, 133, 107],
        [8, 75, 47, 13, 76, 48],
        [7, 54, 24, 22, 55, 25],
        [22, 45, 15, 13, 46, 16],
        [10, 142, 114, 2, 143, 115],
        [19, 74, 46, 4, 75, 47],
        [28, 50, 22, 6, 51, 23],
        [33, 46, 16, 4, 47, 17],
        [8, 152, 122, 4, 153, 123],
        [22, 73, 45, 3, 74, 46],
        [8, 53, 23, 26, 54, 24],
        [12, 45, 15, 28, 46, 16],
        [3, 147, 117, 10, 148, 118],
        [3, 73, 45, 23, 74, 46],
        [4, 54, 24, 31, 55, 25],
        [11, 45, 15, 31, 46, 16],
        [7, 146, 116, 7, 147, 117],
        [21, 73, 45, 7, 74, 46],
        [1, 53, 23, 37, 54, 24],
        [19, 45, 15, 26, 46, 16],
        [5, 145, 115, 10, 146, 116],
        [19, 75, 47, 10, 76, 48],
        [15, 54, 24, 25, 55, 25],
        [23, 45, 15, 25, 46, 16],
        [13, 145, 115, 3, 146, 116],
        [2, 74, 46, 29, 75, 47],
        [42, 54, 24, 1, 55, 25],
        [23, 45, 15, 28, 46, 16],
        [17, 145, 115],
        [10, 74, 46, 23, 75, 47],
        [10, 54, 24, 35, 55, 25],
        [19, 45, 15, 35, 46, 16],
        [17, 145, 115, 1, 146, 116],
        [14, 74, 46, 21, 75, 47],
        [29, 54, 24, 19, 55, 25],
        [11, 45, 15, 46, 46, 16],
        [13, 145, 115, 6, 146, 116],
        [14, 74, 46, 23, 75, 47],
        [44, 54, 24, 7, 55, 25],
        [59, 46, 16, 1, 47, 17],
        [12, 151, 121, 7, 152, 122],
        [12, 75, 47, 26, 76, 48],
        [39, 54, 24, 14, 55, 25],
        [22, 45, 15, 41, 46, 16],
        [6, 151, 121, 14, 152, 122],
        [6, 75, 47, 34, 76, 48],
        [46, 54, 24, 10, 55, 25],
        [2, 45, 15, 64, 46, 16],
        [17, 152, 122, 4, 153, 123],
        [29, 74, 46, 14, 75, 47],
        [49, 54, 24, 10, 55, 25],
        [24, 45, 15, 46, 46, 16],
        [4, 152, 122, 18, 153, 123],
        [13, 74, 46, 32, 75, 47],
        [48, 54, 24, 14, 55, 25],
        [42, 45, 15, 32, 46, 16],
        [20, 147, 117, 4, 148, 118],
        [40, 75, 47, 7, 76, 48],
        [43, 54, 24, 22, 55, 25],
        [10, 45, 15, 67, 46, 16],
        [19, 148, 118, 6, 149, 119],
        [18, 75, 47, 31, 76, 48],
        [34, 54, 24, 34, 55, 25],
        [20, 45, 15, 61, 46, 16],
    ];
    return QRRSBlock;
}());
var QRBitBuffer = /** @class */ (function () {
    function QRBitBuffer() {
        this.buffer = [];
        this.length = 0;
    }
    QRBitBuffer.prototype.get = function (index) {
        var bufIndex = Math.floor(index / 8);
        return ((this.buffer[bufIndex] >>> (7 - (index % 8))) & 1) == 1;
    };
    QRBitBuffer.prototype.put = function (num, length) {
        for (var i = 0; i < length; i++) {
            this.putBit(((num >>> (length - i - 1)) & 1) == 1);
        }
    };
    QRBitBuffer.prototype.getLengthInBits = function () {
        return this.length;
    };
    QRBitBuffer.prototype.putBit = function (bit) {
        var bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
            this.buffer.push(0);
        }
        if (bit) {
            this.buffer[bufIndex] |= 0x80 >>> this.length % 8;
        }
        this.length++;
    };
    return QRBitBuffer;
}());
var QRCodeLimitLength = [
    [17, 14, 11, 7],
    [32, 26, 20, 14],
    [53, 42, 32, 24],
    [78, 62, 46, 34],
    [106, 84, 60, 44],
    [134, 106, 74, 58],
    [154, 122, 86, 64],
    [192, 152, 108, 84],
    [230, 180, 130, 98],
    [271, 213, 151, 119],
    [321, 251, 177, 137],
    [367, 287, 203, 155],
    [425, 331, 241, 177],
    [458, 362, 258, 194],
    [520, 412, 292, 220],
    [586, 450, 322, 250],
    [644, 504, 364, 280],
    [718, 560, 394, 310],
    [792, 624, 442, 338],
    [858, 666, 482, 382],
    [929, 711, 509, 403],
    [1003, 779, 565, 439],
    [1091, 857, 611, 461],
    [1171, 911, 661, 511],
    [1273, 997, 715, 535],
    [1367, 1059, 751, 593],
    [1465, 1125, 805, 625],
    [1528, 1190, 868, 658],
    [1628, 1264, 908, 698],
    [1732, 1370, 982, 742],
    [1840, 1452, 1030, 790],
    [1952, 1538, 1112, 842],
    [2068, 1628, 1168, 898],
    [2188, 1722, 1228, 958],
    [2303, 1809, 1283, 983],
    [2431, 1911, 1351, 1051],
    [2563, 1989, 1423, 1093],
    [2699, 2099, 1499, 1139],
    [2809, 2213, 1579, 1219],
    [2953, 2331, 1663, 1273],
];
});

/**
 * Font RegExp helpers.
 */

const weights = 'bold|bolder|lighter|[1-9]00'
  , styles = 'italic|oblique'
  , variants = 'small-caps'
  , stretches = 'ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded'
  , units = 'px|pt|pc|in|cm|mm|%|em|ex|ch|rem|q'
  , string = '\'([^\']+)\'|"([^"]+)"|[\\w\\s-]+';

// [ [ <‘font-style’> || <font-variant-css21> || <‘font-weight’> || <‘font-stretch’> ]?
//    <‘font-size’> [ / <‘line-height’> ]? <‘font-family’> ]
// https://drafts.csswg.org/css-fonts-3/#font-prop
const weightRe = new RegExp('(' + weights + ') +', 'i');
const styleRe = new RegExp('(' + styles + ') +', 'i');
const variantRe = new RegExp('(' + variants + ') +', 'i');
const stretchRe = new RegExp('(' + stretches + ') +', 'i');
const sizeFamilyRe = new RegExp(
  '([\\d\\.]+)(' + units + ') *'
  + '((?:' + string + ')( *, *(?:' + string + '))*)');

/**
 * Cache font parsing.
 */

const cache = {};

const defaultHeight = 16; // pt, common browser default

/**
 * Parse font `str`.
 *
 * @param {String} str
 * @return {Object} Parsed font. `size` is in device units. `unit` is the unit
 *   appearing in the input string.
 * @api private
 */

var parseFont = function (str) {
  // Cached
  if (cache[str]) return cache[str]

  // Try for required properties first.
  const sizeFamily = sizeFamilyRe.exec(str);
  if (!sizeFamily) return // invalid

  // Default values and required properties
  const font = {
    weight: 'normal',
    style: 'normal',
    stretch: 'normal',
    variant: 'normal',
    size: parseFloat(sizeFamily[1]),
    unit: sizeFamily[2],
    family: sizeFamily[3].replace(/["']/g, '').replace(/ *, */g, ',')
  };

  // Optional, unordered properties.
  let weight, style, variant, stretch;
  // Stop search at `sizeFamily.index`
  let substr = str.substring(0, sizeFamily.index);
  if ((weight = weightRe.exec(substr))) font.weight = weight[1];
  if ((style = styleRe.exec(substr))) font.style = style[1];
  if ((variant = variantRe.exec(substr))) font.variant = variant[1];
  if ((stretch = stretchRe.exec(substr))) font.stretch = stretch[1];

  // Convert to device units. (`font.unit` is the original unit)
  // TODO: ch, ex
  switch (font.unit) {
    case 'pt':
      font.size /= 0.75;
      break
    case 'pc':
      font.size *= 16;
      break
    case 'in':
      font.size *= 96;
      break
    case 'cm':
      font.size *= 96.0 / 2.54;
      break
    case 'mm':
      font.size *= 96.0 / 25.4;
      break
    case '%':
      // TODO disabled because existing unit tests assume 100
      // font.size *= defaultHeight / 100 / 0.75
      break
    case 'em':
    case 'rem':
      font.size *= defaultHeight / 0.75;
      break
    case 'q':
      font.size *= 96 / 25.4 / 4;
      break
  }

  return (cache[str] = font)
};

/* globals document, ImageData */

var parseFont_1 = parseFont;

var createCanvas = function (width, height) {
  return Object.assign(document.createElement('canvas'), { width: width, height: height })
};

var createImageData = function (array, width, height) {
  // Browser implementation of ImageData looks at the number of arguments passed
  switch (arguments.length) {
    case 0: return new ImageData()
    case 1: return new ImageData(array)
    case 2: return new ImageData(array, width)
    default: return new ImageData(array, width, height)
  }
};

var loadImage = function (src, options) {
  return new Promise(function (resolve, reject) {
    const image = Object.assign(document.createElement('img'), options);

    function cleanup () {
      image.onload = null;
      image.onerror = null;
    }

    image.onload = function () { cleanup(); resolve(image); };
    image.onerror = function () { cleanup(); reject(new Error('Failed to load the image "' + src + '"')); };

    image.src = src;
  })
};

var browser = {
	parseFont: parseFont_1,
	createCanvas: createCanvas,
	createImageData: createImageData,
	loadImage: loadImage
};

var lib = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loop = exports.conditional = exports.parse = void 0;

var parse = function parse(stream, schema) {
  var result = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var parent = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : result;

  if (Array.isArray(schema)) {
    schema.forEach(function (partSchema) {
      return parse(stream, partSchema, result, parent);
    });
  } else if (typeof schema === 'function') {
    schema(stream, result, parent, parse);
  } else {
    var key = Object.keys(schema)[0];

    if (Array.isArray(schema[key])) {
      parent[key] = {};
      parse(stream, schema[key], result, parent[key]);
    } else {
      parent[key] = schema[key](stream, result, parent, parse);
    }
  }

  return result;
};

exports.parse = parse;

var conditional = function conditional(schema, conditionFunc) {
  return function (stream, result, parent, parse) {
    if (conditionFunc(stream, result, parent)) {
      parse(stream, schema, result, parent);
    }
  };
};

exports.conditional = conditional;

var loop = function loop(schema, continueFunc) {
  return function (stream, result, parent, parse) {
    var arr = [];

    while (continueFunc(stream, result, parent)) {
      var newParent = {};
      parse(stream, schema, result, newParent);
      arr.push(newParent);
    }

    return arr;
  };
};

exports.loop = loop;
});

var uint8 = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readBits = exports.readArray = exports.readUnsigned = exports.readString = exports.peekBytes = exports.readBytes = exports.peekByte = exports.readByte = exports.buildStream = void 0;

// Default stream and parsers for Uint8TypedArray data type
var buildStream = function buildStream(uint8Data) {
  return {
    data: uint8Data,
    pos: 0
  };
};

exports.buildStream = buildStream;

var readByte = function readByte() {
  return function (stream) {
    return stream.data[stream.pos++];
  };
};

exports.readByte = readByte;

var peekByte = function peekByte() {
  var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return function (stream) {
    return stream.data[stream.pos + offset];
  };
};

exports.peekByte = peekByte;

var readBytes = function readBytes(length) {
  return function (stream) {
    return stream.data.subarray(stream.pos, stream.pos += length);
  };
};

exports.readBytes = readBytes;

var peekBytes = function peekBytes(length) {
  return function (stream) {
    return stream.data.subarray(stream.pos, stream.pos + length);
  };
};

exports.peekBytes = peekBytes;

var readString = function readString(length) {
  return function (stream) {
    return Array.from(readBytes(length)(stream)).map(function (value) {
      return String.fromCharCode(value);
    }).join('');
  };
};

exports.readString = readString;

var readUnsigned = function readUnsigned(littleEndian) {
  return function (stream) {
    var bytes = readBytes(2)(stream);
    return littleEndian ? (bytes[1] << 8) + bytes[0] : (bytes[0] << 8) + bytes[1];
  };
};

exports.readUnsigned = readUnsigned;

var readArray = function readArray(byteSize, totalOrFunc) {
  return function (stream, result, parent) {
    var total = typeof totalOrFunc === 'function' ? totalOrFunc(stream, result, parent) : totalOrFunc;
    var parser = readBytes(byteSize);
    var arr = new Array(total);

    for (var i = 0; i < total; i++) {
      arr[i] = parser(stream);
    }

    return arr;
  };
};

exports.readArray = readArray;

var subBitsTotal = function subBitsTotal(bits, startIndex, length) {
  var result = 0;

  for (var i = 0; i < length; i++) {
    result += bits[startIndex + i] && Math.pow(2, length - i - 1);
  }

  return result;
};

var readBits = function readBits(schema) {
  return function (stream) {
    var _byte = readByte()(stream); // convert the byte to bit array


    var bits = new Array(8);

    for (var i = 0; i < 8; i++) {
      bits[7 - i] = !!(_byte & 1 << i);
    } // convert the bit array to values based on the schema


    return Object.keys(schema).reduce(function (res, key) {
      var def = schema[key];

      if (def.length) {
        res[key] = subBitsTotal(bits, def.index, def.length);
      } else {
        res[key] = bits[def.index];
      }

      return res;
    }, {});
  };
};

exports.readBits = readBits;
});

var gif = createCommonjsModule(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;





// a set of 0x00 terminated subblocks
var subBlocksSchema = {
  blocks: function blocks(stream) {
    var terminator = 0x00;
    var chunks = [];
    var total = 0;

    for (var size = (0, uint8.readByte)()(stream); size !== terminator; size = (0, uint8.readByte)()(stream)) {
      chunks.push((0, uint8.readBytes)(size)(stream));
      total += size;
    }

    var result = new Uint8Array(total);
    var offset = 0;

    for (var i = 0; i < chunks.length; i++) {
      result.set(chunks[i], offset);
      offset += chunks[i].length;
    }

    return result;
  }
}; // global control extension

var gceSchema = (0, lib.conditional)({
  gce: [{
    codes: (0, uint8.readBytes)(2)
  }, {
    byteSize: (0, uint8.readByte)()
  }, {
    extras: (0, uint8.readBits)({
      future: {
        index: 0,
        length: 3
      },
      disposal: {
        index: 3,
        length: 3
      },
      userInput: {
        index: 6
      },
      transparentColorGiven: {
        index: 7
      }
    })
  }, {
    delay: (0, uint8.readUnsigned)(true)
  }, {
    transparentColorIndex: (0, uint8.readByte)()
  }, {
    terminator: (0, uint8.readByte)()
  }]
}, function (stream) {
  var codes = (0, uint8.peekBytes)(2)(stream);
  return codes[0] === 0x21 && codes[1] === 0xf9;
}); // image pipeline block

var imageSchema = (0, lib.conditional)({
  image: [{
    code: (0, uint8.readByte)()
  }, {
    descriptor: [{
      left: (0, uint8.readUnsigned)(true)
    }, {
      top: (0, uint8.readUnsigned)(true)
    }, {
      width: (0, uint8.readUnsigned)(true)
    }, {
      height: (0, uint8.readUnsigned)(true)
    }, {
      lct: (0, uint8.readBits)({
        exists: {
          index: 0
        },
        interlaced: {
          index: 1
        },
        sort: {
          index: 2
        },
        future: {
          index: 3,
          length: 2
        },
        size: {
          index: 5,
          length: 3
        }
      })
    }]
  }, (0, lib.conditional)({
    lct: (0, uint8.readArray)(3, function (stream, result, parent) {
      return Math.pow(2, parent.descriptor.lct.size + 1);
    })
  }, function (stream, result, parent) {
    return parent.descriptor.lct.exists;
  }), {
    data: [{
      minCodeSize: (0, uint8.readByte)()
    }, subBlocksSchema]
  }]
}, function (stream) {
  return (0, uint8.peekByte)()(stream) === 0x2c;
}); // plain text block

var textSchema = (0, lib.conditional)({
  text: [{
    codes: (0, uint8.readBytes)(2)
  }, {
    blockSize: (0, uint8.readByte)()
  }, {
    preData: function preData(stream, result, parent) {
      return (0, uint8.readBytes)(parent.text.blockSize)(stream);
    }
  }, subBlocksSchema]
}, function (stream) {
  var codes = (0, uint8.peekBytes)(2)(stream);
  return codes[0] === 0x21 && codes[1] === 0x01;
}); // application block

var applicationSchema = (0, lib.conditional)({
  application: [{
    codes: (0, uint8.readBytes)(2)
  }, {
    blockSize: (0, uint8.readByte)()
  }, {
    id: function id(stream, result, parent) {
      return (0, uint8.readString)(parent.blockSize)(stream);
    }
  }, subBlocksSchema]
}, function (stream) {
  var codes = (0, uint8.peekBytes)(2)(stream);
  return codes[0] === 0x21 && codes[1] === 0xff;
}); // comment block

var commentSchema = (0, lib.conditional)({
  comment: [{
    codes: (0, uint8.readBytes)(2)
  }, subBlocksSchema]
}, function (stream) {
  var codes = (0, uint8.peekBytes)(2)(stream);
  return codes[0] === 0x21 && codes[1] === 0xfe;
});
var schema = [{
  header: [{
    signature: (0, uint8.readString)(3)
  }, {
    version: (0, uint8.readString)(3)
  }]
}, {
  lsd: [{
    width: (0, uint8.readUnsigned)(true)
  }, {
    height: (0, uint8.readUnsigned)(true)
  }, {
    gct: (0, uint8.readBits)({
      exists: {
        index: 0
      },
      resolution: {
        index: 1,
        length: 3
      },
      sort: {
        index: 4
      },
      size: {
        index: 5,
        length: 3
      }
    })
  }, {
    backgroundColorIndex: (0, uint8.readByte)()
  }, {
    pixelAspectRatio: (0, uint8.readByte)()
  }]
}, (0, lib.conditional)({
  gct: (0, uint8.readArray)(3, function (stream, result) {
    return Math.pow(2, result.lsd.gct.size + 1);
  })
}, function (stream, result) {
  return result.lsd.gct.exists;
}), // content frames
{
  frames: (0, lib.loop)([gceSchema, applicationSchema, commentSchema, imageSchema, textSchema], function (stream) {
    var nextCode = (0, uint8.peekByte)()(stream); // rather than check for a terminator, we should check for the existence
    // of an ext or image block to avoid infinite loops
    //var terminator = 0x3B;
    //return nextCode !== terminator;

    return nextCode === 0x21 || nextCode === 0x2c;
  })
}];
var _default = schema;
exports["default"] = _default;
});

var deinterlace = createCommonjsModule(function (module, exports) {
/**
 * Deinterlace function from https://github.com/shachaf/jsgif
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deinterlace = void 0;
exports.deinterlace = function (pixels, width) {
    var newPixels = new Array(pixels.length);
    var rows = pixels.length / width;
    var cpRow = function (toRow, fromRow) {
        var fromPixels = pixels.slice(fromRow * width, (fromRow + 1) * width);
        newPixels.splice.apply(newPixels, [toRow * width, width].concat(fromPixels));
    };
    // See appendix E.
    var offsets = [0, 4, 2, 1];
    var steps = [8, 8, 4, 2];
    var fromRow = 0;
    for (var pass = 0; pass < 4; pass++) {
        for (var toRow = offsets[pass]; toRow < rows; toRow += steps[pass]) {
            cpRow(toRow, fromRow);
            fromRow++;
        }
    }
    return newPixels;
};
});

var lzw = createCommonjsModule(function (module, exports) {
/**
 * javascript port of java LZW decompression
 * Original java author url: https://gist.github.com/devunwired/4479231
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.lzw = void 0;
exports.lzw = function (minCodeSize, data, pixelCount) {
    var MAX_STACK_SIZE = 4096;
    var nullCode = -1;
    var npix = pixelCount;
    var available, clear, code_mask, code_size, end_of_information, in_code, old_code, bits, code, i, datum, data_size, first, top, bi, pi;
    var dstPixels = new Array(pixelCount);
    var prefix = new Array(MAX_STACK_SIZE);
    var suffix = new Array(MAX_STACK_SIZE);
    var pixelStack = new Array(MAX_STACK_SIZE + 1);
    // Initialize GIF data stream decoder.
    data_size = minCodeSize;
    clear = 1 << data_size;
    end_of_information = clear + 1;
    available = clear + 2;
    old_code = nullCode;
    code_size = data_size + 1;
    code_mask = (1 << code_size) - 1;
    for (code = 0; code < clear; code++) {
        prefix[code] = 0;
        suffix[code] = code;
    }
    // Decode GIF pixel stream.
    var datum, bits, count, first, top, pi, bi;
    datum = bits = count = first = top = pi = bi = 0;
    for (i = 0; i < npix;) {
        if (top === 0) {
            if (bits < code_size) {
                // get the next byte
                datum += data[bi] << bits;
                bits += 8;
                bi++;
                continue;
            }
            // Get the next code.
            code = datum & code_mask;
            datum >>= code_size;
            bits -= code_size;
            // Interpret the code
            if (code > available || code == end_of_information) {
                break;
            }
            if (code == clear) {
                // Reset decoder.
                code_size = data_size + 1;
                code_mask = (1 << code_size) - 1;
                available = clear + 2;
                old_code = nullCode;
                continue;
            }
            if (old_code == nullCode) {
                pixelStack[top++] = suffix[code];
                old_code = code;
                first = code;
                continue;
            }
            in_code = code;
            if (code == available) {
                pixelStack[top++] = first;
                code = old_code;
            }
            while (code > clear) {
                pixelStack[top++] = suffix[code];
                code = prefix[code];
            }
            first = suffix[code] & 0xff;
            pixelStack[top++] = first;
            // add a new string to the table, but only if space is available
            // if not, just continue with current table until a clear code is found
            // (deferred clear code implementation as per GIF spec)
            if (available < MAX_STACK_SIZE) {
                prefix[available] = old_code;
                suffix[available] = first;
                available++;
                if ((available & code_mask) === 0 && available < MAX_STACK_SIZE) {
                    code_size++;
                    code_mask += available;
                }
            }
            old_code = in_code;
        }
        // Pop a pixel off the pixel stack.
        top--;
        dstPixels[pi++] = pixelStack[top];
        i++;
    }
    for (i = pi; i < npix; i++) {
        dstPixels[i] = 0; // clear missing pixels
    }
    return dstPixels;
};
});

var gifuctJs = createCommonjsModule(function (module, exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decompressFrames = exports.decompressFrame = exports.parseGIF = void 0;
var gif_1 = __importDefault(gif);




exports.parseGIF = function (arrayBuffer) {
    var byteData = new Uint8Array(arrayBuffer);
    return lib.parse(uint8.buildStream(byteData), gif_1.default);
};
var generatePatch = function (image) {
    var totalPixels = image.pixels.length;
    var patchData = new Uint8ClampedArray(totalPixels * 4);
    for (var i = 0; i < totalPixels; i++) {
        var pos = i * 4;
        var colorIndex = image.pixels[i];
        var color = image.colorTable[colorIndex];
        patchData[pos] = color[0];
        patchData[pos + 1] = color[1];
        patchData[pos + 2] = color[2];
        patchData[pos + 3] = colorIndex !== image.transparentIndex ? 255 : 0;
    }
    return patchData;
};
exports.decompressFrame = function (frame, gct, buildImagePatch) {
    if (!frame.image) {
        console.warn('gif frame does not have associated image.');
        return;
    }
    var image = frame.image;
    // get the number of pixels
    var totalPixels = image.descriptor.width * image.descriptor.height;
    // do lzw decompression
    var pixels = lzw.lzw(image.data.minCodeSize, image.data.blocks, totalPixels);
    // deal with interlacing if necessary
    if (image.descriptor.lct.interlaced) {
        pixels = deinterlace.deinterlace(pixels, image.descriptor.width);
    }
    var resultImage = {
        pixels: pixels,
        dims: {
            top: frame.image.descriptor.top,
            left: frame.image.descriptor.left,
            width: frame.image.descriptor.width,
            height: frame.image.descriptor.height
        }
    };
    // color table
    if (image.descriptor.lct && image.descriptor.lct.exists) {
        resultImage.colorTable = image.lct;
    }
    else {
        resultImage.colorTable = gct;
    }
    // add per frame relevant gce information
    if (frame.gce) {
        resultImage.delay = (frame.gce.delay || 10) * 10; // convert to ms
        resultImage.disposalType = frame.gce.extras.disposal;
        // transparency
        if (frame.gce.extras.transparentColorGiven) {
            resultImage.transparentIndex = frame.gce.transparentColorIndex;
        }
    }
    // create canvas usable imagedata if desired
    if (buildImagePatch) {
        resultImage.patch = generatePatch(resultImage);
    }
    return resultImage;
};
exports.decompressFrames = function (parsedGif, buildImagePatches) {
    return parsedGif.frames
        .filter(function (f) { return f.image; })
        .map(function (f) { return exports.decompressFrame(f, parsedGif.gct, buildImagePatches); });
};
});

/* NeuQuant Neural-Net Quantization Algorithm
 * ------------------------------------------
 *
 * Copyright (c) 1994 Anthony Dekker
 *
 * NEUQUANT Neural-Net quantization algorithm by Anthony Dekker, 1994.
 * See "Kohonen neural networks for optimal colour quantization"
 * in "Network: Computation in Neural Systems" Vol. 5 (1994) pp 351-367.
 * for a discussion of the algorithm.
 * See also  http://members.ozemail.com.au/~dekker/NEUQUANT.HTML
 *
 * Any party obtaining a copy of these files from the author, directly or
 * indirectly, is granted, free of charge, a full and unrestricted irrevocable,
 * world-wide, paid up, royalty-free, nonexclusive right and license to deal
 * in this software and documentation files (the "Software"), including without
 * limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons who receive
 * copies from any such party to do so, with the only requirement being
 * that this copyright notice remain intact.
 *
 * (JavaScript port 2012 by Johan Nordberg)
 */
var ncycles = 100; // number of learning cycles
var netsize = 256; // number of colors used
var maxnetpos = netsize - 1;
// defs for freq and bias
var netbiasshift = 4; // bias for colour values
var intbiasshift = 16; // bias for fractions
var intbias = (1 << intbiasshift);
var gammashift = 10;
var betashift = 10;
var beta = (intbias >> betashift); /* beta = 1/1024 */
var betagamma = (intbias << (gammashift - betashift));
// defs for decreasing radius factor
var initrad = (netsize >> 3); // for 256 cols, radius starts
var radiusbiasshift = 6; // at 32.0 biased by 6 bits
var radiusbias = (1 << radiusbiasshift);
var initradius = (initrad * radiusbias); //and decreases by a
var radiusdec = 30; // factor of 1/30 each cycle
// defs for decreasing alpha factor
var alphabiasshift = 10; // alpha starts at 1.0
var initalpha = (1 << alphabiasshift);
/* radbias and alpharadbias used for radpower calculation */
var radbiasshift = 8;
var radbias = (1 << radbiasshift);
var alpharadbshift = (alphabiasshift + radbiasshift);
var alpharadbias = (1 << alpharadbshift);
// four primes near 500 - assume no image has a length so large that it is
// divisible by all four primes
var prime1 = 499;
var prime2 = 491;
var prime3 = 487;
var prime4 = 503;
var minpicturebytes = (3 * prime4);
/*
  Constructor: NeuQuant

  Arguments:

  pixels - array of pixels in RGB format
  samplefac - sampling factor 1 to 30 where lower is better quality

  >
  > pixels = [r, g, b, r, g, b, r, g, b, ..]
  >
*/
function NeuQuant(pixels, samplefac) {
    var network; // int[netsize][4]
    var netindex; // for network lookup - really 256
    // bias and freq arrays for learning
    var bias;
    var freq;
    var radpower;
    /*
      Private Method: init
  
      sets up arrays
    */
    function init() {
        network = [];
        netindex = new Int32Array(256);
        bias = new Int32Array(netsize);
        freq = new Int32Array(netsize);
        radpower = new Int32Array(netsize >> 3);
        var i, v;
        for (i = 0; i < netsize; i++) {
            v = (i << (netbiasshift + 8)) / netsize;
            network[i] = new Float64Array([v, v, v, 0]);
            //network[i] = [v, v, v, 0]
            freq[i] = intbias / netsize;
            bias[i] = 0;
        }
    }
    /*
      Private Method: unbiasnet
  
      unbiases network to give byte values 0..255 and record position i to prepare for sort
    */
    function unbiasnet() {
        for (var i = 0; i < netsize; i++) {
            network[i][0] >>= netbiasshift;
            network[i][1] >>= netbiasshift;
            network[i][2] >>= netbiasshift;
            network[i][3] = i; // record color number
        }
    }
    /*
      Private Method: altersingle
  
      moves neuron *i* towards biased (b,g,r) by factor *alpha*
    */
    function altersingle(alpha, i, b, g, r) {
        network[i][0] -= (alpha * (network[i][0] - b)) / initalpha;
        network[i][1] -= (alpha * (network[i][1] - g)) / initalpha;
        network[i][2] -= (alpha * (network[i][2] - r)) / initalpha;
    }
    /*
      Private Method: alterneigh
  
      moves neurons in *radius* around index *i* towards biased (b,g,r) by factor *alpha*
    */
    function alterneigh(radius, i, b, g, r) {
        var lo = Math.abs(i - radius);
        var hi = Math.min(i + radius, netsize);
        var j = i + 1;
        var k = i - 1;
        var m = 1;
        var p, a;
        while ((j < hi) || (k > lo)) {
            a = radpower[m++];
            if (j < hi) {
                p = network[j++];
                p[0] -= (a * (p[0] - b)) / alpharadbias;
                p[1] -= (a * (p[1] - g)) / alpharadbias;
                p[2] -= (a * (p[2] - r)) / alpharadbias;
            }
            if (k > lo) {
                p = network[k--];
                p[0] -= (a * (p[0] - b)) / alpharadbias;
                p[1] -= (a * (p[1] - g)) / alpharadbias;
                p[2] -= (a * (p[2] - r)) / alpharadbias;
            }
        }
    }
    /*
      Private Method: contest
  
      searches for biased BGR values
    */
    function contest(b, g, r) {
        /*
          finds closest neuron (min dist) and updates freq
          finds best neuron (min dist-bias) and returns position
          for frequently chosen neurons, freq[i] is high and bias[i] is negative
          bias[i] = gamma * ((1 / netsize) - freq[i])
        */
        var bestd = ~(1 << 31);
        var bestbiasd = bestd;
        var bestpos = -1;
        var bestbiaspos = bestpos;
        var i, n, dist, biasdist, betafreq;
        for (i = 0; i < netsize; i++) {
            n = network[i];
            dist = Math.abs(n[0] - b) + Math.abs(n[1] - g) + Math.abs(n[2] - r);
            if (dist < bestd) {
                bestd = dist;
                bestpos = i;
            }
            biasdist = dist - ((bias[i]) >> (intbiasshift - netbiasshift));
            if (biasdist < bestbiasd) {
                bestbiasd = biasdist;
                bestbiaspos = i;
            }
            betafreq = (freq[i] >> betashift);
            freq[i] -= betafreq;
            bias[i] += (betafreq << gammashift);
        }
        freq[bestpos] += beta;
        bias[bestpos] -= betagamma;
        return bestbiaspos;
    }
    /*
      Private Method: inxbuild
  
      sorts network and builds netindex[0..255]
    */
    function inxbuild() {
        var i, j, p, q, smallpos, smallval, previouscol = 0, startpos = 0;
        for (i = 0; i < netsize; i++) {
            p = network[i];
            smallpos = i;
            smallval = p[1]; // index on g
            // find smallest in i..netsize-1
            for (j = i + 1; j < netsize; j++) {
                q = network[j];
                if (q[1] < smallval) { // index on g
                    smallpos = j;
                    smallval = q[1]; // index on g
                }
            }
            q = network[smallpos];
            // swap p (i) and q (smallpos) entries
            if (i != smallpos) {
                j = q[0];
                q[0] = p[0];
                p[0] = j;
                j = q[1];
                q[1] = p[1];
                p[1] = j;
                j = q[2];
                q[2] = p[2];
                p[2] = j;
                j = q[3];
                q[3] = p[3];
                p[3] = j;
            }
            // smallval entry is now in position i
            if (smallval != previouscol) {
                netindex[previouscol] = (startpos + i) >> 1;
                for (j = previouscol + 1; j < smallval; j++)
                    netindex[j] = i;
                previouscol = smallval;
                startpos = i;
            }
        }
        netindex[previouscol] = (startpos + maxnetpos) >> 1;
        for (j = previouscol + 1; j < 256; j++)
            netindex[j] = maxnetpos; // really 256
    }
    /*
      Private Method: inxsearch
  
      searches for BGR values 0..255 and returns a color index
    */
    function inxsearch(b, g, r) {
        var a, p, dist;
        var bestd = 1000; // biggest possible dist is 256*3
        var best = -1;
        var i = netindex[g]; // index on g
        var j = i - 1; // start at netindex[g] and work outwards
        while ((i < netsize) || (j >= 0)) {
            if (i < netsize) {
                p = network[i];
                dist = p[1] - g; // inx key
                if (dist >= bestd)
                    i = netsize; // stop iter
                else {
                    i++;
                    if (dist < 0)
                        dist = -dist;
                    a = p[0] - b;
                    if (a < 0)
                        a = -a;
                    dist += a;
                    if (dist < bestd) {
                        a = p[2] - r;
                        if (a < 0)
                            a = -a;
                        dist += a;
                        if (dist < bestd) {
                            bestd = dist;
                            best = p[3];
                        }
                    }
                }
            }
            if (j >= 0) {
                p = network[j];
                dist = g - p[1]; // inx key - reverse dif
                if (dist >= bestd)
                    j = -1; // stop iter
                else {
                    j--;
                    if (dist < 0)
                        dist = -dist;
                    a = p[0] - b;
                    if (a < 0)
                        a = -a;
                    dist += a;
                    if (dist < bestd) {
                        a = p[2] - r;
                        if (a < 0)
                            a = -a;
                        dist += a;
                        if (dist < bestd) {
                            bestd = dist;
                            best = p[3];
                        }
                    }
                }
            }
        }
        return best;
    }
    /*
      Private Method: learn
  
      "Main Learning Loop"
    */
    function learn() {
        var i;
        var lengthcount = pixels.length;
        var alphadec = 30 + ((samplefac - 1) / 3);
        var samplepixels = lengthcount / (3 * samplefac);
        var delta = ~~(samplepixels / ncycles);
        var alpha = initalpha;
        var radius = initradius;
        var rad = radius >> radiusbiasshift;
        if (rad <= 1)
            rad = 0;
        for (i = 0; i < rad; i++)
            radpower[i] = alpha * (((rad * rad - i * i) * radbias) / (rad * rad));
        var step;
        if (lengthcount < minpicturebytes) {
            samplefac = 1;
            step = 3;
        }
        else if ((lengthcount % prime1) !== 0) {
            step = 3 * prime1;
        }
        else if ((lengthcount % prime2) !== 0) {
            step = 3 * prime2;
        }
        else if ((lengthcount % prime3) !== 0) {
            step = 3 * prime3;
        }
        else {
            step = 3 * prime4;
        }
        var b, g, r, j;
        var pix = 0; // current pixel
        i = 0;
        while (i < samplepixels) {
            b = (pixels[pix] & 0xff) << netbiasshift;
            g = (pixels[pix + 1] & 0xff) << netbiasshift;
            r = (pixels[pix + 2] & 0xff) << netbiasshift;
            j = contest(b, g, r);
            altersingle(alpha, j, b, g, r);
            if (rad !== 0)
                alterneigh(rad, j, b, g, r); // alter neighbours
            pix += step;
            if (pix >= lengthcount)
                pix -= lengthcount;
            i++;
            if (delta === 0)
                delta = 1;
            if (i % delta === 0) {
                alpha -= alpha / alphadec;
                radius -= radius / radiusdec;
                rad = radius >> radiusbiasshift;
                if (rad <= 1)
                    rad = 0;
                for (j = 0; j < rad; j++)
                    radpower[j] = alpha * (((rad * rad - j * j) * radbias) / (rad * rad));
            }
        }
    }
    /*
      Method: buildColormap
  
      1. initializes network
      2. trains it
      3. removes misconceptions
      4. builds colorindex
    */
    function buildColormap() {
        init();
        learn();
        unbiasnet();
        inxbuild();
    }
    this.buildColormap = buildColormap;
    /*
      Method: getColormap
  
      builds colormap from the index
  
      returns array in the format:
  
      >
      > [r, g, b, r, g, b, r, g, b, ..]
      >
    */
    function getColormap() {
        var map = [];
        var index = [];
        for (var i = 0; i < netsize; i++)
            index[network[i][3]] = i;
        var k = 0;
        for (var l = 0; l < netsize; l++) {
            var j = index[l];
            map[k++] = (network[j][0]);
            map[k++] = (network[j][1]);
            map[k++] = (network[j][2]);
        }
        return map;
    }
    this.getColormap = getColormap;
    /*
      Method: lookupRGB
  
      looks for the closest *r*, *g*, *b* color in the map and
      returns its index
    */
    this.lookupRGB = inxsearch;
}
var TypedNeuQuant = NeuQuant;

/*
  LZWEncoder.js

  Authors
  Kevin Weiner (original Java version - kweiner@fmsware.com)
  Thibault Imbert (AS3 version - bytearray.org)
  Johan Nordberg (JS version - code@johan-nordberg.com)

  Acknowledgements
  GIFCOMPR.C - GIF Image compression routines
  Lempel-Ziv compression based on 'compress'. GIF modifications by
  David Rowley (mgardi@watdcsu.waterloo.edu)
  GIF Image compression - modified 'compress'
  Based on: compress.c - File compression ala IEEE Computer, June 1984.
  By Authors: Spencer W. Thomas (decvax!harpo!utah-cs!utah-gr!thomas)
  Jim McKie (decvax!mcvax!jim)
  Steve Davies (decvax!vax135!petsd!peora!srd)
  Ken Turkowski (decvax!decwrl!turtlevax!ken)
  James A. Woods (decvax!ihnp4!ames!jaw)
  Joe Orost (decvax!vax135!petsd!joe)
*/
var EOF = -1;
var BITS = 12;
var HSIZE = 5003; // 80% occupancy
var masks = [0x0000, 0x0001, 0x0003, 0x0007, 0x000F, 0x001F,
    0x003F, 0x007F, 0x00FF, 0x01FF, 0x03FF, 0x07FF,
    0x0FFF, 0x1FFF, 0x3FFF, 0x7FFF, 0xFFFF];
function LZWEncoder(width, height, pixels, colorDepth) {
    var initCodeSize = Math.max(2, colorDepth);
    var accum = new Uint8Array(256);
    var htab = new Int32Array(HSIZE);
    var codetab = new Int32Array(HSIZE);
    var cur_accum, cur_bits = 0;
    var a_count;
    var free_ent = 0; // first unused entry
    var maxcode;
    // block compression parameters -- after all codes are used up,
    // and compression rate changes, start over.
    var clear_flg = false;
    // Algorithm: use open addressing double hashing (no chaining) on the
    // prefix code / next character combination. We do a variant of Knuth's
    // algorithm D (vol. 3, sec. 6.4) along with G. Knott's relatively-prime
    // secondary probe. Here, the modular division first probe is gives way
    // to a faster exclusive-or manipulation. Also do block compression with
    // an adaptive reset, whereby the code table is cleared when the compression
    // ratio decreases, but after the table fills. The variable-length output
    // codes are re-sized at this point, and a special CLEAR code is generated
    // for the decompressor. Late addition: construct the table according to
    // file size for noticeable speed improvement on small files. Please direct
    // questions about this implementation to ames!jaw.
    var g_init_bits, ClearCode, EOFCode;
    var remaining, curPixel, n_bits;
    // Add a character to the end of the current packet, and if it is 254
    // characters, flush the packet to disk.
    function char_out(c, outs) {
        accum[a_count++] = c;
        if (a_count >= 254)
            flush_char(outs);
    }
    // Clear out the hash table
    // table clear for block compress
    function cl_block(outs) {
        cl_hash(HSIZE);
        free_ent = ClearCode + 2;
        clear_flg = true;
        output(ClearCode, outs);
    }
    // Reset code table
    function cl_hash(hsize) {
        for (var i = 0; i < hsize; ++i)
            htab[i] = -1;
    }
    function compress(init_bits, outs) {
        var fcode, c, i, ent, disp, hsize_reg, hshift;
        // Set up the globals: g_init_bits - initial number of bits
        g_init_bits = init_bits;
        // Set up the necessary values
        clear_flg = false;
        n_bits = g_init_bits;
        maxcode = MAXCODE(n_bits);
        ClearCode = 1 << (init_bits - 1);
        EOFCode = ClearCode + 1;
        free_ent = ClearCode + 2;
        a_count = 0; // clear packet
        ent = nextPixel();
        hshift = 0;
        for (fcode = HSIZE; fcode < 65536; fcode *= 2)
            ++hshift;
        hshift = 8 - hshift; // set hash code range bound
        hsize_reg = HSIZE;
        cl_hash(hsize_reg); // clear hash table
        output(ClearCode, outs);
        outer_loop: while ((c = nextPixel()) != EOF) {
            fcode = (c << BITS) + ent;
            i = (c << hshift) ^ ent; // xor hashing
            if (htab[i] === fcode) {
                ent = codetab[i];
                continue;
            }
            else if (htab[i] >= 0) { // non-empty slot
                disp = hsize_reg - i; // secondary hash (after G. Knott)
                if (i === 0)
                    disp = 1;
                do {
                    if ((i -= disp) < 0)
                        i += hsize_reg;
                    if (htab[i] === fcode) {
                        ent = codetab[i];
                        continue outer_loop;
                    }
                } while (htab[i] >= 0);
            }
            output(ent, outs);
            ent = c;
            if (free_ent < 1 << BITS) {
                codetab[i] = free_ent++; // code -> hashtable
                htab[i] = fcode;
            }
            else {
                cl_block(outs);
            }
        }
        // Put out the final code.
        output(ent, outs);
        output(EOFCode, outs);
    }
    function encode(outs) {
        outs.writeByte(initCodeSize); // write "initial code size" byte
        remaining = width * height; // reset navigation variables
        curPixel = 0;
        compress(initCodeSize + 1, outs); // compress and write the pixel data
        outs.writeByte(0); // write block terminator
    }
    // Flush the packet to disk, and reset the accumulator
    function flush_char(outs) {
        if (a_count > 0) {
            outs.writeByte(a_count);
            outs.writeBytes(accum, 0, a_count);
            a_count = 0;
        }
    }
    function MAXCODE(n_bits) {
        return (1 << n_bits) - 1;
    }
    // Return the next pixel from the image
    function nextPixel() {
        if (remaining === 0)
            return EOF;
        --remaining;
        var pix = pixels[curPixel++];
        return pix & 0xff;
    }
    function output(code, outs) {
        cur_accum &= masks[cur_bits];
        if (cur_bits > 0)
            cur_accum |= (code << cur_bits);
        else
            cur_accum = code;
        cur_bits += n_bits;
        while (cur_bits >= 8) {
            char_out((cur_accum & 0xff), outs);
            cur_accum >>= 8;
            cur_bits -= 8;
        }
        // If the next entry is going to be too big for the code size,
        // then increase it, if possible.
        if (free_ent > maxcode || clear_flg) {
            if (clear_flg) {
                maxcode = MAXCODE(n_bits = g_init_bits);
                clear_flg = false;
            }
            else {
                ++n_bits;
                if (n_bits == BITS)
                    maxcode = 1 << BITS;
                else
                    maxcode = MAXCODE(n_bits);
            }
        }
        if (code == EOFCode) {
            // At EOF, write the rest of the buffer.
            while (cur_bits > 0) {
                char_out((cur_accum & 0xff), outs);
                cur_accum >>= 8;
                cur_bits -= 8;
            }
            flush_char(outs);
        }
    }
    this.encode = encode;
}
var LZWEncoder_1 = LZWEncoder;

/*
  GIFEncoder.js

  Authors
  Kevin Weiner (original Java version - kweiner@fmsware.com)
  Thibault Imbert (AS3 version - bytearray.org)
  Johan Nordberg (JS version - code@johan-nordberg.com)
  Makito (Optimized for AwesomeQR - sumimakito@hotmail,com)
*/


function ByteArray() {
    this.page = -1;
    this.pages = [];
    this.newPage();
}
ByteArray.pageSize = 4096;
ByteArray.charMap = {};
for (var i = 0; i < 256; i++)
    ByteArray.charMap[i] = String.fromCharCode(i);
ByteArray.prototype.newPage = function () {
    this.pages[++this.page] = new Uint8Array(ByteArray.pageSize);
    this.cursor = 0;
};
ByteArray.prototype.getData = function () {
    var rv = "";
    for (var p = 0; p < this.pages.length; p++) {
        for (var i = 0; i < ByteArray.pageSize; i++) {
            rv += ByteArray.charMap[this.pages[p][i]];
        }
    }
    return rv;
};
ByteArray.prototype.toFlattenUint8Array = function () {
    var chunks = [];
    for (var p = 0; p < this.pages.length; p++) {
        if (p === this.pages.length - 1) {
            var chunk = Uint8Array.from(this.pages[p].slice(0, this.cursor));
            chunks.push(chunk);
        }
        else {
            chunks.push(this.pages[p]);
        }
    }
    var flatten = new Uint8Array(chunks.reduce(function (acc, chunk) { return acc + chunk.length; }, 0));
    chunks.reduce(function (lastLength, chunk) {
        flatten.set(chunk, lastLength);
        return lastLength + chunk.length;
    }, 0);
    return flatten;
};
ByteArray.prototype.writeByte = function (val) {
    if (this.cursor >= ByteArray.pageSize)
        this.newPage();
    this.pages[this.page][this.cursor++] = val;
};
ByteArray.prototype.writeUTFBytes = function (string) {
    for (var l = string.length, i = 0; i < l; i++)
        this.writeByte(string.charCodeAt(i));
};
ByteArray.prototype.writeBytes = function (array, offset, length) {
    for (var l = length || array.length, i = offset || 0; i < l; i++)
        this.writeByte(array[i]);
};
function GIFEncoder(width, height) {
    // image size
    this.width = ~~width;
    this.height = ~~height;
    // transparent color if given
    this.transparent = null;
    // transparent index in color table
    this.transIndex = 0;
    // -1 = no repeat, 0 = forever. anything else is repeat count
    this.repeat = -1;
    // frame delay (hundredths)
    this.delay = 0;
    this.image = null; // current frame
    this.pixels = null; // BGR byte array from frame
    this.indexedPixels = null; // converted frame indexed to palette
    this.colorDepth = null; // number of bit planes
    this.colorTab = null; // RGB palette
    this.neuQuant = null; // NeuQuant instance that was used to generate this.colorTab.
    this.usedEntry = new Array(); // active palette entries
    this.palSize = 7; // color table size (bits-1)
    this.dispose = -1; // disposal code (-1 = use default)
    this.firstFrame = true;
    this.sample = 10; // default sample interval for quantizer
    this.dither = false; // default dithering
    this.globalPalette = false;
    this.out = new ByteArray();
}
/*
  Sets the delay time between each frame, or changes it for subsequent frames
  (applies to last frame added)
*/
GIFEncoder.prototype.setDelay = function (milliseconds) {
    this.delay = Math.round(milliseconds / 10);
};
/*
  Sets frame rate in frames per second.
*/
GIFEncoder.prototype.setFrameRate = function (fps) {
    this.delay = Math.round(100 / fps);
};
/*
  Sets the GIF frame disposal code for the last added frame and any
  subsequent frames.

  Default is 0 if no transparent color has been set, otherwise 2.
*/
GIFEncoder.prototype.setDispose = function (disposalCode) {
    if (disposalCode >= 0)
        this.dispose = disposalCode;
};
/*
  Sets the number of times the set of GIF frames should be played.

  -1 = play once
  0 = repeat indefinitely

  Default is -1

  Must be invoked before the first image is added
*/
GIFEncoder.prototype.setRepeat = function (repeat) {
    this.repeat = repeat;
};
/*
  Sets the transparent color for the last added frame and any subsequent
  frames. Since all colors are subject to modification in the quantization
  process, the color in the final palette for each frame closest to the given
  color becomes the transparent color for that frame. May be set to null to
  indicate no transparent color.
*/
GIFEncoder.prototype.setTransparent = function (color) {
    this.transparent = color;
};
/*
  Adds next GIF frame. The frame is not written immediately, but is
  actually deferred until the next frame is received so that timing
  data can be inserted.  Invoking finish() flushes all frames.
*/
GIFEncoder.prototype.addFrame = function (imageData) {
    this.image = imageData;
    this.colorTab = this.globalPalette && this.globalPalette.slice ? this.globalPalette : null;
    this.getImagePixels(); // convert to correct format if necessary
    this.analyzePixels(); // build color table & map pixels
    if (this.globalPalette === true)
        this.globalPalette = this.colorTab;
    if (this.firstFrame) {
        this.writeHeader();
        this.writeLSD(); // logical screen descriptior
        this.writePalette(); // global color table
        if (this.repeat >= 0) {
            // use NS app extension to indicate reps
            this.writeNetscapeExt();
        }
    }
    this.writeGraphicCtrlExt(); // write graphic control extension
    this.writeImageDesc(); // image descriptor
    if (!this.firstFrame && !this.globalPalette)
        this.writePalette(); // local color table
    this.writePixels(); // encode and write pixel data
    this.firstFrame = false;
};
/*
  Adds final trailer to the GIF stream, if you don't call the finish method
  the GIF stream will not be valid.
*/
GIFEncoder.prototype.finish = function () {
    this.out.writeByte(0x3b); // gif trailer
};
/*
  Sets quality of color quantization (conversion of images to the maximum 256
  colors allowed by the GIF specification). Lower values (minimum = 1)
  produce better colors, but slow processing significantly. 10 is the
  default, and produces good color mapping at reasonable speeds. Values
  greater than 20 do not yield significant improvements in speed.
*/
GIFEncoder.prototype.setQuality = function (quality) {
    if (quality < 1)
        quality = 1;
    this.sample = quality;
};
/*
  Sets dithering method. Available are:
  - FALSE no dithering
  - TRUE or FloydSteinberg
  - FalseFloydSteinberg
  - Stucki
  - Atkinson
  You can add '-serpentine' to use serpentine scanning
*/
GIFEncoder.prototype.setDither = function (dither) {
    if (dither === true)
        dither = "FloydSteinberg";
    this.dither = dither;
};
/*
  Sets global palette for all frames.
  You can provide TRUE to create global palette from first picture.
  Or an array of r,g,b,r,g,b,...
*/
GIFEncoder.prototype.setGlobalPalette = function (palette) {
    this.globalPalette = palette;
};
/*
  Returns global palette used for all frames.
  If setGlobalPalette(true) was used, then this function will return
  calculated palette after the first frame is added.
*/
GIFEncoder.prototype.getGlobalPalette = function () {
    return (this.globalPalette && this.globalPalette.slice && this.globalPalette.slice(0)) || this.globalPalette;
};
/*
  Writes GIF file header
*/
GIFEncoder.prototype.writeHeader = function () {
    this.out.writeUTFBytes("GIF89a");
};
/*
  Analyzes current frame colors and creates color map.
*/
GIFEncoder.prototype.analyzePixels = function () {
    if (!this.colorTab) {
        this.neuQuant = new TypedNeuQuant(this.pixels, this.sample);
        this.neuQuant.buildColormap(); // create reduced palette
        this.colorTab = this.neuQuant.getColormap();
    }
    // map image pixels to new palette
    if (this.dither) {
        this.ditherPixels(this.dither.replace("-serpentine", ""), this.dither.match(/-serpentine/) !== null);
    }
    else {
        this.indexPixels();
    }
    this.pixels = null;
    this.colorDepth = 8;
    this.palSize = 7;
    // get closest match to transparent color if specified
    if (this.transparent !== null) {
        this.transIndex = this.findClosest(this.transparent, true);
    }
};
/*
  Index pixels, without dithering
*/
GIFEncoder.prototype.indexPixels = function (imgq) {
    var nPix = this.pixels.length / 3;
    this.indexedPixels = new Uint8Array(nPix);
    var k = 0;
    for (var j = 0; j < nPix; j++) {
        var index = this.findClosestRGB(this.pixels[k++] & 0xff, this.pixels[k++] & 0xff, this.pixels[k++] & 0xff);
        this.usedEntry[index] = true;
        this.indexedPixels[j] = index;
    }
};
/*
  Taken from http://jsbin.com/iXofIji/2/edit by PAEz
*/
GIFEncoder.prototype.ditherPixels = function (kernel, serpentine) {
    var kernels = {
        FalseFloydSteinberg: [
            [3 / 8, 1, 0],
            [3 / 8, 0, 1],
            [2 / 8, 1, 1],
        ],
        FloydSteinberg: [
            [7 / 16, 1, 0],
            [3 / 16, -1, 1],
            [5 / 16, 0, 1],
            [1 / 16, 1, 1],
        ],
        Stucki: [
            [8 / 42, 1, 0],
            [4 / 42, 2, 0],
            [2 / 42, -2, 1],
            [4 / 42, -1, 1],
            [8 / 42, 0, 1],
            [4 / 42, 1, 1],
            [2 / 42, 2, 1],
            [1 / 42, -2, 2],
            [2 / 42, -1, 2],
            [4 / 42, 0, 2],
            [2 / 42, 1, 2],
            [1 / 42, 2, 2],
        ],
        Atkinson: [
            [1 / 8, 1, 0],
            [1 / 8, 2, 0],
            [1 / 8, -1, 1],
            [1 / 8, 0, 1],
            [1 / 8, 1, 1],
            [1 / 8, 0, 2],
        ],
    };
    if (!kernel || !kernels[kernel]) {
        throw "Unknown dithering kernel: " + kernel;
    }
    var ds = kernels[kernel];
    var index = 0, height = this.height, width = this.width, data = this.pixels;
    var direction = serpentine ? -1 : 1;
    this.indexedPixels = new Uint8Array(this.pixels.length / 3);
    for (var y = 0; y < height; y++) {
        if (serpentine)
            direction = direction * -1;
        for (var x = direction == 1 ? 0 : width - 1, xend = direction == 1 ? width : 0; x !== xend; x += direction) {
            index = y * width + x;
            // Get original colour
            var idx = index * 3;
            var r1 = data[idx];
            var g1 = data[idx + 1];
            var b1 = data[idx + 2];
            // Get converted colour
            idx = this.findClosestRGB(r1, g1, b1);
            this.usedEntry[idx] = true;
            this.indexedPixels[index] = idx;
            idx *= 3;
            var r2 = this.colorTab[idx];
            var g2 = this.colorTab[idx + 1];
            var b2 = this.colorTab[idx + 2];
            var er = r1 - r2;
            var eg = g1 - g2;
            var eb = b1 - b2;
            for (var i = direction == 1 ? 0 : ds.length - 1, end = direction == 1 ? ds.length : 0; i !== end; i += direction) {
                var x1 = ds[i][1]; // *direction;  //  Should this by timesd by direction?..to make the kernel go in the opposite direction....got no idea....
                var y1 = ds[i][2];
                if (x1 + x >= 0 && x1 + x < width && y1 + y >= 0 && y1 + y < height) {
                    var d = ds[i][0];
                    idx = index + x1 + y1 * width;
                    idx *= 3;
                    data[idx] = Math.max(0, Math.min(255, data[idx] + er * d));
                    data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + eg * d));
                    data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + eb * d));
                }
            }
        }
    }
};
/*
  Returns index of palette color closest to c
*/
GIFEncoder.prototype.findClosest = function (c, used) {
    return this.findClosestRGB((c & 0xff0000) >> 16, (c & 0x00ff00) >> 8, c & 0x0000ff, used);
};
GIFEncoder.prototype.findClosestRGB = function (r, g, b, used) {
    if (this.colorTab === null)
        return -1;
    if (this.neuQuant && !used) {
        return this.neuQuant.lookupRGB(r, g, b);
    }
    var minpos = 0;
    var dmin = 256 * 256 * 256;
    var len = this.colorTab.length;
    for (var i = 0, index = 0; i < len; index++) {
        var dr = r - (this.colorTab[i++] & 0xff);
        var dg = g - (this.colorTab[i++] & 0xff);
        var db = b - (this.colorTab[i++] & 0xff);
        var d = dr * dr + dg * dg + db * db;
        if ((!used || this.usedEntry[index]) && d < dmin) {
            dmin = d;
            minpos = index;
        }
    }
    return minpos;
};
/*
  Extracts image pixels into byte array pixels
  (removes alphachannel from canvas imagedata)
*/
GIFEncoder.prototype.getImagePixels = function () {
    var w = this.width;
    var h = this.height;
    this.pixels = new Uint8Array(w * h * 3);
    var data = this.image;
    var srcPos = 0;
    var count = 0;
    for (var i = 0; i < h; i++) {
        for (var j = 0; j < w; j++) {
            this.pixels[count++] = data[srcPos++];
            this.pixels[count++] = data[srcPos++];
            this.pixels[count++] = data[srcPos++];
            srcPos++;
        }
    }
};
/*
  Writes Graphic Control Extension
*/
GIFEncoder.prototype.writeGraphicCtrlExt = function () {
    this.out.writeByte(0x21); // extension introducer
    this.out.writeByte(0xf9); // GCE label
    this.out.writeByte(4); // data block size
    var transp, disp;
    if (this.transparent === null) {
        transp = 0;
        disp = 0; // dispose = no action
    }
    else {
        transp = 1;
        disp = 2; // force clear if using transparent color
    }
    if (this.dispose >= 0) {
        disp = this.dispose & 7; // user override
    }
    disp <<= 2;
    // packed fields
    this.out.writeByte(0 | // 1:3 reserved
        disp | // 4:6 disposal
        0 | // 7 user input - 0 = none
        transp // 8 transparency flag
    );
    this.writeShort(this.delay); // delay x 1/100 sec
    this.out.writeByte(this.transIndex); // transparent color index
    this.out.writeByte(0); // block terminator
};
/*
  Writes Image Descriptor
*/
GIFEncoder.prototype.writeImageDesc = function () {
    this.out.writeByte(0x2c); // image separator
    this.writeShort(0); // image position x,y = 0,0
    this.writeShort(0);
    this.writeShort(this.width); // image size
    this.writeShort(this.height);
    // packed fields
    if (this.firstFrame || this.globalPalette) {
        // no LCT - GCT is used for first (or only) frame
        this.out.writeByte(0);
    }
    else {
        // specify normal LCT
        this.out.writeByte(0x80 | // 1 local color table 1=yes
            0 | // 2 interlace - 0=no
            0 | // 3 sorted - 0=no
            0 | // 4-5 reserved
            this.palSize // 6-8 size of color table
        );
    }
};
/*
  Writes Logical Screen Descriptor
*/
GIFEncoder.prototype.writeLSD = function () {
    // logical screen size
    this.writeShort(this.width);
    this.writeShort(this.height);
    // packed fields
    this.out.writeByte(0x80 | // 1 : global color table flag = 1 (gct used)
        0x70 | // 2-4 : color resolution = 7
        0x00 | // 5 : gct sort flag = 0
        this.palSize // 6-8 : gct size
    );
    this.out.writeByte(0); // background color index
    this.out.writeByte(0); // pixel aspect ratio - assume 1:1
};
/*
  Writes Netscape application extension to define repeat count.
*/
GIFEncoder.prototype.writeNetscapeExt = function () {
    this.out.writeByte(0x21); // extension introducer
    this.out.writeByte(0xff); // app extension label
    this.out.writeByte(11); // block size
    this.out.writeUTFBytes("NETSCAPE2.0"); // app id + auth code
    this.out.writeByte(3); // sub-block size
    this.out.writeByte(1); // loop sub-block id
    this.writeShort(this.repeat); // loop count (extra iterations, 0=repeat forever)
    this.out.writeByte(0); // block terminator
};
/*
  Writes color table
*/
GIFEncoder.prototype.writePalette = function () {
    this.out.writeBytes(this.colorTab);
    var n = 3 * 256 - this.colorTab.length;
    for (var i = 0; i < n; i++)
        this.out.writeByte(0);
};
GIFEncoder.prototype.writeShort = function (pValue) {
    this.out.writeByte(pValue & 0xff);
    this.out.writeByte((pValue >> 8) & 0xff);
};
/*
  Encodes and writes pixel data
*/
GIFEncoder.prototype.writePixels = function () {
    var enc = new LZWEncoder_1(this.width, this.height, this.indexedPixels, this.colorDepth);
    enc.encode(this.out);
};
/*
  Retrieves the GIF stream
*/
GIFEncoder.prototype.stream = function () {
    return this.out;
};
var GIFEncoder_1 = GIFEncoder;

var awesomeQr = createCommonjsModule(function (module, exports) {
var __awaiter = (commonjsGlobal && commonjsGlobal.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (commonjsGlobal && commonjsGlobal.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwesomeQR = void 0;



var GIFEncoder_1$1 = __importDefault(GIFEncoder_1);
var AwesomeQR = /** @class */ (function () {
    function AwesomeQR(options) {
        var _options = Object.assign({}, options);
        Object.keys(AwesomeQR._defaultOptions).map(function (k) {
            if (!(k in _options)) {
                Object.defineProperty(_options, k, {
                    value: AwesomeQR._defaultOptions[k],
                    enumerable: true,
                    writable: true,
                });
            }
        });
        this.options = _options;
        this.canvas = browser.createCanvas(options.size, options.size);
        this.canvasContext = this.canvas.getContext("2d");
        this.qrCode = new qrcode.QRCodeModel(-1, this.options.correctLevel);
        if (Number.isInteger(this.options.maskPattern)) {
            this.qrCode.maskPattern = this.options.maskPattern;
        }
        if (Number.isInteger(this.options.version)) {
            this.qrCode.typeNumber = this.options.version;
        }
        this.qrCode.addData(this.options.text);
        this.qrCode.make();
    }
    AwesomeQR.prototype.draw = function () {
        var _this = this;
        return new Promise(function (resolve) { return _this._draw().then(resolve); });
    };
    AwesomeQR.prototype._clear = function () {
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    AwesomeQR._prepareRoundedCornerClip = function (canvasContext, x, y, w, h, r) {
        canvasContext.beginPath();
        canvasContext.moveTo(x, y);
        canvasContext.arcTo(x + w, y, x + w, y + h, r);
        canvasContext.arcTo(x + w, y + h, x, y + h, r);
        canvasContext.arcTo(x, y + h, x, y, r);
        canvasContext.arcTo(x, y, x + w, y, r);
        canvasContext.closePath();
    };
    AwesomeQR._getAverageRGB = function (image) {
        var blockSize = 5;
        var defaultRGB = {
            r: 0,
            g: 0,
            b: 0,
        };
        var width, height;
        var i = -4;
        var rgb = {
            r: 0,
            g: 0,
            b: 0,
        };
        var count = 0;
        height = image.naturalHeight || image.height;
        width = image.naturalWidth || image.width;
        var canvas = browser.createCanvas(width, height);
        var context = canvas.getContext("2d");
        if (!context) {
            return defaultRGB;
        }
        context.drawImage(image, 0, 0);
        var data;
        try {
            data = context.getImageData(0, 0, width, height);
        }
        catch (e) {
            return defaultRGB;
        }
        while ((i += blockSize * 4) < data.data.length) {
            if (data.data[i] > 200 || data.data[i + 1] > 200 || data.data[i + 2] > 200)
                continue;
            ++count;
            rgb.r += data.data[i];
            rgb.g += data.data[i + 1];
            rgb.b += data.data[i + 2];
        }
        rgb.r = ~~(rgb.r / count);
        rgb.g = ~~(rgb.g / count);
        rgb.b = ~~(rgb.b / count);
        return rgb;
    };
    AwesomeQR._drawDot = function (canvasContext, centerX, centerY, nSize, xyOffset, dotScale) {
        if (xyOffset === void 0) { xyOffset = 0; }
        if (dotScale === void 0) { dotScale = 1; }
        canvasContext.fillRect((centerX + xyOffset) * nSize, (centerY + xyOffset) * nSize, dotScale * nSize, dotScale * nSize);
    };
    AwesomeQR._drawAlignProtector = function (canvasContext, centerX, centerY, nWidth, nHeight) {
        canvasContext.clearRect((centerX - 2) * nWidth, (centerY - 2) * nHeight, 5 * nWidth, 5 * nHeight);
        canvasContext.fillRect((centerX - 2) * nWidth, (centerY - 2) * nHeight, 5 * nWidth, 5 * nHeight);
    };
    AwesomeQR._drawAlign = function (canvasContext, centerX, centerY, nSize, xyOffset, dotScale, colorDark) {
        if (xyOffset === void 0) { xyOffset = 0; }
        if (dotScale === void 0) { dotScale = 1; }
        var oldFillStyle = canvasContext.fillStyle;
        canvasContext.fillStyle = colorDark;
        new Array(4).fill(0).map(function (_, i) {
            AwesomeQR._drawDot(canvasContext, centerX - 2 + i, centerY - 2, nSize, xyOffset, dotScale);
            AwesomeQR._drawDot(canvasContext, centerX + 2, centerY - 2 + i, nSize, xyOffset, dotScale);
            AwesomeQR._drawDot(canvasContext, centerX + 2 - i, centerY + 2, nSize, xyOffset, dotScale);
            AwesomeQR._drawDot(canvasContext, centerX - 2, centerY + 2 - i, nSize, xyOffset, dotScale);
        });
        AwesomeQR._drawDot(canvasContext, centerX, centerY, nSize, xyOffset, dotScale);
        canvasContext.fillStyle = "rgba(255, 255, 255, 0.6)";
        new Array(2).fill(0).map(function (_, i) {
            AwesomeQR._drawDot(canvasContext, centerX - 1 + i, centerY - 1, nSize, xyOffset, dotScale);
            AwesomeQR._drawDot(canvasContext, centerX + 1, centerY - 1 + i, nSize, xyOffset, dotScale);
            AwesomeQR._drawDot(canvasContext, centerX + 1 - i, centerY + 1, nSize, xyOffset, dotScale);
            AwesomeQR._drawDot(canvasContext, centerX - 1, centerY + 1 - i, nSize, xyOffset, dotScale);
        });
        canvasContext.fillStyle = oldFillStyle;
    };
    AwesomeQR.prototype._draw = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var nCount, rawSize, rawMargin, margin, rawViewportSize, whiteMargin, backgroundDimming, nSize, viewportSize, size, mainCanvas, mainCanvasContext, dotScale, backgroundCanvas, backgroundCanvasContext, parsedGIFBackground, gifFrames, gif, r, g, b, count, i, c, backgroundImage, avgRGB, agnPatternCenter, xyOffset, row, col, bIsDark, isBlkPosCtr, bProtected, i, nLeft, nTop, inAgnRange, protectorStyle, edgeCenter, i, i, j, agnX, agnY, logoImage, logoScale, logoMargin, logoCornerRadius, logoSize, x, y, gifOutput_1, backgroundCanvas_1, backgroundCanvasContext_1, patchCanvas_1, patchCanvasContext_1, patchData_1, u8array, binary, outCanvas, outCanvasContext;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        nCount = (_a = this.qrCode) === null || _a === void 0 ? void 0 : _a.moduleCount;
                        rawSize = this.options.size;
                        rawMargin = this.options.margin;
                        if (rawMargin < 0 || rawMargin * 2 >= rawSize) {
                            rawMargin = 0;
                        }
                        margin = Math.ceil(rawMargin);
                        rawViewportSize = rawSize - 2 * rawMargin;
                        whiteMargin = this.options.whiteMargin;
                        backgroundDimming = this.options.backgroundDimming;
                        nSize = Math.ceil(rawViewportSize / nCount);
                        viewportSize = nSize * nCount;
                        size = viewportSize + 2 * margin;
                        mainCanvas = browser.createCanvas(size, size);
                        mainCanvasContext = mainCanvas.getContext("2d");
                        dotScale = this.options.dotScale;
                        this._clear();
                        if (dotScale <= 0 || dotScale > 1) {
                            throw new Error("Scale should be in range (0, 1].");
                        }
                        // Leave room for margin
                        mainCanvasContext.save();
                        mainCanvasContext.translate(margin, margin);
                        backgroundCanvas = browser.createCanvas(size, size);
                        backgroundCanvasContext = backgroundCanvas.getContext("2d");
                        parsedGIFBackground = null;
                        gifFrames = [];
                        if (!!!this.options.gifBackground) return [3 /*break*/, 1];
                        gif = gifuctJs.parseGIF(this.options.gifBackground);
                        parsedGIFBackground = gif;
                        gifFrames = gifuctJs.decompressFrames(gif, true);
                        if (this.options.autoColor) {
                            r = 0, g = 0, b = 0;
                            count = 0;
                            for (i = 0; i < gifFrames[0].colorTable.length; i++) {
                                c = gifFrames[0].colorTable[i];
                                if (c[0] > 200 || c[1] > 200 || c[2] > 200)
                                    continue;
                                if (c[0] === 0 && c[1] === 0 && c[2] === 0)
                                    continue;
                                count++;
                                r += c[0];
                                g += c[1];
                                b += c[2];
                            }
                            r = ~~(r / count);
                            g = ~~(g / count);
                            b = ~~(b / count);
                            this.options.colorDark = "rgb(" + r + "," + g + "," + b + ")";
                        }
                        return [3 /*break*/, 4];
                    case 1:
                        if (!!!this.options.backgroundImage) return [3 /*break*/, 3];
                        return [4 /*yield*/, browser.loadImage(this.options.backgroundImage)];
                    case 2:
                        backgroundImage = _b.sent();
                        if (this.options.autoColor) {
                            avgRGB = AwesomeQR._getAverageRGB(backgroundImage);
                            this.options.colorDark = "rgb(" + avgRGB.r + "," + avgRGB.g + "," + avgRGB.b + ")";
                        }
                        backgroundCanvasContext.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height, 0, 0, size, size);
                        backgroundCanvasContext.rect(0, 0, size, size);
                        backgroundCanvasContext.fillStyle = backgroundDimming;
                        backgroundCanvasContext.fill();
                        return [3 /*break*/, 4];
                    case 3:
                        backgroundCanvasContext.rect(0, 0, size, size);
                        backgroundCanvasContext.fillStyle = this.options.colorLight;
                        backgroundCanvasContext.fill();
                        _b.label = 4;
                    case 4:
                        agnPatternCenter = qrcode.QRUtil.getPatternPosition(this.qrCode.typeNumber);
                        xyOffset = (1 - dotScale) * 0.5;
                        for (row = 0; row < nCount; row++) {
                            for (col = 0; col < nCount; col++) {
                                bIsDark = this.qrCode.isDark(row, col);
                                isBlkPosCtr = (col < 8 && (row < 8 || row >= nCount - 8)) || (col >= nCount - 8 && row < 8);
                                bProtected = isBlkPosCtr;
                                for (i = 0; i < agnPatternCenter.length - 1; i++) {
                                    bProtected =
                                        bProtected ||
                                            (row >= agnPatternCenter[i] - 2 &&
                                                row <= agnPatternCenter[i] + 2 &&
                                                col >= agnPatternCenter[i] - 2 &&
                                                col <= agnPatternCenter[i] + 2);
                                }
                                nLeft = col * nSize + (bProtected ? 0 : xyOffset * nSize);
                                nTop = row * nSize + (bProtected ? 0 : xyOffset * nSize);
                                mainCanvasContext.strokeStyle = bIsDark ? this.options.colorDark : this.options.colorLight;
                                mainCanvasContext.lineWidth = 0.5;
                                mainCanvasContext.fillStyle = bIsDark ? this.options.colorDark : "rgba(255, 255, 255, 0.6)";
                                if (agnPatternCenter.length === 0) {
                                    if (!bProtected) {
                                        mainCanvasContext.fillRect(nLeft, nTop, (bProtected ? (isBlkPosCtr ? 1 : 1) : dotScale) * nSize, (bProtected ? (isBlkPosCtr ? 1 : 1) : dotScale) * nSize);
                                    }
                                }
                                else {
                                    inAgnRange = col < nCount - 4 && col >= nCount - 4 - 5 && row < nCount - 4 && row >= nCount - 4 - 5;
                                    if (!bProtected && !inAgnRange) {
                                        // if align pattern list is empty, then it means that we don't need to leave room for the align patterns
                                        mainCanvasContext.fillRect(nLeft, nTop, (bProtected ? (isBlkPosCtr ? 1 : 1) : dotScale) * nSize, (bProtected ? (isBlkPosCtr ? 1 : 1) : dotScale) * nSize);
                                    }
                                }
                            }
                        }
                        protectorStyle = "rgba(255, 255, 255, 0.6)";
                        mainCanvasContext.fillStyle = protectorStyle;
                        mainCanvasContext.fillRect(0, 0, 8 * nSize, 8 * nSize);
                        mainCanvasContext.fillRect(0, (nCount - 8) * nSize, 8 * nSize, 8 * nSize);
                        mainCanvasContext.fillRect((nCount - 8) * nSize, 0, 8 * nSize, 8 * nSize);
                        edgeCenter = agnPatternCenter[agnPatternCenter.length - 1];
                        // Draw ALIGN protectors
                        // for (let i = 0; i < agnPatternCenter.length; i++) {
                        //   for (let j = 0; j < agnPatternCenter.length; j++) {
                        //     const agnX = agnPatternCenter[j];
                        //     const agnY = agnPatternCenter[i];
                        //     if (agnX === 6 && (agnY === 6 || agnY === edgeCenter)) {
                        //       continue;
                        //     } else if (agnY === 6 && (agnX === 6 || agnX === edgeCenter)) {
                        //       continue;
                        //     } else if (agnX !== 6 && agnX !== edgeCenter && agnY !== 6 && agnY !== edgeCenter) {
                        //       AwesomeQR._drawAlignProtector(mainCanvasContext, agnX, agnY, dotScale * nSize, dotScale * nSize);
                        //     } else {
                        //       AwesomeQR._drawAlignProtector(mainCanvasContext, agnX, agnY, dotScale * nSize, dotScale * nSize);
                        //     }
                        //   }
                        // }
                        // Draw POSITION patterns
                        mainCanvasContext.fillStyle = this.options.colorDark;
                        mainCanvasContext.fillRect(0, 0, 7 * nSize, nSize);
                        mainCanvasContext.fillRect((nCount - 7) * nSize, 0, 7 * nSize, nSize);
                        mainCanvasContext.fillRect(0, 6 * nSize, 7 * nSize, nSize);
                        mainCanvasContext.fillRect((nCount - 7) * nSize, 6 * nSize, 7 * nSize, nSize);
                        mainCanvasContext.fillRect(0, (nCount - 7) * nSize, 7 * nSize, nSize);
                        mainCanvasContext.fillRect(0, (nCount - 7 + 6) * nSize, 7 * nSize, nSize);
                        mainCanvasContext.fillRect(0, 0, nSize, 7 * nSize);
                        mainCanvasContext.fillRect(6 * nSize, 0, nSize, 7 * nSize);
                        mainCanvasContext.fillRect((nCount - 7) * nSize, 0, nSize, 7 * nSize);
                        mainCanvasContext.fillRect((nCount - 7 + 6) * nSize, 0, nSize, 7 * nSize);
                        mainCanvasContext.fillRect(0, (nCount - 7) * nSize, nSize, 7 * nSize);
                        mainCanvasContext.fillRect(6 * nSize, (nCount - 7) * nSize, nSize, 7 * nSize);
                        mainCanvasContext.fillRect(2 * nSize, 2 * nSize, 3 * nSize, 3 * nSize);
                        mainCanvasContext.fillRect((nCount - 7 + 2) * nSize, 2 * nSize, 3 * nSize, 3 * nSize);
                        mainCanvasContext.fillRect(2 * nSize, (nCount - 7 + 2) * nSize, 3 * nSize, 3 * nSize);
                        for (i = 0; i < nCount - 8; i += 2) {
                            mainCanvasContext.fillRect((8 + i + xyOffset) * nSize, (6 + xyOffset) * nSize, dotScale * nSize, dotScale * nSize);
                            mainCanvasContext.fillRect((6 + xyOffset) * nSize, (8 + i + xyOffset) * nSize, dotScale * nSize, dotScale * nSize);
                        }
                        for (i = 0; i < agnPatternCenter.length; i++) {
                            for (j = 0; j < agnPatternCenter.length; j++) {
                                agnX = agnPatternCenter[j];
                                agnY = agnPatternCenter[i];
                                if (agnX === 6 && (agnY === 6 || agnY === edgeCenter)) {
                                    continue;
                                }
                                else if (agnY === 6 && (agnX === 6 || agnX === edgeCenter)) {
                                    continue;
                                }
                                else if (agnX !== 6 && agnX !== edgeCenter && agnY !== 6 && agnY !== edgeCenter) {
                                    // mainCanvasContext.fillStyle = "rgba(0, 0, 0, .2)";
                                    AwesomeQR._drawAlign(mainCanvasContext, agnX, agnY, nSize, xyOffset, dotScale, this.options.colorDark);
                                }
                                else {
                                    // mainCanvasContext.fillStyle = this.options.colorDark!;
                                    AwesomeQR._drawAlign(mainCanvasContext, agnX, agnY, nSize, xyOffset, dotScale, this.options.colorDark);
                                }
                            }
                        }
                        // Fill the margin
                        if (whiteMargin) {
                            mainCanvasContext.fillStyle = "#FFFFFF";
                            mainCanvasContext.fillRect(-margin, -margin, size, margin);
                            mainCanvasContext.fillRect(-margin, viewportSize, size, margin);
                            mainCanvasContext.fillRect(viewportSize, -margin, margin, size);
                            mainCanvasContext.fillRect(-margin, -margin, margin, size);
                        }
                        if (!!!this.options.logoImage) return [3 /*break*/, 6];
                        return [4 /*yield*/, browser.loadImage(this.options.logoImage)];
                    case 5:
                        logoImage = _b.sent();
                        logoScale = this.options.logoScale;
                        logoMargin = this.options.logoMargin;
                        logoCornerRadius = this.options.logoCornerRadius;
                        if (logoScale <= 0 || logoScale >= 1.0) {
                            logoScale = 0.2;
                        }
                        if (logoMargin < 0) {
                            logoMargin = 0;
                        }
                        if (logoCornerRadius < 0) {
                            logoCornerRadius = 0;
                        }
                        mainCanvasContext.restore();
                        logoSize = viewportSize * logoScale;
                        x = 0.5 * (size - logoSize);
                        y = x;
                        mainCanvasContext.fillStyle = "#FFFFFF";
                        mainCanvasContext.save();
                        AwesomeQR._prepareRoundedCornerClip(mainCanvasContext, x - logoMargin, y - logoMargin, logoSize + 2 * logoMargin, logoSize + 2 * logoMargin, logoCornerRadius);
                        mainCanvasContext.clip();
                        mainCanvasContext.fill();
                        mainCanvasContext.restore();
                        mainCanvasContext.save();
                        AwesomeQR._prepareRoundedCornerClip(mainCanvasContext, x, y, logoSize, logoSize, logoCornerRadius);
                        mainCanvasContext.clip();
                        mainCanvasContext.drawImage(logoImage, x, y, logoSize, logoSize);
                        mainCanvasContext.restore();
                        _b.label = 6;
                    case 6:
                        if (!!parsedGIFBackground) {
                            gifFrames.forEach(function (frame) {
                                if (!gifOutput_1) {
                                    gifOutput_1 = new GIFEncoder_1$1.default(rawSize, rawSize);
                                    gifOutput_1.setDelay(frame.delay);
                                    gifOutput_1.setRepeat(0);
                                }
                                var _a = frame.dims, width = _a.width, height = _a.height;
                                if (!backgroundCanvas_1) {
                                    backgroundCanvas_1 = browser.createCanvas(width, height);
                                    backgroundCanvasContext_1 = backgroundCanvas_1.getContext("2d");
                                    backgroundCanvasContext_1.rect(0, 0, backgroundCanvas_1.width, backgroundCanvas_1.height);
                                    backgroundCanvasContext_1.fillStyle = "#ffffff";
                                    backgroundCanvasContext_1.fill();
                                }
                                if (!patchCanvas_1 || !patchData_1 || width !== patchCanvas_1.width || height !== patchCanvas_1.height) {
                                    patchCanvas_1 = browser.createCanvas(width, height);
                                    patchCanvasContext_1 = patchCanvas_1.getContext("2d");
                                    patchData_1 = patchCanvasContext_1.createImageData(width, height);
                                }
                                patchData_1.data.set(frame.patch);
                                patchCanvasContext_1.putImageData(patchData_1, 0, 0);
                                backgroundCanvasContext_1.drawImage(patchCanvas_1, frame.dims.left, frame.dims.top);
                                var unscaledCanvas = browser.createCanvas(size, size);
                                var unscaledCanvasContext = unscaledCanvas.getContext("2d");
                                unscaledCanvasContext.drawImage(backgroundCanvas_1, 0, 0, size, size);
                                unscaledCanvasContext.rect(0, 0, size, size);
                                unscaledCanvasContext.fillStyle = backgroundDimming;
                                unscaledCanvasContext.fill();
                                unscaledCanvasContext.drawImage(mainCanvas, 0, 0, size, size);
                                // Scale the final image
                                var outCanvas = browser.createCanvas(rawSize, rawSize);
                                var outCanvasContext = outCanvas.getContext("2d");
                                outCanvasContext.drawImage(unscaledCanvas, 0, 0, rawSize, rawSize);
                                gifOutput_1.addFrame(outCanvasContext.getImageData(0, 0, outCanvas.width, outCanvas.height).data);
                            });
                            if (!gifOutput_1) {
                                throw new Error("No frames.");
                            }
                            gifOutput_1.finish();
                            if (isElement(this.canvas)) {
                                u8array = gifOutput_1.stream().toFlattenUint8Array();
                                binary = u8array.reduce(function (bin, u8) { return bin + String.fromCharCode(u8); }, "");
                                return [2 /*return*/, Promise.resolve("data:image/gif;base64," + window.btoa(binary))];
                            }
                            return [2 /*return*/, Promise.resolve(Buffer.from(gifOutput_1.stream().toFlattenUint8Array()))];
                        }
                        else {
                            // Swap and merge the foreground and the background
                            backgroundCanvasContext.drawImage(mainCanvas, 0, 0, size, size);
                            mainCanvasContext.drawImage(backgroundCanvas, -margin, -margin, size, size);
                            outCanvas = browser.createCanvas(rawSize, rawSize);
                            outCanvasContext = outCanvas.getContext("2d");
                            outCanvasContext.drawImage(mainCanvas, 0, 0, rawSize, rawSize);
                            this.canvas = outCanvas;
                            if (isElement(this.canvas)) {
                                return [2 /*return*/, Promise.resolve(this.canvas.toDataURL())];
                            }
                            return [2 /*return*/, Promise.resolve(this.canvas.toBuffer())];
                        }
                }
            });
        });
    };
    AwesomeQR.CorrectLevel = qrcode.QRErrorCorrectLevel;
    AwesomeQR._defaultOptions = {
        text: "",
        size: 400,
        margin: 20,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: qrcode.QRErrorCorrectLevel.M,
        backgroundImage: undefined,
        backgroundDimming: "rgba(0,0,0,0)",
        logoImage: undefined,
        logoScale: 0.2,
        logoMargin: 6,
        logoCornerRadius: 8,
        whiteMargin: true,
        dotScale: 0.4,
        autoColor: true,
    };
    return AwesomeQR;
}());
exports.AwesomeQR = AwesomeQR;
function isElement(obj) {
    try {
        //Using W3 DOM2 (works for FF, Opera and Chrome)
        return obj instanceof HTMLElement;
    }
    catch (e) {
        //Browsers not supporting W3 DOM2 don't have HTMLElement and
        //an exception is thrown and we end up here. Testing some
        //properties that all elements have (works on IE7)
        return (typeof obj === "object" &&
            obj.nodeType === 1 &&
            typeof obj.style === "object" &&
            typeof obj.ownerDocument === "object");
    }
}
});

var lib$1 = createCommonjsModule(function (module, exports) {
var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(qrcode, exports);

Object.defineProperty(exports, "AwesomeQR", { enumerable: true, get: function () { return awesomeQr.AwesomeQR; } });
});

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var AwesomeQRCode = function (options) {
    var asyncDrawSerial = React.useRef(0);
    var _a = React.useState(), qrDataUri = _a[0], setQrDataUri = _a[1];
    React.useEffect(function () {
        (function () { return __awaiter(void 0, void 0, void 0, function () {
            var snapshotSerial, instance, dataUri;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (asyncDrawSerial.current >= Number.MAX_SAFE_INTEGER) {
                            asyncDrawSerial.current = 0;
                        }
                        else {
                            asyncDrawSerial.current++;
                        }
                        snapshotSerial = asyncDrawSerial.current;
                        instance = new lib$1.AwesomeQR(options);
                        return [4 /*yield*/, instance.draw()];
                    case 1:
                        dataUri = (_a.sent());
                        if (snapshotSerial !== asyncDrawSerial.current)
                            return [2 /*return*/];
                        setQrDataUri(dataUri);
                        return [2 /*return*/];
                }
            });
        }); })();
    }, [options]);
    return (React__default['default'].createElement("div", { style: {
            width: "100%",
            height: "100%",
            backgroundImage: "url(" + qrDataUri + ")",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center",
        } }));
};
AwesomeQRCode.defaultProps = lib$1.AwesomeQR._defaultOptions;

exports.AwesomeQRCode = AwesomeQRCode;
exports.__moduleExports = lib$1;
//# sourceMappingURL=index.js.map
