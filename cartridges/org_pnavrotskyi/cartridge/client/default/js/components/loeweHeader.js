/* eslint-disable require-jsdoc */
'use strict';

// Position is fixed, so header sticks to the screen.
// Initially header has transform: translateY(-100%);
// so it isn't visible. To make it visible .visible
// class adds to the header on scroll up and header get property
// transform: translateY(0%); With transition property
// it smoothly pulls down from "top" to the screen.
// But when user in the top of the page, header should
// change behavior and scrolls like common element.
// It needs absolute positioning. But in other part of
// the page it should appear on scroll up and dissappear
// on scroll down.
module.exports = {
    headerAnimation: function () {
        var lastScrollTop = 0;
        var header = $('.loewe-header');
        var logoWhite = $('.logo-white');
        var logoBlack = $('.logo-black');
        var headerHeight = header.outerHeight();
        var isVisible = header.hasClass('visible');
        var colorWhite = 'rgb(255, 255, 255)';
        var colorBlack = 'rgb(0, 0, 0)';
        var colorTransparent = 'rgba(0, 0, 0, 0)';

        // If user in top of the page header should be transparent with black color
        // Else header color should be black, backgroundColor - white

        function makeHeaderWhite() {
            if (header.css('background-color') === colorWhite) return;
            header.css({ color: colorBlack, backgroundColor: colorWhite });
            logoBlack.css({ opacity: 1 });
            logoWhite.css({ opacity: 0 });
        }

        function makeHeaderTransparent() {
            if (logoWhite.css('opacity') === 1) return;

            header.css({
                color: colorWhite,
                backgroundColor: colorTransparent
            });
            logoBlack.css({ opacity: 0 });
            logoWhite.css({ opacity: 1 });
        }

        function makeHeaderVisible() {
            header.addClass('visible');
            isVisible = true;
        }

        function makeHeaderInVisible() {
            header.removeClass('visible');
            header.css({
                color: colorBlack,
                backgroundColor: colorTransparent
            });
            logoBlack.css({ opacity: 1 });
            logoWhite.css({ opacity: 0 });
            isVisible = false;
        }

        function adjustWidth(scroll) {
            if (scroll >= headerHeight) {
                // logoWhite.css('max-width', '70%');
                $('.logo-white, .logo-black').css('max-width', '60%');
            } else {
                var percentage =
                    ((headerHeight - scroll) / headerHeight) * 40 + 60;
                // logoWhite.css('max-width', percentage + '%');
                // logoBlack.css('max-width', percentage + '%');
                $('.logo-white, .logo-black').css(
                    'max-width',
                    percentage + '%'
                );
            }
        }

        adjustWidth($(window).scrollTop());
        // Check if the page is initially at the top and add the 'visible' class to the header
        if ($(window).scrollTop() <= headerHeight) {
            makeHeaderVisible();
            makeHeaderTransparent();
            header.css('position', 'absolute');
        }

        $(window).on('scroll', function () {
            var scrollTop = $(this).scrollTop();
            adjustWidth(scrollTop);

            // Check if scrolling up or down
            if (scrollTop > lastScrollTop) {
                // Scrolling down

                if (scrollTop > headerHeight && isVisible) {
                    makeHeaderInVisible();
                    // If user was in the top of the page and now has scrolled the whole header
                    // When user has scrolled whole header logic assumes that
                    // header must get rid of visible class and changes absolute postion
                    // to fixed, for correct appearing when user starts scroll up

                    if (header.css('position') === 'absolute') {
                        // Removing transition property for avoid blinking. When user has
                        // scrolled whole header, absolute position is changing to fixed
                        // with simultaneously removing visible class. So transition of
                        // removing visible, which has started previously, is continuing but
                        // now from fixed position.
                        // So, it needed instant position changing without transition
                        // to prevent header appearing on the screen. Hence transition
                        // removes while position changing, and then restores.
                        // SetTimeout ensures that adding transition happens only after
                        // rebuilding DOM and transition applies only when header already
                        // beyond the screen. Otherwise DOM hasn't time to rebuild and
                        // accept transition property.
                        header.css('transition-property', 'background-color');
                        header.css('position', 'fixed');
                        setTimeout(
                            () =>
                                header.css(
                                    'transition-property',
                                    'transform, background-color'
                                ),
                            0
                        );
                    }
                } else if (isVisible && header.css('position') === 'fixed') {
                    makeHeaderInVisible();
                }
            } else {
                // Scrolling up

                // If user on very top of the page - stick header to top of the page
                if (scrollTop === 0) {
                    header.css('position', 'absolute');
                }

                if (scrollTop > headerHeight) {
                    makeHeaderWhite();
                }

                if (scrollTop <= headerHeight) {
                    makeHeaderTransparent();
                }

                // Make visible if header was not
                if (!isVisible) {
                    makeHeaderVisible();
                }
            }

            lastScrollTop = scrollTop;
        });
    },

    menuLeftItemsAnimation: function () {
        var header = $('.loewe-header');
        var isVisible = header.hasClass('menu-visible');
        var menuItems = $('.loewe-header-menu__link');
        var closeButton = $('.loewe-header-close-button');
        var selectedMenuItem = null;

        function openMenu() {
            header.addClass('menu-visible');
            $('body').css({
                'padding-right': '17px',
                overflow: 'hidden'
            });
            isVisible = true;
        }

        function closeMenu() {
            header.removeClass('menu-visible');
            isVisible = false;
            $('body').css({
                'padding-right': '',
                overflow: ''
            });
        }

        function setSelectedItem(menuItem) {
            if (selectedMenuItem) {
                selectedMenuItem.attr('aria-selected', 'false');
            }
            if (menuItem) {
                menuItem.attr('aria-selected', 'true');
            }
            selectedMenuItem = menuItem;
        }

        function clickHandle(e) {
            e.preventDefault();
            e.stopPropagation();
            var menuItem = $(this);

            if (!selectedMenuItem) {
                setSelectedItem(menuItem);
                openMenu();
                return;
            }

            if (selectedMenuItem.is(menuItem)) {
                setSelectedItem(null);
                closeMenu();
                return;
            }

            if (!selectedMenuItem.is(menuItem)) {
                setSelectedItem(menuItem);
                return;
            }
        }

        menuItems.each(function () {
            $(this).on('click', clickHandle);
        });

        header.on('click', () => {
            if (selectedMenuItem) {
                setSelectedItem(null);
            }
            if (isVisible) {
                closeMenu();
            }
        });

        closeButton.on('click', closeMenu);
    },

    subcategoryItemsAnimation: function () {
        var subButtons = $('.loewe-header-menu__subbutton');
        var allImages = $('.loewe-header-menu__image');
        var defaultImages = [];
        var selectedImage = null;
        var selectedButton = null;

        function unselectButton() {
            if (!selectedButton) return;
            selectedButton.attr('aria-selected', false);
            selectedButton = null;
            selectedImage = null;
        }

        function selectButton(button) {
            unselectButton();
            selectedButton = $(button);
            selectedButton.attr('aria-selected', true);
        }

        subButtons.each(function () {
            var subButton = $(this);
            var dataCategory = subButton.data('category');

            // For changing image onhover subcategory
            var images = $(subButton)
                .closest('.loewe-header-menu__item')
                .find('.loewe-header-menu__image');
            var defaultImage = $(images[0]);
            defaultImages.push(defaultImage);
            var image = $(
                images.filter(function () {
                    return $(this).data('category') === dataCategory;
                })
            );

            subButton.on('mouseenter', function () {
                if (selectedImage) {
                    selectedImage.removeClass('active');
                    image.addClass('active');
                } else {
                    defaultImage.removeClass('active');
                    image.addClass('active');
                }
            });
            subButton.on('mouseleave', function () {
                if ($(this).attr('aria-selected') === 'true') return;
                if (selectedImage) {
                    selectedImage.addClass('active');
                    image.removeClass('active');
                } else {
                    defaultImage.addClass('active');
                    image.removeClass('active');
                }
            });
            subButton.on('click', function (e) {
                e.stopPropagation();
                var items = $(this).next();
                if (items.length) {
                    e.preventDefault();
                }
                if ($(this).is(selectedButton)) {
                    unselectButton();
                } else {
                    selectButton(this);
                    selectedImage = image;
                }
            });
        });

        // Vanilla JS for capturing phase. Because we already have header's listeners
        var header = document.querySelector('.loewe-header');
        header.addEventListener(
            'click',
            (e) => {
                if (
                    // Avoid closing menu when click to this elements
                    // Prevents header.onclick closing menu, which in the headerAnimation func
                    e.target.closest('.loewe-header-menu__title') ||
                    e.target.closest('.loewe-header-menu__image')
                ) {
                    e.stopPropagation();
                }
                if (
                    // Select should not dissapper when clickicg on this elements
                    !e.target.closest('.loewe-header-menu__subbutton') &&
                    !e.target.closest('.loewe-header-menu__title') &&
                    !e.target.closest('.loewe-header-menu__image')
                ) {
                    // If user clicks to the header and close menu, regain buttons previous classes
                    if (selectedImage) {
                        allImages.each(function () {
                            if ($(this).attr('data-category')) { // subcategoryu images
                                $(this).removeClass('active');
                            } else {    // default category image
                                $(this).addClass('active');
                            }
                        });
                    }
                    unselectButton();
                }
            },
            true
        );
    }
};
