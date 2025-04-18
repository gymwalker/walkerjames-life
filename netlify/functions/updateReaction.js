const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const { recordId, field } = JSON.parse(event.body);
  const airtableToken = process.env.AIRTABLE_TOKEN;
  const baseId = "appaA8MFWiiWjXwSQ";
  const tableName = "Letters";

  const url = `https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${airtableToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: { [field]: 1 }
    }),
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};

