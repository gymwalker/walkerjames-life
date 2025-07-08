// ltgAdminEmbed.js (WalkerJames.Life LTG Admin Page Script)
// Based on ltgWallEmbed.js - adds Approve/Reject functionality

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
      max-width: 600px;
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

  function loadTable() {
    container.innerHTML = '<p class="ltg-loading-message">Loading pending letters<span class="spinner"></span></p>';
    fetch("https://hook.us2.make.com/f69bd7qoiatb8ivuw6bl54m5ruarpnk4")
      .then(r => r.text())
      .then(text => {
        const lines = text.trim().split(/\r?\n/);
        const letters = lines.map(l => l.trim().split("|").map(s => s.trim()));

        const wrapper = document.createElement("div");
        wrapper.className = "table-wrapper";
        const table = document.createElement("table");
        table.innerHTML = `
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Letter</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;
        const tbody = table.querySelector("tbody");

        letters.forEach(parts => {
          const [letterID, submissionDate, displayName, letterContent, approvalStatus, moderatorComments] = parts;
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${submissionDate}</td>
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
          btn.onclick = () => showModal(btn.dataset.id, letters.find(l => l[0] === btn.dataset.id));
        });
      });
  }

  function showModal(letterID, fields) {
    const [id, date, name, content, status, comments] = fields;
    const overlay = document.createElement("div");
    overlay.id = "ltg-modal";
    overlay.style.display = "flex";
    overlay.innerHTML = `
      <div class="modal-box">
        <button onclick="document.getElementById('ltg-modal').remove()" style="position:absolute;top:10px;right:15px;font-size:24px;background:none;border:none;cursor:pointer;">&times;</button>
        <h3>${name} (${date})</h3>
        <p><strong>Letter:</strong></p>
        <div class="admin-scroll">${content}</div>
        <label><strong>Approval Status:</strong><br>
          <select id="ltg-status">
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Needs Review</option>
          </select>
        </label><br><br>
        <label><strong>Moderator Comments:</strong><br>
          <textarea id="ltg-comments" rows="4" style="width:100%;">${comments || ""}</textarea>
        </label><br><br>
        <button id="ltg-save" style="margin-top:1rem;">Save Changes</button>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("ltg-status").value = status;
    document.getElementById("ltg-save").onclick = () => {
      const newStatus = document.getElementById("ltg-status").value;
      const newComments = document.getElementById("ltg-comments").value;
      fetch("https://hook.us2.make.com/cy3gqehwnwcou8vyxhvs6rjcl9j2knay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letterId: id,
          approvalStatus: newStatus,
          moderatorComments: newComments
        })
      })
      .then(() => {
        overlay.remove();
        loadTable();
      });
    };
  }

  loadTable();
})();
