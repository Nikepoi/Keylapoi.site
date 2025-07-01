self.onmessage = function (e) {
  if (e.data === 'start') {
    let lastKnownVersion = null;

    async function checkUpdate() {
      try {
        const response = await fetch('data/index.json', { cache: 'no-store' });
        if (!response.ok) return;

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

    setInterval(checkUpdate, 15000);
  }
};
