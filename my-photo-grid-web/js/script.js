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

async function loadPosts(genre = 'all') {
  posts = [];
  const loadedIds = new Set();

  try {
    const indexRes = await fetch('data/index.json');
    const indexData = await indexRes.json();

    for (const entry of indexData) {
      const filePath = `data/${entry.file}`;
      const res = await fetch(filePath);
      if (res.ok) {
        const post = await res.json();
        if (!loadedIds.has(post.id)) {
          loadedIds.add(post.id);
          posts.push(post);
        }
      }
    }

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (genre === 'all') {
      filteredPosts = posts;
    } else {
      filteredPosts = posts.filter(post => post.genre === genre);
    }

    currentPage = 1;
    displayPosts(getCurrentPagePosts());
    updatePagination();
  } catch (err) {
    console.error("Gagal load post:", err);
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

function showOverlay(post) {
  const overlay = document.getElementById('overlay');
  const content = document.getElementById('overlayContent');

  let html = `
    <img src="${post.image}" alt="${post.title}" style="width: 100%; height: auto; max-height: 60vh; object-fit: contain;" />
    <h3>${post.title}</h3>
  `;

  if (post.links?.videy?.length > 0) {
    html += `<h4>Download via Videy</h4><ul>`;
    post.links.videy.forEach((link, i) => {
      html += `<li><a class="download-button" href="${decodeUrl(link)}" target="_blank">Videy ${i + 1}</a></li>`;
    });
    html += `</ul>`;
  }

  if (post.links?.terabox?.length > 0) {
    html += `<h4>Download via Terabox</h4><ul>`;
    post.links.terabox.forEach(link => {
      html += `<li><a class="download-button" href="${decodeUrl(link)}" target="_blank">Full Konten</a></li>`;
    });
    html += `</ul>`;
  }

  if (post.links?.mediafire?.length > 0) {
    html += `<h4>Download via Mediafire</h4><ul>`;
    post.links.mediafire.forEach((link, i) => {
      html += `<li><a class="download-button" href="${decodeUrl(link)}" target="_blank">Full Konten</a></li>`;
    });
    html += `</ul>`;
  }

  if (post.links?.pixeldrain?.length > 0) {
    html += `<h4>Download via PixelDrain</h4><ul>`;
    post.links.pixeldrain.forEach((link, i) => {
      html += `<li><a class="download-button" href="${decodeUrl(link)}" target="_blank">Pixeldrain</a></li>`;
    });
    html += `</ul>`;
  }

  content.innerHTML = html;
  overlay.style.display = "flex";
}

function closeOverlay(event) {
  if (
    event.target.id === "overlay" ||
    event.target.classList.contains("close-btn")
  ) {
    document.getElementById("overlay").style.display = "none";
  }
}

function updatePagination() {
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  document.getElementById('prevBtn').style.display = currentPage > 1 ? 'inline-block' : 'none';
  document.getElementById('nextBtn').style.display = currentPage < totalPages ? 'inline-block' : 'none';
}

function nextPage() {
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayPosts(getCurrentPagePosts());
    updatePagination();
    scrollToTop();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    displayPosts(getCurrentPagePosts());
    updatePagination();
    scrollToTop();
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterPosts(genre) {
  loadPosts(genre);
}

function toggleMenu() {
  const menu = document.getElementById('navMenu');
  menu.classList.toggle('active');
  document.addEventListener('click', outsideClickListener);
}

function outsideClickListener(event) {
  const menu = document.getElementById('navMenu');
  const hamburger = document.querySelector('.hamburger');
  if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
    menu.classList.remove('active');
    document.removeEventListener('click', outsideClickListener);
  }
}

window.addEventListener('load', () => loadPosts('all'));
