const Airtable = require("airtable");

exports.handler = async function (event) {
  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

  try {
    const records = [];
    await base('Letters')
      .select({
        view: 'Grid view'
      })
      .eachPage((fetched, fetchNextPage) => {
        records.push(...fetched);
        fetchNextPage();
      });

    return {
      statusCode: 200,
      body: JSON.stringify({ records })
    };
  } catch (err) {
    console.error("❌ Error fetching letters:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
