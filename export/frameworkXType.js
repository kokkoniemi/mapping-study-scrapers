const utils = require('./utils')

const xVariable = 'Type of publication';
const yVariable = 'Theoretical frameworks used';
const yLabel = 'Framework';
const outputFileName = 'frameworkXType.csv';

(async () => {
    await utils.createCsvForTwoVariables({
        xVariable,
        yVariable,
        yLabel,
        outputFileName
    });
})();
