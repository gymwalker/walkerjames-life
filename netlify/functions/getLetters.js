const Airtable = require('airtable');

exports.handler = async function (event) {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

  try {
    const records = await base('Letters')
      .select({ view: 'Grid view' })
      .all();

    const publicRecords = records
      .filter(r => r.fields['Approval Status'] === 'Approved')
      .filter(r => ['Yes, share publicly (first name only)', 'Yes, but anonymously'].includes(r.fields['Share Publicly']));

    return {
      statusCode: 200,
      body: JSON.stringify({ records: publicRecords })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
