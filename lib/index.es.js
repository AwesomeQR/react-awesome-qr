import React, { useRef, useMemo, useState, useEffect } from 'react';

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
exports.QRMath = exports.QRUtil = exports.QRErrorCorrectLevel = exports.QRCodeModel = void 0;
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
var QRMaskPattern = {
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
            case QRMaskPattern.PATTERN000:
                return (i + j) % 2 == 0;
            case QRMaskPattern.PATTERN001:
                return i % 2 == 0;
            case QRMaskPattern.PATTERN010:
                return j % 3 == 0;
            case QRMaskPattern.PATTERN011:
                return (i + j) % 3 == 0;
            case QRMaskPattern.PATTERN100:
                return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 == 0;
            case QRMaskPattern.PATTERN101:
                return ((i * j) % 2) + ((i * j) % 3) == 0;
            case QRMaskPattern.PATTERN110:
                return (((i * j) % 2) + ((i * j) % 3)) % 2 == 0;
            case QRMaskPattern.PATTERN111:
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

var awesomeQr$1 = createCommonjsModule(function (module, exports) {
!function(t,e){module.exports=e();}(commonjsGlobal,(function(){return function(t){var e={};function r(n){if(e[n])return e[n].exports;var i=e[n]={i:n,l:!1,exports:{}};return t[n].call(i.exports,i,i.exports,r),i.l=!0,i.exports}return r.m=t,r.c=e,r.d=function(t,e,n){r.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n});},r.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0});},r.t=function(t,e){if(1&e&&(t=r(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)r.d(n,i,function(e){return t[e]}.bind(null,i));return n},r.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return r.d(e,"a",e),e},r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},r.p="",r(r.s=4)}([function(t,e,r){Object.defineProperty(e,"__esModule",{value:!0}),e.loop=e.conditional=e.parse=void 0;e.parse=function t(e,r){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:n;if(Array.isArray(r))r.forEach((function(r){return t(e,r,n,i)}));else if("function"==typeof r)r(e,n,i,t);else {var o=Object.keys(r)[0];Array.isArray(r[o])?(i[o]={},t(e,r[o],n,i[o])):i[o]=r[o](e,n,i,t);}return n};e.conditional=function(t,e){return function(r,n,i,o){e(r,n,i)&&o(r,t,n,i);}};e.loop=function(t,e){return function(r,n,i,o){for(var a=[];e(r,n,i);){var s={};o(r,t,n,s),a.push(s);}return a}};},function(t,e,r){Object.defineProperty(e,"__esModule",{value:!0}),e.readBits=e.readArray=e.readUnsigned=e.readString=e.peekBytes=e.readBytes=e.peekByte=e.readByte=e.buildStream=void 0;e.buildStream=function(t){return {data:t,pos:0}};var n=function(){return function(t){return t.data[t.pos++]}};e.readByte=n;e.peekByte=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;return function(e){return e.data[e.pos+t]}};var i=function(t){return function(e){return e.data.subarray(e.pos,e.pos+=t)}};e.readBytes=i;e.peekBytes=function(t){return function(e){return e.data.subarray(e.pos,e.pos+t)}};e.readString=function(t){return function(e){return Array.from(i(t)(e)).map((function(t){return String.fromCharCode(t)})).join("")}};e.readUnsigned=function(t){return function(e){var r=i(2)(e);return t?(r[1]<<8)+r[0]:(r[0]<<8)+r[1]}};e.readArray=function(t,e){return function(r,n,o){for(var a="function"==typeof e?e(r,n,o):e,s=i(t),u=new Array(a),h=0;h<a;h++)u[h]=s(r);return u}};e.readBits=function(t){return function(e){for(var r=function(t){return t.data[t.pos++]}(e),n=new Array(8),i=0;i<8;i++)n[7-i]=!!(r&1<<i);return Object.keys(t).reduce((function(e,r){var i=t[r];return i.length?e[r]=function(t,e,r){for(var n=0,i=0;i<r;i++)n+=t[e+i]&&Math.pow(2,r-i-1);return n}(n,i.index,i.length):e[r]=n[i.index],e}),{})}};},function(t,e,r){function n(t,r){for(var n=1,i=function(t){var e=encodeURI(t).toString().replace(/\%[0-9a-fA-F]{2}/g,"a");return e.length+(e.length!=Number(t)?3:0)}(t),o=0,a=b.length;o<=a;o++){var s=0;switch(r){case e.QRErrorCorrectLevel.L:s=b[o][0];break;case e.QRErrorCorrectLevel.M:s=b[o][1];break;case e.QRErrorCorrectLevel.Q:s=b[o][2];break;case e.QRErrorCorrectLevel.H:s=b[o][3];}if(i<=s)break;n++;}if(n>b.length)throw new Error("Too long data");return n}Object.defineProperty(e,"__esModule",{value:!0}),e.QRMath=e.QRUtil=e.QRErrorCorrectLevel=e.QRCodeModel=void 0;var i=function(){function t(t){this.mode=a.MODE_8BIT_BYTE,this.parsedData=[],this.data=t;for(var e=[],r=0,n=this.data.length;r<n;r++){var i=[],o=this.data.charCodeAt(r);o>65536?(i[0]=240|(1835008&o)>>>18,i[1]=128|(258048&o)>>>12,i[2]=128|(4032&o)>>>6,i[3]=128|63&o):o>2048?(i[0]=224|(61440&o)>>>12,i[1]=128|(4032&o)>>>6,i[2]=128|63&o):o>128?(i[0]=192|(1984&o)>>>6,i[1]=128|63&o):i[0]=o,e.push(i);}this.parsedData=Array.prototype.concat.apply([],e),this.parsedData.length!=this.data.length&&(this.parsedData.unshift(191),this.parsedData.unshift(187),this.parsedData.unshift(239));}return t.prototype.getLength=function(){return this.parsedData.length},t.prototype.write=function(t){for(var e=0,r=this.parsedData.length;e<r;e++)t.put(this.parsedData[e],8);},t}(),o=function(){function t(t,r){void 0===t&&(t=-1),void 0===r&&(r=e.QRErrorCorrectLevel.L),this.moduleCount=0,this.dataList=[],this.typeNumber=t,this.errorCorrectLevel=r,this.moduleCount=0,this.dataList=[];}return t.prototype.addData=function(t){this.typeNumber<=0&&(this.typeNumber=n(t,this.errorCorrectLevel));var e=new i(t);this.dataList.push(e),this.dataCache=void 0;},t.prototype.isDark=function(t,e){if(t<0||this.moduleCount<=t||e<0||this.moduleCount<=e)throw new Error(t+","+e);return this.modules[t][e]},t.prototype.getModuleCount=function(){return this.moduleCount},t.prototype.make=function(){this.makeImpl(!1,this.getBestMaskPattern());},t.prototype.makeImpl=function(e,r){this.moduleCount=4*this.typeNumber+17,this.modules=new Array(this.moduleCount);for(var n=0;n<this.moduleCount;n++){this.modules[n]=new Array(this.moduleCount);for(var i=0;i<this.moduleCount;i++)this.modules[n][i]=null;}this.setupPositionProbePattern(0,0),this.setupPositionProbePattern(this.moduleCount-7,0),this.setupPositionProbePattern(0,this.moduleCount-7),this.setupPositionAdjustPattern(),this.setupTimingPattern(),this.setupTypeInfo(e,r),this.typeNumber>=7&&this.setupTypeNumber(e),null==this.dataCache&&(this.dataCache=t.createData(this.typeNumber,this.errorCorrectLevel,this.dataList)),this.mapData(this.dataCache,r);},t.prototype.setupPositionProbePattern=function(t,e){for(var r=-1;r<=7;r++)if(!(t+r<=-1||this.moduleCount<=t+r))for(var n=-1;n<=7;n++)e+n<=-1||this.moduleCount<=e+n||(this.modules[t+r][e+n]=0<=r&&r<=6&&(0==n||6==n)||0<=n&&n<=6&&(0==r||6==r)||2<=r&&r<=4&&2<=n&&n<=4);},t.prototype.getBestMaskPattern=function(){for(var t=0,e=0,r=0;r<8;r++){this.makeImpl(!0,r);var n=g.getLostPoint(this);(0==r||t>n)&&(t=n,e=r);}return e},t.prototype.setupTimingPattern=function(){for(var t=8;t<this.moduleCount-8;t++)null==this.modules[t][6]&&(this.modules[t][6]=t%2==0);for(var e=8;e<this.moduleCount-8;e++)null==this.modules[6][e]&&(this.modules[6][e]=e%2==0);},t.prototype.setupPositionAdjustPattern=function(){for(var t=g.getPatternPosition(this.typeNumber),e=0;e<t.length;e++)for(var r=0;r<t.length;r++){var n=t[e],i=t[r];if(null==this.modules[n][i])for(var o=-2;o<=2;o++)for(var a=-2;a<=2;a++)this.modules[n+o][i+a]=-2==o||2==o||-2==a||2==a||0==o&&0==a;}},t.prototype.setupTypeNumber=function(t){for(var e=g.getBCHTypeNumber(this.typeNumber),r=0;r<18;r++){var n=!t&&1==(e>>r&1);this.modules[Math.floor(r/3)][r%3+this.moduleCount-8-3]=n;}for(r=0;r<18;r++){n=!t&&1==(e>>r&1);this.modules[r%3+this.moduleCount-8-3][Math.floor(r/3)]=n;}},t.prototype.setupTypeInfo=function(t,e){for(var r=this.errorCorrectLevel<<3|e,n=g.getBCHTypeInfo(r),i=0;i<15;i++){var o=!t&&1==(n>>i&1);i<6?this.modules[i][8]=o:i<8?this.modules[i+1][8]=o:this.modules[this.moduleCount-15+i][8]=o;}for(i=0;i<15;i++){o=!t&&1==(n>>i&1);i<8?this.modules[8][this.moduleCount-i-1]=o:i<9?this.modules[8][15-i-1+1]=o:this.modules[8][15-i-1]=o;}this.modules[this.moduleCount-8][8]=!t;},t.prototype.mapData=function(t,e){for(var r=-1,n=this.moduleCount-1,i=7,o=0,a=this.moduleCount-1;a>0;a-=2)for(6==a&&a--;;){for(var s=0;s<2;s++)if(null==this.modules[n][a-s]){var u=!1;o<t.length&&(u=1==(t[o]>>>i&1)),g.getMask(e,n,a-s)&&(u=!u),this.modules[n][a-s]=u,-1==--i&&(o++,i=7);}if((n+=r)<0||this.moduleCount<=n){n-=r,r=-r;break}}},t.createData=function(e,r,n){for(var i=v.getRSBlocks(e,r),o=new m,a=0;a<n.length;a++){var s=n[a];o.put(s.mode,4),o.put(s.getLength(),g.getLengthInBits(s.mode,e)),s.write(o);}var u=0;for(a=0;a<i.length;a++)u+=i[a].dataCount;if(o.getLengthInBits()>8*u)throw new Error("code length overflow. ("+o.getLengthInBits()+">"+8*u+")");for(o.getLengthInBits()+4<=8*u&&o.put(0,4);o.getLengthInBits()%8!=0;)o.putBit(!1);for(;!(o.getLengthInBits()>=8*u||(o.put(t.PAD0,8),o.getLengthInBits()>=8*u));)o.put(t.PAD1,8);return t.createBytes(o,i)},t.createBytes=function(t,e){for(var r=0,n=0,i=0,o=new Array(e.length),a=new Array(e.length),s=0;s<e.length;s++){var u=e[s].dataCount,h=e[s].totalCount-u;n=Math.max(n,u),i=Math.max(i,h),o[s]=new Array(u);for(var f=0;f<o[s].length;f++)o[s][f]=255&t.buffer[f+r];r+=u;var l=g.getErrorCorrectPolynomial(h),c=new w(o[s],l.getLength()-1).mod(l);a[s]=new Array(l.getLength()-1);for(f=0;f<a[s].length;f++){var p=f+c.getLength()-a[s].length;a[s][f]=p>=0?c.get(p):0;}}var d=0;for(f=0;f<e.length;f++)d+=e[f].totalCount;var y=new Array(d),v=0;for(f=0;f<n;f++)for(s=0;s<e.length;s++)f<o[s].length&&(y[v++]=o[s][f]);for(f=0;f<i;f++)for(s=0;s<e.length;s++)f<a[s].length&&(y[v++]=a[s][f]);return y},t.PAD0=236,t.PAD1=17,t}();e.QRCodeModel=o,e.QRErrorCorrectLevel={L:1,M:0,Q:3,H:2};var a={MODE_NUMBER:1,MODE_ALPHA_NUM:2,MODE_8BIT_BYTE:4,MODE_KANJI:8},s=0,u=1,h=2,f=3,l=4,c=5,p=6,d=7,g=function(){function t(){}return t.getBCHTypeInfo=function(e){for(var r=e<<10;t.getBCHDigit(r)-t.getBCHDigit(t.G15)>=0;)r^=t.G15<<t.getBCHDigit(r)-t.getBCHDigit(t.G15);return (e<<10|r)^t.G15_MASK},t.getBCHTypeNumber=function(e){for(var r=e<<12;t.getBCHDigit(r)-t.getBCHDigit(t.G18)>=0;)r^=t.G18<<t.getBCHDigit(r)-t.getBCHDigit(t.G18);return e<<12|r},t.getBCHDigit=function(t){for(var e=0;0!=t;)e++,t>>>=1;return e},t.getPatternPosition=function(e){return t.PATTERN_POSITION_TABLE[e-1]},t.getMask=function(t,e,r){switch(t){case s:return (e+r)%2==0;case u:return e%2==0;case h:return r%3==0;case f:return (e+r)%3==0;case l:return (Math.floor(e/2)+Math.floor(r/3))%2==0;case c:return e*r%2+e*r%3==0;case p:return (e*r%2+e*r%3)%2==0;case d:return (e*r%3+(e+r)%2)%2==0;default:throw new Error("bad maskPattern:"+t)}},t.getErrorCorrectPolynomial=function(t){for(var e=new w([1],0),r=0;r<t;r++)e=e.multiply(new w([1,y.gexp(r)],0));return e},t.getLengthInBits=function(t,e){if(1<=e&&e<10)switch(t){case a.MODE_NUMBER:return 10;case a.MODE_ALPHA_NUM:return 9;case a.MODE_8BIT_BYTE:case a.MODE_KANJI:return 8;default:throw new Error("mode:"+t)}else if(e<27)switch(t){case a.MODE_NUMBER:return 12;case a.MODE_ALPHA_NUM:return 11;case a.MODE_8BIT_BYTE:return 16;case a.MODE_KANJI:return 10;default:throw new Error("mode:"+t)}else {if(!(e<41))throw new Error("type:"+e);switch(t){case a.MODE_NUMBER:return 14;case a.MODE_ALPHA_NUM:return 13;case a.MODE_8BIT_BYTE:return 16;case a.MODE_KANJI:return 12;default:throw new Error("mode:"+t)}}},t.getLostPoint=function(t){for(var e=t.getModuleCount(),r=0,n=0;n<e;n++)for(var i=0;i<e;i++){for(var o=0,a=t.isDark(n,i),s=-1;s<=1;s++)if(!(n+s<0||e<=n+s))for(var u=-1;u<=1;u++)i+u<0||e<=i+u||0==s&&0==u||a==t.isDark(n+s,i+u)&&o++;o>5&&(r+=3+o-5);}for(n=0;n<e-1;n++)for(i=0;i<e-1;i++){var h=0;t.isDark(n,i)&&h++,t.isDark(n+1,i)&&h++,t.isDark(n,i+1)&&h++,t.isDark(n+1,i+1)&&h++,0!=h&&4!=h||(r+=3);}for(n=0;n<e;n++)for(i=0;i<e-6;i++)t.isDark(n,i)&&!t.isDark(n,i+1)&&t.isDark(n,i+2)&&t.isDark(n,i+3)&&t.isDark(n,i+4)&&!t.isDark(n,i+5)&&t.isDark(n,i+6)&&(r+=40);for(i=0;i<e;i++)for(n=0;n<e-6;n++)t.isDark(n,i)&&!t.isDark(n+1,i)&&t.isDark(n+2,i)&&t.isDark(n+3,i)&&t.isDark(n+4,i)&&!t.isDark(n+5,i)&&t.isDark(n+6,i)&&(r+=40);var f=0;for(i=0;i<e;i++)for(n=0;n<e;n++)t.isDark(n,i)&&f++;return r+=10*(Math.abs(100*f/e/e-50)/5)},t.PATTERN_POSITION_TABLE=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],t.G15=1335,t.G18=7973,t.G15_MASK=21522,t}();e.QRUtil=g;var y=function(){function t(){}return t.glog=function(e){if(e<1)throw new Error("glog("+e+")");return t.LOG_TABLE[e]},t.gexp=function(e){for(;e<0;)e+=255;for(;e>=256;)e-=255;return t.EXP_TABLE[e]},t.EXP_TABLE=new Array(256),t.LOG_TABLE=new Array(256),t._constructor=function(){for(var e=0;e<8;e++)t.EXP_TABLE[e]=1<<e;for(e=8;e<256;e++)t.EXP_TABLE[e]=t.EXP_TABLE[e-4]^t.EXP_TABLE[e-5]^t.EXP_TABLE[e-6]^t.EXP_TABLE[e-8];for(e=0;e<255;e++)t.LOG_TABLE[t.EXP_TABLE[e]]=e;}(),t}();e.QRMath=y;var w=function(){function t(t,e){if(null==t.length)throw new Error(t.length+"/"+e);for(var r=0;r<t.length&&0==t[r];)r++;this.num=new Array(t.length-r+e);for(var n=0;n<t.length-r;n++)this.num[n]=t[n+r];}return t.prototype.get=function(t){return this.num[t]},t.prototype.getLength=function(){return this.num.length},t.prototype.multiply=function(e){for(var r=new Array(this.getLength()+e.getLength()-1),n=0;n<this.getLength();n++)for(var i=0;i<e.getLength();i++)r[n+i]^=y.gexp(y.glog(this.get(n))+y.glog(e.get(i)));return new t(r,0)},t.prototype.mod=function(e){if(this.getLength()-e.getLength()<0)return this;for(var r=y.glog(this.get(0))-y.glog(e.get(0)),n=new Array(this.getLength()),i=0;i<this.getLength();i++)n[i]=this.get(i);for(i=0;i<e.getLength();i++)n[i]^=y.gexp(y.glog(e.get(i))+r);return new t(n,0).mod(e)},t}(),v=function(){function t(t,e){this.totalCount=t,this.dataCount=e;}return t.getRSBlocks=function(e,r){var n=t.getRsBlockTable(e,r);if(null==n)throw new Error("bad rs block @ typeNumber:"+e+"/errorCorrectLevel:"+r);for(var i=n.length/3,o=[],a=0;a<i;a++)for(var s=n[3*a+0],u=n[3*a+1],h=n[3*a+2],f=0;f<s;f++)o.push(new t(u,h));return o},t.getRsBlockTable=function(r,n){switch(n){case e.QRErrorCorrectLevel.L:return t.RS_BLOCK_TABLE[4*(r-1)+0];case e.QRErrorCorrectLevel.M:return t.RS_BLOCK_TABLE[4*(r-1)+1];case e.QRErrorCorrectLevel.Q:return t.RS_BLOCK_TABLE[4*(r-1)+2];case e.QRErrorCorrectLevel.H:return t.RS_BLOCK_TABLE[4*(r-1)+3];default:return}},t.RS_BLOCK_TABLE=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],t}(),m=function(){function t(){this.buffer=[],this.length=0;}return t.prototype.get=function(t){var e=Math.floor(t/8);return 1==(this.buffer[e]>>>7-t%8&1)},t.prototype.put=function(t,e){for(var r=0;r<e;r++)this.putBit(1==(t>>>e-r-1&1));},t.prototype.getLengthInBits=function(){return this.length},t.prototype.putBit=function(t){var e=Math.floor(this.length/8);this.buffer.length<=e&&this.buffer.push(0),t&&(this.buffer[e]|=128>>>this.length%8),this.length++;},t}(),b=[[17,14,11,7],[32,26,20,14],[53,42,32,24],[78,62,46,34],[106,84,60,44],[134,106,74,58],[154,122,86,64],[192,152,108,84],[230,180,130,98],[271,213,151,119],[321,251,177,137],[367,287,203,155],[425,331,241,177],[458,362,258,194],[520,412,292,220],[586,450,322,250],[644,504,364,280],[718,560,394,310],[792,624,442,338],[858,666,482,382],[929,711,509,403],[1003,779,565,439],[1091,857,611,461],[1171,911,661,511],[1273,997,715,535],[1367,1059,751,593],[1465,1125,805,625],[1528,1190,868,658],[1628,1264,908,698],[1732,1370,982,742],[1840,1452,1030,790],[1952,1538,1112,842],[2068,1628,1168,898],[2188,1722,1228,958],[2303,1809,1283,983],[2431,1911,1351,1051],[2563,1989,1423,1093],[2699,2099,1499,1139],[2809,2213,1579,1219],[2953,2331,1663,1273]];},function(t,e,r){Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var n=r(0),i=r(1),o={blocks:function(t){for(var e=[],r=0,n=(0, i.readByte)()(t);0!==n;n=(0, i.readByte)()(t))e.push((0, i.readBytes)(n)(t)),r+=n;for(var o=new Uint8Array(r),a=0,s=0;s<e.length;s++)o.set(e[s],a),a+=e[s].length;return o}},a=(0, n.conditional)({gce:[{codes:(0, i.readBytes)(2)},{byteSize:(0, i.readByte)()},{extras:(0, i.readBits)({future:{index:0,length:3},disposal:{index:3,length:3},userInput:{index:6},transparentColorGiven:{index:7}})},{delay:(0, i.readUnsigned)(!0)},{transparentColorIndex:(0, i.readByte)()},{terminator:(0, i.readByte)()}]},(function(t){var e=(0, i.peekBytes)(2)(t);return 33===e[0]&&249===e[1]})),s=(0, n.conditional)({image:[{code:(0, i.readByte)()},{descriptor:[{left:(0, i.readUnsigned)(!0)},{top:(0, i.readUnsigned)(!0)},{width:(0, i.readUnsigned)(!0)},{height:(0, i.readUnsigned)(!0)},{lct:(0, i.readBits)({exists:{index:0},interlaced:{index:1},sort:{index:2},future:{index:3,length:2},size:{index:5,length:3}})}]},(0, n.conditional)({lct:(0, i.readArray)(3,(function(t,e,r){return Math.pow(2,r.descriptor.lct.size+1)}))},(function(t,e,r){return r.descriptor.lct.exists})),{data:[{minCodeSize:(0, i.readByte)()},o]}]},(function(t){return 44===(0, i.peekByte)()(t)})),u=(0, n.conditional)({text:[{codes:(0, i.readBytes)(2)},{blockSize:(0, i.readByte)()},{preData:function(t,e,r){return (0, i.readBytes)(r.text.blockSize)(t)}},o]},(function(t){var e=(0, i.peekBytes)(2)(t);return 33===e[0]&&1===e[1]})),h=(0, n.conditional)({application:[{codes:(0, i.readBytes)(2)},{blockSize:(0, i.readByte)()},{id:function(t,e,r){return (0, i.readString)(r.blockSize)(t)}},o]},(function(t){var e=(0, i.peekBytes)(2)(t);return 33===e[0]&&255===e[1]})),f=(0, n.conditional)({comment:[{codes:(0, i.readBytes)(2)},o]},(function(t){var e=(0, i.peekBytes)(2)(t);return 33===e[0]&&254===e[1]})),l=[{header:[{signature:(0, i.readString)(3)},{version:(0, i.readString)(3)}]},{lsd:[{width:(0, i.readUnsigned)(!0)},{height:(0, i.readUnsigned)(!0)},{gct:(0, i.readBits)({exists:{index:0},resolution:{index:1,length:3},sort:{index:4},size:{index:5,length:3}})},{backgroundColorIndex:(0, i.readByte)()},{pixelAspectRatio:(0, i.readByte)()}]},(0, n.conditional)({gct:(0, i.readArray)(3,(function(t,e){return Math.pow(2,e.lsd.gct.size+1)}))},(function(t,e){return e.lsd.gct.exists})),{frames:(0, n.loop)([a,h,f,s,u],(function(t){var e=(0, i.peekByte)()(t);return 33===e||44===e}))}];e.default=l;},function(t,e,r){var n=this&&this.__createBinding||(Object.create?function(t,e,r,n){void 0===n&&(n=r),Object.defineProperty(t,n,{enumerable:!0,get:function(){return e[r]}});}:function(t,e,r,n){void 0===n&&(n=r),t[n]=e[r];}),i=this&&this.__exportStar||function(t,e){for(var r in t)"default"===r||e.hasOwnProperty(r)||n(e,t,r);};Object.defineProperty(e,"__esModule",{value:!0}),i(r(2),e);var o=r(5);Object.defineProperty(e,"AwesomeQR",{enumerable:!0,get:function(){return o.AwesomeQR}});},function(t,e,r){(function(t){var n=this&&this.__awaiter||function(t,e,r,n){return new(r||(r=Promise))((function(i,o){function a(t){try{u(n.next(t));}catch(t){o(t);}}function s(t){try{u(n.throw(t));}catch(t){o(t);}}function u(t){var e;t.done?i(t.value):(e=t.value,e instanceof r?e:new r((function(t){t(e);}))).then(a,s);}u((n=n.apply(t,e||[])).next());}))},i=this&&this.__generator||function(t,e){var r,n,i,o,a={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return o={next:s(0),throw:s(1),return:s(2)},"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function s(o){return function(s){return function(o){if(r)throw new TypeError("Generator is already executing.");for(;a;)try{if(r=1,n&&(i=2&o[0]?n.return:o[0]?n.throw||((i=n.return)&&i.call(n),0):n.next)&&!(i=i.call(n,o[1])).done)return i;switch(n=0,i&&(o=[2&o[0],i.value]),o[0]){case 0:case 1:i=o;break;case 4:return a.label++,{value:o[1],done:!1};case 5:a.label++,n=o[1],o=[0];continue;case 7:o=a.ops.pop(),a.trys.pop();continue;default:if(!(i=a.trys,(i=i.length>0&&i[i.length-1])||6!==o[0]&&2!==o[0])){a=0;continue}if(3===o[0]&&(!i||o[1]>i[0]&&o[1]<i[3])){a.label=o[1];break}if(6===o[0]&&a.label<i[1]){a.label=i[1],i=o;break}if(i&&a.label<i[2]){a.label=i[2],a.ops.push(o);break}i[2]&&a.ops.pop(),a.trys.pop();continue}o=e.call(t,a);}catch(t){o=[6,t],n=0;}finally{r=i=0;}if(5&o[0])throw o[1];return {value:o[0]?o[1]:void 0,done:!0}}([o,s])}}},o=this&&this.__importDefault||function(t){return t&&t.__esModule?t:{default:t}};Object.defineProperty(e,"__esModule",{value:!0}),e.AwesomeQR=void 0;var a=r(11),s=r(16),u=r(2),h=o(r(13)),f=function(){function e(t){var r=Object.assign({},t);Object.keys(e._defaultOptions).map((function(t){t in r||Object.defineProperty(r,t,{value:e._defaultOptions[t],enumerable:!0,writable:!0});})),this.options=r,this.canvas=a.createCanvas(t.size,t.size),this.canvasContext=this.canvas.getContext("2d"),this.qrCode=new u.QRCodeModel(-1,this.options.correctLevel),this.qrCode.addData(this.options.text),this.qrCode.make();}return e.prototype.draw=function(){var t=this;return new Promise((function(e){return t._draw().then(e)}))},e.prototype._clear=function(){this.canvasContext.clearRect(0,0,this.canvas.width,this.canvas.height);},e._prepareRoundedCornerClip=function(t,e,r,n,i,o){t.beginPath(),t.moveTo(e,r),t.arcTo(e+n,r,e+n,r+i,o),t.arcTo(e+n,r+i,e,r+i,o),t.arcTo(e,r+i,e,r,o),t.arcTo(e,r,e+n,r,o),t.closePath();},e._getAverageRGB=function(t){var e,r,n={r:0,g:0,b:0},i=-4,o={r:0,g:0,b:0},s=0;r=t.naturalHeight||t.height,e=t.naturalWidth||t.width;var u,h=a.createCanvas(e,r).getContext("2d");if(!h)return n;h.drawImage(t,0,0);try{u=h.getImageData(0,0,e,r);}catch(t){return n}for(;(i+=20)<u.data.length;)u.data[i]>200||u.data[i+1]>200||u.data[i+2]>200||(++s,o.r+=u.data[i],o.g+=u.data[i+1],o.b+=u.data[i+2]);return o.r=~~(o.r/s),o.g=~~(o.g/s),o.b=~~(o.b/s),o},e._drawDot=function(t,e,r,n,i,o){void 0===i&&(i=0),void 0===o&&(o=1),t.fillRect((e+i)*n,(r+i)*n,o*n,o*n);},e._drawAlignProtector=function(t,e,r,n,i){t.clearRect((e-2)*n,(r-2)*i,5*n,5*i),t.fillRect((e-2)*n,(r-2)*i,5*n,5*i);},e._drawAlign=function(t,r,n,i,o,a,s){void 0===o&&(o=0),void 0===a&&(a=1);var u=t.fillStyle;t.fillStyle=s,new Array(4).fill(0).map((function(s,u){e._drawDot(t,r-2+u,n-2,i,o,a),e._drawDot(t,r+2,n-2+u,i,o,a),e._drawDot(t,r+2-u,n+2,i,o,a),e._drawDot(t,r-2,n+2-u,i,o,a);})),e._drawDot(t,r,n,i,o,a),t.fillStyle="rgba(255, 255, 255, 0.6)",new Array(2).fill(0).map((function(s,u){e._drawDot(t,r-1+u,n-1,i,o,a),e._drawDot(t,r+1,n-1+u,i,o,a),e._drawDot(t,r+1-u,n+1,i,o,a),e._drawDot(t,r-1,n+1-u,i,o,a);})),t.fillStyle=u;},e.prototype._draw=function(){var r;return n(this,void 0,void 0,(function(){var n,o,f,c,p,d,g,y,w,v,m,b,B,A,E,_,P,R,C,x,T,D,S,L,I,M,k,U,O,N,Y,F,j,z,Q,G,H,K,X,q,J,V,W,Z,$,tt,et,rt,nt,it,ot,at,st,ut,ht;return i(this,(function(i){switch(i.label){case 0:if(n=null===(r=this.qrCode)||void 0===r?void 0:r.moduleCount,o=this.options.size,((f=this.options.margin)<0||2*f>=o)&&(f=0),c=Math.ceil(f),p=o-2*f,d=this.options.whiteMargin,g=this.options.backgroundDimming,y=Math.ceil(p/n),v=(w=y*n)+2*c,m=a.createCanvas(v,v),b=m.getContext("2d"),B=this.options.dotScale,this._clear(),B<=0||B>1)throw new Error("Scale should be in range (0, 1].");if(b.save(),b.translate(c,c),A=a.createCanvas(v,v),E=A.getContext("2d"),_=null,P=[],!this.options.gifBackground)return [3,1];if(R=s.parseGIF(this.options.gifBackground),_=R,P=s.decompressFrames(R,!0),this.options.autoColor){for(C=0,x=0,T=0,D=0,G=0;G<P[0].colorTable.length;G++)(S=P[0].colorTable[G])[0]>200||S[1]>200||S[2]>200||0===S[0]&&0===S[1]&&0===S[2]||(D++,C+=S[0],x+=S[1],T+=S[2]);C=~~(C/D),x=~~(x/D),T=~~(T/D),this.options.colorDark="rgb("+C+","+x+","+T+")";}return [3,4];case 1:return this.options.backgroundImage?[4,a.loadImage(this.options.backgroundImage)]:[3,3];case 2:return L=i.sent(),this.options.autoColor&&(I=e._getAverageRGB(L),this.options.colorDark="rgb("+I.r+","+I.g+","+I.b+")"),E.drawImage(L,0,0,L.width,L.height,0,0,v,v),E.rect(0,0,v,v),E.fillStyle=g,E.fill(),[3,4];case 3:E.rect(0,0,v,v),E.fillStyle=this.options.colorLight,E.fill(),i.label=4;case 4:for(M=u.QRUtil.getPatternPosition(this.qrCode.typeNumber),k=.5*(1-B),U=0;U<n;U++)for(O=0;O<n;O++){for(N=this.qrCode.isDark(U,O),Y=O<8&&(U<8||U>=n-8)||O>=n-8&&U<8,G=0;G<M.length-1;G++)Y=Y||U>=M[G]-2&&U<=M[G]+2&&O>=M[G]-2&&O<=M[G]+2;F=O*y+(Y?0:k*y),j=U*y+(Y?0:k*y),b.strokeStyle=N?this.options.colorDark:this.options.colorLight,b.lineWidth=.5,b.fillStyle=N?this.options.colorDark:"rgba(255, 255, 255, 0.6)",0===M.length?Y||b.fillRect(F,j,(Y?1:B)*y,(Y?1:B)*y):(z=O<n-4&&O>=n-4-5&&U<n-4&&U>=n-4-5,Y||z||b.fillRect(F,j,(Y?1:B)*y,(Y?1:B)*y));}for(b.fillStyle="rgba(255, 255, 255, 0.6)",b.fillRect(0,0,8*y,8*y),b.fillRect(0,(n-8)*y,8*y,8*y),b.fillRect((n-8)*y,0,8*y,8*y),Q=M[M.length-1],b.fillStyle=this.options.colorDark,b.fillRect(0,0,7*y,y),b.fillRect((n-7)*y,0,7*y,y),b.fillRect(0,6*y,7*y,y),b.fillRect((n-7)*y,6*y,7*y,y),b.fillRect(0,(n-7)*y,7*y,y),b.fillRect(0,(n-7+6)*y,7*y,y),b.fillRect(0,0,y,7*y),b.fillRect(6*y,0,y,7*y),b.fillRect((n-7)*y,0,y,7*y),b.fillRect((n-7+6)*y,0,y,7*y),b.fillRect(0,(n-7)*y,y,7*y),b.fillRect(6*y,(n-7)*y,y,7*y),b.fillRect(2*y,2*y,3*y,3*y),b.fillRect((n-7+2)*y,2*y,3*y,3*y),b.fillRect(2*y,(n-7+2)*y,3*y,3*y),G=0;G<n-8;G+=2)b.fillRect((8+G+k)*y,(6+k)*y,B*y,B*y),b.fillRect((6+k)*y,(8+G+k)*y,B*y,B*y);for(G=0;G<M.length;G++)for(H=0;H<M.length;H++)K=M[H],X=M[G],(6!==K||6!==X&&X!==Q)&&(6!==X||6!==K&&K!==Q)&&e._drawAlign(b,K,X,y,k,B,this.options.colorDark);return d&&(b.fillStyle="#FFFFFF",b.fillRect(-c,-c,v,c),b.fillRect(-c,w,v,c),b.fillRect(w,-c,c,v),b.fillRect(-c,-c,c,v)),this.options.logoImage?[4,a.loadImage(this.options.logoImage)]:[3,6];case 5:q=i.sent(),J=this.options.logoScale,V=this.options.logoMargin,W=this.options.logoCornerRadius,(J<=0||J>=1)&&(J=.2),V<0&&(V=0),W<0&&(W=0),b.restore(),tt=$=.5*(v-(Z=w*J)),b.fillStyle="#FFFFFF",b.save(),e._prepareRoundedCornerClip(b,$-V,tt-V,Z+2*V,Z+2*V,W),b.clip(),b.fill(),b.restore(),b.save(),e._prepareRoundedCornerClip(b,$,tt,Z,Z,W),b.clip(),b.drawImage(q,$,tt,Z,Z),b.restore(),i.label=6;case 6:if(_){if(P.forEach((function(t){et||((et=new h.default(o,o)).setDelay(t.delay),et.setRepeat(0));var e=t.dims,r=e.width,n=e.height;rt||(rt=a.createCanvas(r,n),(nt=rt.getContext("2d")).rect(0,0,rt.width,rt.height),nt.fillStyle="#ffffff",nt.fill()),it&&at&&r===it.width&&n===it.height||(it=a.createCanvas(r,n),ot=it.getContext("2d"),at=ot.createImageData(r,n)),at.data.set(t.patch),ot.putImageData(at,0,0),nt.drawImage(it,t.dims.left,t.dims.top);var i=a.createCanvas(v,v),s=i.getContext("2d");s.drawImage(rt,0,0,v,v),s.rect(0,0,v,v),s.fillStyle=g,s.fill(),s.drawImage(m,0,0,v,v);var u=a.createCanvas(o,o),f=u.getContext("2d");f.drawImage(i,0,0,o,o),et.addFrame(f.getImageData(0,0,u.width,u.height).data);})),!et)throw new Error("No frames.");return et.finish(),l(this.canvas)?(st=et.stream().toFlattenUint8Array(),ut=st.reduce((function(t,e){return t+String.fromCharCode(e)}),""),[2,Promise.resolve("data:image/gif;base64,"+window.btoa(ut))]):[2,Promise.resolve(t.from(et.stream().toFlattenUint8Array()))]}return E.drawImage(m,0,0,v,v),b.drawImage(A,-c,-c,v,v),ht=a.createCanvas(o,o),ht.getContext("2d").drawImage(m,0,0,o,o),this.canvas=ht,l(this.canvas)?[2,Promise.resolve(this.canvas.toDataURL())]:[2,Promise.resolve(this.canvas.toBuffer())]}}))}))},e.CorrectLevel=u.QRErrorCorrectLevel,e._defaultOptions={text:"",size:400,margin:20,colorDark:"#000000",colorLight:"#ffffff",correctLevel:u.QRErrorCorrectLevel.M,backgroundImage:void 0,backgroundDimming:"rgba(0,0,0,0)",logoImage:void 0,logoScale:.2,logoMargin:6,logoCornerRadius:8,whiteMargin:!0,dotScale:.4,autoColor:!0},e}();function l(t){try{return t instanceof HTMLElement}catch(e){return "object"==typeof t&&1===t.nodeType&&"object"==typeof t.style&&"object"==typeof t.ownerDocument}}e.AwesomeQR=f;}).call(this,r(6).Buffer);},function(t,e,r){(function(t){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
var n=r(8),i=r(9),o=r(10);function a(){return u.TYPED_ARRAY_SUPPORT?2147483647:1073741823}function s(t,e){if(a()<e)throw new RangeError("Invalid typed array length");return u.TYPED_ARRAY_SUPPORT?(t=new Uint8Array(e)).__proto__=u.prototype:(null===t&&(t=new u(e)),t.length=e),t}function u(t,e,r){if(!(u.TYPED_ARRAY_SUPPORT||this instanceof u))return new u(t,e,r);if("number"==typeof t){if("string"==typeof e)throw new Error("If encoding is specified then the first argument must be a string");return l(this,t)}return h(this,t,e,r)}function h(t,e,r,n){if("number"==typeof e)throw new TypeError('"value" argument must not be a number');return "undefined"!=typeof ArrayBuffer&&e instanceof ArrayBuffer?function(t,e,r,n){if(e.byteLength,r<0||e.byteLength<r)throw new RangeError("'offset' is out of bounds");if(e.byteLength<r+(n||0))throw new RangeError("'length' is out of bounds");e=void 0===r&&void 0===n?new Uint8Array(e):void 0===n?new Uint8Array(e,r):new Uint8Array(e,r,n);u.TYPED_ARRAY_SUPPORT?(t=e).__proto__=u.prototype:t=c(t,e);return t}(t,e,r,n):"string"==typeof e?function(t,e,r){"string"==typeof r&&""!==r||(r="utf8");if(!u.isEncoding(r))throw new TypeError('"encoding" must be a valid string encoding');var n=0|d(e,r),i=(t=s(t,n)).write(e,r);i!==n&&(t=t.slice(0,i));return t}(t,e,r):function(t,e){if(u.isBuffer(e)){var r=0|p(e.length);return 0===(t=s(t,r)).length||e.copy(t,0,0,r),t}if(e){if("undefined"!=typeof ArrayBuffer&&e.buffer instanceof ArrayBuffer||"length"in e)return "number"!=typeof e.length||(n=e.length)!=n?s(t,0):c(t,e);if("Buffer"===e.type&&o(e.data))return c(t,e.data)}var n;throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.")}(t,e)}function f(t){if("number"!=typeof t)throw new TypeError('"size" argument must be a number');if(t<0)throw new RangeError('"size" argument must not be negative')}function l(t,e){if(f(e),t=s(t,e<0?0:0|p(e)),!u.TYPED_ARRAY_SUPPORT)for(var r=0;r<e;++r)t[r]=0;return t}function c(t,e){var r=e.length<0?0:0|p(e.length);t=s(t,r);for(var n=0;n<r;n+=1)t[n]=255&e[n];return t}function p(t){if(t>=a())throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x"+a().toString(16)+" bytes");return 0|t}function d(t,e){if(u.isBuffer(t))return t.length;if("undefined"!=typeof ArrayBuffer&&"function"==typeof ArrayBuffer.isView&&(ArrayBuffer.isView(t)||t instanceof ArrayBuffer))return t.byteLength;"string"!=typeof t&&(t=""+t);var r=t.length;if(0===r)return 0;for(var n=!1;;)switch(e){case"ascii":case"latin1":case"binary":return r;case"utf8":case"utf-8":case void 0:return F(t).length;case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return 2*r;case"hex":return r>>>1;case"base64":return j(t).length;default:if(n)return F(t).length;e=(""+e).toLowerCase(),n=!0;}}function g(t,e,r){var n=!1;if((void 0===e||e<0)&&(e=0),e>this.length)return "";if((void 0===r||r>this.length)&&(r=this.length),r<=0)return "";if((r>>>=0)<=(e>>>=0))return "";for(t||(t="utf8");;)switch(t){case"hex":return T(this,e,r);case"utf8":case"utf-8":return R(this,e,r);case"ascii":return C(this,e,r);case"latin1":case"binary":return x(this,e,r);case"base64":return P(this,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return D(this,e,r);default:if(n)throw new TypeError("Unknown encoding: "+t);t=(t+"").toLowerCase(),n=!0;}}function y(t,e,r){var n=t[e];t[e]=t[r],t[r]=n;}function w(t,e,r,n,i){if(0===t.length)return -1;if("string"==typeof r?(n=r,r=0):r>2147483647?r=2147483647:r<-2147483648&&(r=-2147483648),r=+r,isNaN(r)&&(r=i?0:t.length-1),r<0&&(r=t.length+r),r>=t.length){if(i)return -1;r=t.length-1;}else if(r<0){if(!i)return -1;r=0;}if("string"==typeof e&&(e=u.from(e,n)),u.isBuffer(e))return 0===e.length?-1:v(t,e,r,n,i);if("number"==typeof e)return e&=255,u.TYPED_ARRAY_SUPPORT&&"function"==typeof Uint8Array.prototype.indexOf?i?Uint8Array.prototype.indexOf.call(t,e,r):Uint8Array.prototype.lastIndexOf.call(t,e,r):v(t,[e],r,n,i);throw new TypeError("val must be string, number or Buffer")}function v(t,e,r,n,i){var o,a=1,s=t.length,u=e.length;if(void 0!==n&&("ucs2"===(n=String(n).toLowerCase())||"ucs-2"===n||"utf16le"===n||"utf-16le"===n)){if(t.length<2||e.length<2)return -1;a=2,s/=2,u/=2,r/=2;}function h(t,e){return 1===a?t[e]:t.readUInt16BE(e*a)}if(i){var f=-1;for(o=r;o<s;o++)if(h(t,o)===h(e,-1===f?0:o-f)){if(-1===f&&(f=o),o-f+1===u)return f*a}else -1!==f&&(o-=o-f),f=-1;}else for(r+u>s&&(r=s-u),o=r;o>=0;o--){for(var l=!0,c=0;c<u;c++)if(h(t,o+c)!==h(e,c)){l=!1;break}if(l)return o}return -1}function m(t,e,r,n){r=Number(r)||0;var i=t.length-r;n?(n=Number(n))>i&&(n=i):n=i;var o=e.length;if(o%2!=0)throw new TypeError("Invalid hex string");n>o/2&&(n=o/2);for(var a=0;a<n;++a){var s=parseInt(e.substr(2*a,2),16);if(isNaN(s))return a;t[r+a]=s;}return a}function b(t,e,r,n){return z(F(e,t.length-r),t,r,n)}function B(t,e,r,n){return z(function(t){for(var e=[],r=0;r<t.length;++r)e.push(255&t.charCodeAt(r));return e}(e),t,r,n)}function A(t,e,r,n){return B(t,e,r,n)}function E(t,e,r,n){return z(j(e),t,r,n)}function _(t,e,r,n){return z(function(t,e){for(var r,n,i,o=[],a=0;a<t.length&&!((e-=2)<0);++a)r=t.charCodeAt(a),n=r>>8,i=r%256,o.push(i),o.push(n);return o}(e,t.length-r),t,r,n)}function P(t,e,r){return 0===e&&r===t.length?n.fromByteArray(t):n.fromByteArray(t.slice(e,r))}function R(t,e,r){r=Math.min(t.length,r);for(var n=[],i=e;i<r;){var o,a,s,u,h=t[i],f=null,l=h>239?4:h>223?3:h>191?2:1;if(i+l<=r)switch(l){case 1:h<128&&(f=h);break;case 2:128==(192&(o=t[i+1]))&&(u=(31&h)<<6|63&o)>127&&(f=u);break;case 3:o=t[i+1],a=t[i+2],128==(192&o)&&128==(192&a)&&(u=(15&h)<<12|(63&o)<<6|63&a)>2047&&(u<55296||u>57343)&&(f=u);break;case 4:o=t[i+1],a=t[i+2],s=t[i+3],128==(192&o)&&128==(192&a)&&128==(192&s)&&(u=(15&h)<<18|(63&o)<<12|(63&a)<<6|63&s)>65535&&u<1114112&&(f=u);}null===f?(f=65533,l=1):f>65535&&(f-=65536,n.push(f>>>10&1023|55296),f=56320|1023&f),n.push(f),i+=l;}return function(t){var e=t.length;if(e<=4096)return String.fromCharCode.apply(String,t);var r="",n=0;for(;n<e;)r+=String.fromCharCode.apply(String,t.slice(n,n+=4096));return r}(n)}e.Buffer=u,e.SlowBuffer=function(t){+t!=t&&(t=0);return u.alloc(+t)},e.INSPECT_MAX_BYTES=50,u.TYPED_ARRAY_SUPPORT=void 0!==t.TYPED_ARRAY_SUPPORT?t.TYPED_ARRAY_SUPPORT:function(){try{var t=new Uint8Array(1);return t.__proto__={__proto__:Uint8Array.prototype,foo:function(){return 42}},42===t.foo()&&"function"==typeof t.subarray&&0===t.subarray(1,1).byteLength}catch(t){return !1}}(),e.kMaxLength=a(),u.poolSize=8192,u._augment=function(t){return t.__proto__=u.prototype,t},u.from=function(t,e,r){return h(null,t,e,r)},u.TYPED_ARRAY_SUPPORT&&(u.prototype.__proto__=Uint8Array.prototype,u.__proto__=Uint8Array,"undefined"!=typeof Symbol&&Symbol.species&&u[Symbol.species]===u&&Object.defineProperty(u,Symbol.species,{value:null,configurable:!0})),u.alloc=function(t,e,r){return function(t,e,r,n){return f(e),e<=0?s(t,e):void 0!==r?"string"==typeof n?s(t,e).fill(r,n):s(t,e).fill(r):s(t,e)}(null,t,e,r)},u.allocUnsafe=function(t){return l(null,t)},u.allocUnsafeSlow=function(t){return l(null,t)},u.isBuffer=function(t){return !(null==t||!t._isBuffer)},u.compare=function(t,e){if(!u.isBuffer(t)||!u.isBuffer(e))throw new TypeError("Arguments must be Buffers");if(t===e)return 0;for(var r=t.length,n=e.length,i=0,o=Math.min(r,n);i<o;++i)if(t[i]!==e[i]){r=t[i],n=e[i];break}return r<n?-1:n<r?1:0},u.isEncoding=function(t){switch(String(t).toLowerCase()){case"hex":case"utf8":case"utf-8":case"ascii":case"latin1":case"binary":case"base64":case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return !0;default:return !1}},u.concat=function(t,e){if(!o(t))throw new TypeError('"list" argument must be an Array of Buffers');if(0===t.length)return u.alloc(0);var r;if(void 0===e)for(e=0,r=0;r<t.length;++r)e+=t[r].length;var n=u.allocUnsafe(e),i=0;for(r=0;r<t.length;++r){var a=t[r];if(!u.isBuffer(a))throw new TypeError('"list" argument must be an Array of Buffers');a.copy(n,i),i+=a.length;}return n},u.byteLength=d,u.prototype._isBuffer=!0,u.prototype.swap16=function(){var t=this.length;if(t%2!=0)throw new RangeError("Buffer size must be a multiple of 16-bits");for(var e=0;e<t;e+=2)y(this,e,e+1);return this},u.prototype.swap32=function(){var t=this.length;if(t%4!=0)throw new RangeError("Buffer size must be a multiple of 32-bits");for(var e=0;e<t;e+=4)y(this,e,e+3),y(this,e+1,e+2);return this},u.prototype.swap64=function(){var t=this.length;if(t%8!=0)throw new RangeError("Buffer size must be a multiple of 64-bits");for(var e=0;e<t;e+=8)y(this,e,e+7),y(this,e+1,e+6),y(this,e+2,e+5),y(this,e+3,e+4);return this},u.prototype.toString=function(){var t=0|this.length;return 0===t?"":0===arguments.length?R(this,0,t):g.apply(this,arguments)},u.prototype.equals=function(t){if(!u.isBuffer(t))throw new TypeError("Argument must be a Buffer");return this===t||0===u.compare(this,t)},u.prototype.inspect=function(){var t="",r=e.INSPECT_MAX_BYTES;return this.length>0&&(t=this.toString("hex",0,r).match(/.{2}/g).join(" "),this.length>r&&(t+=" ... ")),"<Buffer "+t+">"},u.prototype.compare=function(t,e,r,n,i){if(!u.isBuffer(t))throw new TypeError("Argument must be a Buffer");if(void 0===e&&(e=0),void 0===r&&(r=t?t.length:0),void 0===n&&(n=0),void 0===i&&(i=this.length),e<0||r>t.length||n<0||i>this.length)throw new RangeError("out of range index");if(n>=i&&e>=r)return 0;if(n>=i)return -1;if(e>=r)return 1;if(this===t)return 0;for(var o=(i>>>=0)-(n>>>=0),a=(r>>>=0)-(e>>>=0),s=Math.min(o,a),h=this.slice(n,i),f=t.slice(e,r),l=0;l<s;++l)if(h[l]!==f[l]){o=h[l],a=f[l];break}return o<a?-1:a<o?1:0},u.prototype.includes=function(t,e,r){return -1!==this.indexOf(t,e,r)},u.prototype.indexOf=function(t,e,r){return w(this,t,e,r,!0)},u.prototype.lastIndexOf=function(t,e,r){return w(this,t,e,r,!1)},u.prototype.write=function(t,e,r,n){if(void 0===e)n="utf8",r=this.length,e=0;else if(void 0===r&&"string"==typeof e)n=e,r=this.length,e=0;else {if(!isFinite(e))throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");e|=0,isFinite(r)?(r|=0,void 0===n&&(n="utf8")):(n=r,r=void 0);}var i=this.length-e;if((void 0===r||r>i)&&(r=i),t.length>0&&(r<0||e<0)||e>this.length)throw new RangeError("Attempt to write outside buffer bounds");n||(n="utf8");for(var o=!1;;)switch(n){case"hex":return m(this,t,e,r);case"utf8":case"utf-8":return b(this,t,e,r);case"ascii":return B(this,t,e,r);case"latin1":case"binary":return A(this,t,e,r);case"base64":return E(this,t,e,r);case"ucs2":case"ucs-2":case"utf16le":case"utf-16le":return _(this,t,e,r);default:if(o)throw new TypeError("Unknown encoding: "+n);n=(""+n).toLowerCase(),o=!0;}},u.prototype.toJSON=function(){return {type:"Buffer",data:Array.prototype.slice.call(this._arr||this,0)}};function C(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;i<r;++i)n+=String.fromCharCode(127&t[i]);return n}function x(t,e,r){var n="";r=Math.min(t.length,r);for(var i=e;i<r;++i)n+=String.fromCharCode(t[i]);return n}function T(t,e,r){var n=t.length;(!e||e<0)&&(e=0),(!r||r<0||r>n)&&(r=n);for(var i="",o=e;o<r;++o)i+=Y(t[o]);return i}function D(t,e,r){for(var n=t.slice(e,r),i="",o=0;o<n.length;o+=2)i+=String.fromCharCode(n[o]+256*n[o+1]);return i}function S(t,e,r){if(t%1!=0||t<0)throw new RangeError("offset is not uint");if(t+e>r)throw new RangeError("Trying to access beyond buffer length")}function L(t,e,r,n,i,o){if(!u.isBuffer(t))throw new TypeError('"buffer" argument must be a Buffer instance');if(e>i||e<o)throw new RangeError('"value" argument is out of bounds');if(r+n>t.length)throw new RangeError("Index out of range")}function I(t,e,r,n){e<0&&(e=65535+e+1);for(var i=0,o=Math.min(t.length-r,2);i<o;++i)t[r+i]=(e&255<<8*(n?i:1-i))>>>8*(n?i:1-i);}function M(t,e,r,n){e<0&&(e=4294967295+e+1);for(var i=0,o=Math.min(t.length-r,4);i<o;++i)t[r+i]=e>>>8*(n?i:3-i)&255;}function k(t,e,r,n,i,o){if(r+n>t.length)throw new RangeError("Index out of range");if(r<0)throw new RangeError("Index out of range")}function U(t,e,r,n,o){return o||k(t,0,r,4),i.write(t,e,r,n,23,4),r+4}function O(t,e,r,n,o){return o||k(t,0,r,8),i.write(t,e,r,n,52,8),r+8}u.prototype.slice=function(t,e){var r,n=this.length;if((t=~~t)<0?(t+=n)<0&&(t=0):t>n&&(t=n),(e=void 0===e?n:~~e)<0?(e+=n)<0&&(e=0):e>n&&(e=n),e<t&&(e=t),u.TYPED_ARRAY_SUPPORT)(r=this.subarray(t,e)).__proto__=u.prototype;else {var i=e-t;r=new u(i,void 0);for(var o=0;o<i;++o)r[o]=this[o+t];}return r},u.prototype.readUIntLE=function(t,e,r){t|=0,e|=0,r||S(t,e,this.length);for(var n=this[t],i=1,o=0;++o<e&&(i*=256);)n+=this[t+o]*i;return n},u.prototype.readUIntBE=function(t,e,r){t|=0,e|=0,r||S(t,e,this.length);for(var n=this[t+--e],i=1;e>0&&(i*=256);)n+=this[t+--e]*i;return n},u.prototype.readUInt8=function(t,e){return e||S(t,1,this.length),this[t]},u.prototype.readUInt16LE=function(t,e){return e||S(t,2,this.length),this[t]|this[t+1]<<8},u.prototype.readUInt16BE=function(t,e){return e||S(t,2,this.length),this[t]<<8|this[t+1]},u.prototype.readUInt32LE=function(t,e){return e||S(t,4,this.length),(this[t]|this[t+1]<<8|this[t+2]<<16)+16777216*this[t+3]},u.prototype.readUInt32BE=function(t,e){return e||S(t,4,this.length),16777216*this[t]+(this[t+1]<<16|this[t+2]<<8|this[t+3])},u.prototype.readIntLE=function(t,e,r){t|=0,e|=0,r||S(t,e,this.length);for(var n=this[t],i=1,o=0;++o<e&&(i*=256);)n+=this[t+o]*i;return n>=(i*=128)&&(n-=Math.pow(2,8*e)),n},u.prototype.readIntBE=function(t,e,r){t|=0,e|=0,r||S(t,e,this.length);for(var n=e,i=1,o=this[t+--n];n>0&&(i*=256);)o+=this[t+--n]*i;return o>=(i*=128)&&(o-=Math.pow(2,8*e)),o},u.prototype.readInt8=function(t,e){return e||S(t,1,this.length),128&this[t]?-1*(255-this[t]+1):this[t]},u.prototype.readInt16LE=function(t,e){e||S(t,2,this.length);var r=this[t]|this[t+1]<<8;return 32768&r?4294901760|r:r},u.prototype.readInt16BE=function(t,e){e||S(t,2,this.length);var r=this[t+1]|this[t]<<8;return 32768&r?4294901760|r:r},u.prototype.readInt32LE=function(t,e){return e||S(t,4,this.length),this[t]|this[t+1]<<8|this[t+2]<<16|this[t+3]<<24},u.prototype.readInt32BE=function(t,e){return e||S(t,4,this.length),this[t]<<24|this[t+1]<<16|this[t+2]<<8|this[t+3]},u.prototype.readFloatLE=function(t,e){return e||S(t,4,this.length),i.read(this,t,!0,23,4)},u.prototype.readFloatBE=function(t,e){return e||S(t,4,this.length),i.read(this,t,!1,23,4)},u.prototype.readDoubleLE=function(t,e){return e||S(t,8,this.length),i.read(this,t,!0,52,8)},u.prototype.readDoubleBE=function(t,e){return e||S(t,8,this.length),i.read(this,t,!1,52,8)},u.prototype.writeUIntLE=function(t,e,r,n){(t=+t,e|=0,r|=0,n)||L(this,t,e,r,Math.pow(2,8*r)-1,0);var i=1,o=0;for(this[e]=255&t;++o<r&&(i*=256);)this[e+o]=t/i&255;return e+r},u.prototype.writeUIntBE=function(t,e,r,n){(t=+t,e|=0,r|=0,n)||L(this,t,e,r,Math.pow(2,8*r)-1,0);var i=r-1,o=1;for(this[e+i]=255&t;--i>=0&&(o*=256);)this[e+i]=t/o&255;return e+r},u.prototype.writeUInt8=function(t,e,r){return t=+t,e|=0,r||L(this,t,e,1,255,0),u.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),this[e]=255&t,e+1},u.prototype.writeUInt16LE=function(t,e,r){return t=+t,e|=0,r||L(this,t,e,2,65535,0),u.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8):I(this,t,e,!0),e+2},u.prototype.writeUInt16BE=function(t,e,r){return t=+t,e|=0,r||L(this,t,e,2,65535,0),u.TYPED_ARRAY_SUPPORT?(this[e]=t>>>8,this[e+1]=255&t):I(this,t,e,!1),e+2},u.prototype.writeUInt32LE=function(t,e,r){return t=+t,e|=0,r||L(this,t,e,4,4294967295,0),u.TYPED_ARRAY_SUPPORT?(this[e+3]=t>>>24,this[e+2]=t>>>16,this[e+1]=t>>>8,this[e]=255&t):M(this,t,e,!0),e+4},u.prototype.writeUInt32BE=function(t,e,r){return t=+t,e|=0,r||L(this,t,e,4,4294967295,0),u.TYPED_ARRAY_SUPPORT?(this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t):M(this,t,e,!1),e+4},u.prototype.writeIntLE=function(t,e,r,n){if(t=+t,e|=0,!n){var i=Math.pow(2,8*r-1);L(this,t,e,r,i-1,-i);}var o=0,a=1,s=0;for(this[e]=255&t;++o<r&&(a*=256);)t<0&&0===s&&0!==this[e+o-1]&&(s=1),this[e+o]=(t/a>>0)-s&255;return e+r},u.prototype.writeIntBE=function(t,e,r,n){if(t=+t,e|=0,!n){var i=Math.pow(2,8*r-1);L(this,t,e,r,i-1,-i);}var o=r-1,a=1,s=0;for(this[e+o]=255&t;--o>=0&&(a*=256);)t<0&&0===s&&0!==this[e+o+1]&&(s=1),this[e+o]=(t/a>>0)-s&255;return e+r},u.prototype.writeInt8=function(t,e,r){return t=+t,e|=0,r||L(this,t,e,1,127,-128),u.TYPED_ARRAY_SUPPORT||(t=Math.floor(t)),t<0&&(t=255+t+1),this[e]=255&t,e+1},u.prototype.writeInt16LE=function(t,e,r){return t=+t,e|=0,r||L(this,t,e,2,32767,-32768),u.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8):I(this,t,e,!0),e+2},u.prototype.writeInt16BE=function(t,e,r){return t=+t,e|=0,r||L(this,t,e,2,32767,-32768),u.TYPED_ARRAY_SUPPORT?(this[e]=t>>>8,this[e+1]=255&t):I(this,t,e,!1),e+2},u.prototype.writeInt32LE=function(t,e,r){return t=+t,e|=0,r||L(this,t,e,4,2147483647,-2147483648),u.TYPED_ARRAY_SUPPORT?(this[e]=255&t,this[e+1]=t>>>8,this[e+2]=t>>>16,this[e+3]=t>>>24):M(this,t,e,!0),e+4},u.prototype.writeInt32BE=function(t,e,r){return t=+t,e|=0,r||L(this,t,e,4,2147483647,-2147483648),t<0&&(t=4294967295+t+1),u.TYPED_ARRAY_SUPPORT?(this[e]=t>>>24,this[e+1]=t>>>16,this[e+2]=t>>>8,this[e+3]=255&t):M(this,t,e,!1),e+4},u.prototype.writeFloatLE=function(t,e,r){return U(this,t,e,!0,r)},u.prototype.writeFloatBE=function(t,e,r){return U(this,t,e,!1,r)},u.prototype.writeDoubleLE=function(t,e,r){return O(this,t,e,!0,r)},u.prototype.writeDoubleBE=function(t,e,r){return O(this,t,e,!1,r)},u.prototype.copy=function(t,e,r,n){if(r||(r=0),n||0===n||(n=this.length),e>=t.length&&(e=t.length),e||(e=0),n>0&&n<r&&(n=r),n===r)return 0;if(0===t.length||0===this.length)return 0;if(e<0)throw new RangeError("targetStart out of bounds");if(r<0||r>=this.length)throw new RangeError("sourceStart out of bounds");if(n<0)throw new RangeError("sourceEnd out of bounds");n>this.length&&(n=this.length),t.length-e<n-r&&(n=t.length-e+r);var i,o=n-r;if(this===t&&r<e&&e<n)for(i=o-1;i>=0;--i)t[i+e]=this[i+r];else if(o<1e3||!u.TYPED_ARRAY_SUPPORT)for(i=0;i<o;++i)t[i+e]=this[i+r];else Uint8Array.prototype.set.call(t,this.subarray(r,r+o),e);return o},u.prototype.fill=function(t,e,r,n){if("string"==typeof t){if("string"==typeof e?(n=e,e=0,r=this.length):"string"==typeof r&&(n=r,r=this.length),1===t.length){var i=t.charCodeAt(0);i<256&&(t=i);}if(void 0!==n&&"string"!=typeof n)throw new TypeError("encoding must be a string");if("string"==typeof n&&!u.isEncoding(n))throw new TypeError("Unknown encoding: "+n)}else "number"==typeof t&&(t&=255);if(e<0||this.length<e||this.length<r)throw new RangeError("Out of range index");if(r<=e)return this;var o;if(e>>>=0,r=void 0===r?this.length:r>>>0,t||(t=0),"number"==typeof t)for(o=e;o<r;++o)this[o]=t;else {var a=u.isBuffer(t)?t:F(new u(t,n).toString()),s=a.length;for(o=0;o<r-e;++o)this[o+e]=a[o%s];}return this};var N=/[^+\/0-9A-Za-z-_]/g;function Y(t){return t<16?"0"+t.toString(16):t.toString(16)}function F(t,e){var r;e=e||1/0;for(var n=t.length,i=null,o=[],a=0;a<n;++a){if((r=t.charCodeAt(a))>55295&&r<57344){if(!i){if(r>56319){(e-=3)>-1&&o.push(239,191,189);continue}if(a+1===n){(e-=3)>-1&&o.push(239,191,189);continue}i=r;continue}if(r<56320){(e-=3)>-1&&o.push(239,191,189),i=r;continue}r=65536+(i-55296<<10|r-56320);}else i&&(e-=3)>-1&&o.push(239,191,189);if(i=null,r<128){if((e-=1)<0)break;o.push(r);}else if(r<2048){if((e-=2)<0)break;o.push(r>>6|192,63&r|128);}else if(r<65536){if((e-=3)<0)break;o.push(r>>12|224,r>>6&63|128,63&r|128);}else {if(!(r<1114112))throw new Error("Invalid code point");if((e-=4)<0)break;o.push(r>>18|240,r>>12&63|128,r>>6&63|128,63&r|128);}}return o}function j(t){return n.toByteArray(function(t){if((t=function(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}(t).replace(N,"")).length<2)return "";for(;t.length%4!=0;)t+="=";return t}(t))}function z(t,e,r,n){for(var i=0;i<n&&!(i+r>=e.length||i>=t.length);++i)e[i+r]=t[i];return i}}).call(this,r(7));},function(t,e){var r;r=function(){return this}();try{r=r||new Function("return this")();}catch(t){"object"==typeof window&&(r=window);}t.exports=r;},function(t,e,r){e.byteLength=function(t){var e=h(t),r=e[0],n=e[1];return 3*(r+n)/4-n},e.toByteArray=function(t){var e,r,n=h(t),a=n[0],s=n[1],u=new o(function(t,e,r){return 3*(e+r)/4-r}(0,a,s)),f=0,l=s>0?a-4:a;for(r=0;r<l;r+=4)e=i[t.charCodeAt(r)]<<18|i[t.charCodeAt(r+1)]<<12|i[t.charCodeAt(r+2)]<<6|i[t.charCodeAt(r+3)],u[f++]=e>>16&255,u[f++]=e>>8&255,u[f++]=255&e;2===s&&(e=i[t.charCodeAt(r)]<<2|i[t.charCodeAt(r+1)]>>4,u[f++]=255&e);1===s&&(e=i[t.charCodeAt(r)]<<10|i[t.charCodeAt(r+1)]<<4|i[t.charCodeAt(r+2)]>>2,u[f++]=e>>8&255,u[f++]=255&e);return u},e.fromByteArray=function(t){for(var e,r=t.length,i=r%3,o=[],a=0,s=r-i;a<s;a+=16383)o.push(f(t,a,a+16383>s?s:a+16383));1===i?(e=t[r-1],o.push(n[e>>2]+n[e<<4&63]+"==")):2===i&&(e=(t[r-2]<<8)+t[r-1],o.push(n[e>>10]+n[e>>4&63]+n[e<<2&63]+"="));return o.join("")};for(var n=[],i=[],o="undefined"!=typeof Uint8Array?Uint8Array:Array,a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",s=0,u=a.length;s<u;++s)n[s]=a[s],i[a.charCodeAt(s)]=s;function h(t){var e=t.length;if(e%4>0)throw new Error("Invalid string. Length must be a multiple of 4");var r=t.indexOf("=");return -1===r&&(r=e),[r,r===e?0:4-r%4]}function f(t,e,r){for(var i,o,a=[],s=e;s<r;s+=3)i=(t[s]<<16&16711680)+(t[s+1]<<8&65280)+(255&t[s+2]),a.push(n[(o=i)>>18&63]+n[o>>12&63]+n[o>>6&63]+n[63&o]);return a.join("")}i["-".charCodeAt(0)]=62,i["_".charCodeAt(0)]=63;},function(t,e){e.read=function(t,e,r,n,i){var o,a,s=8*i-n-1,u=(1<<s)-1,h=u>>1,f=-7,l=r?i-1:0,c=r?-1:1,p=t[e+l];for(l+=c,o=p&(1<<-f)-1,p>>=-f,f+=s;f>0;o=256*o+t[e+l],l+=c,f-=8);for(a=o&(1<<-f)-1,o>>=-f,f+=n;f>0;a=256*a+t[e+l],l+=c,f-=8);if(0===o)o=1-h;else {if(o===u)return a?NaN:1/0*(p?-1:1);a+=Math.pow(2,n),o-=h;}return (p?-1:1)*a*Math.pow(2,o-n)},e.write=function(t,e,r,n,i,o){var a,s,u,h=8*o-i-1,f=(1<<h)-1,l=f>>1,c=23===i?Math.pow(2,-24)-Math.pow(2,-77):0,p=n?0:o-1,d=n?1:-1,g=e<0||0===e&&1/e<0?1:0;for(e=Math.abs(e),isNaN(e)||e===1/0?(s=isNaN(e)?1:0,a=f):(a=Math.floor(Math.log(e)/Math.LN2),e*(u=Math.pow(2,-a))<1&&(a--,u*=2),(e+=a+l>=1?c/u:c*Math.pow(2,1-l))*u>=2&&(a++,u/=2),a+l>=f?(s=0,a=f):a+l>=1?(s=(e*u-1)*Math.pow(2,i),a+=l):(s=e*Math.pow(2,l-1)*Math.pow(2,i),a=0));i>=8;t[r+p]=255&s,p+=d,s/=256,i-=8);for(a=a<<i|s,h+=i;h>0;t[r+p]=255&a,p+=d,a/=256,h-=8);t[r+p-d]|=128*g;};},function(t,e){var r={}.toString;t.exports=Array.isArray||function(t){return "[object Array]"==r.call(t)};},function(t,e,r){const n=r(12);e.parseFont=n,e.createCanvas=function(t,e){return Object.assign(document.createElement("canvas"),{width:t,height:e})},e.createImageData=function(t,e,r){switch(arguments.length){case 0:return new ImageData;case 1:return new ImageData(t);case 2:return new ImageData(t,e);default:return new ImageData(t,e,r)}},e.loadImage=function(t,e){return new Promise((function(r,n){const i=Object.assign(document.createElement("img"),e);function o(){i.onload=null,i.onerror=null;}i.onload=function(){o(),r(i);},i.onerror=function(){o(),n(new Error('Failed to load the image "'+t+'"'));},i.src=t;}))};},function(t,e,r){const n="'([^']+)'|\"([^\"]+)\"|[\\w\\s-]+",i=new RegExp("(bold|bolder|lighter|[1-9]00) +","i"),o=new RegExp("(italic|oblique) +","i"),a=new RegExp("(small-caps) +","i"),s=new RegExp("(ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded) +","i"),u=new RegExp("([\\d\\.]+)(px|pt|pc|in|cm|mm|%|em|ex|ch|rem|q) *((?:"+n+")( *, *(?:"+n+"))*)"),h={};t.exports=function(t){if(h[t])return h[t];const e=u.exec(t);if(!e)return;const r={weight:"normal",style:"normal",stretch:"normal",variant:"normal",size:parseFloat(e[1]),unit:e[2],family:e[3].replace(/["']/g,"").replace(/ *, */g,",")};let n,f,l,c,p=t.substring(0,e.index);switch((n=i.exec(p))&&(r.weight=n[1]),(f=o.exec(p))&&(r.style=f[1]),(l=a.exec(p))&&(r.variant=l[1]),(c=s.exec(p))&&(r.stretch=c[1]),r.unit){case"pt":r.size/=.75;break;case"pc":r.size*=16;break;case"in":r.size*=96;break;case"cm":r.size*=96/2.54;break;case"mm":r.size*=96/25.4;break;case"%":break;case"em":case"rem":r.size*=16/.75;break;case"q":r.size*=96/25.4/4;}return h[t]=r};},function(t,e,r){var n=r(14),i=r(15);function o(){this.page=-1,this.pages=[],this.newPage();}o.pageSize=4096,o.charMap={};for(var a=0;a<256;a++)o.charMap[a]=String.fromCharCode(a);function s(t,e){this.width=~~t,this.height=~~e,this.transparent=null,this.transIndex=0,this.repeat=-1,this.delay=0,this.image=null,this.pixels=null,this.indexedPixels=null,this.colorDepth=null,this.colorTab=null,this.neuQuant=null,this.usedEntry=new Array,this.palSize=7,this.dispose=-1,this.firstFrame=!0,this.sample=10,this.dither=!1,this.globalPalette=!1,this.out=new o;}o.prototype.newPage=function(){this.pages[++this.page]=new Uint8Array(o.pageSize),this.cursor=0;},o.prototype.getData=function(){for(var t="",e=0;e<this.pages.length;e++)for(var r=0;r<o.pageSize;r++)t+=o.charMap[this.pages[e][r]];return t},o.prototype.toFlattenUint8Array=function(){const t=[];for(var e=0;e<this.pages.length;e++)if(e===this.pages.length-1){const r=Uint8Array.from(this.pages[e].slice(0,this.cursor));t.push(r);}else t.push(this.pages[e]);const r=new Uint8Array(t.reduce((t,e)=>t+e.length,0));return t.reduce((t,e)=>(r.set(e,t),t+e.length),0),r},o.prototype.writeByte=function(t){this.cursor>=o.pageSize&&this.newPage(),this.pages[this.page][this.cursor++]=t;},o.prototype.writeUTFBytes=function(t){for(var e=t.length,r=0;r<e;r++)this.writeByte(t.charCodeAt(r));},o.prototype.writeBytes=function(t,e,r){for(var n=r||t.length,i=e||0;i<n;i++)this.writeByte(t[i]);},s.prototype.setDelay=function(t){this.delay=Math.round(t/10);},s.prototype.setFrameRate=function(t){this.delay=Math.round(100/t);},s.prototype.setDispose=function(t){t>=0&&(this.dispose=t);},s.prototype.setRepeat=function(t){this.repeat=t;},s.prototype.setTransparent=function(t){this.transparent=t;},s.prototype.addFrame=function(t){this.image=t,this.colorTab=this.globalPalette&&this.globalPalette.slice?this.globalPalette:null,this.getImagePixels(),this.analyzePixels(),!0===this.globalPalette&&(this.globalPalette=this.colorTab),this.firstFrame&&(this.writeHeader(),this.writeLSD(),this.writePalette(),this.repeat>=0&&this.writeNetscapeExt()),this.writeGraphicCtrlExt(),this.writeImageDesc(),this.firstFrame||this.globalPalette||this.writePalette(),this.writePixels(),this.firstFrame=!1;},s.prototype.finish=function(){this.out.writeByte(59);},s.prototype.setQuality=function(t){t<1&&(t=1),this.sample=t;},s.prototype.setDither=function(t){!0===t&&(t="FloydSteinberg"),this.dither=t;},s.prototype.setGlobalPalette=function(t){this.globalPalette=t;},s.prototype.getGlobalPalette=function(){return this.globalPalette&&this.globalPalette.slice&&this.globalPalette.slice(0)||this.globalPalette},s.prototype.writeHeader=function(){this.out.writeUTFBytes("GIF89a");},s.prototype.analyzePixels=function(){this.colorTab||(this.neuQuant=new n(this.pixels,this.sample),this.neuQuant.buildColormap(),this.colorTab=this.neuQuant.getColormap()),this.dither?this.ditherPixels(this.dither.replace("-serpentine",""),null!==this.dither.match(/-serpentine/)):this.indexPixels(),this.pixels=null,this.colorDepth=8,this.palSize=7,null!==this.transparent&&(this.transIndex=this.findClosest(this.transparent,!0));},s.prototype.indexPixels=function(t){var e=this.pixels.length/3;this.indexedPixels=new Uint8Array(e);for(var r=0,n=0;n<e;n++){var i=this.findClosestRGB(255&this.pixels[r++],255&this.pixels[r++],255&this.pixels[r++]);this.usedEntry[i]=!0,this.indexedPixels[n]=i;}},s.prototype.ditherPixels=function(t,e){var r={FalseFloydSteinberg:[[3/8,1,0],[3/8,0,1],[2/8,1,1]],FloydSteinberg:[[7/16,1,0],[3/16,-1,1],[5/16,0,1],[1/16,1,1]],Stucki:[[8/42,1,0],[4/42,2,0],[2/42,-2,1],[4/42,-1,1],[8/42,0,1],[4/42,1,1],[2/42,2,1],[1/42,-2,2],[2/42,-1,2],[4/42,0,2],[2/42,1,2],[1/42,2,2]],Atkinson:[[1/8,1,0],[1/8,2,0],[1/8,-1,1],[1/8,0,1],[1/8,1,1],[1/8,0,2]]};if(!t||!r[t])throw "Unknown dithering kernel: "+t;var n=r[t],i=0,o=this.height,a=this.width,s=this.pixels,u=e?-1:1;this.indexedPixels=new Uint8Array(this.pixels.length/3);for(var h=0;h<o;h++){e&&(u*=-1);for(var f=1==u?0:a-1,l=1==u?a:0;f!==l;f+=u){var c=3*(i=h*a+f),p=s[c],d=s[c+1],g=s[c+2];c=this.findClosestRGB(p,d,g),this.usedEntry[c]=!0,this.indexedPixels[i]=c,c*=3;for(var y=p-this.colorTab[c],w=d-this.colorTab[c+1],v=g-this.colorTab[c+2],m=1==u?0:n.length-1,b=1==u?n.length:0;m!==b;m+=u){var B=n[m][1],A=n[m][2];if(B+f>=0&&B+f<a&&A+h>=0&&A+h<o){var E=n[m][0];c=i+B+A*a,s[c*=3]=Math.max(0,Math.min(255,s[c]+y*E)),s[c+1]=Math.max(0,Math.min(255,s[c+1]+w*E)),s[c+2]=Math.max(0,Math.min(255,s[c+2]+v*E));}}}}},s.prototype.findClosest=function(t,e){return this.findClosestRGB((16711680&t)>>16,(65280&t)>>8,255&t,e)},s.prototype.findClosestRGB=function(t,e,r,n){if(null===this.colorTab)return -1;if(this.neuQuant&&!n)return this.neuQuant.lookupRGB(t,e,r);for(var i=0,o=16777216,a=this.colorTab.length,s=0,u=0;s<a;u++){var h=t-(255&this.colorTab[s++]),f=e-(255&this.colorTab[s++]),l=r-(255&this.colorTab[s++]),c=h*h+f*f+l*l;(!n||this.usedEntry[u])&&c<o&&(o=c,i=u);}return i},s.prototype.getImagePixels=function(){var t=this.width,e=this.height;this.pixels=new Uint8Array(t*e*3);for(var r=this.image,n=0,i=0,o=0;o<e;o++)for(var a=0;a<t;a++)this.pixels[i++]=r[n++],this.pixels[i++]=r[n++],this.pixels[i++]=r[n++],n++;},s.prototype.writeGraphicCtrlExt=function(){var t,e;this.out.writeByte(33),this.out.writeByte(249),this.out.writeByte(4),null===this.transparent?(t=0,e=0):(t=1,e=2),this.dispose>=0&&(e=7&this.dispose),e<<=2,this.out.writeByte(0|e|t),this.writeShort(this.delay),this.out.writeByte(this.transIndex),this.out.writeByte(0);},s.prototype.writeImageDesc=function(){this.out.writeByte(44),this.writeShort(0),this.writeShort(0),this.writeShort(this.width),this.writeShort(this.height),this.firstFrame||this.globalPalette?this.out.writeByte(0):this.out.writeByte(128|this.palSize);},s.prototype.writeLSD=function(){this.writeShort(this.width),this.writeShort(this.height),this.out.writeByte(240|this.palSize),this.out.writeByte(0),this.out.writeByte(0);},s.prototype.writeNetscapeExt=function(){this.out.writeByte(33),this.out.writeByte(255),this.out.writeByte(11),this.out.writeUTFBytes("NETSCAPE2.0"),this.out.writeByte(3),this.out.writeByte(1),this.writeShort(this.repeat),this.out.writeByte(0);},s.prototype.writePalette=function(){this.out.writeBytes(this.colorTab);for(var t=768-this.colorTab.length,e=0;e<t;e++)this.out.writeByte(0);},s.prototype.writeShort=function(t){this.out.writeByte(255&t),this.out.writeByte(t>>8&255);},s.prototype.writePixels=function(){new i(this.width,this.height,this.indexedPixels,this.colorDepth).encode(this.out);},s.prototype.stream=function(){return this.out},t.exports=s;},function(t,e){t.exports=function(t,e){var r,n,i,o,a;function s(t,e,n,i,o){r[e][0]-=t*(r[e][0]-n)/1024,r[e][1]-=t*(r[e][1]-i)/1024,r[e][2]-=t*(r[e][2]-o)/1024;}function u(t,e,n,i,o){for(var s,u,h=Math.abs(e-t),f=Math.min(e+t,256),l=e+1,c=e-1,p=1;l<f||c>h;)u=a[p++],l<f&&((s=r[l++])[0]-=u*(s[0]-n)/(1<<18),s[1]-=u*(s[1]-i)/(1<<18),s[2]-=u*(s[2]-o)/(1<<18)),c>h&&((s=r[c--])[0]-=u*(s[0]-n)/(1<<18),s[1]-=u*(s[1]-i)/(1<<18),s[2]-=u*(s[2]-o)/(1<<18));}function h(t,e,n){var a,s,u,h,f,l=~(1<<31),c=l,p=-1,d=p;for(a=0;a<256;a++)s=r[a],(u=Math.abs(s[0]-t)+Math.abs(s[1]-e)+Math.abs(s[2]-n))<l&&(l=u,p=a),(h=u-(i[a]>>12))<c&&(c=h,d=a),f=o[a]>>10,o[a]-=f,i[a]+=f<<10;return o[p]+=64,i[p]-=65536,d}this.buildColormap=function(){!function(){var t,e;for(r=[],n=new Int32Array(256),i=new Int32Array(256),o=new Int32Array(256),a=new Int32Array(32),t=0;t<256;t++)e=(t<<12)/256,r[t]=new Float64Array([e,e,e,0]),o[t]=256,i[t]=0;}(),function(){var r,n,i,o,f,l,c=t.length,p=30+(e-1)/3,d=c/(3*e),g=~~(d/100),y=1024,w=2048,v=w>>6;for(v<=1&&(v=0),r=0;r<v;r++)a[r]=y*(256*(v*v-r*r)/(v*v));c<1509?(e=1,n=3):n=c%499!=0?1497:c%491!=0?1473:c%487!=0?1461:1509;var m=0;for(r=0;r<d;)if(s(y,l=h(i=(255&t[m])<<4,o=(255&t[m+1])<<4,f=(255&t[m+2])<<4),i,o,f),0!==v&&u(v,l,i,o,f),(m+=n)>=c&&(m-=c),0===g&&(g=1),++r%g==0)for(y-=y/p,(v=(w-=w/30)>>6)<=1&&(v=0),l=0;l<v;l++)a[l]=y*(256*(v*v-l*l)/(v*v));}(),function(){for(var t=0;t<256;t++)r[t][0]>>=4,r[t][1]>>=4,r[t][2]>>=4,r[t][3]=t;}(),function(){var t,e,i,o,a,s,u=0,h=0;for(t=0;t<256;t++){for(a=t,s=(i=r[t])[1],e=t+1;e<256;e++)(o=r[e])[1]<s&&(a=e,s=o[1]);if(o=r[a],t!=a&&(e=o[0],o[0]=i[0],i[0]=e,e=o[1],o[1]=i[1],i[1]=e,e=o[2],o[2]=i[2],i[2]=e,e=o[3],o[3]=i[3],i[3]=e),s!=u){for(n[u]=h+t>>1,e=u+1;e<s;e++)n[e]=t;u=s,h=t;}}for(n[u]=h+255>>1,e=u+1;e<256;e++)n[e]=255;}();},this.getColormap=function(){for(var t=[],e=[],n=0;n<256;n++)e[r[n][3]]=n;for(var i=0,o=0;o<256;o++){var a=e[o];t[i++]=r[a][0],t[i++]=r[a][1],t[i++]=r[a][2];}return t},this.lookupRGB=function(t,e,i){for(var o,a,s,u=1e3,h=-1,f=n[e],l=f-1;f<256||l>=0;)f<256&&((s=(a=r[f])[1]-e)>=u?f=256:(f++,s<0&&(s=-s),(o=a[0]-t)<0&&(o=-o),(s+=o)<u&&((o=a[2]-i)<0&&(o=-o),(s+=o)<u&&(u=s,h=a[3])))),l>=0&&((s=e-(a=r[l])[1])>=u?l=-1:(l--,s<0&&(s=-s),(o=a[0]-t)<0&&(o=-o),(s+=o)<u&&((o=a[2]-i)<0&&(o=-o),(s+=o)<u&&(u=s,h=a[3]))));return h};};},function(t,e){var r=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535];t.exports=function(t,e,n,i){var o,a,s,u,h,f,l,c,p,d=Math.max(2,i),g=new Uint8Array(256),y=new Int32Array(5003),w=new Int32Array(5003),v=0,m=0,b=!1;function B(t,e){g[a++]=t,a>=254&&_(e);}function A(t){E(5003),m=h+2,b=!0,C(h,t);}function E(t){for(var e=0;e<t;++e)y[e]=-1;}function _(t){a>0&&(t.writeByte(a),t.writeBytes(g,0,a),a=0);}function P(t){return (1<<t)-1}function R(){return 0===l?-1:(--l,255&n[c++])}function C(t,e){for(o&=r[v],v>0?o|=t<<v:o=t,v+=p;v>=8;)B(255&o,e),o>>=8,v-=8;if((m>s||b)&&(b?(s=P(p=u),b=!1):(++p,s=12==p?4096:P(p))),t==f){for(;v>0;)B(255&o,e),o>>=8,v-=8;_(e);}}this.encode=function(r){r.writeByte(d),l=t*e,c=0,function(t,e){var r,n,i,o,l,c;for(b=!1,s=P(p=u=t),f=(h=1<<t-1)+1,m=h+2,a=0,o=R(),c=0,r=5003;r<65536;r*=2)++c;c=8-c,E(5003),C(h,e);t:for(;-1!=(n=R());)if(r=(n<<12)+o,y[i=n<<c^o]!==r){if(y[i]>=0){l=5003-i,0===i&&(l=1);do{if((i-=l)<0&&(i+=5003),y[i]===r){o=w[i];continue t}}while(y[i]>=0)}C(o,e),o=n,m<4096?(w[i]=m++,y[i]=r):A(e);}else o=w[i];C(o,e),C(f,e);}(d+1,r),r.writeByte(0);};};},function(t,e,r){r.r(e),r.d(e,"parseGIF",(function(){return s})),r.d(e,"decompressFrame",(function(){return u})),r.d(e,"decompressFrames",(function(){return h}));var n=r(3),i=r.n(n),o=r(0),a=r(1);const s=t=>{const e=new Uint8Array(t);return Object(o.parse)(Object(a.buildStream)(e),i.a)},u=(t,e,r)=>{if(!t.image)return void console.warn("gif frame does not have associated image.");const{image:n}=t,i=n.descriptor.width*n.descriptor.height;var o=((t,e,r)=>{const n=r;var i,o,a,s,u,h,f,l,c,p;const d=new Array(r),g=new Array(4096),y=new Array(4096),w=new Array(4097);for(u=(o=1<<(p=t))+1,i=o+2,f=-1,a=(1<<(s=p+1))-1,l=0;l<o;l++)g[l]=0,y[l]=l;var v,m,b,B,A,E;for(v=m=b=B=A=E=0,c=0;c<n;){if(0===B){if(m<s){v+=e[E]<<m,m+=8,E++;continue}if(l=v&a,v>>=s,m-=s,l>i||l==u)break;if(l==o){a=(1<<(s=p+1))-1,i=o+2,f=-1;continue}if(-1==f){w[B++]=y[l],f=l,b=l;continue}for(h=l,l==i&&(w[B++]=b,l=f);l>o;)w[B++]=y[l],l=g[l];b=255&y[l],w[B++]=b,i<4096&&(g[i]=f,y[i]=b,0==(++i&a)&&i<4096&&(s++,a+=i)),f=h;}B--,d[A++]=w[B],c++;}for(c=A;c<n;c++)d[c]=0;return d})(n.data.minCodeSize,n.data.blocks,i);n.descriptor.lct.interlaced&&(o=((t,e)=>{const r=new Array(t.length),n=t.length/e,i=function(n,i){const o=t.slice(i*e,(i+1)*e);r.splice.apply(r,[n*e,e].concat(o));},o=[0,4,2,1],a=[8,8,4,2];for(var s=0,u=0;u<4;u++)for(var h=o[u];h<n;h+=a[u])i(h,s),s++;return r})(o,n.descriptor.width));const a={pixels:o,dims:{top:t.image.descriptor.top,left:t.image.descriptor.left,width:t.image.descriptor.width,height:t.image.descriptor.height}};return n.descriptor.lct&&n.descriptor.lct.exists?a.colorTable=n.lct:a.colorTable=e,t.gce&&(a.delay=10*(t.gce.delay||10),a.disposalType=t.gce.extras.disposal,t.gce.extras.transparentColorGiven&&(a.transparentIndex=t.gce.transparentColorIndex)),r&&(a.patch=(t=>{const e=t.pixels.length,r=new Uint8ClampedArray(4*e);for(var n=0;n<e;n++){const e=4*n,i=t.pixels[n],o=t.colorTable[i];r[e]=o[0],r[e+1]=o[1],r[e+2]=o[2],r[e+3]=i!==t.transparentIndex?255:0;}return r})(a)),a},h=(t,e)=>t.frames.filter(t=>t.image).map(r=>u(r,t.gct,e));}])}));
});

var asyncDraw = function (instance, serial) { return __awaiter(void 0, void 0, void 0, function () {
    var dataUri;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, instance.draw()];
            case 1:
                dataUri = (_a.sent());
                return [2 /*return*/, { dataUri: dataUri, serial: serial }];
        }
    });
}); };
var AwesomeQRCode = function (options) {
    var asyncDrawSerial = useRef(0);
    var qrInstance = useMemo(function () { return new awesomeQr$1.AwesomeQR(options); }, [options]);
    var _a = useState(), qrDataUri = _a[0], setQrDataUri = _a[1];
    useEffect(function () {
        if (qrInstance) {
            (function () { return __awaiter(void 0, void 0, void 0, function () {
                var snapshotSerial, _a, dataUri, serial;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            snapshotSerial = asyncDrawSerial.current;
                            if (asyncDrawSerial.current >= Number.MAX_SAFE_INTEGER) {
                                asyncDrawSerial.current = 0;
                            }
                            else {
                                asyncDrawSerial.current++;
                            }
                            return [4 /*yield*/, asyncDraw(qrInstance, snapshotSerial)];
                        case 1:
                            _a = _b.sent(), dataUri = _a.dataUri, serial = _a.serial;
                            if (snapshotSerial !== serial)
                                return [2 /*return*/];
                            setQrDataUri(dataUri);
                            return [2 /*return*/];
                    }
                });
            }); })();
        }
    }, [qrInstance]);
    return (React.createElement("div", { style: {
            width: "100%",
            height: "100%",
            backgroundImage: "url(" + qrDataUri + ")",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center",
        } }));
};
AwesomeQRCode.defaultProps = awesomeQr$1.AwesomeQR._defaultOptions;

export { AwesomeQRCode, lib$1 as __moduleExports };
//# sourceMappingURL=index.es.js.map
