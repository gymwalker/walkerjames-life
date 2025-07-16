(function () {
  const titleText = "Guided Prayers";

  function injectTitle() {
    const logoText = document.querySelector("a.logo .logo__text");
    if (!logoText || document.querySelector(".external-page-title")) return;

    const titleDiv = document.createElement("div");
    titleDiv.textContent = titleText;
    titleDiv.className = "external-page-title";
    logoText.parentNode.insertBefore(titleDiv, logoText.nextSibling);

    console.log("✅ Page title injected");
  }

  // Add styling
  const style = document.createElement("style");
  style.textContent = `
    .external-page-title {
      font-size: 1rem;
      font-weight: 600;
      margin-top: 4px;
      color: #ccc;
      text-align: center;
      font-family: 'Inter', sans-serif;
    }
  `;
  document.head.appendChild(style);

  // Inject after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectTitle);
  } else {
    injectTitle();
  }

  // Watch for header rerenders
  const observer = new MutationObserver(injectTitle);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Global test flag
  window.injectPageTitleTest = true;
})();
