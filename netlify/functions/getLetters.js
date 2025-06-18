// getLetters.js
import Airtable from 'airtable';
import dotenv from 'dotenv';
dotenv.config();

export default async (req, res) => {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

    const records = await base('Letters').select({
      view: 'Approved Letters'
    }).all();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ records: records.map(r => ({ id: r.id, fields: r.fields })) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch letters' });
  }
};
