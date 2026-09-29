document.addEventListener("DOMContentLoaded", () => {
  // 1. Parse URL Parameters & Dynamic Back Link Anchor Setup
  const urlParams = new URLSearchParams(window.location.search);
  const rawType = urlParams.get("type");
  const buildId = (urlParams.get("id") || "").toLowerCase().trim();
  const backBtn = document.getElementById("detail-back-btn");

  const validTypes = ["projects", "dreams", "fantasies"];
  const type = (rawType || "fantasies").toLowerCase().trim();

  // Route back button directly to originating category hash
  if (backBtn && validTypes.includes(type)) {
    backBtn.href = `index.html#${type}`;
  }

  // DOM Elements (Supports both 'detail-' and legacy 'build-' element IDs)
  const titleEl = document.getElementById("detail-title") || document.getElementById("build-title");
  const subEl = document.getElementById("detail-subtitle") || document.getElementById("build-subtitle");
  const badgeEl = document.getElementById("detail-badge") || document.getElementById("build-badge");
  const imageEl = document.getElementById("detail-hero-img") || document.getElementById("build-image");
  const specsContainer = document.getElementById("detail-specs") || document.getElementById("specs-grid");
  const narrativeContainer = document.getElementById("detail-overview") || document.getElementById("build-narrative");
  const galleryGrid = document.getElementById("detail-gallery") || document.getElementById("build-gallery");
  const gallerySection = document.getElementById("gallery-section");
  const tagsContainer = document.getElementById("build-tags");

  // Lightbox Modal Elements
  const modal = document.getElementById("image-modal");
  const modalImg = document.getElementById("modal-img");
  const modalCaption = document.getElementById("modal-caption");
  const modalClose = document.getElementById("modal-close");

  if (!buildId || !validTypes.includes(type)) {
    if (titleEl) titleEl.textContent = "Build Not Found";
    return;
  }

  // 2. Fetch Dataset
  const dataFile = `./data/${type}.json`;

  fetch(dataFile)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to load ${dataFile}`);
      return response.json();
    })
    .then(rawData => {
      const items = Array.isArray(rawData) ? rawData : (rawData.items || []);
      
      // 3. Find Matching Build Record
      const build = items.find(item => String(item.id || "").toLowerCase().trim() === buildId);

      if (!build) {
        if (titleEl) titleEl.textContent = "Build Concept Not Found";
        return;
      }

      // 4. Populate Title, Subtitle, Badge
      document.title = `${build.title || "Build"} | Dream To Build`;

      if (titleEl) titleEl.textContent = build.title || "Untitled Build";
      if (subEl) subEl.textContent = build.subtitle || build.tagline || build.description || "";

      if (badgeEl) {
        if (build.badgeText || build.badgeType) {
          badgeEl.textContent = build.badgeText || type.toUpperCase();
          badgeEl.className = `badge ${build.badgeType || "badge-fantasy"}`;
          badgeEl.style.display = "";
        } else {
          badgeEl.style.display = "none";
        }
      }

      // 5. Populate Main Hero Image
      if (imageEl) {
        const rawImg = build.heroImage || build.image || build.thumb || build.thumbnail || "";
        imageEl.src = rawImg;
        imageEl.alt = build.title || "Build Showcase Image";
      }

      // 6. Populate Specifications
      if (specsContainer) {
        specsContainer.innerHTML = "";
        const specs = build.specifications || build.specs || {};
        const isDescriptionList = specsContainer.tagName.toLowerCase() === "dl";
        const entries = Object.entries(specs);

        if (entries.length > 0) {
          entries.forEach(([key, value]) => {
            if (isDescriptionList) {
              const dt = document.createElement("dt");
              dt.textContent = key.charAt(0).toUpperCase() + key.slice(1);
              const dd = document.createElement("dd");
              dd.textContent = value;
              specsContainer.appendChild(dt);
              specsContainer.appendChild(dd);
            } else {
              const li = document.createElement("li");
              li.className = "spec-item";
              li.innerHTML = `
                <span class="spec-label">${escapeHtml(key)}</span>
                <span class="spec-value">${escapeHtml(value)}</span>
              `;
              specsContainer.appendChild(li);
            }
          });
        } else {
          const section = specsContainer.closest(".specs-section");
          if (section) section.style.display = "none";
        }
      }

      // 7. Populate Narrative / Summary
      if (narrativeContainer) {
        narrativeContainer.innerHTML = "";
        const narrativeContent = build.narrative || build.overview || build.designIntent || build.summary || build.description;

        if (Array.isArray(narrativeContent)) {
          narrativeContent.forEach(pText => {
            const p = document.createElement("p");
            p.textContent = pText;
            narrativeContainer.appendChild(p);
          });
        } else if (typeof narrativeContent === "string" && narrativeContent.trim() !== "") {
          narrativeContent.split("\n\n").forEach(pText => {
            const p = document.createElement("p");
            p.textContent = pText;
            narrativeContainer.appendChild(p);
          });
        } else {
          const p = document.createElement("p");
          p.textContent = "No overview narrative available for this build.";
          narrativeContainer.appendChild(p);
        }
      }

      // 8. Populate Gallery Grid & Lightbox Integration
      if (galleryGrid) {
        const rawGallery = build.gallery;
        const galleryImages = Array.isArray(rawGallery) && rawGallery.length > 0
          ? rawGallery
          : [build.heroImage || build.image || build.thumb || build.thumbnail].filter(Boolean);

        galleryGrid.innerHTML = "";
        if (galleryImages.length > 0) {
          galleryImages.forEach((imgEntry, idx) => {
            const src = typeof imgEntry === "string" ? imgEntry : imgEntry.url;
            const caption = typeof imgEntry === "string" 
              ? `${build.title} — View ${idx + 1}` 
              : (imgEntry.caption || `${build.title} — View ${idx + 1}`);

            const col = document.createElement("div");
            col.className = "gallery-thumb-wrapper";

            const img = document.createElement("img");
            img.src = src;
            img.alt = caption;
            img.loading = "lazy";
            img.className = "gallery-thumb lightbox-trigger";

            img.addEventListener("click", () => {
              openModal(src, caption);
            });

            col.appendChild(img);
            galleryGrid.appendChild(col);
          });

          if (gallerySection) gallerySection.style.display = "block";
        } else if (gallerySection) {
          gallerySection.style.display = "none";
        }
      }

      // 9. Populate Tags
      if (tagsContainer) {
        tagsContainer.innerHTML = "";
        if (Array.isArray(build.tags) && build.tags.length > 0) {
          build.tags.forEach(tag => {
            const span = document.createElement("span");
            span.className = "tag";
            span.textContent = `#${tag}`;
            tagsContainer.appendChild(span);
          });
        }
      }
    })
    .catch(error => {
      console.error("Error loading build details:", error);
      if (titleEl) titleEl.textContent = "Error loading concept details.";
    });

  // Modal Lightbox Helpers
  function openModal(src, caption) {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    if (modalCaption) modalCaption.textContent = caption || "";
    modal.style.display = "flex";
    modal.classList.add("visible");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    modal.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.style.display = "none";
    modal.classList.remove("visible");
    modal.setAttribute("aria-hidden", "true");
    if (modalImg) modalImg.src = "";
    document.body.style.overflow = "auto";
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal && (modal.classList.contains("visible") || modal.style.display === "flex")) {
      closeModal();
    }
  });

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
