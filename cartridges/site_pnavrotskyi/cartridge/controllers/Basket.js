'use strict';

var server = require('server');

var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');

server.get(
    'Show',
    server.middleware.https,
    consentTracking.consent,
    function (req, res, next) {
        var BasketMgr = require('dw/order/BasketMgr');
        var CartModel = require('*/cartridge/models/cart');
        var currentBasket = BasketMgr.getCurrentBasket();

        var basketModel = new CartModel(currentBasket);
        res.render('basket/basket', basketModel);

        next();
    }
);


module.exports = server.exports();
