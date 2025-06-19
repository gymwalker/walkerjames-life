(function () {
  const script = document.currentScript;
  const container = document.createElement("div");
  container.id = "ltg-wall-container";
  script.parentNode.insertBefore(container, script.nextSibling);

  const css = `
    #ltg-wall-container {
      font-family: sans-serif;
      padding: 2rem;
    }
    #ltg-wall-container table {
      width: 100%;
      border-collapse: collapse;
    }
    #ltg-wall-container th, td {
      border-bottom: 1px solid #ccc;
      padding: 0.5rem;
      text-align: left;
    }
    #ltg-letter-row:hover {
      background-color: #f5f5f5;
      cursor: pointer;
    }
    #ltg-modal {
      display: none;
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.6);
      justify-content: center;
      align-items: center;
      z-index: 99999;
    }
    #ltg-modal-body {
      background: white;
      padding: 2rem;
      max-width: 600px;
      border-radius: 8px;
      overflow: hidden;
      position: relative;
    }
    #ltg-close {
      position: absolute;
      top: 10px;
      right: 14px;
      font-size: 1.5rem;
      cursor: pointer;
    }
    .reaction-icon {
      cursor: pointer;
      margin-right: 8px;
    }
    .scroll-box {
      max-height: 12em;
      overflow-y: auto;
      margin-bottom: 1em;
    }
  `;

  const style = document.createElement("style");
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  const modal = document.createElement("div");
  modal.id = "ltg-modal";
  modal.innerHTML = `<div id="ltg-modal-body"><span id="ltg-close">&times;</span><div id="ltg-modal-content"></div></div>`;
  document.body.appendChild(modal);

  document.getElementById("ltg-close").onclick = () => modal.style.display = "none";

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
      row.id = "ltg-letter-row";

      row.innerHTML = `
        <td>${letter.fields["Date"] || ""}</td>
        <td>${letter.fields["Display Name"] || "Anonymous"}</td>
        <td>${(letter.fields["Letter"] || "").substring(0, 60)}...</td>
      `;

      row.onclick = () => openModal(letter);
      table.appendChild(row);
    });

    container.innerHTML = "";
    container.appendChild(table);
  }

  function openModal(letter) {
    const content = document.getElementById("ltg-modal-content");

    const emojiData = {
      heart: { emoji: "❤️", label: "Love Count" },
      pray: { emoji: "🙏", label: "Prayer Count" },
      broken: { emoji: "💔", label: "Broken Heart Count" },
      book: { emoji: "📖", label: "Read Count" }
    };

    const reactions = Object.entries(emojiData).map(([key, { emoji, label }]) => {
      const count = letter.fields[label] || 0;
      return `<span class="reaction-icon" data-id="${letter.id}" data-type="${key}">${emoji} ${count}</span>`;
    }).join(" ");

    content.innerHTML = `
      <h2>${letter.fields["Display Name"] || "Anonymous"}</h2>
      <div class="scroll-box">${letter.fields["Letter"] || ""}</div>
      <p>${reactions}</p>
      <p><strong>Moderator Comment:</strong><br>${letter.fields["Moderator Comment"] || "None"}</p>
      <p><strong>Date:</strong> ${letter.fields["Date"] || ""}</p>
    `;

    modal.style.display = "flex";

    document.querySelectorAll(".reaction-icon").forEach(el => {
      el.onclick = async function () {
        const id = this.dataset.id;
        const type = this.dataset.type;
        const fieldMap = {
          heart: "Love Count",
          pray: "Prayer Count",
          broken: "Broken Heart Count",
          book: "Read Count"
        };

        const field = fieldMap[type];
        if (!field) return;

        try {
          await fetch("https://walkerjames-life.netlify.app/.netlify/functions/updateReaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, field })
          });
          this.innerHTML = this.innerHTML.replace(/(\d+)/, (_, n) => +n + 1);
        } catch (error) {
          console.error("Reaction update failed", error);
        }
      };
    });
  }

  async function fetchLetters() {
    try {
      const res = await fetch("https://walkerjames-life.netlify.app/.netlify/functions/getLetters");
      const data = await res.json();

      const approved = data.records.filter(r => {
        const approved = r.fields["Approval Status"] === "Approved";
        const shared = ["Yes, share publicly (first name only)", "Yes, but anonymously"].includes(r.fields["Share Publicly"]);
        return approved && shared;
      });

      renderTable(approved);
    } catch (error) {
      container.innerHTML = "<p>Failed to load letters. Please try again later.</p>";
      console.error(error);
    }
  }

  fetchLetters();
})();
