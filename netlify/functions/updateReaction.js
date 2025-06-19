const Airtable = require("airtable");
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

exports.handler = async function (event) {
  try {
    const { recordId, reactionType } = JSON.parse(event.body);

    const record = await base("Letters").find(recordId);
    const currentCount = record.fields[`${reactionType} Count`] || 0;

    await base("Letters").update([
      {
        id: recordId,
        fields: {
          [`${reactionType} Count`]: currentCount + 1,
        },
      },
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Reaction count updated." }),
    };
  } catch (error) {
    console.error("Update error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
