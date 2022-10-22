const utils = require('./utils')

const attribute = 'Type of publication';
const yLabel = 'Type';
const xLabel = 'Cnt';
const outputFileName = 'typeCounts.csv';

(async () => {
    utils.createCsvForVariableCount({
        attribute,
        yLabel,
        xLabel,
        outputFileName,
    });
})();