// ltgWallEmbed.js (validated 1:31 PM restore point with full display + reaction sync)

document.addEventListener("DOMContentLoaded", async () => {
  const lettersTable = document.getElementById("ltg-wall-entries");
  const detailModal = document.getElementById("letterModal");
  const modalContent = document.getElementById("modalContent");
  const closeModalBtn = document.getElementById("closeModal");

  const getReactions = (letter) => ({
    "❤️": letter.fields["Hearts Count"] || 0,
    "🙏": letter.fields["Prayer Count"] || 0,
    "💔": letter.fields["Broken Hearts Count"] || 0,
    "📖": letter.fields["View Count"] || 0
  });

  const renderLetters = (records) => {
    if (!lettersTable) return;

    lettersTable.innerHTML = "";
    records.forEach((letter) => {
      const row = document.createElement("tr");
      row.className = "ltg-row";
      row.innerHTML = `
        <td>${letter.fields["Date"] || ""}</td>
        <td>${letter.fields["Display Name"] || "Anonymous"}</td>
        <td>${letter.fields["Letter"]?.slice(0, 100) || ""}...</td>
        <td>${letter.fields["Moderator Comment"] || ""}</td>
        <td>${Object.entries(getReactions(letter))
          .map(([emoji, count]) => `${emoji} ${count}`)
          .join(" ")}</td>
      `;

      row.addEventListener("click", () => showModal(letter));
      lettersTable.appendChild(row);
    });
  };

  const showModal = (letter) => {
    if (!modalContent) return;
    const reactions = getReactions(letter);
    modalContent.innerHTML = `
      <h2>${letter.fields["Display Name"] || "Anonymous"}</h2>
      <p>${letter.fields["Letter"] || ""}</p>
      <p><strong>Moderator Comment:</strong> ${letter.fields["Moderator Comment"] || "None"}</p>
      <p><strong>Date:</strong> ${letter.fields["Date"] || ""}</p>
      <p>${Object.entries(reactions)
        .map(([emoji, count]) => `${emoji} ${count}`)
        .join(" ")}</p>
    `;
    detailModal.style.display = "block";

    postReaction(letter.id, { "View Count": reactions["📖"] + 1 });
  };

  closeModalBtn?.addEventListener("click", () => {
    detailModal.style.display = "none";
  });

  const postReaction = async (recordId, reactions) => {
    try {
      const res = await fetch("/.netlify/functions/postReaction", {
        method: "POST",
        body: JSON.stringify({ recordId, reactions })
      });
      const data = await res.json();
      console.log("✅ Reaction successfully synced.", data);
      await refreshLetters();
    } catch (err) {
      console.error("❌ Failed to sync reactions:", err);
    }
  };

  const refreshLetters = async () => {
    try {
      const res = await fetch("/.netlify/functions/getLetters?list=true");
      const data = await res.json();
      renderLetters(data.records);
    } catch (err) {
      console.error("❌ Failed to refresh letters:", err);
      lettersTable.innerHTML = `<tr><td colspan="5">Failed to load letters. Please try again later.</td></tr>`;
    }
  };

  await refreshLetters();
});
