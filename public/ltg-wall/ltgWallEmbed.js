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

    const lettersArray = [];

    // Assume response is plain text, one letter per line
    const lines = text.split(/\r?\n/).filter(Boolean);

    lines.forEach(line => {
      // Match pattern: YYYY-MM-DD + Name + Content + Moderator (optional, comma-separated)
      const match = line.match(/^(\d{4}-\d{2}-\d{2})([A-Za-z\s]+)(.+)$/);
      if (match) {
        const [, date, name, content] = match;

        // Try to split moderator comment from letter using a delimiter (like ! or last period)
        const [letter, moderatorComment] = content.split("!").map(p => p.trim());

        lettersArray.push({
          date: date.trim(),
          name: name.trim(),
          content: letter,
          moderator: moderatorComment || ""
        });
      } else {
        console.warn("Line format did not match:", line);
      }
    });

    if (lettersArray.length === 0) {
      wallContainer.innerHTML = "<p>No letters found.</p>";
      return;
    }

    // Clear previous or loading text
    wallContainer.innerHTML = "";

    lettersArray.forEach(letter => {
      const letterDiv = document.createElement("div");
      letterDiv.className = "ltg-letter";
      letterDiv.style.marginBottom = "2rem";
      letterDiv.innerHTML = `
        <p><strong>From:</strong> ${letter.name}</p>
        <p><strong>Date:</strong> ${letter.date}</p>
        <p><strong>Letter:</strong><br>${letter.content}</p>
        ${letter.moderator ? `<p><strong>Moderator:</strong> ${letter.moderator}</p>` : ""}
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
