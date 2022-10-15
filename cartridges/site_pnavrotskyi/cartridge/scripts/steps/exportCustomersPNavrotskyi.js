'use strict';

const CustomerMgr = require('dw/customer/CustomerMgr');
const File = require('dw/io/File');
const System = require('dw/system/System');
const FileWriter = require('dw/io/FileWriter');
const CSVStreamWriter = require('dw/io/CSVStreamWriter');

/**
* @function exportCustomers
* @description This script filtered customers and export them into .csv file.
*
* @param {Object} parameters Represents the parameters defined in the steptypes.json file
*/

function processProfile(profile, csvStreamWriter) {
    // const firstName = profile.firstName;
    // const lastName = profile.lastName;
    // const email = profile.email;
    // const creationDate = profile.creationDate;
    csvStreamWriter.writeNext([profile.firstName, profile.lastName, profile.email, profile.creationDate]);

};



function exportCustomers(parameters) {
    const startDate = parameters.startDate || 0;
    const endDate = parameters.endDate || new Date();
    const emailRegexp = /^[\w.%+-]+@[\w.-]+\.[\w]{2,6}$/;
    const email = parameters.email;

    const fileName = Date.now() + '_customersPNavrotskyi.csv';
    const file = new File('/IMPEX/src/ExportCustomers/' + fileName);
    const link =  'https://' + System.getInstanceHostname() + '/on/demandware.servlet/webdav/Sites' + file.getFullPath();
    const fileWriter = new FileWriter(file);
    let csvStreamWriter = new CSVStreamWriter(fileWriter);
    csvStreamWriter.writeNext(['First Name', 'Last Name', 'Email', 'Creation Date']);

    CustomerMgr.processProfiles(function (profile) {
        processProfile(profile, csvStreamWriter);
    }, 'custom.isCustomer_pnavrotskyi = TRUE AND creationDate > {0} AND creationDate < {1}', startDate, endDate);


    csvStreamWriter.close();

    if (emailRegexp.test(email)) {
        dw.system.HookMgr.callHook('exportCustomers.email', 'send', [email, link]);
    } else {
        const Logger = require('dw/system/Logger');
        Logger.getLogger('export_customers').error('Invalid email');
    }
}

module.exports = {
    exportCustomers: exportCustomers
};
