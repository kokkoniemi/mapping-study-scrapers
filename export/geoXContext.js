const fs = require('fs');
const utils = require('./utils');

const xVariable = 'Geographic location of authors';
const yVariable = 'Context of education or study';
const yLabel = 'Continent';
const outputFileName = 'geoXContext.csv';

const getContinentXCountryMapping = () => {
    const continents = {
        Oceania: [
            'Australia',
            'Fiji',
            'New Zealand',
        ],
        Africa: [
            'South Africa',
            'Algeria',
        ],
        'South America': [
            'Chile',
            'Argentina',
            'Brazil',
            'Uruguay',

        ],
        Australia: [],
        Asia: [
            'Japan',
            'China',
            'Hong Kong',
            'India',
            'Taiwan',
            'Malaysia',
            'Israel',
            'South Korea',
            'Qatar',
            'Thailand',
            'Iran',
            'Sri Lanka',
            'Singapore',
            'Pakistan',
            'Vietnam',
            'Saudi Arabia',
            'Indonesia',
        ],
        Europe: [
            'UK',
            'Cyprus',
            'Croatia',
            'Austria',
            'Greece',
            'Belgium',
            'Germany',
            'Finland',
            'Sweden',
            'Spain',
            'Denmark',
            'Ireland',
            'Romania',
            'Slovakia',
            'Netherlands',
            'Portugal',
            'Switzerland',
            'Turkey',
            'Russia',
            'Italy',
            'Norway',
            'Estonia',
            'Poland',
            'France',

        ],
        'North America': [
            'USA',
            'Mexico',
            'Canada',
            'Panama',
            'Barbados',
            'Costa Rica',
            'Cuba',
        ]
    }
    const res = {}

    Object.entries(continents).forEach(([continent, countries]) => {
        countries.forEach(country => {
            res[country] = continent;
        })
    });

    return res;
}


(async () => {
    const continentMap = getContinentXCountryMapping();

    const {data, yOptions} = await utils.getDataForTwoVariables({
        xVariable,
        yVariable,
    });
    const continentData = {};

    data.forEach(country => {
        const continent = continentMap[country.title]

        if (!continentData[continent]) {
            continentData[continent] = {}
        } 

        for(let y of yOptions) {
            if (!continentData[continent][y.title]) {
                continentData[continent][y.title] = 0;
            }
            continentData[continent][y.title] += country[y.title];
        }
    });
    console.log(continentData);

    // create csv string
    let output = `${yLabel};${yOptions.map(item => item.title).join(';')}\r\n`;
    Object.entries(continentData).forEach(([continent, contexts]) => {
        output += `${continent};${yOptions.map(y => contexts[y.title]).join(';')}\r\n`;
    })

    // write csv file
    fs.writeFile(outputFileName, output, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    });
})();
