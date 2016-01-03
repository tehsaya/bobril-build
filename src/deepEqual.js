"use strict";
function deepEqual(a, b) {
    if (a === b) {
        return true;
    }
    else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }
    else if (a == null || b == null || typeof a != 'object' || typeof b != 'object') {
        return false;
    }
    else {
        if (Buffer.isBuffer(a)) {
            if (!Buffer.isBuffer(b)) {
                return false;
            }
            if (a.length !== b.length)
                return false;
            for (var i = 0; i < a.length; i++) {
                if (a[i] !== b[i])
                    return false;
            }
            return true;
        }
        if (a.prototype !== b.prototype) {
            return false;
        }
        var ka = Object.keys(a);
        var kb = Object.keys(b);
        if (ka.length != kb.length) {
            return false;
        }
        ka.sort();
        kb.sort();
        for (var i = ka.length - 1; i >= 0; i--) {
            if (ka[i] != kb[i]) {
                return false;
            }
        }
        for (var i = ka.length - 1; i >= 0; i--) {
            var key = ka[i];
            if (!deepEqual(a[key], b[key])) {
                return false;
            }
        }
        return true;
    }
}
exports.deepEqual = deepEqual;
