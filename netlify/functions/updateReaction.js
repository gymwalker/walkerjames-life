const Airtable = require("airtable");

exports.handler = async (event) => {
  if (event.httpMethod === "GET") {
    try {
      const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
      const records = await base("Letters")
        .select({
          filterByFormula: `AND(
            {Approval Status} = "Approved",
            OR(
              {Share Publicly} = "Yes, share publicly (first name only)",
              {Share Publicly} = "Yes, but anonymously"
            )
          )`,
          sort: [{ field: "Created", direction: "desc" }]
        })
        .all();

      const result = records.map((record) => ({
        id: record.id,
        name: record.get("Display Name") || "Anonymous",
        content: record.get("Letter"),
        date: record.get("Created"),
        comment: record.get("Moderator Comment") || "",
        heartCount: record.get("Hearts Count") || 0,
        prayerCount: record.get("Prayer Count") || 0,
        brokenCount: record.get("Broken Heart Count") || 0,
        readCount: record.get("View Count") || 0,
      }));

      return {
        statusCode: 200,
        body: JSON.stringify(result),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: `Error fetching records: ${error}`,
      };
    }
  }

  if (event.httpMethod === "POST") {
    try {
      const body = JSON.parse(event.body);
      const { recordId, reaction } = body;

      if (!recordId || !reaction) {
        return {
          statusCode: 400,
          body: "Missing recordId or reaction type",
        };
      }

      const fieldMap = {
        heart: "Hearts Count",
        prayer: "Prayer Count",
        broken: "Broken Heart Count",
        read: "View Count",
      };

      const fieldName = fieldMap[reaction];

      if (!fieldName) {
        return {
          statusCode: 400,
          body: "Invalid reaction type",
        };
      }

      const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

      // First retrieve the current value
      const record = await base("Letters").find(recordId);
      const currentValue = record.get(fieldName) || 0;

      // Update with incremented value
      await base("Letters").update(recordId, {
        [fieldName]: currentValue + 1,
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Reaction count updated successfully" }),
      };
    } catch (error) {
      return {
        statusCode: 500,
        body: `Error updating reaction count: ${error}`,
      };
    }
  }

  return {
    statusCode: 405,
    body: "Method Not Allowed",
  };
};
