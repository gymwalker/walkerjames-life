// updateReaction.js
import Airtable from 'airtable';
import dotenv from 'dotenv';
dotenv.config();

export default async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { recordId, reactions } = req.body;

    if (!recordId || !reactions || typeof reactions !== 'object') {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

    const updates = Object.entries(reactions).map(([field, increment]) => ({
      field,
      increment
    }));

    const record = await base('Letters').find(recordId);
    const updatedFields = {};

    updates.forEach(({ field, increment }) => {
      const current = record.fields[field] || 0;
      updatedFields[field] = current + increment;
    });

    await base('Letters').update(recordId, updatedFields);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ message: 'Reactions updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update reactions' });
  }
};
