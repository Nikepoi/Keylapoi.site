const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  document.body.innerHTML = "<h1>ID tidak ditemukan di URL.</h1>";
} else {
  fetch(`${id}.json`)
    .then(res => res.json())
    .then(data => {
      document.title = data.title;
      document.getElementById("post-title").textContent = data.title;
      document.getElementById("genre").textContent = "Genre: " + data.genre;
      document.getElementById("image").src = data.image;

      let linkDiv = document.getElementById("links");

      if (data.videy) {
        data.videy.forEach(link => {
          const a = document.createElement("a");
          a.href = atob(link);
          a.textContent = "Download via Videy";
          a.target = "_blank";
          linkDiv.appendChild(a);
          linkDiv.appendChild(document.createElement("br"));
        });
      }

      if (data.mediafire) {
        data.mediafire.forEach(link => {
          const a = document.createElement("a");
          a.href = atob(link);
          a.textContent = "Download via MediaFire";
          a.target = "_blank";
          linkDiv.appendChild(a);
          linkDiv.appendChild(document.createElement("br"));
        });
      }

      if (data.terabox) {
        data.terabox.forEach(link => {
          const a = document.createElement("a");
          a.href = atob(link);
          a.textContent = "Download via Terabox";
          a.target = "_blank";
          linkDiv.appendChild(a);
          linkDiv.appendChild(document.createElement("br"));
        });
      }
    })
    .catch(err => {
      document.body.innerHTML = "<h1>Gagal memuat data.</h1>";
      console.error(err);
    });
}
