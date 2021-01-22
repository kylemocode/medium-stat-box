"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayFormater = void 0;
function arrayFormater(arr) {
    return arr.map(row => {
        row[1] = ' '.repeat(8) + row[1];
        return row;
    });
}
exports.arrayFormater = arrayFormater;
