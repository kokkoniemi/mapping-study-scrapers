const fs = require('fs');
const db = require("../models");

const SORT_BY_VOLUME = 'sortByVolume'

const sanitize = (input, capitalize = false) => {
    if (!isNaN(input)) {
        return +input
    }

    let res = input
    .trim()
    .replaceAll("&", "\\&")
    .replaceAll(/[“”‘’]/g,"'")
    .replace(/\s{2,}/g, ' ')

    if (capitalize) {
        res = res.charAt(0).toUpperCase() + res.toLowerCase().slice(1);
    }

    return res
}

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

const createCsvForTwoVariables = async ({xVariable, yVariable, yLabel, outputFileName, sort = null, capitalize = false}) => {
    const {data, yOptions} = await getDataForTwoVariables({xVariable, yVariable})
    
    // filter function for unused attributes
    const optionIsUsed = (option) => {
        for (let dataItem of data) {
            if (dataItem[option.title] > 0) {
                return true;
            }
        }
        return false;
    }

    const sortOptionByVolume = (a, b) => {
        let aCount = 0;
        let bCount = 0;
        for (const dataItem of data) {
            aCount += dataItem[a.title];
            bCount += dataItem[b.title];
        }

        return bCount - aCount;
    }

    if (sort === SORT_BY_VOLUME) {
        yOptions.sort(sortOptionByVolume)
    }

    // create csv string
    let output = `${sanitize(yLabel)};${data.map(item => sanitize(item.title)).join(';')}\r\n`;
    yOptions.forEach((y) => {
        if (optionIsUsed(y)) {
            output += `${sanitize(y.title, capitalize)};${data.map(item => sanitize(item[y.title], capitalize)).join(';')}\r\n`;
        }
    })

    // write csv file
    fs.writeFile(outputFileName, output, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
}

const createCsvForVariableCount = async ({attribute, yLabel, xLabel, outputFileName, capitalize = false}) => {
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
    let output = `${sanitize(yLabel)};${sanitize(xLabel)}\r\n`;
    data.filter(item => item.count > 0).forEach((y) => {
        output += `${sanitize(y.title, capitalize)};${sanitize(y.count)}\r\n`;
    });

    // write csv file
    fs.writeFile(outputFileName, output, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
}

const createCsvForTwoVariablesCount = async ({xVariable, yVariable, xLabel, yLabel, outputFileName, capitalize}) => {
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

    data.sort((a, b) => `${b.title}`.localeCompare(`${a.title}`))

    // create csv string
    let output = `${sanitize(yLabel)};${sanitize(xLabel)};Cnt\r\n`;
    data.filter(hasUnusedAttributes).forEach((item) => {
        for(let x of xOptions) {
            if (item[x.title] > 0) {
                output += `${sanitize(item.title, capitalize)};${sanitize(x.title, capitalize)};${sanitize(item[x.title], capitalize)}\r\n`;
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
    sanitize,
    SORT_BY_VOLUME
}
