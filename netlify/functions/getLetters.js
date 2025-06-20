const Airtable = require("airtable");

exports.handler = async function () {
  console.log("Function started. Checking environment variables...");
  if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
    console.error("Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing Airtable credentials" })
    };
  }

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
  console.log(`Connected to base: ${process.env.AIRTABLE_BASE_ID}`);

  try {
    console.log("Attempting to fetch records from Letters table...");
    const records = await base("Letters")
      .select({
        view: "Grid view",
        filterByFormula: `AND(
          {Approval Status} = "Approved",
          OR(
            {Share Publicly} = "Yes, share publicly (first name only)",
            {Share Publicly} = "Yes, but anonymously"
          )
        )`,
        sort: [{ field: "Date", direction: "desc" }]
      })
      .all();

    console.log(`Fetched ${records.length} records`);
    return {
      statusCode: 200,
      body: JSON.stringify({ records })
    };
  } catch (err) {
    console.error("Error fetching letters:", err.message, err.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch letters", details: err.message })
    };
  }
};
