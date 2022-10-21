const fs = require('fs');
const utils = require('./utils')

const xAttribute = 'Type of publication';
const yAttribute = 'Research methods';
const yLabel = 'Method';
const outputFile = 'methodXType.csv';

(async () => {
    // create array of objects for x and y attribute
    const yOptions = await utils.getMappingOptions(yAttribute);
    const xOptions = await utils.getMappingOptions(xAttribute);
    const xData = xOptions.map(({title}) => {
        const data = {title};
        yOptions.forEach((item) => {
            data[item.title] = 0;
        })
        return data;
    })

    // populate arrays with counts
    await utils.iterateRecordsWith(async (record) => {
       const yOptions = await utils.getMappingOptions(yAttribute, record);
       const xOptions = await utils.getMappingOptions(xAttribute, record);
       
       xOptions.forEach((x) => {
        yOptions.forEach((y) => {
            const index = xData.findIndex(item => item.title === x.title);
            xData[index][y.title] += 1;
        })
       })
    })

    // create csv string
    let output = `${yLabel};${xData.map(item => item.title).join(';')}\r\n`;
    yOptions.forEach((y) => {
        output += `${y.title};${xData.map(item => item[y.title]).join(';')}\r\n`;
    })

    // write csv file
    fs.writeFile(outputFile, output, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
})();
