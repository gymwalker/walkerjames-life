const Airtable = require('airtable');
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN }).base(process.env.AIRTABLE_BASE_ID);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { recordId, reactions } = JSON.parse(event.body);
    if (!recordId || !reactions) {
      throw new Error('Missing recordId or reactions');
    }

    const record = await base('Letters').find(recordId);
    const existing = record.fields;

    const updatedFields = {};
    for (const [key, value] of Object.entries(reactions)) {
      const safeKey = key.trim();
      const oldValue = parseInt(existing[safeKey] || 0);
      updatedFields[safeKey] = oldValue + value;
    }

    await base('Letters').update(recordId, updatedFields);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
