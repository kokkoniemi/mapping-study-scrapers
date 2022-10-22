const fs = require('fs');
const db = require("../models");

const iterateRecordsWith = async (fn) => {
    const countRecords = await db.Record.count();
    for (let i = 0; i < countRecords; i++) {
        const record = await db.Record.findOne({
            offset: i,
        });
        if (record.status !== 'included' || record.deletedAt !== null) {
            continue;
        }
        await fn(record)
    }
}

const getMappingOptions = async (title, record = null) => {
    const question = await db.MappingQuestion.findOne({where: {title}})
    if (record) {
        return await record.getMappingOptions({where: {mappingQuestionId: question.id}})
    }
    return await db.MappingOption.findAll({where: {mappingQuestionId: question.id}})
}

const getDataForTwoVariables = async ({xVariable, yVariable}) => {
    // create empty array of objects for variables
    const yOptions = await getMappingOptions(yVariable);
    const xOptions = await getMappingOptions(xVariable);
    const data = xOptions.map(({title}) => {
        const data = {title};
        yOptions.forEach((item) => {
            data[item.title] = 0;
        })
        return data;
    })

    // populate arrays
    await iterateRecordsWith(async (record) => {
       const yOptions = await getMappingOptions(yVariable, record);
       const xOptions = await getMappingOptions(xVariable, record);
       
       xOptions.forEach((x) => {
        yOptions.forEach((y) => {
            const index = data.findIndex(item => item.title === x.title);
            data[index][y.title] += 1;
        })
       })
    })

    return {data, xOptions, yOptions}
}

const createCsvForTwoVariables = async ({xVariable, yVariable, yLabel, outputFileName}) => {
    const {data, yOptions} = await getDataForTwoVariables({xVariable, yVariable})

    // create csv string
    let output = `${yLabel};${data.map(item => item.title).join(';')}\r\n`;
    yOptions.forEach((y) => {
        output += `${y.title};${data.map(item => item[y.title]).join(';')}\r\n`;
    })

    // write csv file
    fs.writeFile(outputFileName, output, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
}

const createCsvForVariableCount = async ({attribute, yLabel, xLabel, outputFileName}) => {
    // create array of objects for different variable values
    const options = await getMappingOptions(attribute);
    const data = options.map(({title}) => ({
        title,
        count: 0,
    }));

    // populate array with counts
    await iterateRecordsWith(async (record) => {
        const recordOptions = await getMappingOptions(attribute, record);
        recordOptions.forEach((y) => {
            const index = data.findIndex(item => item.title === y.title);
            data[index].count += 1;
        });
    });

    // order array by count
    data.sort((a, b) => b.count - a.count);
    
    // create csv string
    let output = `${yLabel};${xLabel}\r\n`;
    data.filter(item => item.count > 0).forEach((y) => {
        output += `${y.title};${y.count}\r\n`;
    });

    // write csv file
    fs.writeFile(outputFileName, output, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
}

const createCsvForTwoVariablesCount = async ({xVariable, yVariable, xLabel, yLabel, outputFileName}) => {
    // create empty array of objects for variables
    const yOptions = await getMappingOptions(yVariable);
    const xOptions = await getMappingOptions(xVariable);
    const data = yOptions.map(({title}) => {
        const dataItem = {title};
        xOptions.forEach((item) => {
            dataItem[item.title] = 0;
        })
        return dataItem;
    })

    // populate arrays
    await iterateRecordsWith(async (record) => {
       const recordYOptions = await getMappingOptions(yVariable, record);
       const recordXOptions = await getMappingOptions(xVariable, record);
       
       recordYOptions.forEach((y) => {
        const index = data.findIndex(item => item.title === y.title);
        recordXOptions.forEach((x) => {
            data[index][x.title] += 1;
        });
       });
    });

    // filter function for unused attributes
    const hasUnusedAttributes = (dataItem) => {
        for(let x of xOptions) {
            if (dataItem[x.title] > 0) {
                return true;
            }
        }
        return false;
    }

    // create csv string
    let output = `${yLabel};${xLabel};Cnt\r\n`;
    data.filter(hasUnusedAttributes).forEach((item) => {
        for(let x of xOptions) {
            if (item[x.title] > 0) {
                output += `${item.title.replaceAll("&", "\\&")};${x.title.replaceAll("&", "\\&")};${item[x.title]}\r\n`;
            }
        }
    });

    // write csv file
    fs.writeFile(outputFileName, output, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
}

module.exports = {
    iterateRecordsWith,
    getMappingOptions,
    getDataForTwoVariables,
    createCsvForTwoVariables,
    createCsvForVariableCount,
    createCsvForTwoVariablesCount,
}
