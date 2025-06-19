// getLetters.js

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

  const showList = event.queryStringParameters?.List === 'true';
  if (!showList) {
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
        fetchedRecords.forEach((record) => {
          records.push({
            id: record.id,
            name: record.get('Display Name') || 'Anonymous',
            preview: (record.get('Letter Content') || '').substring(0, 80) + '...',
            letter: record.get('Letter Content') || '',
            date: record.get('Submission Date') || '',
            moderatorComment: record.get('Moderator Comment') || '',
            reactions: {
              'View Count': record.get('View Count') || 0,
              'Prayer Count': record.get('Prayer Count') || 0,
              'Hearts Count': record.get('Hearts Count') || 0,
              'Broken Hearts Count': record.get('Broken Hearts Count') || 0
            }
          });
        });
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
      body: JSON.stringify({ error: 'Failed to fetch letters' })
    };
  }
};
