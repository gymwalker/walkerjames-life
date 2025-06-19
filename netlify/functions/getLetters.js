const Airtable = require('airtable');

exports.handler = async (event) => {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

  try {
    const records = await base('Letters')
      .select({
        view: 'Grid view',
        fields: [
          'Letter Content',
          'Display Name',
          'Moderator Comments',
          'Approval Status',
          'Share Publicly',
          'Submission Date',
          'View Count',
          'Prayer Count',
          'Hearts Count',
          'Broken Hearts Count'
        ]
      })
      .all();

    const formatted = records.map((record) => ({
      id: record.id,
      fields: record.fields
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ records: formatted })
    };
  } catch (err) {
    console.error('❌ Error loading letters:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load letters', detail: err.message })
    };
  }
};
