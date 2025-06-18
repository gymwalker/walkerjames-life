document.addEventListener("DOMContentLoaded", async () => {
  const table = document.querySelector("#ltg-wall");
  const modal = document.querySelector("#ltg-modal");
  const modalContent = document.querySelector("#ltg-modal-content");

  try {
    const response = await fetch("https://walkerjames-life.netlify.app/.netlify/functions/getLetters");
    const { letters } = await response.json();

    if (!letters || letters.length === 0) {
      table.innerHTML = "<tr><td colspan='6'>No letters found.</td></tr>";
      return;
    }

    letters.forEach((letter) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${letter.Date || ""}</td>
        <td>${letter.Name || "Anonymous"}</td>
        <td class="ltg-letter-preview">${(letter.Letter || "").substring(0, 100)}...</td>
        <td>${letter["Moderator Comment"] || ""}</td>
        <td>
          ❤️ ${letter["Hearts Count"] || 0}
          🙏 ${letter["Prayer Count"] || 0}
          💔 ${letter["Broken Heart Count"] || 0}
          📖 ${letter["Bible Count"] || 0}
        </td>
      `;

      row.addEventListener("click", () => {
        modalContent.innerHTML = `
          <h2>${letter.Name || "Anonymous"}</h2>
          <p>${letter.Letter || ""}</p>
          <p><strong>Moderator Comment:</strong> ${letter["Moderator Comment"] || "None"}</p>
          <p><strong>Date:</strong> ${letter.Date || ""}</p>
          <p>
            ❤️ ${letter["Hearts Count"] || 0}
            🙏 ${letter["Prayer Count"] || 0}
            💔 ${letter["Broken Heart Count"] || 0}
            📖 ${letter["Bible Count"] || 0}
          </p>
        `;
        modal.classList.add("open");
      });

      table.appendChild(row);
    });
  } catch (err) {
    console.error("❌ Failed to load letters:", err);
    table.innerHTML = "<tr><td colspan='6'>Failed to load letters. Please try again later.</td></tr>";
  }

  document.querySelector("#ltg-modal-close").addEventListener("click", () => {
    modal.classList.remove("open");
  });
});
