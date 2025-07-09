// WalkerJames.Life - Display My Letter (Read-Only)
// Injects full letter info from Airtable based on LetterID from URL

(function () {
  const container = document.getElementById('ltg-letter-container');
  const params = new URLSearchParams(window.location.search);
  const letterId = params.get('LetterID');

  if (!letterId) {
    container.innerHTML = "<p style='color: red;'>No LetterID provided in URL.</p>";
    return;
  }

  fetch(`https://hook.us2.make.com/vscwqy0qy5qm59gtobrk63m2hovlmf39?LetterID=${encodeURIComponent(letterId)}`)
    .then(response => {
      if (!response.ok) throw new Error('Letter not found');
      return response.text(); // plain text response from Make
    })
    .then(text => {
      const fields = text.split('|');

      if (fields.length < 9) throw new Error("Incomplete data returned");

      const [
        LetterID,
        ViewCount,
        CanRespond,
        DisplayName,
        HeartsCount,
        PrayerCount,
        LetterContent,
        SharePublicly,
        ApprovalStatus,
        SubmissionDate,
        ModeratorComments,
        BrokenHeartsCount
      ] = fields;

      LetterContent.trimStart()
      ModeratorComments.trimStart()

      container.innerHTML = `
        <div style="font-family: sans-serif; line-height: 1.5; max-width: 800px; margin: auto;">
          <h2>Your Letter to God</h2>
          <hr>
          <p><strong>Letter ID:</strong> ${LetterID}</p>
          <p><strong>Display Name:</strong> ${DisplayName || 'Anonymous'}</p>
          <p><strong>Submitted:</strong> ${SubmissionDate}</p>
          <p><strong>Share Publicly:</strong> ${SharePublicly}</p>
          <p><strong>Can Respond:</strong> ${CanRespond}</p>
          <p><strong>Approval Status:</strong> ${ApprovalStatus}</p>

          <h3>Letter Content:</h3>
          <div style="white-space: pre-wrap; border: 1px solid #ccc; padding: 1rem; background: #f9f9f9; height: 18em; overflow-y: auto;">
            ${LetterContent.trimStart()}
          </div>

          <h3>Moderator Comments:</h3>
          <div style="white-space: pre-wrap; border: 1px solid #eee; padding: 1rem; background: #f1f1f1; height: 18em; overflow-y: auto;">
            ${(ModeratorComments || '(none)').trimStart()}
          </div>

          <hr>
          <p>
            ❤️ <strong>Hearts:</strong> ${HeartsCount} &nbsp;&nbsp;
            🙏 <strong>Prayers:</strong> ${PrayerCount} &nbsp;&nbsp;
            💔 <strong>Broken Hearts:</strong> ${BrokenHeartsCount} &nbsp;&nbsp;
            📖 <strong>Views:</strong> ${ViewCount}
          </p>
        </div>
      `;
    })
    .catch(error => {
      console.error('Error loading letter:', error);
      container.innerHTML = `<p style="color: red;">Sorry, we couldn't load your letter. Please try again later.</p>`;
    });
})();
