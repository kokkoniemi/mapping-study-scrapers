const utils = require('./utils')

const xVariable = 'Publication year';
const yVariable = 'Group work domains';
const xLabel = 'Year';
const yLabel = 'Domain';
const outputFileName = 'domainXYear.csv';

(async () => {
    await utils.createCsvForTwoVariablesCount({
        xVariable,
        yVariable,
        yLabel,
        xLabel,
        outputFileName
    });
})();
