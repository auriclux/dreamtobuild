document.addEventListener("DOMContentLoaded", () => {
  // Metadata & Relative Paths for GitHub Pages
  const categoryMeta = {
    projects: {
      title: "Projects",
      badgeText: "REAL BUILDS",
      badgeClass: "badge-project",
      desc: "Real world vehicles currently under active fabrication or assembly.",
      defaultHero: "./Projects/scapegoat.jpg"
    },
    dreams: {
      title: "Dreams",
      badgeText: "TARGET BUILDS",
      badgeClass: "badge-dream",
      desc: "Conceptual studies and detailed engineering blueprints.",
      defaultHero: "./Dreams/reiver.jpg"
    },
    fantasies: {
      title: "Fantasies",
      badgeText: "PURE VISION",
      badgeClass: "badge-fantasy",
      desc: "Pure visual explorations and styling studies.",
      defaultHero: "./Fantasies/fabian-buick-wagon-custom.jpg"
    }
  };

  // Arbitrary Default Hero Image on Initial Load
  const arbitraryDefaultHero = {
    img: "./Projects/scapegoat.jpg",
    title: "Dream To Build",
    badgeText: "FEATURED SHOWCASE",
    badgeClass: "badge-project",
    desc: "Select a branch to explore active shop projects, design studies, or pure vision concepts."
  };

  // DOM Elements
  const heroImg = document.getElementById("hero-img") || document.getElementById("spotlight-img");
  const heroTitle = document.getElementById("hero-title") || document.getElementById("spotlight-title");
  const heroBadge = document.getElementById("hero-badge");
  const heroDesc = document.getElementById("hero-desc") || document.getElementById("spotlight-desc");
  const galleryGrid = document.getElementById("gallery-grid");
  const branchBtns = document.querySelectorAll(".branch-btn");

  let activeCategory = null;

  function setHero(data) {
    if (heroImg) heroImg.src = data.img || data.defaultHero || "";
    if (heroTitle) heroTitle.textContent = data.title || "";
    if (heroBadge) {
      heroBadge.textContent = data.badgeText || "";
      heroBadge.className = `badge ${data.badgeClass || ''}`;
    }
    if (heroDesc) heroDesc.textContent = data.desc || "";
  }

  // Set Initial Showcase
  setHero(arbitraryDefaultHero);

  // Hover & Selection Logic
  branchBtns.forEach(btn => {
    const type = btn.getAttribute("data-type");
    const meta = categoryMeta[type];

    btn.addEventListener("mouseenter", () => {
      if (meta) setHero(meta);
    });

    btn.addEventListener("mouseleave", () => {
      if (activeCategory && categoryMeta[activeCategory]) {
        setHero(categoryMeta[activeCategory]);
      } else {
        setHero(arbitraryDefaultHero);
      }
    });

    btn.addEventListener("click", () => {
      activeCategory = type;

      branchBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (meta) setHero(meta);

      if (!galleryGrid) return;

      // Fetch corresponding JSON
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
            const rawThumb = item.thumbnail || item.image || "";
            const thumbPath = rawThumb.startsWith("./") ? rawThumb : `./${rawThumb}`;

            card.innerHTML = `
              <a href="${detailUrl}" class="card-link">
                <div class="card-image-wrapper">
                  <img src="${thumbPath}" alt="${item.title || 'Build'}" loading="lazy">
                  ${item.badgeText ? `<span class="badge ${item.badgeType \vert{}\vert{} ''}">${item.badgeText}</span>` : ''}
                </div>
                <div class="card-body">
                  <h3 class="card-title">${item.title || 'Untitled'}</h3>
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
});
