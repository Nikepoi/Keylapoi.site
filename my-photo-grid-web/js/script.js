let posts = [];
let filteredPosts = [];
let currentPage = 1;
const postsPerPage = 20;

function decodeUrl(encodedUrl) {
  try {
    const decoded = atob(encodedUrl);
    const url = new URL(decoded);
    const hostname = url.hostname;
    const targetDomains = ['videy.co', 'mediafire', 'terabox', 'pixeldrain'];
    const isTarget = targetDomains.some(domain => hostname.includes(domain));
    return isTarget ? `https://www.keylapoi.site/safelink.html?url=${encodedUrl}` : decoded;
  } catch (e) {
    console.error("Gagal decode:", encodedUrl);
    return "#";
  }
}

function showLoader() {
  document.getElementById('blur-loader').style.display = 'flex';
}

function hideLoader() {
  document.getElementById('blur-loader').style.display = 'none';
}

async function loadAllPosts() {
  return new Promise(async (resolve) => {
    showLoader();
    posts.length = 0;
    currentPage = 1;

    try {
      const indexRes = await fetch('data/index.json');
      const indexData = await indexRes.json();

      for (const entry of indexData) {
        const filePath = `data/${entry.file}`;
        const res = await fetch(filePath);
        if (res.ok) {
          const post = await res.json();
          posts.push(post);
        }
      }
    } catch (err) {
      console.error("Gagal load post:", err);
    } finally {
      hideLoader();
      resolve(); // Pastikan semua file selesai load
    }
  });
}

function getCurrentPagePosts() {
  const start = (currentPage - 1) * postsPerPage;
  const end = start + postsPerPage;
  return filteredPosts.slice(start, end);
}

function displayPosts(postsToShow) {
  const gridContainer = document.getElementById('postGrid');
  gridContainer.innerHTML = '';

  postsToShow.forEach(post => {
    const postElement = document.createElement('div');
    postElement.classList.add('grid-item');

    const img = document.createElement('img');
    img.src = post.image;
    img.alt = post.title;
    img.loading = "lazy";
    img.onclick = () => showOverlay(post);

    postElement.appendChild(img);
    gridContainer.appendChild(postElement);
  });
}

function renderLinks(label, links) {
  let html = `<h4>Download via ${label}</h4><ul>`;

  if (Array.isArray(links)) {
    links.forEach((link, i) => {
      html += `<li><a class="download-button" href="${decodeUrl(link)}" target="_blank">${label} ${i + 1}</a></li>`;
    });
  } else if (typeof links === 'string' && links.trim() !== '') {
    html += `<li><a class="download-button" href="${decodeUrl(links)}" target="_blank">Full Konten</a></li>`;
  }

  html += `</ul>`;
  return html;
}

function showOverlay(post) {
  const overlay = document.getElementById('overlay');
  const content = document.getElementById('overlayContent');

  let html = `
    <img src="${post.image}" alt="${post.title}" style="width: 100%; height: auto; max-height: 60vh; object-fit: contain;" />
    <h3>${post.title}</h3>
  `;

  if (post.links?.videy) {
    html += renderLinks('Videy', post.links.videy);
  }

  if (post.links?.terabox) {
    html += renderLinks('Terabox', post.links.terabox);
  }

  if (post.links?.mediafire) {
    html += renderLinks('Mediafire', post.links.mediafire);
  }

  if (post.links?.pixeldrain) {
    html += renderLinks('PixelDrain', post.links.pixeldrain);
  }

  content.innerHTML = html;
  overlay.style.display = "flex";
}

function closeOverlay(event) {
  if (event.target.id === "overlay" || event.target.classList.contains("close-btn")) {
    document.getElementById('overlay').style.display = "none";
  }
}

function updatePagination() {
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  document.getElementById('prevBtn').style.display = currentPage > 1 ? 'inline-block' : 'none';
  document.getElementById('nextBtn').style.display = currentPage < totalPages ? 'inline-block' : 'none';
}

function setActiveMenu(genre) {
  const menuLinks = document.querySelectorAll('.nav-menu li a');
  menuLinks.forEach(link => {
    link.classList.remove('active-genre');
    if (link.getAttribute('href') === `#${genre}`) {
      link.classList.add('active-genre');
    }
  });
}

function filterPosts(genre, save = true) {
  showLoader();
  setTimeout(() => {
    currentPage = 1;

    if (genre === 'all' || genre === 'beranda') {
      filteredPosts = posts;
    } else {
      filteredPosts = posts.filter(post => post.genre && post.genre.toLowerCase() === genre.toLowerCase());
    }

    displayPosts(getCurrentPagePosts());
    updatePagination();
    hideLoader();

    if (save) {
      window.location.hash = genre === 'all' ? 'beranda' : genre;
    }

    setActiveMenu(genre);
    closeMenu();
    scrollToTop();
  }, 300);
}

function nextPage() {
  showLoader();
  setTimeout(() => {
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      displayPosts(getCurrentPagePosts());
      updatePagination();
      scrollToTop();
    }
    hideLoader();
  }, 300);
}

function prevPage() {
  showLoader();
  setTimeout(() => {
    if (currentPage > 1) {
      currentPage--;
      displayPosts(getCurrentPagePosts());
      updatePagination();
      scrollToTop();
    }
    hideLoader();
  }, 300);
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMenu() {
  const menu = document.getElementById('navMenu');
  const hamburger = document.querySelector('.hamburger');

  if (menu.classList.contains('active')) {
    menu.style.transformOrigin = 'top right';
    menu.style.transform = 'scale(0)';
    menu.style.opacity = '0';
    hamburger.classList.remove('is-active');
    setTimeout(() => {
      menu.classList.remove('active');
    }, 300);
  } else {
    menu.classList.add('active');
    menu.style.transformOrigin = 'top right';
    setTimeout(() => {
      menu.style.transform = 'scale(1)';
      menu.style.opacity = '1';
    }, 10);
    hamburger.classList.add('is-active');
    document.addEventListener('click', outsideClickListener);
  }
}

function closeMenu() {
  const menu = document.getElementById('navMenu');
  const hamburger = document.querySelector('.hamburger');

  if (menu.classList.contains('active')) {
    menu.style.transformOrigin = 'top right';
    menu.style.transform = 'scale(0)';
    menu.style.opacity = '0';
    hamburger.classList.remove('is-active');
    setTimeout(() => {
      menu.classList.remove('active');
    }, 300);
    document.removeEventListener('click', outsideClickListener);
  }
}

function outsideClickListener(event) {
  const menu = document.getElementById('navMenu');
  const hamburger = document.querySelector('.hamburger');
  if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
    closeMenu();
  }
}

window.addEventListener('hashchange', () => {
  let genre = window.location.hash.replace('#', '') || 'beranda';
  filterPosts(genre, false);
});

window.addEventListener('load', async () => {
  let genre = window.location.hash.replace('#', '') || 'beranda';
  await loadAllPosts(); // Pastikan semua post sudah selesai dibaca
  filteredPosts = posts; // Pastikan semua post sudah terisi
  filterPosts(genre, false);
});
