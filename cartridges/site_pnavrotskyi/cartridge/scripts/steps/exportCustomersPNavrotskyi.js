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
    const firstName = profile.firstName;
    const lastName = profile.lastName;
    const email = profile.email;
    const creationDate = profile.creationDate;
    csvStreamWriter.writeNext([firstName, lastName, email, creationDate]);
};

function sendFileToEmail(emails, csvURL) {
    const emailHelpers = require('*/cartridge/scripts/helpers/emailHelpers');
    const emailList = emails.split(',').map(function (str) { return str.trim() });

    emailList.forEach(function (email, index) {
        if (emailHelpers.validateEmail(email)) {
            const emailParams = {
                to: email,
                subject: 'Customers of site_pnavrotskyi'
            };
            emailHelpers.send(emailParams, 'exportCustomers/listemail', { csvURL: csvURL });
        } else {
            const Logger = require('dw/system/Logger');
            Logger.getLogger('export_customers').error('Invalid email number ' + index);
        }
    });
};

function transferToFTP(file, fileName) {
    const ftp = new dw.net.FTPClient();
    ftp.setTimeout(10000);
    ftp.connect("ftp.dlptest.com", "dlpuser", "rNrKYTX9g7z3RgJRmxWuGHbeu");
    const result = ftp.putBinary('/' + fileName, file);
    ftp.disconnect();
    if(result) {
        file.remove()
    }
}



function exportCustomers(parameters) {
    const startDate = parameters.startDate || 0;
    const endDate = parameters.endDate || new Date();

    const fileName = Date.now() + '_customersPNavrotskyi.csv';

    const file = new File('/IMPEX/src/ExportCustomers/' + fileName);
    const csvURL = 'https://' + System.getInstanceHostname() + '/on/demandware.servlet/webdav/Sites' + file.getFullPath();
    const fileWriter = new FileWriter(file);
    let csvStreamWriter = new CSVStreamWriter(fileWriter);
    csvStreamWriter.writeNext(['First Name', 'Last Name', 'Email', 'Creation Date']);

    CustomerMgr.processProfiles(function (profile) {
        processProfile(profile, csvStreamWriter);
    }, 'custom.isCustomer_pnavrotskyi = TRUE AND creationDate > {0} AND creationDate < {1}', startDate, endDate);


    csvStreamWriter.close();

    // transferToFTP(file, fileName); // I found free FTP test server, where you can upload files for 10 minutes. Therefore I choose deprecated FTP rather than SFTP

    sendFileToEmail(parameters.email, csvURL)

}

module.exports = {
    exportCustomers: exportCustomers
};
