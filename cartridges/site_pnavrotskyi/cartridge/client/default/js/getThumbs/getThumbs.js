'use strict';

module.exports = {
    getThumbsSlider: function () {
        $('#get-thumbs:not(.slick-initialized)').slick({
            dots: true,
            arrows: true,
            prevArrow: '<a class="slick-prev d-flex justify-content-center align-items-center"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="sr-only">Previous</span></a>',
            nextArrow: '<a class="slick-next d-flex justify-content-center align-items-center"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="sr-only">Next</span></a>',
            infinite: true,
            speed: 300,
            slidesToShow: 1,
            adaptiveHeight: true,
            autoplay: true,
            autoplaySpeed: 5000
        });
    }
};

