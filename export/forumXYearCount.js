const utils = require('./utils')

const xVariable = 'Publication year';
const yVariable = 'Forum abbreviation';
const xLabel = 'Year';
const yLabel = 'Forum';
const outputFileName = 'forumXyear.csv';

(async () => {
    await utils.createCsvForTwoVariablesCount({
        xVariable,
        yVariable,
        yLabel,
        xLabel,
        outputFileName
    });
})();
