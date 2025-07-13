(function () {
  function injectPrayerModalStructure() {
    if (document.getElementById("prayer-modal")) return;

    const modalHTML = `
      <div id="prayer-modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.5); z-index:9998;" onclick="closePrayerModal()"></div>
      <div id="prayer-modal" style="display:none; position:fixed; top:10%; left:50%; transform:translateX(-50%); width:90%; max-width:600px; background:#fff; padding:30px; z-index:9999; border-radius:12px; box-shadow:0 0 30px rgba(0,0,0,0.3); max-height:80vh; overflow-y:auto;">
        <div id="prayer-modal-content"><p>Loading prayer...</p></div>
        <div style="margin-top:20px; text-align:right;">
          <button onclick="copyPrayerToClipboard()">Copy</button>
          <button onclick="printPrayer()">Print</button>
          <button onclick="closePrayerModal()">Close</button>
        </div>
      </div>
      <div id="copy-toast" style="display:none; position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:10px 20px; border-radius:8px; z-index:10000;">Prayer copied to clipboard!</div>
    `;

    const container = document.createElement("div");
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  }

  window.openPrayerModal = function (prayerCode) {
    injectPrayerModalStructure();

    const modal = document.getElementById("prayer-modal");
    const overlay = document.getElementById("prayer-modal-overlay");
    const content = document.getElementById("prayer-modal-content");

    if (!modal || !overlay || !content) return;

    modal.style.display = "block";
    overlay.style.display = "block";
    content.innerHTML = "<p>Loading prayer...</p>";

    const url = `https://gymwalker.github.io/walkerjames-life/guided-prayers/${prayerCode}.html`;

    fetch(url)
      .then(res => res.ok ? res.text() : Promise.reject("Not found"))
      .then(html => content.innerHTML = html)
      .catch(() => {
        content.innerHTML = `<p><strong>${prayerCode}</strong> prayer not found.</p>`;
      });
  };

  window.closePrayerModal = function () {
    document.getElementById("prayer-modal")?.style.setProperty("display", "none");
    document.getElementById("prayer-modal-overlay")?.style.setProperty("display", "none");
  };

  window.copyPrayerToClipboard = function () {
    const text = document.getElementById("prayer-modal-content")?.innerText || '';
    navigator.clipboard.writeText(text).then(() => {
      const toast = document.getElementById("copy-toast");
      if (toast) {
        toast.style.display = "block";
        setTimeout(() => toast.style.display = "none", 2000);
      }
    });
  };

  window.printPrayer = function () {
    const content = document.getElementById("prayer-modal-content")?.innerHTML || '';
    const win = window.open("", "_blank", "width=800,height=600");
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Print Prayer</title>
            <style>body { font-family: Arial; padding: 2em; }</style>
          </head>
          <body>${content}</body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500);
    }
  };

  function bindPrayerLinks() {
    document.querySelectorAll(".prayer-link").forEach(link => {
      if (!link.dataset.prayerBound) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          const code = this.getAttribute("data-prayer-code");
          if (code) openPrayerModal(code);
        });
        link.dataset.prayerBound = "true";
      }
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      bindPrayerLinks();
    }, 300);
  });
})();
