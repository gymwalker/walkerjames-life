const fetch = require('node-fetch');

// Airtable credentials and constants
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY; // Make sure this is defined in Netlify
const BASE_ID = "appaA8MFWiiWjXwSQ";
const TABLE_NAME = "Letters";
const airtableURL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

exports.handler = async function(event) {
  try {
    const data = JSON.parse(event.body);
    const { letterId, hearts = 0, prayers = 0, brokenHearts = 0, views = 0 } = data;

    console.log("📨 Incoming update payload:", data);

    if (!AIRTABLE_API_KEY) {
      throw new Error("❌ AIRTABLE_API_KEY is not set in environment variables");
    }

    // Step 1: Find the record using Letter ID (search by {Letter ID} field)
    const filterFormula = `AND({Letter ID} = "${letterId}")`;
    const searchURL = `${airtableURL}?filterByFormula=${encodeURIComponent(filterFormula)}`;

    console.log("🔍 Searching Airtable with formula:", filterFormula);

    const searchRes = await fetch(searchURL, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const searchJson = await searchRes.json();

    if (!searchRes.ok) {
      console.error("🛑 Airtable search failed:", searchJson);
      return {
        statusCode: searchRes.status,
        body: JSON.stringify({ error: "Airtable search failed", details: searchJson })
      };
    }

    const record = searchJson.records[0];
    if (!record) {
      console.error("🚫 No matching record found for Letter ID:", letterId);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Record not found" })
      };
    }

    const recordId = record.id;
    const current = record.fields;

    console.log("✅ Found record:", recordId);
    console.log("🔢 Current values from Airtable:", current);

    // Step 2: Build update payload
    const updatedFields = {
      "Hearts Count": (current["Hearts Count"] || 0) + hearts,
      "Prayer Count": (current["Prayer Count"] || 0) + prayers,
      "Broken Hearts Count": (current["Broken Hearts Count"] || 0) + brokenHearts,
      "View Count": (current["View Count"] || 0) + views
    };

    console.log("🛠 New values to update:", updatedFields);

    const updateRes = await fetch(`${airtableURL}/${recordId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields: updatedFields })
    });

    const updateJson = await updateRes.json();

    if (!updateRes.ok) {
      console.error("❌ Airtable update failed:", updateJson);
      return {
        statusCode: updateRes.status,
        body: JSON.stringify({ error: "Airtable update failed", details: updateJson })
      };
    }

    console.log("✅ Airtable update successful:", updateJson);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, recordId })
    };

  } catch (err) {
    console.error("🔥 Error in updateReaction.js:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message })
    };
  }
};
