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

function updateProgress(progress) {
  document.getElementById('progressText').innerText = `${progress}%`;
}

async function loadAllPosts() {
  showLoader();
  posts.length = 0;
  currentPage = 1;

  try {
    const indexRes = await fetch('data/index.json', { cache: 'no-store' });
    const indexData = await indexRes.json();
    const lastModified = indexData.lastModified;

    const db = await openDB();
    const cachedVersion = localStorage.getItem('indexVersion');

    if (cachedVersion !== lastModified) {
      await clearCache(db);
      await caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))));
      localStorage.setItem('indexVersion', lastModified);
    }

    let loadedCount = 0;

    for (let i = indexData.files.length - 1; i >= 0; i--) {
      const entry = indexData.files[i];
      const filePath = `data/${entry.file}`;

      try {
        const res = await fetch(filePath, { cache: 'no-store' });
        if (res.ok) {
          const post = await res.json();
          posts.push(post);
          await savePost(db, post);
        } else {
          console.error(`Gagal fetch ${filePath}, status: ${res.status}`);
        }
      } catch (err) {
        console.error(`Error ambil ${filePath}:`, err);
      }

      loadedCount++;
      const progress = Math.floor((loadedCount / indexData.files.length) * 100);
      updateProgress(progress);
    }

    if (posts.length === 0) {
      console.warn('Tidak ada post yang berhasil dimuat.');
    }

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (err) {
    console.error("Gagal load post:", err);
  } finally {
    hideLoader();
    filterPosts(window.location.hash.replace('#', '') || 'beranda', false);
  }
        }
