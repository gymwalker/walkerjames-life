(function () {
  const css = `
    /* … (same CSS as before) … */
  `;
  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);

  const container = document.getElementById('ltg-wall-container');
  container.innerHTML = '<div id="letters-grid"></div>';
  const grid = document.getElementById('letters-grid');

  // 🔑  use ABSOLUTE URL so the call goes to Netlify, not Kajabi
  const API_URL =
    'https://walkerjames-life.netlify.app/.netlify/functions/updateReaction?list=true';

  fetch(API_URL)
    .then(res => {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) return res.json();
      throw new Error('Unexpected response');
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
      grid.innerHTML =
        '<p>Failed to load letters. Please try again later.</p>';
    });
})();
