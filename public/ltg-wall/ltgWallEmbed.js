// ltgWallEmbed.js (cleaned for Make response, formatted popup/table, no JSON parsing)

const endpoint = "https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth";

// Apply styling
const style = document.createElement('style');
style.innerHTML = `
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
    overflow: hidden;
    position: relative;
    font-family: sans-serif;
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
    margin-bottom: 1rem;
    padding: 0.5rem;
    background: #f4f4f4;
    border-radius: 4px;
    white-space: pre-wrap;
    font-family: sans-serif;
  }
  .table-wrapper {
    width: 100%;
    overflow-x: auto;
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
    font-size: 1rem;
    word-wrap: break-word;
  }
  th:nth-child(n+5), td:nth-child(n+5) {
    text-align: center;
    font-size: 1rem;
  }
  td:nth-child(3), td:nth-child(4) {
    max-height: 3em;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  tr:hover {
    background-color: #f9f9f9;
    cursor: pointer;
  }
  .reaction-button {
    margin: 0 5px;
    cursor: pointer;
    font-size: 1.5rem;
  }
`;
document.head.appendChild(style);

const container = document.getElementById('ltg-wall-container') || document.body;
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

fetch(endpoint)
  .then(response => response.text())
  .then(text => {
    const lines = text.split(/\n|(?=\d{4}-\d{2}-\d{2})/g);
    const lettersArray = [];

    lines.forEach(line => {
      const match = line.match(/(\d{4}-\d{2}-\d{2})([^@]*)@?([^,]*),?(.*)/);
      if (match) {
        lettersArray.push({
          date: match[1].trim(),
          from: match[2].trim(),
          letter: match[3].trim(),
          moderatorNote: match[4].trim(),
          hearts: 0,
          prayers: 0,
          broken: 0,
          views: 0
        });
      }
    });

    lettersArray.forEach((l, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${l.date}</td>
        <td>${l.from || "Anonymous"}</td>
        <td>${l.letter}</td>
        <td>${l.moderatorNote || ''}</td>
        <td>${l.hearts}</td>
        <td>${l.prayers}</td>
        <td>${l.broken}</td>
        <td>${l.views}</td>
      `;

      row.addEventListener('click', () => {
        const newView = l.views + 1;
        modalBody.innerHTML = `
          <span id="ltg-close">×</span>
          <h3 style="font-family: sans-serif;">${l.from}</h3>
          <div class="scroll-box">${l.letter}</div>
          <p>
            <span class="reaction-button" data-type="hearts">❤️ ${l.hearts}</span>
            <span class="reaction-button" data-type="prayers">🙏 ${l.prayers}</span>
            <span class="reaction-button" data-type="broken">💔 ${l.broken}</span>
            <span class="reaction-button" data-type="views">📖 ${newView}</span>
          </p>
          <p><strong>Moderator Comment:</strong></p>
          <div class="scroll-box">${l.moderatorNote || 'None'}</div>
          <p><strong>Date:</strong> ${l.date}</p>
        `;
        modal.style.display = 'flex';

        document.getElementById('ltg-close').addEventListener('click', () => modal.style.display = 'none');

        modalBody.querySelectorAll('.reaction-button').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            if (!type || type === 'views') return;

            l[type] = (l[type] || 0) + 1;
            e.target.textContent = e.target.textContent.split(' ')[0] + ' ' + l[type];
            console.log(`Reaction '${type}' +1 for letter ${index}`);
            // This should eventually trigger a Make webhook POST if needed
          });
        });
      });

      grid.appendChild(row);
    });
  })
  .catch(err => {
    console.error("Failed to fetch letters:", err);
    grid.innerHTML = '<tr><td colspan="8">Failed to load letters. Please try again later.</td></tr>';
  });
