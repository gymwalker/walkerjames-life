// WalkerJames.Life Prayer Wall Embed Script (BASED ON LTG WALL - FIELD NAMES ONLY CHANGED)
// Field Order (confirmed):
// 0: Prayer ID
// 1: View Count
// 2: Display Name
// 3: Hearts Count
// 4: Prayer Count
// 5: Prayer Content
// 6: Submission Date
// 7: Moderator Comments
// 8: Broken Hearts Count

(function () {
  const css = `
    #pray-wall-container {
      max-width: 100%;
      width: 100%;
      padding: 2rem;
      font-family: sans-serif;
      overflow-x: auto;
      box-sizing: border-box;
    }

    #pray-modal {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    #pray-modal-body {
      background: white;
      padding: 2rem;
      max-width: 600px;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
    }
    #pray-close {
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
      max-width: 100%;
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
    .ltg-loading-message {
      font-size: 1.1rem;
      font-weight: 500;
      text-align: center;
      padding: 1rem;
      color: #444;
    }
    .spinner {
      display: inline-block;
      margin-left: 10px;
      width: 1rem;
      height: 1rem;
      border: 2px solid #ccc;
      border-top: 2px solid #333;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      vertical-align: middle;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);

  const container = document.getElementById("pray-wall-container");
  if (!container) return;

  function loadTable() {
    container.innerHTML = '<p class="ltg-loading-message">Loading prayers<span class="spinner"></span></p>';
   
    fetch("https://hook.us2.make.com/usth4qxyezk7yfmdnew21ibgjpnzd4nc")
      .then(response => response.text())
      .then(text => {
        const lines = text.trim().split(/\r?\n/);
        const prayersArray = [];
        let buffer = "";

        lines.forEach((line, index) => {
          buffer += line.trim() + " ";
          const parts = buffer.split("|");

          if (parts.length < 9) return;

          const [
            prayerID,
            viewCount,
            displayName,
            heartsCount,
            prayerCount,
            prayerContent,
            created,
            moderatorComments,
            brokenHeartsCount
          ] = parts.map(x => x.trim());

          prayersArray.push({
            created,
            prayerID,
            viewCount,
            displayName,
            heartsCount,
            prayerCount,
            prayerContent,
            brokenHeartsCount,
            moderatorComments
          });

          buffer = "";
        });

        if (prayersArray.length === 0) {
          container.innerHTML = "<p>No prayers found.</p>";
          return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "table-wrapper";

        const table = document.createElement("table");
        table.style.width = "100%";
        table.innerHTML = `
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Prayer</th>
              <th>Moderator Comments</th>
              <th title="Hearts">❤️</th>
              <th title="Prayers">🙏</th>
              <th title="Broken Hearts">💔</th>
              <th title="Views">📖</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;

        const tbody = table.querySelector("tbody");

        prayersArray.forEach((prayer, idx) => {
          const row = document.createElement("tr");
          row.dataset.prayerId = prayer.prayerID;

          row.innerHTML = `
            <td>${prayer.created}</td>
            <td>${prayer.displayName}</td>
            <td class="clickable">${prayer.prayerContent.substring(0, 80)}...</td>
            <td>${prayer.moderatorComments.substring(0, 80)}...</td>
            <td>${prayer.heartsCount}</td>
            <td>${prayer.prayerCount}</td>
            <td>${prayer.brokenHeartsCount}</td>
            <td>${prayer.viewCount}</td>
          `;

          tbody.appendChild(row);

          const popupTrigger = row.querySelector("td:nth-child(3)");
          if (popupTrigger) {
            popupTrigger.classList.add("clickable");
            popupTrigger.onclick = () =>
              showPopup(
                prayer.displayName,
                prayer.created,
                prayer.prayerContent,
                prayer.moderatorComments,
                parseInt(prayer.heartsCount),
                parseInt(prayer.prayerCount),
                parseInt(prayer.brokenHeartsCount),
                parseInt(prayer.viewCount),
                prayer.prayerID
              );
          }
        });

        wrapper.appendChild(table);
        container.innerHTML = "";
        container.appendChild(wrapper);
      })
      .catch(err => {
        container.innerHTML = `<p>Error loading prayers: ${err.message}</p>`;
      });
  }

  function showPopup(name, date, content, moderator, hearts, prayers, broken, views, id) {
    const formattedDate = (() => {
      const parts = date.split("-");
      return parts.length === 3 ? `${parts[1]}/${parts[2]}/${parts[0]}` : date;
    })();

    let heartDelta = 0;
    let prayerDelta = 0;
    let brokenDelta = 0;
    let viewDelta = 1;

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
        <p style="margin-bottom:0.25em;font-weight:bold;">Prayer:</p>
        <div class="scroll-box">${content}</div>
        <p style="margin-bottom:0.25em;font-weight:bold;">Moderator Comment:</p>
        <div class="scroll-box">${moderator || "<em>No moderator comments.</em>"}</div>
        <div style="margin-top:1em;font-size:1.5em;display:flex;justify-content:space-around;">
          <div class="reaction" data-type="heart" data-id="${id}">❤️ <span>${hearts}</span></div>
          <div class="reaction" data-type="pray" data-id="${id}">🙏 <span>${prayers}</span></div>
          <div class="reaction" data-type="break" data-id="${id}">💔 <span>${broken}</span></div>
          <div class="reaction read-view" style="pointer-events: none; opacity: 0.6;">📖 <span>${views + 1}</span></div>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    const clicked = { heart: false, pray: false, break: false };

    popup.querySelectorAll(".reaction").forEach(el => {
      el.onclick = () => {
        const type = el.dataset.type;
        if (clicked[type]) return;
        clicked[type] = true;

        const countEl = el.querySelector("span");
        const count = parseInt(countEl.textContent || "0") + 1;
        countEl.textContent = count;

        if (type === "heart") heartDelta = 1;
        if (type === "pray") prayerDelta = 1;
        if (type === "break") brokenDelta = 1;

        el.style.pointerEvents = "none";
      };
    });

    const sendReactionUpdate = () => {
      postReaction(
        {
          prayerID: id,
          heartsCount: hearts + heartDelta,
          prayerCount: prayers + prayerDelta,
          brokenHeartsCount: broken + brokenDelta,
          viewCount: views + viewDelta
        },
        {
          prayerId: id,
          hearts: heartDelta,
          prayers: prayerDelta,
          brokenHearts: brokenDelta,
          views: viewDelta
        }
      );
    };

    popup.querySelector("button").onclick = () => {
      sendReactionUpdate();
      popup.remove();
    };

    popup.onclick = e => {
      if (e.target === popup) {
        sendReactionUpdate();
        popup.remove();
      }
    };
  }

  function postReaction(updatedCounts, deltas) {
    if (deltas.prayerId && deltas.prayerId.trim() !== "") {
      const endpoint = "https://hook.us2.make.com/3s4f25oqjtsm7pw4qkxyq114hn25kbq2";

      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deltas)
      })
        .then(res => res.text())
        .then(data => {
          console.log("✅ Delta update sent:", data);
          document.getElementById("pray-wall-container").innerHTML =
            '<p class="ltg-loading-message">Refreshing Prayers...<span class="spinner"></span></p>';
          setTimeout(() => {
            loadTable();
          }, 2000);
        })
        .catch(err => console.warn("❌ Delta update failed:", err));
    } else {
      console.warn("Invalid prayerId, skipping Make call. Payload was:", deltas);
    }
  }

  // Initial render
  loadTable();
})();
