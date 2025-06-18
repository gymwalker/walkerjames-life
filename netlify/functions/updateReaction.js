const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base('appaA8MFWiiWjXwSQ');

exports.handler = async function(event, context) {
  const shouldList = event.queryStringParameters?.list === 'true';

  if (!shouldList) {
    return {
      statusCode: 400,
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records }) // ✅ JSON-wrapped result
    };
  } catch (error) {
    console.error('Error fetching Airtable records:', error);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to load letters.' })
    };
  }
};
