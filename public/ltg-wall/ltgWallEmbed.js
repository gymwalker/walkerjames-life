(function () {
  const script = document.currentScript;
  const container = document.createElement("div");
  container.id = "ltg-wall-container";
  script.parentNode.insertBefore(container, script.nextSibling);

  const css = `
    #ltg-wall-container {
      font-family: sans-serif;
      padding: 2rem;
    }
    #ltg-wall-container table {
      width: 100%;
      border-collapse: collapse;
    }
    #ltg-wall-container th, td {
      border-bottom: 1px solid #ccc;
      padding: 0.5rem;
      text-align: left;
    }
    #ltg-letter-row:hover {
      background-color: #f5f5f5;
      cursor: pointer;
    }
    #ltg-modal {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      justify-content: center;
      align-items: center;
      z-index: 99999;
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
      margin-top: 1rem;
      margin-bottom: 1rem;
    }
    .emoji-btn {
      font-size: 1.3rem;
      margin-right: 10px;
      cursor: pointer;
      border: none;
      background: none;
    }
    .emoji-btn:hover {
      transform: scale(1.2);
    }
    .emoji-count {
      font-size: 0.9rem;
      margin-left: 4px;
    }
  `;
  const style = document.createElement("style");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  fetch("https://walkerjames-life.netlify.app/.netlify/functions/listLetters")
    .then((response) => response.json())
    .then((data) => {
      const table = document.createElement("table");
      const header = document.createElement("tr");
      ["Date", "Name", "Letter"].forEach((h) => {
        const th = document.createElement("th");
        th.textContent = h;
        header.appendChild(th);
      });
      table.appendChild(header);

      data.records.forEach((record) => {
        const row = document.createElement("tr");
        row.id = "ltg-letter-row";
        row.innerHTML = `
          <td>${record.fields["Date"] || ""}</td>
          <td>${record.fields["Display Name"] || ""}</td>
          <td>${record.fields["Letter"]?.slice(0, 50) || ""}...</td>
        `;
        row.onclick = () => showModal(record);
        table.appendChild(row);
      });

      container.appendChild(table);
    })
    .catch((error) => {
      container.textContent = "Failed to load letters. Please try again later.";
      console.error("Error fetching letters:", error);
    });

  function showModal(record) {
    const modal = document.createElement("div");
    modal.id = "ltg-modal";
    modal.innerHTML = `
      <div id="ltg-modal-body">
        <span id="ltg-close">&times;</span>
        <h2>${record.fields["Display Name"]}</h2>
        <div class="scroll-box">${record.fields["Letter"]}</div>
        <div>
          ❤️ <button class="emoji-btn" data-type="Love">❤️</button><span class="emoji-count">${record.fields["Love Count"] || 0}</span>
          🙏 <button class="emoji-btn" data-type="Prayer">🙏</button><span class="emoji-count">${record.fields["Prayer Count"] || 0}</span>
          💔 <button class="emoji-btn" data-type="Broken">💔</button><span class="emoji-count">${record.fields["Broken Count"] || 0}</span>
          📖 <span class="emoji-count">${record.fields["View Count"] || 0}</span>
        </div>
        <p><strong>Moderator Comment:</strong><br>${record.fields["Moderator Comment"] || "None"}</p>
        <p><strong>Date:</strong> ${record.fields["Date"] || ""}</p>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = "flex";

    modal.querySelector("#ltg-close").onclick = () => {
      document.body.removeChild(modal);
    };

    modal.querySelectorAll(".emoji-btn").forEach((btn) => {
      btn.onclick = () => {
        const type = btn.dataset.type;
        fetch("https://walkerjames-life.netlify.app/.netlify/functions/updateReaction", {
          method: "POST",
          body: JSON.stringify({
            recordId: record.id,
            reactionType: type,
          }),
        })
          .then((res) => res.json())
          .then(() => {
            location.reload(); // Refresh the page to show updated counts
          });
      };
    });
  }
})();
