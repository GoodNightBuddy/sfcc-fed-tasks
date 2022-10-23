var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');

/**
 * Users
 * @returns {Object} Users Service
 */
function getUsersService() {
    var usersService = LocalServiceRegistry.createService('UsersServicePNavrotskyi', {
        createRequest: function (svc, args) {
            if (svc.getRequestMethod() === 'GET') {
                return JSON.stringify(args);
            }
            return svc;
        },
        parseResponse: function (svc, output) {
            try {
                var parsedResponse = JSON.parse(output.text);
                if (!parsedResponse.page || !parsedResponse.total_pages || !parsedResponse.data) {
                    throw new Error();
                }
                return parsedResponse;
            } catch (error) {
                Logger.getLogger('UsersServicePNavrotskyi').error('Request call is not successfull...');
                return null;
            }
        },
        getRequestLogMessage: function (reqObj) {
            return reqObj;
        }
    });
    usersService.setRequestMethod('GET');
    return usersService;
}

module.exports = { getUsersService: getUsersService };
