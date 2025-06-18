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
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const shouldList = event.queryStringParameters?.list === 'true';
  
  if (event.httpMethod === 'POST') {
    try {
      const { recordId, reactions } = JSON.parse(event.body || '{}');
      if (!recordId || !reactions || typeof reactions !== 'object') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing or invalid POST payload' })
        };
      }

      const updateFields = {};
      for (const [field, increment] of Object.entries(reactions)) {
        if (typeof increment === 'number') {
          updateFields[field] = increment;
        }
      }

      await base('Letters').update(recordId, { ...updateFields });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    } catch (error) {
      console.error('POST error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to update record' })
      };
    }
  }

  // Fallback to GET (original logic continues below)
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
          records.push({
            id: record.id,
            fields: record.fields
          });
        });
        fetchNextPage();
      });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ records })
    };
  } catch (error) {
    console.error('Error fetching Airtable records:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to load letters.' })
    };
  }
};
