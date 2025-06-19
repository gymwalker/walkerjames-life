const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base('appaA8MFWiiWjXwSQ');

exports.handler = async function (event) {
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

    const validFields = ['View Count', 'Prayer Count', 'Hearts Count', 'Broken Hearts Count'];
    const currentRecord = await base('Letters').find(recordId);
    const updatedFields = {};

    for (const [reaction, count] of Object.entries(reactions)) {
      if (validFields.includes(reaction)) {
        const current = currentRecord.fields[reaction] || 0;
        updatedFields[reaction] = current + count;
      }
    }

    if (Object.keys(updatedFields).length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No valid reactions to update' })
      };
    }

    await base('Letters').update([{ id: recordId, fields: updatedFields }]);

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
