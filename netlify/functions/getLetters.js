const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base('appaA8MFWiiWjXwSQ'); // ✅ CORRECT

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

  if (event.httpMethod === 'GET') {
    const shouldList = event.queryStringParameters?.list === 'true';
    if (!shouldList) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing or invalid list parameter' })
      };
    }

    try {
      const records = [];
      await base('Letters')
        .select({
          view: 'Grid view',
          sort: [{ field: 'Submission Date', direction: 'desc' }],
          filterByFormula: "AND({Approval Status} = 'Approved', {Visibility} = 'Under Review')"
        })
        .eachPage((fetchedRecords, fetchNextPage) => {
          fetchedRecords.forEach(record => {
            records.push({ id: record.id, fields: record.fields });
          });
          fetchNextPage();
        });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ records })
      };
    } catch (error) {
      console.error('🔥 Airtable fetch error:', error); // This is the critical log line
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to load letters.', details: error.message })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method Not Allowed' })
  };
};
