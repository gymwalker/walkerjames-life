// WalkerJames.Life LTG Wall Embed Script
// Updated to: remove JSON dependency, fix full table display, restore icons, and use open book icon for read counter

(function () {
  const container = document.getElementById("ltg-wall-container");
  if (!container) return;

  container.innerHTML = "<p>Loading letters…</p>";

  fetch("https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth")
    .then(response => response.text())
    .then(text => {
      const lines = text.trim().split(/\r?\n/);
      const lettersArray = lines.map(line => line.trim()).filter(Boolean);

      if (lettersArray.length === 0) {
        container.innerHTML = "<p>No letters found.</p>";
        return;
      }

      const table = document.createElement("table");
      table.className = "ltg-wall-table";

      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr>
          <th>Date</th>
          <th>Display Name</th>
          <th>Letter</th>
          <th>Moderator Comments</th>
          <th><span title='Prayers'>🙏</span></th>
          <th><span title='Hearts'>❤️</span></th>
          <th><span title='Broken Hearts'>💔</span></th>
          <th><span title='Views'>📖</span></th>
        </tr>
      `;
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      lettersArray.forEach(entry => {
        const td = document.createElement("td");
        td.colSpan = 8;

        const fields = entry.split(/(?=\d{4}-\d{2}-\d{2})/)[0]
          .split(/(?<=\d{4}-\d{2}-\d{2}.*?)(?=Anonymous|\d{4}-\d{2}-\d{2})/);

        const [date, name, ...rest] = entry.split(/(?=\d{4}-\d{2}-\d{2})/)[0]
          .trim().split(/(?=Anonymous|\d{4}-\d{2}-\d{2})/);

        const letterContent = rest.join(" ").split("Moderator Comments:")[0].trim();
        const moderator = (entry.match(/Moderator Comments:(.*)/) || ["", ""])[1].trim();

        const views = (entry.match(/View Count:\s*(\d+)/) || ["", "0"])[1];
        const prayers = (entry.match(/Prayer Count:\s*(\d+)/) || ["", "0"])[1];
        const hearts = (entry.match(/Hearts Count:\s*(\d+)/) || ["", "0"])[1];
        const broken = (entry.match(/Broken Hearts Count:\s*(\d+)/) || ["", "0"])[1];

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${date.trim()}</td>
          <td>${name.trim()}</td>
          <td class="truncate" title="Click to read full letter">${letterContent.slice(0, 120)}…</td>
          <td class="truncate">${moderator.slice(0, 120)}…</td>
          <td>🙏 ${prayers}</td>
          <td>❤️ ${hearts}</td>
          <td>💔 ${broken}</td>
          <td>📖 ${views}</td>
        `;
        tr.onclick = () => showPopup(name.trim(), date.trim(), letterContent, moderator);
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      container.innerHTML = "";
      container.appendChild(table);
    })
    .catch(err => {
      container.innerHTML = `<p>Error loading letters: ${err.message}</p>`;
    });

  function showPopup(name, date, content, moderator) {
    const popup = document.createElement("div");
    popup.className = "ltg-popup";
    popup.innerHTML = `
      <div class="ltg-popup-inner">
        <button class="ltg-popup-close">&times;</button>
        <h3>${name}</h3>
        <p><strong>${date}</strong></p>
        <div class="ltg-popup-letter">${content}</div>
        <p><em>${moderator}</em></p>
      </div>
    `;

    popup.querySelector(".ltg-popup-close").onclick = () => popup.remove();
    document.body.appendChild(popup);
  }
})();
