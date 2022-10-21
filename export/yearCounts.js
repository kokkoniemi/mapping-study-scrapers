const db = require("../models");
const fs = require('fs');
const utils = require('./utils')

const xAttribute = 'Publication year'
const yAttribute = 'Type of publication'
const yLabel = 'Type'
const outputFile = 'yearCounts2.csv'

(async () => {
    // create array of objects for years with keys for type of publication
    const yOptions = await utils.getMappingOptions(yAttribute)
    const xOptions = await utils.getMappingOptions(xAttribute)
    const xData = xOptions.map(({title}) => {
        const data = {title}
        yOptions.forEach((item) => {
            data[item.title] = 0
        })
        return data
    })

    // populate arrays with counts
    await utils.iterateRecordsWith(async (record) => {
       const yOptions = await utils.getMappingOptions(yAttribute, record)
       const xOptions = await utils.getMappingOptions(xAttribute, record)
       
       xOptions.forEach((x) => {
        yOptions.forEach((y) => {
            const index = xData.findIndex(item => item.title === x.title)
            xData[index][y.title] += 1
        })
       })
    })

    // create csv string
    let output = `${yLabel};${xData.map(item => item.title).join(';')}\r\n`
    yOptions.forEach((y) => {
        output += `${y.title};${xData.map(item => item[y.title]).join(';')}\r\n`
    })

    // write csv file
    fs.writeFile(outputFile, output, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
})();