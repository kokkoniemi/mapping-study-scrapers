const utils = require('./utils')

const attribute = 'Group work domains';
const yLabel = 'Domain';
const xLabel = 'Cnt';
const outputFileName = 'domainCounts.csv';

(async () => {
    utils.createCsvForVariableCount({
        attribute,
        yLabel,
        xLabel,
        outputFileName,
    });
})();