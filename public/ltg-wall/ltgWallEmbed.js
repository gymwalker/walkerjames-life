document.addEventListener("DOMContentLoaded", function () {
  const wallContainer = document.createElement("div");
  wallContainer.id = "ltg-wall-container";
  wallContainer.style.overflowX = "auto";
  wallContainer.style.width = "100%";
  wallContainer.style.marginTop = "40px";

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.fontFamily = "Arial, sans-serif";
  table.style.fontSize = "16px";

  const headerRow = document.createElement("tr");
  const headers = ["Date", "Name", "Letter", "Moderator Comment", "Hearts ❤️", "Prayers 🙏", "Broken 💔", "Views 👁️"];

  headers.forEach((text, i) => {
    const th = document.createElement("th");
    th.innerText = text;
    th.style.border = "1px solid #ccc";
    th.style.padding = "12px";
    th.style.backgroundColor = "#f8f8f8";
    th.style.textAlign = "left";
    th.style.position = "sticky";
    th.style.top = "0";
    th.style.background = "#fff";
    th.style.zIndex = "2";
    if (i < 3) th.style.left = `${i * 150}px`; // lock first 3 columns
    headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  fetch("https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth")
    .then(response => response.text())
    .then(text => {
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
      lines.forEach(line => {
        const match = line.match(/^(\d{4}-\d{2}-\d{2})(Anonymous|[A-Za-z ]+)(.*?)(Lovely drawing.*|Uplifting news.*|Heartwarming message.*)?$/);
        if (match) {
          const row = document.createElement("tr");
          const [_, date, name, letter, comment] = match;
          const cells = [date, name, letter.trim(), comment || "", "", "", "", ""];

          cells.forEach((cellText, i) => {
            const td = document.createElement("td");
            td.innerText = cellText;
            td.style.border = "1px solid #ccc";
            td.style.padding = "10px";
            td.style.whiteSpace = i >= 2 ? "normal" : "nowrap";
            td.style.maxWidth = i === 2 ? "400px" : "150px";
            td.style.overflow = "hidden";
            td.style.textOverflow = "ellipsis";
            if (i < 3) {
              td.style.position = "sticky";
              td.style.left = `${i * 150}px`;
              td.style.background = "#fff";
              td.style.zIndex = "1";
            }
            row.appendChild(td);
          });

          table.appendChild(row);
        }
      });

      wallContainer.appendChild(table);
      document.body.appendChild(wallContainer);
    })
    .catch(err => {
      console.error("Failed to load Letters to God data:", err);
    });
});
