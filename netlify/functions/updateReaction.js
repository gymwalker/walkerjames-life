const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { recordId, reactions } = JSON.parse(event.body || '{}');

    if (!recordId || typeof reactions !== 'object') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing or invalid recordId or reactions object' }),
      };
    }

    const updates = {};
    for (const [key, increment] of Object.entries(reactions)) {
      updates[key] = increment; // Airtable will treat this as an override unless you fetch current value and add
    }

    await base('Letters').update(recordId, updates);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error', details: err.message }),
    };
  }
};
