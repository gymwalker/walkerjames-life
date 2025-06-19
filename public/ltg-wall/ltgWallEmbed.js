// ltgWallEmbed.js

const wallContainer = document.getElementById('ltg-wall-container');
const modal = document.getElementById('ltg-modal');
const modalContent = document.getElementById('ltg-modal-content');

async function loadLetters() {
  try {
    const res = await fetch('https://walkerjames-life.netlify.app/.netlify/functions/getLetters?List=true');
    const json = await res.json();

    console.log('Fetched letter data:', json);

    const data = json.letters || json;
    if (!Array.isArray(data)) {
      throw new Error('Unexpected response format: data is not an array');
    }

    wallContainer.innerHTML = `
      <table class="ltg-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Letter</th>
            <th>Moderator Comment</th>
            <th>Reactions</th>
          </tr>
        </thead>
        <tbody id="ltg-tbody"></tbody>
      </table>
    `;

    const tbody = document.getElementById('ltg-tbody');

    data.forEach((letter) => {
      const row = document.createElement('tr');
      row.classList.add('ltg-row');

      row.innerHTML = `
        <td>${letter.date}</td>
        <td>${letter.name}</td>
        <td>${letter.preview}</td>
        <td>${letter.moderatorComment || ''}</td>
        <td class="ltg-reactions">
          <span class="ltg-icon" data-type="Hearts Count" data-id="${letter.id}">❤️ ${letter.reactions['Hearts Count'] || 0}</span>
          <span class="ltg-icon" data-type="Prayer Count" data-id="${letter.id}">🙏 ${letter.reactions['Prayer Count'] || 0}</span>
          <span class="ltg-icon" data-type="Broken Hearts Count" data-id="${letter.id}">💔 ${letter.reactions['Broken Hearts Count'] || 0}</span>
          <span class="ltg-icon" data-type="View Count" data-id="${letter.id}">📖 ${letter.reactions['View Count'] || 0}</span>
        </td>
      `;

      row.addEventListener('click', (e) => {
        if (!e.target.classList.contains('ltg-icon')) {
          showLetter(letter);
        }
      });

      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Error loading letters:', err);
    wallContainer.innerHTML = '<p>Failed to load letters. Please try again later.</p>';
  }
}

function showLetter(letter) {
  modalContent.innerHTML = `
    <h2>${letter.name}</h2>
    <p>${letter.letter}</p>
    <div class="ltg-reactions">
      <span class="ltg-icon" data-type="Hearts Count" data-id="${letter.id}">❤️ ${letter.reactions['Hearts Count'] || 0}</span>
      <span class="ltg-icon" data-type="Prayer Count" data-id="${letter.id}">🙏 ${letter.reactions['Prayer Count'] || 0}</span>
      <span class="ltg-icon" data-type="Broken Hearts Count" data-id="${letter.id}">💔 ${letter.reactions['Broken Hearts Count'] || 0}</span>
      <span class="ltg-icon" data-type="View Count" data-id="${letter.id}">📖 ${letter.reactions['View Count'] || 0}</span>
    </div>
    <p><strong>Moderator Comment:</strong> ${letter.moderatorComment || 'None'}</p>
    <p><strong>Date:</strong> ${letter.date}</p>
    <button id="closeModalBtn">Close</button>
  `;

  modal.style.display = 'block';
  incrementReaction(letter.id, 'View Count');

  document.getElementById('closeModalBtn').addEventListener('click', () => {
    modal.style.display = 'none';
    loadLetters();
  });
}

async function incrementReaction(recordId, type) {
  const body = {
    recordId,
    reactions: {
      [type]: 1
    }
  };

  try {
    const res = await fetch('https://walkerjames-life.netlify.app/.netlify/functions/postReaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await res.json();
    if (!result.success) throw new Error(result.error || 'Unknown failure');
  } catch (err) {
    console.error('Failed to sync reactions:', err);
  }
}

// Delegate reaction clicks
wallContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('ltg-icon')) {
    const recordId = e.target.dataset.id;
    const type = e.target.dataset.type;
    incrementReaction(recordId, type);
  }
});

// Initial load
loadLetters();
