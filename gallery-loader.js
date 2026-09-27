document.addEventListener('DOMContentLoaded', () => {
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

      data.forEach(item => {
        const card = document.createElement('a');
        card.className = 'card';
        
        // 1. Dynamic Link Fallback (URL parameter routing vs direct link)
        const itemLink = item.detailUrl 
          ? item.detailUrl 
          : (item.id ? `detail.html?category=${categoryName}&id=${item.id}` : (item.link || '#'));
        
        card.href = itemLink;

        // 2. Image Path Fallback (thumbnail vs image)
        const imgSrc = item.thumbnail || item.image || '';
        const imageHtml = imgSrc 
          ? `<img src="${imgSrc}" alt="${item.title || 'Build Image'}" loading="lazy">` 
          : '';

        // 3. Text Content Fallback (summary vs subtitle vs description)
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

  // Load all three grids independently
  loadCategoryData('data/projects.json', 'projects-grid', 'projects');
  loadCategoryData('data/dreams.json', 'dreams-grid', 'dreams');
  loadCategoryData('data/fantasies.json', 'fantasies-grid', 'fantasies');
});
