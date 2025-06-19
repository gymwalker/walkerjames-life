// postReaction.js

const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base('appaA8MFWiiWjXwSQ'); // ✅ CORRECT BASE ID

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { recordId, reactions } = JSON.parse(event.body);

    if (!recordId || typeof reactions !== 'object') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing recordId or reactions object' })
      };
    }

    // Fetch current record
    const currentRecord = await base('Letters').find(recordId);
    const updatedFields = {};

    // Dynamically increment only the fields sent in the request
    for (const [reaction, count] of Object.entries(reactions)) {
      const current = currentRecord.fields[reaction] || 0;
      updatedFields[reaction] = current + count;
    }

    // Apply the updates to Airtable
    await base('Letters').update([
      {
        id: recordId,
        fields: updatedFields
      }
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error('Error updating reactions:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update reactions' })
    };
  }
};
