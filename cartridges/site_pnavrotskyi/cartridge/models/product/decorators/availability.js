/* eslint-disable no-use-before-define */
'use strict';

var Resource = require('dw/web/Resource');

var base = module.superModule;

module.exports = function (object, quantity, minOrderQuantity, availabilityModel) {
    base.call(this, object, quantity, minOrderQuantity, availabilityModel);

    Object.defineProperty(object, 'ats', {
        enumerable: true,
        value: getATSMessage(availabilityModel)
    });
};

// eslint-disable-next-line require-jsdoc
function getATSMessage(availabilityModel) {
    var ATS = {};
    ATS.messages = [];
    var inventoryRecord = availabilityModel.inventoryRecord;

    if (inventoryRecord) {
        ATS.messages.push(
            Resource.msgf(
                'label.quantity.in.stock',
                'common',
                null,
                inventoryRecord.ATS.value
            )
        );
    } else {
        ATS.messages.push(
            Resource.msgf(
                'label.quantity.in.stock',
                'common',
                null,
                100
            )
        );
    }
    return ATS;
}
