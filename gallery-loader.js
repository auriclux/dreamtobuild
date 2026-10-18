/* ==========================================================================
   DREAM TO BUILD — GALLERY LOADER & ROTATOR INTEGRATION
   ========================================================================== */

function initGalleryLoader() {
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

  const heroImg = document.getElementById("hero-img") || document.getElementById("spotlight-img");
  const heroTitle = document.getElementById("hero-title") || document.getElementById("spotlight-title");
  const heroBadge = document.getElementById("hero-badge");
  const heroDesc = document.getElementById("hero-desc") || document.getElementById("spotlight-desc");
  const spotlightFrame = document.getElementById("spotlight-frame");
  const galleryGrid = document.getElementById("gallery-grid");
  const sidebarNav = document.querySelector(".sidebar-nav");
  const branchBtns = document.querySelectorAll(".branch-btn");

  let activeCategory = null;
  let activeRotator = null; // Holds our HeroRotator instance

  function stopRotator() {
    if (activeRotator) {
      activeRotator.stop();
      activeRotator = null;
    }
  }

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
    stopRotator();
    activeCategory = null;
    branchBtns.forEach(b => b.classList.remove("active"));
    setHero(arbitraryDefaultHero);
    
    if (spotlightFrame) spotlightFrame.style.display = "flex";
    
    if (galleryGrid) {
      galleryGrid.style.display = "none";
      galleryGrid.innerHTML = "";
    }

    // Home rotator pool from sidebar nav items
    const homePool = [
      {
        url: "./Projects/torky-t-hero.jpg",
        title: "Torky-T",
        badgeText: "FEATURED SHOWCASE",
        badgeClass: "badge-project",
        desc: "1923 Ford T-Bucket featuring a built 350 SBC, Quick Fuel 750, Don Zig serviced Vertex magneto, TH350, and 9-inch rear axle."
      },
      {
        url: "./Dreams/surrey-hero-40s.jpg",
        title: "Dreams",
        badgeText: "TARGET BUILDS",
        badgeClass: "badge-dream",
        desc: "Conceptual studies and detailed engineering blueprints."
      },
      {
        url: "./Fantasies/fabian-buick-wagon-custom.jpg",
        title: "Fantasies",
        badgeText: "PURE VISION",
        badgeClass: "badge-fantasy",
        desc: "Pure visual explorations and styling studies."
      }
    ];

    if (window.HeroRotator && heroImg) {
      activeRotator = new HeroRotator(homePool, heroImg, heroTitle, heroBadge, heroDesc, 7000);
    }
    
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

    stopRotator();
    activeCategory = folderType;

    branchBtns.forEach(b => {
      const type = b.getAttribute("data-type");
      if (type === folderType) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });

    if (spotlightFrame) spotlightFrame.style.display = "flex";
    if (!galleryGrid) return;

    if (updateState) {
      history.pushState({ category: folderType }, "", `#${folderType.toLowerCase()}`);
    }

    try {
      const res = await fetch(`${meta.dataFile}?v=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status} (${res.statusText}) fetching ${meta.dataFile}`);
      const rawData = await res.json();

      galleryGrid.innerHTML = "";

      let items = Array.isArray(rawData) 
        ? rawData.filter(item => item && item.id) 
        : (rawData.items || []);

      if (items.length === 0) {
        galleryGrid.style.display = "block";
        galleryGrid.innerHTML = `<p class="info">No valid items found in ${meta.dataFile}.</p>`;
        return;
      }

      // Sort items newest-first
      items.sort((a, b) => {
        const dateA = new Date(a.specifications?.dateAdded || 0);
        const dateB = new Date(b.specifications?.dateAdded || 0);
        return dateB - dateA;
      });

      // Build image pool for HeroRotator from all items in this category
      const imagePool = items.map(item => ({
        url: item.heroImage || item.thumb || item.thumbnail || (item.gallery && item.gallery[0]) || "",
        title: item.title,
        badgeText: item.badgeText || meta.badgeText,
        badgeClass: item.badgeType || meta.badgeClass,
        desc: item.subtitle || item.summary || meta.desc
      })).filter(img => img.url !== "");

      if (imagePool.length > 0 && heroImg) {
        // Set initial hero to the first item
        setHero(imagePool[0]);
        // Start the 7-second randomized rotator for this category
        if (window.HeroRotator) {
          activeRotator = new HeroRotator(imagePool, heroImg, heroTitle, heroBadge, heroDesc, 7000);
        }
      }

      galleryGrid.style.display = "grid";

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
      galleryGrid.style.color = "#ff6b6b";
      galleryGrid.innerHTML = `<p class="error"><strong>JSON/Fetch Error in ${folderType}:</strong> ${escapeHtml(err.message)}</p>`;
    }
  }

  // GLOBAL SIDEBAR CLICK DELEGATION
  if (sidebarNav) {
    sidebarNav.addEventListener("click", (e) => {
      const btn = e.target.closest(".branch-btn");
      if (!btn) return;

      e.preventDefault();
      const type = btn.getAttribute("data-type");

      if (type === "Home") {
        resetToHero(true);
      } else if (type) {
        loadCategory(type, true);
      }
    });

    sidebarNav.addEventListener("mouseover", (e) => {
      const btn = e.target.closest(".branch-btn");
      if (!btn || activeCategory) return;
      const type = btn.getAttribute("data-type");
      if (categoryMeta[type]) {
        setHero(categoryMeta[type]);
      }
    });

    sidebarNav.addEventListener("mouseout", (e) => {
      const btn = e.target.closest(".branch-btn");
      if (!btn || activeCategory) return;
      setHero(arbitraryDefaultHero);
    });
  }

  // Route Parser
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

  window.addEventListener("popstate", syncViewWithRoute);
  syncViewWithRoute();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGalleryLoader);
} else {
  initGalleryLoader();
}
