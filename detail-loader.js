document.addEventListener("DOMContentLoaded", () => {
  // 1. Parse URL parameters (e.g. detail.html?type=fantasies&id=blown-gremlin)
  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type") || "fantasies";
  const buildId = urlParams.get("id");

  if (!buildId) {
    const titleEl = document.getElementById("build-title");
    if (titleEl) titleEl.textContent = "Build Not Found";
    return;
  }

  // 2. Fetch the correct JSON file based on the type parameter
  const dataFile = `./data/${type}.json`;

  fetch(dataFile)
    .then(response => {
      if (!response.ok) throw new Error(`Failed to load ${dataFile}`);
      return response.json();
    })
    .then(data => {
      // 3. Find the matching build item by id
      const build = data.find(item => item.id === buildId);

      if (!build) {
        const titleEl = document.getElementById("build-title");
        if (titleEl) titleEl.textContent = "Build Concept Not Found";
        return;
      }

      // 4. Populate Page Title, Header, and Badge
      document.title = `${build.title} | Dream To Build`;
      
      const titleEl = document.getElementById("build-title");
      if (titleEl) titleEl.textContent = build.title;

      const subEl = document.getElementById("build-subtitle");
      if (subEl && build.subtitle) subEl.textContent = build.subtitle;

      const badgeEl = document.getElementById("build-badge");
      if (badgeEl) {
        if (build.badgeText) {
          badgeEl.textContent = build.badgeText;
          badgeEl.className = `badge ${build.badgeType || "badge-fantasy"}`;
        } else {
          badgeEl.style.display = "none";
        }
      }

      // 5. Populate Main Image
      const imageEl = document.getElementById("build-image");
      if (imageEl) {
        const rawImg = build.image || build.thumbnail || "";
        imageEl.src = rawImg.startsWith("./") ? rawImg : `./${rawImg}`;
        imageEl.alt = build.title;
      }

      // 6. Populate Specifications Grid
      const specsGrid = document.getElementById("specs-grid");
      if (specsGrid) {
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
      }

      // 7. Populate Narrative Array / String / Summary
      const narrativeContainer = document.getElementById("build-narrative");
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
        } else if (build.summary) {
          const p = document.createElement("p");
          p.textContent = build.summary;
          narrativeContainer.appendChild(p);
        }
      }

      // 8. Populate Gallery (if present)
      const gallerySection = document.getElementById("gallery-section");
      const galleryGrid = document.getElementById("build-gallery");
      if (galleryGrid && Array.isArray(build.gallery) && build.gallery.length > 0) {
        galleryGrid.innerHTML = "";
        build.gallery.forEach(imgSrc => {
          const img = document.createElement("img");
          const path = imgSrc.startsWith("./") ? imgSrc : `./${imgSrc}`;
          img.src = path;
          img.alt = `${build.title} gallery image`;
          galleryGrid.appendChild(img);
        });
        if (gallerySection) gallerySection.style.display = "block";
      }

      // 9. Populate Tags
      const tagsContainer = document.getElementById("build-tags");
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
      const titleEl = document.getElementById("build-title");
      if (titleEl) titleEl.textContent = "Error loading concept details.";
    });
});
