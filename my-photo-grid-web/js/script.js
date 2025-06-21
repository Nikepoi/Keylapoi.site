let posts = [];
let currentPage = 1;
const postsPerPage = 20;
const genres = ['local', 'asia', 'barat', 'local_random', 'asia_random', 'barat_random', 'jav'];

// Fungsi decode base64 URL
function decodeUrl(encodedUrl) {
    return atob(encodedUrl);
}

// Fungsi load posts dari folder genre
async function loadPosts(genre = 'all') {
    posts = []; // Reset array untuk hindari duplikat
    const loadedIds = new Set(); // Track ID yang sudah dimuat
    if (genre === 'all') {
        for (const g of genres) {
            await loadGenrePosts(g, loadedIds);
        }
    } else {
        await loadGenrePosts(genre, loadedIds);
    }
    // Sort berdasarkan date (terbaru dulu)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    displayPosts(posts.slice(0, postsPerPage));
}

// Fungsi load posts per genre dengan pengecekan duplikat
async function loadGenrePosts(genre, loadedIds) {
    try {
        // Simulasi: Ganti dengan daftar file JSON secara manual
        const files = {
            'jav': ['cassey.json', 'newpost.json'], // Update manual di sini
            'local': [], 'asia': [], 'barat': [], 'local_random': [], 'asia_random': [], 'barat_random': []
        }[genre] || [];
        for (const file of files) {
            const postResponse = await fetch(`data/${genre}/${file}`);
            if (postResponse.ok) {
                const post = await postResponse.json();
                // Cek duplikat berdasarkan id
                if (!loadedIds.has(post.id)) {
                    loadedIds.add(post.id);
                    posts.push(post);
                } else {
                    console.warn(`Duplicate ID ${post.id} found in ${genre}/${file}, skipped.`);
                }
            }
        }
    } catch (error) {
        console.error(`Error loading ${genre} posts:`, error);
    }
}

// Fungsi display posts
function displayPosts(postsToShow) {
    const gridContainer = document.getElementById('postGrid');
    gridContainer.innerHTML = '';
    postsToShow.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('grid-item');
        let content = `
            <img src="${post.image}" alt="${post.title}" loading="lazy">
            <h3>${post.title}</h3>
        `;
        if (post.links?.videy?.length > 0) {
            content += `<h4>Download via Videy</h4><ul>`;
            post.links.videy.forEach(link => {
                content += `<li><a class="download-button" href="${decodeUrl(link)}" target="_blank">Videy ${post.links.videy.indexOf(link) + 1}</a></li>`;
            });
            content += `</ul>`;
        }
        if (post.links?.terabox?.length > 0) {
            content += `<h4>Download via Terabox</h4><ul>`;
            post.links.terabox.forEach(link => {
                content += `<li><a class="download-button" href="${decodeUrl(link)}" target="_blank">Full Konten</a></li>`;
            });
            content += `</ul>`;
        }
        postElement.innerHTML = content;
        gridContainer.appendChild(postElement);
    });
    document.getElementById('prevBtn').style.display = currentPage > 1 ? 'inline-block' : 'none';
    document.getElementById('nextBtn').style.display = postsToShow.length >= postsPerPage ? 'inline-block' : 'none';
}

// Fungsi filter posts
function filterPosts(genre) {
    loadPosts(genre).then(() => {
        currentPage = 1;
        displayPosts(posts.slice(0, postsPerPage));
    });
}

// Fungsi prev page
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        const start = (currentPage - 1) * postsPerPage;
        const end = start + postsPerPage;
        displayPosts(posts.slice(start, end));
    }
}

// Fungsi next page
function nextPage() {
    currentPage++;
    const start = (currentPage - 1) * postsPerPage;
    const end = start + postsPerPage;
    displayPosts(posts.slice(start, end));
    if (end >= posts.length) {
        document.getElementById('nextBtn').style.display = 'none';
    }
}

// Fungsi toggle menu
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

// Init
window.addEventListener('load', () => loadPosts('all'));
