const axios = require("axios");

exports.handler = async function (event, context) {
  try {
    // Make GET request to the Make scenario webhook for Prayers
    const makeResponse = await axios.get(
      "https://hook.us2.make.com/bkopq8e6z4qcjiqei4g8cpjab01e5w2h"
    );

    return {
      statusCode: 200,
      body: JSON.stringify(makeResponse.data),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    console.error("Error fetching prayer data from Make:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch prayers." }),
    };
  }
};
