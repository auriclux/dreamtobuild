document.addEventListener("DOMContentLoaded", () => {
  // Category Metadata & Default Images Verified Against Repository Directory
  const categoryMeta = {
    projects: {
      title: "Projects",
      badgeText: "REAL BUILDS",
      badgeClass: "badge-project",
      desc: "Real world vehicles currently under active fabrication or assembly.",
      defaultHero: "./Projects/torky-t-hero.jpg"
    },
    dreams: {
      title: "Dreams",
      badgeText: "TARGET BUILDS",
      badgeClass: "badge-dream",
      desc: "Conceptual studies and detailed engineering blueprints.",
      defaultHero: "./Dreams/buick-supercar.jpg"
    },
    fantasies: {
      title: "Fantasies",
      badgeText: "PURE VISION",
      badgeClass: "badge-fantasy",
      desc: "Pure visual explorations and styling studies.",
      defaultHero: "./Fantasies/fabian-buick-wagon-custom.jpg"
    }
  };

  // Arbitrary Default Showcase Image on Initial Load
  const arbitraryDefaultHero = {
    img: "./Projects/torky-t-hero.jpg",
    title: "Dream To Build",
    badgeText: "FEATURED SHOWCASE",
    badgeClass: "badge-project",
    desc: "Select a branch to explore active shop projects, design studies, or pure vision concepts."
  };

  // DOM Elements
  const heroImg = document.getElementById("hero-img");
  const heroTitle = document.getElementById("hero-title");
  const heroBadge = document.getElementById("hero-badge");
  const heroDesc = document.getElementById("hero-desc");
  const galleryGrid = document.getElementById("gallery-grid");
  const branchBtns = document.querySelectorAll(".branch-btn");

  let activeCategory = null;

  function setHero(data) {
    if (heroImg) heroImg.src = data.img || data.defaultHero;
    if (heroTitle) heroTitle.textContent = data.title;
    if (heroBadge) {
      heroBadge.textContent = data.badgeText;
      heroBadge.className = `badge ${data.badgeClass || ''}`;
    }
    if (heroDesc) heroDesc.textContent = data.desc;
  }

  // Set Default Arbitrary State
  setHero(arbitraryDefaultHero);

  // Hover & Branch Click Event Listeners
  branchBtns.forEach(btn => {
    const type = btn.getAttribute("data-type");
    const meta = categoryMeta[type];

    // Preview category hero on hover
    btn.addEventListener("mouseenter", () => {
      if (meta) setHero(meta);
    });

    // Reset to active category or arbitrary default on mouse leave
    btn.addEventListener("mouseleave", () => {
      if (activeCategory && categoryMeta[activeCategory]) {
        setHero(categoryMeta[activeCategory]);
      } else {
        setHero(arbitraryDefaultHero);
      }
    });

    // Select category, update active button, and populate 3-wide grid
    btn.addEventListener("click", () => {
      activeCategory = type;

      branchBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (meta) setHero(meta);

      fetch(`./data/${type}.json`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status} loading ./data/${type}.json`);
          return res.json();
        })
        .then(items => {
          galleryGrid.innerHTML = "";

          items.forEach(item => {
            const card = document.createElement("article");
            card.className = "card-3wide";

            const detailUrl = `./detail.html?type=${type}&id=${item.id}`;
            const thumbPath = item.thumbnail.startsWith("./") ? item.thumbnail : `./${item.thumbnail}`;

            card.innerHTML = `
              <a href="${detailUrl}" class="card-link">
                <div class="card-image-wrapper">
                  <img src="${thumbPath}" alt="${item.title}" loading="lazy">
                  ${item.badgeText ? `<span class="badge ${item.badgeType \vert{}\vert{} ''}">${item.badgeText}</span>` : ''}
                </div>
                <div class="card-body">
                  <h3 class="card-title">${item.title}</h3>
                  ${item.subtitle ? `<p class="card-subtitle">${item.subtitle}</p>` : ''}
                </div>
              </a>
            `;

            galleryGrid.appendChild(card);
          });
        })
        .catch(err => {
          console.error(`Error loading grid for ${type}:`, err);
          galleryGrid.innerHTML = `<p class="error">Unable to load section items.</p>`;
        });
    });
  });
});document.addEventListener("DOMContentLoaded", () => {
  // Category Metadata Configuration
  const categoryMeta = {
    projects: {
      title: "Projects",
      badgeText: "REAL BUILDS",
      badgeClass: "badge-project",
      desc: "Real world vehicles currently under active fabrication or assembly.",
      defaultHero: "Projects/scapegoat.jpg"
    },
    dreams: {
      title: "Dreams",
      badgeText: "TARGET BUILDS",
      badgeClass: "badge-dream",
      desc: "Conceptual studies and detailed engineering blueprints.",
      defaultHero: "Dreams/reiver.jpg"
    },
    fantasies: {
      title: "Fantasies",
      badgeText: "PURE VISION",
      badgeClass: "badge-fantasy",
      desc: "Pure visual explorations and styling studies.",
      defaultHero: "Fantasies/fabian-buick-wagon-custom.jpg"
    }
  };

  // Arbitrary Default Hero Image when nothing is selected/hovered
  const arbitraryDefaultHero = {
    img: "Projects/scapegoat.jpg",
    title: "Dream To Build",
    badgeText: "FEATURED SHOWCASE",
    badgeClass: "badge-project",
    desc: "Select a branch to explore active shop projects, design studies, or pure vision concepts."
  };

  // DOM Elements
  const heroImg = document.getElementById("hero-img");
  const heroTitle = document.getElementById("hero-title");
  const heroBadge = document.getElementById("hero-badge");
  const heroDesc = document.getElementById("hero-desc");
  const galleryGrid = document.getElementById("gallery-grid");
  const branchBtns = document.querySelectorAll(".branch-btn");

  let activeCategory = null; // Vacant grid by default

  // Helper to Update Hero Panel
  function setHero(data) {
    if (heroImg) heroImg.src = data.img || data.defaultHero;
    if (heroTitle) heroTitle.textContent = data.title;
    if (heroBadge) {
      heroBadge.textContent = data.badgeText;
      heroBadge.className = `badge ${data.badgeClass || ''}`;
    }
    if (heroDesc) heroDesc.textContent = data.desc;
  }

  // Initialize Default Arbitrary Hero State
  setHero(arbitraryDefaultHero);

  // Hover & Click Event Listeners for Sidebar Buttons
  branchBtns.forEach(btn => {
    const type = btn.getAttribute("data-type");
    const meta = categoryMeta[type];

    // HOVER IN: Preview category hero image
    btn.addEventListener("mouseenter", () => {
      if (meta) setHero(meta);
    });

    // HOVER OUT: Return to active category hero or arbitrary default
    btn.addEventListener("mouseleave", () => {
      if (activeCategory && categoryMeta[activeCategory]) {
        setHero(categoryMeta[activeCategory]);
      } else {
        setHero(arbitraryDefaultHero);
      }
    });

    // CLICK: Select category, highlight button, and populate 3-wide grid
    btn.addEventListener("click", () => {
      activeCategory = type;

      // Update Active Button Visual State
      branchBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Lock in Hero Panel
      if (meta) setHero(meta);

      // Populate 3-Wide Scroll-Down Grid
      fetch(`data/${type}.json`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load data/${type}.json`);
          return res.json();
        })
        .then(items => {
          galleryGrid.innerHTML = ""; // Clear existing cards

          items.forEach(item => {
            const card = document.createElement("article");
            card.className = "card-3wide";

            const detailUrl = `detail.html?type=${type}&id=${item.id}`;

            card.innerHTML = `
              <a href="${detailUrl}" class="card-link">
                <div class="card-image-wrapper">
                  <img src="${item.thumbnail}" alt="${item.title}" loading="lazy">
                  ${item.badgeText ? `<span class="badge ${item.badgeType \vert{}\vert{} ''}">${item.badgeText}</span>` : ''}
                </div>
                <div class="card-body">
                  <h3 class="card-title">${item.title}</h3>
                  ${item.subtitle ? `<p class="card-subtitle">${item.subtitle}</p>` : ''}
                </div>
              </a>
            `;

            galleryGrid.appendChild(card);
          });
        })
        .catch(err => {
          console.error(`Error loading grid for ${type}:`, err);
          galleryGrid.innerHTML = `<p class="error">Unable to load section items.</p>`;
        });
    });
  });
});document.addEventListener("DOMContentLoaded", () => {
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
