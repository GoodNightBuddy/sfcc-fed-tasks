var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
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
            return output;
        },
        getRequestLogMessage: function (reqObj) {
            return reqObj;
        }
    });
    return usersService;
}

module.exports = {
    /**
     * @returns {Object} Users Service
     */
    initUsersService: function () {
        var usersService = getUsersService();
        usersService.setRequestMethod('GET');
        usersService.setURL(usersService.getURL() + '/api/users?page=1');
        return usersService;
    }
};
