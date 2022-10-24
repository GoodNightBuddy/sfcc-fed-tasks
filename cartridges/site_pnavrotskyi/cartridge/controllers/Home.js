'use strict';

var server = require('server');
var Site = require('dw/system/Site').getCurrent();
var Logger = require('dw/system/Logger');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');
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
        param2: res.cachePeriod + ' ' + res.cachePeriodUnitу
    });
    next();
});

// I realize this task with 2 cases. Because due to exercise I might realize show more function via ajax directly to the reqres.in. But, in my humble opinion, it more logical to get users via already existig service. It has commented route and commented jquery code. And I hope, my valiant mentor will clarify wich way is better:)

server.get('Users', cache.applyCustomCache, function (req, res, next) {
    try {
        var usersService = require('*/cartridge/scripts/service/usersservice');
        var enableUsersTab = Site.getCustomPreferenceValue('EnableUsersTabPNavrotskyi');
        var getUsersURL = null;
        var users = null;
        if (enableUsersTab) {
            var service = usersService.getUsersService();
            service.setURL(Site.getCustomPreferenceValue('GetUsersURLPNavrotskyi') + 1);

            var response = service.call();
            users = response.object.data;
            getUsersURL = Site.getCustomPreferenceValue('GetUsersURLPNavrotskyi');
        }
        res.render('service/usersService', { users: users, getUsersURL: getUsersURL });
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


// The variant below is for the realization via ajax to usersservice. It also have commented jquery code

// server.get('Users', cache.applyCustomCache, function (req, res, next) {
//     try {
//         var usersService = require('*/cartridge/scripts/service/usersservice');
//         var enableUsersTab = Site.getCustomPreferenceValue('EnableUsersTabPNavrotskyi');
//         var getUsersURL = null;
//         var users = null;
//         var data = null;
//         var page = req.querystring.page || 1;
//         if (enableUsersTab) {
//             var service = usersService.getUsersService();
//             service.setURL(Site.getCustomPreferenceValue('GetUsersURLPNavrotskyi') + page);

//             var response = service.call();
//             data = response.object;
//             users = data.data;
//             getUsersURL = URLUtils.https('Home-Users', 'page');
//         }
//         if (page > 1) {
//             res.json({ data: data });
//         } else {
//             res.render('service/usersService', { users: users, getUsersURL: getUsersURL });
//         }
//     } catch (error) {
//         Logger.getLogger('UsersServicePNavrotskyi').error('Request call is not successfull...');
//         res.setStatusCode(500);
//         res.render('error', {
//             error: req.error || {},
//             showError: true,
//             message: Resource.msg('subheading.error.general', 'error', null)
//         });
//     }

//     next();
// });

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
