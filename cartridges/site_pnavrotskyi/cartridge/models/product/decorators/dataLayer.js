'use strict';

// var priceFactory = require('*/cartridge/scripts/factories/price');
// currencyCode: priceFactory.getPrice(apiProduct).sales.currency,
// price: priceFactory.getPrice(apiProduct).sales.value,

/**
 * returns object with necessary properties for dataLayer
 * @param {dw.catalog.Product} apiProduct - Product information returned by the script API
 * @returns {Object} - object with necessary properties for dataLayer
 */
function createDataLayerObj(apiProduct) {
    return {
        category: apiProduct.getPrimaryCategory() ? apiProduct.getPrimaryCategory().getID() : apiProduct.getMasterProduct().getPrimaryCategory().getID(),
        currencyCode: apiProduct.getPriceModel().getMinPrice().getCurrencyCode(),
        price: apiProduct.getPriceModel().getMaxPrice().getValue(),
        brand: apiProduct.getBrand(),
        name: apiProduct.getName(),
        id: apiProduct.getID()
    };
}

module.exports = function (object, apiProduct) {
    Object.defineProperty(object, 'dataLayer', {
        enumerable: true,
        value: createDataLayerObj(apiProduct)
    });
};
