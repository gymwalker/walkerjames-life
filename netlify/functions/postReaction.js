const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base('appaA8MFWiiWjXwSQ'); // ✅ CORRECT

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
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

    // Fetch current values to increment properly
    const currentRecord = await base('Letters').find(recordId);
    const updatedFields = {};

    for (const [reaction, count] of Object.entries(reactions)) {
      const current = currentRecord.fields[reaction] || 0;
      updatedFields[reaction] = current + count;
    }

    await base('Letters').update([
      {
        id: recordId,
        fields: {
          'View Count': reactions['View Count'] || 0,
          'Prayer Count': reactions['Prayer Count'] || 0,
          'Hearts Count': reactions['Hearts Count'] || 0,
          'Broken Hearts Count': reactions['Broken Hearts Count'] || 0
        }
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
