'use strict';

module.exports = function (object, gift) {
    Object.defineProperty(object, 'gift_custom', {
        enumerable: true,
        value: gift
    });
};
