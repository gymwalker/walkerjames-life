// injectPageTitle.js

document.addEventListener("DOMContentLoaded", function () {
  const fullTitle = document.title;
  const cleanTitle = fullTitle.split("|")[0].trim();

  const logoText = document.querySelector("a.logo .logo__text");
  if (!logoText) return;

  // Avoid duplicate insertions
  if (document.querySelector(".external-page-title")) return;

  // Inject dynamic CSS
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

  // Create and inject title element
  const titleDiv = document.createElement("div");
  titleDiv.textContent = cleanTitle;
  titleDiv.className = "external-page-title";
  logoText.parentNode.insertBefore(titleDiv, logoText.nextSibling);
  window.injectPageTitleTest = true;
  console.log("✅ injectPageTitle.js loaded");
});
