'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

function validateContact(req) {
    var validEmail = require('*/cartridge/scripts/helpers/emailHelpers');
    var errors = {};
    if (isEmpty(req.form.firstName)) {
        errors.firstName = 'first name required';
    }
    if (isEmpty(req.form.lastName)) {
        errors.lastName = 'last name required';
    }
    if (validEmail.validateEmail(req.form.email) == false) {
        errors.email = 'email invalid';
    }
    return errors;
}

function isEmpty(str) {
    return (!str || str.length === 0 );
}


server.get('Show', function (req, res, next) {
    var actionUrls = {
        submitContact: URLUtils.url('Contact-Submit').toString()
    };

    res.render('contact/index', {
        actionUrls: actionUrls
    });
    return next();
});

server.get('List', server.middleware.https, function (req, res, next) {
    var contactObject = CustomObjectMgr.getAllCustomObjects('contact').asList();

    res.json(contactObject);
    next();
});

server.post('Submit', server.middleware.https, function (req, res, next) {
    var Transaction = require('dw/system/Transaction');
    var UUIDUtils = require('dw/util/UUIDUtils');
    
    var token = UUIDUtils.createUUID();

    var errorMessage = {};
    var statusValidate = validateContact(req);
    if (statusValidate) {
        Transaction.wrap(function () {
            var contactObject = CustomObjectMgr.createCustomObject('contact', token);
            contactObject.custom.firstName = req.form.firstName;
            contactObject.custom.lastName = req.form.lastName;
            contactObject.custom.email = req.form.email;
            contactObject.custom.message = req.form.message;
        });
    }

    res.render('contact/index', {
        errorMessage: statusValidate,
        formData: req.form
    });
    return next();
});

module.exports = server.exports();
