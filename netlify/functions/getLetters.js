// getLetters.js

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

  try {
    const records = [];
    await base('Letters')
      .select({
        view: 'Grid view',
        filterByFormula: `AND(
          {Approval Status} = "Approved",
          OR(
            {Share Publicly} = "Yes, share publicly (first name only)",
            {Share Publicly} = "Yes, but anonymously"
          )
        )`
      })
      .eachPage((fetchedRecords, fetchNextPage) => {
        fetchedRecords.forEach(record => {
          const fields = record.fields;
          records.push({
            id: record.id,
            name: fields['Display Name'] || 'Anonymous',
            date: fields['Submission Date'] || '',
            letter: fields['Letter Content'] || '',
            moderatorComment: fields['Moderator Comments'] || '',
            reactions: {
              'View Count': fields['View Count'] || 0,
              'Prayer Count': fields['Prayer Count'] || 0,
              'Hearts Count': fields['Hearts Count'] || 0,
              'Broken Hearts Count': fields['Broken Hearts Count'] || 0
            }
          });
        });
        fetchNextPage();
      });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ records })
    };
  } catch (err) {
    console.error('Error fetching letters:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch letters' })
    };
  }
};
