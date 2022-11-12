'use strict';

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var DatalayerModel = require('~/cartridge/models/datalayer');

server.get('Start', cache.applyDefaultCache, function (req, res, next) {
    var Site = require('dw/system/Site');

    // res.render('hello/helloWorld', { param1: Site.current.name });
    res.json({ siteCurrentName: Site.current.name });
    next();
});

// server.get('DataLayer', cache.applyDefaultCache, function (req, res, next) {
//     var product = new DatalayerModel('701644143909M');
//     res.json({ product: product });
//     next();
// });

module.exports = server.exports();
