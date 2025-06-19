(function () {
  const airtableReadEndpoint = "https://walkerjames-life.netlify.app/.netlify/functions/airtableRead";
  const airtableReactionEndpoint = "https://walkerjames-life.netlify.app/.netlify/functions/updateReaction";

  const script = document.currentScript;
  const container = document.createElement("div");
  container.id = "ltg-wall-container";
  script.parentNode.insertBefore(container, script.nextSibling);

  const css = `
    #ltg-wall-container {
      font-family: sans-serif;
      margin-top: 2em;
    }
    #ltg-wall-container table {
      width: 100%;
      border-collapse: collapse;
    }
    #ltg-wall-container th, td {
      border-bottom: 1px solid #ccc;
      padding: 0.5em;
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
      z-index: 9999;
    }
    #ltg-modal-body {
      background: white;
      padding: 2em;
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
      margin-bottom: 1em;
      white-space: pre-wrap;
    }
    .ltg-reaction {
      cursor: pointer;
      font-size: 1.2rem;
      margin-right: 0.8rem;
    }
  `;

  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);

  const modal = document.createElement("div");
  modal.id = "ltg-modal";
  modal.innerHTML = `
    <div id="ltg-modal-body">
      <span id="ltg-close">&times;</span>
      <h2 id="ltg-name"></h2>
      <div class="scroll-box" id="ltg-letter"></div>
      <div>
        <span class="ltg-reaction" data-reaction="Love">❤️ <span id="love-count">0</span></span>
        <span class="ltg-reaction" data-reaction="Prayer">🙏 <span id="prayer-count">0</span></span>
        <span class="ltg-reaction" data-reaction="Broken">💔 <span id="broken-count">0</span></span>
        <span class="ltg-reaction" data-reaction="Read">📖 <span id="read-count">0</span></span>
      </div>
      <p><strong>Moderator Comment:</strong> <span id="ltg-moderator">None</span></p>
      <p><strong>Date:</strong> <span id="ltg-date"></span></p>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("ltg-close").onclick = () => {
    modal.style.display = "none";
  };

  async function fetchLetters() {
    container.innerHTML = "<p>Loading letters...</p>";
    try {
      const response = await fetch(airtableReadEndpoint);
      const data = await response.json();

      const approved = data.records.filter(r =>
        ["Yes, share publicly (first name only)", "Yes, but anonymously"].includes(r.fields["Share Publicly"]) &&
        r.fields["Approval Status"] === "Approved"
      );

      let html = "<table><thead><tr><th>Date</th><th>Name</th><th>Letter</th></tr></thead><tbody>";
      approved.forEach((record, i) => {
        html += `
          <tr id="ltg-letter-row" data-index="${i}">
            <td>${record.fields["Date"] || ""}</td>
            <td>${record.fields["Display Name"] || ""}</td>
            <td>${record.fields["Letter"]?.substring(0, 60) || ""}...</td>
          </tr>
        `;
      });
      html += "</tbody></table>";
      container.innerHTML = html;

      document.querySelectorAll("#ltg-letter-row").forEach(row => {
        row.onclick = () => showLetter(approved[row.dataset.index]);
      });
    } catch (err) {
      console.error("Error fetching letters:", err);
      container.innerHTML = "<p>Failed to load letters. Please try again later.</p>";
    }
  }

  function showLetter(record) {
    document.getElementById("ltg-name").innerText = record.fields["Display Name"] || "";
    document.getElementById("ltg-letter").innerText = record.fields["Letter"] || "";
    document.getElementById("ltg-date").innerText = record.fields["Date"] || "";
    document.getElementById("ltg-moderator").innerText = record.fields["Moderator Comment"] || "None";
    document.getElementById("love-count").innerText = record.fields["Love Count"] || 0;
    document.getElementById("prayer-count").innerText = record.fields["Prayer Count"] || 0;
    document.getElementById("broken-count").innerText = record.fields["Broken Heart Count"] || 0;
    document.getElementById("read-count").innerText = record.fields["Read/View Count"] || 0;

    modal.style.display = "flex";

    // Auto-increment read count
    sendReaction(record.id, "Read");
  }

  function sendReaction(recordId, type) {
    fetch(airtableReactionEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordId, reactionType: type })
    });
  }

  document.querySelectorAll(".ltg-reaction").forEach(btn => {
    btn.addEventListener("click", function () {
      const type = this.dataset.reaction;
      const recordId = document.querySelector("#ltg-name").dataset.recordId;
      if (recordId) sendReaction(recordId, type);
    });
  });

  fetchLetters();
})();
