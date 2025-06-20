(function () {
  const css = `...`; // Keep your existing CSS
  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);

  const container = document.getElementById('ltg-wall-container');
  container.innerHTML = `<div id="ltg-modal"><div id="ltg-modal-body"></div></div><div class="table-wrapper"><table><thead><tr><th>Date</th><th>Name</th><th>Letter</th><th>Moderator Comment</th><th>❤️</th><th>🙏</th><th>💔</th><th>📖</th></tr></thead><tbody id="letters-grid"></tbody></table></div>`;

  const grid = document.getElementById('letters-grid');
  const modal = document.getElementById('ltg-modal');
  const modalBody = document.getElementById('ltg-modal-body');
  const API_URL = 'https://walkerjames-life.netlify.app/.netlify/functions/getLetters?list=true';
  const REACT_URL = 'https://walkerjames-life.netlify.app/.netlify/functions/postReaction';
  let currentReactionBuffer = {};

  console.log("Attempting to fetch data from:", API_URL);
  fetch(API_URL)
    .then(res => {
      console.log("Fetch response status:", res.status, res.statusText);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status} ${res.statusText}`);
      return res.json();
    })
    .then(data => {
      console.log("Raw data received:", data);
      if (!data || !data.records || !Array.isArray(data.records)) {
        console.error("Invalid data structure:", data);
        grid.innerHTML = '<tr><td colspan="8">No valid letters data received.</td></tr>';
        return;
      }
      const sorted = data.records
        .filter(r => r.fields && r.fields['Approval Status'] === 'Approved' &&
          ['Yes, share publicly (first name only)', 'Yes, but anonymously'].includes(r.fields['Share Publicly']))
        .sort((a, b) => new Date(b.fields['Submission Date']) - new Date(a.fields['Submission Date']));

      if (sorted.length === 0) {
        grid.innerHTML = '<tr><td colspan="8">No approved letters available.</td></tr>';
        return;
      }

      sorted.forEach(({ id, fields }) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${fields['Submission Date'] || ''}</td>
          <td>${fields['Display Name'] || 'Anonymous'}</td>
          <td>${(fields['Letter Content'] || '').substring(0, 80)}...</td>
          <td>${fields['Moderator Comments'] || ''}</td>
          <td>${fields['Hearts Count'] || 0}</td>
          <td>${fields['Prayer Count'] || 0}</td>
          <td>${fields['Broken Hearts Count'] || 0}</td>
          <td>${fields['View Count'] || 0}</td>
        `;
        row.addEventListener('click', () => { /* Keep your existing modal logic */ });
        grid.appendChild(row);
      });
    })
    .catch(err => {
      console.error("Fetch error details:", err);
      grid.innerHTML = '<tr><td colspan="8">Failed to load letters. Please try again later. Error: ' + err.message + '</td></tr>';
    });

  // Keep your existing closeModalAndSync function
})();
