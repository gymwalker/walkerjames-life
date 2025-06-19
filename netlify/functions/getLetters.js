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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const listOnly = event.queryStringParameters?.list === 'true';

    const records = [];
    await base('Letters')
      .select({
        view: 'Grid view', // You can change this to a filtered view if needed
        filterByFormula: `AND({Approval Status} = "Approved", {Visibility} = "Public")`,
        sort: [{ field: 'Submission Date', direction: 'desc' }]
      })
      .eachPage((pageRecords, fetchNextPage) => {
        for (const record of pageRecords) {
          const fields = record.fields;
          records.push({
            id: record.id,
            name: fields['Display Name'] || 'Anonymous',
            letter: fields['Letter Content'] || '',
            preview: (fields['Letter Content'] || '').substring(0, 80),
            moderatorComment: fields['Moderator Comments'] || '',
            date: fields['Submission Date'] || '',
            reactions: {
              'View Count': fields['View Count'] || 0,
              'Prayer Count': fields['Prayer Count'] || 0,
              'Hearts Count': fields['Hearts Count'] || 0,
              'Broken Hearts Count': fields['Broken Hearts Count'] || 0
            }
          });
        }
        fetchNextPage();
      });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ letters: records })
    };
  } catch (err) {
    console.error('Error fetching letters:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to load letters' })
    };
  }
};
