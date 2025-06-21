document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("#lettersTable tbody");
  const errorContainer = document.querySelector("#errorContainer");

  function displayError(message) {
    if (errorContainer) {
      errorContainer.textContent = message;
      errorContainer.style.display = "block";
    }
    if (tableBody) {
      tableBody.innerHTML = "";
    }
  }

  function renderLetters(letters) {
    if (!Array.isArray(letters)) {
      displayError("Invalid data format.");
      return;
    }

    tableBody.innerHTML = "";
    letters.forEach((letter, index) => {
      const row = document.createElement("tr");

      const dateCell = document.createElement("td");
      dateCell.textContent = letter.date || "";
      row.appendChild(dateCell);

      const nameCell = document.createElement("td");
      nameCell.textContent = letter.displayName || "Anonymous";
      row.appendChild(nameCell);

      const contentCell = document.createElement("td");
      contentCell.textContent = letter.letterContent || "";
      row.appendChild(contentCell);

      const commentCell = document.createElement("td");
      commentCell.textContent = letter.moderatorComment || "";
      row.appendChild(commentCell);

      tableBody.appendChild(row);
    });
  }

  fetch("https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth")
    .then(async (response) => {
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data && Array.isArray(data.letters)) {
          renderLetters(data.letters);
        } else {
          console.error("Unexpected JSON structure:", data);
          displayError("Invalid data format received.");
        }
      } else {
        const text = await response.text();
        console.error("Expected JSON but received non-JSON:", text.slice(0, 500));
        displayError("Server error: Unexpected response received.");
      }
    })
    .catch((error) => {
      console.error("Fetch failed:", error);
      displayError("Failed to load letters. Please try again later.");
    });
});
