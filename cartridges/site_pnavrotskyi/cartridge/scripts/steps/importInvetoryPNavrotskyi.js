/* eslint-disable no-continue */
'use strict';

var CustomerMgr = require('dw/customer/CustomerMgr');
var File = require('dw/io/File');
var System = require('dw/system/System');
var Logger = require('dw/system/Logger');
var URLUtils = require('dw/web/URLUtils');
var FileWriter = require('dw/io/FileWriter');
var FileReader = require('dw/io/FileReader');
var CSVStreamReader = require('dw/io/CSVStreamReader');
var XMLStreamWriter = require('dw/io/XMLStreamWriter');
var XMLIndentingStreamWriter = require('dw/io/XMLIndentingStreamWriter');


/**
* @function exportCustomers
* @description This script filtered customers and export them into .csv file.
*
* @param {Object} parameters Represents the parameters defined in the steptypes.json file
*/

function openInventoryList(xsw, lisId) {
    xsw.writeStartElement('inventory-list');
    xsw.getNewLine();
        xsw.writeStartElement('header');
            xsw.writeAttribute('list-id', lisId);

            xsw.writeStartElement('default-instock');
                xsw.writeCharacters('false');
            xsw.writeEndElement();

            xsw.writeStartElement('description');
                xsw.writeCharacters('Product Sku inventory');
            xsw.writeEndElement();

            xsw.writeStartElement('use-bundle-inventory-only');
                xsw.writeCharacters('false');
            xsw.writeEndElement();

            xsw.writeStartElement('on-order');
                xsw.writeCharacters('false');
            xsw.writeEndElement();
        xsw.writeEndElement();

        xsw.writeStartElement('records');
}

function closeInvenoryList(xsw) {
    xsw.writeEndElement();
    xsw.writeEndElement();
}

function createRecord(xsw, productId, allocation) {
    xsw.writeStartElement('record');
    xsw.writeAttribute('product-id', productId);
            xsw.writeStartElement('allocation');
            xsw.writeCharacters(allocation);
            xsw.writeEndElement();
            xsw.writeStartElement('perpetual');
            xsw.writeCharacters('false');
            xsw.writeEndElement();
        xsw.writeEndElement();
}

function importInvetory(parameters) {
    var regExp = new RegExp(parameters.FileNamePattern);
    var paramsPath = parameters.SourceFolderPath || '';
    if (paramsPath) {
        paramsPath = paramsPath.split('\\').join(File.SEPARATOR); // if someone by mistake entered wrong slash
        paramsPath = paramsPath.split('/').join(File.SEPARATOR) + File.SEPARATOR;
    }
    var sourceFolderPath = File.IMPEX + File.SEPARATOR + 'src' + File.SEPARATOR + paramsPath;
    var prefix = parameters.Prefix + '_';
    var sourceFileName;

    var sourceFolder = new File(sourceFolderPath);
    var filesList = sourceFolder.listFiles();

    for (var i = 0; i < filesList.length; i++) {
        if (regExp.test(filesList[i].name)) {
            sourceFileName = filesList[i].name;
            break;
        }
    }

    if (!sourceFileName) return;


    var fileseparator = ',';
    var sourceFilePath = sourceFolderPath + sourceFileName;
    var sourceFile = new File(sourceFilePath);
    var fileReader = new FileReader(sourceFile, 'UTF-8');
    var csr = new CSVStreamReader(fileReader, fileseparator);

    var listFileName = 'inventoryListPNavrotskyi.xml';
    var listFilePath = File.IMPEX + File.SEPARATOR + 'src' + File.SEPARATOR + 'inventoryPNavrotskyi' + File.SEPARATOR + listFileName;
    var listFile = new File(listFilePath);
    var fileWriter = new FileWriter(listFile, 'UTF-8');
    var xsw = new XMLIndentingStreamWriter(fileWriter);

    xsw.setIndent('    ');
    xsw.writeStartDocument();
    xsw.getNewLine();
    xsw.writeStartElement('inventory');
    xsw.writeAttribute('xmlns', 'http://www.demandware.com/xml/impex/inventory/2007-05-31');
    xsw.getNewLine();

    var listCount = 0;
    var row = csr.readNext();
    while (row) {
        if (row.some(function (el) { return isNaN(+el); })) continue;
        var listNumber = +row[0];
        var producId = +row[1];
        var allocation = +row[2];

        if (listCount === 0) {
            openInventoryList(xsw, prefix + listNumber);
            listCount++;
        }

        if (listNumber !== listCount) {
            closeInvenoryList(xsw);
            openInventoryList(xsw, prefix + listNumber);
        }

        createRecord(xsw, producId, allocation);

        row = csr.readNext();
    }
    closeInvenoryList(xsw);
    xsw.writeEndElement();
    xsw.writeEndDocument();

    csr.close();
    xsw.close();
    fileReader.close();
    fileWriter.close();
    // sourceFile.remove();
}

module.exports = {
    importInvetory: importInvetory
};
