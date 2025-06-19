const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base('appaA8MFWiiWjXwSQ');

exports.handler = async function (event) {
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
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const records = await base('Letters')
      .select({
        filterByFormula: `AND({Approval Status} = "Approved", {Visibility} = "Public")`,
        sort: [{ field: 'Submission Date', direction: 'desc' }]
      })
      .all();

    const letters = records.map((record) => ({
      id: record.id,
      date: record.fields['Submission Date'] || '',
      name: record.fields['Display Name'] || 'Anonymous',
      letter: record.fields['Letter Content'] || '',
      moderatorComment: record.fields['Moderator Comments'] || '',
      reactions: {
        'Hearts Count': record.fields['Hearts Count'] || 0,
        'Prayer Count': record.fields['Prayer Count'] || 0,
        'Broken Hearts Count': record.fields['Broken Hearts Count'] || 0,
        'View Count': record.fields['View Count'] || 0
      }
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ letters })
    };
  } catch (err) {
    console.error('Error loading letters:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to load letters' })
    };
  }
};
