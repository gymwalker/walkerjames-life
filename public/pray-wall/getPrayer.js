// WalkerJames.Life - Display My Prayer (Read-Only)
// Injects full prayer info from Airtable based on PrayerID from URL

(function () {
  const container = document.getElementById('prayer-request-container');
  const params = new URLSearchParams(window.location.search);
  const prayerId = params.get('PrayerID');

  if (!prayerId) {
    container.innerHTML = "<p style='color: red;'>No PrayerID provided in URL.</p>";
    return;
  }

  fetch(`https://hook.us2.make.com/n4o98xm9yv62q3jfve872c3mt7xg14r1?PrayerID=${encodeURIComponent(prayerId)}`)
    .then(response => {
      if (!response.ok) throw new Error('Prayer not found');
      return response.text();
    })
    .then(text => {
      const fields = text.split('|');

      if (fields.length < 15) throw new Error("Incomplete data returned");

      const [
        ApprovalStatus,         
        SubmissionDate,         
        LastName,               
        PrayerID,               
        FirstName,
        ViewCount,              
        CanRespond,             
        DisplayName,            
        HeartsCount,            
        PrayerCount,            
        EmailAddress,           
        PrayerContent,          
        SharePublicly,          
        BrokenHeartsCount,      
        ModeratorComments       
      ] = [
        fields[0],
        fields[1],
        fields[2],
        fields[3],
        fields[4],
        fields[5],
        fields[6],
        fields[7],
        fields[8],
        fields[9],
        fields[10],
        fields[11],
        fields[12],
        fields[13],
        fields[14] || ''
      ];

      container.innerHTML = `
        <div style="font-family: sans-serif; line-height: 1.5; max-width: 800px; margin: auto;">
          <h2>Your Prayer Request</h2>
          <hr>
          <p><strong>Prayer ID:</strong> ${PrayerID}</p>
          <p><strong>Display Name:</strong> ${DisplayName || 'Anonymous'}</p>
          <p><strong>Submitted:</strong> ${SubmissionDate}</p>
          <p><strong>Share Publicly:</strong> ${SharePublicly}</p>
          <p><strong>Can Respond:</strong> ${CanRespond}</p>
          <p><strong>Approval Status:</strong> ${ApprovalStatus}</p>

          <h3>Prayer Content:</h3>
          <div style="font-family: sans-serif; padding: 1rem; background: #f9f9f9; border: 1px solid #ccc; height: 18em; overflow-y: auto;">
            <pre style="margin: 0; font-family: inherit; white-space: pre-wrap;">${PrayerContent.trimStart()}</pre>
          </div>

          <h3>Moderator Comments:</h3>
          <div style="font-family: sans-serif; padding: 1rem; background: #f1f1f1; border: 1px solid #eee; height: 18em; overflow-y: auto;">
            <pre style="margin: 0; font-family: inherit; white-space: pre-wrap;">${(ModeratorComments || '(none)').trimStart()}</pre>
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
      console.error('Error loading prayer:', error);
      container.innerHTML = `<p style="color: red;">Sorry, we couldn't load your prayer. Please try again later.</p>`;
    });
})();
