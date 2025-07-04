<!-- === GLOBAL POPUP MODAL SYSTEM === -->
<!-- Modal Overlay -->
<div id="popup-modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.5); z-index:9998;"></div>

<!-- Modal Container -->
<div id="popup-modal" style="display:none; position:fixed; top:10%; left:50%; transform:translateX(-50%); width:90%; max-width:700px; background:#fff; padding:30px; z-index:9999; border-radius:12px; box-shadow:0 0 30px rgba(0,0,0,0.3); max-height:80vh; overflow-y:auto;">
  <div style="position:absolute; top:10px; right:15px;">
    <button onclick="closePopupModal()" style="font-size:18px; background:none; border:none; cursor:pointer;">&times;</button>
  </div>
  <div id="popup-modal-content" style="line-height:1.8; font-size:1rem;">
    <p>Loading content...</p>
  </div>
  <div style="margin-top:20px; text-align:right;">
    <button onclick="copyPopupToClipboard()">Copy</button>
    <button onclick="printPopup()">Print</button>
    <button onclick="closePopupModal()">Close</button>
  </div>
</div>

<!-- Toast Notification -->
<div id="popup-copy-toast" style="display:none; position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:#333; color:#fff; padding:10px 20px; border-radius:8px; z-index:10000;">
  Text copied to clipboard!
</div>

<script>
// === GLOBAL POPUP MODAL LOGIC ===
document.addEventListener("DOMContentLoaded", function () {
  const popupTriggers = document.querySelectorAll(".popup-link");

  popupTriggers.forEach(trigger => {
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      const code = this.getAttribute("data-popup-code");
      openPopupModal(code);
    });
  });

  window.openPopupModal = function (popupCode) {
    const modal = document.getElementById("popup-modal");
    const overlay = document.getElementById("popup-modal-overlay");
    const content = document.getElementById("popup-modal-content");

    if (!modal || !overlay || !content) {
      console.error("❌ Popup modal elements not found.");
      return;
    }

    modal.style.display = "block";
    overlay.style.display = "block";
    content.innerHTML = "<p>Loading content...</p>";

    fetch(`https://gymwalker.github.io/walkerjames-life/popups/${popupCode}.html`)
      .then(response => {
        if (!response.ok) throw new Error("Popup content not found");
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("text/html")) throw new Error("Invalid content type");
        return response.text();
      })
      .then(data => {
        content.innerHTML = data;
        modal.scrollTop = 0;
      })
      .catch((err) => {
        content.innerHTML = `
          <div style="text-align:center; padding:20px;">
            <p><strong>${popupCode}</strong> content not found.</p>
            <p>Please contact support if this error continues.</p>
          </div>`;
        console.error("Fetch error:", err);
      });
  };

  window.closePopupModal = function () {
    document.getElementById("popup-modal").style.display = "none";
    document.getElementById("popup-modal-overlay").style.display = "none";
  };
});

// === COPY FUNCTION ===
function copyPopupToClipboard() {
  const content = document.getElementById("popup-modal-content");
  if (!content) return;

  const textToCopy = content.innerText;
  navigator.clipboard.writeText(textToCopy).then(() => {
    const toast = document.getElementById("popup-copy-toast");
    if (toast) {
      toast.style.display = "block";
      setTimeout(() => {
        toast.style.display = "none";
      }, 2000);
    }
  }).catch(err => {
    alert("Failed to copy content: " + err);
  });
}

// === PRINT FUNCTION ===
function printPopup() {
  const content = document.getElementById("popup-modal-content");
  if (!content) return;

  const newWindow = window.open("", "_blank", "width=800,height=600");
  newWindow.document.write(`
    <html>
      <head>
        <title>Print Content</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 2em; line-height: 1.6; }
        </style>
      </head>
      <body>
        ${content.innerHTML}
        <script>window.onload = function() { window.print(); }</scr` + `ipt>
      </body>
    </html>
  `);
  newWindow.document.close();
}
</script>
