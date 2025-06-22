// WalkerJames.Life LTG Wall Embed Script
// Updated to: use pipe-delimited CSV, parse properly, include all columns, and use open book icon for views

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
      lettersArray.forEach(line => {
        const [date, name, letterContent, moderator, prayers, hearts, broken, views] = line.split("|").map(val => val.trim());

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${date}</td>
          <td>${name}</td>
          <td class="truncate" style="max-width: 350px; white-space: normal; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;" title="Click to read full letter">${letterContent}</td>
          <td class="truncate" style="max-width: 350px; white-space: normal; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${moderator}</td>
          <td>🙏 ${prayers}</td>
          <td>❤️ ${hearts}</td>
          <td>💔 ${broken}</td>
          <td>📖 ${views}</td>
        `;
        tr.onclick = () => showPopup(name, date, letterContent, moderator);
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      container.innerHTML = "";
      container.appendChild(table);

      container.style.overflowX = "auto";
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
