'use strict';

var server = require('server');
var Site = require('dw/system/Site').getCurrent();
var Logger = require('dw/system/Logger');
var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');
var CatalogMgr = require('dw/catalog/CatalogMgr');
var ProductMgr = require('dw/catalog/ProductMgr');
var cache = require('*/cartridge/scripts/middleware/cache');
server.extend(module.superModule);

/* Allow use of TopLevel empty() */
/* global empty */

server.get('Thumbs', cache.applyDefaultCache, function (req, res, next) {
    var viewData = res.getViewData();
    viewData.getThumbs = 'This is from getThumbs';
    var productId = '25518174M';

    var apiProduct = ProductMgr.getProduct(productId);
    var images = apiProduct.getImages('large');
    viewData.images = images;

    res.setViewData(viewData);
    res.render('/product/getThumbs');
    next();
});


module.exports = server.exports();
