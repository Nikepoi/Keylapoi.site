// Web Worker - Auto Check Update Tiap 20 Detik
self.onmessage = function (e) {
  if (e.data === 'start') {
    setInterval(() => {
      self.postMessage('update');
    }, 20000); // Cek update setiap 20 detik
  }
};
