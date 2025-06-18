const Airtable = require("airtable");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    const { recordId, reactions } = JSON.parse(event.body);

    if (!recordId || typeof reactions !== "object") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing recordId or reactions" }),
      };
    }

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE_ID
    );

    const existingRecord = await base("Letters").find(recordId);
    const currentFields = existingRecord.fields;

    const updateFields = {};
    for (const [field, increment] of Object.entries(reactions)) {
      if (typeof increment !== "number") continue;
      const existing = parseInt(currentFields[field] || 0, 10);
      updateFields[field] = existing + increment;
    }

    await base("Letters").update(recordId, updateFields);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, updated: updateFields }),
    };
  } catch (err) {
    console.error("❌ Error updating reactions:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Internal Server Error" }),
    };
  }
};
