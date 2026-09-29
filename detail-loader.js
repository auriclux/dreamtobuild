document.addEventListener("DOMContentLoaded", () => {
  // 1. Parse URL parameters (e.g. detail.html?type=fantasies&id=blown-gremlin)
  const urlParams = new URLSearchParams(window.location.search);
  const type = (urlParams.get("type") || "fantasies").toLowerCase();
  const buildId = (urlParams.get("id") || "").toLowerCase();

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

  if (!buildId) {
    if (titleEl) titleEl.textContent = "Build Not Found";
    return;
  }

  // 2. Fetch dataset based on type
  const dataFile = `./data/${type}.json`;

  fetch(dataFile)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to load ${dataFile}`);
      return response.json();
    })
    .then(data => {
      // 3. Find matching build item
      const build = data.find(item => (item.id || "").toLowerCase() === buildId);

      if (!build) {
        if (titleEl) titleEl.textContent = "Build Concept Not Found";
        return;
      }

      // 4. Populate Title, Subtitle, Badge
      document.title = `${build.title} | Dream To Build`;

      if (titleEl) titleEl.textContent = build.title;
      if (subEl && build.subtitle) subEl.textContent = build.subtitle;

      if (badgeEl) {
        if (build.badgeText) {
          badgeEl.textContent = build.badgeText;
          badgeEl.className = `badge ${build.badgeType || "badge-fantasy"}`;
        } else {
          badgeEl.style.display = "none";
        }
      }

      // 5. Populate Main Hero Image
      if (imageEl) {
        const rawImg = build.heroImage || build.image || build.thumbnail || "";
        imageEl.src = rawImg;
        imageEl.alt = build.title;
      }

      // 6. Populate Specifications
      if (specsContainer) {
        specsContainer.innerHTML = "";
        const specs = build.specifications || build.specs || {};
        const isDescriptionList = specsContainer.tagName.toLowerCase() === "dl";

        Object.entries(specs).forEach(([key, value]) => {
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
      }

      // 7. Populate Narrative / Summary
      if (narrativeContainer) {
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
        } else if (build.summary || build.description) {
          const p = document.createElement("p");
          p.textContent = build.summary || build.description;
          narrativeContainer.appendChild(p);
        }
      }

      // 8. Populate Gallery Grid & Lightbox
      if (galleryGrid) {
        const galleryImages = Array.isArray(build.gallery) && build.gallery.length > 0
          ? build.gallery
          : [build.heroImage || build.image || build.thumbnail].filter(Boolean);

        galleryGrid.innerHTML = "";
        galleryImages.forEach((imgSrc, idx) => {
          const col = document.createElement("div");
          col.className = "gallery-thumb-wrapper";

          const img = document.createElement("img");
          img.src = imgSrc;
          img.alt = `${build.title} - View ${idx + 1}`;
          img.loading = "lazy";
          img.className = "gallery-thumb";

          img.addEventListener("click", () => {
            openModal(imgSrc, `${build.title} — View ${idx + 1}`);
          });

          col.appendChild(img);
          galleryGrid.appendChild(col);
        });

        if (gallerySection) gallerySection.style.display = "block";
      }

      // 9. Populate Tags
      if (tagsContainer) {
        tagsContainer.innerHTML = "";
        if (Array.isArray(build.tags)) {
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

  // Lightbox Helpers
  function openModal(src, caption) {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    if (modalCaption) modalCaption.textContent = caption;
    modal.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("visible");
    document.body.style.overflow = "auto";
  }

  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target === modal) closeModal();
    });
  }
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && modal && modal.classList.contains("visible")) {
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
