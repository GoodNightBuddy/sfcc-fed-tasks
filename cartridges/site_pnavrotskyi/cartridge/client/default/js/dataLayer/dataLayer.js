/* eslint-disable require-jsdoc */
'use strict';

module.exports = {
    events: function () {
        window.dataLayer = window.dataLayer || [];

        function getVariant(el) {
            var result = {};

            if (el) {
                // TO DO for cart
            } else {
                $('select.custom-select').each(function () {
                    var selectedOption = $(this).find(':selected');
                    var name = $(this).attr('id');
                    var value = selectedOption.attr('data-attr-value');
                    if (!value) return;
                    result[name] = value;
                });

                $('button.color-attribute').each(function () {
                    if ($(this).find('span.selected-assistive-text').text().trim() === 'selected') {
                        result.color = $(this).attr('aria-label').split('Select Color ')[1];
                    }
                });
            }
            return Object.keys(result).length ? result : 'base';
        }

        function getQuantity(el) {
            var selectedEl = el ? $(el).closest('div[data-datalayer]') : $('select.quantity-select');
            var selectedOpt = $(selectedEl).find(':selected');
            var value = $(selectedOpt).val();
            return +value;
        }

        if (window.pageContext.title === 'Product Detail') {
            const infoObj = JSON.parse($('div[data-datalayer]').attr('data-datalayer'));
            // window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push({
                ecommerce: {
                    currencyCode: infoObj.currencyCode,
                    detail: {
                        products: [{
                            id: infoObj.id,
                            name: infoObj.name,
                            price: infoObj.price,
                            brand: infoObj.brand,
                            category: infoObj.category,
                            variant: getVariant()
                        }]
                    }

                }
            });
        }

        if (window.pageContext.title === 'Product Detail') {
            const infoObj = JSON.parse($('div[data-datalayer]').attr('data-datalayer'));
            // window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push({
                ecommerce: {
                    currencyCode: infoObj.currencyCode,
                    detail: {
                        products: [{
                            id: infoObj.id,
                            name: infoObj.name,
                            price: infoObj.price,
                            brand: infoObj.brand,
                            category: infoObj.category,
                            variant: getVariant()
                        }]
                    }

                }
            });
        }

        $(document).on('click', '.add-to-cart, .add-to-cart-global', function () {
            var infoEl;
            if ($(this).hasClass('add-to-cart-global')) {
                infoEl = $(this).closest('.modal-content').find('div[data-datalayer]');
            } else {
                infoEl = $(this).closest('div[data-datalayer]');
            }
            const infoObj = JSON.parse($(infoEl).attr('data-datalayer'));
            var quantity = getQuantity();
            // window.dataLayer.push({ ecommerce: null });
            window.dataLayer.push({
                event: 'addToCart',
                ecommerce: {
                    currencyCode: infoObj.currencyCode,
                    add: {
                        products: [{
                            id: infoObj.id,
                            name: infoObj.name,
                            quantity: quantity,
                            brand: infoObj.brand,
                            variant: getVariant(),
                            category: infoObj.category,
                            list: window.pageContext.title,
                            price: infoObj.price * quantity
                        }]
                    }
                }
            });
        });

        $(document).on('click', '.remove-product', function (e) {
            const infoObj = JSON.parse($(e.target).closest('div[data-datalayer]').attr('data-datalayer'));
            window.cartReciever = null;
            var quantity = getQuantity(e.target);
            // window.dataLayer.push({ ecommerce: null });
            window.cartReciever = {
                event: 'removeFromCart',
                ecommerce: {
                    currencyCode: infoObj.currencyCode,
                    add: {
                        products: [{
                            id: infoObj.id,
                            name: infoObj.name,
                            quantity: quantity,
                            brand: infoObj.brand,
                            variant: getVariant(e.target),
                            category: infoObj.category,
                            list: window.pageContext.title,
                            price: infoObj.price * quantity
                        }]
                    }
                }
            };
        });

        $(document).on('click', '.cart-delete-confirmation-btn', function () {
            window.dataLayer.push(window.cartReciever);
            window.cartReciever = null;
        });


        $(document).on('search:showMore', console.log('showMore'));
    }
};
