/* eslint-disable no-continue */
'use strict';

/**
 * Recieves the button that was clicked or null
 * Return object with variation attributes or 'base' variation
 * @param {HTMLButtonElement || null}  - the button that was clicked
 * @return {Object || 'base'} - object with variation attributes or 'base' variation
 */
function getVariant(el) {
    var result = {};
    var selectElems;
    var colorButton;

    if (el) {
        selectElems = $($(el).closest('.modal-content')).find('select.custom-select');
        colorButton = $($(el).closest('.modal-content')).find('button.color-attribute');
    } else {
        selectElems = $('select.custom-select');
        colorButton = $('button.color-attribute');
    }

    if (!selectElems.length && !colorButton.length && el) {
        var parent = $(el).closest('div[data-datalayer]');
        var elems = $(parent).find('.line-item-attributes');
        $(elems).each(function () {
            var entries = $(this).text().split(': ');
            var key = entries[0];
            var value = entries[1];
            if (key && value) {
                result[key] = value;
            }
        });
    } else {
        $(selectElems).each(function () {
            var selectedOption = $(this).find(':selected');
            var key = $(this).attr('id');
            var value = selectedOption.attr('data-attr-value');
            if (!value) return;
            result[key] = value;
        });

        $(colorButton).each(function () {
            if ($(this).find('span.selected-assistive-text').text().trim() === 'selected') {
                result.color = $(this).attr('aria-label').split('Select Color ')[1];
            }
        });
    }

    return Object.keys(result).length ? result : 'base';
}

/**
 * Recieves the button that was clicked or null
 * Return quatity value of product
 * @param {HTMLButtonElement || null}  - the button that was clicked
 * @return {number} - quatity value of product
 */
function getQuantity(el) {
    var selectedEl = el ? $(el).closest('div[data-datalayer]') : $('select.quantity-select');
    var selectedOpt = $(selectedEl).find(':selected');
    var value = $(selectedOpt).val();
    return +value;
}

// Product detail event instead of impression on PDP
if (window.pageContext.title === 'Product Detail') {
    const infoObj = JSON.parse($('div[data-datalayer]').attr('data-datalayer'));
    infoObj.variant = getVariant();
    window.dataLayer.push({
        ecommerce: {
            currencyCode: infoObj.currencyCode,
            detail: {
                products: [infoObj]
            }

        }
    });
}

module.exports = {
    events: function () {
        window.dataLayer = window.dataLayer || [];
        var impressionsCount = 0;

        // Impressions event for PLP
        function impression() {
            var elems = $('.grid-tile');
            var impressions = [];
            var currencyCode = null;
            for (var i = impressionsCount; i < elems.length; i++) {
                var info = JSON.parse($(elems[i]).attr('data-datalayer'));
                if (!info) continue;
                info.position = i + 1;
                info.variant = 'base';
                info.list = window.pageContext.title;
                currencyCode = currencyCode || info.currencyCode;
                impressions.push(info);
                impressionsCount++;
            }

            window.dataLayer.push({
                ecommerce: {
                    currencyCode: currencyCode,
                    impressions: impressions

                }
            });
        }

        // Impressions event for showMore
        $(document).on('search:showMoreSuccess', impression);

        // Product impression on PLP for first load
        if (window.pageContext.title === 'Product Search Results') {
            impression();
        }

        $(document).on('click', '.add-to-cart, .add-to-cart-global', function (e) {
            var infoEl;
            var variant;
            if ($(this).hasClass('add-to-cart-global')) {
                infoEl = $(this).closest('.modal-content').find('div[data-datalayer]');
                variant = getVariant(e.target);
            } else {
                infoEl = $(this).closest('div[data-datalayer]');
                variant = getVariant();
            }
            const infoObj = JSON.parse($(infoEl).attr('data-datalayer'));
            var quantity = getQuantity(e.target);
            var price = infoObj.price * quantity;
            infoObj.price = price;
            infoObj.variant = variant;
            infoObj.quantity = quantity;
            infoObj.list = window.pageContext.title;
            window.dataLayer.push({
                event: 'addToCart',
                ecommerce: {
                    currencyCode: infoObj.currencyCode,
                    add: {
                        products: [infoObj]
                    }
                }
            });
        });

        // Remove from cart event.
        // It pushes event information into window object.
        // When remove confirmed, it copy window object into dataLayer array.
        $(document).on('click', '.remove-product', function (e) {
            const infoObj = JSON.parse($(e.target).closest('div[data-datalayer]').attr('data-datalayer'));
            window.cartReciever = null;
            var quantity = getQuantity(e.target);
            var variant = getVariant(e.target);
            var price = infoObj.price * quantity;
            infoObj.price = price;
            infoObj.variant = variant;
            infoObj.quantity = quantity;
            infoObj.list = window.pageContext.title;

            window.cartReciever = {
                event: 'removeFromCart',
                ecommerce: {
                    currencyCode: infoObj.currencyCode,
                    add: {
                        products: [infoObj]
                    }
                }
            };
        });

        // When remove confirmed copy window object into dataLayer array.
        // Clear window object
        $(document).on('click', '.cart-delete-confirmation-btn', function () {
            window.dataLayer.push(window.cartReciever);
            window.cartReciever = null;
        });
    }
};
