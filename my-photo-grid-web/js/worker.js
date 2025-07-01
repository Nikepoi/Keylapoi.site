self.onmessage = function (e) {
  if (e.data === 'start') {
    let lastKnownVersion = null;

    async function checkUpdate() {
      try {
        const response = await fetch('data/index.json', { cache: 'no-store' });

        // Tambahkan validasi status response
        if (!response.ok) {
          console.error('Worker: File index.json tidak ditemukan. Status:', response.status);
          return;
        }

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

    if ('SyncManager' in self && self.registration) {
      self.registration.sync.register('sync-update').catch(err => console.error('Worker gagal register sync:', err));
    }

    checkUpdate();
    setInterval(checkUpdate, 5000);
  }
};
