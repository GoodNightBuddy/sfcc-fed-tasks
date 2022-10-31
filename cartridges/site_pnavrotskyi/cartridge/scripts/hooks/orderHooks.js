var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

function beforePATCH(order, orderInput) {
    try {
        if (+orderInput.c_PNavrotskyiStatus === 1) {
            var email = order.getCustomerEmail();
            if (email) {
                var OrderModel = require('*/cartridge/models/order');
                var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');

                var config = {
                    numberOfLineItems: '*'
                };

                var orderModel = new OrderModel(
                    order,
                    { config: config, containerView: 'order' }
                );


                var emailParams = {
                    to: email,
                    subject: 'Canceled order'
                };
                emailHelpers.send(emailParams, 'order/orderDetails', {
                    order: orderModel
                });

            }
        }
    } catch (error) {
        Logger.getLogger('orderHook_beforePATCH').error(error.toString());
        return new Status(Status.ERROR, error.toString());
    }

    return new Status(Status.OK);
}

function afterPATCH(order, orderInput) {
    try {
        if (+orderInput.c_PNavrotskyiStatus === 1) {
            Transaction.wrap(function () {
                var co = CustomObjectMgr.createCustomObject('PNavrotskyiRefunds', order.UUID);
                co.custom.orderNo = order.getOrderNo();
                co.custom.totalRefund = +order.getTotalGrossPrice();
                co.custom.paymentToken = order.getOrderToken();
                co.custom.customerNumber = order.getCustomerNo();
            });
        }

    } catch (error) {
        Logger.getLogger('orderHook_beforePATCH').error(error.toString());
        return new Status(Status.ERROR, error.toString());
    }

    return new Status(Status.OK);
}

exports.beforePATCH = beforePATCH;
exports.afterPATCH = afterPATCH;
