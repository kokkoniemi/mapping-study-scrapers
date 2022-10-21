const parse = require('csv-parse/lib/sync')
const fs = require('fs');
const db = require("../models");
const { saveRecord } = require("../helpers");

(async () => {
    const input = fs.readFileSync(__dirname + '/webofscience.csv', 'utf-8');
    let scrape = await db.Import.create({
        database: "webofscience",
        query: '/webofscience.csv',
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
            author: record['Author Full Names'] + " | " + record['Source Title'] + " " + record['Publication Year'] + " " + record['Journal ISO Abbreviation'],
            abstract: record['Abstract'],
            url: record['DOI'] ? `https://doi.org/${record['DOI']}` : record['UT (Unique WOS ID)'],
            alternateUrls: [],
            databases: ["webofscience"]
        }, db, scrape);
    }
    console.log(records);
})();