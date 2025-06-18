(function () {
  const css = `
    #ltg-wall-container {
      padding: 2rem;
      font-family: sans-serif;
      overflow-x: auto;
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
    #ltg-modal-body {
      background: white;
      padding: 2rem;
      max-width: 600px;
      border-radius: 8px;
    }
    .table-wrapper {
      min-width: 1300px;
    }
    table {
      width: 100%;
      margin: 0 auto;
      border-collapse: collapse;
      table-layout: fixed;
    }
    th, td {
      border-bottom: 1px solid #ccc;
      padding: 0.5rem;
      text-align: left;
      vertical-align: top;
    }
    th:nth-child(1), td:nth-child(1) {
      width: 140px;
      white-space: nowrap;
    }
    th:nth-child(2), td:nth-child(2) {
      width: 180px;
    }
    th:nth-child(3), td:nth-child(3) {
      width: 300px;
    }
    th:nth-child(4), td:nth-child(4) {
      width: 300px;
    }
    th:nth-child(n+5), td:nth-child(n+5) {
      width: 60px;
      text-align: center;
    }
    tr:hover {
      background-color: #f9f9f9;
      cursor: pointer;
    }
  `;

  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);

  const container = document.getElementById('ltg-wall-container');
  container.innerHTML = `
    <div id="ltg-modal">
      <div id="ltg-modal-body"></div>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Letter</th>
            <th>Moderator Comment</th>
            <th>❤️</th>
            <th>🙏</th>
            <th>💔</th>
            <th>📖</th>
          </tr>
        </thead>
        <tbody id="letters-grid"></tbody>
      </table>
    </div>
  `;

  const grid = document.getElementById('letters-grid');
  const modal = document.getElementById('ltg-modal');
  const modalBody = document.getElementById('ltg-modal-body');

  const API_URL = 'https://walkerjames-life.netlify.app/.netlify/functions/updateReaction?list=true';

  fetch(API_URL)
    .then(res => res.json())
    .then(({ records }) => {
      const sorted = records.sort((a, b) => {
        const dateA = new Date(a.fields['Submission Date']);
        const dateB = new Date(b.fields['Submission Date']);
        return dateB - dateA;
      });

      sorted.forEach(({ fields }) => {
        if (!fields || !fields['Letter Content']) return;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${fields['Submission Date'] || ''}</td>
          <td>${fields['Display Name'] || 'Anonymous'}</td>
          <td>${fields['Letter Content'].substring(0, 80)}...</td>
          <td>${fields['Moderator Comments'] || ''}</td>
          <td>${fields['Hearts Count'] || 0}</td>
          <td>${fields['Prayer Count'] || 0}</td>
          <td>${fields['Broken Heart Count'] || 0}</td>
          <td>${fields['View Count'] || 0}</td>
        `;

        row.addEventListener('click', () => {
          modalBody.innerHTML = `
            <h3>${fields['Display Name'] || 'Anonymous'}</h3>
            <p style="white-space: pre-wrap;">${fields['Letter Content']}</p>
            <p>
              ❤️ ${fields['Hearts Count'] || 0} &nbsp;
              🙏 ${fields['Prayer Count'] || 0} &nbsp;
              💔 ${fields['Broken Heart Count'] || 0} &nbsp;
              📖 ${fields['View Count'] || 0}
            </p>
            <p><strong>Moderator Comment:</strong> ${fields['Moderator Comments'] || 'None'}</p>
            <p><strong>Date:</strong> ${fields['Submission Date'] || ''}</p>
          `;
          modal.style.display = 'flex';
        });

        grid.appendChild(row);
      });
    })
    .catch(err => {
      console.error(err);
      grid.innerHTML = '<tr><td colspan="8">Failed to load letters. Please try again later.</td></tr>';
    });

  modal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
})();
