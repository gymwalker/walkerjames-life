const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base("pat0rNlezikkjBKM4.1e9161d0ad2f7c619af8d74ad1982f2aa752fdd90b6a768687912a40b41751a8");
const table = base("Letters");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    const { recordId, emoji } = JSON.parse(event.body);

    if (!recordId || !emoji) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing recordId or emoji field" }),
      };
    }

    // Get the current record
    const record = await table.find(recordId);
    const currentCount = record.get(emoji) || 0;

    // Update the field
    const updatedRecord = await table.update(recordId, {
      [emoji]: currentCount + 1,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, updated: updatedRecord.fields }),
    };

  } catch (error) {
    console.error("Error updating reaction:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  }
};
