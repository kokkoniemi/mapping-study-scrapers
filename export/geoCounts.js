const utils = require('./utils')

const xVariable = 'Type of publication';
const yVariable = 'Geographic location of authors';
const yLabel = 'Location';
const outputFileName = 'geoCounts.csv';

(async () => {
    await utils.createCsvForTwoVariables({
        xVariable,
        yVariable,
        yLabel,
        outputFileName,
        sort: utils.SORT_BY_VOLUME
    });
})();
