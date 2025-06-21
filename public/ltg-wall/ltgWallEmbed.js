(function () {
  const css = `
    #ltg-wall-container { padding: 2rem; font-family: sans-serif; overflow-x: auto; }
    #ltg-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); align-items: center; justify-content: center; z-index: 9999; }
    #ltg-modal-body { background: white; padding: 2rem; max-width: 600px; border-radius: 8px; overflow: hidden; position: relative; }
    #ltg-close { position: absolute; top: 10px; right: 14px; font-size: 1.5rem; cursor: pointer; }
    .scroll-box { max-height: 12em; overflow-y: auto; margin-bottom: 1rem; padding: 0.5rem; background: #f4f4f4; border-radius: 4px; }
    .table-wrapper { overflow-x: auto; display: block; max-width: 100%; }
    table { min-width: 900px; }
    th, td { border-bottom: 1px solid #ccc; padding: 0.5rem; text-align: left; vertical-align: top; font-size: 1rem; }
    th:nth-child(n+5), td:nth-child(n+5) { text-align: center; }
    tr:hover { background-color: #f9f9f9; cursor: pointer; }
    .reaction-button { margin: 0 5px; cursor: pointer; font-size: 1.5rem; }
  `;

  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);

  const container = document.getElementById('ltg-wall-container');
  container.innerHTML = `
    <div id="ltg-modal">
      <div id="ltg-modal-body"></div>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Letter</th>
            <th>Moderator Comment</th>
            <th>❤️</th>
            <th>🙏</th>
            <th>💔</th>
            <th>📖</th>
          </tr>
        </thead>
        <tbody id="letters-grid"></tbody>
      </table>
    </div>
  `;

  const grid = document.getElementById('letters-grid');
  const modal = document.getElementById('ltg-modal');
  const modalBody = document.getElementById('ltg-modal-body');

  const API_URL = 'https://hook.us2.make.com/sp9n176kbk7uzawj5uj7255w9ljjznth'
