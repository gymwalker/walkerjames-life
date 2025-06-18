(function () {
  const css = `
    #ltg-wall-container {
      padding: 2rem;
      font-family: "Century Gothic", sans-serif;
    }
    #letters-grid {
      width: 100%;
      border-collapse: collapse;
    }
    #letters-grid th, #letters-grid td {
      padding: 0.75rem;
      border: 1px solid #ddd;
      text-align: left;
      vertical-align: top;
    }
    #letters-grid tr:hover {
      background-color: #f9f9f9;
      cursor: pointer;
    }
    .modal {
      display: none;
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.7);
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background: white;
      padding: 2rem;
      max-width: 600px;
      width: 90%;
      border-radius: 8px;
      position: relative;
    }
    .modal-content h3 {
      margin-top: 0;
    }
    .modal-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 1.5rem;
      cursor: pointer;
    }
  `;

  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);

  const container = document.getElementById('ltg-wall-container');
  container.innerHTML = `
    <table id="letters-grid">
      <thead>
        <tr>
          <th>Preview</th>
          <th>Name</th>
          <th>❤️</th>
          <th>🙏</th>
          <th>💔</th>
          <th>📖</th>
          <th>Response</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
    <div id="ltg-modal" class="modal">
      <div class="modal-content">
        <span class="modal-close" onclick="document.getElementById('ltg-modal').style.display='none'">&times;</span>
        <div id="ltg-modal-body"></div>
      </div>
    </div>
  `;

  const grid = container.querySelector('tbody');
  const API_URL = 'https://walkerjames-life.netlify.app/.netlify/functions/updateReaction?list=true';

  fetch(API_URL)
    .then(res => {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) return res.json();
      throw new Error('Unexpected response');
    })
    .then(({ records }) => {
      if (!records || !records.length) {
        grid.innerHTML = `<tr><td colspan="8">No letters found.</td></tr>`;
        return;
      }

      records
        .filter(r => r.fields && r.fields["Letter Content"])
        .sort((a, b) => new Date(b.fields["Submission Date"]) - new Date(a.fields["Submission Date"]))
        .forEach(({ fields }) => {
          const row = document.createElement('tr');

          const preview = fields["Letter Content"].slice(0, 60).replace(/\n/g, ' ') + '...';
          const name = fields["Display Name"] || "Anonymous";
          const hearts = fields["Hearts Count"] || 0;
          const prayers = fields["Prayer Count"] || 0;
          const broken = fields["Broken Heart Count"] || 0;
          const views = fields["View Count"] || 0;
          const response = fields["Moderator Comments"] || '';
          const submitted = fields["Submission Date"] || '';

          row.innerHTML = `
            <td>${preview}</td>
            <td>${name}</td>
            <td>${hearts}</td>
            <td>${prayers}</td>
            <td>${broken}</td>
            <td>${views}</td>
            <td>${response ? '✓' : ''}</td>
            <td>${submitted}</td>
          `;

          row.addEventListener('click', () => {
            const modal = document.getElementById('ltg-modal');
            const modalBody = document.getElementById('ltg-modal-body');
            modalBody.innerHTML = `
              <h3>${name}</h3>
              <p style="white-space: pre-wrap;">${fields["Letter Content"]}</p>
              <p>
                ❤️ ${hearts} &nbsp;
                🙏 ${prayers} &nbsp;
                💔 ${broken} &nbsp;
                📖 ${views}
              </p>
              ${response ? `<p><strong>Moderator:</strong> ${response}</p>` : ''}
              <p><small><em>Submitted: ${submitted}</em></small></p>
            `;
            modal.style.display = 'flex';
          });

          grid.appendChild(row);
        });
    })
    .catch(err => {
      console.error(err);
      grid.innerHTML = `<tr><td colspan="8" style="color: red;">Failed to load letters. Please try again later.</td></tr>`;
    });
})();
