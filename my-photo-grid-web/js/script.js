let posts = [];
let currentPage = 1;
const postsPerPage = 20;

function decodeUrl(encodedUrl) {
  return atob(encodedUrl);
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
        if (genre === 'all' || post.genre === genre) {
          if (!loadedIds.has(post.id)) {
            loadedIds.add(post.id);
            posts.push(post);
          }
        }
      }
    }

    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    displayPosts(posts.slice(0, postsPerPage));
    updatePagination();
  } catch (err) {
    console.error("Gagal load post:", err);
  }
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
    <img src="${post.image}" alt="${post.title}">
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
  document.getElementById('prevBtn').style.display = currentPage > 1 ? 'inline-block' : 'none';
  document.getElementById('nextBtn').style.display = posts.length > currentPage * postsPerPage ? 'inline-block' : 'none';
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    displayPosts(posts.slice(start, end));
    updatePagination();
  }
}

function nextPage() {
  const start = currentPage * postsPerPage;
  const end = start + postsPerPage;
  if (start < posts.length) {
    currentPage++;
    displayPosts(posts.slice(start, end));
    updatePagination();
  }
}

function filterPosts(genre) {
  currentPage = 1;
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
