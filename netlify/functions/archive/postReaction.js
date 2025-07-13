async function postReaction(letterId, icon) {
  try {
    const response = await fetch("https://hook.us2.make.com/llyd2p9njx4s7pqb3krotsvb7wbaso4f", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        letterId: letterId,
        icon: icon
      }),
    });

    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    
    const data = await response.json();
    console.log("✅ Reaction sent successfully:", data);
  } catch (error) {
    console.error("❌ Error sending reaction:", error);
  }
}
