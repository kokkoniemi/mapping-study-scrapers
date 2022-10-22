const utils = require('./utils')

const xVariable = 'Publication year';
const yVariable = 'Theoretical frameworks used';
const xLabel = 'Year';
const yLabel = 'Framework';
const outputFileName = 'frameworkXYear.csv';

(async () => {
    await utils.createCsvForTwoVariablesCount({
        xVariable,
        yVariable,
        yLabel,
        xLabel,
        outputFileName
    });
})();
