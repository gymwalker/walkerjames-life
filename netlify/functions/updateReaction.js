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

      // Fetch current record
      const record = await base('Letters').find(recordId);
      const currentFields = record.fields;

      // Prepare updated fields by incrementing
      const updateFields = {};
      for (const [field, increment] of Object.entries(reactions)) {
        if (typeof increment === 'number') {
          const currentValue = parseInt(currentFields[field] || 0);
          updateFields[field] = currentValue + increment;
        }
      }

      // Apply update to Airtable
      await base('Letters').update(recordId, updateFields);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, updated: updateFields })
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
        sort: [{ field: 'Created', direction: 'desc' }]
      })
      .eachPage((page, fetchNextPage) => {
        records.push(...page);
        fetchNextPage();
      });

    const formatted = records.map(record => ({
      id: record.id,
      fields: record.fields
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ records: formatted })
    };
  } catch (error) {
    console.error('GET error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to retrieve records' })
    };
  }
};
