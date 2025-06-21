const axios = require("axios");

exports.handler = async (event, context) => {
  try {
    const response = await axios.get("https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth");

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error("Error fetching letters:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch letters." }),
    };
  }
};
