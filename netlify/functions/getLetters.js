const Airtable = require("airtable");

exports.handler = async (event) => {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE_ID
    );

    const records = await base("Letters")
      .select({
        filterByFormula: "{Approval Status} = 'Approved'",
        sort: [{ field: "Submission Date", direction: "desc" }],
      })
      .all();

    const letters = records.map((record) => {
      const fields = record.fields;
      return {
        id: record.id,
        name: fields.Name || "Anonymous",
        content: fields["Letter Content"] || "",
        comment: fields["Moderator Comment"] || "",
        date: fields["Submission Date"] || null,
        emoji1: fields["Heart Count"] || 0,
        emoji2: fields["Prayer Count"] || 0,
        emoji3: fields["Broken Heart Count"] || 0,
        emoji4: fields["Bible Count"] || 0,
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ letters })
    };
  } catch (err) {
    console.error("❌ Error loading letters:", err);
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
