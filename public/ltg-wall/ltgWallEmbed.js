fetch("https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth")
  .then(response => response.text())
  .then(text => {
    // If it looks like JSON, try to parse it; otherwise, use raw parsing
    let lettersArray = [];

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.letters)) {
        lettersArray = parsed.letters;
      } else {
        throw new Error("letters not an array");
      }
    } catch (err) {
      // fallback: manually parse the single long line
      console.warn("Non-JSON response, falling back to manual parsing");

      // Sample input:
      // "2025-05-09AnonymousHello God, I made a drawing...approved for public display."
      const raw = text.replace(/^.*?letters['"]?:\s*"?/, "").replace(/"$/, "");
      const match = raw.match(/^(\d{4}-\d{2}-\d{2})([^A-Z]+)(.+?)([A-Z].*)$/);

      if (match) {
        const [, date, name, letter, moderatorComment] = match;
        lettersArray.push({
          date: date.trim(),
          name: name.trim(),
          letter: letter.trim(),
          moderatorComment: moderatorComment.trim()
        });
      } else {
        throw new Error("Manual parsing failed");
      }
    }

    renderLetters(lettersArray);
  })
  .catch(error => {
    console.error("Failed to load letters:", error);
    const lettersDiv = document.getElementById("ltgWall");
    lettersDiv.innerHTML = `<p>Failed to load letters. Please try again later.</p>`;
  });

// Renders the parsed letters into your LTG Wall
function renderLetters(letters) {
  const lettersDiv = document.getElementById("ltgWall");
  lettersDiv.innerHTML = "";

  letters.forEach(letter => {
    const div = document.createElement("div");
    div.classList.add("ltg-letter");

    div.innerHTML = `
      <p><strong>${letter.date}</strong> - <em>${letter.name}</em></p>
      <p>${letter.letter}</p>
      <p><small>${letter.moderatorComment}</small></p>
      <hr/>
    `;

    lettersDiv.appendChild(div);
  });
}
