document.addEventListener("DOMContentLoaded", () => {
  const sections = [
    { type: "projects", gridId: "projects-grid" },
    { type: "dreams", gridId: "dreams-grid" },
    { type: "fantasies", gridId: "fantasies-grid" }
  ];

  sections.forEach(section => {
    const grid = document.getElementById(section.gridId);
    if (!grid) return;

    fetch(`data/${section.type}.json`)
      .then(response => {
        if (!response.ok) throw new Error(`Could not load data/${section.type}.json`);
        return response.json();
      })
      .then(data => {
        grid.innerHTML = ""; // Clear loader/placeholder

        data.forEach(item => {
          const card = document.createElement("article");
          card.className = "card";

          // Dynamic detail link pointing to master template
          const detailUrl = `detail.html?type=${section.type}&id=${item.id}`;

          card.innerHTML = `
            <a href="${detailUrl}" class="card-link">
              <div class="card-image-wrapper">
                <img src="${item.thumbnail}" alt="${item.title}" loading="lazy">
                ${item.badgeText ? `<span class="badge ${item.badgeType \vert{}\vert{} ''}">${item.badgeText}</span>` : ''}
              </div>
              <div class="card-body">
                <h3 class="card-title">${item.title}</h3>
                ${item.subtitle ? `<p class="card-subtitle">${item.subtitle}</p>` : ''}
                <p class="card-summary">${item.summary || ''}</p>
              </div>
            </a>
          `;

          grid.appendChild(card);
        });
      })
      .catch(err => {
        console.error(`Error loading ${section.type}:`, err);
        grid.innerHTML = `<p class="error">Unable to load section items.</p>`;
      });
  });
});
