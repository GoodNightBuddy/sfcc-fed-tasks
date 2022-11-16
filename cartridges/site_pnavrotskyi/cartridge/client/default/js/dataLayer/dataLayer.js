/* eslint-disable no-continue */
'use strict';

var events = {
    impressionsCount: 0,
    cartReciever: new Symbol('cartReciever for dataLayer removeFromCart event'),

    /**
     * Recieves the button that was clicked or null
     * Return object with variation attributes or 'base' variation
     * @param {HTMLButtonElement} el - the button that was clicked or null
     * @return {Object} - object with variation attributes or 'base' variation
     */
    getVariant(el) {
        var result = {};
        var selectElems;
        var colorButton;

        if (el) { // Element(el) needed for quickview page. There can be multiple products per page.  Therefore needed find select element in apropriate block
            selectElems = $($(el).closest('.modal-content')).find('select.custom-select');
            colorButton = $($(el).closest('.modal-content')).find('button.color-attribute');
        } else { // Means PDP. It has select elements only for one product
            selectElems = $('select.custom-select');
            colorButton = $('button.color-attribute');
        }


        if (!selectElems.length && !colorButton.length && el) { // Cart do not have this elements. Cart retain variant info in "p" tag
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
            $(selectElems).each(function () { // Retrieve variant info from select elems for PDP an qickview page
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
    },

    /**
     * Recieves the button that was clicked or null
     * Return quatity value of product
     * @param {HTMLButtonElement} el - the button that was clicked or null
     * @return {number} - quatity value of product
     */
    getQuantity(el) {
        var selectedEl = el ? $(el).closest('div[data-datalayer]') : $('select.quantity-select');
        var selectedOpt = $(selectedEl).find(':selected');
        var value = $(selectedOpt).val();
        return +value;
    },

    /**
     * Product detail event instead of impression on PDP
     * Read information from elems with approproately data-attribute
     */
    detailView() {
        const infoObj = JSON.parse($('div[data-datalayer]').attr('data-datalayer'));
        infoObj.variant = this.getVariant();
        window.dataLayer.push({
            ecommerce: {
                currencyCode: infoObj.currencyCode,
                detail: {
                    products: [infoObj]
                }

            }
        });
    },

    /**
     * Init dataLayer object
     */
    init() {
        window.dataLayer = window.dataLayer || [];
    },

    /**
     * Impressions event for dataLayer
     * Read information from elems with approproately data-attribute
     */
    impression() {
        var elems = $('.grid-tile');
        var impressions = [];
        var currencyCode = null;
        for (var i = this.impressionsCount; i < elems.length; i++) {
            var info = JSON.parse($(elems[i]).attr('data-datalayer'));
            if (!info) continue;
            info.position = i + 1;
            info.variant = 'base';
            info.list = window.pageContext.title;
            currencyCode = currencyCode || info.currencyCode;
            impressions.push(info);
            this.impressionsCount++;
        }

        window.dataLayer.push({
            ecommerce: {
                currencyCode: currencyCode,
                impressions: impressions

            }
        });
    },

    /**
     * Add to cart event for dataLayer
     * Read information from event.target data-attribute
     * @param {jQuery.event} e - Event click on remove button.
     */
    addToCart(e) {
        var infoEl;
        var variant;
        var quantity;
        if ($(e.target).hasClass('add-to-cart-global')) {       // For minicart
            infoEl = $(e.target).closest('.modal-content').find('div[data-datalayer]');
            variant = this.getVariant(e.target);
            quantity = this.getQuantity(e.target);
        } else {                                                // For PDP
            infoEl = $(e.target).closest('div[data-datalayer]');
            variant = this.getVariant();
            quantity = this.getQuantity();
        }
        const infoObj = JSON.parse($(infoEl).attr('data-datalayer'));
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
    },

    /**
     * Remove from cart event for dataLayer. It pushes event information into window object.
     * When remove confirmed, it copy window object into dataLayer array.
     * Read information from event.target data-attribute
     * @param {jQuery.event} e - Event click on remove button.
     */
    removeFromCart(e) {
        const infoObj = JSON.parse($(e.target).closest('div[data-datalayer]').attr('data-datalayer'));
        var quantity = this.getQuantity(e.target);
        var variant = this.getVariant(e.target);
        var price = infoObj.price * quantity;
        infoObj.price = price;
        infoObj.variant = variant;
        infoObj.quantity = quantity;
        infoObj.list = window.pageContext.title;

        window[this.cartReciever] = {
            event: 'removeFromCart',
            ecommerce: {
                currencyCode: infoObj.currencyCode,
                add: {
                    products: [infoObj]
                }
            }
        };
    },

    /**
     * Remove from cart event for dataLayer. It pushes event information into window object.
     * When remove confirmed copy window object into dataLayer array.
     */
    confirmRemove() {
        window.dataLayer.push(window[this.cartReciever]);
    }
};

module.exports = {
    events: function () {
        events.init();
        // Impressions event for showMore. Use this inside
        $(document).on('search:showMoreSuccess', events.impression.bind(events));

        // Product impression on PLP for first load
        if (window.pageContext.title === 'Product Search Results') {
            events.impression.call(events);
        }

        if (window.pageContext.title === 'Product Detail') {
            events.detailView.call(events);
        }

        $(document).on('click', '.add-to-cart, .add-to-cart-global', events.addToCart.bind(events));

        $(document).on('click', '.remove-product', events.removeFromCart.bind(events));

        // When remove confirmed copy window object into dataLayer array.
        $(document).on('click', '.cart-delete-confirmation-btn', events.confirmRemove.bind(events));
    }
};
