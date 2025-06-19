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
    .ltg-letter-row:hover {
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
      padding: 1em 0;
    }
    .emoji-bar {
      font-size: 1.3em;
      padding-top: 1em;
    }
  `;
  const style = document.createElement("style");
  style.innerText = css;
  document.head.appendChild(style);

  const airtableUrl = "https://api.airtable.com/v0/appaA8MFWiiWjXwSQ/Letters";
  const apiKey = "keyWYOURKEYHERE"; // Replace with your actual Airtable key

  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };

  const containerEl = document.getElementById("ltg-wall-container");
  const modalEl = document.createElement("div");
  modalEl.id = "ltg-modal";
  modalEl.innerHTML = `
    <div id="ltg-modal-body">
      <span id="ltg-close">&times;</span>
      <h2 id="ltg-modal-name"></h2>
      <div class="scroll-box"><p id="ltg-modal-letter"></p></div>
      <div class="emoji-bar" id="ltg-reactions"></div>
      <p><strong>Moderator Comment:</strong><br><span id="ltg-modal-comment"></span></p>
      <p><strong>Date:</strong> <span id="ltg-modal-date"></span></p>
    </div>
  `;
  document.body.appendChild(modalEl);
  document.getElementById("ltg-close").onclick = () => {
    modalEl.style.display = "none";
  };

  function emojiBlock(code, count) {
    return `<span style="margin-right: 1em;">${code} ${count}</span>`;
  }

  function showModal(record) {
    document.getElementById("ltg-modal-name").textContent = record.fields["Display Name"] || "";
    document.getElementById("ltg-modal-letter").textContent = record.fields["Letter Content"] || "";
    document.getElementById("ltg-modal-date").textContent = record.fields["Submission Date"] || "";
    document.getElementById("ltg-modal-comment").textContent = record.fields["Moderator Comment"] || "None";

    const reactions = emojiBlock("❤️", record.fields["Love Count"] || 0)
                    + emojiBlock("🙏", record.fields["Prayer Count"] || 0)
                    + emojiBlock("💔", record.fields["Broken Heart Count"] || 0)
                    + emojiBlock("📖", record.fields["Read Count"] || 0);
    document.getElementById("ltg-reactions").innerHTML = reactions;

    modalEl.style.display = "flex";
  }

  async function loadLetters() {
    const filterFormula = `AND({Approval Status} = 'Approved', OR({Share Publicly} = 'Yes, but anonymously', {Share Publicly} = 'Yes, share publicly (first name only)'))`;
    const url = `${airtableUrl}?filterByFormula=${encodeURIComponent(filterFormula)}&sort[0][field]=Submission Date&sort[0][direction]=desc`;

    try {
      const response = await fetch(url, { headers });
      const data = await response.json();

      if (!data.records) throw new Error("No records returned.");

      const table = document.createElement("table");
      const thead = document.createElement("thead");
      thead.innerHTML = "<tr><th>Date</th><th>Name</th><th>Letter</th></tr>";
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      for (const record of data.records) {
        const tr = document.createElement("tr");
        tr.className = "ltg-letter-row";
        tr.innerHTML = `
          <td>${record.fields["Submission Date"] || ""}</td>
          <td>${record.fields["Display Name"] || ""}</td>
          <td>${(record.fields["Letter Content"] || "").slice(0, 60)}...</td>
        `;
        tr.onclick = () => showModal(record);
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      containerEl.innerHTML = "";
      containerEl.appendChild(table);

    } catch (err) {
      containerEl.innerHTML = `<p style="color:red;">Failed to load letters. Please try again later.</p>`;
      console.error(err);
    }
  }

  loadLetters();
})();
