let posts = [];
let filteredPosts = [];
let currentPage = 1;
const postsPerPage = 20;
let currentIndex = [];

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

function showLoader(progress = 0) {
  document.getElementById('blur-loader').style.display = 'flex';
  document.getElementById('progressText').innerText = `${progress}%`;
}

function hideLoader() {
  document.getElementById('blur-loader').style.display = 'none';
}

async function fetchIndex() {
  try {
    const res = await fetch('data/index.json', { cache: "no-store" });
    return await res.json();
  } catch (err) {
    console.error("Gagal load index.json:", err);
    return [];
  }
}

async function checkForUpdates() {
  try {
    const newIndex = await fetchIndex();
    const storedIndex = JSON.parse(localStorage.getItem('indexData')) || [];

    if (JSON.stringify(newIndex) !== JSON.stringify(storedIndex)) {
      document.getElementById('updateNotice').style.display = 'block';
    }
  } catch (err) {
    console.error('Gagal cek update:', err);
  }
}

function saveIndexLocally(indexData) {
  localStorage.setItem('indexData', JSON.stringify(indexData));
}

async function updateContent() {
  document.getElementById('updateNotice').style.display = 'none';
  await loadAllPosts(true);
}

async function loadAllPosts(forceUpdate = false) {
  showLoader(0);
  posts.length = 0;
  currentPage = 1;

  try {
    let indexData = [];

    if (!forceUpdate && localStorage.getItem('indexData')) {
      indexData = JSON.parse(localStorage.getItem('indexData'));
    } else {
      indexData = await fetchIndex();
      saveIndexLocally(indexData);
    }

    currentIndex = indexData;

    let loaded = 0;
    for (let i = indexData.length - 1; i >= 0; i--) {
      const entry = indexData[i];
      const filePath = `data/${entry.file}`;
      const res = await fetch(filePath);
      if (res.ok) {
        const post = await res.json();
        posts.push(post);
      }
      loaded++;
      showLoader(Math.floor((loaded / indexData.length) * 100));
    }

  } catch (err) {
    console.error("Gagal load post:", err);
  } finally {
    hideLoader();
    let genre = window.location.hash.replace('#', '') || 'beranda';
    filterPosts(genre, false);
  }
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

  let html = `<img src="${post.image}" alt="${post.title}" style="width: 100%; height: auto; max-height: 60vh; object-fit: contain;" />
    <h3>${post.title}</h3>`;

  if (post.links?.videy) html += renderLinks('Videy', post.links.videy);
  if (post.links?.terabox) html += renderLinks('Terabox', post.links.terabox);
  if (post.links?.mediafire) html += renderLinks('Mediafire', post.links.mediafire);
  if (post.links?.pixeldrain) html += renderLinks('PixelDrain', post.links.pixeldrain);

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
    if (genre === 'all' || genre === 'beranda') {
      filteredPosts = posts;
    } else {
      filteredPosts = posts.filter(post => post.genre && post.genre.toLowerCase() === genre.toLowerCase());
    }

    currentPage = 1;
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
    setTimeout(() => { menu.classList.remove('active'); }, 300);
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
    setTimeout(() => { menu.classList.remove('active'); }, 300);
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
  await loadAllPosts();
  setInterval(checkForUpdates, 60000); // cek update tiap 1 menit
});
