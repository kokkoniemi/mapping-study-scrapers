const db = require("../models");
const fs = require('fs');
const utils = require('./utils')

const yAttribute = 'Type of publication';
const yLabel = 'Type';
const xLabel = 'Cnt';
const outputFile = 'typeCounts.csv';

(async () => {
    // create array of objects for types
    const yOptions = await utils.getMappingOptions(yAttribute);
    const yData = yOptions.map(({title}) => ({
        title,
        count: 0,
    }))

    // populate array with counts
    await utils.iterateRecordsWith(async (record) => {
        const yOptions = await utils.getMappingOptions(yAttribute, record);
        yOptions.forEach((y) => {
            const index = yData.findIndex(item => item.title === y.title);
            yData[index].count += 1;
        })
    })

    // order array by count
    yData.sort((a, b) => b.count - a.count)
    
    // create csv string
    let output = `${yLabel};${xLabel}\r\n`
    yData.forEach((y) => {
        output += `${y.title};${y.count}\r\n`
    })

    // write csv file
    fs.writeFile(outputFile, output, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
})();