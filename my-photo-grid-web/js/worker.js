// Web Worker - Auto Check Update Tiap 60 Detik
self.onmessage = function (e) {
  if (e.data === 'start') {
    setInterval(() => {
      self.postMessage('update');
    }, 60000); // Cek update setiap 60 detik
  }
};
