self.onmessage = function (e) {
  if (e.data === 'start') {
    let lastKnownVersion = null;

    async function checkUpdate() {
      try {
        const response = await fetch('data/index.json', { cache: 'no-store' });
        const data = await response.json();
        const currentVersion = data.lastModified;

        if (lastKnownVersion && currentVersion !== lastKnownVersion) {
          postMessage('update');
        }

        lastKnownVersion = currentVersion;

      } catch (err) {
        console.error('Worker gagal cek update:', err);
      }
    }

    // Cek setiap 5 detik
    setInterval(checkUpdate, 5000);
  }
};
