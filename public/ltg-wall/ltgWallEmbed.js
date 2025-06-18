
(function () {
  const css = `
    #ltg-wall-container {
      font-family: 'Georgia', serif;
      background-color: #fffaf4;
      max-width: 1000px;
      margin: 2rem auto;
      padding: 1rem;
    }
    table#letters-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }
    table#letters-table th, table#letters-table td {
      border-bottom: 1px solid #ddd;
      padding: 0.75rem;
      text-align: left;
    }
    table#letters-table tr:hover {
      background-color: #f5f5f5;
      cursor: pointer;
    }
    #ltg-modal {
      display: none;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(0,0,0,0.6);
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }
    #ltg-modal-content {
      background: white;
      padding: 2rem;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0,0,0,0.2);
    }
    #ltg-modal-close {
      float: right;
      font-size: 1.5rem;
      cursor: pointer;
    }
  `;

  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);

  const container = document.getElementById('ltg-wall-container');
  container.innerHTML = '<table id="letters-table"><thead><tr><th>Preview</th><th>Name</th><th>❤️</th><th>🙏</th></tr></thead><tbody id="letters-grid"></tbody></table><div id="ltg-modal"><div id="ltg-modal-content"><span id="ltg-modal-close">&times;</span><div id="ltg-modal-body"></div></div></div>';
  const grid = document.getElementById('letters-grid');

  const API_URL = 'https://walkerjames-life.netlify.app/.netlify/functions/updateReaction?list=true';

  fetch(API_URL)
    .then(res => res.json())
    .then(({ records }) => {
      if (!records || !records.length) {
        grid.innerHTML = '<tr><td colspan="4">No letters found.</td></tr>';
        return;
      }

      // Sort by Submission Date descending
      records.sort((a, b) => {
        const da = new Date(a.fields["Submission Date"] || 0);
        const db = new Date(b.fields["Submission Date"] || 0);
        return db - da;
      });

      records.forEach(({ fields }) => {
        if (!fields || !fields["Letter Content"]) return;

        const row = document.createElement('tr');
        const preview = fields["Letter Content"].slice(0, 60).replace(/\n/g, ' ') + (fields["Letter Content"].length > 60 ? "..." : "");

        row.innerHTML = `
          <td>${preview}</td>
          <td>${fields["Display Name"] || "Anonymous"}</td>
          <td>${fields["Hearts Count"] || 0}</td>
          <td>${fields["Prayer Count"] || 0}</td>
        `;

        row.addEventListener('click', () => {
          const modal = document.getElementById('ltg-modal');
          const modalBody = document.getElementById('ltg-modal-body');
          modalBody.innerHTML = `
            <h3>${fields["Display Name"] || "Anonymous"}</h3>
            <p style="white-space: pre-wrap;">${fields["Letter Content"]}</p>
            <p>❤️ ${fields["Hearts Count"] || 0} &nbsp; 🙏 ${fields["Prayer Count"] || 0}</p>
          `;
          modal.style.display = 'flex';
        });

        grid.appendChild(row);
      });

      document.getElementById('ltg-modal-close').onclick = () => {
        document.getElementById('ltg-modal').style.display = 'none';
      };
      window.onclick = function(event) {
        const modal = document.getElementById('ltg-modal');
        if (event.target === modal) {
          modal.style.display = 'none';
        }
      };
    })
    .catch(err => {
      console.error(err);
      grid.innerHTML = '<tr><td colspan="4" style="color:red;">Failed to load letters. Please try again later.</td></tr>';
    });
})();
