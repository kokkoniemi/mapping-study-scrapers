const utils = require('./utils')

const xVariable = 'Group work domains';
const yVariable = 'Theoretical frameworks used';
const xLabel = 'Domain';
const yLabel = 'Framework';
const outputFileName = 'frameworkXDomain.csv';

(async () => {
    await utils.createCsvForTwoVariablesCount({
        xVariable,
        yVariable,
        yLabel,
        xLabel,
        outputFileName
    });
})();
