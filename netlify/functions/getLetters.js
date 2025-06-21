const axios = require("axios");

exports.handler = async (event, context) => {
  try {
    const response = await axios.post("https://hook.us2.make.com/sp9n176bkb7uzawj5uj7255w9ljznth");

    const letters = response.data.letters; // <- properly access the array inside the response

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(letters), // <- return just the array
    };
  } catch (error) {
    console.error("Error fetching letters:", error.message);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // added to prevent future CORS issues
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Failed to fetch letters." }),
    };
  }
};
