document.addEventListener("DOMContentLoaded", () => {
  const categoryMeta = {
    About: {
      title: "About Dream To Build",
      badgeText: "STORY & MISSION",
      badgeClass: "badge-about",
      desc: "Dragging High Concept Pretty Pictures Kicking and Screaming into the Real World.",
      defaultHero: "./Projects/torky-t-hero.jpg",
      dataFile: "data/about.json"
    },
    Projects: {
      title: "Projects",
      badgeText: "REAL BUILDS",
      badgeClass: "badge-project",
      desc: "Real world vehicles currently under active fabrication or assembly.",
      defaultHero: "./Projects/torky-t-hero.jpg",
      dataFile: "data/projects.json"
    },
    Dreams: {
      title: "Dreams",
      badgeText: "TARGET BUILDS",
      badgeClass: "badge-dream",
      desc: "Conceptual studies and detailed engineering blueprints.",
      defaultHero: "./Dreams/surrey-hero-40s.jpg",
      dataFile: "data/dreams.json"
    },
    Fantasies: {
      title: "Fantasies",
      badgeText: "PURE VISION",
      badgeClass: "badge-fantasy",
      desc: "Pure visual explorations and styling studies.",
      defaultHero: "./Fantasies/fabian-buick-wagon-custom.jpg",
      dataFile: "data/fantasies.json"
    }
  };

  const arbitraryDefaultHero = {
    img: "./Projects/torky-t-hero.jpg",
    title: "Torky-T",
    badgeText: "FEATURED SHOWCASE",
    badgeClass: "badge-project",
    desc: "1923 Ford T-Bucket featuring a built 350 SBC, Quick Fuel 750, Don Zig serviced Vertex magneto, TH350, and 9-inch rear axle.",
    linkUrl: "#"
  };

  // DOM Elements
  const heroImg = document.getElementById("hero-img") || document.getElementById("spotlight-img");
  const heroTitle = document.getElementById("hero-title") || document.getElementById("spotlight-title");
  const heroBadge = document.getElementById("hero-badge");
  const heroDesc = document.getElementById("hero-desc") || document.getElementById("spotlight-desc");
  const spotlightFrame = document.getElementById("spotlight-frame");
  const galleryGrid = document.getElementById("gallery-grid");
  const branchBtns = document.querySelectorAll(".branch-btn");
  const homeBtn = document.getElementById("nav-home-btn");

  let activeCategory = null;
  const categoryCache = {};

  function setHero(data) {
    if (heroImg) heroImg.src = data.img || data.defaultHero || "";
    if (heroTitle) heroTitle.textContent = data.title || "";
    if (heroBadge) {
      heroBadge.textContent = data.badgeText || "";
      heroBadge.className = `badge ${data.badgeClass || ''}`;
    }
    if (heroDesc) heroDesc.textContent = data.desc || "";
  }

  function resetToHero(updateState = true) {
    activeCategory = null;
    branchBtns.forEach(b => b.classList.remove("active"));
    setHero(arbitraryDefaultHero);
    if (galleryGrid) {
      galleryGrid.style.display = "none";
      galleryGrid.innerHTML = "";
    }
    if (spotlightFrame) spotlightFrame.style.display = "block";
    
    if (updateState && window.location.hash) {
      history.pushState(null, "", window.location.pathname + window.location.search);
    }
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function loadCategory(folderType, updateState = true) {
    const meta = categoryMeta[folderType];
    if (!meta) return;

    activeCategory = folderType;

    branchBtns.forEach(b => {
      if (b.getAttribute("data-type") === folderType) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });

    if (spotlightFrame) spotlightFrame.style.display = "none";
    if (!galleryGrid) return;

    if (updateState) {
      history.pushState({ category: folderType }, "", `#${folderType.toLowerCase()}`);
    }

    try {
      if (!categoryCache[folderType]) {
        const res = await fetch(meta.dataFile);
        if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${meta.dataFile}`);
        categoryCache[folderType] = await res.json();
      }

      const rawData = categoryCache[folderType];
      galleryGrid.innerHTML = "";

      if (folderType === "About") {
        galleryGrid.style.display = "block";
        const mission = rawData.content?.mission || rawData.mission || "";
        const pillars = rawData.content?.pillars || [];

        let pillarsHTML = pillars.map(p => `
          <div class="about-pillar">
            <h4>${escapeHtml(p.heading)}</h4>
            <p>${escapeHtml(p.description)}</p>
          </div>
        `).join('');

        galleryGrid.innerHTML = `
          <article class="about-card-view">
            <h2>${escapeHtml(rawData.title || meta.title)}</h2>
            <p class="about-tagline"><em>${escapeHtml(rawData.tagline || meta.desc)}</em></p>
            <p class="about-mission">${escapeHtml(mission)}</p>
            <div class="about-pillars-grid">${pillarsHTML}</div>
          </article>
        `;
        return;
      }

      galleryGrid.style.display = "grid";
      const items = Array.isArray(rawData) ? rawData : (rawData.items || []);

      if (!items || items.length === 0) {
        galleryGrid.innerHTML = `<p class="info">No assets found in ${folderType}.</p>`;
        return;
      }

      items.forEach(item => {
        const card = document.createElement("article");
        card.className = "card-3wide";

        const imgSrc = item.thumb || item.thumbnail || item.heroImage || (item.gallery && item.gallery[0]) || "";
        const targetUrl = item.detailUrl || `detail.html?type=${folderType.toLowerCase()}&id=${item.id}`;

        card.innerHTML = `
          <a href="${targetUrl}" class="card-link">
            <div class="card-image-wrapper">
              <img src="${imgSrc}" alt="${escapeHtml(item.title)}" loading="lazy">
              <span class="badge ${item.badgeType || meta.badgeClass}">${escapeHtml(item.badgeText || meta.badgeText)}</span>
            </div>
            <div class="card-body">
              <h3 class="card-title">${escapeHtml(item.title)}</h3>
              <p class="card-subtitle">${escapeHtml(item.subtitle || item.description || '')}</p>
            </div>
          </a>
        `;

        galleryGrid.appendChild(card);
      });
    } catch (err) {
      console.error(`Error loading assets for ${folderType}:`, err);
      galleryGrid.style.display = "block";
      galleryGrid.innerHTML = `<p class="error">Unable to load assets for ${folderType}.</p>`;
    }
  }

  // Home Button Handler
  if (homeBtn) {
    homeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      resetToHero(true);
    });
  }

  // Sidebar Button Delegation
  branchBtns.forEach(btn => {
    const folderType = btn.getAttribute("data-type");
    if (folderType === "Home") return;

    const meta = categoryMeta[folderType];

    btn.addEventListener("mouseenter", () => {
      if (meta && !activeCategory) setHero(meta);
    });

    btn.addEventListener("mouseleave", () => {
      if (!activeCategory) setHero(arbitraryDefaultHero);
    });

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      loadCategory(folderType, true);
    });
  });

  // URL Hash & Query Routing Parser
  function syncViewWithRoute() {
    const urlParams = new URLSearchParams(window.location.search);
    const queryType = urlParams.get("type");
    const hashType = window.location.hash.replace("#", "");

    const targetRoute = (queryType || hashType).toLowerCase();
    const matchedCategory = Object.keys(categoryMeta).find(
      key => key.toLowerCase() === targetRoute
    );

    if (matchedCategory) {
      loadCategory(matchedCategory, false);
    } else {
      resetToHero(false);
    }
  }

  // Event Listeners for History Traversal & Initial Run
  window.addEventListener("popstate", syncViewWithRoute);
  syncViewWithRoute();
});
