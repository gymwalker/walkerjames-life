import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

export default async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const records = [];
    await base('Letters').select({ view: 'Grid view' }).eachPage((page, fetchNext) => {
      records.push(...page);
      fetchNext();
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ records });
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch letters' });
  }
};
