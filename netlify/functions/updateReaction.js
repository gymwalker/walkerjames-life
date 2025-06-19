document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("ltg-modal");
  if (!modal) return;

  const reactionBar = document.getElementById("ltg-reactions");
  if (!reactionBar) return;

  // Extract record ID from dataset (you must add data-record-id to modal if not already)
  let recordId = null;

  const observer = new MutationObserver(() => {
    const modalBody = document.getElementById("ltg-modal-body");
    if (modalBody) {
      recordId = modalBody.dataset.recordId || null;
    }
  });

  observer.observe(modal, { attributes: true, childList: true, subtree: true });

  reactionBar.addEventListener("click", async (e) => {
    const target = e.target;
    if (!target || !recordId) return;

    const emojiText = target.textContent.trim().charAt(0);
    const emojiMap = {
      "❤️": "Love Count",
      "🙏": "Prayer Count",
      "💔": "Broken Heart Count",
      "📖": "Read Count"
    };

    const fieldName = emojiMap[emojiText];
    if (!fieldName) return;

    try {
      const res = await fetch("/.netlify/functions/updateReactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId, emoji: fieldName })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unknown error");

      // Update count visually
      const emojiSpan = Array.from(reactionBar.children).find(span =>
        span.textContent.trim().startsWith(emojiText)
      );

      if (emojiSpan) {
        const parts = emojiSpan.textContent.trim().split(" ");
        const count = parseInt(parts[1], 10) || 0;
        emojiSpan.innerHTML = `${emojiText} ${count + 1}`;
      }

    } catch (err) {
      console.error("Reaction update failed:", err);
      alert("Sorry, we couldn't register your reaction. Please try again.");
    }
  });
});
