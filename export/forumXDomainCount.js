const utils = require('./utils')

const xVariable = 'Group work domains';
const yVariable = 'Forum abbreviation';
const xLabel = 'Domain';
const yLabel = 'Forum';
const outputFileName = 'forumXdomain.csv';

(async () => {
    await utils.createCsvForTwoVariablesCount({
        xVariable,
        yVariable,
        yLabel,
        xLabel,
        outputFileName
    });
})();
