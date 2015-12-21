/**
 * buffer
 * @author ydr.me
 * @create 2015-12-21 13:54
 */


'use strict';


/**
 * 判断是否 utf8 编码
 * @link https://github.com/wayfind/is-utf8/blob/master/is-utf8.js
 * @param bf
 * @returns {boolean}
 */
exports.isUTF8 = function (bf) {
    var i = 0;
    while (i < bf.length) {
        if ((// ASCII
                bf[i] === 0x09 ||
                bf[i] === 0x0A ||
                bf[i] === 0x0D ||
                (0x20 <= bf[i] && bf[i] <= 0x7E)
            )
        ) {
            i += 1;
            continue;
        }

        if ((// non-overlong 2-byte
                (0xC2 <= bf[i] && bf[i] <= 0xDF) &&
                (0x80 <= bf[i + 1] && bf[i + 1] <= 0xBF)
            )
        ) {
            i += 2;
            continue;
        }

        if ((// excluding overlongs
                bf[i] === 0xE0 &&
                (0xA0 <= bf[i + 1] && bf[i + 1] <= 0xBF) &&
                (0x80 <= bf[i + 2] && bf[i + 2] <= 0xBF)
            ) ||
            (// straight 3-byte
                ((0xE1 <= bf[i] && bf[i] <= 0xEC) ||
                bf[i] === 0xEE ||
                bf[i] === 0xEF) &&
                (0x80 <= bf[i + 1] && bf[i + 1] <= 0xBF) &&
                (0x80 <= bf[i + 2] && bf[i + 2] <= 0xBF)
            ) ||
            (// excluding surrogates
                bf[i] === 0xED &&
                (0x80 <= bf[i + 1] && bf[i + 1] <= 0x9F) &&
                (0x80 <= bf[i + 2] && bf[i + 2] <= 0xBF)
            )
        ) {
            i += 3;
            continue;
        }

        if ((// planes 1-3
                bf[i] === 0xF0 &&
                (0x90 <= bf[i + 1] && bf[i + 1] <= 0xBF) &&
                (0x80 <= bf[i + 2] && bf[i + 2] <= 0xBF) &&
                (0x80 <= bf[i + 3] && bf[i + 3] <= 0xBF)
            ) ||
            (// planes 4-15
                (0xF1 <= bf[i] && bf[i] <= 0xF3) &&
                (0x80 <= bf[i + 1] && bf[i + 1] <= 0xBF) &&
                (0x80 <= bf[i + 2] && bf[i + 2] <= 0xBF) &&
                (0x80 <= bf[i + 3] && bf[i + 3] <= 0xBF)
            ) ||
            (// plane 16
                bf[i] === 0xF4 &&
                (0x80 <= bf[i + 1] && bf[i + 1] <= 0x8F) &&
                (0x80 <= bf[i + 2] && bf[i + 2] <= 0xBF) &&
                (0x80 <= bf[i + 3] && bf[i + 3] <= 0xBF)
            )
        ) {
            i += 4;
            continue;
        }

        return false;
    }

    return true;
};


/**
 * 活动 buffer 内的文件类型
 * @link https://github.com/sindresorhus/file-type/blob/master/index.js
 * @param bf
 * @returns {*}
 */
exports.fileType = function (bf) {
    if (!(bf && bf.length > 1)) {
        return null;
    }

    if (bf[0] === 0xFF && bf[1] === 0xD8 && bf[2] === 0xFF) {
        return 'jpg';
    }

    if (bf[0] === 0x89 && bf[1] === 0x50 && bf[2] === 0x4E && bf[3] === 0x47) {
        return 'png';
    }

    if (bf[0] === 0x47 && bf[1] === 0x49 && bf[2] === 0x46) {
        return 'gif';
    }

    if (bf[8] === 0x57 && bf[9] === 0x45 && bf[10] === 0x42 && bf[11] === 0x50) {
        return 'webp';
    }

    // needs to be before `tif` check
    if (((bf[0] === 0x49 && bf[1] === 0x49 && bf[2] === 0x2A && bf[3] === 0x0) || (bf[0] === 0x4D && bf[1] === 0x4D && bf[2] === 0x0 && bf[3] === 0x2A)) && bf[8] === 0x43 && bf[9] === 0x52) {
        return 'cr2';
    }

    if ((bf[0] === 0x49 && bf[1] === 0x49 && bf[2] === 0x2A && bf[3] === 0x0) || (bf[0] === 0x4D && bf[1] === 0x4D && bf[2] === 0x0 && bf[3] === 0x2A)) {
        return 'tif';
    }

    if (bf[0] === 0x42 && bf[1] === 0x4D) {
        return 'bmp';
    }

    if (bf[0] === 0x49 && bf[1] === 0x49 && bf[2] === 0xBC) {
        return 'jxr';
    }

    if (bf[0] === 0x38 && bf[1] === 0x42 && bf[2] === 0x50 && bf[3] === 0x53) {
        return 'psd';
    }

    // needs to be before `zip` check
    if (bf[0] === 0x50 && bf[1] === 0x4B && bf[2] === 0x3 && bf[3] === 0x4 && bf[30] === 0x6D && bf[31] === 0x69 && bf[32] === 0x6D && bf[33] === 0x65 && bf[34] === 0x74 && bf[35] === 0x79 && bf[36] === 0x70 && bf[37] === 0x65 && bf[38] === 0x61 && bf[39] === 0x70 && bf[40] === 0x70 && bf[41] === 0x6C && bf[42] === 0x69 && bf[43] === 0x63 && bf[44] === 0x61 && bf[45] === 0x74 && bf[46] === 0x69 && bf[47] === 0x6F && bf[48] === 0x6E && bf[49] === 0x2F && bf[50] === 0x65 && bf[51] === 0x70 && bf[52] === 0x75 && bf[53] === 0x62 && bf[54] === 0x2B && bf[55] === 0x7A && bf[56] === 0x69 && bf[57] === 0x70) {
        return 'epub';
    }

    // needs to be before `zip` check
    // assumes signed .xpi from addons.mozilla.org
    if (bf[0] === 0x50 && bf[1] === 0x4B && bf[2] === 0x3 && bf[3] === 0x4 && bf[30] === 0x4D && bf[31] === 0x45 && bf[32] === 0x54 && bf[33] === 0x41 && bf[34] === 0x2D && bf[35] === 0x49 && bf[36] === 0x4E && bf[37] === 0x46 && bf[38] === 0x2F && bf[39] === 0x6D && bf[40] === 0x6F && bf[41] === 0x7A && bf[42] === 0x69 && bf[43] === 0x6C && bf[44] === 0x6C && bf[45] === 0x61 && bf[46] === 0x2E && bf[47] === 0x72 && bf[48] === 0x73 && bf[49] === 0x61) {
        return 'xpi';
    }

    if (bf[0] === 0x50 && bf[1] === 0x4B && (bf[2] === 0x3 || bf[2] === 0x5 || bf[2] === 0x7) && (bf[3] === 0x4 || bf[3] === 0x6 || bf[3] === 0x8)) {
        return 'zip';
    }

    if (bf[257] === 0x75 && bf[258] === 0x73 && bf[259] === 0x74 && bf[260] === 0x61 && bf[261] === 0x72) {
        return 'tar';
    }

    if (bf[0] === 0x52 && bf[1] === 0x61 && bf[2] === 0x72 && bf[3] === 0x21 && bf[4] === 0x1A && bf[5] === 0x7 && (bf[6] === 0x0 || bf[6] === 0x1)) {
        return 'rar';
    }

    if (bf[0] === 0x1F && bf[1] === 0x8B && bf[2] === 0x8) {
        return 'gz';
    }

    if (bf[0] === 0x42 && bf[1] === 0x5A && bf[2] === 0x68) {
        return 'bz2';
    }

    if (bf[0] === 0x37 && bf[1] === 0x7A && bf[2] === 0xBC && bf[3] === 0xAF && bf[4] === 0x27 && bf[5] === 0x1C) {
        return '7z';
    }

    if (bf[0] === 0x78 && bf[1] === 0x01) {
        return 'dmg';
    }

    if (
        (bf[0] === 0x0 && bf[1] === 0x0 && bf[2] === 0x0 && (bf[3] === 0x18 || bf[3] === 0x20) && bf[4] === 0x66 && bf[5] === 0x74 && bf[6] === 0x79 && bf[7] === 0x70) ||
        (bf[0] === 0x33 && bf[1] === 0x67 && bf[2] === 0x70 && bf[3] === 0x35) ||
        (bf[0] === 0x0 && bf[1] === 0x0 && bf[2] === 0x0 && bf[3] === 0x1C && bf[4] === 0x66 && bf[5] === 0x74 && bf[6] === 0x79 && bf[7] === 0x70 && bf[8] === 0x6D && bf[9] === 0x70 && bf[10] === 0x34 && bf[11] === 0x32 && bf[16] === 0x6D && bf[17] === 0x70 && bf[18] === 0x34 && bf[19] === 0x31 && bf[20] === 0x6D && bf[21] === 0x70 && bf[22] === 0x34 && bf[23] === 0x32 && bf[24] === 0x69 && bf[25] === 0x73 && bf[26] === 0x6F && bf[27] === 0x6D) ||
        (bf[0] === 0x0 && bf[1] === 0x0 && bf[2] === 0x0 && bf[3] === 0x1C && bf[4] === 0x66 && bf[5] === 0x74 && bf[6] === 0x79 && bf[7] === 0x70 && bf[8] === 0x69 && bf[9] === 0x73 && bf[10] === 0x6F && bf[11] === 0x6D)
    ) {
        return 'mp4';
    }

    if ((bf[0] === 0x0 && bf[1] === 0x0 && bf[2] === 0x0 && bf[3] === 0x1C && bf[4] === 0x66 && bf[5] === 0x74 && bf[6] === 0x79 && bf[7] === 0x70 && bf[8] === 0x4D && bf[9] === 0x34 && bf[10] === 0x56)) {
        return 'm4v';
    }

    if (bf[0] === 0x4D && bf[1] === 0x54 && bf[2] === 0x68 && bf[3] === 0x64) {
        return 'mid';
    }

    // needs to be before the `webm` check
    if (bf[31] === 0x6D && bf[32] === 0x61 && bf[33] === 0x74 && bf[34] === 0x72 && bf[35] === 0x6f && bf[36] === 0x73 && bf[37] === 0x6B && bf[38] === 0x61) {
        return 'mkv';
    }

    if (bf[0] === 0x1A && bf[1] === 0x45 && bf[2] === 0xDF && bf[3] === 0xA3) {
        return 'webm';
    }

    if (bf[0] === 0x0 && bf[1] === 0x0 && bf[2] === 0x0 && bf[3] === 0x14 && bf[4] === 0x66 && bf[5] === 0x74 && bf[6] === 0x79 && bf[7] === 0x70) {
        return 'mov';
    }

    if (bf[0] === 0x52 && bf[1] === 0x49 && bf[2] === 0x46 && bf[3] === 0x46 && bf[8] === 0x41 && bf[9] === 0x56 && bf[10] === 0x49) {
        return 'avi';
    }

    if (bf[0] === 0x30 && bf[1] === 0x26 && bf[2] === 0xB2 && bf[3] === 0x75 && bf[4] === 0x8E && bf[5] === 0x66 && bf[6] === 0xCF && bf[7] === 0x11 && bf[8] === 0xA6 && bf[9] === 0xD9) {
        return 'wmv';
    }

    if (bf[0] === 0x0 && bf[1] === 0x0 && bf[2] === 0x1 && bf[3].toString(16)[0] === 'b') {
        return 'mpg';
    }

    if ((bf[0] === 0x49 && bf[1] === 0x44 && bf[2] === 0x33) || (bf[0] === 0xFF && bf[1] === 0xfb)) {
        return 'mp3';
    }

    if ((bf[4] === 0x66 && bf[5] === 0x74 && bf[6] === 0x79 && bf[7] === 0x70 && bf[8] === 0x4D && bf[9] === 0x34 && bf[10] === 0x41) || (bf[0] === 0x4D && bf[1] === 0x34 && bf[2] === 0x41 && bf[3] === 0x20)) {
        return 'm4a';
    }

    if (bf[0] === 0x4F && bf[1] === 0x67 && bf[2] === 0x67 && bf[3] === 0x53) {
        return 'ogg';
    }

    if (bf[0] === 0x66 && bf[1] === 0x4C && bf[2] === 0x61 && bf[3] === 0x43) {
        return 'flac';
    }

    if (bf[0] === 0x52 && bf[1] === 0x49 && bf[2] === 0x46 && bf[3] === 0x46 && bf[8] === 0x57 && bf[9] === 0x41 && bf[10] === 0x56 && bf[11] === 0x45) {
        return 'wav';
    }

    if (bf[0] === 0x23 && bf[1] === 0x21 && bf[2] === 0x41 && bf[3] === 0x4D && bf[4] === 0x52 && bf[5] === 0x0A) {
        return 'amr';
    }

    if (bf[0] === 0x25 && bf[1] === 0x50 && bf[2] === 0x44 && bf[3] === 0x46) {
        return 'pdf';
    }

    if (bf[0] === 0x4D && bf[1] === 0x5A) {
        return 'exe';
    }

    if ((bf[0] === 0x43 || bf[0] === 0x46) && bf[1] === 0x57 && bf[2] === 0x53) {
        return 'swf';
    }

    if (bf[0] === 0x7B && bf[1] === 0x5C && bf[2] === 0x72 && bf[3] === 0x74 && bf[4] === 0x66) {
        return 'rtf';
    }

    if (bf[0] === 0x77 && bf[1] === 0x4F && bf[2] === 0x46 && bf[3] === 0x46 && bf[4] === 0x00 && bf[5] === 0x01 && bf[6] === 0x00 && bf[7] === 0x00) {
        return 'woff';
    }

    if (bf[0] === 0x77 && bf[1] === 0x4F && bf[2] === 0x46 && bf[3] === 0x32 && bf[4] === 0x00 && bf[5] === 0x01 && bf[6] === 0x00 && bf[7] === 0x00) {
        return 'woff2';
    }

    if (
        (bf[34] === 0x4C && bf[35] === 0x50) &&
        (
            (bf[8] === 0x00 && bf[9] === 0x00 && bf[10] === 0x01) ||
            (bf[8] === 0x01 && bf[9] === 0x00 && bf[10] === 0x02) ||
            (bf[8] === 0x02 && bf[9] === 0x00 && bf[10] === 0x02)
        )
    ) {
        return 'eot';
    }

    if (bf[0] === 0x00 && bf[1] === 0x01 && bf[2] === 0x00 && bf[3] === 0x00 && bf[4] === 0x00) {
        return 'ttf';
    }

    if (bf[0] === 0x4F && bf[1] === 0x54 && bf[2] === 0x54 && bf[3] === 0x4F && bf[4] === 0x00) {
        return 'otf';
    }

    if (bf[0] === 0x00 && bf[1] === 0x00 && bf[2] === 0x01 && bf[3] === 0x00) {
        return 'ico';
    }

    if (bf[0] === 0x46 && bf[1] === 0x4C && bf[2] === 0x56 && bf[3] === 0x01) {
        return 'flv';
    }

    if (bf[0] === 0x25 && bf[1] === 0x21) {
        return 'ps';
    }

    if (bf[0] === 0xFD && bf[1] === 0x37 && bf[2] === 0x7A && bf[3] === 0x58 && bf[4] === 0x5A && bf[5] === 0x00) {
        return 'xz';
    }

    if (bf[0] === 0x53 && bf[1] === 0x51 && bf[2] === 0x4C && bf[3] === 0x69) {
        return 'sqlite';
    }

    if (bf[0] === 0x4E && bf[1] === 0x45 && bf[2] === 0x53 && bf[3] === 0x1A) {
        return 'nes';
    }

    if (bf[0] === 0x43 && bf[1] === 0x72 && bf[2] === 0x32 && bf[3] === 0x34) {
        return 'crx';
    }

    if (
        (bf[0] === 0x4D && bf[1] === 0x53 && bf[2] === 0x43 && bf[3] === 0x46) ||
        (bf[0] === 0x49 && bf[1] === 0x53 && bf[2] === 0x63 && bf[3] === 0x28)
    ) {
        return 'cab';
    }

    // needs to be before `ar` check
    if (bf[0] === 0x21 && bf[1] === 0x3C && bf[2] === 0x61 && bf[3] === 0x72 && bf[4] === 0x63 && bf[5] === 0x68 && bf[6] === 0x3E && bf[7] === 0x0A && bf[8] === 0x64 && bf[9] === 0x65 && bf[10] === 0x62 && bf[11] === 0x69 && bf[12] === 0x61 && bf[13] === 0x6E && bf[14] === 0x2D && bf[15] === 0x62 && bf[16] === 0x69 && bf[17] === 0x6E && bf[18] === 0x61 && bf[19] === 0x72 && bf[20] === 0x79) {
        return 'deb';
    }

    if (bf[0] === 0x21 && bf[1] === 0x3C && bf[2] === 0x61 && bf[3] === 0x72 && bf[4] === 0x63 && bf[5] === 0x68 && bf[6] === 0x3E) {
        return 'ar';
    }

    if (
        (bf[0] === 0x1F && bf[1] === 0xA0) ||
        (bf[0] === 0x1F && bf[1] === 0x9D)
    ) {
        return 'z';
    }

    if (bf[0] === 0x4C && bf[1] === 0x5A && bf[2] === 0x49 && bf[3] === 0x50) {
        return 'lz';
    }

    return null;
};


