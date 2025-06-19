document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('ltg-wall-container');

  try {
    const response = await fetch('https://api.airtable.com/v0/' + AIRTABLE_BASE_ID + '/Letters?filterByFormula=' +
      encodeURIComponent("AND({Approval Status} = 'Approved', OR({Share Publicly} = 'Yes, share publicly (first name only)', {Share Publicly} = 'Yes, but anonymously'))"), {
      headers: {
        Authorization: 'Bearer ' + AIRTABLE_API_KEY,
      },
    });

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      container.innerHTML = '<p>No approved letters available.</p>';
      return;
    }

    const table = document.createElement('div');
    table.style.overflowX = 'auto';
    table.style.whiteSpace = 'nowrap';
    table.style.display = 'flex';
    table.style.flexDirection = 'row';
    table.style.gap = '1rem';

    data.records.forEach((record) => {
      const card = document.createElement('div');
      card.style.minWidth = '300px';
      card.style.border = '1px solid #ccc';
      card.style.padding = '10px';
      card.style.borderRadius = '8px';
      card.style.backgroundColor = '#f9f9f9';
      card.style.cursor = 'pointer';

      const letter = record.fields['Letter Content'] || '';
      const nameField = record.fields['Share Publicly'] === 'Yes, share publicly (first name only)'
        ? (record.fields['First Name'] || 'Anonymous')
        : 'Anonymous';

      card.innerHTML = `
        <p style="font-size: 0.9em; line-height: 1.4em;">${letter}</p>
        <p style="font-weight: bold; margin-top: 8px;">— ${nameField}</p>
        <div style="display: flex; justify-content: space-between; margin-top: 10px;">
          <button class="react-btn" data-id="${record.id}" data-emoji="Love Count">❤️ ${record.fields['Love Count'] || 0}</button>
          <button class="react-btn" data-id="${record.id}" data-emoji="Prayer Count">🙏 ${record.fields['Prayer Count'] || 0}</button>
          <button class="react-btn" data-id="${record.id}" data-emoji="Broken Heart Count">💔 ${record.fields['Broken Heart Count'] || 0}</button>
        </div>
      `;

      table.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(table);

    document.querySelectorAll('.react-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const recordId = btn.getAttribute('data-id');
        const emoji = btn.getAttribute('data-emoji');

        try {
          const postResponse = await fetch('/.netlify/functions/updateReaction', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recordId, emoji }),
          });

          const result = await postResponse.json();
          if (postResponse.ok) {
            const countText = btn.textContent.match(/\d+/);
            const current = countText ? parseInt(countText[0], 10) : 0;
            btn.textContent = btn.textContent.replace(/\d+/, current + 1);
          } else {
            console.error(result.message);
          }
        } catch (err) {
          console.error('Failed to send reaction:', err);
        }
      });
    });

  } catch (error) {
    console.error('Error fetching letters:', error);
    container.innerHTML = '<p>Failed to load letters. Please try again later.</p>';
  }
});
