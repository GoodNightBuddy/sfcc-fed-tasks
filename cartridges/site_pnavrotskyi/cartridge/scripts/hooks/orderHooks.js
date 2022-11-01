var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

function beforePATCH(order, orderInput) {
    try {
        if (+orderInput.c_status === 1) {
            // if (+order.custom.PNavrotskyiStatus === 1) throw new Error('Order already canceled');
            var email = order.getCustomerEmail();
            if (email) {
                var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
                var OrderModel = require('*/cartridge/models/order');

                var orderModel = new OrderModel(
                    order,
                    { config: { numberOfLineItems: '*' }, containerView: 'order' }
                );

                var emailParams = {
                    to: email,
                    subject: 'Canceled order'
                };

                emailHelpers.send(emailParams, 'order/cancelOrder', { order: orderModel });
            }
        }
        return new Status(Status.OK);
    } catch (error) {
        Logger.getLogger('orderHook_beforePATCH').error(error.toString());
        return new Status(Status.ERROR, error.toString());
    }

}

function afterPATCH(order, orderInput) {
    // try {
    //     if (+orderInput.c_PNavrotskyiStatus === 1) {
    //         Transaction.wrap(function () {
    //             order.custom.PNavrotskyiStatus = orderInput.c_status;
    //             order.custom.PNavrotskyiCancelReason = orderInput.c_note;

    //             var co = CustomObjectMgr.createCustomObject('PNavrotskyiRefunds', order.UUID);
    //             co.custom.orderNo = order.getOrderNo();
    //             co.custom.paymentToken = order.getOrderToken();
    //             co.custom.customerNumber = order.getCustomerNo();
    //             co.custom.totalRefund = +order.getTotalGrossPrice();
    //         });
    //     }
    //     return new Status(Status.OK);
    // } catch (error) {
    //     Logger.getLogger('orderHook_beforePATCH').error(error.toString());
    //     return new Status(Status.ERROR, error.toString());
    // }
}

exports.beforePATCH = beforePATCH;
exports.afterPATCH = afterPATCH;
