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
    const listOnly = event.queryStringParameters?.list === 'true';

    const records = await base('Letters').select({
      view: 'Grid view'
    }).all();

    const results = records
      .filter(record => {
        const fields = record.fields;
        return (
          fields['Approval Status'] === 'Approved' &&
          (
            fields['Share Publicly'] === 'Yes, share publicly (first name only)' ||
            fields['Share Publicly'] === 'Yes, but anonymously'
          )
        );
      })
      .map(record => {
        const fields = record.fields;
        const name =
          fields['Share Publicly'] === 'Yes, but anonymously'
            ? 'Anonymous'
            : fields['Display Name'] || 'Anonymous';

        return listOnly
          ? {
              id: record.id,
              name,
              date: fields['Submission Date'] || '',
              preview: fields['Letter Content']?.slice(0, 80) || '',
              moderatorComment: fields['Moderator Comments'] || '',
              reactions: {
                'View Count': fields['View Count'] || 0,
                'Prayer Count': fields['Prayer Count'] || 0,
                'Hearts Count': fields['Hearts Count'] || 0,
                'Broken Hearts Count': fields['Broken Hearts Count'] || 0
              }
            }
          : {
              id: record.id,
              name,
              date: fields['Submission Date'] || '',
              letter: fields['Letter Content'] || '',
              moderatorComment: fields['Moderator Comments'] || '',
              reactions: {
                'View Count': fields['View Count'] || 0,
                'Prayer Count': fields['Prayer Count'] || 0,
                'Hearts Count': fields['Hearts Count'] || 0,
                'Broken Hearts Count': fields['Broken Hearts Count'] || 0
              }
            };
      });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ records: results })
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
