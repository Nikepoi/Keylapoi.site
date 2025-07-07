const GENRES = [ 'asia', 'jav', 'local', 'local_random', 'asia_random', 'barat', 'barat_random' ];

self.onmessage = function (e) { if (e.data === 'start') { let lastVersions = {};

async function checkUpdate() {
  try {
    for (let genre of GENRES) {
      const response = await fetch(`data/index.${genre}.json`, { cache: 'no-store' });
      if (!response.ok) continue;

      const data = await response.json();
      const currentVersion = data.lastModified;

      if (lastVersions[genre] && currentVersion !== lastVersions[genre]) {
        postMessage('update');
      }

      lastVersions[genre] = currentVersion;
    }
  } catch (err) {
    console.error('Worker gagal cek update:', err);
  }
}

setInterval(checkUpdate, 15000);

} };

