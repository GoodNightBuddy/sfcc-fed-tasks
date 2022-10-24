var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site').getCurrent();

/**
 * Users
 * @returns {Object} Users Service
 */
function getUsersService(page) {
    var usersService = LocalServiceRegistry.createService('UsersServicePNavrotskyi', {
        createRequest: function (svc, args) {
            svc.setRequestMethod('GET');
            svc.setURL(Site.getCustomPreferenceValue('GetUsersURLPNavrotskyi') + page);
            return JSON.stringify(args);
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
    return usersService;
}

module.exports = { getUsersService: getUsersService };
