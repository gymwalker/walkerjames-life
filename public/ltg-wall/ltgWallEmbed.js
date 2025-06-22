// ltgWallEmbed.js (merged: working formatting + new Make endpoint logic)

const endpoint = "https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth";

// Styling
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
  }
  .table-wrapper {
    min-width: 1200px; width: max-content;
    margin: 0 auto;
  }
  table {
    width: 100%;
    margin: 0 auto;
    border-collapse: collapse;
    table-layout: auto;
  }
  th, td {
    border-bottom: 1px solid #ccc;
    padding: 0.5rem;
    text-align: left;
    vertical-align: top;
    font-size: 1rem;
  }
  th:nth-child(n+5), td:nth-child(n+5) {
    text-align: center;
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

// HTML container
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
let currentReactionBuffer = {};

// Fetch and parse letters
fetch(endpoint)
  .then(response => response.text())
  .then(text => {
    let lettersArray = [];

    try {
      const json = JSON.parse(text);
      if (Array.isArray(json.letters)) {
        lettersArray = json.letters;
      } else {
        throw new Error("Expected 'letters' to be an array");
      }
    } catch (e) {
      console.warn("Fallback to manual parsing due to non-JSON response");
      const lines = text.split(/\n|(?=\d{4}-\d{2}-\d{2})/g);
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
    }

    lettersArray.forEach((l, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${l.date}</td>
        <td>${l.from || "Anonymous"}</td>
        <td>${l.letter.substring(0, 80)}...</td>
        <td>${l.moderatorNote || ''}</td>
        <td>${l.hearts || 0}</td>
        <td>${l.prayers || 0}</td>
        <td>${l.broken || 0}</td>
        <td>${l.views || 0}</td>
      `;

      row.addEventListener('click', () => {
        currentReactionBuffer = { id: index, reactions: { views: 1 } };
        const incrementedViewCount = (l.views || 0) + 1;

        modalBody.innerHTML = `
          <span id="ltg-close">×</span>
          <h3>${l.from}</h3>
          <div class="scroll-box" id="ltg-letter">${l.letter}</div>
          <p>
            <span class="reaction-button" data-id="${index}" data-type="hearts">❤️ ${l.hearts}</span>
            <span class="reaction-button" data-id="${index}" data-type="prayers">🙏 ${l.prayers}</span>
            <span class="reaction-button" data-id="${index}" data-type="broken">💔 ${l.broken}</span>
            <span class="reaction-button">📖 ${incrementedViewCount}</span>
          </p>
          <p><strong>Moderator Comment:</strong></p>
          <div class="scroll-box">${l.moderatorNote || 'None'}</div>
          <p><strong>Date:</strong> ${l.date}</p>
        `;

        modal.style.display = 'flex';
        document.getElementById('ltg-close').addEventListener('click', () => modal.style.display = 'none');
      });

      grid.appendChild(row);
    });
  })
  .catch(err => {
    console.error("Fetch error:", err);
    grid.innerHTML = '<tr><td colspan="8">Failed to load letters. Please try again later.</td></tr>';
  });
