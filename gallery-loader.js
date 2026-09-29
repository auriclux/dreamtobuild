document.addEventListener("DOMContentLoaded", () => {
  // CONFIGURATION: Set your GitHub username and repository name here
  const REPO_OWNER = "auriclux";      // e.g., 'scotstockton' or 'auriclux'
  const REPO_NAME = "dreamtobuild";   // e.g., 'dreamtobuild'

  // Category Metadata & Default Fallbacks
  const categoryMeta = {
    Projects: {
      title: "Projects",
      badgeText: "REAL BUILDS",
      badgeClass: "badge-project",
      desc: "Real world vehicles currently under active fabrication or assembly.",
      defaultHero: "./Projects/torky-t-hero.jpg"
    },
    Dreams: {
      title: "Dreams",
      badgeText: "TARGET BUILDS",
      badgeClass: "badge-dream",
      desc: "Conceptual studies and detailed engineering blueprints.",
      defaultHero: "./Dreams/surrey-hero-400.jpg"
    },
    Fantasies: {
      title: "Fantasies",
      badgeText: "PURE VISION",
      badgeClass: "badge-fantasy",
      desc: "Pure visual explorations and styling studies.",
      defaultHero: "./Fantasies/fabian-buick-wagon-custom.jpg"
    }
  };

  // Initial Showcase Default on Page Load
  const arbitraryDefaultHero = {
    img: "./Projects/torky-t-hero.jpg",
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

  // Helper to Update Hero Frame
  function setHero(data) {
    if (heroImg) heroImg.src = data.img || data.defaultHero || "";
    if (heroTitle) heroTitle.textContent = data.title || "";
    if (heroBadge) {
      heroBadge.textContent = data.badgeText || "";
      heroBadge.className = `badge ${data.badgeClass || ''}`;
    }
    if (heroDesc) heroDesc.textContent = data.desc || "";
  }

  // Format Image Filenames into Display Titles
  function formatTitle(filename) {
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
    return nameWithoutExt
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  // Set Initial Spotlight State
  setHero(arbitraryDefaultHero);

  // Event Listeners for Navigation Buttons
  branchBtns.forEach(btn => {
    const folderType = btn.getAttribute("data-type"); // Expects 'Projects', 'Dreams', or 'Fantasies'
    const meta = categoryMeta[folderType];

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
      activeCategory = folderType;

      branchBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (meta) setHero(meta);

      if (!galleryGrid) return;

      // GitHub REST API Endpoint to fetch folder contents dynamically
      const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${folderType}`;

      fetch(apiUrl)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status} fetching directory listing`);
          return res.json();
        })
        .then(files => {
          galleryGrid.innerHTML = "";

          // Filter for valid image formats only (.jpg, .jpeg, .png, .webp, .gif)
          const imageRegex = /\.(jpg|jpeg|png|webp|gif)$/i;
          const imageFiles = files.filter(f => f.type === "file" && imageRegex.test(f.name));

          if (imageFiles.length === 0) {
            galleryGrid.innerHTML = `<p class="info">No images found in ${folderType}.</p>`;
            return;
          }

          imageFiles.forEach(file => {
            const card = document.createElement("article");
            card.className = "card-3wide";

            const relativeImagePath = `./${folderType}/${file.name}`;
            const displayTitle = formatTitle(file.name);

            card.innerHTML = `
              <div class="card-link">
                <div class="card-image-wrapper">
                  <img src="${relativeImagePath}" alt="${displayTitle}" loading="lazy">
                  <span class="badge ${meta.badgeClass}">${meta.badgeText}</span>
                </div>
                <div class="card-body">
                  <h3 class="card-title">${displayTitle}</h3>
                </div>
              </div>
            `;

            // Hovering a card updates the Spotlight stage image
            card.addEventListener("mouseenter", () => {
              setHero({
                img: relativeImagePath,
                title: displayTitle,
                badgeText: meta.badgeText,
                badgeClass: meta.badgeClass,
                desc: `${folderType} Asset`
              });
            });

            galleryGrid.appendChild(card);
          });
        })
        .catch(err => {
          console.error(`Error sweeping directory ${folderType}:`, err);
          galleryGrid.innerHTML = `<p class="error">Unable to dynamically load assets for ${folderType}.</p>`;
        });
    });
  });
});
