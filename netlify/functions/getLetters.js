const Airtable = require("airtable");

exports.handler = async function (event, context) {
  console.log("DEBUG: Function handler started. Event:", JSON.stringify(event));
  console.log("DEBUG: Context:", JSON.stringify(context));

  console.log("DEBUG: Checking environment variables...");
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    console.error("DEBUG: Missing environment variables:", {
      AIRTABLE_API_KEY: apiKey ? "Present" : "Missing",
      AIRTABLE_BASE_ID: baseId ? "Present" : "Missing"
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing Airtable credentials" })
    };
  }

  console.log("DEBUG: Environment variables found:", {
    AIRTABLE_API_KEY: `Valid (length: ${apiKey.length}, first 5 chars: ${apiKey.substring(0, 5)}...)`,
    AIRTABLE_BASE_ID: `Valid (length: ${baseId.length}, first 5 chars: ${baseId.substring(0, 5)}...)`
  });

  console.log("DEBUG: Initializing Airtable base with baseId:", baseId.substring(0, 5) + "...");
  const base = new Airtable({ apiKey }).base(baseId);

  try {
    console.log("DEBUG: Attempting to fetch records from 'Letters' table...");
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

    console.log("DEBUG: Successfully fetched records. Count:", records.length);
    return {
      statusCode: 200,
      body: JSON.stringify({ records })
    };
  } catch (err) {
    console.error("DEBUG: Airtable error occurred:", {
      message: err.message,
      stack: err.stack,
      code: err.code,
      status: err.status,
      isAuthError: err.message.includes("AUTHENTICATION") || err.code === "UNAUTHORIZED",
      isBaseError: err.message.includes("NOT_FOUND") || err.code === "NOT_FOUND"
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch letters", details: err.message })
    };
  }
};
