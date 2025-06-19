// getLetters.js

const Airtable = require("airtable");

exports.handler = async function () {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

  try {
    const records = await base("Letters")
      .select({
        view: "Grid view",
        filterByFormula: `AND({Approval Status} = "Approved", OR({Share Publicly} = "Yes, share publicly (first name only)", {Share Publicly} = "Yes, but anonymously"))`
      })
      .all();

    const letters = records.map(record => ({
      id: record.id,
      ...record.fields
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(letters)
    };
  } catch (error) {
    console.error("❌ Error in getLetters.js:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch letters", details: error.message })
    };
  }
};
