'use strict';

var server = require('server');

server.get('MiniFavourite', server.middleware.include, function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');

    var currentBasket = BasketMgr.getCurrentBasket();
    var quantityTotal;

    if (currentBasket) {
        quantityTotal = currentBasket.productQuantityTotal;
    } else {
        quantityTotal = 0;
    }

    res.render('/components/header/miniFavourite', { quantityTotal: quantityTotal });
    next();
});

module.exports = server.exports();
