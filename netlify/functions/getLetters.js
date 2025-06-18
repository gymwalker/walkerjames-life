// netlify/functions/getLetters.js
const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

exports.handler = async function () {
  try {
    const records = [];
    await base('Letters')
      .select({ view: 'Approved' })
      .eachPage((fetched, fetchNext) => {
        records.push(...fetched);
        fetchNext();
      });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        records: records.map(record => ({
          id: record.id,
          fields: record.fields
        }))
      })
    };
  } catch (err) {
    console.error('getLetters error:', err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to fetch letters.' })
    };
  }
};
