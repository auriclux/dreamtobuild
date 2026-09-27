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

  // Set Initial Arbitrary Showcase
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

            // Relative link to detail page
            const detailUrl = `./detail.html?type=${type}&id=${item.id}`;
            // Prepend ./ to thumbnail if not already present
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
  // 1. Parse URL parameters (e.g. detail.html?type=fantasies&id=blown-gremlin)
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type") || "fantasies"; // default to fantasies if omitted
  const buildId = urlParams.get("id");

  if (!buildId) {
    document.getElementById("build-title").textContent = "Build Not Found";
    return;
  }

  // 2. Fetch the correct JSON file based on the type parameter
  const dataFile = `data/${type}.json`;

  fetch(dataFile)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to load ${dataFile}`);
      return response.json();
    })
    .then(data => {
      // 3. Find the matching build item by id
      const build = data.find(item => item.id === buildId);

      if (!build) {
        document.getElementById("build-title").textContent = "Build Concept Not Found";
        return;
      }

      // 4. Populate Page Title, Header, and Badge
      document.title = `${build.title} | Dream To Build`;
      document.getElementById("build-title").textContent = build.title;
      
      if (build.subtitle) {
        document.getElementById("build-subtitle").textContent = build.subtitle;
      }

      const badgeEl = document.getElementById("build-badge");
      if (build.badgeText) {
        badgeEl.textContent = build.badgeText;
        badgeEl.className = `badge ${build.badgeType || "badge-fantasy"}`;
      } else {
        badgeEl.style.display = "none";
      }

      // 5. Populate Main Image
      const imageEl = document.getElementById("build-image");
      imageEl.src = build.thumbnail || "";
      imageEl.alt = build.title;

      // 6. Populate Specifications Grid
      const specsGrid = document.getElementById("specs-grid");
      specsGrid.innerHTML = "";
      if (build.specifications) {
        Object.entries(build.specifications).forEach(([key, value]) => {
          const dt = document.createElement("dt");
          dt.textContent = key.charAt(0).toUpperCase() + key.slice(1);
          
          const dd = document.createElement("dd");
          dd.textContent = value;

          specsGrid.appendChild(dt);
          specsGrid.appendChild(dd);
        });
      }

      // 7. Populate Narrative Array
      const narrativeContainer = document.getElementById("build-narrative");
      narrativeContainer.innerHTML = "";
      if (Array.isArray(build.narrative)) {
        build.narrative.forEach(pText => {
          const p = document.createElement("p");
          p.textContent = pText;
          narrativeContainer.appendChild(p);
        });
      } else if (typeof build.narrative === "string") {
        const p = document.createElement("p");
        p.textContent = build.narrative;
        narrativeContainer.appendChild(p);
      } else if (build.summary) {
        const p = document.createElement("p");
        p.textContent = build.summary;
        narrativeContainer.appendChild(p);
      }

      // 8. Populate Gallery (if present)
      if (Array.isArray(build.gallery) && build.gallery.length > 0) {
        const gallerySection = document.getElementById("gallery-section");
        const galleryGrid = document.getElementById("build-gallery");
        galleryGrid.innerHTML = "";

        build.gallery.forEach(imgSrc => {
          const img = document.createElement("img");
          img.src = imgSrc;
          img.alt = `${build.title} gallery image`;
          galleryGrid.appendChild(img);
        });

        gallerySection.style.display = "block";
      }

      // 9. Populate Tags
      const tagsContainer = document.getElementById("build-tags");
      tagsContainer.innerHTML = "";
      if (Array.isArray(build.tags)) {
        build.tags.forEach(tag => {
          const span = document.createElement("span");
          span.className = "tag";
          span.textContent = `#${tag}`;
          tagsContainer.appendChild(span);
        });
      }
    })
    .catch(error => {
      console.error("Error loading build details:", error);
      document.getElementById("build-title").textContent = "Error loading concept details.";
    });
});
