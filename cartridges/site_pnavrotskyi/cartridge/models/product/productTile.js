'use strict';

var decorators = require('~/cartridge/models/product/decorators/index');
var base = module.superModule;

module.exports = function fullProduct(product, apiProduct, options) {
    base.call(this, product, apiProduct, options);

    decorators.dataLayer(product, apiProduct);
    return product;
};
