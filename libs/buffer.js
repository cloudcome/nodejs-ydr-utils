/**
 * 文件描述
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


