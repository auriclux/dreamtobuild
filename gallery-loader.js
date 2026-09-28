document.addEventListener('DOMContentLoaded', () => {

  // 1. SPOTLIGHT STAGE UPDATER
  function updateSpotlight(item) {
    const spotlightImg = document.getElementById('spotlight-img');
    const spotlightTitle = document.getElementById('spotlight-title');
    const spotlightDesc = document.getElementById('spotlight-desc');

    if (spotlightImg) {
      spotlightImg.src = item.image || item.thumbnail || '';
      spotlightImg.alt = item.title || 'Spotlight Feature';
    }
    if (spotlightTitle) {
      spotlightTitle.textContent = item.title || 'Featured Build';
    }
    if (spotlightDesc) {
      spotlightDesc.textContent = item.summary || item.subtitle || item.description || '';
    }
  }

  // 2. CATEGORY DATA LOADER & GRID BUILDER
  async function loadCategoryData(jsonPath, containerId, categoryName) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const response = await fetch(jsonPath);
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status} for ${jsonPath}`);
        return;
      }

      const data = await response.json();
      container.innerHTML = '';

      if (!Array.isArray(data) || data.length === 0) {
        return;
      }

      // If loading projects, optionally set the spotlight to the first item (or one marked "featured")
      if (categoryName === 'projects') {
        const featuredItem = data.find(item => item.featured === true) || data[0];
        if (featuredItem) {
          updateSpotlight(featuredItem);
        }
      }

      data.forEach(item => {
        const card = document.createElement('a');
        card.className = 'card';
        
        // Dynamic Link Fallback
        const itemLink = item.detailUrl 
          ? item.detailUrl 
          : (item.id ? `detail.html?category=${categoryName}&id=${item.id}` : (item.link || '#'));
        
        card.href = itemLink;

        // Image Path Fallback
        const imgSrc = item.thumbnail || item.image || '';
        const imageHtml = imgSrc 
          ? `<img src="${imgSrc}" alt="${item.title || 'Build Image'}" loading="lazy">` 
          : '';

        // Text Content Fallback
        const titleText = item.title || 'Untitled Build';
        const bodyText = item.summary || item.subtitle || item.description || '';

        card.innerHTML = `
          ${imageHtml}
          <div class="card-body">
            <h3>${titleText}</h3>
            ${bodyText ? `<p>${bodyText}</p>` : ''}
          </div>
        `;
        
        container.appendChild(card);
      });
    } catch (error) {
      console.error(`Error parsing ${jsonPath}:`, error);
    }
  }

  // 3. SIDEBAR NAVIGATOR THUMBNAIL INTERACTION
  const navThumbs = document.querySelectorAll('.nav-thumb-item');
  navThumbs.forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      // Optional: Prevent page jumping if thumbnail links use anchors (#)
      const targetImg = thumb.querySelector('img');
      const targetTitle = thumb.querySelector('.nav-thumb-title');
      const targetSub = thumb.querySelector('.nav-thumb-sub');

      if (targetImg && targetTitle) {
        updateSpotlight({
          image: targetImg.src,
          title: targetTitle.textContent,
          description: targetSub ? targetSub.textContent : ''
        });
      }
    });
  });

  // Load all three grids independently
  loadCategoryData('data/projects.json', 'projects-grid', 'projects');
  loadCategoryData('data/dreams.json', 'dreams-grid', 'dreams');
  loadCategoryData('data/fantasies.json', 'fantasies-grid', 'fantasies');
});
