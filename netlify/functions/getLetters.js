// getLetters.js

const Airtable = require('airtable');

exports.handler = async function (event, context) {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const table = base('Letters');

    const records = [];
    await table.select().eachPage((pageRecords, fetchNextPage) => {
      records.push(...pageRecords);
      fetchNextPage();
    });

    const listOnly = event.queryStringParameters?.list === 'true';

    if (listOnly) {
      const filtered = records
        .filter(r => {
          const f = r.fields;
          return (
            f['Approval Status'] === 'Approved' &&
            (
              f['Share Publicly'] === 'Yes, share publicly (first name only)' ||
              f['Share Publicly'] === 'Yes, but anonymously'
            )
          );
        })
        .map(r => ({
          id: r.id,
          fields: r.fields
        }));

      return {
        statusCode: 200,
        body: JSON.stringify({ records: filtered })
      };
    }

    // Full data fallback (rare)
    return {
      statusCode: 200,
      body: JSON.stringify({ records: records.map(r => ({ id: r.id, fields: r.fields })) })
    };
  } catch (err) {
    console.error('[getLetters] Error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch letters.' })
    };
  }
};
