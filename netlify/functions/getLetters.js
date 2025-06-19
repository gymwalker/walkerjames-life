const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base('appaA8MFWiiWjXwSQ');

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const records = await base('Letters')
      .select({
        filterByFormula: "{Approval Status} = 'Approved'",
        sort: [{ field: 'Submission Date', direction: 'desc' }]
      })
      .all();

    const result = records.map(record => ({
      id: record.id,
      fields: record.fields
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ records: result })
    };
  } catch (err) {
    console.error('Error fetching records:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch letters' })
    };
  }
};

