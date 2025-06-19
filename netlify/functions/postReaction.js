// postReaction.js

const Airtable = require('airtable');

exports.handler = async (event) => {
  try {
    const { recordId, reactions } = JSON.parse(event.body || '{}');
    if (!recordId || !reactions) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing recordId or reactions' })
      };
    }

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID);

    const record = await base('Letters').find(recordId);
    if (!record) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Record not found' })
      };
    }

    const updates = {};
    Object.entries(reactions).forEach(([key, increment]) => {
      const current = record.fields[key] || 0;
      updates[key] = current + increment;
    });

    await base('Letters').update(recordId, updates);

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error('Error in postReaction:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to update reaction.' })
    };
  }
};
