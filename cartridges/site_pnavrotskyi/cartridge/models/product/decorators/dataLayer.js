'use strict';

var priceFactory = require('*/cartridge/scripts/factories/price');

function createDataLayerObj(apiProduct) {
    return {
        currencyCode: priceFactory.getPrice(apiProduct, null).sales.currency,
        name: apiProduct.getName(),
        id: apiProduct.getID(),
        price: priceFactory.getPrice(apiProduct, null).sales.value,
        brand: apiProduct.getBrand(),
        category: apiProduct.getClassificationCategory().getID()
    };
}

module.exports = function (object, apiProduct) {
    Object.defineProperty(object, 'dataLayer', {
        enumerable: true,
        value: JSON.stringify(createDataLayerObj(apiProduct))
    });
};


// dataLayer.push({
//     'ecommerce': {
//       'currencyCode': 'EUR',                       // Local currency is optional.
//       'impressions': [
//        {
//          'name': 'Triblend Android T-Shirt',       // Name or ID is required.
//          'id': '12345',
//          'price': '15.25',
//          'brand': 'Google',
//          'category': 'Apparel',
//          'variant': 'Gray',
//          'list': 'Search Results',
//          'position': 1
//        },
//        {
//          'name': 'Donut Friday Scented T-Shirt',
//          'id': '67890',
//          'price': '33.75',
//          'brand': 'Google',
//          'category': 'Apparel',
//          'variant': 'Black',
//          'list': 'Search Results',
//          'position': 2
//        }]
//     }
//   });


// dataLayer.push({
//     'event': 'addToCart',
//     'ecommerce': {
//       'currencyCode': 'EUR',
//       'add': {                                // 'add' actionFieldObject measures.
//         'products': [{                        //  adding a product to a shopping cart.
//           'name': 'Triblend Android T-Shirt',
//           'id': '12345',
//           'price': '15.25',
//           'brand': 'Google',
//           'category': 'Apparel',
//           'variant': 'Gray',
//           'quantity': 1
//          }]
//       }
//     }
//   });

