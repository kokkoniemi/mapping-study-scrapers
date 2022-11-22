const fs = require('fs');
const utils = require('./utils')

const outputFileName = 'forumNames.csv';

const forumNameMap = {}

const setForumNameToMap = async (record) => {
    const abbreviation = (await utils.getMappingOptions('Forum abbreviation', record)).map(a => a.title).join('');
    const title = (await utils.getMappingOptions('Publication forum', record)).map(t => t.title).join('');

    if (forumNameMap[abbreviation]) {
        return
    }

    forumNameMap[abbreviation] = title
}

(async () => {
    await utils.iterateRecordsWith(setForumNameToMap);

    // create output string
    let output = 'Abbreviation;Title\r\n';
    for (const [abbr, title] of Object.entries(forumNameMap)) {
        output += `${utils.sanitize(abbr)};${utils.sanitize(title)}\r\n`
    }
    
    // write csv file
    fs.writeFile(outputFileName, output, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
})();
