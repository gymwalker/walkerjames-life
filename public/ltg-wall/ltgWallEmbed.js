fetch("https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth")
  .then(response => {
    console.log("Webhook response status:", response.status);
    return response.text();
  })
  .then(text => {
    const wallContainer = document.getElementById("ltg-wall-container");
    if (!wallContainer) {
      console.error("Missing #ltg-wall-container element on page.");
      return;
    }

    console.log("Raw webhook response:", text);

    let lettersArray = [];

    // Break response into lines (handles single or multi-line)
    const lines = text.split(/\r?\n/).filter(Boolean);

    lines.forEach(line => {
      // Match format: YYYY-MM-DD[DisplayName][Message]
      const match = line.match(/^(\d{4}-\d{2}-\d{2})([A-Za-z\s]+)(.+)$/);
      if (match) {
        const [, date, name, content] = match;
        lettersArray.push({
          date: date.trim(),
          name: name.trim(),
          content: content.trim()
        });
      } else {
        console.warn("Line format did not match:", line);
      }
    });

    if (lettersArray.length === 0) {
      wallContainer.innerHTML = "<p>No letters found.</p>";
      return;
    }

    // Clear loading text
    wallContainer.innerHTML = "";

    lettersArray.forEach(letter => {
      const letterDiv = document.createElement("div");
      letterDiv.className = "ltg-letter";
      letterDiv.innerHTML = `
        <p><strong>${letter.name}</strong> on ${letter.date}</p>
        <p>${letter.content}</p>
      `;
      wallContainer.appendChild(letterDiv);
    });
  })
  .catch(err => {
    const wallContainer = document.getElementById("ltg-wall-container");
    if (wallContainer) {
      wallContainer.innerHTML = `<p>Error loading letters: ${err.message}</p>`;
    }
    console.error("Fetch failed:", err);
  });
