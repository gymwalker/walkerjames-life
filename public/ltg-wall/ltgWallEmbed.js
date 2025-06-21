fetch("https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth")
  .then(response => response.text())
  .then(text => {
    const wallContainer = document.getElementById("ltgWallContainer");
    let lettersArray = [];

    const lines = text.split(/\r?\n/).filter(Boolean);

    lines.forEach(line => {
      // Match date + name + letter (raw string format)
      const match = line.match(/^(\d{4}-\d{2}-\d{2})([A-Za-z\s]+)(.+)$/);
      if (match) {
        const [, date, name, content] = match;
        lettersArray.push({
          date: date.trim(),
          name: name.trim(),
          content: content.trim()
        });
      }
    });

    if (lettersArray.length === 0) {
      wallContainer.innerHTML = "<p>No letters found.</p>";
      return;
    }

    wallContainer.innerHTML = ""; // Clear loading text

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
    const wallContainer = document.getElementById("ltgWallContainer");
    wallContainer.innerHTML = `<p>Error loading letters: ${err.message}</p>`;
  });
