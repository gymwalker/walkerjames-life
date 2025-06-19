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

      return { statusCode: 200, headers, body: JSON.stringify({ records }) };
    } catch (error) {
      console.error('Error fetching Airtable records:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to load letters.' }) };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const { recordId, reactions } = JSON.parse(event.body);

      if (!recordId || typeof reactions !== 'object') {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing recordId or reactions object' }) };
      }

      const updateFields = {};
      for (const [reactionType, increment] of Object.entries(reactions)) {
        updateFields[reactionType] = {
          formula: `IF({${reactionType}}, {${reactionType}} + ${increment}, ${increment})`
        };
      }

      await base('Letters').update([
        {
          id: recordId,
          fields: reactions
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
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
};
