const Airtable = require('airtable');

// Configure Airtable base
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const { recordId, emoji } = JSON.parse(event.body);

    if (!recordId || !emoji) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Missing recordId or emoji' }),
      };
    }

    // Map emoji labels to Airtable field names
    const validFields = {
      "Love Count": "Love Count",
      "Prayer Count": "Prayer Count",
      "Broken Heart Count": "Broken Heart Count",
      "Read Count": "Read Count",
    };

    const fieldName = validFields[emoji];

    if (!fieldName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: `Invalid emoji field: ${emoji}` }),
      };
    }

    // Fetch current count
    const record = await base('Letters').find(recordId);
    const currentCount = record.fields[fieldName] || 0;

    // Update count
    await base('Letters').update(recordId, {
      [fieldName]: currentCount + 1,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `${fieldName} updated` }),
    };
  } catch (error) {
    console.error('Error updating reaction:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
