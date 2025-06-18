const fetch = require('node-fetch');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const { recordId, reactions } = JSON.parse(event.body || '{}');

    if (!recordId || typeof reactions !== 'object') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid payload structure' })
      };
    }

    const fieldsToUpdate = {};
    for (const [key, value] of Object.entries(reactions)) {
      fieldsToUpdate[key] = { increment: value };
    }

    const airtableRes = await fetch('https://api.airtable.com/v0/appaA8MFWiiWjXwSQ/Letters', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [
          {
            id: recordId,
            fields: fieldsToUpdate
          }
        ]
      })
    });

    if (!airtableRes.ok) {
      const errorText = await airtableRes.text();
      return {
        statusCode: airtableRes.status,
        body: JSON.stringify({ message: 'Airtable error', details: errorText })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Reaction updated successfully.' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server error', error: err.message })
    };
  }
};