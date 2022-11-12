/* eslint-disable require-jsdoc */
'use strict';

// var $ = window.$;

module.exports = {
    events: function () {
        window.dataLayer = window.dataLayer || [];

        function pushDataLayer() {
            var elems = $('div.grid-tile product');
            var elemsTotal = elems.length;

            if (elemsTotal > 0) {
                var impressions = [];
                var obj = {};

                for (var i = 0; i < elemsTotal; i++) {
                    impressions[impressions.length] = JSON.parse($(elems[i]).attr('data-datalayer'));
                }

                if (elems[0].className === 'grid-tile product') {
                    obj = {
                        ecommerce: {
                            impressions: impressions
                        }
                    };
                } else {
                    obj = {
                        ecommerce: {
                            detail: {
                                products: impressions
                            }
                        }
                    };
                }

                window.dataLayer.push({ ecommerce: null });
                window.dataLayer.push(obj);
            }
        }

        pushDataLayer();

        $(document).on('search:showMore', pushDataLayer);

        $(document).on('click', '.add-to-cart, .add-to-cart-global', function () {
            var data = JSON.parse($('div.product-detail').attr('data-datalayer'));

            window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push({
                event: 'addToCart',
                ecommerce: {
                    add: data
                }
            });
        });

        $(document).on('click', '.remove-product', function () {
            var data = JSON.parse($('div.cart-datalayer').attr('data-datalayer'));

            window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push({
                event: 'removeFromCart',
                ecommerce: {
                    remove: data
                }
            });
        });
    }
};
