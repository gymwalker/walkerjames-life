const fetch = require("node-fetch");

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = "appaA8MFWiiWjXwSQ";
const TABLE_NAME = "Letters";

exports.handler = async function (event) {
  const method = event.httpMethod;

  if (method === "GET") {
    const { list, recordId } = event.queryStringParameters;

    // Fetch all letters
    if (list === "true") {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`
        }
      });
      const data = await response.json();
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
