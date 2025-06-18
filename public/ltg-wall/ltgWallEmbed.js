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
    { label: "❤️", field: "Love" },
    { label: "🙏", field: "Prayer" },
    { label: "💔", field: "Broken" },
    { label: "📖", field: "Bible" }
  ];

  emojis.forEach(({ label, field }) => {
    const btn = document.createElement("button");
    btn.textContent = `${label} ${letter.reactions[field] || 0}`;
    btn.addEventListener("click", async () => {
      await sendReaction(letter.id, field);
    });
    container.appendChild(btn);
  });
}

async function sendReaction(letterId, field) {
  try {
    const response = await fetch(updateReactionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ letterId, field })
    });

    if (!response.ok) {
      throw new Error(`Failed to update reaction: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error sending reaction:", error);
  }
}

function createLetterCard(letter) {
  const card = document.createElement("div");
  card.className = "letter-card";

  const summary = document.createElement("div");
  summary.className = "letter-summary";
  summary.innerHTML = `
    <div><strong>${letter.date}</strong> – <em>${letter.name}</em></div>
    <div>${letter.letter.slice(0, 100)}...</div>
  `;
  card.appendChild(summary);

  const buttonContainer = document.createElement("div");
  buttonContainer.className = "reaction-buttons";
  createReactionButtons(letter, buttonContainer);
  card.appendChild(buttonContainer);

  card.addEventListener("click", () => showModal(letter));
  return card;
}

function showModal(letter) {
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>${letter.name}</h2>
      <p>${letter.letter}</p>
      <div><strong>Moderator Comment:</strong> ${letter.moderatorComment || "None"}</div>
    </div>
  `;

  const btns = modal.querySelector(".modal-content");
  createReactionButtons(letter, btns);

  document.body.appendChild(modal);

  modal.querySelector(".close").addEventListener("click", () => {
    document.body.removeChild(modal);
  });
}

async function displayLetters() {
  const container = document.getElementById("ltg-wall");
  container.innerHTML = "<p>Loading letters...</p>";
  const letters = await fetchLetters();
  container.innerHTML = "";

  if (letters.length === 0) {
    container.innerHTML = "<p>Failed to load letters. Please try again later.</p>";
    return;
  }

  letters.forEach((letter) => {
    const card = createLetterCard(letter);
    container.appendChild(card);
  });
}

displayLetters();
