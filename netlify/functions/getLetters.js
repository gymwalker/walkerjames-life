// getLetters.js

const Airtable = require('airtable');

exports.handler = async (event) => {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID);

    const records = [];
    await base('Letters')
      .select({
        filterByFormula: `AND({Approval Status} = 'Approved', OR({Share Publicly} = 'Yes, share publicly (first name only)', {Share Publicly} = 'Yes, but anonymously'))`,
        sort: [{ field: 'Submission Date', direction: 'desc' }]
      })
      .eachPage((fetchedRecords, fetchNextPage) => {
        records.push(...fetchedRecords);
        fetchNextPage();
      });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ records })
    };
  } catch (err) {
    console.error('Error in getLetters:', err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to fetch letters.' })
    };
  }
};
