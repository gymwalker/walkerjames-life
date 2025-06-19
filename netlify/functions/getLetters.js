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

  const isList = event.queryStringParameters?.list === 'true';

  try {
    const records = await base('Letters')
      .select({
        filterByFormula: "AND({Approval Status}='Approved', {Visibility}='Public')",
        sort: [{ field: 'Submission Date', direction: 'desc' }]
      })
      .all();

    if (!isList) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ records })
      };
    }

    const mapped = records.map((r) => ({
      id: r.id,
      date: r.fields['Submission Date'],
      name: r.fields['Display Name'] || 'Anonymous',
      preview: r.fields['Letter Content']?.slice(0, 80) || '',
      letter: r.fields['Letter Content'] || '',
      moderatorComment: r.fields['Moderator Comments'] || '',
      reactions: {
        'Hearts Count': r.fields['Hearts Count'] || 0,
        'Prayer Count': r.fields['Prayer Count'] || 0,
        'Broken Heart Count': r.fields['Broken Heart Count'] || 0,
        'View Count': r.fields['View Count'] || 0
      }
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ letters: mapped })
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
