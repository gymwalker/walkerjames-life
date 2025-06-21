const axios = require("axios");

exports.handler = async function (event, context) {
  try {
    // Make GET request to the Make scenario webhook
    const makeResponse = await axios.get(
      "https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth"
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
    console.error("Error fetching letter data from Make:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch letters." }),
    };
  }
};
