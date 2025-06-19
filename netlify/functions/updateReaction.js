const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

exports.handler = async (event) => {
  try {
    const records = await base("Letters")
      .select({
        filterByFormula: `AND(
          OR({Share Publicly} = "Yes, share publicly (first name only)", {Share Publicly} = "Yes, but anonymously"),
          {Approval Status} = "Approved"
        )`,
        sort: [{ field: "Date", direction: "desc" }],
      })
      .all();

    const output = records.map((r) => ({
      id: r.id,
      fields: r.fields,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ records: output }),
    };
  } catch (err) {
    console.error("Airtable fetch failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to retrieve records" }),
    };
  }
};
