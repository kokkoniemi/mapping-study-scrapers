const fs = require("fs");
const utils = require("./utils");

const outputFileName = "eligiblePapers.csv";

const results = [];

const insertToResults = async (record) => {
  const getOption = async (title, separator = "") =>
    (await utils.getMappingOptions(title, record))
      .map((a) => a.title)
      .join(separator);

  results.push({
    Id: record.id,
    Url: record.url,
    Year: await getOption("Publication year"),
    Title: `"${record.title}"`,
    Type: await getOption("Type of publication"),
    Forum: await getOption("Publication forum"),
    Locations: await getOption("Geographic location of authors", " | "),
    Methods: await getOption("Research methods", " | "),
    Domains: await getOption("Group work domains", " | "),
    Frameworks: await getOption("Theoretical frameworks used", " | "),
    Context: await getOption("Context of education or study", " | "),
  });
};

(async () => {
  await utils.iterateRecordsWith(insertToResults);
  const columns = [
    "Id",
    "Url",
    "Year",
    "Title",
    "Type",
    "Forum",
    "Locations",
    "Methods",
    "Domains",
    "Frameworks",
    "Context",
  ];

  // create output string
  let output = `${columns.join(";")}\r\n`;
  for (const record of results) {
    output += `${columns.map((c) => record[c]).join(";")}\r\n`;
  }

  // write csv file
  fs.writeFile(outputFileName, output, "utf8", function (err) {
    if (err) {
      return console.log(err);
    }
  });
})();
