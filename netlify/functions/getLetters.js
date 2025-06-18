import Airtable from "airtable";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
      process.env.AIRTABLE_BASE_ID
    );

    const records = await base("Letters")
      .select({
        filterByFormula: "AND({Approved} = TRUE(), {PublicURL} != '')",
        sort: [{ field: "Date", direction: "desc" }],
        maxRecords: 100,
      })
      .all();

    const formatted = records.map((record) => ({
      id: record.id,
      ...record.fields,
    }));

    res.status(200).json({ letters: formatted });
  } catch (err) {
    console.error("❌ Error fetching letters:", err);
    res.status(500).json({ error: "Failed to fetch letters." });
  }
}
