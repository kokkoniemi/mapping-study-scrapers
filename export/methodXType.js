const utils = require('./utils')

const xVariable = 'Type of publication';
const yVariable = 'Research methods';
const yLabel = 'Method';
const outputFileName = 'methodXType.csv';

(async () => {
    await utils.createCsvForTwoVariables({
        xVariable,
        yVariable,
        yLabel,
        outputFileName,
        sort: utils.SORT_BY_VOLUME,
        capitalize: true,
    });
})();
