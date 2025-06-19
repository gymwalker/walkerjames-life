// postReaction.js (validated version with correct field names)

const Airtable = require("airtable");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  const { recordId, reactions } = JSON.parse(event.body || '{}');

  if (!recordId || !reactions) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing recordId or reactions" })
    };
  }

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

  try {
    const fieldsToUpdate = {};
    for (const key in reactions) {
      const count = reactions[key];
      if (typeof count === 'number') {
        fieldsToUpdate[key] = count;
      }
    }

    console.log("📤 Updating record", recordId, fieldsToUpdate);

    const updated = await base("Letters").update(recordId, {
      ...fieldsToUpdate
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Record updated successfully", updated })
    };
  } catch (err) {
    console.error("❌ Failed to update record:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to update record", details: err.message })
    };
  }
};
