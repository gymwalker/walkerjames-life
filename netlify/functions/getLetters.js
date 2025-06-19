const Airtable = require("airtable");

exports.handler = async function (event) {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

  try {
    const records = await base("Letters")
      .select({
        view: "Grid view"
      })
      .all();

    return {
      statusCode: 200,
      body: JSON.stringify({
        records: records.map(record => ({
          id: record.id,
          fields: record.fields
        }))
      })
    };
  } catch (err) {
    console.error("❌ Error fetching records:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch records", details: err.message })
    };
  }
};
