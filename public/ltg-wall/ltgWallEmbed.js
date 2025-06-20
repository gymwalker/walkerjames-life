(function () {
  const css = `
    #ltg-wall-container { padding: 2rem; font-family: sans-serif; overflow-x: auto; }
    #ltg-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 9999; }
    #ltg-modal-body { background: white; padding: 2rem; max-width: 600px; border-radius: 8px; overflow: hidden; position: relative; }
    #ltg-close { position: absolute; top: 10px; right: 14px; font-size: 1.5rem; cursor: pointer; }
    .scroll-box { max-height: 12em; overflow-y: auto; margin-bottom: 1rem; padding: 0.5rem; background: #f4f4f4; border-radius: 4px; }
    .table-wrapper { overflow-x: auto; display: block; max-width: 100%; }
    table { min-width: 900px; }
    th, td { border-bottom: 1px solid #ccc; padding: 0.5rem; text-align: left; vertical-align: top; font-size: 1rem; }
    th:nth-child(n+5), td:nth-child(n+5) { text-align: center; }
    tr:hover { background-color: #f9f9f9; cursor: pointer; }
    .reaction-button { margin: 0 5px; cursor: pointer; font-size: 1.5rem; }
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
  const API_URL = 'https://walkerjames-life.netlify.app/.netlify/functions/getLetters?list=true';
  const REACT_URL = 'https://walkerjames-life.netlify.app/.netlify/functions/postReaction';
  let currentReactionBuffer = {};

  fetch(API_URL)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(({ records }) => {
      if (!records) {
        grid.innerHTML = '<tr><td colspan="8">No letters available.</td></tr>';
        return;
      }
      const sorted = records
        .filter(r => r.fields && r.fields['Approval Status'] === 'Approved' &&
          ['Yes, share publicly (first name only)', 'Yes, but anonymously'].includes(r.fields['Share Publicly']))
        .sort((a, b) => new Date(b.fields['Submission Date']) - new Date(a.fields['Submission Date']));

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

        row.addEventListener('click', () => {
          currentReactionBuffer = { id, reactions: { 'View Count': (fields['View Count'] || 0) + 1 } };
          modalBody.innerHTML = `
            <span id="ltg-close">×</span>
            <h3>${fields['Display Name'] || 'Anonymous'}</h3>
            <div class="scroll-box">${fields['Letter Content'] || ''}</div>
            <p>
              <span class="reaction-button" data-id="${id}" data-type="Hearts Count">❤️ ${fields['Hearts Count'] || 0}</span>
              <span class="reaction-button" data-id="${id}" data-type="Prayer Count">🙏 ${fields['Prayer Count'] || 0}</span>
              <span class="reaction-button" data-id="${id}" data-type="Broken Hearts Count">💔 ${fields['Broken Hearts Count'] || 0}</span>
              <span class="reaction-button">📖 ${(fields['View Count'] || 0) + 1}</span>
            </p>
            <p><strong>Moderator Comment:</strong> <div class="scroll-box">${fields['Moderator Comments'] || 'None'}</div></p>
            <p><strong>Date:</strong> ${fields['Submission Date'] || ''}</p>
          `;

          modal.style.display = 'flex';

          document.getElementById('ltg-close').addEventListener('click', async () => {
            await closeModalAndSync();
          });

          modalBody.querySelectorAll('.reaction-button').forEach(btn => {
            btn.addEventListener('click', async (e) => {
              e.stopPropagation();
              const recordId = btn.getAttribute('data-id');
              const reaction = btn.getAttribute('data-type');
              if (!reaction || currentReactionBuffer.reactions[reaction]) return;
              currentReactionBuffer.reactions[reaction] = (fields[reaction] || 0) + 1;
              btn.textContent = `${btn.textContent.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDBFF]/)[0]} ${currentReactionBuffer.reactions[reaction]}`;
              await closeModalAndSync();
            });
          });
        });

        grid.appendChild(row);
      });
    })
    .catch(err => {
      console.error('❌ Fetch error:', err);
      grid.innerHTML = '<tr><td colspan="8">Failed to load letters. Please try again later.</td></tr>';
    });

  async function closeModalAndSync() {
    if (currentReactionBuffer.id && Object.keys(currentReactionBuffer.reactions).length > 0) {
      try {
        const res = await fetch(REACT_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recordId: currentReactionBuffer.id, reactions: currentReactionBuffer.reactions })
        });
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        console.log('✅ Reaction successfully synced.');
      } catch (err) {
        console.error('❌ Failed to sync reactions:', err);
      }
    }
    currentReactionBuffer = {};
    modal.style.display = 'none';
  }
})();
