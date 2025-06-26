// Versi Lengkap Multi Index Aman, Tidak Error

let posts = []; let filteredPosts = []; let currentIndexPage = 1; const postsPerPage = 20;

let maxIndexPage = 1; // Nanti ini otomatis terdeteksi

async function getMaxIndexPage() { try { let i = 1; while (true) { const res = await fetch(data/index${i}.json); if (!res.ok) break; i++; } maxIndexPage = i - 1; } catch (e) { console.error('Gagal cek jumlah index', e); } }

function decodeUrl(encodedUrl) { try { const decoded = atob(encodedUrl); const url = new URL(decoded); const hostname = url.hostname; const targetDomains = ['videy.co', 'mediafire', 'terabox', 'pixeldrain']; const isTarget = targetDomains.some(domain => hostname.includes(domain)); return isTarget ? https://www.keylapoi.site/safelink.html?url=${encodedUrl} : decoded; } catch (e) { console.error("Gagal decode:", encodedUrl); return "#"; } }

function showLoader() { document.getElementById('blur-loader').style.display = 'flex'; }

function hideLoader() { document.getElementById('blur-loader').style.display = 'none'; }

async function loadIndexPage(indexPage = 1) { showLoader(); try { const indexRes = await fetch(data/index${indexPage}.json); if (!indexRes.ok) throw new Error('Index file not found');

const indexData = await indexRes.json();

posts = [];
for (let i = indexData.length - 1; i >= 0; i--) {
  const entry = indexData[i];
  const filePath = `data/${entry.file}`;
  const res = await fetch(filePath);
  if (res.ok) {
    const post = await res.json();
    posts.push(post);
  }
}

filteredPosts = posts;
displayPosts(getCurrentPagePosts());
updatePagination();

} catch (err) { console.error("Gagal load post:", err); alert('Halaman tidak ditemukan!'); if (currentIndexPage > 1) currentIndexPage--; } finally { hideLoader(); } }

function getCurrentPagePosts() { return filteredPosts.slice(0, postsPerPage); }

function displayPosts(postsToShow) { const gridContainer = document.getElementById('postGrid'); gridContainer.innerHTML = '';

postsToShow.forEach(post => { const postElement = document.createElement('div'); postElement.classList.add('grid-item');

const img = document.createElement('img');
img.src = post.image;
img.alt = post.title;
img.loading = "lazy";
img.onclick = () => showOverlay(post);

postElement.appendChild(img);
gridContainer.appendChild(postElement);

}); }

function renderLinks(label, links) { let html = <h4>Download via ${label}</h4><ul>;

if (Array.isArray(links)) { links.forEach((link, i) => { html += <li><a class="download-button" href="${decodeUrl(link)}" target="_blank">${label} ${i + 1}</a></li>; }); } else if (typeof links === 'string' && links.trim() !== '') { html += <li><a class="download-button" href="${decodeUrl(links)}" target="_blank">Full Konten</a></li>; }

html += </ul>; return html; }

function showOverlay(post) { const overlay = document.getElementById('overlay'); const content = document.getElementById('overlayContent');

let html = <img src="${post.image}" alt="${post.title}" style="width: 100%; height: auto; max-height: 60vh; object-fit: contain;" /> <h3>${post.title}</h3>;

if (post.links?.videy) html += renderLinks('Videy', post.links.videy); if (post.links?.terabox) html += renderLinks('Terabox', post.links.terabox); if (post.links?.mediafire) html += renderLinks('Mediafire', post.links.mediafire); if (post.links?.pixeldrain) html += renderLinks('PixelDrain', post.links.pixeldrain);

content.innerHTML = html; overlay.style.display = "flex"; }

function closeOverlay(event) { if (event.target.id === "overlay" || event.target.classList.contains("close-btn")) { document.getElementById('overlay').style.display = "none"; } }

function updatePagination() { document.getElementById('prevBtn').style.display = currentIndexPage > 1 ? 'inline-block' : 'none'; document.getElementById('nextBtn').style.display = currentIndexPage < maxIndexPage ? 'inline-block' : 'none'; }

function nextPage() { if (currentIndexPage < maxIndexPage) { currentIndexPage++; loadIndexPage(currentIndexPage); } }

function prevPage() { if (currentIndexPage > 1) { currentIndexPage--; loadIndexPage(currentIndexPage); } }

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

function toggleMenu() { const menu = document.getElementById('navMenu'); const hamburger = document.querySelector('.hamburger');

if (menu.classList.contains('active')) { menu.style.transformOrigin = 'top right'; menu.style.transform = 'scale(0)'; menu.style.opacity = '0'; hamburger.classList.remove('is-active'); setTimeout(() => { menu.classList.remove('active'); }, 300); } else { menu.classList.add('active'); menu.style.transformOrigin = 'top right'; setTimeout(() => { menu.style.transform = 'scale(1)'; menu.style.opacity = '1'; }, 10); hamburger.classList.add('is-active'); document.addEventListener('click', outsideClickListener); } }

function closeMenu() { const menu = document.getElementById('navMenu'); const hamburger = document.querySelector('.hamburger');

if (menu.classList.contains('active')) { menu.style.transformOrigin = 'top right'; menu.style.transform = 'scale(0)'; menu.style.opacity = '0'; hamburger.classList.remove('is-active'); setTimeout(() => { menu.classList.remove('active'); }, 300); document.removeEventListener('click', outsideClickListener); } }

function outsideClickListener(event) { const menu = document.getElementById('navMenu'); const hamburger = document.querySelector('.hamburger'); if (!menu.contains(event.target) && !hamburger.contains(event.target)) { closeMenu(); } }

window.addEventListener('hashchange', () => { let genre = window.location.hash.replace('#', '') || 'beranda'; filterPosts(genre, false); });

window.addEventListener('load', async () => { await getMaxIndexPage(); await loadIndexPage(currentIndexPage); let genre = window.location.hash.replace('#', '') || 'beranda'; filterPosts(genre, false); });

