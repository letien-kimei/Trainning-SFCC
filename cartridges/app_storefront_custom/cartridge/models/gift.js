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
     var giftId = el.gift;
     var uuid = element.UUID;
     var type = element.type;
     var name = el.name;
        filterGifts.push({
            giftId: giftId,
            uuid: uuid,
            type: type,
            name: name,
        })
    });

    return filterGifts;
}

const getFirst = (type, keyValue) => { 
    var giftObject = CustomObjectMgr.getCustomObject(type, keyValue);
    var filterGifts = {};

    var el = giftObject.custom;
    filterGifts.uuid = giftObject.UUID;
    filterGifts.type = giftObject.type;
    filterGifts.name = el.name;
    filterGifts.giftId = el.gift;

    return filterGifts;
}

module.exports = {
    get,
    getFirst
 };
