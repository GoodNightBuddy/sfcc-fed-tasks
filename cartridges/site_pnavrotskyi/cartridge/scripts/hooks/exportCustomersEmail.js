'use strict';

exports.send = function (customerEmail, csvUrl) {
    var HashMap = require('dw/util/HashMap');
    var Mail = require('dw/net/Mail');
    var Site = require('dw/system/Site');
    var Template = require('dw/util/Template');

    var context = new HashMap();
    context.csvUrl = csvUrl;
    var email = new Mail();
    var template = new Template('/exportCustomers/listemail');
    var content = template.render(context).text;

    email.addTo(customerEmail);
    email.setFrom(Site.current.getCustomPreferenceValue('customerServiceEmail'));
    email.setSubject('Customers of site_pnavrotskyi');
    email.setContent(content, 'text/html', 'UTF-8');
    email.send();
};
