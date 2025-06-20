const Airtable = require("airtable");

exports.handler = async function (event) {
  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing Airtable credentials" })
    };
  }

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
  const { recordId, reactions } = JSON.parse(event.body);

  try {
    const record = await base("Letters").find(recordId);
    const updates = {};
    for (const [key, value] of Object.entries(reactions)) {
      updates[key] = (record.fields[key] || 0) + value;
    }
    await base("Letters").update(recordId, updates);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error("❌ Failed to update reactions:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update reactions", details: err.message })
    };
  }
};
