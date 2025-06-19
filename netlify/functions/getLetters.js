// getLetters.js (verified version)

const Airtable = require("airtable");

exports.handler = async function (event) {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
  const table = base("Letters");
  const isListMode = event.queryStringParameters && event.queryStringParameters.list === "true";

  try {
    const records = await table.select({
      view: "Grid view"
    }).all();

    const parsed = records.map(record => {
      return {
        id: record.id,
        fields: record.fields
      };
    });

    if (isListMode) {
      return {
        statusCode: 200,
        body: JSON.stringify({ records: parsed })
      };
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify(parsed)
      };
    }
  } catch (err) {
    console.error("❌ Error fetching records:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch letters.", details: err.message })
    };
  }
};
