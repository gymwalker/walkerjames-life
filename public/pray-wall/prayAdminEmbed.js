// prayAdminEmbed.js (WalkerJames.Life Prayer Admin Page Script)
// Modeled after ltgAdminEmbed.js — adapted for Prayer Requests

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
    .pray-loading-message {
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

  const container = document.getElementById("pray-wall-container");
  if (!container) return;

  function formatDate(isoDate) {
    const [year, month, day] = isoDate.split("-");
    return `${month}/${day}/${year}`;
  }

  function loadTable() {
    container.innerHTML = '<p class="pray-loading-message">Loading pending prayers<span class="spinner"></span></p>';
    fetch("https://hook.us2.make.com/n7tud6lx4cpwhws13p9qxrrvmyu5km4d")
      .then(r => r.text())
      .then(text => {
        if (!text.includes("|")) {
          container.innerHTML = `
            <div class="pray-loading-message">
              There are currently no prayers awaiting review or the server returned invalid data.
            </div>
          `;
          return;
        }

        const records = text.trim().split("|||END|||");
        const prayers = [];

        records.forEach(raw => {
          if (!raw.trim()) return;
          const parts = raw.split("|");

          if (parts.length < 10) return;

          const [
            email,
            lastName,
            prayerID,
            firstName,
            canRespond,
            prayerContent,
            sharePublicly,
            status,
            submissionDate,
            moderatorCommentsRaw
          ] = parts.map(x => x.trim());

          prayers.push({
            prayerID,
            submissionDate,
            displayName: firstName || "Anonymous",
            prayerContent,
            status,
            moderatorComments: moderatorCommentsRaw
          });
        });

        if (!prayers || prayers.length === 0) {
          container.innerHTML = `
            <div class="pray-loading-message">
              There are currently no prayers awaiting review. Please check back later.
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
              <th>Prayer</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;
        const tbody = table.querySelector("tbody");
        prayers.forEach(({ prayerID, submissionDate, displayName, prayerContent, status, moderatorComments }) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${formatDate(submissionDate)}</td>
            <td>${displayName}</td>
            <td class="clickable">${prayerContent.slice(0, 80)}...</td>
            <td>${status}</td>
            <td><button data-id="${prayerID}" class="open-btn">Open</button></td>
          `;
          tbody.appendChild(row);
        });

        wrapper.appendChild(table);
        container.innerHTML = "";
        container.appendChild(wrapper);

        document.querySelectorAll(".open-btn").forEach(btn => {
          btn.onclick = () => {
            const prayer = prayers.find(p => p.prayerID === btn.dataset.id);
            if (prayer) showModal(prayer);
          };
        });
      });
  }

  function showModal({ prayerID, submissionDate, displayName, prayerContent, status, moderatorComments }) {
    const overlay = document.createElement("div");
    overlay.id = "pray-modal";
    overlay.style.display = "flex";
    overlay.innerHTML = `
      <div class="modal-box">
        <button onclick="document.getElementById('pray-modal').remove()" style="position:absolute;top:10px;right:15px;font-size:24px;background:none;border:none;cursor:pointer;">&times;</button>
        <h3>${displayName} (${formatDate(submissionDate)})</h3>
        <p><strong>Prayer Request:</strong></p>
        <div class="admin-scroll">${prayerContent}</div>
        <label><strong>Status:</strong><br>
          <select id="pray-status">
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
            <option>Needs Review</option>
          </select>
        </label><br><br>
        <label><strong>Moderator Comments:</strong><br>
          <textarea id="pray-comments"
                    rows="10"
                    style="width:100%; white-space:pre-wrap; overflow-y:auto; resize:vertical; padding:0.5rem; font-family:inherit; font-size:1rem;"></textarea>
        </label><br><br>
        <button id="pray-save" style="margin-top:1rem;">Save Changes</button>
      </div>
    `;

    document.body.appendChild(overlay);
    document.getElementById("pray-status").value = status;
    document.getElementById("pray-comments").textContent = moderatorComments;

    document.getElementById("pray-save").onclick = () => {
      const newStatus = document.getElementById("pray-status").value;
      const newComments = document.getElementById("pray-comments").value;
      fetch("https://hook.us2.make.com/c2catknq3ticshw97xcw9pbirkjr734s", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prayerId: prayerID,
          status: newStatus,
          moderatorComments: newComments
        })
      })
      .then(() => {
        overlay.remove();
        container.innerHTML = `<p class="pray-loading-message">Refreshing prayers…<span class="spinner"></span></p>`;
        setTimeout(loadTable, 2000);
      });
    };
  }

  loadTable();
})();
