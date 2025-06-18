const Airtable = require("airtable");

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "GET") {
      return {
        statusCode: 405,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({ error: "Method Not Allowed" })
      };
    }

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE_ID
    );

    const records = await base("Letters")
      .select({
        view: "Grid view",
        filterByFormula: "AND({Approved} = 'Yes', {Letter ID} != '')",
        sort: [{ field: "Submission Date", direction: "desc" }]
      })
      .all();

    const letters = records.map((record) => {
      const fields = record.fields;
      return {
        id: record.id,
        date: fields["Submission Date"] || "",
        name: fields["First Name"] || "Anonymous",
        letter: fields["Letter Content"] || "",
        moderatorComment: fields["Moderator Comments"] || "",
        reactions: {
          Love: fields["Love Count"] || 0,
          Prayer: fields["Prayer Count"] || 0,
          Broken: fields["Broken Heart Count"] || 0,
          Bible: fields["Bible Shared Count"] || 0
        }
      };
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify(letters)
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
