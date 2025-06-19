const Airtable = require('airtable');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { recordId, reactions } = JSON.parse(event.body);

    if (!recordId || !reactions) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing recordId or reactions' })
      };
    }

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
    const record = await base('Letters').find(recordId);

    const updates = {};
    for (const [field, increment] of Object.entries(reactions)) {
      const current = record.fields[field] || 0;
      updates[field] = current + increment;
    }

    await base('Letters').update(recordId, updates);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error('❌ Failed to update reactions:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update reactions', detail: err.message })
    };
  }
};
