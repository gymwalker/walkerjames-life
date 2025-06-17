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

  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);

  const container = document.getElementById("ltg-wall-container");
  container.innerHTML = '<div id="letters-grid"></div>';
  const grid = document.getElementById("letters-grid");

  const API_URL = "https://walkerjames-life.netlify.app/.netlify/functions/updateReaction?list=true";

  fetch(API_URL)
    .then(res => res.json())
    .then(({ records }) => {
      records.forEach(({ fields, id }) => {
        if (!fields["Approved"]) return;

        const card = document.createElement("div");
        card.className = "letter-card";
        card.innerHTML = `
          <p>${fields.LetterContent}</p>
          <div class="letter-meta">
            <div>
              <span class="icon-btn" onclick="updateReaction('${id}', 'Hearts', this)">❤️ <span>${fields.Hearts || 0}</span></span>
              <span class="icon-btn" onclick="updateReaction('${id}', 'BrokenHearts', this)">💔 <span>${fields.BrokenHearts || 0}</span></span>
              <span class="icon-btn" onclick="updateReaction('${id}', 'Prayers', this)">🙏 <span>${fields.Prayers || 0}</span></span>
            </div>
            <div>
              <span class="icon-btn" onclick="updateReaction('${id}', 'Views', this)">📖 <span>${fields.Views || 0}</span></span>
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
    })
    .catch(err => {
      container.innerHTML = "<p>Failed to load letters. Please try again later.</p>";
    });

  window.updateReaction = function (recordId, field, el) {
    const PATCH_URL = "https://walkerjames-life.netlify.app/.netlify/functions/updateReaction";
    const span = el.querySelector("span");
    let currentValue = parseInt(span.textContent) || 0;
    span.textContent = currentValue + 1;

    fetch(PATCH_URL, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recordId,
        fields: { [field]: currentValue + 1 }
      })
    });
  };
})();
