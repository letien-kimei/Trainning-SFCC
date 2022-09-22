'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var keyObject = 'gift';

const get = () => { 
    var giftObject = CustomObjectMgr.getAllCustomObjects(keyObject).asList().toArray();
    var filterGifts = [];

    giftObject.forEach(element => {
     var el = element.custom;
     var uuid = element.UUID;
     var type = element.type;
     var name = el.name;
        filterGifts.push({
            uuid: uuid,
            type: type,
            name: name,
        })
    });

    return filterGifts;
}

module.exports = {
    get
 };
