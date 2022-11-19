/* eslint-disable require-jsdoc */
/* eslint-disable no-continue */
'use strict';

var File = require('dw/io/File');
var system = require('dw/system');
var Logger = require('dw/system/Logger');
var FileWriter = require('dw/io/FileWriter');
var FileReader = require('dw/io/FileReader');
var ProductMgr = require('dw/catalog/ProductMgr');
var CSVStreamReader = require('dw/io/CSVStreamReader');
var XMLIndentingStreamWriter = require('dw/io/XMLIndentingStreamWriter');

const DirectoryNotFoundError = 'DirectoryNotFoundError';
const DirectoryIsEmptyError = 'DirectoryIsEmptyError';
const FileNotFoundError = 'FileNotFoundError';

function getFile(sourceFolderPath, regExp) {
    var sourceFolder = new File(sourceFolderPath);
    var filesList = sourceFolder.listFiles();
    var sourceFileName;

    if (!filesList) {
        throw DirectoryNotFoundError;
    }

    if (!filesList.length) {
        throw DirectoryIsEmptyError;
    }

    for (var i = 0; i < filesList.length; i++) {
        if (regExp.test(filesList[i].name)) {
            sourceFileName = filesList[i].name;
            break;
        }
    }

    if (!sourceFileName) {
        throw FileNotFoundError;
    }

    var sourceFilePath = sourceFolderPath + sourceFileName;
    var sourceFile = new File(sourceFilePath);
    return sourceFile;
}

function startInvetoryList(xsw, lisId) {
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

function endInvetoryList(xsw) {
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

function startDocument(xsw) {
    xsw.setIndent('    ');
    xsw.writeStartDocument();
    xsw.getNewLine();
    xsw.writeStartElement('inventory');
    xsw.writeAttribute('xmlns', 'http://www.demandware.com/xml/impex/inventory/2007-05-31');
    xsw.getNewLine();
}

function endDocument(xsw) {
    endInvetoryList(xsw);
    xsw.writeEndElement();
    xsw.writeEndDocument();
}

function importInvetory(parameters) {
    try {
        var regExp = new RegExp(parameters.FileNamePattern);
        var paramsPath = parameters.SourceFolderPath || '';
        if (paramsPath) {
            paramsPath = paramsPath.split('\\').join(File.SEPARATOR); // if someone by mistake entered wrong slash
            paramsPath = paramsPath.split('/').join(File.SEPARATOR) + File.SEPARATOR;
        }
        var sourceFolderPath = File.IMPEX + File.SEPARATOR + 'src' + File.SEPARATOR + paramsPath;
        var prefix = parameters.Prefix + '_';
        var sourceFile = getFile(sourceFolderPath, regExp);

        var fileseparator = ',';
        var fileReader = new FileReader(sourceFile, 'UTF-8');
        var csr = new CSVStreamReader(fileReader, fileseparator);

        var listFileName = 'inventoryListPNavrotskyi.xml';
        var listFilePath = File.IMPEX + File.SEPARATOR + 'src' + File.SEPARATOR + 'inventoryPNavrotskyi' + File.SEPARATOR + listFileName;
        var listFile = new File(listFilePath);
        var fileWriter = new FileWriter(listFile, 'UTF-8');
        var xsw = new XMLIndentingStreamWriter(fileWriter);

        startDocument(xsw);

        var listCount = 0;
        var row = csr.readNext();
        while (row) {
            if (row.some(function (el) { return isNaN(+el); })) {
                row = csr.readNext();
                continue;
            }

            var listNumber = +row[0];
            var productId = row[1];
            var allocation = row[2];

            if (!ProductMgr.getProduct(productId)) {
                row = csr.readNext();
                continue;
            }

            if (listCount === 0) {
                startInvetoryList(xsw, prefix + listNumber);
                listCount = listNumber;
            }

            if (listNumber !== listCount) {
                endInvetoryList(xsw);
                startInvetoryList(xsw, prefix + listNumber);
                listCount++;
            }

            createRecord(xsw, productId, allocation);

            row = csr.readNext();
        }

        endDocument(xsw);

        csr.close();
        xsw.close();
        fileReader.close();
        fileWriter.close();
        // sourceFile.remove();
    } catch (error) {
        if (error === DirectoryNotFoundError) {
            return new system.Status(system.Status.ERROR, null,'Provided directory not found!');
        }
        if (error === DirectoryNotFoundError) {
            return new system.Status(system.Status.ERROR, null,'Provided directory not found!');
        }
        if (error === DirectoryNotFoundError) {
            return new system.Status(system.Status.ERROR, null,'Provided directory not found!');
        }
        return new system.Status(system.Status.ERROR, null, error.message);
    }
}

module.exports = {
    importInvetory: importInvetory
};
