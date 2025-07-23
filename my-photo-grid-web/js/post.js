document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("title");

  if (!slug) {
    document.body.innerHTML = "<p>Judul tidak ditemukan.</p>";
    return;
  }

  try {
    const response = await fetch(`json/${slug}.json`);
    const data = await response.json();

    const container = document.getElementById("post-content");
    container.innerHTML = `
      <h1>${data.title}</h1>
      <p><strong>Genre:</strong> ${data.genre}</p>
      <img src="${data.image}" alt="${data.title}" style="max-width:100%; height:auto;" />
      <ul>
        ${data.links.map(link => `<li><a href="${link.url}" target="_blank">${link.note}</a></li>`).join('')}
      </ul>
    `;
  } catch (err) {
    console.error(err);
    document.body.innerHTML = "<p>Gagal memuat data.</p>";
  }
});
