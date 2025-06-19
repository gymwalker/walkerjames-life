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

      const response = await fetch("/.netlify/functions/airtableRead");
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
        </tr>
      `;

      data.records.forEach((record) => {
        const row = document.createElement("tr");
        row.id = "ltg-letter-row";
        row.innerHTML = `
          <td>${record.fields.Date || ""}</td>
          <td>${record.fields["Display Name"] || "Anonymous"}</td>
          <td>${(record.fields.Letter || "").substring(0, 50)}...</td>
        `;
        row.onclick = function () {
          document.getElementById("ltg-modal-content").innerHTML = `
            <h3>${record.fields["Display Name"] || "Anonymous"}</h3>
            <p><strong>Date:</strong> ${record.fields.Date || ""}</p>
            <div class="scroll-box">${record.fields.Letter || ""}</div>
          `;
          modal.style.display = "flex";
        };
        tbody.appendChild(row);
      });

      table.appendChild(thead);
      table.appendChild(tbody);
      container.innerHTML = "";
      container.appendChild(table);
    } catch (err) {
      console.error("Error fetching letters:", err);
      container.innerHTML = "<p>Failed to load letters. Please try again later.</p>";
    }
  }

  fetchLetters();
})();
