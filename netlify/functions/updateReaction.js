import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { recordId, reactions } = req.body;

    if (!recordId || !reactions || typeof reactions !== 'object') {
      return res.status(400).json({ error: 'Invalid request payload' });
    }

    const record = await base('Letters').find(recordId);
    const fieldsToUpdate = {};

    for (const [field, increment] of Object.entries(reactions)) {
      const currentValue = record.fields[field] || 0;
      fieldsToUpdate[field] = currentValue + increment;
    }

    await base('Letters').update(recordId, { fields: fieldsToUpdate });

    res.status(200).json({ success: true, updated: fieldsToUpdate });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};
