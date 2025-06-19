// ltgWallEmbed.js

const wallContainer = document.getElementById('ltg-wall-container');
const modal = document.getElementById('ltg-modal');
const modalContent = document.getElementById('ltg-modal-content');

async function loadLetters() {
  try {
    const res = await fetch('https://walkerjames-life.netlify.app/.netlify/functions/getLetters?List=true');
    const json = await res.json();

    console.log('Fetched letter data:', json);

    const data = json.letters || json; // fallback if not wrapped
    if (!Array.isArray(data)) {
      throw new Error('Unexpected response format: data is not an array');
    }

    wallContainer.innerHTML = '';
    data.forEach((letter) => {
      const row = document.createElement('div');
      row.classList.add('ltg-row');

      row.innerHTML = `
        <div>${letter.date}</div>
        <div>${letter.name}</div>
        <div>${letter.preview}</div>
        <div>${letter.moderatorComment || ''}</div>
        <div class="ltg-reactions">
          <span class="ltg-icon" data-type="Hearts Count" data-id="${letter.id}">❤️ ${letter.reactions['Hearts Count'] || 0}</span>
          <span class="ltg-icon" data-type="Prayer Count" data-id="${letter.id}">🙏 ${letter.reactions['Prayer Count'] || 0}</span>
          <span class="ltg-icon" data-type="Broken Hearts Count" data-id="${letter.id}">💔 ${letter.reactions['Broken Hearts Count'] || 0}</span>
          <span class="ltg-icon" data-type="View Count" data-id="${letter.id}">📖 ${letter.reactions['View Count'] || 0}</span>
        </div>
      `;

      row.addEventListener('click', (e) => {
        if (!e.target.classList.contains('ltg-icon')) {
          showLetter(letter);
        }
      });

      wallContainer.appendChild(row);
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
