(function () {
  const css = `
    #ltg-wall-container {
      font-family: 'Georgia', serif;
      background-color: #fffaf4;
      color: #3b3b3b;
      max-width: 900px;
      margin: 2rem auto;
      padding: 1rem;
    }

    #letters-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .letter-card {
      border: 1px solid #ddd;
      background: #fff;
      border-radius: 8px;
      padding: 1rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }

    .letter-meta {
      display: flex;
      justify-content: space-between;
      margin-top: 1rem;
    }

    .icon-btn {
      cursor: pointer;
      font-size: 1.2rem;
      margin-right: 1rem;
    }

    .icon-btn span {
      margin-left: 0.25rem;
    }
  `;

  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);

  const container = document.getElementById('ltg-wall-container');
  container.innerHTML = '<div id="letters-grid"></div>';
  const grid = document.getElementById('letters-grid');

  const API_URL = 'https://walkerjames-life.netlify.app/.netlify/functions/updateReaction?list=true';

  fetch(API_URL)
    .then(async res => {
      const ct = res.headers.get('content-type') || '';
      const text = await res.text();
      if (ct.includes('application/json')) {
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error('Failed to parse JSON: ' + text);
        }
      } else {
        throw new Error('Non-JSON response: ' + text.slice(0, 200));
      }
    })
    .then(({ records }) => {
      if (!records || !records.length) {
        grid.innerHTML = '<p>No letters found.</p>';
        return;
      }

      records.forEach(({ fields }) => {
        if (!fields || !fields['Letter Content']) return;

        const card = document.createElement('div');
        card.className = 'letter-card';
        card.innerHTML = `
          <p>${fields['Letter Content']}</p>
          <div class="letter-meta">
            <span>${fields['Display Name'] || 'Anonymous'}</span>
            <span>❤️ ${fields['Hearts Count'] || 0}</span>
            <span>🙏 ${fields['Prayer Count'] || 0}</span>
          </div>
        `;
        grid.appendChild(card);
      });
    })
    .catch(err => {
      console.error(err);
      grid.innerHTML = '<p style="color:red;">Failed to load letters. Please try again later.</p>';
    });
})();
