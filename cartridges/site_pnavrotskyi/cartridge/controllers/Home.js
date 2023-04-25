'use strict';

var server = require('server');
var Site = require('dw/system/Site').getCurrent();
var Logger = require('dw/system/Logger');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var cache = require('*/cartridge/scripts/middleware/cache');
server.extend(module.superModule);

/* Allow use of TopLevel empty() */
/* global empty */

server.prepend('Show', cache.applyDefaultCache, function (req, res, next) {
    var viewData = res.getViewData();
    viewData.param1 = 'This is from prepend';

    // var catalog = CatalogMgr.getSiteCatalog();
    // var rootCat = catalog.getRoot();
    // var onlineCategories = rootCat.getOnlineSubCategories();

    // if (!empty(onlineCategories)) {
    //     viewData.categories = onlineCategories.toArray();
    // }

    res.setViewData(viewData);
    next();
});

server.append('Show', cache.applyCustomCache, function (req, res, next) {
    var viewData = res.getViewData();

    var appendParam = 'This is from append';
    var queryparam = req.querystring.param ? req.querystring.param : 'no parameter was passed';

    res.setViewData({
        param1: viewData.param1 + ' AND ' + appendParam + ' AND querystring param = ' + queryparam,
        param2: res.cachePeriod + ' ' + res.cachePeriodUnitу
    });
    next();
});

server.get('Users', cache.applyCustomCache, function (req, res, next) {
    try {
        var usersService = require('*/cartridge/scripts/service/usersservice');
        var enableUsersTab = Site.getCustomPreferenceValue('EnableUsersTabPNavrotskyi');
        var getUsersURL = null;
        var data = null;
        var page = req.querystring.page || 1;
        if (enableUsersTab) {
            var service = usersService.getUsersService(page);
            var response = service.call();
            data = response.object;
            getUsersURL = URLUtils.https('Home-Users', 'page', +page + 1).toString();
        }
        if (page > 1) {
            res.json({ data: data, getUsersURL: getUsersURL });
        } else {
            res.render('service/usersService', { data: data, getUsersURL: getUsersURL });
        }
    } catch (error) {
        Logger.getLogger('UsersServicePNavrotskyi').error('Request call is not successfull...');
        res.setStatusCode(500);
        res.render('error', {
            error: req.error || {},
            showError: true,
            message: Resource.msg('subheading.error.general', 'error', null)
        });
    }

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
