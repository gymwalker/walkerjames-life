// Inject styling
const css = `
  .reaction-button {
    margin: 0 5px;
    cursor: pointer;
    font-size: 1.5rem;
  }
`;
const style = document.createElement('style');
style.innerHTML = css;
document.head.appendChild(style);

// Create LTG Wall structure
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
        </tr>
      </thead>
      <tbody id="letters-grid"></tbody>
    </table>
  </div>
`;

const grid = document.getElementById('letters-grid');
const modal = document.getElementById('ltg-modal');
const modalBody = document.getElementById('ltg-modal-body');

// Fetch letters from Netlify Function (which relays to Make → Airtable)
fetch('https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth')
//fetch('https://walkerjames-life.netlify.app/.netlify/functions/getLetters')
//fetch('/.netlify/functions/getLetters')
  .then((res) => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  })
  .then((letters) => {
    grid.innerHTML = '';
    letters.forEach((letter) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${letter['Date'] || ''}</td>
        <td>${letter['Display Name'] || ''}</td>
        <td><a href="#" class="view-letter" data-letter="${encodeURIComponent(letter['Letter Content'] || '')}">View</a></td>
        <td>${letter['Moderator Comment'] || ''}</td>
        <td><span class="reaction-button">❤️</span></td>
        <td><span class="reaction-button">🙏</span></td>
        <td><span class="reaction-button">💔</span></td>
      `;
      grid.appendChild(row);
    });

    // Modal display on letter click
    document.querySelectorAll('.view-letter').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const content = decodeURIComponent(link.dataset.letter);
        modalBody.innerHTML = `<p>${content}</p>`;
        modal.style.display = 'block';
      });
    });

    // Close modal on click outside
    modal.addEventListener('click', () => {
      modal.style.display = 'none';
      modalBody.innerHTML = '';
    });
  })
  .catch((err) => {
    console.error('Failed to load letters:', err);
    grid.innerHTML = `<tr><td colspan="7">Failed to load letters. Please try again later.</td></tr>`;
  });
