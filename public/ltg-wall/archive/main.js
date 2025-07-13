document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("letters-grid");
  const API_URL = "https://walkerjames-life.netlify.app/.netlify/functions/updateReaction?list=true";

  try {
    const res = await fetch(API_URL);
    const { records } = await res.json();

    records.forEach(record => {
      const { fields, id } = record;
      if (!fields["Approved"]) return;

      const card = document.createElement("div");
      card.className = "letter-card";
      card.innerHTML = `
        <p>${fields.LetterContent}</p>
        <div class="letter-meta">
          <div>
            <span class="icon-btn" onclick="updateReaction('${id}', 'Hearts')">❤️ <span>${fields.Hearts || 0}</span></span>
            <span class="icon-btn" onclick="updateReaction('${id}', 'BrokenHearts')">💔 <span>${fields.BrokenHearts || 0}</span></span>
            <span class="icon-btn" onclick="updateReaction('${id}', 'Prayers')">🙏 <span>${fields.Prayers || 0}</span></span>
          </div>
          <div>
            <span class="icon-btn" onclick="updateReaction('${id}', 'Views')">📖 <span>${fields.Views || 0}</span></span>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    container.innerHTML = "<p>Failed to load letters. Please try again later.</p>";
  }
});

async function updateReaction(recordId, field) {
  const PATCH_URL = "https://walkerjames-life.netlify.app/.netlify/functions/updateReaction";
  const fieldSpan = event.target.querySelector("span");

  let currentValue = parseInt(fieldSpan.textContent) || 0;
  fieldSpan.textContent = currentValue + 1;

  await fetch(PATCH_URL, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recordId,
      fields: { [field]: currentValue + 1 }
    })
  });
}
