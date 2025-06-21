const axios = require("axios");

exports.handler = async (event, context) => {
  try {
    const response = await axios.post("https://hook.us2.make.com/sp9n176bkb7uzawj5uj7255w9ljznth");

    // Ensure the response contains letters
    const letters = response.data?.letters;
    if (!Array.isArray(letters)) {
      throw new Error("Invalid data format: 'letters' is not an array.");
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ letters }),
    };
  } catch (error) {
    console.error("Error fetching letters:", error.message);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Failed to fetch letters." }),
    };
  }
};
