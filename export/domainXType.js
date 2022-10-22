const utils = require('./utils')

const xVariable = 'Type of publication';
const yVariable = 'Group work domains';
const yLabel = 'Domain';
const outputFileName = 'domainXType.csv';

(async () => {
    await utils.createCsvForTwoVariables({
        xVariable,
        yVariable,
        yLabel,
        outputFileName
    });
})();
