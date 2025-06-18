const Airtable = require("airtable");

exports.handler = async () => {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE_ID
    );

    const records = await base("Letters")
      .select({ filterByFormula: `Approved = TRUE()` })
      .all();

    const letters = records.map((record) => ({
      id: record.id,
      ...record.fields,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(letters),
    };
  } catch (err) {
    console.error("❌ Error fetching letters:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Failed to fetch letters" }),
    };
  }
};
