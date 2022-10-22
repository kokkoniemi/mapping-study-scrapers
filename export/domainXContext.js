const utils = require('./utils')

const xVariable = 'Context of education or study';
const yVariable = 'Group work domains';
const yLabel = 'Domain';
const outputFileName = 'domainXContext.csv';

(async () => {
    await utils.createCsvForTwoVariables({
        xVariable,
        yVariable,
        yLabel,
        outputFileName
    });
})();
