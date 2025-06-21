<script>
fetch("https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth")
  .then(response => response.text())
  .then(text => {
    let lettersArray = [];

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed.letters)) {
        lettersArray = parsed.letters;
      } else if (typeof parsed.letters === "string") {
        // Handle Make's string format
        const raw = parsed.letters.trim();
        const match = raw.match(/^(\d{4}-\d{2}-\d{2})([^\d]+?)(.*?)([A-Z][^.]+\.)$/);

        if (match) {
          const [, date, name, letter, moderatorComment] = match;
          lettersArray.push({
            date: date.trim(),
            name: name.trim(),
            letter: letter.trim(),
            moderatorComment: moderatorComment.trim()
          });
        } else {
          throw new Error("Regex match failed");
        }
      } else {
        throw new Error("Unsupported 'letters' format");
      }
    } catch (err) {
      console.warn("Fallback to raw parsing:", err);
      // Final fallback if Make didn’t wrap it in JSON
      try {
        const raw = text.replace(/^.*?letters['"]?:\s*"?/, "").replace(/"?\s*}?\s*$/, "");
        const match = raw.match(/^(\d{4}-\d{2}-\d{2})([^\d]+?)(.*?)([A-Z][^.]+\.)$/);

        if (match) {
          const [, date, name, letter, moderatorComment] = match;
          lettersArray.push({
            date: date.trim(),
            name: name.trim(),
            letter: letter.trim(),
            moderatorComment: moderatorComment.trim()
          });
        } else {
          throw new Error("Raw manual parsing failed");
        }
      } catch (finalErr) {
        console.error("Failed to parse response:", finalErr);
      }
    }

    renderLetters(lettersArray);
  })
  .catch(error => {
    console.error("Failed to load letters:", error);
    const lettersDiv = document.getElementById("ltgWall");
    if (lettersDiv) {
      lettersDiv.innerHTML = `<p>Failed to load letters. Please try again later.</p>`;
    }
  });

function renderLetters(letters) {
  const lettersDiv = document.getElementById("ltgWall");
  if (!lettersDiv) return;

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
</script>
