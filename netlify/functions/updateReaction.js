fetch("https://hook.us2.make.com/llyd2p9njx4s7pqb3krotsvb7wbaso4f", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    letterId: "recXYZ123",  // Replace with actual record ID
    iconType: "prayer",     // e.g., "prayer", "heart", "amen"
    increment: 1
  })
})
.then(response => response.json())
.then(data => {
  console.log("Webhook response:", data);
})
.catch(error => {
  console.error("Error sending to Make webhook:", error);
});
