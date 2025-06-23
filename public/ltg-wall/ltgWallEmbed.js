// WalkerJames.Life LTG Wall Embed Script (FINAL - CORRECTED FIELD MAPPING)
// Field order returned: Letter, Name, ❤️, 💔, Date, 📖, Moderator

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

      const wrapper = document.createElement("div");
      wrapper.style.overflowX = "auto";

      const table = document.createElement("table");
      table.style.borderCollapse = "collapse";
      table.style.width = "100%";

      table.innerHTML = `
        <thead>
          <tr>
            <th style="border:1px solid #ccc;padding:8px;">Date</th>
            <th style="border:1px solid #ccc;padding:8px;">Display Name</th>
            <th style="border:1px solid #ccc;padding:8px;max-width:50ch;">Letter</th>
            <th style="border:1px solid #ccc;padding:8px;max-width:50ch;">Moderator Comments</th>
            <th style="border:1px solid #ccc;padding:8px;" title="Hearts">❤️</th>
            <th style="border:1px solid #ccc;padding:8px;" title="Prayers">🙏</th>
            <th style="border:1px solid #ccc;padding:8px;" title="Broken Hearts">💔</th>
            <th style="border:1px solid #ccc;padding:8px;" title="Views">📖</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;

      const tbody = table.querySelector("tbody");

      lettersArray.forEach((line) => {
        const [
          letterContent,        // 0
          displayName,          // 1
          heartsCount,          // 2
          brokenHeartsCount,    // 3
          submissionDate,       // 4
          readCount,            // 5
          moderatorComments     // 6
        ] = line.split("|").map(x => x.trim());

        const prayerCount = ""; // Not returned — leave blank

        const row = document.createElement("tr");
        row.innerHTML = `
          <td style="border:1px solid #ccc;padding:8px;">${submissionDate}</td>
          <td style="border:1px solid #ccc;padding:8px;">${displayName}</td>
          <td class="truncate" style="border:1px solid #ccc;padding:8px;max-width:50ch;white-space:normal;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;cursor:pointer;" title="Click to read full letter">${letterContent}</td>
          <td class="truncate" style="border:1px solid #ccc;padding:8px;max-width:50ch;white-space:normal;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${moderatorComments}</td>
          <td style="border:1px solid #ccc;padding:8px;">${heartsCount}</td>
          <td style="border:1px solid #ccc;padding:8px;">${prayerCount}</td>
          <td style="border:1px solid #ccc;padding:8px;">${brokenHeartsCount}</td>
          <td style="border:1px solid #ccc;padding:8px;">${readCount}</td>
        `;
        tbody.appendChild(row);

        const popupTrigger = row.querySelector("td:nth-child(3)");
        if (popupTrigger) {
          popupTrigger.onclick = () =>
            showPopup(displayName, submissionDate, letterContent, moderatorComments, heartsCount, prayerCount, brokenHeartsCount, readCount);
        }
      });

      wrapper.appendChild(table);
      container.innerHTML = "";
      container.appendChild(wrapper);
    })
    .catch(err => {
      container.innerHTML = `<p>Error loading letters: ${err.message}</p>`;
    });

  function showPopup(name, date, content, moderator, hearts, prayers, broken, views) {
    const popup = document.createElement("div");
    popup.style.position = "fixed";
    popup.style.top = 0;
    popup.style.left = 0;
    popup.style.width = "100vw";
    popup.style.height = "100vh";
    popup.style.background = "rgba(0,0,0,0.75)";
    popup.style.zIndex = 9999;
    popup.style.display = "flex";
    popup.style.justifyContent = "center";
    popup.style.alignItems = "center";

    popup.innerHTML = `
      <div style="background:white;padding:2em;max-width:600px;border-radius:10px;position:relative;">
        <button style="position:absolute;top:10px;right:15px;font-size:24px;background:none;border:none;cursor:pointer;">&times;</button>
        <h3>${name}</h3>
        <p><strong>${date}</strong></p>
        <div>${content}</div>
        <p><em>${moderator}</em></p>
        <div style="margin-top:1em;font-size:1.5em;display:flex;justify-content:space-around;">
          <div class="reaction">❤️ <span>${hearts}</span></div>
          <div class="reaction">🙏 <span>${prayers}</span></div>
          <div class="reaction">💔 <span>${broken}</span></div>
          <div class="reaction">📖 <span>${views}</span></div>
        </div>
      </div>
    `;

    popup.querySelector("button").onclick = () => popup.remove();
    popup.onclick = e => { if (e.target === popup) popup.remove(); };
    document.body.appendChild(popup);
  }
})();
