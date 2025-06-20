const Airtable = require("airtable");

exports.handler = async function (event, context) {
  console.log("DEBUG: Function handler started at", new Date().toISOString());
  console.log("DEBUG: Event received:", JSON.stringify(event, null, 2));
  console.log("DEBUG: Context received:", JSON.stringify(context, null, 2));

  console.log("DEBUG: Checking environment variables...");
  const apiKey = process.env.AIRTABLE_API_KEY;
  console.log("DEBUG: AIRTABLE_API_KEY:", apiKey ? `Found (length: ${apiKey.length}, first 5 chars: ${apiKey.substring(0, 5)}...)` : "Not found");
  const baseId = process.env.AIRTABLE_BASE_ID;
  console.log("DEBUG: AIRTABLE_BASE_ID:", baseId ? `Found (length: ${baseId.length}, first 5 chars: ${baseId.substring(0, 5)}...)` : "Not found");
  const token = process.env.AIRTABLE_TOKEN;
  console.log("DEBUG: AIRTABLE_TOKEN:", token ? `Found (length: ${token.length}, first 5 chars: ${token.substring(0, 5)}...)` : "Not found");

  if (!apiKey || !baseId) {
    console.error("DEBUG: Missing required environment variables:", {
      AIRTABLE_API_KEY: apiKey ? "Present" : "Missing",
      AIRTABLE_BASE_ID: baseId ? "Present" : "Missing"
    });
    return {
      statusCode: 500,
      headers: { 
        "Access-Control-Allow-Origin": "https://walker-james-life.mykaijabi.com",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ error: "Missing Airtable credentials", timestamp: new Date().toISOString() })
    };
  }

  console.log("DEBUG: All required environment variables present. Initializing Airtable...");
  console.log("DEBUG: Airtable base ID:", baseId.substring(0, 5) + "...");
  const base = new Airtable({ apiKey }).base(baseId);

  try {
    console.log("DEBUG: Fetching records from 'Letters' table...");
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
        sort: [{ field: "Submission Date", direction: "desc" }]
      })
      .all();

    console.log("DEBUG: Fetch completed. Records count:", records.length);
    console.log("DEBUG: Sample record (if any):", records.length > 0 ? JSON.stringify(records[0].fields, null, 2) : "No records");
    return {
      statusCode: 200,
      headers: { 
        "Access-Control-Allow-Origin": "https://walker-james-life.mykaijabi.com",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ records, timestamp: new Date().toISOString() })
    };
  } catch (err) {
    console.error("DEBUG: Airtable error occurred at", new Date().toISOString(), ":", {
      message: err.message,
      stack: err.stack,
      code: err.code,
      status: err.status,
      isAuthError: err.message.includes("AUTHENTICATION") || err.code === "UNAUTHORIZED",
      isBaseError: err.message.includes("NOT_FOUND") || err.code === "NOT_FOUND"
    });
    return {
      statusCode: 500,
      headers: { 
        "Access-Control-Allow-Origin": "https://walker-james-life.mykaijabi.com",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ error: "Failed to fetch letters", details: err.message, timestamp: new Date().toISOString() })
    };
  }
};
