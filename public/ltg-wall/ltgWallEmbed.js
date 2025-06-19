(function () {
  const script = document.currentScript;
  const container = document.createElement("div");
  container.id = "ltg-wall-container";
  script.parentNode.insertBefore(container, script.nextSibling);

  const css = `
    #ltg-wall-container {
      font-family: sans-serif;
      margin-top: 2em;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 2em;
    }
    th, td {
      text-align: left;
      padding: 0.5em;
      border-bottom: 1px solid #ccc;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .ltg-reactions {
      margin-top: 1em;
      display: flex;
      gap: 1em;
      font-size: 1.2em;
      cursor: pointer;
    }
    .ltg-reaction {
      user-select: none;
    }
    .ltg-modal {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .ltg-modal-content {
      background: white;
      padding: 2em;
      border-radius: 8px;
      max-width: 600px;
      width: 90%;
      position: relative;
    }
    .ltg-close {
      position: absolute;
      top: 0.5em;
      right: 0.8em;
      font-size: 1.5em;
      cursor: pointer;
    }
  `;

  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);

  async function fetchLetters() {
    const response = await fetch("https://walkerjames.life/.netlify/functions/getLetters");
    const data = await response.json();
    return data.records.filter(record => record.fields["Approval Status"] === "Approved");
  }

  function createModal(letter, reactions, recordId) {
    const modal = document.createElement("div");
    modal.className = "ltg-modal";

    const content = document.createElement("div");
    content.className = "ltg-modal-content";

    const closeBtn = document.createElement("span");
    closeBtn.className = "ltg-close";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = () => modal.remove();

    const name = document.createElement("h2");
    name.textContent = letter.fields.Name || "Anonymous";

    const body = document.createElement("p");
    body.textContent = letter.fields["Letter Content"];

    const comment = document.createElement("p");
    comment.innerHTML = `<strong>Moderator Comment:</strong><br>${letter.fields["Moderator Comments"] || "None"}`;

    const date = document.createElement("p");
    date.innerHTML = `<strong>Date:</strong> ${letter.fields["Submission Date"] || "N/A"}`;

    const reactionBar = renderReactions(reactions, recordId);

    content.append(closeBtn, name, body, reactionBar, comment, date);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }

  function renderReactions(reactions, recordId) {
    const bar = document.createElement("div");
    bar.className = "ltg-reactions";

    const types = {
      hearts: "❤️",
      prayers: "🙏",
      broken: "💔",
      reads: "📖"
    };

    for (let key in types) {
      const span = document.createElement("span");
      span.className = "ltg-reaction";
      span.innerHTML = `${types[key]} <span>${reactions[key]}</span>`;
      span.onclick = async () => {
        reactions[key]++;
        span.querySelector("span").textContent = reactions[key];
        await updateReaction(recordId, reactions);
      };
      bar.appendChild(span);
    }

    return bar;
  }

  async function updateReaction(recordId, reactions) {
    try {
      const res = await fetch("https://walkerjames.life/.netlify/functions/updateReaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ recordId, reactions })
      });

      if (!res.ok) throw new Error("Failed to sync reactions.");
    } catch (err) {
      console.error("Failed to sync reactions:", err);
    }
  }

  function renderTable(letters) {
    const table = document.createElement("table");

    const header = document.createElement("tr");
    ["Date", "Name", "Letter"].forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      header.appendChild(th);
    });
    table.appendChild(header);

    letters.forEach(letter => {
      const row = document.createElement("tr");

      const submissionDate = new Date(letter.fields["Submission Date"]).toISOString().split("T")[0];
      const name = letter.fields.Name || "Anonymous";
      const snippet = letter.fields["Letter Content"].slice(0, 60) + "...";

      [submissionDate, name, snippet].forEach(val => {
        const td = document.createElement("td");
        td.textContent = val;
        row.appendChild(td);
      });

      row.onclick = async () => {
        const recordId = letter.id;
        const reactions = {
          hearts: letter.fields["Love Count"] || 0,
          prayers: letter.fields["Prayer Count"] || 0,
          broken: letter.fields["Broken Heart Count"] || 0,
          reads: (letter.fields["View Count"] || 0) + 1
        };

        await updateReaction(recordId, reactions);
        createModal(letter, reactions, recordId);
      };

      table.appendChild(row);
    });

    return table;
  }

  fetchLetters().then(letters => {
    const table = renderTable(letters);
    container.appendChild(table);
  });
})();
