const fetch = require("node-fetch");

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = "appaA8MFWiiWjXwSQ";
const TABLE_NAME = "Letters";

exports.handler = async function (event) {
  const method = event.httpMethod;

  try {
    if (method === "GET") {
      const { list, recordId } = event.queryStringParameters;

      if (list === "true") {
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
        });
        const data = await response.json();
        return {
          statusCode: 200,
          body: JSON.stringify(data)
        };
      }

      if (recordId) {
        const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
        });
        const data = await response.json();
        return {
          statusCode: 200,
          body: JSON.stringify(data)
        };
      }

      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing 'list' or 'recordId' parameter." })
      };
    }

    if (method === "POST") {
      const { recordId, field } = JSON.parse(event.body);

      if (!recordId || !field) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing recordId or field." })
        };
      }

      // Get current field value
      const getUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
      const getResponse = await fetch(getUrl, {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }
      });
      const record = await getResponse.json();
      const currentValue = record.fields[field] || 0;

      // Patch +1 to the field
      const patchUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`;
      const patchResponse = await fetch(patchUrl, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fields: { [field]: currentValue + 1 }
        })
      });

      const result = await patchResponse.json();
      return {
        statusCode: 200,
        body: JSON.stringify(result)
      };
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
