(function () {
  function injectModalStructure() {
    if (document.getElementById("popup-modal")) return;

    const modalHTML = `
      <div id="popup-modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.5); z-index:9998;" onclick="closePopupModal()"></div>
      <div id="popup-modal" style="display:none; position:fixed; top:10%; left:50%; transform:translateX(-50%); width:90%; max-width:700px; background:#fff; padding:30px; z-index:9999; border-radius:12px; box-shadow:0 0 30px rgba(0,0,0,0.3); max-height:80vh; overflow-y:auto;">
        <div id="popup-modal-content"><p>Loading content...</p></div>
        <div style="margin-top:20px; text-align:right;">
          <button onclick="copyPopupToClipboard()">Copy</button>
          <button onclick="printPopup()">Print</button>
          <button onclick="closePopupModal()">Close</button>
        </div>
      </div>
      <div id="popup-copy-toast" style="display:none; position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:10px 20px; border-radius:8px; z-index:10000;">Text copied to clipboard!</div>
    `;

    const container = document.createElement("div");
    container.innerHTML = modalHTML;
    document.body.appendChild(container);
  }

  window.openPopupModal = function (popupCode) {
    injectModalStructure();

    const modal = document.getElementById("popup-modal");
    const overlay = document.getElementById("popup-modal-overlay");
    const content = document.getElementById("popup-modal-content");

    if (!modal || !overlay || !content) return;

    modal.style.display = "block";
    overlay.style.display = "block";
    content.innerHTML = "<p>Loading content...</p>";

    const url = `https://gymwalker.github.io/walkerjames-life/popups/${popupCode}.html`;

    fetch(url)
      .then(res => res.ok ? res.text() : Promise.reject("Not found"))
      .then(html => content.innerHTML = html)
      .catch(() => {
        content.innerHTML = `<p><strong>${popupCode}</strong> content not found.</p>`;
      });
  };

  window.closePopupModal = function () {
    document.getElementById("popup-modal")?.style.setProperty("display", "none");
    document.getElementById("popup-modal-overlay")?.style.setProperty("display", "none");
  };

  window.copyPopupToClipboard = function () {
    const text = document.getElementById("popup-modal-content")?.innerText || '';
    navigator.clipboard.writeText(text).then(() => {
      const toast = document.getElementById("popup-copy-toast");
      if (toast) {
        toast.style.display = "block";
        setTimeout(() => toast.style.display = "none", 2000);
      }
    });
  };

  window.printPopup = function () {
    const content = document.getElementById("popup-modal-content")?.innerHTML || '';
    const win = window.open("", "_blank", "width=800,height=600");
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Print</title>
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

  function bindPopupLinks() {
    document.querySelectorAll(".popup-link").forEach(link => {
      if (!link.dataset.popupBound) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          const code = this.getAttribute("data-popup-code");
          if (code) openPopupModal(code);
        });
        link.dataset.popupBound = "true";
      }
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      bindPopupLinks();
    }, 300);
  });
})();
