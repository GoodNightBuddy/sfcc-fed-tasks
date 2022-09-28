'use strict';

var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
server.extend(module.superModule);

/**
 * Any customization on this endpoint, also requires update for Default-Start endpoint
 */

server.prepend('Show', cache.applyDefaultCache, function (req, res, next) {
    var viewData = res.getViewData();
    viewData.param1 = 'This is from prepend';
    res.setViewData(viewData);
    next();
});

server.append('Show', cache.applyCustomCache, function (req, res, next) {
    var viewData = res.getViewData();

    var appendParam = 'This is from append';
    var queryparam = req.querystring.param ? req.querystring.param : 'no parameter was passed';

    res.setViewData({
        param1: viewData.param1 + ' AND ' + appendParam + ' AND querystring param = ' + queryparam,
        param2: res.cachePeriod + ' ' + res.cachePeriodUnit
    });
    next();
});

// server.replace('Show', cache.applyCustomCache, function (req, res, next) {
//     var viewData = res.getViewData();

//     var appendParam = 'This is from replace';
//     var queryparam = req.querystring.param ? req.querystring.param : 'no parameter was passed';

//     res.setViewData({
//         param1: viewData.param1 + ' AND ' + appendParam + ' AND querystring param = ' + queryparam,
//         param2: res.cachePeriod + ' ' + res.cachePeriodUnit
//     });
//     res.render('/home/homePage');
//     next();
// });

module.exports = server.exports();
