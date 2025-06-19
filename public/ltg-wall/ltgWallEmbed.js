(function () {
  const container = document.createElement("div");
  container.id = "ltg-wall-container";
  document.currentScript.parentNode.insertBefore(container, document.currentScript.nextSibling);

  const css = `
    #ltg-wall-container {
      font-family: sans-serif;
      padding: 2rem;
    }
    #ltg-wall-container table {
      width: 100%;
      border-collapse: collapse;
    }
    #ltg-wall-container th, #ltg-wall-container td {
      border-bottom: 1px solid #ccc;
      padding: 0.5rem;
      text-align: left;
    }
    .ltg-letter-row:hover {
      background-color: #f5f5f5;
      cursor: pointer;
    }
    #ltg-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.6);
      align-items: center;
      justify-content: center;
      z-index: 9999;
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
    .scroll-box {
      max-height: 12em;
      overflow-y: auto;
      white-space: pre-wrap;
      margin-bottom: 1rem;
    }
    .reaction-bar {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 10px;
      margin: 1rem 0;
    }
    .reaction {
      cursor: pointer;
      font-size: 1.2rem;
    }
    .reaction-count {
      margin-left: 4px;
      font-size: 0.9rem;
    }
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const modal = document.createElement("div");
  modal.id = "ltg-modal";
  modal.innerHTML = `
    <div id="ltg-modal-body">
      <span id="ltg-close">&times;</span>
      <h2 id="ltg-modal-name"></h2>
      <div class="scroll-box" id="ltg-modal-letter"></div>
      <div class="reaction-bar" id="ltg-modal-reactions"></div>
      <div><strong>Moderator Comment:</strong> <span id="ltg-modal-comment"></span></div>
      <div><strong>Date:</strong> <span id="ltg-modal-date"></span></div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById("ltg-close").onclick = () => (modal.style.display = "none");

  async function fetchLetters() {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    thead.innerHTML = `<tr><th>Date</th><th>Name</th><th>Letter</th></tr>`;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    const loadingMsg = document.createElement("p");
    loadingMsg.textContent = "Loading letters...";
    container.appendChild(loadingMsg);

    try {
      const response = await fetch("/.netlify/functions/airtableRead");
      const records = await response.json();

      container.removeChild(loadingMsg);

      const publicLetters = records.filter((rec) => {
        const share = rec.fields["Share Publicly"];
        const approved = rec.fields["Approval Status"];
        return (
          (share === "Yes, share publicly (first name only)" || share === "Yes, but anonymously") &&
          approved === "Approved"
        );
      });

      publicLetters.forEach((rec) => {
        const tr = document.createElement("tr");
        tr.className = "ltg-letter-row";
        tr.innerHTML = `
          <td>${rec.fields["Submission Date"] || ""}</td>
          <td>${rec.fields["Display Name"] || "Anonymous"}</td>
          <td>${(rec.fields["Letter Content"] || "").substring(0, 50)}...</td>
        `;
        tr.onclick = () => showModal(rec);
        tbody.appendChild(tr);
      });

      table.appendChild(tbody);
      container.appendChild(table);
    } catch (error) {
      console.error("Error fetching letters:", error);
      loadingMsg.textContent = "Failed to load letters. Please try again later.";
    }
  }

  function showModal(rec) {
    document.getElementById("ltg-modal-name").textContent = rec.fields["Display Name"] || "Anonymous";
    document.getElementById("ltg-modal-letter").textContent = rec.fields["Letter Content"] || "";
    document.getElementById("ltg-modal-comment").textContent = rec.fields["Moderator Comment"] || "None";
    document.getElementById("ltg-modal-date").textContent = rec.fields["Submission Date"] || "";

    const reactions = [
      { emoji: "❤️", field: "Love Count" },
      { emoji: "🙏", field: "Prayer Count" },
      { emoji: "💔", field: "Broken Heart Count" },
      { emoji: "📖", field: "Read Count" },
    ];

    const reactionBar = document.getElementById("ltg-modal-reactions");
    reactionBar.innerHTML = "";

    reactions.forEach((reaction) => {
      const span = document.createElement("span");
      span.className = "reaction";
      span.innerHTML = `${reaction.emoji} <span class="reaction-count">${rec.fields[reaction.field] || 0}</span>`;
      span.onclick = () => updateReaction(rec.id, reaction.field, span);
      reactionBar.appendChild(span);
    });

    modal.style.display = "flex";
  }

  async function updateReaction(recordId, field, span) {
    try {
      const response = await fetch("/.netlify/functions/updateReaction", {
        method: "POST",
        body: JSON.stringify({ recordId, field }),
      });
      const data = await response.json();
      if (data.success) {
        const countSpan = span.querySelector(".reaction-count");
        countSpan.textContent = parseInt(countSpan.textContent) + 1;
      } else {
        console.error("Update failed:", data.message);
      }
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  }

  fetchLetters();
})();
