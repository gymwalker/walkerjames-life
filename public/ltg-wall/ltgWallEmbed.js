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
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
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

  fetch('/.netlify/functions/updateReaction?list=true')
    .then((res) => {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return res.json();
      } else {
        throw new Error("Unexpected response type (not JSON)");
      }
    })
    .then((data) => {
      const records = data.records;
      if (!records || !records.length) {
        grid.innerHTML = "<p>No letters found.</p>";
        return;
      }

      records.forEach((record) => {
        const fields = record.fields;
        if (!fields || !fields["Letter Content"]) return;

        const letter = document.createElement("div");
        letter.className = "letter-card";

        const content = document.createElement("p");
        content.textContent = fields["Letter Content"];
        letter.appendChild(content);

        const meta = document.createElement("div");
        meta.className = "letter-meta";

        const displayName = document.createElement("span");
        displayName.textContent = fields["Display Name"] || "Anonymous";
        meta.appendChild(displayName);

        const reactions = document.createElement("div");
        reactions.className = "reactions";
        reactions.innerHTML = `
          ❤️ ${fields["Hearts Count"] || 0}
          🙏 ${fields["Prayer Count"] || 0}
        `;
        meta.appendChild(reactions);

        letter.appendChild(meta);
        grid.appendChild(letter);
      });
    })
    .catch((err) => {
      console.error("Fetch error:", err);
      grid.innerHTML = "<p>Failed to load letters. Please try again later.</p>";
    });
})();
