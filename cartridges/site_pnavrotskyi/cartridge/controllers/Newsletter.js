'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var Resource = require('dw/web/Resource');

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
    var txn = require('dw/system/Transaction');
    newsletterForm.valid = newsletterForm.email.value === newsletterForm.emailconfirm.value && newsletterForm.valid;

    if (newsletterForm.valid) {
        try {
            txn.wrap(function () {
                var CustomObjectMgr = require('dw/object/CustomObjectMgr');
                var co = CustomObjectMgr.createCustomObject('NewsletterSubscriptionPNavrotskyi', newsletterForm.email.value);
                co.custom.firstName = newsletterForm.fname.value;
                co.custom.lastName = newsletterForm.lname.value;

                res.json({
                    success: true,
                    redirectUrl: URLUtils.url('Newsletter-Success').toString()
                });

                var unsubscribeUrl = URLUtils.http('Newsletter-Unsubscribe', 'type', 'NewsletterSubscriptionPNavrotskyi', 'email', newsletterForm.email.value).toString(); // Something like /Newsletter-Unsubscribe?type=NewsletterSubscriptionPNavrotskyi&email=pnavrotskyi@speroteck.com
                dw.system.HookMgr.callHook('newsletter.email', 'send', [newsletterForm.email.value, unsubscribeUrl]);
            });
        } catch (err) {
            if (err.javaName === 'MetaDataException') {
                res.json({
                    success: false,
                    error: [Resource.msg('error.subscriptionexists', 'newsletter', null)]
                });
            } else {
                var Logger = require('dw/system/Logger');
                Logger.getLogger('newsletter_subscription').error(Resource.msg('error.customobjectmissing', 'newsletter', null));

                res.setStatusCode(500);
                res.json({
                    error: true,
                    redirectUrl: URLUtils.url('Error-Start').toString()
                });
            }
        }
    } else {
        res.json({
            success: false,
            error: [Resource.msg('error.crossfieldvalidation', 'newsletter', null)]
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


server.get('Unsubscribe', function (req, res, next) {
    var newsletterForm = server.forms.getForm('newsletter');
    var continueUrl = dw.web.URLUtils.url('Newsletter-Show');
    var txn = require('dw/system/Transaction');
    newsletterForm.valid = newsletterForm.email.value === newsletterForm.emailconfirm.value && newsletterForm.valid;

    try {
        txn.wrap(function () {
            var CustomObjectMgr = require('dw/object/CustomObjectMgr');
            var co = CustomObjectMgr.getCustomObject(req.querystring.type, req.querystring.email);
            if (co) {
                CustomObjectMgr.remove(co);
                res.render('newsletter/newsletterunsubscribe', {
                    message: Resource.msg('newsletter.unsubscribe.message', 'newsletter', null),
                    continueUrl: continueUrl
                });
            } else {
                res.render('newsletter/newsletterunsubscribe', {
                    message: Resource.msg('error.unsubscribe.nullobject', 'newsletter', null),
                    continueUrl: continueUrl
                });
            }
        });
    } catch (error) {
        res.setStatusCode(500);
        res.json({
            error: true,
            redirectUrl: URLUtils.url('Error-Start').toString()
        });
    }
    next();
});


module.exports = server.exports();
