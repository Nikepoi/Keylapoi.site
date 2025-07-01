self.onmessage = function (e) {
  if (e.data === 'start') {
    let lastKnownVersion = null;

    async function checkUpdate() {
      try {
        const response = await fetch('data/index.json', { cache: 'no-store' });

        if (!response.ok) {
          console.error('Worker: index.json tidak ditemukan. Status:', response.status);
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

    // Background Sync untuk server yang support
    if ('SyncManager' in self && self.registration) {
      self.registration.sync.register('sync-update').catch(err => console.error('Worker gagal register sync:', err));
    }

    checkUpdate();

    // Interval 15 detik biar tidak terlalu spam server
    setInterval(checkUpdate, 15000);
  }
};
