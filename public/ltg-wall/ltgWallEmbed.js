// WalkerJames.Life LTG Wall Embed Script
// Updated: Fix layout, restore clickable icon columns, avoid JSON entirely, and show all fields properly

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
      wrapper.style.width = "100%";

      const table = document.createElement("table");
      table.className = "ltg-wall-table";
      table.style.minWidth = "1000px";

      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr>
          <th>Date</th>
          <th>Display Name</th>
          <th style="max-width: 50ch;">Letter</th>
          <th style="max-width: 50ch;">Moderator Comments</th>
          <th title='Prayers'>🙏</th>
          <th title='Hearts'>❤️</th>
          <th title='Broken Hearts'>💔</th>
          <th title='Views'>📖</th>
        </tr>
      `;
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      lettersArray.forEach((line, index) => {
        const [date, name, letterContent, moderator, prayers, hearts, broken, views] = line.split("|").map(val => val.trim());

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${date}</td>
          <td>${name}</td>
          <td class="truncate" style="max-width: 50ch; white-space: normal; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; cursor: pointer;" title="Click to read full letter">${letterContent}</td>
          <td class="truncate" style="max-width: 50ch; white-space: normal; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${moderator}</td>
          <td><span class="icon-btn" data-type="pray" data-index="${index}">🙏</span><br>${prayers}</td>
          <td><span class="icon-btn" data-type="love" data-index="${index}">❤️</span><br>${hearts}</td>
          <td><span class="icon-btn" data-type="break" data-index="${index}">💔</span><br>${broken}</td>
          <td><span class="icon-btn" data-type="read" data-index="${index}">📖</span><br>${views}</td>
        `;
        tr.querySelector("td:nth-child(3)").onclick = () => showPopup(name, date, letterContent, moderator, prayers, hearts, broken, views, index);
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      wrapper.appendChild(table);
      container.innerHTML = "";
      container.appendChild(wrapper);
    })
    .catch(err => {
      container.innerHTML = `<p>Error loading letters: ${err.message}</p>`;
    });

  function showPopup(name, date, content, moderator, prayers, hearts, broken, views, index) {
    const popup = document.createElement("div");
    popup.className = "ltg-popup";
    popup.style.position = "fixed";
    popup.style.top = 0;
    popup.style.left = 0;
    popup.style.width = "100vw";
    popup.style.height = "100vh";
    popup.style.background = "rgba(0, 0, 0, 0.75)";
    popup.style.zIndex = 9999;
    popup.style.display = "flex";
    popup.style.alignItems = "center";
    popup.style.justifyContent = "center";
    popup.innerHTML = `
      <div class="ltg-popup-inner" style="background: white; padding: 2em; max-width: 600px; border-radius: 10px; position: relative;">
        <button class="ltg-popup-close" style="position: absolute; top: 10px; right: 15px; font-size: 24px; background: none; border: none; cursor: pointer;">&times;</button>
        <h3>${name}</h3>
        <p><strong>${date}</strong></p>
        <div class="ltg-popup-letter">${content}</div>
        <p><em>${moderator}</em></p>
        <div class="ltg-popup-reactions" style="margin-top: 1em; font-size: 1.5em; display: flex; justify-content: space-around;">
          <div title="Prayers" class="reaction" data-type="pray" data-index="${index}">🙏 <span>${prayers}</span></div>
          <div title="Hearts" class="reaction" data-type="love" data-index="${index}">❤️ <span>${hearts}</span></div>
          <div title="Broken Hearts" class="reaction" data-type="break" data-index="${index}">💔 <span>${broken}</span></div>
          <div title="Views" class="reaction" data-type="read" data-index="${index}">📖 <span>${views}</span></div>
        </div>
      </div>
    `;

    popup.querySelector(".ltg-popup-close").onclick = () => popup.remove();
    popup.onclick = e => { if (e.target === popup) popup.remove(); };
    document.body.appendChild(popup);

    popup.querySelectorAll(".reaction").forEach(icon => {
      icon.addEventListener("click", () => {
        const type = icon.getAttribute("data-type");
        const index = icon.getAttribute("data-index");
        const countSpan = icon.querySelector("span");
        const newCount = parseInt(countSpan.textContent || "0") + 1;
        countSpan.textContent = newCount;

        fetch("/functions/updateReaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, index })
        }).catch(err => console.warn("Failed to update reaction:", err));

        icon.style.pointerEvents = "none";
      });
    });
  }
})();
