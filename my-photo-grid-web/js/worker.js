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

        // Jika support background sync, kirim sinyal ke service worker
        if ('SyncManager' in self) {
          self.registration.sync.register('sync-update').catch(err => console.error('Worker gagal register sync:', err));
        }

      } catch (err) {
        console.error('Worker gagal cek update:', err);
      }
    }

    // Jalankan cek pertama langsung
    checkUpdate();

    // Cek setiap 5 detik
    setInterval(checkUpdate, 5000);
  }
};
