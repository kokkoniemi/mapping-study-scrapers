const utils = require('./utils')

const xVariable = 'Publication year';
const yVariable = 'Type of publication';
const yLabel = 'Type';
const outputFileName = 'yearCounts2.csv';

(async () => {
    await utils.createCsvForTwoVariables({
        xVariable,
        yVariable,
        yLabel,
        outputFileName
    });
})();
