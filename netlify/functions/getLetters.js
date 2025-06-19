const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN }).base(process.env.AIRTABLE_BASE_ID);

exports.handler = async (event) => {
  try {
    const result = [];

    await base('Letters')
      .select({
        view: 'Grid view'
      })
      .eachPage((records, fetchNextPage) => {
        records.forEach(record => {
          const fields = record.fields;
          if (
            fields['Approval Status'] === 'Approved' &&
            (fields['Share Publicly'] === 'Yes, share publicly (first name only)' ||
             fields['Share Publicly'] === 'Yes, but anonymously')
          ) {
            result.push({
              id: record.id,
              fields
            });
          }
        });
        fetchNextPage();
      });

    return {
      statusCode: 200,
      body: JSON.stringify({ records: result })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
