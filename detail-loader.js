/* ==========================================================================
   DREAM TO BUILD — DETAIL LOADER (SINGLE BUILD & LIGHTBOX)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Parse URL Parameters & Dynamic Back Link Anchor Setup
  const urlParams = new URLSearchParams(window.location.search);
  const rawType = urlParams.get("type");
  const buildId = (urlParams.get("id") || "").toLowerCase().trim();
  const backBtn = document.getElementById("detail-back-btn");

  const validTypes = ["projects", "dreams", "fantasies", "about"];
  const type = (rawType || "fantasies").toLowerCase().trim();

  // Route back button directly to originating category hash
  if (backBtn && validTypes.includes(type)) {
    backBtn.href = `index.html#${type === "about" ? "about" : type}`;
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
    .then(async rawData => {
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
        if (rawImg && rawImg.trim() !== "") {
          imageEl.src = rawImg;
          imageEl.alt = build.title || "Build Showcase Image";
          imageEl.style.display = "";
        } else {
          imageEl.style.display = "none";
        }
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

        if (build.contentUrl) {
          try {
            const textRes = await fetch(build.contentUrl);
            if (textRes.ok) {
              const textContent = await textRes.text();
              textContent.split("\n").forEach(line => {
                if (line.trim() !== "") {
                  const p = document.createElement("p");
                  p.textContent = line;
                  narrativeContainer.appendChild(p);
                }
              });
            } else {
              narrativeContainer.innerHTML = "<p><em>Narrative text file could not be loaded.</em></p>";
            }
          } catch (e) {
            narrativeContainer.innerHTML = "<p><em>Error fetching narrative text file.</em></p>";
          }
        } else {
          const narrativeContent = build.narrative || build.overview || build.designIntent || build.summary || build.description;

          if (Array.isArray(narrativeContent)) {
            narrativeContent.forEach(pText => {
              const p = document.createElement("p");
              p.innerHTML = pText;
              narrativeContainer.appendChild(p);
            });
          } else if (typeof narrativeContent === "string" && narrativeContent.trim() !== "") {
            narrativeContent.split("\n\n").forEach(pText => {
              const p = document.createElement("p");
              p.innerHTML = pText;
              narrativeContainer.appendChild(p);
            });
          } else {
            const p = document.createElement("p");
            p.textContent = "No overview narrative available for this build.";
            narrativeContainer.appendChild(p);
          }
        }
      }

      // 8. Populate Gallery Grid & Lightbox Integration (Supports Images & MP4 Videos)
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

            const isVideo = src.toLowerCase().endsWith(".mp4");

            if (isVideo) {
              const video = document.createElement("video");
              // Ensure path has correct relative prefix if it doesn't start with ./ or http
              video.src = src.startsWith(".") ? src : `./${src}`;
              video.muted = true;
              video.autoplay = true;
              video.loop = true;
              video.playsInline = true;
              video.preload = "auto";
              video.className = "gallery-thumb lightbox-trigger";

              video.addEventListener("click", (e) => {
                e.preventDefault();
                openModal(src, caption, true);
              });

              col.appendChild(video);
            } else {
              const img = document.createElement("img");
              img.src = src;
              img.alt = caption;
              img.loading = "lazy";
              img.className = "gallery-thumb lightbox-trigger";

              img.addEventListener("click", () => {
                openModal(src, caption, false);
              });

              col.appendChild(img);
            }

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

  // Modal Lightbox Helpers (Supports Images & MP4 Videos)
  function openModal(src, caption, isVideo = false) {
    if (!modal) return;

    const modalContentContainer = modalImg ? modalImg.parentElement : modal;
    let modalVideo = modal.querySelector("#modal-video");

    if (isVideo) {
      if (modalImg) modalImg.style.display = "none";
      if (!modalVideo) {
        modalVideo = document.createElement("video");
        modalVideo.id = "modal-video";
        modalVideo.controls = true;
        modalVideo.autoplay = true;
        modalVideo.style.maxWidth = "100%";
        modalVideo.style.maxHeight = "80vh";
        modalContentContainer.insertBefore(modalVideo, modalImg);
      }
      modalVideo.src = src;
      modalVideo.style.display = "block";
    } else {
      if (modalVideo) {
        modalVideo.pause();
        modalVideo.style.display = "none";
      }
      if (modalImg) {
        modalImg.style.display = "block";
        modalImg.src = src;
      }
    }

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
    
    const modalVideo = modal.querySelector("#modal-video");
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.src = "";
      modalVideo.style.display = "none";
    }

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
