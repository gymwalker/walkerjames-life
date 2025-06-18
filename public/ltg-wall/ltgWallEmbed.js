(function () {
  const css = `
    #ltg-wall-container {
      padding: 2rem;
      font-family: sans-serif;
    }
    table {
      width: 100%;
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
      width: 100px;
      white-space: nowrap;
    }
    th:nth-child(2), td:nth-child(2) {
      width: 120px;
    }
    th:nth-child(3), td:nth-child(3),
    th:nth-child(4), td:nth-child(4) {
      width: 260px;
    }
    th:nth-child(n+5), td:nth-child(n+5) {
      width: 40px;
      text-align: center;
    }
    tr:hover {
      background-color: #f9f9f9;
    }
  `;

  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);

  const container = document.getElementById('ltg-wall-container');
  container.innerHTML = `
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
  `;

  const grid = document.getElementById('letters-grid');
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
          <td>${fields['Letter Content'].substring(0, 60)}...</td>
          <td>${fields['Moderator Comments'] || ''}</td>
          <td>${fields['Hearts Count'] || 0}</td>
          <td>${fields['Prayer Count'] || 0}</td>
          <td>${fields['Broken Heart Count'] || 0}</td>
          <td>${fields['View Count'] || 0}</td>
        `;
        grid.appendChild(row);
      });
    })
    .catch(err => {
      console.error(err);
      grid.innerHTML = '<tr><td colspan="8">Failed to load letters. Please try again later.</td></tr>';
    });
})();
