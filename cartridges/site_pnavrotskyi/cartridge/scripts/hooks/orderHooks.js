var Status = require('dw/system/Status');
var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

function beforePATCH(order, orderInput) {
    try {
        if (+orderInput.c_PNavrotskyiStatus === 1) {
            var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
            var email = order.getCustomerEmail();
            var info = order.getCreationDate() + '\nTotal Price: ' + order.getTotalNetPrice() + '$\nTotal Tax: ' + order.getTotalTax() + '$\nTotal Shipping Cost: ' + order.getShippingTotalPrice() + '$';
            var emailParams = {
                to: email,
                subject: 'Canceled order'
            };

            emailHelpers.send(emailParams, info);

        }
    } catch (error) {
        return new Status(Status.ERROR, error.message);
    }

    if (!orderInput.c_PNavrotskyiStatus) {
        return new Status(Status.ERROR, 'error');
    }
    return new Status(Status.OK);
}

function afterPATCH(order, orderInput) {
    try {
        if (+orderInput.c_PNavrotskyiStatus === 1) {
            Transaction.wrap(function () {
                // order.custom.PNavrotskyiStatus = orderInput.c_PNavrotskyiStatus;
                // order.custom.PNavrotskyiCancelReason = orderInput.c_PNavrotskyiCancelReason;

                var co = CustomObjectMgr.createCustomObject('PNavrotskyiRefunds', order.UUID);
                co.custom.orderNo = order.orderNo;
                co.custom.totalRefund = +order.totalGrossPrice;
                co.custom.paymentToken = order.orderToken;
                co.custom.customerNumber = order.customerNo;
            });
        }

    } catch (error) {
        return new Status(Status.ERROR, error.message);
    }

    return new Status(Status.OK);
}

exports.beforePATCH = beforePATCH;
exports.afterPATCH = afterPATCH;
