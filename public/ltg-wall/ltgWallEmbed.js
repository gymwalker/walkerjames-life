// WalkerJames.Life LTG Wall Embed Script (FINAL - LOCKED VERIFIED FIELD ORDER)
// Field Order (confirmed):
// 0: Letter ID
// 1: Read Count
// 2: Display Name
// 3: Hearts Count
// 4: Prayer Count
// 5: Letter Content
// 6: Submission Date
// 7: Moderator Comments
// 8: Broken Hearts Count

(function () {
  const css = `
    #ltg-wall-container {
      padding: 2rem;
      font-family: sans-serif;
      overflow-x: auto;
    }
    #ltg-modal {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    #ltg-modal-body {
      background: white;
      padding: 2rem;
      max-width: 600px;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
    }
    #ltg-close {
      position: absolute;
      top: 10px;
      right: 14px;
      font-size: 1.5rem;
      cursor: pointer;
    }
    .scroll-box {
      max-height: 12em;
      overflow-y: auto;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background: #f4f4f4;
      border-radius: 4px;
    }
    .table-wrapper {
      min-width: 1200px; width: max-content;
      margin: 0 auto;
    }
    table {
      width: 100%;
      margin: 0 auto;
      border-collapse: collapse;
      table-layout: auto;
    }
    th, td {
      border-bottom: 1px solid #ccc;
      padding: 0.5rem;
      text-align: left;
      vertical-align: top;
      font-size: 1rem;
    }
    th:nth-child(n+5), td:nth-child(n+5) {
      text-align: center;
      font-size: 1rem;
    }
    tr:hover {
      background-color: #f9f9f9;
      cursor: pointer;
    }
    .reaction-button {
      margin: 0 5px;
      cursor: pointer;
      font-size: 1.5rem;
    }
    .reaction[data-type] {
      cursor: pointer;
    }
  `;
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);

  const container = document.getElementById("ltg-wall-container");
  if (!container) return;

  container.innerHTML = "<p>Loading letters…</p>";

  fetch("https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth")
    .then(response => response.text())
    .then(text => {
      const lines = text.trim().split(/\r?\n/);
?
/);
      const lettersArray = [];
      let buffer = "";

      lines.forEach(line => {
        buffer += line.trim() + " ";
        const parts = buffer.split("|");

        if (parts.length < 9) return;

        const [
          letterID,
          readCount,
          displayName,
          heartsCount,
          prayerCount,
          letterContent,
          submissionDate,
          moderatorComments,
          brokenHeartsCount
        ] = parts.map(x => x.trim());

        lettersArray.push({
          letterID,
          readCount,
          displayName,
          heartsCount,
          prayerCount,
          letterContent,
          submissionDate,
          moderatorComments,
          brokenHeartsCount
        });

        buffer = "";
      });

      if (lettersArray.length === 0) {
        container.innerHTML = "<p>No letters found.</p>";
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "table-wrapper";

      const table = document.createElement("table");
      table.innerHTML = `
        <thead>
          <tr>
            <th style="border:1px solid #ccc;padding:8px;">Date</th>
            <th style="border:1px solid #ccc;padding:8px;">Name</th>
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

      lettersArray.forEach(letter => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td style="border:1px solid #ccc;padding:8px;">${letter.submissionDate}</td>
          <td style="border:1px solid #ccc;padding:8px;">${letter.displayName}</td>
          <td class="clickable" style="border:1px solid #ccc;padding:8px;max-width:50ch;white-space:normal;">${letter.letterContent.substring(0, 80)}...</td>
          <td style="border:1px solid #ccc;padding:8px;max-width:50ch;white-space:normal;">${letter.moderatorComments.substring(0, 80)}...</td>
          <td style="border:1px solid #ccc;padding:8px;">${letter.heartsCount}</td>
          <td style="border:1px solid #ccc;padding:8px;">${letter.prayerCount}</td>
          <td style="border:1px solid #ccc;padding:8px;">${letter.brokenHeartsCount}</td>
          <td style="border:1px solid #ccc;padding:8px;">${letter.readCount}</td>
        `;

        tbody.appendChild(row);

        const popupTrigger = row.querySelector("td:nth-child(3)");
        if (popupTrigger) {
          popupTrigger.classList.add("clickable");
          popupTrigger.onclick = () =>
            showPopup(
              letter.displayName,
              letter.submissionDate,
              letter.letterContent,
              letter.moderatorComments,
              parseInt(letter.heartsCount),
              parseInt(letter.prayerCount),
              parseInt(letter.brokenHeartsCount),
              parseInt(letter.readCount),
              letter.letterID
            );
        }
      });

      wrapper.appendChild(table);
      container.innerHTML = "";
      container.appendChild(wrapper);
    })
    .catch(err => {
      container.innerHTML = `<p>Error loading letters: ${err.message}</p>`;
    });

function showPopup(name, date, content, moderator, hearts, prayers, broken, views, id) {
  const formattedDate = (() => {
    const parts = date.split("-");
    return parts.length === 3 ? `${parts[1]}/${parts[2]}/${parts[0]}` : date;
  })();

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
      <p><strong>${formattedDate}</strong></p>

      <p style="margin-bottom:0.25em;font-weight:bold;">Letter:</p>
      <div class="scroll-box">${content}</div>

      <p style="margin-bottom:0.25em;font-weight:bold;">Moderator Comment:</p>
      <div class="scroll-box" style="min-height:4em;">${moderator || '<em>No moderator comments.</em>'}</div>

      <div style="margin-top:1em;font-size:1.5em;display:flex;justify-content:space-around;">
        <div class="reaction" data-type="heart" data-id="${id}">❤️ <span>${hearts}</span></div>
        <div class="reaction" data-type="pray" data-id="${id}">🙏 <span>${prayers}</span></div>
        <div class="reaction" data-type="break" data-id="${id}">💔 <span>${broken}</span></div>
        <div class="reaction read-view" style="pointer-events: none; opacity: 0.6;">📖 <span>${views + 1}</span></div>
      </div>
    </div>
  `;

  document.body.appendChild(popup);

  postReaction({ 
    letterID: id, 
    heartsCount: hearts, 
    prayerCount: prayers, 
    brokenHeartsCount: broken, 
    readCount: views + 1 
  }, "read");

  popup.querySelector("button").onclick = () => popup.remove();
  popup.onclick = e => { if (e.target === popup) popup.remove(); };

  popup.querySelectorAll(".reaction").forEach(el => {
    el.onclick = () => {
      const type = el.dataset.type;
      const id = el.dataset.id;
      const countEl = el.querySelector("span");
      const count = parseInt(countEl.textContent || "0") + 1;
      countEl.textContent = count;

      postReaction({ 
        letterID: id, 
        heartsCount: type === "heart" ? count : hearts, 
        prayerCount: type === "pray" ? count : prayers, 
        brokenHeartsCount: type === "break" ? count : broken, 
        readCount: views + 1 
      }, type);

      el.style.pointerEvents = "none";
    };
  });
}

function postReaction(row, iconType) {
  const delta = {
    letterId: row.letterID,
    hearts: iconType === "heart" ? 1 : 0, prayers: iconType === "pray" ? 1 : 0,
    brokenHearts: iconType === "break" ? 1 : 0, views: iconType === "read" ? 1 : 0
  };
  fetch("https://hook.us2.make.com/llyd2p9njx4s7pqb3krotsvb7wbaso4f", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(delta)
  })
  .then(res => res.text())
  .then(data => console.log("Reaction sync OK:", data))
  .catch(err => console.warn("Reaction sync FAILED:", err));
}

  fetch("https://hook.us2.make.com/llyd2p9njx4s7pqb3krotsvb7wbaso4f", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      letterId: row.letterID,
      hearts: row.heartsCount,
      prayers: row.prayerCount,
      brokenHearts: row.brokenHeartsCount,
      views: row.readCount
    })
  })
  .then(res => res.text())
  .then(data => console.log("Reaction sync OK:", data))
  .catch(err => console.warn("Reaction sync FAILED:", err));
}
})();
