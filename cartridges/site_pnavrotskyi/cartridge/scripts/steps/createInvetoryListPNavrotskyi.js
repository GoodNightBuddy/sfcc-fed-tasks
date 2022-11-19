/* eslint-disable no-continue */
'use strict';

var File = require('dw/io/File');
var system = require('dw/system');
var FileWriter = require('dw/io/FileWriter');
var FileReader = require('dw/io/FileReader');
var ProductMgr = require('dw/catalog/ProductMgr');
var CSVStreamReader = require('dw/io/CSVStreamReader');
var XMLIndentingStreamWriter = require('dw/io/XMLIndentingStreamWriter');

const DirectoryNotFoundError = 'DirectoryNotFoundError';
const DirectoryIsEmptyError = 'DirectoryIsEmptyError';
const FileNotFoundError = 'FileNotFoundError';

/**
 * Search file in specified directory by provided regular expression
 * @param {String} sourceFolderPath - absolute path to source folder
 * @param {RegExp} regExp - regular expression
 * @returns {dw.io.File} - desired file
 */
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


/**
  * Helper fro custom.CreateInvetoryListPNavrotskyi step
  * Reads source CSV file and writes data into XML file. Checks presence each product in site
*/
var listHelper = {
    /**
     * Creates FileReader and CSVStreamReader and assigned them into this
     *
     * @param {dw.io.File} CSVFile - source file in .csv format
     * @param {string} CSVSeparator - separator for read proccess
     * @returns {void}
    */
    _createCSVStreamReader: function (CSVFile, CSVSeparator) {
        this._fileReader = new FileReader(CSVFile, 'UTF-8');
        this._csr = new CSVStreamReader(this._fileReader, CSVSeparator);
    },

    /**
     * Creates FileWriter and XMLIndentingStreamWriter and assigned them into this
     * @param {dw.io.File} XMLFile - target file .xml format
     * @returns {void}
    */
    _createXMLIndentingStreamWriter: function (XMLFile) {
        this._fileWriter = new FileWriter(XMLFile, 'UTF-8');
        this._xsw = new XMLIndentingStreamWriter(this._fileWriter);
    },

    /**
     * Write opening tags for inventory list
     * @param {number} lisId - id which will be assigned tho the list
     * @returns {void}
    */
    _startInvetoryList: function (lisId) {
        this._xsw.writeStartElement('inventory-list');
        this._xsw.getNewLine();
            this._xsw.writeStartElement('header');
                this._xsw.writeAttribute('list-id', lisId);

                this._xsw.writeStartElement('default-instock');
                    this._xsw.writeCharacters('false');
                this._xsw.writeEndElement();

                this._xsw.writeStartElement('description');
                    this._xsw.writeCharacters('Product Sku inventory');
                this._xsw.writeEndElement();

                this._xsw.writeStartElement('use-bundle-inventory-only');
                    this._xsw.writeCharacters('false');
                this._xsw.writeEndElement();

                this._xsw.writeStartElement('on-order');
                    this._xsw.writeCharacters('false');
                this._xsw.writeEndElement();
            this._xsw.writeEndElement();

            this._xsw.writeStartElement('records');
    },

    /**
     * Write closing tags inventory list
     * @returns {void}
    */
    _endInvetoryList: function () {
        this._xsw.writeEndElement();
        this._xsw.writeEndElement();
    },

    /**
     * Creates inventory record tag and fields with recieved parameters
     * @param {string} productId - id of product
     * @param {string} allocation - allocation of product
     * @returns {void}
    */
    _createRecord: function (productId, allocation) {
        this._xsw.writeStartElement('record');
        this._xsw.writeAttribute('product-id', productId);
                this._xsw.writeStartElement('allocation');
                this._xsw.writeCharacters(allocation);
                this._xsw.writeEndElement();
                this._xsw.writeStartElement('perpetual');
                this._xsw.writeCharacters('false');
                this._xsw.writeEndElement();
            this._xsw.writeEndElement();
    },

    /**
     * Write opening document tags
     * @returns {void}
    */
    _startDocument: function() {
        this._xsw.setIndent('    ');
        this._xsw.writeStartDocument();
        this._xsw.getNewLine();
        this._xsw.writeStartElement('inventory');
        this._xsw.writeAttribute('xmlns', 'http://www.demandware.com/xml/impex/inventory/2007-05-31');
        this._xsw.getNewLine();
    },

    /**
     * Write closing document tags
     * @returns {void}
    */
    _endDocument: function () {
        this._endInvetoryList();
        this._xsw.writeEndElement();
        this._xsw.writeEndDocument();
    },

    /**
     * Read source CSV file and write data into XML file. Checks presence each product in site
     * @param {dw.io.File} CSVFile - source file in csv format
     * @param {dw.io.File} XMLFile - target file .xml format
     * @param {string} CSVSeparator - separator for read proccess
     * @param {string} listPrefix - prefix for list naming
     * @returns {void}
    */
    createList: function (CSVFile, XMLFile, CSVSeparator, listPrefix) {
        this._createCSVStreamReader(CSVFile, CSVSeparator);
        this._createXMLIndentingStreamWriter(XMLFile);

        this._startDocument();
        var listCount = 0;
        var row = this._csr.readNext();
        while (row) {
            if (row.some(function (el) { return isNaN(+el); })) {
                row = this._csr.readNext();
                continue;
            }

            var listNumber = +row[0];
            var productId = row[1];
            var allocation = row[2];

            if (!ProductMgr.getProduct(productId)) {
                row = this._csr.readNext();
                continue;
            }

            if (listCount === 0) {
                this._startInvetoryList(listPrefix + listNumber);
                listCount = listNumber;
            }

            if (listNumber !== listCount) {
                this._endInvetoryList();
                this._startInvetoryList(listPrefix + listNumber);
                listCount++;
            }

            this._createRecord(productId, allocation);

            row = this._csr.readNext();
        }

        this._endDocument();

        this._csr.close();
        this._xsw.close();
        this._fileReader.close();
        this._fileWriter.close();
    }

}

/**
  * Read source CSV file and write data into XML file. Checks presence each product in site
  * @description Recieved sorce CSV and creates target XML files. Transfer data from SCV to XML.
  * @param {parameters} parameters - provided parameters from custom step
  * @returns {void}
*/
function createInvetoryList(parameters) {
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

        var listFileName = 'inventoryListPNavrotskyi.xml';
        var listFilePath = File.IMPEX + File.SEPARATOR + 'src' + File.SEPARATOR + 'inventoryPNavrotskyi' + File.SEPARATOR + listFileName;
        var listFile = new File(listFilePath);

        listHelper.createList(sourceFile, listFile, fileseparator, prefix)
        // sourceFile.remove();
    } catch (error) {
        if (error === DirectoryNotFoundError) {
            return new system.Status(system.Status.ERROR, null,'Provided directory not found!');
        }
        if (error === DirectoryIsEmptyError) {
            return new system.Status(system.Status.ERROR, null,'Provided directory is empty!');
        }
        if (error === FileNotFoundError) {
            return new system.Status(system.Status.ERROR, null,'No such file matches specified regExp in provided directory!');
        }
        return new system.Status(system.Status.ERROR, null, error);
    }
}

module.exports = {
    createInvetoryList: createInvetoryList
};
