'use strict';

var Swiper = require('swiper').default;
var Navigation = require('swiper').Navigation;
var Pagination = require('swiper').Pagination;
var Autoplay = require('swiper').Autoplay;
var EffectFlip = require('swiper').EffectFlip;
var Keyboard = require('swiper').Keyboard;

const swiper = new Swiper('.swiper', {
    modules: [Navigation, Pagination, Autoplay, EffectFlip, Keyboard],
    effect: 'flip',
    flipEffect: {
        slideShadows: false,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    loop: true,
    speed: 800,
    autoplay: {
        delay: 5000,
        disableOnInteraction: true
    },
    slidesPerView: 1,
    spaceBetween: 0,
    keyboard: {
        enabled: true
    },
    grabCursor: true

});
