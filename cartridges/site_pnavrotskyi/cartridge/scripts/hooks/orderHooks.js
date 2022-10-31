var Mail = require('dw/net/Mail');
var Logger = require('dw/system/Logger');
var Status = require('dw/system/Status');
var Site = require('dw/system/Site').getCurrent();
var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var collections = require('*/cartridge/scripts/util/collections');

function beforePATCH(order, orderInput) {
    try {
        if (+orderInput.c_PNavrotskyiStatus === 1) {
            var email = order.getCustomerEmail();
            if (email) {
                var products = order.getProductLineItems();
                var productsInfo = 'Your order contains: \n';

                collections.forEach(products, function (product, i) {
                    var separator = ',\n';
                    if (i === products.length - 1) {
                        separator = '.';
                    }
                    productsInfo += product.getProductName() + ' in quantity: ' + product.quantityValue + separator;
                });

                var orderInfo = productsInfo + '\nOrder information:' +
                '\nCreation Date: ' + order.getCreationDate() +
                '\nTotal Tax: ' + order.getTotalTax() + '$' +
                '\nTotal Shipping Cost: ' + order.getShippingTotalPrice() + '$' +
                '\nTotal Price: ' + order.getTotalGrossPrice() + '$';

                var mail = new Mail();
                mail.addTo(order.getCustomerEmail());
                mail.setFrom(Site.current.getCustomPreferenceValue('customerServiceEmail'));
                mail.setSubject('Canceled order information');
                mail.setContent(orderInfo);
                mail.send();

            }
        }
        return new Status(Status.OK);
    } catch (error) {
        Logger.getLogger('orderHook_beforePATCH').error(error.toString());
        return new Status(Status.ERROR, error.toString());
    }

}

function afterPATCH(order, orderInput) {
    try {
        if (+orderInput.c_PNavrotskyiStatus === 1) {
            Transaction.wrap(function () {
                var co = CustomObjectMgr.createCustomObject('PNavrotskyiRefunds', order.UUID);
                co.custom.orderNo = order.getOrderNo();
                co.custom.paymentToken = order.getOrderToken();
                co.custom.customerNumber = order.getCustomerNo();
                co.custom.totalRefund = +order.getTotalGrossPrice();
            });
        }
        return new Status(Status.OK);
    } catch (error) {
        Logger.getLogger('orderHook_beforePATCH').error(error.toString());
        return new Status(Status.ERROR, error.toString());
    }

}

exports.beforePATCH = beforePATCH;
exports.afterPATCH = afterPATCH;
