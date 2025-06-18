const Airtable = require("airtable");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({ error: "Method Not Allowed" })
      };
    }

    const { recordId, reactions } = JSON.parse(event.body);

    if (!recordId || typeof reactions !== "object") {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({ error: "Missing recordId or reactions" })
      };
    }

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE_ID
    );

    // Map fields to ensure numeric updates only
    const updateFields = {};
    for (const [field, increment] of Object.entries(reactions)) {
      if (typeof increment !== "number") continue;
      updateFields[field] = increment;
    }

    const existingRecord = await base("Letters").find(recordId);
    const currentFields = existingRecord.fields;
    const newFields = {};

    for (const [field, increment] of Object.entries(updateFields)) {
      const existing = parseInt(currentFields[field] || 0);
      newFields[field] = existing + increment;
    }

    await base("Letters").update(recordId, newFields);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ success: true, updated: newFields })
    };
  } catch (err) {
    console.error("❌ Error updating reactions:", err);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ error: err.message || "Internal Server Error" })
    };
  }
};
