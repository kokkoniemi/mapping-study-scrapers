const db = require("../models");
const fs = require('fs');

(async () => {
    const countByTitles = {};
    const countRecords = await db.Record.count();
    for (let i = 0; i < countRecords; i++) {
        const record = await db.Record.findOne({
            offset: i,
        });
        const title = record.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
        if (!countByTitles[title]) {
            countByTitles[title] = [];
        }
        countByTitles[title].push(record.id);
    }
    const filteredTitles = {};
    const dubIds = [];
    for (const key in countByTitles) {
        if (countByTitles[key].length > 1) {
            filteredTitles[key] = countByTitles[key];
            for (const id of countByTitles[key]) {
                dubIds.push(id);
            }
        }
    }
    console.log(filteredTitles);
    console.log(dubIds);
    fs.writeFile("dubIds.json", JSON.stringify(dubIds), 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
})();