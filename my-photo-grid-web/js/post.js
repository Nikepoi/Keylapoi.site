const urlParams = new URLSearchParams(window.location.search);
const judulDicari = urlParams.get("judul");

const totalFiles = 1000;
let ditemukan = false;

async function cariDanTampilkan() {
  for (let i = 1; i <= totalFiles; i++) {
    try {
      const res = await fetch(`${i}.json`);
      const data = await res.json();

      if (data.title === judulDicari) {
        document.getElementById("title").textContent = data.title;
        document.getElementById("genre").textContent = `Genre: ${data.genre}`;
        document.getElementById("content").innerHTML = data.content;
        ditemukan = true;
        break;
      }
    } catch (e) {
      console.warn(`Gagal fetch ${i}.json`);
    }
  }

  if (!ditemukan) {
    document.getElementById("title").textContent = "Judul tidak ditemukan.";
  }
}

cariDanTampilkan();
