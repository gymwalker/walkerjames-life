(function () {
  const script = document.currentScript;
  const container = document.createElement("div");
  container.id = "ltg-wall-container";
  script.parentNode.insertBefore(container, script.nextSibling);

  const css = `
    #ltg-wall-container {
      font-family: sans-serif;
      padding: 2rem;
      overflow-x: auto;
    }
    #ltg-wall-container table {
      width: max-content;
      border-collapse: collapse;
      min-width: 100%;
    }
    #ltg-wall-container th, td {
      border-bottom: 1px solid #ccc;
      padding: 0.5rem;
      text-align: left;
      white-space: nowrap;
    }
    #ltg-letter-row:hover {
      background-color: #f5f5f5;
      cursor: pointer;
    }
    #ltg-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.6);
      justify-content: center;
      align-items: center;
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
      padding-right: 1em;
    }
  `;

  const style = document.createElement("style");
  style.innerText = css;
  document.head.appendChild(style);

  const modal = document.createElement("div");
  modal.id = "ltg-modal";
  modal.innerHTML = `
    <div id="ltg-modal-body">
      <div id="ltg-close">&times;</div>
      <div id="ltg-modal-content"></div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("ltg-close").onclick = function () {
    modal.style.display = "none";
  };

  async function fetchLetters() {
    try {
      container.innerHTML = "<p>Loading letters...</p>";

      const response = await fetch("/.netlify/functions/updateReaction?list=true");
      const data = await response.json();

      if (!data.records || data.records.length === 0) {
        container.innerHTML = "<p>No public letters found.</p>";
        return;
      }

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      const tbody = document.createElement("tbody");

      thead.innerHTML = `
        <tr>
          <th>Date</th>
          <th>Name</th>
          <th>Letter</th>
          <th>❤️</th>
          <th>🙏</th>
          <th>💔</th>
          <th>📖</th>
        </tr>
      `;

      data.records.forEach((record) => {
        const row = document.createElement("tr");
        row.id = "ltg-letter-row";
        const fields = record.fields;

        row.innerHTML = `
          <td>${fields.Date || ""}</td>
          <td>${fields["Display Name"] || "Anonymous"}</td>
          <td>${(fields.Letter || "").substring(0, 50)}...</td>
          <td><span class="reaction" data-type="Heart" data-id="${record.id}">❤️ ${fields.Heart || 0}</span></td>
          <td><span class="reaction" data-type="Prayer" data-id="${record.id}">🙏 ${fields.Prayer || 0}</span></td>
          <td><span class="reaction" data-type="Broken" data-id="${record.id}">💔 ${fields.Broken || 0}</span></td>
          <td><span class="reaction" data-type="Bible" data-id="${record.id}">📖 ${fields.Bible || 0}</span></td>
        `;

        row.onclick = function (e) {
          if (e.target.classList.contains("reaction")) return;

          document.getElementById("ltg-modal-content").innerHTML = `
            <h3>${fields["Display Name"] || "Anonymous"}</h3>
            <p><strong>Date:</strong> ${fields.Date || ""}</p>
            <div class="scroll-box">${fields.Letter || ""}</div>
          `;
          modal.style.display = "flex";
        };

        tbody.appendChild(row);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      container.innerHTML = "";
      container.appendChild(table);

      // Attach event listeners for reactions
      document.querySelectorAll(".reaction").forEach(el => {
        el.addEventListener("click", async function (e) {
          e.stopPropagation();
          const type = this.dataset.type;
          const id = this.dataset.id;

          const countMatch = this.textContent.match(/\d+$/);
          const currentCount = countMatch ? parseInt(countMatch[0]) : 0;
          const newCount = currentCount + 1;
          this.innerHTML = `${this.textContent.slice(0, 2)} ${newCount}`;

          await fetch("/.netlify/functions/updateReaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              recordId: id,
              reactions: { [type]: 1 }
            })
          });
        });
      });
    } catch (err) {
      console.error("Error fetching letters:", err);
      container.innerHTML = "<p>Failed to load letters. Please try again later.</p>";
    }
  }

  fetchLetters();
})();
