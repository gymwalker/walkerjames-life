const Airtable = require("airtable");

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base("appaA8MFWiiWjXwSQ");
const tableName = "Letters";

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // List all records
    if (event.httpMethod === "GET" && event.queryStringParameters.list === "true") {
      const records = await base(tableName).select({}).all();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ records: records.map((r) => ({ id: r.id, fields: r.fields })) })
      };
    }

    // Get a specific record
    if (event.httpMethod === "GET" && event.queryStringParameters.recordId) {
      const record = await base(tableName).find(event.queryStringParameters.recordId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ id: record.id, fields: record.fields })
      };
    }

    // Update a record
    if (event.httpMethod === "PATCH") {
      const { recordId, fields } = JSON.parse(event.body);
      const updated = await base(tableName).update(recordId, fields);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ id: updated.id, fields: updated.fields })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
