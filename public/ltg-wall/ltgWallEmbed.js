// ltgWallEmbed.js

const endpoint = "https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth";

fetch(endpoint)
  .then(response => response.text())
  .then(text => {
    let lettersArray = [];

    try {
      const json = JSON.parse(text);
      if (Array.isArray(json.letters)) {
        lettersArray = json.letters;
      } else {
        throw new Error("letters not array");
      }
    } catch (e) {
      console.warn("Fallback to manual parsing due to non-JSON response");

      const lines = text.split(/\n|(?=\d{4}-\d{2}-\d{2})/g);
      lines.forEach(line => {
        const match = line.match(/(\d{4}-\d{2}-\d{2})([^@]*)@?([^,]*),?(.*)/);
        if (match) {
          lettersArray.push({
            date: match[1].trim(),
            from: match[2].trim(),
            letter: match[3].trim(),
            moderatorNote: match[4].trim()
          });
        }
      });
    }

    renderLetters(lettersArray);
  })
  .catch(err => {
    console.error("Failed to fetch letters:", err);
  });

function renderLetters(letters) {
  const container = document.getElementById("ltg-wall-container") || document.body;

  const table = document.createElement("table");
  table.className = "ltg-wall-table";

  letters.forEach((letter, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>From:</strong> ${letter.from || "Anonymous"}</td>
      <td><strong>Date:</strong> ${letter.date}</td>
      <td><button data-index="${index}" class="ltg-read-button">Read Letter</button></td>
    `;
    table.appendChild(row);
  });

  container.innerHTML = "";
  container.appendChild(table);

  // Modal
  const modal = document.createElement("div");
  modal.id = "ltg-modal";
  modal.style.display = "none";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.background = "rgba(0,0,0,0.6)";
  modal.style.color = "#fff";
  modal.style.zIndex = 9999;
  modal.style.padding = "60px 40px";
  modal.innerHTML = `
    <div id="ltg-modal-content" style="background:#111;padding:20px;border-radius:8px;max-width:600px;margin:auto;position:relative;">
      <span id="ltg-modal-close" style="position:absolute;top:10px;right:20px;cursor:pointer;font-size:20px;">&times;</span>
      <div id="ltg-modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // Events
  document.querySelectorAll(".ltg-read-button").forEach(btn => {
    btn.addEventListener("click", e => {
      const i = parseInt(e.target.dataset.index);
      const l = letters[i];
      document.getElementById("ltg-modal-body").innerHTML = `
        <p><strong>From:</strong> ${l.from}</p>
        <p><strong>Date:</strong> ${l.date}</p>
        <p><strong>Letter:</strong><br>${l.letter}</p>
        ${l.moderatorNote ? `<p><strong>Moderator:</strong><br>${l.moderatorNote}</p>` : ""}
      `;
      modal.style.display = "block";
    });
  });

  document.getElementById("ltg-modal-close").addEventListener("click", () => {
    modal.style.display = "none";
  });
}
