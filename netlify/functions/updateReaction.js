const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const { recordId, reactionType } = JSON.parse(event.body);

    const fieldMap = {
      Love: "Love Count",
      Prayer: "Prayer Count",
      Broken: "Broken Heart Count",
      Read: "Read/View Count",
    };

    const field = fieldMap[reactionType];
    if (!field) {
      return {
        statusCode: 400,
        body: "Invalid reaction type",
      };
    }

    // Fetch current value
    const record = await base("Letters").find(recordId);
    const currentCount = record.fields[field] || 0;

    // Update count
    await base("Letters").update(recordId, {
      [field]: currentCount + 1,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Reaction updated" }),
    };
  } catch (err) {
    console.error("Update error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
