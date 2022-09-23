'use strict';

module.exports = function (object, lineItem) {
    Object.defineProperty(object, 'gift_custom', {
        enumerable: true,
        value: {
            id: "gift_id",
            text: 'ok gift'
        }
    });
};
