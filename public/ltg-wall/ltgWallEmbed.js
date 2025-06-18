// ltgWallEmbed.js

const baseUrl = "https://walkerjames-life.netlify.app/.netlify/functions";
const getLettersUrl = `${baseUrl}/getLetters`;
const updateReactionUrl = `${baseUrl}/updateReaction`;

async function fetchLetters() {
  try {
    const response = await fetch(getLettersUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch letters: ${response.statusText}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Invalid data format from API");
    return data;
  } catch (error) {
    console.error("Error fetching letters:", error);
    return [];
  }
}

function createReactionButtons(letter, container) {
  const emojis = [
    { label: "❤️", field: "Hearts Count" },
    { label: "🙏", field: "Prayer Count" },
    { label: "💔", field: "Broken Heart Count" },
    { label: "📖", field: "Bible Shared Count" }
  ];

  emojis.forEach(({ label, field }) => {
    const btn = document.createElement("button");
    btn.textContent = `${label} ${letter[field] || 0}`;
    btn.addEventListener("click", async () => {
      await sendReaction(letter.id, field);
    });
    container.appendChild(btn);
  });
}

async function sendReaction(recordId, field) {
  try {
    const response = await fetch(updateReactionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordId, reactions: { [field]: 1 } })
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to update reaction");
    }
    console.log("Reaction updated:", result);
    location.reload();
  } catch (err) {
    console.error("Error sending reaction:", err);
  }
}

function displayLetters(letters) {
  const container = document.getElementById("ltgWallContainer");
  container.innerHTML = "";

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Date</th>
        <th>Name</th>
        <th>Letter</th>
        <th>Moderator Comment</th>
        <th>❤️</th>
        <th>🙏</th>
        <th>💔</th>
        <th>📖</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");
  letters.forEach(letter => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${letter.Date || ""}</td>
      <td>${letter.Name || ""}</td>
      <td>${letter.Letter?.substring(0, 80) || ""}...</td>
      <td>${letter["Moderator Comment"] || ""}</td>
      <td>${letter["Hearts Count"] || 0}</td>
      <td>${letter["Prayer Count"] || 0}</td>
      <td>${letter["Broken Heart Count"] || 0}</td>
      <td>${letter["Bible Shared Count"] || 0}</td>
    `;
    tbody.appendChild(row);
  });

  container.appendChild(table);
}

(async function init() {
  const letters = await fetchLetters();
  if (letters.length === 0) {
    document.getElementById("ltgWallContainer").textContent = "Failed to load letters. Please try again later.";
  } else {
    displayLetters(letters);
  }
})();
