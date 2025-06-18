const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base('appaA8MFWiiWjXwSQ');

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { recordId, reactions } = JSON.parse(event.body);
      if (!recordId || typeof reactions !== 'object') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing recordId or reactions' }) };
      }

      const record = await base('Letters').find(recordId);
      const current = record.fields;
      const updates = {};

      for (const [field, increment] of Object.entries(reactions)) {
        const currentValue = parseInt(current[field] || 0);
        updates[field] = currentValue + increment;
      }

      await base('Letters').update(recordId, updates);

      return { statusCode: 200, headers, body: JSON.stringify({ success: true, updated: updates }) };
    } catch (err) {
      console.error('Error updating reactions:', err);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Update failed' }) };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method Not Allowed' })
  };
};