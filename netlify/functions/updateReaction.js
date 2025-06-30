const airtableURL = process.env.AIRTABLE_URL;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;

exports.handler = async function(event, context) {
  console.log("📡 Received request to update Airtable");
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "https://walkerjames.life",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST",
      },      
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
    console.log("📦 Payload received:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Failed to parse request body:", err);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "https://walkerjames.life",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST",
      },      
      body: JSON.stringify({ error: "Invalid JSON" }),
    };
  }

  const { letterID, hearts, prayers, brokenHearts, views } = data;

  if (!letterID) {
    console.error("❌ Missing letterID in request");
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "https://walkerjames.life",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST",
      },      
      body: JSON.stringify({ error: "Missing letterID" }),
    };
  }

  console.log("🔍 Looking up record in Airtable...");
  const searchParams = new URLSearchParams({
    filterByFormula: `{Letter ID}="${letterID}"`,
  });

  const searchURL = `${airtableURL}?${searchParams.toString()}`;
  console.log("🔎 Airtable search URL:", searchURL);

  const searchRes = await fetch(searchURL, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
  });

  const searchJson = await searchRes.json();
  console.log("🔍 Airtable search result:", JSON.stringify(searchJson, null, 2));

  if (!searchRes.ok || !searchJson.records || searchJson.records.length === 0) {
    console.error("❌ No matching record found in Airtable");
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "https://walkerjames.life",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST",
      },      
      body: JSON.stringify({ error: "Record not found" }),
    };
  }

  const recordId = searchJson.records[0].id;
  const current = searchJson.records[0].fields;

  const updatedFields = {};

  if (typeof hearts === "number") {
    updatedFields["Heart Count"] = (current["Heart Count"] || 0) + hearts;
  }

  if (typeof prayers === "number") {
    updatedFields["Prayer Count"] = (current["Prayer Count"] || 0) + prayers;
  }

  if (typeof brokenHearts === "number") {
    updatedFields["Broken Hearts Count"] = (current["Broken Hearts Count"] || 0) + brokenHearts;
  }

  if (typeof views === "number") {
    updatedFields["View Count"] = (current["View Count"] || 0) + views;
  }

  console.log("🛠️ New values to update:", updatedFields);
  console.log("PATCHing to:", airtableURL + "/" + recordId);
  console.log("Payload:", JSON.stringify({ fields: updatedFields }, null, 2));

  const updateRes = await fetch(`${airtableURL}/${recordId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields: updatedFields })
  });

  const updateJson = await updateRes.json();
  console.log("PATCH response body:", JSON.stringify(updateJson, null, 2));

  if (!updateRes.ok) {
    console.error("❌ Airtable update failed:", updateJson);
    return {
      statusCode: updateRes.status,
      headers: {
        "Access-Control-Allow-Origin": "https://walkerjames.life",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST",
      },      
      body: JSON.stringify({ error: "Airtable update failed", details: updateJson })
    };
  }

  console.log("✅ Airtable update successful!");
  return {
    statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://walkerjames.life",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST",
      },      
    body: JSON.stringify({ success: true, recordId, updatedFields }),
  };
};
