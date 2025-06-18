const Airtable = require('airtable');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: 'Method Not Allowed'
    };
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: 'OK'
    };
  }

  try {
    const { recordId, reactions } = JSON.parse(event.body || '{}');

    if (!recordId || !reactions || typeof reactions !== 'object') {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing or invalid data' })
      };
    }

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

    // Prepare update object
    const fieldsToUpdate = {};
    for (let key in reactions) {
      if (typeof reactions[key] === 'number') {
        fieldsToUpdate[key] = Airtable.FieldValue.increment(reactions[key]);
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'No valid reaction fields found' })
      };
    }

    await base('Letters').update(recordId, {
      fields: fieldsToUpdate
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Reaction(s) updated successfully' })
    };
  } catch (err) {
    console.error('❌ updateReaction error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Server error', details: err.message })
    };
  }
};
