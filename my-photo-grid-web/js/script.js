let posts = [];
let filteredPosts = [];
let currentPage = 1;
const postsPerPage = 20;

const STATIC_CACHE_NAME = 'keylapoi-static-v3';
const DATA_CACHE_NAME = 'keylapoi-data-v3';
const GENRES = ['asia', 'jav', 'local', 'local_random', 'asia_random', 'barat', 'barat_random'];

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

function updateProgress(progress) {
  document.getElementById('progressText').innerText = `${progress}%`;
}

async function updateDownloadLog(fileName) {
  const cache = await caches.open(DATA_CACHE_NAME);
  const logRequest = new Request(`/log/${fileName}`);
  const logResponse = new Response(JSON.stringify({ downloaded: true }), { headers: { 'Content-Type': 'application/json' } });
  await cache.put(logRequest, logResponse);
}

async function isAlreadyDownloaded(fileName) {
  const cache = await caches.open(DATA_CACHE_NAME);
  const logRequest = new Request(`/log/${fileName}`);
  const response = await cache.match(logRequest);
  return !!response;
}

async function loadAllPosts() {
  showLoader();
  posts.length = 0;
  currentPage = 1;

  try {
    const db = await openDB();
    let indexData = { files: [] };

    for (let genre of GENRES) {
      const res = await fetch(`data/index.${genre}.json`, { cache: 'no-store' });
      const data = await res.json();
      indexData.files = indexData.files.concat(data.files);
    }

    const lastModified = new Date().toISOString();
    localStorage.setItem('indexVersion', lastModified);

    let loadedCount = 0;

    for (let i = indexData.files.length - 1; i >= 0; i--) {
      const entry = indexData.files[i];

      const alreadyDownloaded = await isAlreadyDownloaded(entry.file);
      if (!alreadyDownloaded) {
        const filePath = `data/${entry.file}`;
        const res = await fetch(filePath);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) {
            for (const post of json) {
              if (post && post.id && post.image && post.title) {
                posts.push(post);
                await savePost(db, post);
              }
            }
          } else if (json && json.id && json.image && json.title) {
            posts.push(json);
            await savePost(db, json);
          }
          await updateDownloadLog(entry.file);
          loadedCount++;
          const progress = Math.floor((loadedCount / indexData.files.length) * 100);
          updateProgress(progress);
        }
      }
    }

    const cachedPosts = await getCachedPosts(db);
    if (cachedPosts && cachedPosts.length) {
      posts = cachedPosts;
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

  } catch (err) {
    console.error("Gagal load post:", err);
  } finally {
    hideLoader();
    filterPosts(window.location.hash.replace('#', '') || 'beranda', false);
    AOS.refresh(); // Refresh AOS setelah load posts
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

  postsToShow.forEach((post, index) => {
    const postElement = document.createElement('div');
    postElement.classList.add('grid-item');
    postElement.setAttribute('data-aos', 'fade-up');
    postElement.setAttribute('data-aos-delay', index * 100); // Staggered delay

    const img = document.createElement('img');
    img.src = post.image;
    img.alt = post.title;
    img.loading = "lazy";
    img.onclick = () => showOverlay(post);

    postElement.appendChild(img);
    gridContainer.appendChild(postElement);
  });

  // Refresh AOS dan observe grid items
  AOS.refresh();
  document.querySelectorAll('.grid-item').forEach(el => observer.observe(el));
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
  AOS.refresh(); // Refresh AOS saat overlay muncul
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
    AOS.refresh(); // Refresh AOS saat menu muncul
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

// IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KeylapoiDB_v2', 1);
    request.onerror = () => reject('Gagal buka database');
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = function (e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('posts')) {
        db.createObjectStore('posts', { keyPath: 'id' });
      }
    };
  });
}

function savePost(db, post) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('posts', 'readwrite');
    const store = tx.objectStore('posts');
    store.put(post);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject('Gagal simpan post');
  });
}

function getCachedPosts(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('posts', 'readonly');
    const store = tx.objectStore('posts');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('Gagal ambil post dari cache');
  });
}

function updateContent() {
  location.reload();
  AOS.refresh();
}

function manualRefresh() {
  location.reload();
  AOS.refresh();
}

function clearServiceWorkerCache() {
  if ('caches' in window) {
    caches.keys().then(names => {
      for (let name of names) {
        caches.delete(name);
      }
    }).then(() => {
      console.log('Cache berhasil dibersihkan.');
      alert('Cache berhasil dibersihkan. Halaman akan dimuat ulang.');
      location.reload(true);
      AOS.refresh();
    });
  }
}

// Inisialisasi AOS
AOS.init({
  duration: 600,
  easing: 'ease-out',
  once: true,
  offset: 100,
  disable: function () {
    return window.innerWidth < 768; // Matikan AOS di mobile
  },
  onAnimationStart: () => console.log('AOS animation started!'),
  onAnimationEnd: () => console.log('AOS animation ended!'),
});

// GSAP untuk grid items
document.querySelectorAll('.grid-item').forEach((el, index) => {
  el.setAttribute('data-aos', 'custom-gsap');
  el.setAttribute('data-aos-delay', index * 100);
  el.addEventListener('aos:in', () => {
    gsap.to(el, {
      duration: 0.8,
      y: -20,
      opacity: 1,
      ease: 'bounce.out',
    });
  });
});

// IntersectionObserver untuk custom trigger
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-custom');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

// PixiJS untuk efek partikel di overlay (opsional)
const app = new PIXI.Application({ transparent: true, width: 600, height: 400 });
document.getElementById('overlayContent').appendChild(app.view);
const particles = new PIXI.ParticleContainer();
app.stage.addChild(particles);

document.getElementById('overlay').addEventListener('aos:in', () => {
  for (let i = 0; i < 50; i++) {
    const sprite = PIXI.Sprite.from('path/to/particle.png'); // Ganti dengan path sprite
    sprite.x = Math.random() * app.screen.width;
    sprite.y = Math.random() * app.screen.height;
    sprite.scale.set(0.5);
    particles.addChild(sprite);
    gsap.to(sprite, {
      duration: 2,
      x: '+=100',
      y: '+=100',
      alpha: 0,
      repeat: -1,
      ease: 'linear',
    });
  }
});

const updateWorker = new Worker('js/worker.js');
updateWorker.postMessage('start');
updateWorker.onmessage = function (e) {
  if (e.data === 'update') {
    document.getElementById('updateNotice').style.display = 'block';
  }
};

if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.ready.then(swRegistration => {
    swRegistration.sync.register('sync-update').catch(err => console.error('Gagal register sync:', err));
  });
}

window.addEventListener('hashchange', () => {
  filterPosts(window.location.hash.replace('#', '') || 'beranda', false);
});

window.addEventListener('load', async () => {
  await loadAllPosts();
});

// Age gate
function acceptAge() {
  localStorage.setItem("ageVerified", "true");
  document.getElementById("age-warning").classList.remove("show");
  document.getElementById("blur-background").style.display = "none";
}

function exitSite() {
  window.location.href = "https://www.google.com";
}

window.onload = function () {
  if (!localStorage.getItem("ageVerified")) {
    document.getElementById("age-warning").classList.add("show");
    document.getElementById("blur-background").style.display = "block";
  }
  AOS.refresh();
};
