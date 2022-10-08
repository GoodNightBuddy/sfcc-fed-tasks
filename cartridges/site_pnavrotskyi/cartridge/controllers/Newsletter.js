'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');

server.get('Show', csrfProtection.generateToken, function (req, res, next) {
    var actionUrl = dw.web.URLUtils.url('Newsletter-Handler');
    var newsletterForm = server.forms.getForm('newsletter');
    newsletterForm.clear();

    res.render('newsletter/newslettersignup', {
        actionUrl: actionUrl,
        newsletterForm: newsletterForm
    });

    next();
});

server.post('Handler', csrfProtection.validateAjaxRequest, function (req, res, next) {
    var newsletterForm = server.forms.getForm('newsletter');

    newsletterForm.valid = newsletterForm.email.value === newsletterForm.emailconfirm.value && newsletterForm.valid;

    if (newsletterForm.valid) {
        res.json({
            success: true,
            redirectUrl: URLUtils.url('Newsletter-Success').toString()
        });
    } else {
        res.setStatusCode(500);
        res.json({
            error: true,
            redirectUrl: URLUtils.url('Newsletter-Error').toString()
        });
    }

    next();
});

server.get('Success', function (req, res, next) {
    var continueUrl = dw.web.URLUtils.url('Newsletter-Show');
    var newsletterForm = server.forms.getForm('newsletter');

    res.render('newsletter/newslettersuccess', {
        continueUrl: continueUrl,
        newsletterForm: newsletterForm
    });

    next();
});

server.get('Error', function (req, res, next) {
    var continueUrl = dw.web.URLUtils.url('Newsletter-Show');
    var newsletterForm = server.forms.getForm('newsletter');

    res.render('newsletter/newslettererror', {
        continueUrl: continueUrl,
        newsletterForm: newsletterForm
    });

    next();
});

module.exports = server.exports();
