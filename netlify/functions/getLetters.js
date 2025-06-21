const axios = require("axios");

exports.handler = async (event, context) => {
  try {
    console.log("Sending request to Make webhook...");
    const response = await axios.post("https://hook.us2.make.com/sp9n176bkb7uzawj5uj7255w9ljznth");

    console.log("Received response:", response.data);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error("Error fetching letters from Make:", error.message);
    console.error("Full error object:", JSON.stringify(error, null, 2));

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Failed to fetch letters." }),
    };
  }
};
