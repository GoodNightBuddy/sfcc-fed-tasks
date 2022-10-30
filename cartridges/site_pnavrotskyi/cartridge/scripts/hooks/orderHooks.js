var Mail = require('dw/net/Mail');
var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');
var Site = require('dw/system/Site').getCurrent();
var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

function beforePATCH(order, orderInput) {
    try {
        if (+orderInput.c_PNavrotskyiStatus === 1) {
            var info = order.getCreationDate() + '\nTotal Price: ' + order.getTotalNetPrice() + '$\nTotal Tax: ' + order.getTotalTax() + '$\nTotal Shipping Cost: ' + order.getShippingTotalPrice() + '$';
            var email = order.getCustomerEmail();
            if (email) {
                var mail = new Mail();
                mail.addTo(email);
                mail.setFrom(Site.getCustomPreferenceValue('customerServiceEmail'));
                mail.setSubject('Canceled order');
                mail.setContent(info);
                mail.send();
            } else {
                // some logic if customer not registered
            }


            // var emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
            // var emailParams = {
            //     to: email,
            //     subject: 'Canceled order'
            // };
            // emailHelpers.send(emailParams, info);

        }
    } catch (error) {
        Logger.getLogger('orderHook_beforePATCH').error(error.message);
        return new Status(Status.ERROR, error.message);
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
        Logger.getLogger('orderHook_beforePATCH').error(error.message);
        return new Status(Status.ERROR, error.message);
    }

    return new Status(Status.OK);
}

exports.beforePATCH = beforePATCH;
exports.afterPATCH = afterPATCH;
