
// ltgAdminEmbed.js (WalkerJames.Life LTG Admin Page Script)
// Updated to support multi-line Letter Content, reordered field structure, and scrollable Moderator Comments

(function () {
  const css = `
    #ltg-wall-container {
      max-width: 100%;
      width: 100%;
      padding: 2rem;
      font-family: sans-serif;
      overflow-x: auto;
      box-sizing: border-box;
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
    .admin-scroll {
      max-height: 12em;
      overflow-y: auto;
      margin-bottom: 1rem;
      padding: 0.5rem;
      background: #f4f4f4;
      border-radius: 4px;
    }
    .modal-box {
      background: white;
      padding: 2rem;
      max-width: 700px;
      width: 90%;
      border-radius: 8px;
      position: relative;
    }
    .table-wrapper table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border-bottom: 1px solid #ccc;
      padding: 0.5rem;
      text-align: left;
    }
    .clickable { cursor: pointer; }
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
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);

  const container = document.getElementById("ltg-wall-container");
  if (!container) return;

  function formatDate(isoDate) {
    const [year, month, day] = isoDate.split("-");
    return `${month}/${day}/${year}`;
  }

  function loadTable() {
    container.innerHTML = '<p class="ltg-loading-message">Loading pending letters<span class="spinner"></span></p>';
    fetch("https://hook.us2.make.com/f69bd7qoiatb8ivuw6bl54m5ruarpnk4")
      .then(r => r.text())
      .then(text => {
        if (!text.includes("|")) {
          container.innerHTML = `
            <div class="ltg-loading-message">
              There are currently no letters awaiting review or the server returned invalid data.
            </div>
          `;
          return;
        }

        const records = text.trim().split("|||END|||");
        const letters = [];

        records.forEach(raw => {
          if (!raw.trim()) return;
          const parts = raw.split("|");

          if (parts.length < 10) return;

          const [
            email,
            lastName,
            letterID,
            firstName,
            canRespond,
            letterContent,
            sharePublicly,
            approvalStatus,
            submissionDate,
            moderatorCommentsRaw
          ] = parts.map(x => x.trim());

          letters.push({
            letterID,
            submissionDate,
            displayName: firstName || "Anonymous",
            letterContent,
            approvalStatus,
            moderatorComments: moderatorCommentsRaw
          });
        });

        if (!letters || letters.length === 0) {
          container.innerHTML = `
            <div class="ltg-loading-message">
              There are currently no letters awaiting review. Please check back later.
            </div>
          `;
          return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "table-wrapper";
        const table = document.createElement("table");
        table.innerHTML = `
          <thead>
            <tr>
              <th style="min-width: 110px">Date</th>
              <th>Name</th>
              <th>Letter</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;
        const tbody = table.querySelector("tbody");
        letters.forEach(({ letterID, submissionDate, displayName, letterContent, approvalStatus, moderatorComments }) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${formatDate(submissionDate)}</td>
            <td>${displayName}</td>
            <td class="clickable">${letterContent.slice(0, 80)}...</td>
            <td>${approvalStatus}</td>
            <td><button data-id="${letterID}" class="open-btn">Open</button></td>
          `;
          tbody.appendChild(row);
        });

        wrapper.appendChild(table);
        container.innerHTML = "";
        container.appendChild(wrapper);

        document.querySelectorAll(".open-btn").forEach(btn => {
          btn.onclick = () => {
            const letter = letters.find(l => l.letterID === btn.dataset.id);
            if (letter) showModal(letter);
          };
        });
      });
  }

  function showModal({ letterID, submissionDate, displayName, letterContent, approvalStatus, moderatorComments }) {
    const overlay = document.createElement("div");
    overlay.id = "ltg-modal";
    overlay.style.display = "flex";
    overlay.innerHTML = `
      <div class="modal-box">
        <button onclick="document.getElementById('ltg-modal').remove()" style="position:absolute;top:10px;right:15px;font-size:24px;background:none;border:none;cursor:pointer;">&times;</button>
        <h3>${displayName} (${formatDate(submissionDate)})</h3>
        <p><strong>Letter:</strong></p>
        <div class="admin-scroll">${letterContent}</div>
        <label><strong>Approval Status:</strong><br>
          <select id="ltg-status">
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Needs Review</option>
          </select>
        </label><br><br>
        <label><strong>Moderator Comments:</strong><br>
          <textarea id="ltg-comments"
                    rows="10"
                    style="width:100%; white-space:pre-wrap; overflow-y:auto; resize:vertical; padding:0.5rem; font-family:inherit; font-size:1rem;"></textarea>
        </label><br><br>
        <button id="ltg-save" style="margin-top:1rem;">Save Changes</button>
      </div>
    `;

    document.body.appendChild(overlay);
    document.getElementById("ltg-status").value = approvalStatus;
    document.getElementById("ltg-comments").textContent = moderatorComments;

    document.getElementById("ltg-save").onclick = () => {
      const newStatus = document.getElementById("ltg-status").value;
      const newComments = document.getElementById("ltg-comments").value;
      fetch("https://hook.us2.make.com/cy3gqehwnwcou8vyxhvs6rjcl9j2knay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letterId: letterID,
          approvalStatus: newStatus,
          moderatorComments: newComments
        })
      })
      .then(() => {
        overlay.remove();
        container.innerHTML = `<p class="ltg-loading-message">Refreshing letters…<span class="spinner"></span></p>`;
        setTimeout(loadTable, 2000);
      });
    };
  }

  loadTable();
})();
