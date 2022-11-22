const parse = require('csv-parse/lib/sync')
const fs = require('fs');
const db = require("../models");
const { saveRecord } = require("../helpers");

(async () => {
    const input = fs.readFileSync(__dirname + '/snowball-2.csv', 'utf-8');
    let scrape = await db.Import.create({
        database: "snowball-2",
        query: '/snowball-2.csv',
        total: 0,
        dublicates: 0,
        namesakes: []
    });

    const records = parse(input, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ';'
    });

    for (const record of records) {
        await saveRecord({
            title: record['Article Title'],
            author: record['Author Full Names'] + " " + record['Publication Year'] + " " + record['Journal ISO Abbreviation'],
            abstract: record['Abstract'],
            url: `https://doi.org/${record['DOI']}`,
            alternateUrls: [],
            databases: ["snowball-2"]
        }, db, scrape);
    }
    console.log(records);
})();